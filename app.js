document.addEventListener('DOMContentLoaded', () => {
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById('engineForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const role = document.getElementById('role').value.trim();
    const country = document.getElementById('country').value.trim();
    const skills = document.getElementById('skills').value.trim();
    const remote = document.getElementById('remote').value;
    const worldwide = document.getElementById('worldwide').value;

    const message = document.getElementById('formMessage');
    const result = document.getElementById('result');
    const resultText = document.getElementById('resultText');

    if (!role) {
      message.textContent = 'Please enter a role.';
      result.hidden = true;
      return;
    }

    const plan = {
      role,
      country,
      targetCountries: country ? [country] : [],
      skills: skills
        ? skills.split(',').map((skill) => skill.trim()).filter(Boolean)
        : [],
      remotePreference: remote,
      worldwideExplicit: worldwide === 'yes',
      eligibilityNote:
        'Eligibility is downstream and is not inferred from remote preference.'
    };

    message.textContent = 'Search plan prepared.';
    resultText.textContent = JSON.stringify(plan, null, 2);
    result.hidden = false;
  });
});
