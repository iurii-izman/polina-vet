(() => {
  const form = document.querySelector('#intake-form');
  if (!(form instanceof HTMLFormElement) || form.dataset.intakeBound === 'true') return;

  form.dataset.intakeBound = 'true';

  const status = document.querySelector('#intake-status');
  const submitButton = form.querySelector('button[type="submit"]');
  const api = form.dataset.api;
  const invalidMessage = form.dataset.invalid || 'Проверьте поля.';
  const failedMessage = form.dataset.failed || 'Не удалось отправить обращение.';
  const successMessage = form.dataset.success || 'Обращение получено.';
  const referenceMessage = form.dataset.reference || 'Номер обращения';
  let idempotencyKey = createIdempotencyKey();
  let submitting = false;

  function createIdempotencyKey() {
    const randomUuid = globalThis.crypto?.randomUUID?.();
    if (randomUuid) return `web-${randomUuid}`;
    const bytes = new Uint8Array(16);
    globalThis.crypto?.getRandomValues?.(bytes);
    const fallback = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
    return `web-${fallback}-${Date.now()}`;
  }

  function setSubmitting(value) {
    submitting = value;
    if (submitButton instanceof HTMLButtonElement) submitButton.disabled = value;
    form.setAttribute('aria-busy', String(value));
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!(status instanceof HTMLElement) || !api || submitting || !form.reportValidity()) return;

    status.textContent = '';
    setSubmitting(true);

    const data = Object.fromEntries(new FormData(form).entries());
    const turnstile = form.querySelector('[name="cf-turnstile-response"]');
    data.locale = form.dataset.locale || 'ru';
    data.privacyNoticeVersion = form.dataset.privacyNoticeVersion || '';
    data.privacyAcknowledged = data.privacyAcknowledged === 'on';
    if (data.affectedCount) data.affectedCount = Number(data.affectedCount);
    else delete data.affectedCount;
    data.turnstileToken = turnstile instanceof HTMLInputElement ? turnstile.value : '';
    delete data['cf-turnstile-response'];
    delete data.website;

    try {
      const response = await fetch(`${api.replace(/\/$/, '')}/api/intake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Idempotency-Key': idempotencyKey },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        status.textContent = result.error || invalidMessage;
        return;
      }
      status.innerHTML = `<strong>${successMessage}</strong><br>${referenceMessage}: <span>${String(result.public_ref || '').replace(/[&<>"']/g, '')}</span>`;
      form.reset();
      idempotencyKey = createIdempotencyKey();
    } catch {
      status.textContent = failedMessage;
    } finally {
      setSubmitting(false);
    }
  });

  const updateDomain = () => {
    const farm = form.querySelector('[name="domain"]:checked')?.value === 'FARM';
    form.querySelectorAll('.farm-only').forEach((element) => {
      element.hidden = !farm;
    });
    form.querySelectorAll('#species option, #reason option').forEach((option) => {
      option.hidden = farm ? option.dataset.farm !== 'true' : option.dataset.pet !== 'true';
    });
    const species = form.querySelector('#species');
    const reason = form.querySelector('#reason');
    if (species?.selectedOptions[0]?.hidden) species.selectedIndex = 0;
    if (reason?.selectedOptions[0]?.hidden) reason.selectedIndex = 0;
  };

  form.querySelectorAll('[name="domain"]').forEach((element) => {
    element.addEventListener('change', updateDomain);
  });
  updateDomain();
})();
