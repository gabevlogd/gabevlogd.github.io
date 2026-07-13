(() => {
  const root = document.getElementById('project-root');
  const loading = document.getElementById('project-loading');
  if (!root || !loading) return;

  const params = new URLSearchParams(window.location.search);
  const bodyProjectId = document.body.dataset.projectId;
  const projectId = bodyProjectId || params.get('id');

  const isMobileDevice = () => {
  const userAgentDataMobile = navigator.userAgentData?.mobile === true;
  const mobileUserAgent = /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const iPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  const coarsePointerDevice = window.matchMedia('(max-width: 1024px) and (pointer: coarse)').matches;

  return userAgentDataMobile || mobileUserAgent || iPadDesktopMode || coarsePointerDevice;
};

const renderEmbed = (section) => {
  const src = section.embed?.src;

  if (!src) {
    return '';
  }

  const isUnityWebGL = /play\.unity\.com\/api\/v1\/games\/game\//i.test(src);

  if (isUnityWebGL && isMobileDevice()) {
    return `
      <div class="embed-mobile-notice" role="note">
        <span class="embed-mobile-notice-icon" aria-hidden="true">↗</span>
        <div>
          <strong>WebGL build available on desktop</strong>
          <p>
            The embedded version is disabled on mobile devices to avoid stability
            and memory issues. Open this page from a desktop browser to play it.
            On Android, you can also use the Direct Download button above.
          </p>
        </div>
      </div>
    `;
  }

  return `
    <div class="embed-wrap" style="aspect-ratio:${escapeHtml(section.embed.aspect || '16 / 9')}">
      <iframe
        src="${escapeHtml(src)}"
        title="${escapeHtml(section.embed.title || section.title)}"
        loading="lazy"
        allowfullscreen
      ></iframe>
    </div>
  `;
};

  const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);

  const mediaMarkup = (project) => {
    const src = escapeHtml(project.media?.src || '');
    if (project.media?.type === 'video') {
      return `<video autoplay muted loop playsinline preload="metadata"><source src="${src}" type="video/mp4"></video>`;
    }
    return `<img src="${src}" alt="${escapeHtml(project.title)} project preview">`;
  };

  const renderError = () => {
    loading.hidden = true;
    root.hidden = false;
    root.innerHTML = `<section class="error-panel shell"><div><p class="eyebrow"><span></span>404 / Project</p><h1>Project not found.</h1><p>The requested project does not exist in the portfolio data.</p><a class="button button-primary" href="index.html#projects">Back to projects</a></div></section>`;
  };

  fetch('data/projects.json')
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((projects) => {
      const projectIndex = projects.findIndex((item) => item.id === projectId);
      if (projectIndex < 0) return renderError();
      const project = projects[projectIndex];
      const next = projects[(projectIndex + 1) % projects.length];

      document.title = `${project.title} | Gabriele Garofalo`;
      const description = document.createElement('meta');
      description.name = 'description';
      description.content = project.description;
      document.head.appendChild(description);

      const metaRows = [
        ['Team size', project.meta?.teamSize],
        ['Time frame', project.meta?.timeFrame],
        ['Engine', project.meta?.engine],
        ['Platform', project.meta?.platform]
      ].filter(([, value]) => value);

      const sections = (project.sections || []).map((section, index) => {
        const embed = renderEmbed(section);
        return `
          <section class="project-section">
            <div class="shell project-section-grid">
              <div>
                <span class="project-section-index">${String(index + 1).padStart(2, '0')}</span>
                <h2>${escapeHtml(section.title)}</h2>
              </div>
              <div class="rich-content">${section.html || ''}${embed}</div>
            </div>
          </section>`;
      }).join('');

      root.innerHTML = `
        <article>
          <section class="project-hero">
            <div class="shell">
              <a class="project-breadcrumb" href="index.html#projects">← Back to selected work</a>
              <div class="project-hero-media">
                ${mediaMarkup(project)}
                <div class="project-title-wrap">
                  <p class="project-kicker">Selected project / ${String(projectIndex + 1).padStart(2, '0')}</p>
                  <h1>${escapeHtml(project.title)}</h1>
                  <p class="project-summary">${escapeHtml(project.description)}</p>
                </div>
              </div>
            </div>
          </section>

          <section class="shell project-overview">
            <div class="project-about">
              <p class="section-index">Project overview</p>
              <h2>About</h2>
              <div class="rich-content">${project.aboutHtml || ''}</div>
            </div>
            <aside class="project-meta-card">
              <h2>Project info</h2>
              <dl class="meta-list">
                ${metaRows.map(([label, value]) => `<div class="meta-item"><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}
              </dl>
              ${project.links?.length ? `<div class="project-links">${project.links.map((link, index) => `<a class="button ${index === 0 ? 'button-primary' : 'button-secondary'}" href="${escapeHtml(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.label || 'Open link')} <span aria-hidden="true">↗</span></a>`).join('')}</div>` : ''}
            </aside>
          </section>

          <div class="project-content">${sections}</div>

          <section class="next-project">
            <a class="shell" href="project.html?id=${encodeURIComponent(next.id)}">
              <span>Next project<strong>${escapeHtml(next.title)}</strong></span>
              <i aria-hidden="true">↗</i>
            </a>
          </section>
        </article>`;

      loading.hidden = true;
      root.hidden = false;
    })
    .catch((error) => {
      console.error(error);
      renderError();
    });
})();
