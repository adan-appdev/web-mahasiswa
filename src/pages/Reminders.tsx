import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, isPast, isToday, differenceInHours, differenceInDays } from 'date-fns';
import {
  RiAddLine, RiDeleteBinLine, RiCloseLine, RiCheckLine,
  RiBellLine, RiTimeLine, RiCalendarEventLine,
  RiBookOpenLine, RiStarLine,
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { Reminder } from '../types';

type ReminderType = 'Task' | 'Exam' | 'Event' | 'Custom';
const TYPES: ReminderType[] = ['Task', 'Exam', 'Event', 'Custom'];

const typeConfig: Record<ReminderType, { icon: React.ReactNode; color: string; bg: string; darkBg: string }> = {
  Task: { icon: <RiCheckLine size={14} />, color: 'text-blue-600', bg: 'bg-blue-100', darkBg: 'bg-blue-900/40' },
  Exam: { icon: <RiBookOpenLine size={14} />, color: 'text-red-600', bg: 'bg-red-100', darkBg: 'bg-red-900/40' },
  Event: { icon: <RiCalendarEventLine size={14} />, color: 'text-purple-600', bg: 'bg-purple-100', darkBg: 'bg-purple-900/40' },
  Custom: { icon: <RiStarLine size={14} />, color: 'text-amber-600', bg: 'bg-amber-100', darkBg: 'bg-amber-900/40' },
};

const getTimeLabel = (dateStr: string) => {
  const date = parseISO(dateStr);
  const now = new Date();
  if (isPast(date)) {
    const hoursAgo = Math.abs(differenceInHours(date, now));
    if (hoursAgo < 24) return { label: `${hoursAgo}h ago`, urgent: false, past: true };
    return { label: format(date, 'MMM d, yyyy'), urgent: false, past: true };
  }
  if (isToday(date)) {
    const hours = differenceInHours(date, now);
    return { label: `Today, ${format(date, 'h:mm a')}`, urgent: hours <= 3, past: false };
  }
  const days = differenceInDays(date, now);
  if (days === 1) return { label: `Tomorrow, ${format(date, 'h:mm a')}`, urgent: true, past: false };
  if (days <= 3) return { label: `in ${days} days`, urgent: true, past: false };
  return { label: format(date, 'MMM d, yyyy · h:mm a'), urgent: false, past: false };
};

interface ReminderFormData {
  title: string;
  description: string;
  dateTime: string;
  type: ReminderType;
}

const defaultDateTime = () => {
  const d = new Date();
  d.setMinutes(0, 0, 0);
  d.setHours(d.getHours() + 1);
  return d.toISOString().slice(0, 16);
};

const defaultForm: ReminderFormData = {
  title: '',
  description: '',
  dateTime: defaultDateTime(),
  type: 'Custom',
};

interface ReminderModalProps {
  reminder?: Reminder | null;
  onClose: () => void;
  darkMode: boolean;
}

const ReminderModal: React.FC<ReminderModalProps> = ({ reminder, onClose, darkMode }) => {
  const { addReminder } = useApp();
  const [form, setForm] = useState<ReminderFormData>(
    reminder
      ? { title: reminder.title, description: reminder.description, dateTime: reminder.dateTime.slice(0, 16), type: reminder.type }
      : defaultForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.dateTime) e.dateTime = 'Date & time is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    addReminder({ ...form, dateTime: new Date(form.dateTime).toISOString(), isRead: false });
    onClose();
  };

  const inputCls = `w-full px-3 py-2 rounded-xl text-sm outline-none border transition-colors
    ${darkMode
      ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
      : 'bg-gray-50 border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-400'
    }`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 30 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={`w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <RiBellLine className="text-blue-500" /> Add Reminder
          </h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <RiCloseLine size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Title *</label>
            <input
              className={`${inputCls} ${errors.title ? 'border-red-400' : ''}`}
              placeholder="e.g. Study for Calculus Exam"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Description</label>
            <textarea
              className={`${inputCls} resize-none h-20`}
              placeholder="Add more details..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Type</label>
            <div className="grid grid-cols-4 gap-2">
              {TYPES.map(t => {
                const cfg = typeConfig[t];
                const isSelected = form.type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, type: t }))}
                    className={`flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium border transition-all
                      ${isSelected
                        ? `border-blue-500 bg-blue-50 text-blue-600 ${darkMode ? 'bg-blue-900/30 text-blue-400' : ''}`
                        : darkMode ? 'border-gray-600 text-gray-400 hover:border-gray-500' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                      }`}
                  >
                    <span className={isSelected ? 'text-blue-500' : ''}>{cfg.icon}</span>
                    {t}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Date & Time *</label>
            <input
              type="datetime-local"
              className={`${inputCls} ${errors.dateTime ? 'border-red-400' : ''}`}
              value={form.dateTime}
              onChange={e => setForm(p => ({ ...p, dateTime: e.target.value }))}
            />
            {errors.dateTime && <p className="text-red-400 text-xs mt-1">{errors.dateTime}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-colors
                ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md"
            >
              Set Reminder
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Reminders: React.FC = () => {
  const { reminders, deleteReminder, markReminderRead, darkMode } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [filter, setFilter] = useState<'All' | 'Unread' | ReminderType>('All');

  const filtered = reminders
    .filter(r => {
      if (filter === 'All') return true;
      if (filter === 'Unread') return !r.isRead;
      return r.type === filter;
    })
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime());

  const unreadCount = reminders.filter(r => !r.isRead).length;

  const chipCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${active
      ? 'bg-blue-500 text-white shadow-sm'
      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
    }`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            All Reminders
          </h2>
          {unreadCount > 0 && (
            <p className="text-xs text-amber-500 font-medium mt-0.5">
              {unreadCount} unread reminder{unreadCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
        >
          <RiAddLine size={18} /> Add Reminder
        </motion.button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {(['All', 'Unread', ...TYPES] as const).map(f => (
          <button key={f} className={chipCls(filter === f)} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Reminder Cards */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-16 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <span className="text-5xl">🔔</span>
              <p className={`text-base font-medium mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No reminders found</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click "Add Reminder" to set one!</p>
            </motion.div>
          ) : (
            filtered.map((reminder, i) => {
              const cfg = typeConfig[reminder.type];
              const { label, urgent, past } = getTimeLabel(reminder.dateTime);

              return (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all
                    ${reminder.isRead
                      ? darkMode ? 'bg-gray-800/50 border-gray-700/50 opacity-70' : 'bg-gray-50 border-gray-100 opacity-80'
                      : urgent
                        ? darkMode ? 'bg-orange-900/20 border-orange-500/30' : 'bg-orange-50 border-orange-200'
                        : darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500/30' : 'bg-white border-gray-100 hover:shadow-md'
                    }`}
                >
                  {/* Type Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${reminder.isRead
                      ? darkMode ? 'bg-gray-700' : 'bg-gray-100'
                      : darkMode ? cfg.darkBg : cfg.bg
                    }`}>
                    <span className={reminder.isRead ? (darkMode ? 'text-gray-400' : 'text-gray-400') : cfg.color}>
                      {cfg.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p className={`font-semibold text-sm ${reminder.isRead
                        ? darkMode ? 'text-gray-400' : 'text-gray-500'
                        : darkMode ? 'text-white' : 'text-gray-800'
                      }`}>
                        {reminder.title}
                        {!reminder.isRead && (
                          <span className="inline-block ml-2 w-2 h-2 rounded-full bg-blue-500 align-middle" />
                        )}
                      </p>
                    </div>
                    {reminder.description && (
                      <p className={`text-xs mt-0.5 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {reminder.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`flex items-center gap-1 text-xs font-medium
                        ${past ? 'text-gray-400' : urgent ? 'text-orange-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <RiTimeLine size={11} /> {label}
                      </span>
                      {urgent && !past && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-600 font-semibold">
                          🔔 Soon
                        </span>
                      )}
                      {past && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                          Past
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!reminder.isRead && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => markReminderRead(reminder.id)}
                        className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-green-400' : 'hover:bg-green-50 text-green-500'}`}
                        title="Mark as read"
                      >
                        <RiCheckLine size={15} />
                      </motion.button>
                    )}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteReminder(reminder.id)}
                      className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-red-400'}`}
                    >
                      <RiDeleteBinLine size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Stats */}
      {reminders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}
        >
          <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>📊 Reminder Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TYPES.map(type => {
              const count = reminders.filter(r => r.type === type).length;
              const cfg = typeConfig[type];
              return (
                <div key={type} className={`flex flex-col items-center p-3 rounded-xl ${darkMode ? cfg.darkBg : cfg.bg}`}>
                  <span className={cfg.color}>{cfg.icon}</span>
                  <span className={`text-lg font-bold mt-1 ${darkMode ? 'text-white' : 'text-gray-800'}`}>{count}</span>
                  <span className={`text-[10px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{type}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <ReminderModal reminder={null} onClose={() => setModalOpen(false)} darkMode={darkMode} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reminders;
