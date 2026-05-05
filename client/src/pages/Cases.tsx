import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Streamdown } from "streamdown";
import { knowledgeBase } from "@/data/kb";
import { Badge } from "@/components/ui/badge";

export default function Cases() {
  const [selectedCase, setSelectedCase] = useState(0);

  return (
    <div className=" min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Case Studies</h1>
          <p className="text-slate-600">Реальные кейсы из РФ с разбором решений</p>
        </div>
      </div>

      {/* Cases */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {knowledgeBase.cases.map((caseItem, idx) => (
            <Card
              key={idx}
              className={`cursor-pointer transition-all ${
                selectedCase === idx ? "ring-2 ring-blue-600" : "hover:shadow-md"
              }`}
              onClick={() => setSelectedCase(idx)}
            >
              <CardHeader>
                <CardTitle className="text-base">{caseItem.title}</CardTitle>
                <CardDescription className="text-sm">{caseItem.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Case Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{knowledgeBase.cases[selectedCase].title}</CardTitle>
            <CardDescription>{knowledgeBase.cases[selectedCase].description}</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <Streamdown>{knowledgeBase.cases[selectedCase].content}</Streamdown>
          </CardContent>
        </Card>

        {/* Key Takeaways */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ключевые выводы</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-blue-900 mb-2">💡 Главный инсайт</p>
                <p className="text-sm text-blue-800">
                  {selectedCase === 0 && "Управление оборотным капиталом — это не просто финансовый показатель, это стратегический рычаг для высвобождения миллиардов рублей."}
                  {selectedCase === 1 && "S&OP — это не просто процесс планирования, это инструмент для синхронизации спроса и предложения, который напрямую влияет на WC."}
                  {selectedCase === 2 && "TCO анализ показывает, что дешевое не всегда выгодно. Полная стоимость владения часто раскрывает скрытые издержки."}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">✓ Практический результат</p>
                <p className="text-sm text-green-800">
                  {selectedCase === 0 && "Сокращение WC на 30% = высвобождение 1,95 млрд ₽ = экономия 292 млн ₽/год на финансировании"}
                  {selectedCase === 1 && "Внедрение S&OP сократило DIO с 72 до 45 дней = высвобождение 3,2 млрд ₽ = экономия 384 млн ₽/год"}
                  {selectedCase === 2 && "Импортозамещение через TCO анализ = экономия 1,2 млрд ₽/год + снижение риска поставок"}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="font-semibold text-purple-900 mb-2">🎯 Применимость</p>
                <p className="text-sm text-purple-800">
                  {selectedCase === 0 && "Применимо для любого производства с циклом обращения капитала >30 дней"}
                  {selectedCase === 1 && "Применимо для компаний с волатильным спросом и сложной цепочкой поставок"}
                  {selectedCase === 2 && "Применимо при выборе между импортом и локальными поставщиками"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
