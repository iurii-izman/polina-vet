(function () {
  const allowed = new Set([
    'contact_click',
    'map_open',
    'urgent_open',
    'domain_select',
    'knowledge_open',
    'language_switch',
    'outbound_social',
    'useful_next_step',
  ]);
  const configured = document.documentElement.dataset.analyticsDomain;
  if (!configured || document.documentElement.dataset.analyticsEnabled !== 'true') return;
  const send = (event, props) => {
    if (!allowed.has(event)) return;
    try {
      window.plausible?.(event, { props });
    } catch (_) {}
  };
  window.__POLINA_ANALYTICS__ = { track: send };
  document.addEventListener(
    'click',
    (e) => {
      const link = e.target.closest?.('[data-analytics-event]');
      if (!link) return;
      const props = {};
      for (const name of ['channel', 'domain', 'locale', 'surface', 'kind', 'from', 'to']) {
        const value = link.dataset['analytics' + name[0].toUpperCase() + name.slice(1)];
        if (value) props[name] = value;
      }
      send(link.dataset.analyticsEvent, props);
    },
    { passive: true },
  );
})();
