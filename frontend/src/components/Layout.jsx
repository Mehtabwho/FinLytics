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
  Search,
  ChevronDown
} from 'lucide-react';
import { useState } from 'react';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/income', label: 'Income', icon: <TrendingUp size={20} /> },
    { path: '/expenses', label: 'Expenses', icon: <TrendingDown size={20} /> },
    { path: '/tax', label: 'Tax Manager', icon: <Calculator size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-background font-sans text-slate-800 overflow-hidden">
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-primary text-white shadow-2xl flex flex-col z-20 transition-all duration-300 ease-in-out relative`}
      >
        <div className="p-6 flex items-center gap-3 border-b border-white/10">
            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-secondary/20 shrink-0">
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
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-none">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group relative ${
                location.pathname === item.path
                  ? 'bg-white/10 text-white shadow-inner border border-white/5'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className={`${location.pathname === item.path ? 'text-secondary' : 'text-slate-400 group-hover:text-white'} transition-colors`}>
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
                <div className="absolute left-0 w-1 h-8 bg-secondary rounded-r-full"></div>
              )}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
           <Link
              to="/profile"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
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
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
            >
              <Menu size={20} />
            </button>
            
          </div>

          <div className="flex items-center gap-6">
            <div className="w-48 hidden sm:block">
              <FinancialYearSelector />
            </div>
            
            <button className="relative p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
              </div>
              <Link to="/profile">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white cursor-pointer hover:ring-secondary transition-all">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-background relative scroll-smooth">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
