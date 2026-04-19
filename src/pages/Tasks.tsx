import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, parseISO, differenceInDays, isToday, isTomorrow } from 'date-fns';
import {
  RiAddLine, RiEditLine, RiDeleteBinLine, RiCheckLine,
  RiFilterLine, RiSearchLine, RiCloseLine, RiCalendarLine,
  RiFlag2Fill,
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';
import { Task, TaskCategory, TaskPriority } from '../types';

const CATEGORIES: TaskCategory[] = ['Homework', 'Project', 'Exam', 'Other'];
const PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

const categoryColors: Record<TaskCategory, string> = {
  Homework: 'bg-blue-100 text-blue-700 border-blue-200',
  Project: 'bg-purple-100 text-purple-700 border-purple-200',
  Exam: 'bg-red-100 text-red-700 border-red-200',
  Other: 'bg-gray-100 text-gray-700 border-gray-200',
};

const priorityConfig: Record<TaskPriority, { color: string; dot: string }> = {
  Low: { color: 'text-green-500', dot: 'bg-green-500' },
  Medium: { color: 'text-amber-500', dot: 'bg-amber-500' },
  High: { color: 'text-red-500', dot: 'bg-red-500' },
};

interface TaskFormData {
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
}

const defaultForm: TaskFormData = {
  title: '',
  description: '',
  category: 'Homework',
  priority: 'Medium',
  dueDate: new Date().toISOString().split('T')[0],
  completed: false,
};

const getDueDateLabel = (dateStr: string) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return { label: 'Due Today', cls: 'text-red-500 font-semibold' };
  if (isTomorrow(date)) return { label: 'Due Tomorrow', cls: 'text-orange-500 font-semibold' };
  const days = differenceInDays(date, new Date());
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, cls: 'text-red-600 font-bold' };
  return { label: format(date, 'MMM d, yyyy'), cls: 'text-gray-400' };
};

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
  darkMode: boolean;
}

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, darkMode }) => {
  const { addTask, updateTask } = useApp();
  const [form, setForm] = useState<TaskFormData>(
    task ? { title: task.title, description: task.description, category: task.category, priority: task.priority, dueDate: task.dueDate, completed: task.completed }
      : defaultForm
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = 'Title is required';
    if (!form.dueDate) e.dueDate = 'Due date is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (task) {
      updateTask(task.id, form);
    } else {
      addTask(form);
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
        className={`w-full max-w-md rounded-2xl shadow-2xl ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} p-6`}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-lg">{task ? 'Edit Task' : 'Add New Task'}</h2>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <RiCloseLine size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Task Title *</label>
            <input
              className={`${inputCls} ${errors.title ? 'border-red-400' : ''}`}
              placeholder="e.g. Math Assignment Chapter 5"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
            />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Description</label>
            <textarea
              className={`${inputCls} resize-none h-20`}
              placeholder="Add details about this task..."
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Category</label>
              <select
                className={inputCls}
                value={form.category}
                onChange={e => setForm(p => ({ ...p, category: e.target.value as TaskCategory }))}
              >
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Priority</label>
              <select
                className={inputCls}
                value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value as TaskPriority }))}
              >
                {PRIORITIES.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className={`text-xs font-semibold mb-1 block ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Due Date *</label>
            <input
              type="date"
              className={`${inputCls} ${errors.dueDate ? 'border-red-400' : ''}`}
              value={form.dueDate}
              onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
            />
            {errors.dueDate && <p className="text-red-400 text-xs mt-1">{errors.dueDate}</p>}
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
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200 transition-all"
            >
              {task ? 'Save Changes' : 'Add Task'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

const Tasks: React.FC = () => {
  const { tasks, toggleTaskComplete, deleteTask, darkMode, searchQuery, setSearchQuery } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [filterCategory, setFilterCategory] = useState<'All' | TaskCategory>('All');
  const [filterPriority, setFilterPriority] = useState<'All' | TaskPriority>('All');
  const [filterStatus, setFilterStatus] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchSearch = !searchQuery || task.title.toLowerCase().includes(searchQuery.toLowerCase()) || task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = filterCategory === 'All' || task.category === filterCategory;
      const matchPriority = filterPriority === 'All' || task.priority === filterPriority;
      const matchStatus = filterStatus === 'All' || (filterStatus === 'Pending' ? !task.completed : task.completed);
      return matchSearch && matchCat && matchPriority && matchStatus;
    }).sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      const pOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
      return (pOrder[a.priority] || 0) - (pOrder[b.priority] || 0);
    });
  }, [tasks, searchQuery, filterCategory, filterPriority, filterStatus]);

  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;

  const openEdit = (task: Task) => { setEditingTask(task); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditingTask(null); };

  const chipCls = (active: boolean) =>
    `px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${active
      ? 'bg-blue-500 text-white shadow-sm'
      : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
    }`;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1">
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-500'}`}>
            <RiSearchLine size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="bg-transparent text-sm outline-none flex-1 placeholder-gray-400"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}><RiCloseLine size={16} /></button>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowFilters(p => !p)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors
            ${showFilters
              ? 'bg-blue-500 text-white border-blue-500'
              : darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'
            }`}
        >
          <RiFilterLine size={16} /> Filters
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => { setEditingTask(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-200"
        >
          <RiAddLine size={18} /> Add Task
        </motion.button>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`rounded-2xl p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm overflow-hidden`}
          >
            <div className="space-y-3">
              <div>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>STATUS</p>
                <div className="flex gap-2 flex-wrap">
                  {(['All', 'Pending', 'Completed'] as const).map(s => (
                    <button key={s} className={chipCls(filterStatus === s)} onClick={() => setFilterStatus(s)}>{s}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>CATEGORY</p>
                <div className="flex gap-2 flex-wrap">
                  {(['All', ...CATEGORIES] as const).map(c => (
                    <button key={c} className={chipCls(filterCategory === c)} onClick={() => setFilterCategory(c as typeof filterCategory)}>{c}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className={`text-xs font-semibold mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>PRIORITY</p>
                <div className="flex gap-2 flex-wrap">
                  {(['All', ...PRIORITIES] as const).map(p => (
                    <button key={p} className={chipCls(filterPriority === p)} onClick={() => setFilterPriority(p as typeof filterPriority)}>{p}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-2xl p-4 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex gap-4">
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="font-bold text-blue-500">{pendingCount}</span> pending
            </span>
            <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="font-bold text-green-500">{completedCount}</span> completed
            </span>
          </div>
          <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-700'}`}>{completionRate}%</span>
        </div>
        <div className={`h-2 rounded-full overflow-hidden ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${completionRate}%` }}
            transition={{ duration: 0.8 }}
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
          />
        </div>
      </motion.div>

      {/* Task List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center py-16 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}
            >
              <span className="text-5xl">📝</span>
              <p className={`text-base font-medium mt-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>No tasks found</p>
              <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {searchQuery ? 'Try a different search term' : 'Click "Add Task" to get started!'}
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task) => {
              const { label, cls } = getDueDateLabel(task.dueDate);
              const pConf = priorityConfig[task.priority];
              return (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`group flex items-start gap-3 p-4 rounded-2xl border transition-all
                    ${task.completed
                      ? darkMode ? 'bg-gray-800/50 border-gray-700/50 opacity-60' : 'bg-gray-50/80 border-gray-100 opacity-70'
                      : darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-500/50' : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
                    }`}
                >
                  {/* Checkbox */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleTaskComplete(task.id)}
                    className={`mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                      ${task.completed
                        ? 'bg-green-500 border-green-500 text-white'
                        : darkMode ? 'border-gray-500 hover:border-green-400' : 'border-gray-300 hover:border-green-500'
                      }`}
                  >
                    {task.completed && <RiCheckLine size={12} />}
                  </motion.button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <p className={`font-medium text-sm ${task.completed ? 'line-through' : ''} ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        {task.title}
                      </p>
                    </div>
                    {task.description && (
                      <p className={`text-xs mt-0.5 line-clamp-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        {task.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${categoryColors[task.category]}`}>
                        {task.category}
                      </span>
                      <span className={`flex items-center gap-1 text-[10px] font-medium ${pConf.color}`}>
                        <RiFlag2Fill size={10} /> {task.priority}
                      </span>
                      <span className={`flex items-center gap-1 text-xs ${cls}`}>
                        <RiCalendarLine size={11} /> {label}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => openEdit(task)}
                      className={`p-1.5 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-blue-50 text-blue-500'}`}
                    >
                      <RiEditLine size={15} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteTask(task.id)}
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

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <TaskModal task={editingTask} onClose={closeModal} darkMode={darkMode} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
