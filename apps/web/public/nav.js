document.querySelectorAll('[data-language-menu], [data-mobile-nav]').forEach((menu) => {
  const summary = menu.querySelector('summary');
  const syncExpanded = () => summary?.setAttribute('aria-expanded', String(menu.open));

  menu.addEventListener('toggle', syncExpanded);
  syncExpanded();
  menu.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !menu.open) return;
    event.preventDefault();
    menu.open = false;
    summary?.focus();
  });
});

document.querySelectorAll('[data-print], [data-print-checklist]').forEach((button) => {
  button.addEventListener('click', () => window.print());
});
