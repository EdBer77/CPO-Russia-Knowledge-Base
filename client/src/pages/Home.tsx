import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, ShoppingCart, Zap, BookOpen, BarChart3, Briefcase, HelpCircle } from "lucide-react";

const modules = [
  {
    icon: TrendingUp,
    title: "Финансовый инжиниринг",
    description: "DPO, DIO, CCC, WC — ключевые метрики, которые влияют на EBITDA и cash flow",
    href: "/theory/1",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Package,
    title: "Запасы + S&OP",
    description: "ABC/XYZ анализ, EOQ, Safety Stock, планирование продаж и операций",
    href: "/theory/2",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: ShoppingCart,
    title: "Стратегический сорсинг",
    description: "Матрица Кралича, TCO, SRM, управление поставщиками",
    href: "/theory/3",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Zap,
    title: "Закупки 4.0 + Риски",
    description: "Цифровизация, RPA, Supply Chain Resilience, управление рисками",
    href: "/theory/4",
    color: "from-orange-500 to-orange-600"
  },
  {
    icon: BookOpen,
    title: "Глоссарий + Формуляр",
    description: "Справочник всех терминов и ключевые формулы для быстрого доступа",
    href: "/theory/5",
    color: "from-pink-500 to-pink-600"
  }
];

const tools = [
  {
    icon: BarChart3,
    title: "Тренажёры",
    description: "6 практических задач + 30 теоретических вопросов с проверкой ответов",
    href: "/trainers"
  },
  {
    icon: Briefcase,
    title: "Калькуляторы KPI",
    description: "DPO/DIO/CCC, EOQ, TCO — автоматические расчёты с интерпретацией",
    href: "/calculators"
  },
  {
    icon: Briefcase,
    title: "Case Studies",
    description: "Реальные кейсы из РФ (ФосАгро, НЛМК, Северсталь) с разбором решений",
    href: "/cases"
  },
  {
    icon: HelpCircle,
    title: "Вопросы с собеседований",
    description: "15+ вопросов для C-level интервью с готовыми ответами (STAR метод)",
    href: "/interviews"
  }
];

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold mb-4">CPO Russia Knowledge Base</h1>
          <p className="text-xl text-slate-300 mb-8">
            Полная подготовка C-level специалистов по закупкам B2B (Агро/Промышленность РФ)
          </p>
          <div className="flex gap-4">
            <Link href="/theory/1">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Начать обучение
              </Button>
            </Link>
            <Link href="/trainers">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Пройти тренажёры
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-12 px-8 bg-white border-b">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">80%+</div>
              <p className="text-sm text-slate-600">Правильных ответов в тренажёрах</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">&lt;2 мин</div>
              <p className="text-sm text-slate-600">Расчёт DPO/DIO/CCC</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">20 мин</div>
              <p className="text-sm text-slate-600">Решение case study</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">5 блоков</div>
              <p className="text-sm text-slate-600">Теория без воды</p>
            </div>
          </div>
        </div>
      </section>

      {/* Theory Modules */}
      <section className="py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">5 Блоков Теории</h2>
          <p className="text-slate-600 mb-8">Минимум воды — максимум практических знаний</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => {
              const Icon = module.icon;
              return (
                <Link key={module.href} href={module.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${module.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600">{module.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-16 px-8 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Инструменты для Практики</h2>
          <p className="text-slate-600 mb-8">Интерактивные тренажёры, калькуляторы и кейсы</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tool.title}</CardTitle>
                          <CardDescription className="mt-2">{tool.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-8 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Готовы к собеседованию?</h2>
          <p className="text-lg text-blue-100 mb-8">
            Изучите теорию, пройдите тренажёры, решите case studies и подготовьтесь к вопросам интервьюеров
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/trainers">
              <Button size="lg" variant="secondary">
                Начать тренажёры
              </Button>
            </Link>
            <Link href="/interviews">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Вопросы интервью
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
