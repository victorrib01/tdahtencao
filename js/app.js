// app.js (module principal)
import { initNav, render } from './ui.js';
import { loadTasks, saveTasks } from './storage.js';
import { registerSW } from './sw-register.js';
import { initModal } from './modal.js';
import './notifications.js';
import './pomodoro.js';
import { startLineInterval } from './timeline.js';
import { initImportExport } from './importExport.js';
import { initTheme } from './theme.js';

// Dias da semana
const days = ['domingo','segunda','terca','quarta','quinta','sexta','sabado'];

/**
 * Aguarda até que um elemento com determinado id exista no DOM.
 * Retorna uma Promise resolvida com o elemento.
 */
function waitForElement(id) {
  return new Promise(resolve => {
    const el = document.getElementById(id);
    if (el) return resolve(el);
    const obs = new MutationObserver(() => {
      const node = document.getElementById(id);
      if (node) { obs.disconnect(); resolve(node); }
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  });
}

async function main() {
  initTheme()
  // Garante que nav e lista estão presentes (evita erro "not found")
  await Promise.all([waitForElement('day-nav'), waitForElement('task-list')]);

  let tasks = loadTasks();
  let currentDay = new Date().getDay();

  // Nav dinâmico
  initNav(days, currentDay, idx => {
    currentDay = idx;
    render(tasks, currentDay, days);
  });

  // Modal de nova tarefa
  initModal(newTask => {
    tasks.push(newTask);
    saveTasks(tasks);
    render(tasks, currentDay, days);
  });

  initImportExport(tasks, () => render(tasks, currentDay, days));

  // SW, render inicial, linha do tempo
  registerSW();
  render(tasks, currentDay, days);
  startLineInterval();
  document.addEventListener('tasks-updated', () => {
    render(tasks, currentDay, days);
  });
}

document.addEventListener('DOMContentLoaded', main);

