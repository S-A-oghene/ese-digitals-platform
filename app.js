document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('engineForm');
  if (!form) return;

  const message = document.getElementById('formMessage');
  const result = document.getElementById('result');
  const resultSummary = document.getElementById('resultSummary');
  const resultsList = document.getElementById('resultsList');
  const reviewSummary = document.getElementById('reviewSummary');
  const submitButton = form.querySelector('button[type="submit"]');

  const addText = (parent, label, value) => {
    const wrapper = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    wrapper.appendChild(strong);
    wrapper.appendChild(document.createTextNode(value ?? '—'));
    parent.appendChild(wrapper);
  };

  const renderResults = (payload) => {
    resultsList.replaceChildren();
    const items = Array.isArray(payload.results) ? payload.results : [];

    if (!items.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No eligible ranked opportunities were returned for this search.';
      resultsList.appendChild(empty);
      return;
    }

    items.forEach((item, index) => {
      const card = document.createElement('article');
      card.className = 'card';

      const heading = document.createElement('h3');
      heading.textContent = `${index + 1}. ${item.title || 'Untitled opportunity'}`;
      card.appendChild(heading);

      addText(card, 'Company', item.company);
      addText(card, 'Location', item.location);
      addText(card, 'Remote', item.remoteType);
      addText(card, 'Employment', item.employmentType);
      addText(card, 'Eligibility', item.eligibilityStatus);
      addText(card, 'Freshness', item.freshnessStatus);
      addText(card, 'Verification', item.verificationStatus);
      addText(card, 'Match score', typeof item.matchScore === 'number' ? String(item.matchScore) : '—');

      if (item.salary && (item.salary.min != null || item.salary.max != null)) {
        const min = item.salary.min ?? '—';
        const max = item.salary.max ?? '—';
        addText(card, 'Salary', `${min} – ${max} ${item.salary.currency || ''}`.trim());
      }

      if (item.description) {
        const description = document.createElement('p');
        description.textContent = item.description.length > 420
          ? `${item.description.slice(0, 417)}…`
          : item.description;
        card.appendChild(description);
      }

      if (item.applicationUrl) {
        const apply = document.createElement('a');
        apply.className = 'button';
        apply.href = item.applicationUrl;
        apply.target = '_blank';
        apply.rel = 'noopener noreferrer';
        apply.textContent = 'View opportunity';
        card.appendChild(apply);
      }

      if (item.sourceUrl && item.sourceUrl !== item.applicationUrl) {
        const source = document.createElement('a');
        source.className = 'text-link';
        source.href = item.sourceUrl;
        source.target = '_blank';
        source.rel = 'noopener noreferrer';
        source.textContent = 'View source →';
        card.appendChild(source);
      }

      resultsList.appendChild(card);
    });
  };

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

      const count = Array.isArray(payload.results) ? payload.results.length : 0;
      const reviewCount = Number(payload.reviewRequired || 0);
      message.textContent = count
        ? `${count} ranked opportunity${count === 1 ? '' : 'ies'} returned by the canonical engine.`
        : 'The engine completed the search but returned no eligible ranked opportunities.';

      resultSummary.textContent = payload.counts
        ? `Discovered ${payload.counts.discovered ?? 0}; normalized ${payload.counts.normalized ?? 0}; eligible ${payload.counts.eligible ?? 0}; returned ${payload.counts.returned ?? 0}.`
        : '';
      reviewSummary.textContent = reviewCount
        ? `${reviewCount} candidate${reviewCount === 1 ? '' : 's'} require downstream review and were not presented as eligible ranked results.`
        : 'No additional review-only candidates were reported.';
      renderResults(payload);
      result.hidden = false;
    } catch (error) {
      message.textContent = 'The Opportunity Engine is temporarily unavailable. Please try again.';
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
});
