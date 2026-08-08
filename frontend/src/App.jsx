import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { LocationProvider } from "./context/LocationContext";
import Dashboard from "./pages/Dashboard";
import FloodMapPage from "./pages/FloodMapPage";
import RiskAnalysisPage from "./pages/RiskAnalysisPage";
import AlertsPage from "./pages/AlertsPage";
import About from "./pages/About";

export default function App() {
  return (
    <LocationProvider>
      <div className="min-h-screen bg-navy-950">
        <Navbar />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<FloodMapPage />} />
            <Route path="/risk" element={<RiskAnalysisPage />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <footer className="border-t border-navy-800 py-6 text-center text-xs text-slate-600">
          FloodGuard is an informational risk-assessment tool and does not replace official emergency warnings.
        </footer>
      </div>
    </LocationProvider>
  );
}
