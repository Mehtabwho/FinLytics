import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FinancialYearSelector from './FinancialYearSelector';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  MessageSquare, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Bell,
  Percent,
  Target
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/income', label: 'Income', icon: <TrendingUp size={20} /> },
    { path: '/expenses', label: 'Expenses', icon: <TrendingDown size={20} /> },
    { path: '/tax', label: 'Tax Manager', icon: <Calculator size={20} /> },
    { path: '/tax-rebate', label: 'Tax Rebate', icon: <Percent size={20} /> },
    { path: '/goals', label: 'Financial Goals', icon: <Target size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900/80 backdrop-blur-2xl border-r border-slate-700/30 flex flex-col z-20 transition-all duration-300 ease-in-out relative`}
      >
        <Link to="/dashboard" className="p-6 flex items-center gap-3 border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-cyan-500/30 shrink-0">
              F
            </div>
            {sidebarOpen && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="overflow-hidden"
              >
                  <h1 className="text-xl font-bold tracking-tight">FinLytics</h1>
                  <p className="text-xs text-slate-400">AI Finance Manager</p>
              </motion.div>
            )}
        </Link>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto sidebar-scroll">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative ${
                location.pathname === item.path
                  ? 'bg-gradient-to-r from-cyan-500/15 to-emerald-500/10 border border-cyan-500/20 shadow-glow'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200 border border-transparent'
              }`}
            >
              <div className={`${location.pathname === item.path ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'} transition-colors`}>
                {item.icon}
              </div>
              {sidebarOpen && (
                <motion.span 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }}
                  className="font-medium whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
              {!sidebarOpen && location.pathname === item.path && (
                <div className="absolute left-0 w-1 h-8 bg-gradient-to-b from-cyan-400 to-emerald-400 rounded-r-full"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700/30 space-y-2">
           <Link
              to="/profile"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-slate-800/40 text-slate-200'
                  : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
              }`}
            >
              <Settings size={20} />
              {sidebarOpen && <span className="font-medium">Settings</span>}
            </Link>
        
          <button
            onClick={logout}
            className="flex items-center space-x-3 text-red-400 p-3 hover:bg-red-500/10 rounded-xl w-full transition-colors"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-slate-900/60 backdrop-blur-2xl h-16 border-b border-slate-700/30 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800/50 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Menu size={20} />
            </button>
            
          </div>

          <div className="flex items-center gap-6">
            <div className="w-48 hidden sm:block">
              <FinancialYearSelector />
            </div>
            
            <button className="relative p-2 hover:bg-slate-800/50 rounded-full text-slate-400 hover:text-slate-200 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-slate-900"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-700/30">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-200 leading-tight">{user?.name}</p>
              </div>
              <Link to="/profile">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-10 h-10 rounded-xl object-cover shadow-md ring-2 ring-slate-800 cursor-pointer hover:ring-cyan-500/50 transition-all"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-md ring-2 ring-slate-800 cursor-pointer hover:ring-cyan-400/50 transition-all">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 relative scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
