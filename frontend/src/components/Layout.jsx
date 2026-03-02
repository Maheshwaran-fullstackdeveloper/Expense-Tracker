import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Receipt,
  Target,
  Banknote,
  LogOut,
  Wallet,
  Menu,
  X,
  History,
  Sun,
  Moon,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const Layout = ({ children }) => {
  const { logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Transactions", path: "/transactions", icon: Receipt },
    { name: "Savings Goals", path: "/goals", icon: Target },
    { name: "Savings History", path: "/goal-logs", icon: History },
    { name: "Loans Tracker", path: "/loans", icon: Banknote },
    { name: "Loan History", path: "/loan-logs", icon: History },
  ];

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-full w-64 glass-card border-l-0 border-y-0 border-r border-primary-100 dark:border-primary-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-6 lg:block transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-primary-500 rounded-lg shadow-lg shadow-primary-500/30">
            <Wallet className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Expenso</h2>
          <button
            onClick={toggleDarkMode}
            className="ml-auto p-2 rounded-xl bg-primary-50 text-primary-600 hover:bg-primary-100 transition-all cursor-pointer dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all cursor-pointer ${
                location.pathname === item.path
                  ? "bg-primary-500 text-white shadow-lg shadow-primary-500/20"
                  : "text-primary-600 hover:bg-primary-50 hover:text-primary-800 dark:text-primary-400 dark:hover:bg-primary-900/30 dark:hover:text-primary-200"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-bold">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-10 left-6 right-6">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-4 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:rounded-xl transition-all cursor-pointer font-bold"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Nav */}
      <header className="lg:hidden glass-card sticky top-0 z-50 p-4 border-x-0 border-t-0 border-b border-primary-100 dark:border-primary-900/30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="text-primary-500 w-6 h-6" />
          <h2 className="text-xl font-bold gradient-text">Expenso</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleDarkMode}
            className="p-2 text-primary-600 cursor-pointer dark:text-primary-400"
          >
            {isDarkMode ? <Sun /> : <Moon />}
          </button>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-primary-600 cursor-pointer dark:text-primary-400"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-white dark:bg-slate-900 p-6 animate-in slide-in-from-left-full duration-300">
          <button
            onClick={() => setIsMenuOpen(false)}
            className="absolute top-6 right-6 p-2 text-primary-600 dark:text-primary-400 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <nav className="space-y-4 pt-20">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-4 px-6 py-4 rounded-xl transition-all cursor-pointer ${
                  location.pathname === item.path
                    ? "bg-primary-500 text-white shadow-lg"
                    : "text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30"
                }`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-lg font-bold">{item.name}</span>
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-4 px-6 py-4 text-red-500 rounded-xl cursor-pointer font-bold hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <LogOut className="w-6 h-6" />
              <span className="text-lg font-bold">Logout</span>
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="lg:ml-64 p-6 lg:p-10 bg-slate-50 dark:bg-slate-950 min-h-screen transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
        <div className="animate-in fade-in transition-opacity duration-500 ease-in-out">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
