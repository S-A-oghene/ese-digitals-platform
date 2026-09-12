document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('engineForm');
  if (!form) return;

  const message = document.getElementById('formMessage');
  const result = document.getElementById('result');
  const resultText = document.getElementById('resultText');
  const submitButton = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const role = document.getElementById('role').value.trim();
    const country = document.getElementById('country').value.trim();
    const skills = document.getElementById('skills').value
      .split(',')
      .map((skill) => skill.trim())
      .filter(Boolean);
    const remote = document.getElementById('remote').value;
    const worldwide = document.getElementById('worldwide').value === 'yes';

    if (!role && skills.length === 0) {
      message.textContent = 'Enter a role or at least one skill / keyword.';
      result.hidden = true;
      return;
    }

    const request = {
      role,
      country,
      skills,
      remote,
      worldwide,
      allowWorldwide: worldwide,
      limit: 20,
    };

    message.textContent = 'Searching the canonical Opportunity Engine…';
    result.hidden = true;
    if (submitButton) submitButton.disabled = true;

    try {
      const response = await fetch('/api/opportunities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      const payload = await response.json();

      if (!response.ok || payload.ok !== true) {
        message.textContent = payload.error || 'The Opportunity Engine could not complete this search.';
        return;
      }

      const count = payload.results?.length || 0;
      message.textContent = count
        ? `${count} opportunity${count === 1 ? '' : 'ies'} returned by the canonical engine.`
        : 'The engine completed the search but returned no eligible ranked opportunities.';

      resultText.textContent = JSON.stringify(payload, null, 2);
      result.hidden = false;
    } catch (error) {
      message.textContent = 'The Opportunity Engine is temporarily unavailable. Please try again.';
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
