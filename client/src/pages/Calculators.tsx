import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { knowledgeBase } from "@/data/kb";

interface CalculatorState {
  [key: string]: number | string;
}

export default function Calculators() {
  const [dpoState, setDpoState] = useState<CalculatorState>({
    revenue: 12,
    cogs: 8,
    payables: 1.6,
    inventory: 1.2,
    receivables: 1.0,
  });

  const [eoqState, setEoqState] = useState<CalculatorState>({
    demand: 3600,
    orderCost: 5000,
    holdingCost: 6000,
  });

  const [tcoState, setTcoState] = useState<CalculatorState>({
    price1: 100,
    delivery1: 45,
    storage1: 12,
    other1: 8,
    price2: 130,
    delivery2: 10,
    storage2: 2,
  });

  // DPO/DIO/CCC Calculator
  const calculateDPO = () => {
    const revenue = parseFloat(dpoState.revenue as string) || 0;
    const cogs = parseFloat(dpoState.cogs as string) || 0;
    const payables = parseFloat(dpoState.payables as string) || 0;
    const inventory = parseFloat(dpoState.inventory as string) || 0;
    const receivables = parseFloat(dpoState.receivables as string) || 0;

    const dpo = cogs > 0 ? (payables / cogs) * 365 : 0;
    const dio = cogs > 0 ? (inventory / cogs) * 365 : 0;
    const dso = revenue > 0 ? (receivables / revenue) * 365 : 0;
    const ccc = dio + dso - dpo;
    const wc = (ccc * cogs) / 365;

    return { dpo: dpo.toFixed(1), dio: dio.toFixed(1), dso: dso.toFixed(1), ccc: ccc.toFixed(1), wc: wc.toFixed(0) };
  };

  // EOQ Calculator
  const calculateEOQ = () => {
    const demand = parseFloat(eoqState.demand as string) || 0;
    const orderCost = parseFloat(eoqState.orderCost as string) || 0;
    const holdingCost = parseFloat(eoqState.holdingCost as string) || 0;

    const eoq = Math.sqrt((2 * demand * orderCost) / holdingCost);
    const ordersPerYear = demand / eoq;
    const avgInventory = eoq / 2;

    return { eoq: eoq.toFixed(1), ordersPerYear: ordersPerYear.toFixed(1), avgInventory: avgInventory.toFixed(1) };
  };

  // TCO Calculator
  const calculateTCO = () => {
    const price1 = parseFloat(tcoState.price1 as string) || 0;
    const delivery1 = parseFloat(tcoState.delivery1 as string) || 0;
    const storage1 = parseFloat(tcoState.storage1 as string) || 0;
    const other1 = parseFloat(tcoState.other1 as string) || 0;

    const price2 = parseFloat(tcoState.price2 as string) || 0;
    const delivery2 = parseFloat(tcoState.delivery2 as string) || 0;
    const storage2 = parseFloat(tcoState.storage2 as string) || 0;

    const tco1 = price1 + delivery1 + storage1 + other1;
    const tco2 = price2 + delivery2 + storage2;
    const diff = Math.abs(tco1 - tco2);
    const savings = (diff / Math.max(tco1, tco2)) * 100;

    return {
      tco1: tco1.toFixed(2),
      tco2: tco2.toFixed(2),
      diff: diff.toFixed(2),
      savings: savings.toFixed(1),
      cheaper: tco1 < tco2 ? "Вариант 1" : "Вариант 2",
    };
  };

  const dpoResults = calculateDPO();
  const eoqResults = calculateEOQ();
  const tcoResults = calculateTCO();

  return (
    <div className=" min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">Калькуляторы KPI</h1>
          <p className="text-slate-600">Автоматические расчёты ключевых метрик закупок</p>
        </div>
      </div>

      {/* Calculators */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <Tabs defaultValue="dpo" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dpo">DPO / DIO / CCC</TabsTrigger>
            <TabsTrigger value="eoq">EOQ</TabsTrigger>
            <TabsTrigger value="tco">TCO</TabsTrigger>
          </TabsList>

          {/* DPO/DIO/CCC Calculator */}
          <TabsContent value="dpo" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inputs */}
              <Card>
                <CardHeader>
                  <CardTitle>Введите данные</CardTitle>
                  <CardDescription>Все значения в млрд ₽</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="revenue">Выручка (млрд ₽/год)</Label>
                    <Input
                      id="revenue"
                      type="number"
                      step="0.1"
                      value={dpoState.revenue}
                      onChange={(e) => setDpoState({ ...dpoState, revenue: e.target.value })}
                      placeholder="12"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cogs">Себестоимость (млрд ₽/год)</Label>
                    <Input
                      id="cogs"
                      type="number"
                      step="0.1"
                      value={dpoState.cogs}
                      onChange={(e) => setDpoState({ ...dpoState, cogs: e.target.value })}
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="payables">Кредиторская задолженность (млрд ₽)</Label>
                    <Input
                      id="payables"
                      type="number"
                      step="0.1"
                      value={dpoState.payables}
                      onChange={(e) => setDpoState({ ...dpoState, payables: e.target.value })}
                      placeholder="1.6"
                    />
                  </div>
                  <div>
                    <Label htmlFor="inventory">Запасы (млрд ₽)</Label>
                    <Input
                      id="inventory"
                      type="number"
                      step="0.1"
                      value={dpoState.inventory}
                      onChange={(e) => setDpoState({ ...dpoState, inventory: e.target.value })}
                      placeholder="1.2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="receivables">Дебиторская задолженность (млрд ₽)</Label>
                    <Input
                      id="receivables"
                      type="number"
                      step="0.1"
                      value={dpoState.receivables}
                      onChange={(e) => setDpoState({ ...dpoState, receivables: e.target.value })}
                      placeholder="1.0"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Результаты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600">DPO (дней)</p>
                    <p className="text-3xl font-bold text-blue-600">{dpoResults.dpo}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-600">DIO (дней)</p>
                    <p className="text-3xl font-bold text-green-600">{dpoResults.dio}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-slate-600">DSO (дней)</p>
                    <p className="text-3xl font-bold text-purple-600">{dpoResults.dso}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-slate-600">CCC (дней)</p>
                    <p className="text-3xl font-bold text-orange-600">{dpoResults.ccc}</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg">
                    <p className="text-sm text-slate-600">WC (млн ₽)</p>
                    <p className="text-3xl font-bold text-red-600">{dpoResults.wc}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* EOQ Calculator */}
          <TabsContent value="eoq" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Введите данные</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="demand">Годовой спрос (т)</Label>
                    <Input
                      id="demand"
                      type="number"
                      step="100"
                      value={eoqState.demand}
                      onChange={(e) => setEoqState({ ...eoqState, demand: e.target.value })}
                      placeholder="3600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderCost">Стоимость одного заказа (₽)</Label>
                    <Input
                      id="orderCost"
                      type="number"
                      step="100"
                      value={eoqState.orderCost}
                      onChange={(e) => setEoqState({ ...eoqState, orderCost: e.target.value })}
                      placeholder="5000"
                    />
                  </div>
                  <div>
                    <Label htmlFor="holdingCost">Стоимость хранения 1 т в год (₽)</Label>
                    <Input
                      id="holdingCost"
                      type="number"
                      step="100"
                      value={eoqState.holdingCost}
                      onChange={(e) => setEoqState({ ...eoqState, holdingCost: e.target.value })}
                      placeholder="6000"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Результаты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600">EOQ (т)</p>
                    <p className="text-3xl font-bold text-blue-600">{eoqResults.eoq}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-600">Заказов в год</p>
                    <p className="text-3xl font-bold text-green-600">{eoqResults.ordersPerYear}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-slate-600">Средний запас (т)</p>
                    <p className="text-3xl font-bold text-purple-600">{eoqResults.avgInventory}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TCO Calculator */}
          <TabsContent value="tco" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Введите данные</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Вариант 1</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="price1">Цена (₽/кг)</Label>
                        <Input
                          id="price1"
                          type="number"
                          step="1"
                          value={tcoState.price1}
                          onChange={(e) => setTcoState({ ...tcoState, price1: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery1">Доставка (₽/кг)</Label>
                        <Input
                          id="delivery1"
                          type="number"
                          step="1"
                          value={tcoState.delivery1}
                          onChange={(e) => setTcoState({ ...tcoState, delivery1: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="storage1">Хранение (₽/кг)</Label>
                        <Input
                          id="storage1"
                          type="number"
                          step="1"
                          value={tcoState.storage1}
                          onChange={(e) => setTcoState({ ...tcoState, storage1: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="other1">Прочее (₽/кг)</Label>
                        <Input
                          id="other1"
                          type="number"
                          step="1"
                          value={tcoState.other1}
                          onChange={(e) => setTcoState({ ...tcoState, other1: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Вариант 2</h4>
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="price2">Цена (₽/кг)</Label>
                        <Input
                          id="price2"
                          type="number"
                          step="1"
                          value={tcoState.price2}
                          onChange={(e) => setTcoState({ ...tcoState, price2: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery2">Доставка (₽/кг)</Label>
                        <Input
                          id="delivery2"
                          type="number"
                          step="1"
                          value={tcoState.delivery2}
                          onChange={(e) => setTcoState({ ...tcoState, delivery2: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="storage2">Хранение (₽/кг)</Label>
                        <Input
                          id="storage2"
                          type="number"
                          step="1"
                          value={tcoState.storage2}
                          onChange={(e) => setTcoState({ ...tcoState, storage2: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Результаты</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600">TCO Вариант 1 (₽/кг)</p>
                    <p className="text-3xl font-bold text-blue-600">{tcoResults.tco1}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-600">TCO Вариант 2 (₽/кг)</p>
                    <p className="text-3xl font-bold text-green-600">{tcoResults.tco2}</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-sm text-slate-600">Разница (₽/кг)</p>
                    <p className="text-3xl font-bold text-purple-600">{tcoResults.diff}</p>
                  </div>
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-slate-600">Экономия (%)</p>
                    <p className="text-3xl font-bold text-orange-600">{tcoResults.savings}%</p>
                  </div>
                  <div className="p-4 bg-red-50 rounded-lg border-2 border-red-300">
                    <p className="text-sm text-slate-600">Рекомендация</p>
                    <p className="text-2xl font-bold text-red-600">{tcoResults.cheaper}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
