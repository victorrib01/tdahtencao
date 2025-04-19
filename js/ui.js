import { openEditModal } from './modal.js';
import { scheduleNotifications } from './notifications.js';
import { startPomodoro } from './pomodoro.js';
import { updateLine } from './timeline.js';

/*
 * ui.js – navegação e renderização da lista
 * ======================================== */

export function initNav(days, currentDay, onChange) {
  const nav = document.getElementById('day-nav');
  if (!nav) {
    console.warn('initNav: #day-nav not found');
    return;
  }
  nav.innerHTML = '';
  days.forEach((d, i) => {
    const btn = document.createElement('button');
    btn.textContent = d.charAt(0).toUpperCase() + d.slice(1);
    btn.classList.toggle('active', i === currentDay);
    btn.addEventListener('click', () => onChange(i));
    nav.appendChild(btn);
  });
}

export function render(tasks, currentDay, days) {
  // recria abas mantendo callback
  initNav(days, currentDay, idx => render(tasks, idx, days));

  const list = document.getElementById('task-list');
  if (!list) {
    console.warn('render: #task-list not found');
    return;
  }
  list.innerHTML = '';

  const todayISO   = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks
    .filter(t => (t.type === 'weekly' && t.day  === days[currentDay]) ||
                 (t.type === 'once'   && t.date === todayISO))
    .sort((a, b) => a.time.localeCompare(b.time));

  todayTasks.forEach(t => {
    const li = document.createElement('li');
    li.className = 'task-item';
    li.innerHTML = `
      <div class="task-info">
        <input type="checkbox" class="task-check">
        <div class="time">${t.time}</div>
        <div class="desc">${t.desc}</div>
      </div>
      <button class="edit-btn" title="Editar">✏️</button>
    `;

    // Pomodoro ao clicar na hora
    li.querySelector('.time')?.addEventListener('click', () => startPomodoro(t));

    // Editar tarefa
    li.querySelector('.edit-btn')?.addEventListener('click', () => openEditModal(t));

    // Marcação de concluído (checkbox)
    li.querySelector('.task-check').addEventListener('change', e => {
      li.classList.toggle('done', e.target.checked);
    });

    list.appendChild(li);

    // animação
    li.getBoundingClientRect();
    li.classList.add('animate');
    li.classList.add(t.type === 'once' ? 'once' : 'weekly');
  });

  updateLine();
  scheduleNotifications(todayTasks);
}
