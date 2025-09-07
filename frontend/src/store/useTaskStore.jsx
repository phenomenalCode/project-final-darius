import { create } from 'zustand';

const load = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const save = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const useTaskStore = create((set, get) => ({

  /* ---------- STATE ---------- */
  tasks: load('tasks'),
  projects: load('projects'),

  /* ---------- TASK ACTIONS ---------- */
  addTask: (task) => {
    const newTask = {
      id: Date.now(),
      title: task.title || task.task || 'Untitled Task',
      category: task.category || '',
      projectId: task.projectId || null,
      files: task.files || [],
      folders: task.folders || [],
      completed: false,
      createdAt: new Date().toISOString(),
      dueDate: task.dueDate || null,
    };

    const tasks = [...get().tasks, newTask];
    save('tasks', tasks);
    set({ tasks });

    if (newTask.projectId) get().updateProjectCompletion(newTask.projectId);
  },

  deleteTask: (id) => {
    const tasks = get().tasks.filter(t => t.id !== id);
    save('tasks', tasks);
    set({ tasks });
  },

  toggleTaskCompletion: (id) => {
    const tasks = get().tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    save('tasks', tasks);
    set({ tasks });

    const task = tasks.find(t => t.id === id);
    if (task?.projectId) get().updateProjectCompletion(task.projectId);
  },

  completeAllTasks: () => {
    const tasks = get().tasks.map(t => ({ ...t, completed: true }));
    save('tasks', tasks);
    set({ tasks });

    [...new Set(tasks.map(t => t.projectId).filter(Boolean))]
      .forEach(pid => get().updateProjectCompletion(pid));
  },

  /* ---------- TASK QUERIES ---------- */
  filterTasks: (status = 'all', afterDate = null) => {
    let filtered = get().tasks;

    if (status === 'completed') filtered = filtered.filter(t => t.completed);
    if (status === 'uncompleted') filtered = filtered.filter(t => !t.completed);

    if (afterDate) {
      const after = new Date(afterDate);
      filtered = filtered.filter(t => new Date(t.createdAt) > after);
    }

    return filtered;
  },

  /* ---------- PROJECT ACTIONS ---------- */
  addProject: (project) => {
    const newProject = {
      id: project.id || Date.now(),
      name: project.name || 'Untitled Project',
      completed: project.completed || false,
    };
    const projects = [...get().projects, newProject];
    save('projects', projects);
    set({ projects });
  },

  deleteProject: (projectId) => {
    const projects = get().projects.filter(p => p.id !== projectId);
    save('projects', projects);
    set({ projects });

    const tasks = get().tasks.map(t =>
      t.projectId === projectId ? { ...t, projectId: null } : t
    );
    save('tasks', tasks);
    set({ tasks });
  },

  updateProjectCompletion: (projectId) => {
    if (!projectId) return;
    const tasks = get().tasks.filter(t => t.projectId === projectId);
    const allComplete = tasks.length > 0 && tasks.every(t => t.completed);

    const projects = get().projects.map(p =>
      p.id === projectId ? { ...p, completed: allComplete } : p
    );
    save('projects', projects);
    set({ projects });
  },

  /* ---------- HELPERS ---------- */
  isOverdue: (task) =>
    !!task.dueDate && !task.completed && new Date(task.dueDate) < new Date(),

}));
