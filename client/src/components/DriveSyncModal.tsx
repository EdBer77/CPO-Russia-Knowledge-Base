import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, CheckCircle2, Cloud, Lock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SyncModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type SyncStep = "idle" | "auth_required" | "connecting" | "scanning" | "processing" | "complete" | "error";

export function DriveSyncModal({ open, onOpenChange }: SyncModalProps) {
  const [step, setStep] = useState<SyncStep>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [currentFile, setCurrentFile] = useState("");
  const [processedFiles, setProcessedFiles] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const startSyncMutation = trpc.googleDriveSync.startSync.useMutation();
  const getTokenStatusQuery = trpc.googleDriveSync.getTokenStatus.useQuery(undefined, {
    enabled: open,
    staleTime: 0,
  });
  const getAuthUrlQuery = trpc.googleDriveSync.getAuthUrl.useQuery(undefined, {
    enabled: open && step === "auth_required",
  });
  const getSyncHistoryQuery = trpc.googleDriveSync.getSyncHistory.useQuery(undefined, {
    enabled: step === "complete",
    staleTime: 0,
  });

  // Check token status when modal opens
  useEffect(() => {
    if (open && getTokenStatusQuery.data) {
      if (!getTokenStatusQuery.data.hasToken || getTokenStatusQuery.data.isExpired) {
        setStep("auth_required");
      } else {
        setStep("idle");
      }
    }
  }, [open, getTokenStatusQuery.data]);

  const handleAuthorize = async () => {
    if (!getAuthUrlQuery.data?.authUrl) {
      toast.error("Не удалось получить URL авторизации");
      return;
    }

    // Store state in sessionStorage for callback verification
    if (getAuthUrlQuery.data.state) {
      sessionStorage.setItem("google_oauth_state", getAuthUrlQuery.data.state);
    }

    // Redirect to Google OAuth consent screen
    window.location.href = getAuthUrlQuery.data.authUrl;
  };

  const handleStartSync = async () => {
    setStep("connecting");
    setProgress(0);
    setStatusMessage("Подключение к Google Drive...");
    setProcessedFiles([]);
    setErrorMessage("");

    try {
      // Simulate progress updates while calling the API
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const result = await startSyncMutation.mutateAsync({});

      clearInterval(progressInterval);
      setProgress(100);
      setStatusMessage("Синхронизация завершена!");
      setStep("complete");
      setProcessedFiles(result.filesProcessed || []);
      
      // Refetch sync history to show latest results
      getSyncHistoryQuery.refetch();

      toast.success(
        `Синхронизировано ${result.filesProcessed?.length || 0} файлов из Google Drive`
      );
    } catch (error: any) {
      setStep("error");
      const errorMsg = error?.message || "Ошибка при синхронизации с Google Drive";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleClose = () => {
    setStep("idle");
    setProgress(0);
    setStatusMessage("");
    setCurrentFile("");
    setProcessedFiles([]);
    setErrorMessage("");
    onOpenChange(false);
  };

  const handleRetry = () => {
    if (step === "error") {
      handleStartSync();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Синхронизация с Google Drive
          </DialogTitle>
          <DialogDescription>
            Автоматическая загрузка и парсинг PDF файлов из папки CPO_Knowledge-KB
          </DialogDescription>
        </DialogHeader>

        {step === "auth_required" && (
          <div className="space-y-4 py-6">
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lock className="w-5 h-5 text-yellow-600" />
                  Требуется авторизация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Для синхронизации с Google Drive необходимо дать разрешение на доступ к вашей папке CPO_Knowledge-KB.</p>
                <p className="text-gray-600">Вы будете перенаправлены на страницу согласия Google, где сможете разрешить доступ.</p>
              </CardContent>
            </Card>
          </div>
        )}

        {step === "idle" && (
          <div className="space-y-4 py-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-base">Готово к синхронизации</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Система будет:</p>
                <ul className="space-y-2 ml-4">
                  <li>✓ Подключиться к вашему Google Drive</li>
                  <li>✓ Найти папку "CPO_Knowledge-KB"</li>
                  <li>✓ Загрузить все PDF файлы</li>
                  <li>✓ Распарсить и классифицировать контент</li>
                  <li>✓ Добавить новые элементы в базу знаний</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {(step === "connecting" || step === "scanning" || step === "processing") && (
          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Прогресс синхронизации</span>
                <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-sm">{statusMessage}</p>
                    {currentFile && (
                      <p className="text-xs text-gray-600 mt-1">Файл: {currentFile}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {processedFiles.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Обработано файлов ({processedFiles.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {processedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{file}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-4 py-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Синхронизация завершена!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-600">Файлов обработано:</span>
                    <p className="font-medium text-lg">{processedFiles.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Статус:</span>
                    <p className="font-medium text-green-600">Успешно</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {processedFiles.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Обработанные файлы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {processedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700">{file}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {getSyncHistoryQuery.data && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">История синхронизаций</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs max-h-32 overflow-y-auto">
                    {getSyncHistoryQuery.data.slice(0, 5).map((sync: any, idx: number) => (
                      <div key={idx} className="p-2 bg-gray-50 rounded">
                        <p className="font-medium">{new Date(sync.createdAt).toLocaleString("ru-RU")}</p>
                        <p className="text-gray-600">{sync.status} • {sync.filesProcessed} файлов</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === "error" && (
          <div className="space-y-4 py-6">
            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Ошибка синхронизации
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </CardContent>
            </Card>
          </div>
        )}

        <DialogFooter className="space-x-2">
          {step === "auth_required" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button onClick={handleAuthorize} className="bg-blue-600 hover:bg-blue-700" disabled={getAuthUrlQuery.isLoading}>
                {getAuthUrlQuery.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Загрузка...
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Авторизовать Google Drive
                  </>
                )}
              </Button>
            </>
          )}

          {step === "idle" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Отмена
              </Button>
              <Button onClick={handleStartSync} className="bg-blue-600 hover:bg-blue-700">
                <Cloud className="w-4 h-4 mr-2" />
                Начать синхронизацию
              </Button>
            </>
          )}

          {(step === "connecting" || step === "scanning" || step === "processing") && (
            <Button disabled className="w-full">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Синхронизация в процессе...
            </Button>
          )}

          {step === "complete" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Закрыть
              </Button>
              <Button onClick={handleStartSync} className="bg-blue-600 hover:bg-blue-700">
                Синхронизировать снова
              </Button>
            </>
          )}

          {step === "error" && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Закрыть
              </Button>
              <Button onClick={handleRetry} className="bg-red-600 hover:bg-red-700">
                Повторить попытку
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
