export function loadTasks() {
  const all = JSON.parse(localStorage.getItem('tasks') || '[]');
  const today = new Date().toISOString().slice(0,10);
  
  // Filtra tarefas pontuais de dias anteriores
  const filtered = all.filter(t => {
    // Mantém tarefas semanais
    if (t.type === 'weekly') return true;
    
    // Para tarefas do tipo 'once', verifica se é de hoje
    return t.date === today;
  });
  
  if (filtered.length !== all.length) {
    localStorage.setItem('tasks', JSON.stringify(filtered));
  }
  
  return filtered;
}
  export function saveTasks(tasks) {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }
  