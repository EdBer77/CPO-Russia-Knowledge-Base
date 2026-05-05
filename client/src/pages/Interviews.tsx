import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Streamdown } from "streamdown";
import { knowledgeBase } from "@/data/kb";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function Interviews() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className=" min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Вопросы с собеседований</h1>
          <p className="text-slate-600">15+ вопросов для C-level интервью с готовыми ответами (STAR метод)</p>
        </div>
      </div>

      {/* Interview Questions */}
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="space-y-4">
          {knowledgeBase.interviews.map((interview) => (
            <Card
              key={interview.id}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => toggleExpanded(interview.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{interview.title}</CardTitle>
                  </div>
                  <div className="ml-4">
                    {expandedId === interview.id ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {expandedId === interview.id && (
                <CardContent className="prose prose-sm max-w-none">
                  <Streamdown>{interview.answer}</Streamdown>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Interview Tips */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">💡 Советы по подготовке</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-900 space-y-3">
            <div>
              <p className="font-semibold">1. Используйте STAR метод</p>
              <p className="text-sm">Situation (ситуация) → Task (задача) → Action (действие) → Result (результат)</p>
            </div>
            <div>
              <p className="font-semibold">2. Подготовьте конкретные кейсы</p>
              <p className="text-sm">Не говорите в общих словах — приводите цифры, проценты, млн ₽</p>
            </div>
            <div>
              <p className="font-semibold">3. Знайте формулы назубок</p>
              <p className="text-sm">DPO, DIO, DSO, CCC, EOQ, Safety Stock — должны считаться в уме за 30 секунд</p>
            </div>
            <div>
              <p className="font-semibold">4. Задавайте вопросы работодателю</p>
              <p className="text-sm">Это показывает вашу заинтересованность и стратегическое мышление</p>
            </div>
            <div>
              <p className="font-semibold">5. Будьте честны в ошибках</p>
              <p className="text-sm">Если не знаете ответ — скажите, что разберётесь. Это лучше, чем выдумывать</p>
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card className="mt-8 bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-900">✓ Чек-лист подготовки</CardTitle>
          </CardHeader>
          <CardContent className="text-green-900">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c1" className="w-4 h-4" />
                <label htmlFor="c1" className="text-sm">Знаю все формулы (DPO, DIO, DSO, CCC, EOQ, Safety Stock)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c2" className="w-4 h-4" />
                <label htmlFor="c2" className="text-sm">Могу посчитать на примере за 2 минуты</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c3" className="w-4 h-4" />
                <label htmlFor="c3" className="text-sm">Знаю матрицу Кралича (4 квадранта)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c4" className="w-4 h-4" />
                <label htmlFor="c4" className="text-sm">Могу объяснить TCO на примере</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c5" className="w-4 h-4" />
                <label htmlFor="c5" className="text-sm">Подготовил 2-3 конкретных кейса из своего опыта</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c6" className="w-4 h-4" />
                <label htmlFor="c6" className="text-sm">Знаю типовые KPI (OTIF, savings, доля срочных закупок)</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c7" className="w-4 h-4" />
                <label htmlFor="c7" className="text-sm">Подготовил вопросы для работодателя</label>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="c8" className="w-4 h-4" />
                <label htmlFor="c8" className="text-sm">Прошёл все тренажёры (80%+ правильных ответов)</label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
