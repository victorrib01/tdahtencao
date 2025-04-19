// modal.js — adiciona & edita tarefas sem criar duplicados
import { saveTasks } from './storage.js';
import { render }   from './ui.js';          // circular, mas ok em ES modules (late binding)

let addSubmitHandler;    // manter referência para poder remover/reativar

export function initModal(onAdd) {
  const modal     = document.getElementById('modal');
  const form      = document.getElementById('task-form');
  const btnOpen   = document.getElementById('open-modal');
  const btnCancel = document.getElementById('cancel');

  if (!modal || !form || !btnOpen || !btnCancel) {
    console.warn('initModal: elementos não encontrados');
    return;
  }

  // ---------- ADIÇÃO ----------
  addSubmitHandler = e => {
    e.preventDefault();
    const newTask = collectFormData(form);
    onAdd(newTask);                     // push e render vem do app.js
    form.reset();                       // limpa
    modal.style.display = 'none';
  };
  form.addEventListener('submit', addSubmitHandler);

  btnOpen.addEventListener('click', () => {
    form.reset();                       // limpa campos
    form['task-type'].value = 'weekly'; // default
    modal.style.display = 'flex';
    form['task-day'].focus();
  });

  btnCancel.addEventListener('click', () => {
    modal.style.display = 'none';
  });
}

// ---------- EDIÇÃO ----------
export function openEditModal(task) {
  const modal = document.getElementById('modal');
  const form  = document.getElementById('task-form');

  // remove listener de ADD para evitar duplicidade
  form.removeEventListener('submit', addSubmitHandler);

  // pré‑preenche campos
  form['task-day'].value  = task.day  || 'segunda';
  form['task-time'].value = task.time;
  form['task-desc'].value = task.desc;
  form['task-type'].value = task.type || 'weekly';

  // novo handler só para esta edição
  function saveEdit(e) {
    e.preventDefault();

    const data = collectFormData(form);
    Object.assign(task, data);          // muta objeto original

    saveTasks(JSON.parse(localStorage.getItem('tasks'))); // persiste
    modal.style.display = 'none';

    // volta handler de add
    form.removeEventListener('submit', saveEdit);
    form.addEventListener('submit', addSubmitHandler);

    // re-render (via evento custom ou módulo importado tardiamente)
    document.dispatchEvent(new Event('tasks-updated'));
  }

  form.addEventListener('submit', saveEdit);
  modal.style.display = 'flex';
}

// util
function collectFormData(form) {
  const type = form['task-type'].value;
  return {
    day:  type === 'weekly' ? form['task-day'].value : undefined,
    date: type === 'once'   ? new Date().toISOString().slice(0,10) : undefined,
    time: form['task-time'].value,
    desc: form['task-desc'].value,
    type
  };
}
