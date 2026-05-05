import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Theory from "./pages/Theory";
import Trainers from "./pages/Trainers";
import Calculators from "./pages/Calculators";
import Cases from "./pages/Cases";
import Interviews from "./pages/Interviews";
import Navigation from "./components/Navigation";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/theory/:blockId"} component={Theory} />
      <Route path={"/trainers"} component={Trainers} />
      <Route path={"/calculators"} component={Calculators} />
      <Route path={"/cases"} component={Cases} />
      <Route path={"/interviews"} component={Interviews} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <div className="flex min-h-screen w-full bg-background">
            <Navigation />
            <div className="flex-1 overflow-auto">
              <Router />
            </div>
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
