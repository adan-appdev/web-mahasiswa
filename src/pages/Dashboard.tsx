import React from 'react';
import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, differenceInDays, parseISO } from 'date-fns';
import {
  RiCheckboxCircleFill, RiTimeLine, RiBookOpenLine,
  RiAlarmLine, RiArrowRightLine, RiFireLine, RiTrophyLine,
} from 'react-icons/ri';
import { useApp } from '../context/AppContext';

const categoryColors: Record<string, string> = {
  Homework: 'bg-blue-100 text-blue-700',
  Project: 'bg-purple-100 text-purple-700',
  Exam: 'bg-red-100 text-red-700',
  Other: 'bg-gray-100 text-gray-700',
};

const getDueDateLabel = (dateStr: string) => {
  const date = parseISO(dateStr);
  if (isToday(date)) return { label: 'Today', cls: 'text-red-500 font-semibold' };
  if (isTomorrow(date)) return { label: 'Tomorrow', cls: 'text-orange-500 font-semibold' };
  const days = differenceInDays(date, new Date());
  if (days < 0) return { label: `${Math.abs(days)}d overdue`, cls: 'text-red-600 font-bold' };
  return { label: `in ${days} days`, cls: 'text-gray-400' };
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

const Dashboard: React.FC = () => {
  const { tasks, scheduleItems, reminders, darkMode, setActivePage } = useApp();

  const todayDay = format(new Date(), 'EEEE');
  const todaySchedule = scheduleItems
    .filter(s => s.day === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);
  const completionRate = tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const urgentTasks = pendingTasks
    .filter(t => {
      const days = differenceInDays(parseISO(t.dueDate), new Date());
      return days <= 2 && days >= 0;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const upcomingTasks = pendingTasks
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  const unreadReminders = reminders.filter(r => !r.isRead);

  const stats = [
    {
      label: 'Pending Tasks',
      value: pendingTasks.length,
      icon: <RiTimeLine size={22} />,
      gradient: 'from-blue-400 to-blue-600',
      bg: darkMode ? 'bg-blue-900/30' : 'bg-blue-50',
    },
    {
      label: 'Completed',
      value: completedTasks.length,
      icon: <RiCheckboxCircleFill size={22} />,
      gradient: 'from-green-400 to-emerald-600',
      bg: darkMode ? 'bg-green-900/30' : 'bg-green-50',
    },
    {
      label: "Today's Classes",
      value: todaySchedule.length,
      icon: <RiBookOpenLine size={22} />,
      gradient: 'from-purple-400 to-indigo-600',
      bg: darkMode ? 'bg-purple-900/30' : 'bg-purple-50',
    },
    {
      label: 'Reminders',
      value: unreadReminders.length,
      icon: <RiAlarmLine size={22} />,
      gradient: 'from-amber-400 to-orange-500',
      bg: darkMode ? 'bg-amber-900/30' : 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 p-6 text-white shadow-lg"
      >
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -right-2 w-24 h-24 rounded-full bg-white/5" />
        <div className="absolute top-4 right-16 w-12 h-12 rounded-full bg-white/10" />
        <div className="relative z-10">
          <p className="text-blue-100 text-sm font-medium">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
          <h2 className="text-2xl font-bold mt-1">Good {getGreeting()}, Student! 👋</h2>
          <p className="text-blue-100 mt-1 text-sm">
            {pendingTasks.length === 0
              ? "You're all caught up! Great job 🎉"
              : `You have ${pendingTasks.length} pending task${pendingTasks.length > 1 ? 's' : ''} to complete.`}
          </p>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-blue-100 mb-1">
              <span>Overall Progress</span>
              <span className="font-bold">{completionRate}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                transition={{ duration: 1.2, delay: 0.4 }}
                className="h-full bg-white rounded-full"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            whileHover={{ y: -3 }}
            className={`${stat.bg} ${darkMode ? 'border-gray-700' : 'border-gray-100'} border rounded-2xl p-4 cursor-default`}
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} text-white flex items-center justify-center mb-3 shadow-md`}>
              {stat.icon}
            </div>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stat.value}</p>
            <p className={`text-xs mt-0.5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.32 }}
          className={`rounded-2xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold text-base ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              📅 Today's Schedule
            </h3>
            <button
              onClick={() => setActivePage('schedule')}
              className="text-blue-500 text-xs flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <RiArrowRightLine size={14} />
            </button>
          </div>
          {todaySchedule.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">🎉</span>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No classes today!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySchedule.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`flex items-center gap-3 p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}
                >
                  <div className="w-1 h-10 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{item.subject}</p>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{item.startTime} – {item.endTime} · {item.room}</p>
                  </div>
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Urgent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={`rounded-2xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`font-semibold text-base flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <RiFireLine className="text-red-500" /> Urgent Tasks
            </h3>
            <button
              onClick={() => setActivePage('tasks')}
              className="text-blue-500 text-xs flex items-center gap-1 hover:gap-2 transition-all"
            >
              View all <RiArrowRightLine size={14} />
            </button>
          </div>
          {urgentTasks.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl">✅</span>
              <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No urgent tasks!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {urgentTasks.map((task, i) => {
                const { label, cls } = getDueDateLabel(task.dueDate);
                return (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${darkMode ? 'bg-gray-700' : 'bg-red-50'}`}
                    style={{ borderLeftColor: task.priority === 'High' ? '#ef4444' : '#f59e0b' }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{task.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${categoryColors[task.category]}`}>
                          {task.category}
                        </span>
                        <span className={`text-xs ${cls}`}>{label}</span>
                      </div>
                    </div>
                    <RiFireLine className="text-red-500" size={16} />
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Upcoming Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.48 }}
        className={`rounded-2xl p-5 border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} shadow-sm`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-semibold text-base flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            <RiTrophyLine className="text-amber-500" /> Upcoming Deadlines
          </h3>
          <button
            onClick={() => setActivePage('tasks')}
            className="text-blue-500 text-xs flex items-center gap-1 hover:gap-2 transition-all"
          >
            View all <RiArrowRightLine size={14} />
          </button>
        </div>
        {upcomingTasks.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-4xl">🎊</span>
            <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No upcoming tasks!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {upcomingTasks.map((task, i) => {
              const { label, cls } = getDueDateLabel(task.dueDate);
              return (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className={`p-3 rounded-xl ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} flex items-start gap-3`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium text-sm truncate ${darkMode ? 'text-white' : 'text-gray-800'}`}>{task.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-medium ${categoryColors[task.category]}`}>
                        {task.category}
                      </span>
                      <span className={`text-xs ${cls}`}>{label}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
