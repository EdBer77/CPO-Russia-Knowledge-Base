import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { knowledgeBase } from "@/data/kb";
import { CheckCircle2, XCircle } from "lucide-react";

export default function Trainers() {
  const [selectedTrainer, setSelectedTrainer] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const trainer = knowledgeBase.trainers[selectedTrainer];
  const question = trainer.questions[currentQuestion];

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    
    setShowResult(true);
    if (selectedAnswer === question.correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < trainer.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setCompleted(true);
    }
  };

  const resetTrainer = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setCompleted(false);
  };

  const switchTrainer = (index: number) => {
    setSelectedTrainer(index);
    resetTrainer();
  };

  return (
    <div className=" min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Тренажёры</h1>
          <p className="text-slate-600">Проверьте свои знания с помощью интерактивных задач</p>
        </div>
      </div>

      {/* Trainer Selection */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {knowledgeBase.trainers.map((t, idx) => (
            <Card
              key={idx}
              className={`cursor-pointer transition-all ${
                selectedTrainer === idx ? "ring-2 ring-blue-600" : "hover:shadow-md"
              }`}
              onClick={() => switchTrainer(idx)}
            >
              <CardHeader>
                <CardTitle className="text-lg">{t.title}</CardTitle>
                <CardDescription>{t.description}</CardDescription>
                <Badge className="w-fit mt-2">{t.questions.length} вопросов</Badge>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quiz Interface */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{trainer.title}</CardTitle>
                <CardDescription className="mt-2">
                  Вопрос {currentQuestion + 1} из {trainer.questions.length}
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-blue-600">{score}</div>
                <p className="text-sm text-slate-600">правильных ответов</p>
              </div>
            </div>
          </CardHeader>

          {!completed ? (
            <CardContent>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${((currentQuestion + 1) / trainer.questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Question */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
                <p className="text-slate-700 mb-6">{question.description}</p>

                {/* Options */}
                <RadioGroup value={selectedAnswer?.toString() || ""} onValueChange={(v) => setSelectedAnswer(parseInt(v))}>
                  <div className="space-y-3">
                    {question.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} disabled={showResult} />
                        <Label
                          htmlFor={`option-${idx}`}
                          className={`cursor-pointer flex-1 p-3 rounded-lg border transition-all ${
                            showResult
                              ? idx === question.correctAnswer
                                ? "bg-green-50 border-green-300"
                                : idx === selectedAnswer
                                ? "bg-red-50 border-red-300"
                                : "bg-slate-50 border-slate-200"
                              : selectedAnswer === idx
                              ? "bg-blue-50 border-blue-300"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {showResult && idx === question.correctAnswer && (
                              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                            )}
                            {showResult && idx === selectedAnswer && idx !== question.correctAnswer && (
                              <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            )}
                            <span>{option}</span>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Result Message */}
              {showResult && (
                <div className={`p-4 rounded-lg mb-6 ${
                  selectedAnswer === question.correctAnswer
                    ? "bg-green-50 border border-green-300"
                    : "bg-red-50 border border-red-300"
                }`}>
                  <p className={`font-semibold mb-2 ${
                    selectedAnswer === question.correctAnswer ? "text-green-800" : "text-red-800"
                  }`}>
                    {selectedAnswer === question.correctAnswer ? "✓ Правильно!" : "✗ Неправильно"}
                  </p>
                  <p className="text-sm">{question.explanation}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                {!showResult ? (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="flex-1"
                  >
                    Проверить ответ
                  </Button>
                ) : (
                  <Button onClick={handleNextQuestion} className="flex-1">
                    {currentQuestion === trainer.questions.length - 1 ? "Завершить" : "Следующий вопрос"}
                  </Button>
                )}
              </div>
            </CardContent>
          ) : (
            <CardContent>
              <div className="text-center py-8">
                <div className="text-6xl font-bold text-blue-600 mb-4">{score}/{trainer.questions.length}</div>
                <p className="text-xl font-semibold mb-2">Результат: {Math.round((score / trainer.questions.length) * 100)}%</p>
                <p className="text-slate-600 mb-6">
                  {score === trainer.questions.length
                    ? "Отлично! Вы ответили на все вопросы правильно!"
                    : score >= trainer.questions.length * 0.8
                    ? "Хороший результат! Повторите материал по ошибкам."
                    : "Рекомендуем повторить теорию перед следующей попыткой."}
                </p>
                <Button onClick={resetTrainer} size="lg">
                  Попробовать ещё раз
                </Button>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
