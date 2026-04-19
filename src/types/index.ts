export type TaskCategory = 'Homework' | 'Project' | 'Exam' | 'Other';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate: string;
  completed: boolean;
  createdAt: string;
}

export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ScheduleItem {
  id: string;
  subject: string;
  day: WeekDay;
  startTime: string;
  endTime: string;
  room: string;
  color: string;
  teacher: string;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  taskId?: string;
  isRead: boolean;
  type: 'Task' | 'Exam' | 'Event' | 'Custom';
}

export type ActivePage = 'dashboard' | 'tasks' | 'schedule' | 'reminders';
