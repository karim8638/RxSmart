import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  Pill,
  ShoppingCart,
  Receipt,
  CreditCard,
  TrendingUp,
  Users,
  Settings,
  User,
  Moon,
  Sun,
  HelpCircle,
  Star,
  Phone,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Crown,
  BarChart3,
  FileText,
  Mail,
  PlusCircle,
} from 'lucide-react';
import { useAuthContext } from '../../contexts/AuthContext';

const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['reports', 'settings']);
  const { signOut, appUser } = useAuthContext();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const mainNavItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Pill, label: 'Medicines', path: '/medicines' },
    { icon: ShoppingCart, label: 'Purchases', path: '/purchases' },
    { icon: Receipt, label: 'Sales', path: '/sales' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: TrendingUp, label: 'Expenses', path: '/expenses' },
    { icon: Users, label: 'Patients', path: '/patients' },
  ];

  const adminNavItems = [
    { icon: Crown, label: 'Subscriptions', path: '/subscriptions' },
  ];

  const reportsItems = [
    { icon: BarChart3, label: 'Analytics', path: '/reports' },
    { icon: PlusCircle, label: 'Report Builder', path: '/reports/builder' },
    { icon: Mail, label: 'Email Reports', path: '/reports/email' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'General', path: '/settings/general' },
    { icon: User, label: 'Profile', path: '/settings/profile' },
    { icon: HelpCircle, label: 'Help', path: '/settings/help' },
    { icon: Star, label: 'Feedback', path: '/settings/feedback' },
    { icon: Phone, label: 'Contact', path: '/settings/contact' },
  ];

  return (
    <>
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transition-all duration-300 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            {!isCollapsed && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Pill className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-800">RxSmart</h1>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>

            {/* Reports Section */}
            <div className="mt-8">
              <button
                onClick={() => toggleSection('reports')}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  {!isCollapsed && <span>Reports</span>}
                </div>
                {!isCollapsed && (
                  expandedSections.includes('reports') 
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {!isCollapsed && expandedSections.includes('reports') && (
                <div className="ml-6 mt-2 space-y-1">
                  {reportsItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Section */}
            {appUser?.role === 'admin' && (
              <div className="mt-8">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {!isCollapsed && 'Admin'}
                </div>
                <div className="space-y-2">
                  {adminNavItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-purple-50 text-purple-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </NavLink>
                  ))}
                </div>
              </div>
            )}

            {/* Settings Section */}
            <div className="mt-8">
              <button
                onClick={() => toggleSection('settings')}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Settings className="w-5 h-5" />
                  {!isCollapsed && <span>Settings</span>}
                </div>
                {!isCollapsed && (
                  expandedSections.includes('settings') 
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {!isCollapsed && expandedSections.includes('settings') && (
                <div className="ml-6 mt-2 space-y-1">
                  {settingsItems.map((item) => (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                        }`
                      }
                    >
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <div className="mt-4">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors w-full"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                {!isCollapsed && <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>}
              </button>
            </div>
          </nav>

          {/* Sign Out */}
          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
            >
              <User className="w-5 h-5" />
              {!isCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;