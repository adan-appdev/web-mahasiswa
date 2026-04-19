import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { RiAddLine, RiEditLine, RiDeleteBinLine, RiCloseLine, RiTimeLine, RiMapPinLine, RiUserLine } from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { ScheduleItem, WeekDay } from '../types';

const DAYS: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_SHORT: Record<WeekDay, string> = {
  Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed',
  Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun',
};

const SUBJECT_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#f97316', '#3b82f6', '#8b5cf6', '#06b6d4',
  '#ef4444', '#84cc16',
];

interface ScheduleFormData {
  subject: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  room: string;
  color: string;
  teacher: string;
}

const defaultForm: ScheduleFormData = {
  subject: '',
  day: 'Monday',
  startTime: '08:00',
  endTime: '09:30',
  room: '',
  color: '#6366f1',
  teacher: '',
};

interface ScheduleModalProps {
  item?: ScheduleItem | null;
  onClose: () => void;
  darkMode: boolean;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ item, onClose, darkMode }) => {
  const { addScheduleItem, updateScheduleItem } = useApp();
  const [form, setForm] = useState<ScheduleFormData>(
    item
      ? { subject: item.subject, day: item.day, startTime: item.startTime, endTime: item.endTime, room: item.room, color: item.color, teacher: item.teacher }
      : defaultForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.subject.trim()) e.subject = 'Subject is required';
    if (!form.startTime) e.startTime = 'Start time is required';
    if (!form.endTime) e.endTime = 'End time is required';
    if (form.startTime >= form.endTime) e.endTime = 'End time must be after start time';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (item) {
      updateScheduleItem(item.id, form);
    } else {
      addScheduleItem(form);
    }
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
        className={`w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6 max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">{item ? 'Edit Class' : 'Add New Class'}</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <RiCloseLine size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Subject Name *</label>
            <input
              className={`${inputCls} ${errors.subject ? 'border-red-400' : ''}`}
              placeholder="e.g. Mathematics"
              value={form.subject}
              onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
            />
            {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Day</label>
            <select
              className={inputCls}
              value={form.day}
              onChange={e => setForm(p => ({ ...p, day: e.target.value as WeekDay }))}
            >
              {DAYS.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Start Time *</label>
              <input
                type="time"
                className={`${inputCls} ${errors.startTime ? 'border-red-400' : ''}`}
                value={form.startTime}
                onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))}
              />
            </div>
            <div>
              <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>End Time *</label>
              <input
                type="time"
                className={`${inputCls} ${errors.endTime ? 'border-red-400' : ''}`}
                value={form.endTime}
                onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))}
              />
              {errors.endTime && <p className="text-red-400 text-xs mt-1">{errors.endTime}</p>}
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Room / Location</label>
            <input
              className={inputCls}
              placeholder="e.g. Room 101"
              value={form.room}
              onChange={e => setForm(p => ({ ...p, room: e.target.value }))}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Teacher / Professor</label>
            <input
              className={inputCls}
              placeholder="e.g. Dr. Smith"
              value={form.teacher}
              onChange={e => setForm(p => ({ ...p, teacher: e.target.value }))}
            />
          </div>

          <div>
            <label className={`text-xs font-semibold mb-2 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Color</label>
            <div className="flex gap-2 flex-wrap">
              {SUBJECT_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, color: c }))}
                  className="w-7 h-7 rounded-full transition-all"
                  style={{
                    backgroundColor: c,
                    outline: form.color === c ? `3px solid ${c}` : 'none',
                    outlineOffset: 2,
                    transform: form.color === c ? 'scale(1.2)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
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
              {item ? 'Save Changes' : 'Add Class'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Schedule: React.FC = () => {
  const { scheduleItems, deleteScheduleItem, darkMode } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ScheduleItem | null>(null);
  const todayName = format(new Date(), 'EEEE') as WeekDay;
  const [selectedDay, setSelectedDay] = useState<WeekDay>(
    DAYS.includes(todayName) ? todayName : 'Monday'
  );

  const openEdit = (item: ScheduleItem) => { setEditingItem(item); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingItem(null); };

  const dayItems = scheduleItems
    .filter(s => s.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Get unique subjects with their colors for the legend
  const subjects = Array.from(
    scheduleItems.reduce((map, item) => {
      if (!map.has(item.subject)) map.set(item.subject, item.color);
      return map;
    }, new Map<string, string>())
  );

  return (
    <div className="space-y-5">
      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {DAYS.map(day => {
          const count = scheduleItems.filter(s => s.day === day).length;
          const isToday = day === todayName;
          const isSelected = day === selectedDay;
          return (
            <motion.button
              key={day}
              onClick={() => setSelectedDay(day)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 flex flex-col items-center px-4 py-3 rounded-2xl text-xs font-medium transition-all
                ${isSelected
                  ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200'
                  : isToday
                    ? darkMode ? 'bg-blue-900/40 text-blue-400 border border-blue-500/30' : 'bg-blue-50 text-blue-500 border border-blue-200'
                    : darkMode ? 'bg-gray-800 text-gray-400 border border-gray-700' : 'bg-white text-gray-600 border border-gray-200'
                }`}
            >
              <span className="font-bold">{DAY_SHORT[day]}</span>
              <span className={`mt-1 text-[10px] ${isSelected ? 'text-blue-100' : ''}`}>
                {count} class{count !== 1 ? 'es' : ''}
              </span>
              {isToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="flex items-center justify-between">
        <h2 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          {selectedDay}{todayName === selectedDay ? ' (Today)' : ''}
          <span className={`ml-2 text-sm font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {dayItems.length} class{dayItems.length !== 1 ? 'es' : ''}
          </span>
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditingItem(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
        >
          <RiAddLine size={18} /> Add Class
        </motion.button>
      </div>

      {/* Schedule for Selected Day */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          {dayItems.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`text-center py-16 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <span className="text-5xl">📚</span>
              <p className={`text-base font-medium mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No classes on {selectedDay}</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>Click "Add Class" to schedule one!</p>
            </motion.div>
          ) : (
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {dayItems.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className={`group flex items-stretch gap-4 p-4 rounded-2xl border transition-all
                    ${darkMode
                      ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      : 'bg-white border-gray-100 hover:shadow-md hover:border-gray-200'
                    }`}
                >
                  {/* Color Bar */}
                  <div className="w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />

                  {/* Time */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-16">
                    <span className={`text-xs font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.startTime}</span>
                    <div className={`my-1 w-px h-4 ${darkMode ? 'bg-gray-600' : 'bg-gray-200'}`} />
                    <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.endTime}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <p className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.subject}</p>
                    </div>
                    <div className={`flex items-center gap-4 mt-2 flex-wrap text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {item.room && (
                        <span className="flex items-center gap-1"><RiMapPinLine size={12} />{item.room}</span>
                      )}
                      {item.teacher && (
                        <span className="flex items-center gap-1"><RiUserLine size={12} />{item.teacher}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <RiTimeLine size={12} />
                        {(() => {
                          const [sh, sm] = item.startTime.split(':').map(Number);
                          const [eh, em] = item.endTime.split(':').map(Number);
                          const dur = (eh * 60 + em) - (sh * 60 + sm);
                          return `${Math.floor(dur / 60)}h${dur % 60 ? ` ${dur % 60}m` : ''}`;
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => openEdit(item)}
                      className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-blue-50 text-blue-500'}`}
                    >
                      <RiEditLine size={15} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      onClick={() => deleteScheduleItem(item.id)}
                      className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-red-400' : 'hover:bg-red-50 text-red-400'}`}
                    >
                      <RiDeleteBinLine size={15} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Weekly Summary */}
      {subjects.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`rounded-2xl p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}
        >
          <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>📊 Weekly Overview</h3>
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(day => {
              const count = scheduleItems.filter(s => s.day === day).length;
              const isToday = day === todayName;
              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-medium ${isToday ? 'text-blue-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {DAY_SHORT[day]}
                  </span>
                  <div
                    className={`w-full rounded-md transition-all ${count > 0
                      ? 'bg-blue-500 opacity-' + Math.min(100, 40 + count * 20)
                      : darkMode ? 'bg-gray-700' : 'bg-gray-100'
                    }`}
                    style={{ height: `${Math.max(16, count * 14)}px` }}
                  />
                  <span className={`text-[10px] ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map(([subject, color]) => (
              <span
                key={subject}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                {subject}
              </span>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <ScheduleModal item={editingItem} onClose={closeModal} darkMode={darkMode} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Schedule;
