(() => {
  const grid = document.getElementById('project-grid');
  if (!grid) return;

  const escapeHtml = (value = '') => value.replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const mediaMarkup = (project) => {
    const src = escapeHtml(project.media?.src || '');
    const title = escapeHtml(project.title);
    if (project.media?.type === 'video') {
      return `<video muted loop autoplay playsinline preload="metadata" aria-label="${title} preview"><source src="${src}" type="video/mp4"></video>`;
    }
    return `<img src="${src}" alt="${title} preview" loading="lazy">`;
  };

  fetch('data/projects.json')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((projects) => {
      grid.innerHTML = projects.map((project, index) => `
        <a class="project-card reveal" data-delay="${index % 3}" href="project.html?id=${encodeURIComponent(project.id)}" aria-label="Open ${escapeHtml(project.title)} project">
          <div class="project-media">
            ${mediaMarkup(project)}
            <span class="project-number">${String(index + 1).padStart(2, '0')}</span>
          </div>
          <div class="project-body">
            <div class="project-topline">
              <span class="project-chip">${escapeHtml(project.meta?.engine || '')}</span>
              ${project.meta?.platform ? `<span class="project-chip">${escapeHtml(project.meta.platform)}</span>` : ''}
            </div>
            <h3>${escapeHtml(project.title)}</h3>
            <p>${escapeHtml(project.description)}</p>
            <div class="project-card-footer">
              <span>${escapeHtml(project.meta?.timeFrame || '')} · Team ${escapeHtml(project.meta?.teamSize || '')}</span>
              <span aria-hidden="true">↗</span>
            </div>
          </div>
        </a>`).join('');

      requestAnimationFrame(() => {
        grid.querySelectorAll('.reveal').forEach((node) => node.classList.add('is-visible'));
      });
    })
    .catch((error) => {
      console.error(error);
      grid.innerHTML = '<p class="notice">Projects could not be loaded. Please refresh the page or open the site through a web server.</p>';
    });
})();
