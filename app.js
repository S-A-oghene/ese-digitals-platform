document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('engineForm');
  if (!form) return;

  const roleInput = document.getElementById('role');
  const countryInput = document.getElementById('country');
  const skillPreset = document.getElementById('skillPreset');
  const addPresetSkill = document.getElementById('addPresetSkill');
  const customSkill = document.getElementById('customSkill');
  const addCustomSkill = document.getElementById('addCustomSkill');
  const selectedSkills = document.getElementById('selectedSkills');
  const remoteInput = document.getElementById('remote');
  const worldwideInput = document.getElementById('worldwide');
  const message = document.getElementById('formMessage');
  const result = document.getElementById('result');
  const resultSummary = document.getElementById('resultSummary');
  const resultsList = document.getElementById('resultsList');
  const reviewSummary = document.getElementById('reviewSummary');
  const submitButton = form.querySelector('button[type="submit"]');

  const state = { skills: [] };

  const addText = (parent, label, value) => {
    const wrapper = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    wrapper.appendChild(strong);
    wrapper.appendChild(document.createTextNode(value ?? '—'));
    parent.appendChild(wrapper);
  };

  const normaliseSkill = (value) => String(value || '').trim().replace(/\s+/g, ' ');

  const renderSelectedSkills = () => {
    selectedSkills.replaceChildren();
    state.skills.forEach((skill) => {
      const chip = document.createElement('span');
      chip.className = 'skill-chip';
      chip.textContent = skill;

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', `Remove ${skill}`);
      remove.textContent = '×';
      remove.addEventListener('click', () => {
        state.skills = state.skills.filter((item) => item !== skill);
        renderSelectedSkills();
      });

      chip.appendChild(remove);
      selectedSkills.appendChild(chip);
    });
  };

  const addSkill = (value) => {
    const skill = normaliseSkill(value);
    if (!skill) return false;
    if (!state.skills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      state.skills.push(skill);
      renderSelectedSkills();
    }
    return true;
  };

  addPresetSkill?.addEventListener('click', () => {
    if (!skillPreset?.value) return;
    addSkill(skillPreset.value);
    skillPreset.value = '';
  });

  addCustomSkill?.addEventListener('click', () => {
    if (addSkill(customSkill?.value)) customSkill.value = '';
  });

  customSkill?.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    if (addSkill(customSkill.value)) customSkill.value = '';
  });

  const formatFailure = (payload, response) => {
    const diagnostic = payload?.diagnostic;
    if (diagnostic?.reason) {
      return `${payload.error || 'Opportunity Engine error'} — ${diagnostic.reason}`;
    }
    if (diagnostic?.upstreamStatus || diagnostic?.responseKind) {
      return `${payload.error || 'Opportunity Engine error'} — upstream ${diagnostic.upstreamStatus ?? 'unknown'} (${diagnostic.responseKind ?? 'unknown'})`;
    }
    if (payload?.error) {
      return `${payload.error}${response?.status ? ` (HTTP ${response.status})` : ''}`;
    }
    return 'The Opportunity Engine could not complete this search.';
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
      if (item.sourceName) addText(card, 'Source', item.sourceName);

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

    const role = roleInput.value.trim();
    const country = countryInput.value.trim();
    const remote = remoteInput.value;
    const worldwide = worldwideInput.value === 'yes';

    if (!role && state.skills.length === 0) {
      message.textContent = 'Enter a role or add at least one skill / keyword.';
      result.hidden = true;
      return;
    }

    const request = {
      role,
      country,
      skills: [...state.skills],
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
        message.textContent = formatFailure(payload, response);
        return;
      }

      const count = Array.isArray(payload.results) ? payload.results.length : 0;
      const reviewCount = Number(payload.reviewRequired || 0);
      message.textContent = count
        ? `${count} ranked opportunit${count === 1 ? 'y' : 'ies'} returned by the canonical engine.`
        : 'The engine completed the search but returned no eligible ranked opportunities.';

      resultSummary.textContent = payload.counts
        ? `Eligible ${payload.counts.eligible ?? 0}; returned ${payload.counts.returned ?? count}.`
        : `Returned ${count} eligible ranked opportunit${count === 1 ? 'y' : 'ies'}.`;
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

  renderSelectedSkills();
});
