import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { BookOpen, TrendingUp, Package, Zap, ShoppingCart, BarChart3, Briefcase, HelpCircle, Cloud, ChevronDown } from "lucide-react";
import { DriveSyncModal } from "./DriveSyncModal";

const navItems = [
  { label: "Главная", href: "/", icon: BookOpen },
  { label: "Блок 1: Финанс. инжиниринг", href: "/theory/1", icon: TrendingUp },
  { label: "Блок 2: Запасы + S&OP", href: "/theory/2", icon: Package },
  { label: "Блок 3: Стратегический сорсинг", href: "/theory/3", icon: ShoppingCart },
  { label: "Блок 4: Закупки 4.0 + Риски", href: "/theory/4", icon: Zap },
  { label: "Блок 5: Глоссарий", href: "/theory/5", icon: BookOpen },
  { label: "Тренажёры", href: "/trainers", icon: BarChart3 },
  { label: "Калькуляторы", href: "/calculators", icon: Briefcase },
  { label: "Case Studies", href: "/cases", icon: Briefcase },
  { label: "Интервью вопросы", href: "/interviews", icon: HelpCircle },
];

export default function Navigation() {
  const [syncModalOpen, setSyncModalOpen] = useState(false);
  const [kbExpanded, setKbExpanded] = useState(true);

  return (
    <>
      <aside className="w-64 bg-slate-900 text-white p-6 overflow-y-auto sticky top-0 h-screen shrink-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">CPO Russia</h1>
          <p className="text-sm text-slate-300">Knowledge Base для закупщиков</p>
        </div>
        
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-slate-200 hover:text-white hover:bg-slate-800"
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="text-sm">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Knowledge Base Management Section */}
        <div className="mt-8 pt-8 border-t border-slate-700 space-y-3">
          <button
            onClick={() => setKbExpanded(!kbExpanded)}
            className="w-full flex items-center justify-between text-slate-300 hover:text-white transition"
          >
            <span className="text-xs font-semibold uppercase tracking-wide">База знаний</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${kbExpanded ? "rotate-180" : ""}`} />
          </button>

          {kbExpanded && (
            <div className="space-y-2">
              <Button
                onClick={() => setSyncModalOpen(true)}
                className="w-full justify-start bg-blue-600 hover:bg-blue-700 text-white"
                size="sm"
              >
                <Cloud className="w-4 h-4 mr-2" />
                <span className="text-xs">Синхронизировать</span>
              </Button>
              <p className="text-xs text-slate-400 px-2">
                Загрузить PDF файлы из Google Drive папки CPO_Knowledge-KB
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-700">
          <p className="text-xs text-slate-400">
            Версия 1.0 • Полная база знаний для C-level специалистов по закупкам
          </p>
        </div>
      </aside>

      <DriveSyncModal open={syncModalOpen} onOpenChange={setSyncModalOpen} />
    </>
  );
}
