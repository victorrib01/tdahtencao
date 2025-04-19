export let pomInterval;
export function startPomodoro(task) {
  clearTimeout(pomInterval);
  const overlay = document.getElementById('focus-overlay');
  const title = document.getElementById('focus-title');
  const timer = document.getElementById('focus-timer');
  title.textContent = 'Foco: ' + task.desc;
  overlay.style.display = 'flex';
  if ('speechSynthesis' in window) {
    speechSynthesis.speak(new SpeechSynthesisUtterance('Iniciando Pomo doro: ' + task.desc));
  }
  let seconds = 25 * 60;
  function tick() {
    const mins = String(Math.floor(seconds/60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timer.textContent = `${mins}:${secs}`;
    if (seconds-- > 0) {
      pomInterval = setTimeout(tick, 1000);
    } else {
      speechSynthesis.speak(new SpeechSynthesisUtterance('Pomodoro encerrado. Pausa de 5 minutos'));
      seconds = 5 * 60;
      tick();
    }
  }
  tick();
  document.getElementById('stop-focus').addEventListener('click', () => {
    clearTimeout(pomInterval);
    overlay.style.display = 'none';
  });
}