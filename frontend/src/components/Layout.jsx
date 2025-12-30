import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  MessageSquare, 
  BarChart3,
  Settings,
  LogOut 
} from 'lucide-react';

const Layout = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/income', label: 'Income', icon: <TrendingUp size={20} /> },
    { path: '/expenses', label: 'Expenses', icon: <TrendingDown size={20} /> },
    { path: '/tax', label: 'Tax Manager', icon: <Calculator size={20} /> },
    { path: '/tax-rebate', label: 'Tax Rebate', icon: <Calculator size={20} /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 size={20} /> },
    { path: '/chat', label: 'AI Assistant', icon: <MessageSquare size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-neutral-light font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col z-10">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">F</div>
            <div>
                <h1 className="text-xl font-bold text-primary">FinLytics</h1>
                <p className="text-xs text-slate-500">AI Finance Manager</p>
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-primary text-white shadow-md shadow-primary/30'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           <Link
              to="/profile"
              className={`flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                location.pathname === '/profile'
                  ? 'bg-primary text-white'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <Settings size={20} />
              <span className="font-medium">Settings</span>
            </Link>
        
          <div className="pt-2 pb-2">
             <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-sm font-semibold text-primary truncate">{user?.name}</p>
                <p className="text-xs text-secondary font-medium">{user?.businessType}</p>
             </div>
          </div>

          <button
            onClick={logout}
            className="flex items-center space-x-3 text-red-500 p-3 hover:bg-red-50 rounded-xl w-full transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 bg-neutral-light">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
