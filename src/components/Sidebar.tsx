import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiDashboardLine, RiTaskLine, RiCalendarLine, RiBellLine,
  RiMenuFoldLine, RiMenuUnfoldLine, RiMoonLine, RiSunLine,
  RiGraduationCapLine, RiBellFill,
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { ActivePage } from '../types';

const navItems: { id: ActivePage; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <RiDashboardLine size={22} /> },
  { id: 'tasks', label: 'Tasks', icon: <RiTaskLine size={22} /> },
  { id: 'schedule', label: 'Schedule', icon: <RiCalendarLine size={22} /> },
  { id: 'reminders', label: 'Reminders', icon: <RiBellLine size={22} /> },
];

interface SidebarProps {
  isMobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, setMobileOpen }) => {
  const { activePage, setActivePage, darkMode, toggleDarkMode, reminders } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const unreadCount = reminders.filter(r => !r.isRead).length;

  const handleNav = (page: ActivePage) => {
    setActivePage(page);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} transition-colors duration-300`}>
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
          <RiGraduationCapLine size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden"
            >
              <span className="font-bold text-sm leading-tight whitespace-nowrap bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
                Student Life<br />Manager
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={() => setCollapsed(p => !p)}
          className={`ml-auto p-1.5 rounded-lg hidden md:flex ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
        >
          {collapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const isActive = activePage === item.id;
          return (
            <motion.button
              key={item.id}
              onClick={() => handleNav(item.id)}
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group
                ${isActive
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200'
                  : darkMode
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                }`}
            >
              <span className="flex-shrink-0 relative">
                {item.id === 'reminders' && unreadCount > 0 ? (
                  <>
                    <RiBellFill size={22} className={isActive ? 'text-white' : 'text-amber-500'} />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  </>
                ) : item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-l-full opacity-50"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`px-3 py-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={toggleDarkMode}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
            ${darkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-yellow-400' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
        >
          <span className="flex-shrink-0">
            {darkMode ? <RiSunLine size={22} /> : <RiMoonLine size={22} />}
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="text-sm font-medium whitespace-nowrap overflow-hidden"
              >
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 220 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col h-screen sticky top-0 flex-shrink-0 overflow-hidden shadow-lg"
        style={{ zIndex: 40 }}
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="md:hidden fixed left-0 top-0 h-full w-64 z-50 shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
