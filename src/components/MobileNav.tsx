import React from 'react';
import { motion } from 'framer-motion';
import {
  RiDashboardLine, RiTaskLine, RiCalendarLine, RiBellLine,
  RiDashboardFill, RiTaskFill, RiCalendar2Fill, RiBellFill,
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { ActivePage } from '../types';

const navItems: { id: ActivePage; label: string; icon: React.ReactNode; activeIcon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Home', icon: <RiDashboardLine size={22} />, activeIcon: <RiDashboardFill size={22} /> },
  { id: 'tasks', label: 'Tasks', icon: <RiTaskLine size={22} />, activeIcon: <RiTaskFill size={22} /> },
  { id: 'schedule', label: 'Schedule', icon: <RiCalendarLine size={22} />, activeIcon: <RiCalendar2Fill size={22} /> },
  { id: 'reminders', label: 'Reminders', icon: <RiBellLine size={22} />, activeIcon: <RiBellFill size={22} /> },
];

const MobileNav: React.FC = () => {
  const { activePage, setActivePage, darkMode, reminders } = useApp();
  const unreadCount = reminders.filter(r => !r.isRead).length;

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t flex items-center justify-around
      ${darkMode ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-gray-100'} backdrop-blur-md pb-safe`}
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 8px)', paddingTop: '8px' }}
    >
      {navItems.map(item => {
        const isActive = activePage === item.id;
        return (
          <motion.button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            whileTap={{ scale: 0.85 }}
            className={`relative flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl transition-colors
              ${isActive
                ? 'text-blue-500'
                : darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}
          >
            {isActive && (
              <motion.div
                layoutId="mobileActiveIndicator"
                className="absolute inset-0 rounded-xl bg-blue-500/10"
              />
            )}
            <span className="relative">
              {isActive ? item.activeIcon : item.icon}
              {item.id === 'reminders' && unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </span>
            <span className={`text-[10px] font-medium leading-none ${isActive ? 'text-blue-500' : ''}`}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
};

export default MobileNav;
