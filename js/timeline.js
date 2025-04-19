export function updateLine() {
    const now = new Date();
    const m = now.getHours() * 60 + now.getMinutes();
    const line = document.getElementById('now-line');
    const label = document.getElementById('now-label');
    label.textContent = now.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    let top = 0;
    document.querySelectorAll('#task-list .task-item').forEach(c => {
      const [h, m2] = c.querySelector('.time').textContent.split(':').map(Number);
      if (m >= h * 60 + m2) top = c.offsetTop + c.offsetHeight/2;
    });
    line.style.top = top + 'px';
    label.style.top = top + 'px';
  }
  export function startLineInterval() {
    setInterval(updateLine, 60000);
  }