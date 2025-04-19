// js/importExport.js
import { saveTasks } from './storage.js';

/**
 * Registra listeners nos botões #export, #import-btn e #import-file.
 * @param {Array} tasks        – referência ao array em memória
 * @param {Function} onUpdate  – callback → chamada depois de importar (para re‑render)
 */
export function initImportExport(tasks, onUpdate) {
  const btnExport = document.getElementById('export');
  const btnImport = document.getElementById('import-btn');
  const inputFile = document.getElementById('import-file');

  if (!btnExport || !btnImport || !inputFile) {
    console.warn('Import/Export: elementos não encontrados');
    return;
  }

  // ---------- EXPORT ----------
  btnExport.addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(tasks, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = 'tasks.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // ---------- IMPORT ----------
  btnImport.addEventListener('click', () => inputFile.click());

  inputFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (!Array.isArray(imported)) throw new Error('JSON não é um array');
        // substitui conteúdo mantendo a mesma referência (importante!)
        tasks.length = 0;
        tasks.push(...imported);
        saveTasks(tasks);
        onUpdate();
        alert('Tarefas importadas com sucesso!');
      } catch (err) {
        alert('Falha ao importar: ' + err.message);
      }
    };
    reader.readAsText(file);
    // reseta input para permitir importar o mesmo arquivo novamente se quiser
    e.target.value = '';
  });
}
