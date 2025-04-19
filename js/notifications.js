export function scheduleNotifications(tasks) {
    if (!('Notification' in window)) return;
    Notification.requestPermission();
    tasks.forEach(t => {
      const [h, m] = t.time.split(':').map(Number);
      const notifyTime = new Date();
      notifyTime.setHours(h, m, 0, 0);
      const delay = notifyTime - new Date();
      if (delay > 0) setTimeout(() => new Notification('Hora de: ' + t.desc), delay);
    });
  }