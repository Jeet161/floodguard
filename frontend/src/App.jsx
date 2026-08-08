import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { LocationProvider } from "./context/LocationContext";
import Dashboard from "./pages/Dashboard";
import FloodMapPage from "./pages/FloodMapPage";
import RiskAnalysisPage from "./pages/RiskAnalysisPage";
import AlertsPage from "./pages/AlertsPage";
import About from "./pages/About";
import RoutePage from "./pages/RoutePage";
import { ShieldAlert } from "lucide-react";

export default function App() {
  return (
    <LocationProvider>
      <div className="flex min-h-screen flex-col bg-navy-950">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 sm:px-6 sm:py-9">
          <Routes>
            <Route path="/"       element={<Dashboard />} />
            <Route path="/map"    element={<FloodMapPage />} />
            <Route path="/route"  element={<RoutePage />} />
            <Route path="/risk"   element={<RiskAnalysisPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/about"  element={<About />} />
          </Routes>
        </main>
        <footer className="border-t border-white/[0.05] py-5">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 sm:px-6">
            <ShieldAlert size={13} className="text-slate-700" strokeWidth={2} />
            <p className="text-[11px] text-slate-700">
              FloodGuard is an informational risk-assessment tool and does not replace official emergency warnings.
            </p>
          </div>
        </footer>
      </div>
    </LocationProvider>
  );
}
