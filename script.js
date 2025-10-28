/* === Поведение: тема, мобильное меню, скролл-спай, форма === */
(function () {
  const root = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.getElementById('nav-list');
  const copyBtn = document.getElementById('copyEmail');
  const year = document.getElementById('year');
  const statusEl = document.getElementById('status');
  const form = document.getElementById('contactForm');

  // Год в подвале (исправлено: добавлена проверка на существование узла)
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Тема
  function setTheme(mode) {
    root.setAttribute('data-theme', mode);
    try { localStorage.setItem('theme', mode); } catch {}
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const saved = (() => { try { return localStorage.getItem('theme'); } catch { return null; } })();
  setTheme(saved || (prefersDark ? 'dark' : 'light'));
  themeToggle?.addEventListener('click', () => {
    const current = root.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });

  // Мобильное меню
  if (navToggle) {
    navToggle.addEventListener('click', () => {
      const expanded = nav.getAttribute('aria-expanded') === 'true';
      nav.setAttribute('aria-expanded', String(!expanded));
      navToggle.setAttribute('aria-expanded', String(!expanded));
    });
    navList?.addEventListener('click', (e) => {
      if (e.target.matches('a[href^="#"]')) {
        nav.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Scroll-spy: подсветка текущего пункта меню
  const sections = Array.from(document.querySelectorAll('main section[id]'));
  const links = Array.from(document.querySelectorAll('.site-nav a[href^="#"]'));
  const map = new Map(sections.map(s => [s.id, links.find(a => a.getAttribute('href') === '#' + s.id)]));

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = map.get(entry.target.id);
      if (entry.isIntersecting) {
        links.forEach(a => a.classList.remove('active'));
        link?.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px', threshold: 0.01 });

  sections.forEach(sec => io.observe(sec));

  // Копирование e-mail
  copyBtn?.addEventListener('click', async (e) => {
    const email = e.currentTarget.getAttribute('data-email');
    try {
      await navigator.clipboard.writeText(email);
      if (statusEl) {
        statusEl.textContent = 'E-mail скопирован: ' + email;
        setTimeout(() => (statusEl.textContent = ''), 2500);
      }
    } catch {
      // Фоллбек
      const tmp = document.createElement('input');
      tmp.value = email;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      tmp.remove();
    }
  });

  // Форма: mailto
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = encodeURIComponent(data.get('name') || '');
    const from = encodeURIComponent(data.get('email') || '');
    const msg = encodeURIComponent(data.get('message') || '');
    const to = document.getElementById('emailLink')?.getAttribute('href')?.replace('mailto:', '') || 'example@domain.com';

    const subject = `[Портфолио] Сообщение от ${decodeURIComponent(name)}`;
    const body = `Имя: ${decodeURIComponent(name)}%0AEmail: ${decodeURIComponent(from)}%0A%0A${decodeURIComponent(msg)}`;
    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
