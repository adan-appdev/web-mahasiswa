import React from 'react';
import { motion } from 'framer-motion';
import { RiMenuLine, RiSearchLine, RiNotification3Line } from 'react-icons/ri';
import { format } from 'date-fns';
import { useApp } from '../context/AppContext';

interface HeaderProps {
  setMobileOpen: (v: boolean) => void;
}

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Welcome back! Here\'s your overview.' },
  tasks: { title: 'Task Manager', subtitle: 'Manage and track your assignments.' },
  schedule: { title: 'Weekly Schedule', subtitle: 'Your class timetable at a glance.' },
  reminders: { title: 'Reminders', subtitle: 'Stay on top of upcoming events.' },
};

const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { darkMode, activePage, searchQuery, setSearchQuery, reminders, setActivePage } = useApp();
  const today = format(new Date(), 'EEEE, MMMM d, yyyy');
  const unreadCount = reminders.filter(r => !r.isRead).length;
  const pageInfo = pageTitles[activePage] || pageTitles.dashboard;

  return (
    <header className={`sticky top-0 z-30 px-4 md:px-6 py-3 flex items-center gap-4 border-b backdrop-blur-md
      ${darkMode ? 'bg-gray-900/90 border-gray-700 text-white' : 'bg-white/90 border-gray-100 text-gray-800'}`}>
      
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`md:hidden p-2 rounded-lg ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
      >
        <RiMenuLine size={22} />
      </button>

      {/* Title */}
      <div className="min-w-0">
        <motion.h1
          key={activePage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-bold text-base md:text-lg leading-tight truncate"
        >
          {pageInfo.title}
        </motion.h1>
        <p className={`text-xs hidden md:block ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{today}</p>
        <p className={`text-xs md:hidden ${darkMode ? 'text-gray-400' : 'text-gray-500'} truncate`}>{pageInfo.subtitle}</p>
      </div>

      {/* Search Bar */}
      {(activePage === 'tasks' || activePage === 'dashboard') && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl flex-1 max-w-sm
            ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-50 text-gray-500'} border
            ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <RiSearchLine size={16} className="flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search tasks..."
            className="bg-transparent text-sm outline-none w-full placeholder-gray-400"
          />
        </motion.div>
      )}

      <div className="ml-auto flex items-center gap-3">
        {/* Notification Bell */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActivePage('reminders')}
          className={`relative p-2 rounded-xl ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
        >
          <RiNotification3Line size={22} className={unreadCount > 0 ? 'text-amber-500' : ''} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </motion.button>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
          S
        </div>
      </div>
    </header>
  );
};

export default Header;
