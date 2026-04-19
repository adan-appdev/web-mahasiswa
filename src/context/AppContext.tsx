import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Task, ScheduleItem, Reminder, ActivePage } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AppContextType {
  // Theme
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Navigation
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskComplete: (id: string) => void;

  // Schedule
  scheduleItems: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  updateScheduleItem: (id: string, item: Partial<ScheduleItem>) => void;
  deleteScheduleItem: (id: string) => void;

  // Reminders
  reminders: Reminder[];
  addReminder: (reminder: Omit<Reminder, 'id'>) => void;
  updateReminder: (id: string, reminder: Partial<Reminder>) => void;
  deleteReminder: (id: string) => void;
  markReminderRead: (id: string) => void;

  // Search
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Notifications
  activeNotifications: Reminder[];
  dismissNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const SAMPLE_TASKS: Task[] = [
  {
    id: uuidv4(),
    title: 'Math Assignment Chapter 5',
    description: 'Complete exercises 1-20 from the textbook',
    category: 'Homework',
    priority: 'High',
    dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Physics Lab Report',
    description: 'Write up findings from the pendulum experiment',
    category: 'Project',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'History Essay',
    description: 'Write 2000-word essay on World War II causes',
    category: 'Homework',
    priority: 'Medium',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    completed: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Calculus Midterm Exam',
    description: 'Study chapters 1-6, focus on integration',
    category: 'Exam',
    priority: 'High',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    title: 'Group Project Presentation',
    description: 'Prepare slides for software engineering project',
    category: 'Project',
    priority: 'High',
    dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
    completed: false,
    createdAt: new Date().toISOString(),
  },
];

const SAMPLE_SCHEDULE: ScheduleItem[] = [
  { id: uuidv4(), subject: 'Mathematics', day: 'Monday', startTime: '08:00', endTime: '09:30', room: 'Room 101', color: '#6366f1', teacher: 'Dr. Smith' },
  { id: uuidv4(), subject: 'Physics', day: 'Monday', startTime: '10:00', endTime: '11:30', room: 'Lab 201', color: '#ec4899', teacher: 'Prof. Johnson' },
  { id: uuidv4(), subject: 'English Literature', day: 'Tuesday', startTime: '08:00', endTime: '09:30', room: 'Room 305', color: '#f59e0b', teacher: 'Ms. Davis' },
  { id: uuidv4(), subject: 'Chemistry', day: 'Tuesday', startTime: '13:00', endTime: '14:30', room: 'Lab 102', color: '#10b981', teacher: 'Dr. Wilson' },
  { id: uuidv4(), subject: 'History', day: 'Wednesday', startTime: '09:00', endTime: '10:30', room: 'Room 204', color: '#f97316', teacher: 'Mr. Brown' },
  { id: uuidv4(), subject: 'Mathematics', day: 'Wednesday', startTime: '13:00', endTime: '14:30', room: 'Room 101', color: '#6366f1', teacher: 'Dr. Smith' },
  { id: uuidv4(), subject: 'Computer Science', day: 'Thursday', startTime: '08:00', endTime: '09:30', room: 'Lab 301', color: '#3b82f6', teacher: 'Prof. Lee' },
  { id: uuidv4(), subject: 'Physics', day: 'Thursday', startTime: '11:00', endTime: '12:30', room: 'Lab 201', color: '#ec4899', teacher: 'Prof. Johnson' },
  { id: uuidv4(), subject: 'English Literature', day: 'Friday', startTime: '08:00', endTime: '09:30', room: 'Room 305', color: '#f59e0b', teacher: 'Ms. Davis' },
  { id: uuidv4(), subject: 'Computer Science', day: 'Friday', startTime: '14:00', endTime: '15:30', room: 'Lab 301', color: '#3b82f6', teacher: 'Prof. Lee' },
];

const SAMPLE_REMINDERS: Reminder[] = [
  {
    id: uuidv4(),
    title: 'Calculus Exam Tomorrow!',
    description: 'Don\'t forget your exam starts at 9 AM',
    dateTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    isRead: false,
    type: 'Exam',
  },
  {
    id: uuidv4(),
    title: 'Submit Group Project',
    description: 'Final submission deadline for Software Engineering project',
    dateTime: new Date(Date.now() + 1 * 86400000).toISOString(),
    isRead: false,
    type: 'Event',
  },
  {
    id: uuidv4(),
    title: 'Study Group Meeting',
    description: 'Meet with classmates at the library for Physics review',
    dateTime: new Date(Date.now() + 2 * 86400000).toISOString(),
    isRead: true,
    type: 'Custom',
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('slm-darkmode');
    return saved ? JSON.parse(saved) : false;
  });
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('slm-tasks');
    return saved ? JSON.parse(saved) : SAMPLE_TASKS;
  });
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('slm-schedule');
    return saved ? JSON.parse(saved) : SAMPLE_SCHEDULE;
  });
  const [reminders, setReminders] = useState<Reminder[]>(() => {
    const saved = localStorage.getItem('slm-reminders');
    return saved ? JSON.parse(saved) : SAMPLE_REMINDERS;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNotifications, setActiveNotifications] = useState<Reminder[]>([]);
  const [notifiedIds, setNotifiedIds] = useState<Set<string>>(new Set());

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('slm-darkmode', JSON.stringify(darkMode)); }, [darkMode]);
  useEffect(() => { localStorage.setItem('slm-tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('slm-schedule', JSON.stringify(scheduleItems)); }, [scheduleItems]);
  useEffect(() => { localStorage.setItem('slm-reminders', JSON.stringify(reminders)); }, [reminders]);

  // Check reminders every minute
  useEffect(() => {
    const check = () => {
      const now = new Date();
      reminders.forEach(r => {
        if (!r.isRead && !notifiedIds.has(r.id)) {
          const diff = new Date(r.dateTime).getTime() - now.getTime();
          if (diff <= 86400000 && diff > 0) {
            setActiveNotifications(prev => {
              if (prev.find(n => n.id === r.id)) return prev;
              return [...prev, r];
            });
            setNotifiedIds(prev => new Set([...prev, r.id]));
          }
        }
      });
    };
    check();
    const interval = setInterval(check, 60000);
    return () => clearInterval(interval);
  }, [reminders, notifiedIds]);

  const toggleDarkMode = useCallback(() => setDarkMode((p: boolean) => !p), []);

  // Tasks
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    setTasks(prev => [...prev, { ...task, id: uuidv4(), createdAt: new Date().toISOString() }]);
  }, []);
  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);
  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);
  const toggleTaskComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  }, []);

  // Schedule
  const addScheduleItem = useCallback((item: Omit<ScheduleItem, 'id'>) => {
    setScheduleItems(prev => [...prev, { ...item, id: uuidv4() }]);
  }, []);
  const updateScheduleItem = useCallback((id: string, updates: Partial<ScheduleItem>) => {
    setScheduleItems(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);
  const deleteScheduleItem = useCallback((id: string) => {
    setScheduleItems(prev => prev.filter(s => s.id !== id));
  }, []);

  // Reminders
  const addReminder = useCallback((reminder: Omit<Reminder, 'id'>) => {
    setReminders(prev => [...prev, { ...reminder, id: uuidv4() }]);
  }, []);
  const updateReminder = useCallback((id: string, updates: Partial<Reminder>) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);
  const deleteReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);
  const markReminderRead = useCallback((id: string) => {
    setReminders(prev => prev.map(r => r.id === id ? { ...r, isRead: true } : r));
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const dismissNotification = useCallback((id: string) => {
    setActiveNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      darkMode, toggleDarkMode,
      activePage, setActivePage,
      tasks, addTask, updateTask, deleteTask, toggleTaskComplete,
      scheduleItems, addScheduleItem, updateScheduleItem, deleteScheduleItem,
      reminders, addReminder, updateReminder, deleteReminder, markReminderRead,
      searchQuery, setSearchQuery,
      activeNotifications, dismissNotification,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
