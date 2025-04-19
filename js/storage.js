export function loadTasks() {
  const all = JSON.parse(localStorage.getItem('tasks') || '[]');
  const today = new Date().toISOString().slice(0,10);
  // filtra tarefas pontuais antigas
  const filtered = all.filter(t => t.type !== 'once' || t.date >= today);
  if (filtered.length !== all.length) localStorage.setItem('tasks', JSON.stringify(filtered));
  return filtered;
}

  
  export function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  