// js/wallpaper.js
const { getWallpaper, setWallpaper } = require('wallpaper');
export function initWallpaperInteractivity() {
    window.addEventListener('mousemove', (e) => {
      const x = e.clientX;
      const y = e.clientY;
      
      // Efeito de parallax ou resposta a movimento
      document.querySelectorAll('.parallax-element').forEach(el => {
        const speed = parseFloat(el.dataset.speed) || 1;
        el.style.transform = `translate(${x * speed / 100}px, ${y * speed / 100}px)`;
      });
    });
  }
  
  // Efeito de ondulação quando uma tarefa é adicionada
  export function createRippleEffect(position) {
    const ripple = document.createElement('div');
    ripple.className = 'ripple-effect';
    ripple.style.left = `${position.x}px`;
    ripple.style.top = `${position.y}px`;
    
    document.querySelector('.wallpaper-container').appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 2000);
  }
  
  // Efeito quando uma tarefa é concluída
  export function createFireworkEffect(position) {
    // Implementação do efeito de fogos
    const container = document.querySelector('.wallpaper-container');
    
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.className = 'firework-particle';
      particle.style.left = `${position.x}px`;
      particle.style.top = `${position.y}px`;
      
      // Movimento aleatório
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 100 + 50;
      const duration = Math.random() * 1000 + 1000;
      
      particle.style.animation = `firework ${duration}ms forwards`;
      particle.style.setProperty('--angle', angle);
      particle.style.setProperty('--distance', `${distance}px`);
      
      container.appendChild(particle);
      
      setTimeout(() => {
        particle.remove();
      }, duration);
    }
  }
  
  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    initWallpaperInteractivity();
    
    // Comunicação com a janela principal
    window.addEventListener('message', (event) => {
      const { type, data } = event.data;
      
      if (type === 'task-added') {
        createRippleEffect(data.position);
      } else if (type === 'task-completed') {
        createFireworkEffect(data.position);
      }
    });
  });