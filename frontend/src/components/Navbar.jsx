import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
    isActive ? "bg-water-600/20 text-water-400" : "text-slate-300 hover:text-white hover:bg-navy-700/50"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-[1000] border-b border-navy-700 bg-navy-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-water-500 to-water-700 shadow-card">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C12 2 6 10 6 15a6 6 0 0 0 12 0c0-5-6-13-6-13Z" fill="white" fillOpacity="0.95" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold leading-none tracking-tight">FloodGuard</p>
            <p className="text-[11px] leading-none text-slate-400 mt-0.5">Flood Intelligence Platform</p>
          </div>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/" end className={linkClass}>Dashboard</NavLink>
          <NavLink to="/map" className={linkClass}>Flood Map</NavLink>
          <NavLink to="/risk" className={linkClass}>Risk Analysis</NavLink>
          <NavLink to="/alerts" className={linkClass}>Alerts</NavLink>
          <NavLink to="/about" className={linkClass}>About</NavLink>
        </nav>

        <MobileNav />
      </div>
    </header>
  );
}

function MobileNav() {
  return (
    <nav className="flex items-center gap-1 md:hidden">
      <NavLink to="/" end className={linkClass}>🏠</NavLink>
      <NavLink to="/map" className={linkClass}>🗺️</NavLink>
      <NavLink to="/risk" className={linkClass}>📊</NavLink>
      <NavLink to="/alerts" className={linkClass}>🔔</NavLink>
      <NavLink to="/about" className={linkClass}>ℹ️</NavLink>
    </nav>
  );
}
