
const KEY   = 'ta-theme';               // 'auto' | 'light' | 'dark'
const btn   = document.getElementById('toggle-dark');
const root  = document.documentElement;

export function initTheme() {
  applyTheme();                         // aplica imediatamente
  btn.addEventListener('click', toggleTheme);
  // se estiver em auto, reavalia a cada 5 min
  setInterval(() => {
    if ((localStorage.getItem(KEY) || 'auto') === 'auto') applyTheme();
  }, 300000);
}

function toggleTheme() {
  const cur  = localStorage.getItem(KEY) || 'auto';
  const next = cur === 'auto'  ? 'dark'
             : cur === 'dark' ? 'light'
             :                 'auto'; // light → auto
  localStorage.setItem(KEY, next);
  applyTheme();
}

function applyTheme() {
  const pref = localStorage.getItem(KEY) || 'auto';
  let dark   = false;

  if (pref === 'dark')      dark = true;
  else if (pref === 'light') dark = false;
  else {
    // --- AUTO ---
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    dark = mq.matches;
    if (!mq.matches) {
      const h = new Date().getHours();
      dark = h >= 18 || h < 6;          // noite = 18‑05h
    }
  }

  root.classList.toggle('dark', dark);

  // --- ícone coerente ---
  if      (pref === 'dark')  btn.textContent = '🌙';
  else if (pref === 'light') btn.textContent = '☀️';
  else                       btn.textContent = '🔄'; // auto
}
