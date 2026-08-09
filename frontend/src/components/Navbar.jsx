import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  Navigation,
  BarChart2,
  Bell,
  Info,
  Droplets,
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/",       label: "Dashboard",     Icon: LayoutDashboard, end: true },
  { to: "/route",  label: "Route Planner", Icon: Navigation },
  { to: "/risk",   label: "Risk Analysis", Icon: BarChart2 },
  { to: "/alerts", label: "Alerts",        Icon: Bell },
  { to: "/about",  label: "About",         Icon: Info },
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
    isActive
      ? "bg-water-500/15 text-water-400 shadow-[inset_0_0_0_1px_rgba(94,200,242,0.2)]"
      : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-[1100] border-b border-white/[0.06] bg-navy-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-water-400 to-water-700 shadow-lg shadow-water-700/30">
            <Droplets size={22} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <p className="text-[21px] font-extrabold leading-none tracking-tight text-slate-100">
              Flood<span className="text-water-400">Guard</span>
            </p>
            
          </div>
        </div>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV_ITEMS.map(({ to, label, Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass}>
              <Icon size={15} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile nav */}
        <nav className="flex items-center gap-0.5 md:hidden">
          {NAV_ITEMS.map(({ to, Icon, label, end }) => (
            <NavLink key={to} to={to} end={end} className={linkClass} title={label}>
              <Icon size={17} strokeWidth={2} />
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
