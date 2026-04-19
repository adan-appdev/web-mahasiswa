import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { RiBellFill, RiCloseLine, RiCheckLine } from 'react-icons/ri';
import { useApp } from '../context/AppContext';

const NotificationPopup: React.FC = () => {
  const { activeNotifications, dismissNotification, markReminderRead, darkMode } = useApp();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs w-full">
      <AnimatePresence>
        {activeNotifications.slice(0, 3).map(notif => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 80, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.8 }}
            transition={{ type: 'spring', damping: 20, stiffness: 260 }}
            className={`flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md
              ${darkMode
                ? 'bg-gray-800/95 border-gray-700 text-white'
                : 'bg-white/95 border-gray-100 text-gray-800'
              }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md">
              <RiBellFill size={16} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight">{notif.title}</p>
              {notif.description && (
                <p className={`text-xs mt-0.5 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {notif.description}
                </p>
              )}
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {format(parseISO(notif.dateTime), 'MMM d · h:mm a')}
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => markReminderRead(notif.id)}
                  className="flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                >
                  <RiCheckLine size={11} /> Mark Read
                </button>
                <button
                  onClick={() => dismissNotification(notif.id)}
                  className={`flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-lg transition-colors
                    ${darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  Dismiss
                </button>
              </div>
            </div>
            <button
              onClick={() => dismissNotification(notif.id)}
              className={`p-1 rounded-lg flex-shrink-0 ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-400'}`}
            >
              <RiCloseLine size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationPopup;
