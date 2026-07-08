(() => {
  let projects = [];
  let activeIndex = -1;
  let dirty = false;

  const list = document.getElementById('project-list');
  const form = document.getElementById('project-form');
  const empty = document.getElementById('editor-empty');
  const linksEditor = document.getElementById('links-editor');
  const sectionsEditor = document.getElementById('sections-editor');
  const linkTemplate = document.getElementById('link-template');
  const sectionTemplate = document.getElementById('section-template');
  const status = document.getElementById('save-status');

  const blankProject = () => ({
    id: 'new-project', legacyPage: '', title: 'New Project', description: '',
    media: { type: 'video', src: 'video/' },
    meta: { teamSize: '1', timeFrame: '', engine: '', platform: '' },
    aboutHtml: '<p></p>', links: [], sections: []
  });

  const setStatus = (message, success = false) => {
    status.textContent = message;
    status.classList.toggle('is-success', success);
  };

  const markDirty = () => {
    dirty = true;
    setStatus('Unexported changes are stored only in this browser session.');
  };

  const createToolbar = (toolbar, editor) => {
    if (!toolbar || toolbar.children.length) return;
    const actions = [
      ['B', 'bold', 'Bold'], ['I', 'italic', 'Italic'], ['H3', 'formatBlock', 'Heading'],
      ['• List', 'insertUnorderedList', 'Bullet list'], ['Link', 'createLink', 'Link']
    ];
    actions.forEach(([label, command, title]) => {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = label; button.title = title;
      button.addEventListener('mousedown', (event) => {
        event.preventDefault();
        editor.focus();
        if (command === 'createLink') {
          const url = window.prompt('Link URL:');
          if (url) document.execCommand(command, false, url);
        } else if (command === 'formatBlock') {
          document.execCommand(command, false, 'h3');
        } else {
          document.execCommand(command, false, null);
        }
        markDirty();
      });
      toolbar.appendChild(button);
    });
  };

  const addLinkRow = (link = { label: '', url: '' }) => {
    const node = linkTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('[data-field="label"]').value = link.label || '';
    node.querySelector('[data-field="url"]').value = link.url || '';
    node.querySelector('.remove-button').addEventListener('click', () => { node.remove(); markDirty(); });
    node.querySelectorAll('input').forEach((input) => input.addEventListener('input', markDirty));
    linksEditor.appendChild(node);
  };

  const addSectionRow = (section = { title: '', html: '', embed: null }) => {
    const node = sectionTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector('[data-field="title"]').value = section.title || '';
    const editor = node.querySelector('.section-rich-editor');
    editor.innerHTML = section.html || '';
    const toolbar = node.querySelector('.rich-toolbar');
    createToolbar(toolbar, editor);
    const embed = section.embed || {};
    node.querySelector('[data-field="embedSrc"]').value = embed.src || '';
    node.querySelector('[data-field="embedAspect"]').value = embed.aspect || '';
    node.querySelector('[data-field="embedTitle"]').value = embed.title || '';
    if (embed.src) node.querySelector('details').open = true;

    node.querySelector('[data-action="section-remove"]').addEventListener('click', () => { node.remove(); markDirty(); });
    node.querySelector('[data-action="section-up"]').addEventListener('click', () => {
      const previous = node.previousElementSibling;
      if (previous) sectionsEditor.insertBefore(node, previous);
      markDirty();
    });
    node.querySelector('[data-action="section-down"]').addEventListener('click', () => {
      const next = node.nextElementSibling;
      if (next) sectionsEditor.insertBefore(next, node);
      markDirty();
    });
    node.querySelectorAll('input').forEach((input) => input.addEventListener('input', markDirty));
    editor.addEventListener('input', markDirty);
    sectionsEditor.appendChild(node);
  };

  const renderList = () => {
    list.innerHTML = '';
    projects.forEach((project, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `admin-project-button${index === activeIndex ? ' is-active' : ''}`;
      button.innerHTML = `<strong>${project.title || 'Untitled project'}</strong><small>${project.id || 'no-id'}</small>`;
      button.addEventListener('click', () => {
        if (activeIndex >= 0) applyForm(false);
        activeIndex = index;
        renderList();
        loadForm();
      });
      list.appendChild(button);
    });
  };

  const loadForm = () => {
    const project = projects[activeIndex];
    if (!project) { form.hidden = true; empty.hidden = false; return; }
    empty.hidden = true; form.hidden = false;
    document.getElementById('editor-title').textContent = project.title || 'Edit project';
    const values = {
      title: project.title, id: project.id, description: project.description,
      teamSize: project.meta?.teamSize, timeFrame: project.meta?.timeFrame,
      engine: project.meta?.engine, platform: project.meta?.platform,
      mediaType: project.media?.type || 'video', mediaSrc: project.media?.src || ''
    };
    Object.entries(values).forEach(([name, value]) => {
      const field = form.elements.namedItem(name);
      if (field) field.value = value || '';
    });
    const about = document.getElementById('about-editor');
    about.innerHTML = project.aboutHtml || '';
    createToolbar(document.querySelector('[data-toolbar="about-editor"]'), about);
    linksEditor.innerHTML = '';
    (project.links || []).forEach(addLinkRow);
    sectionsEditor.innerHTML = '';
    (project.sections || []).forEach(addSectionRow);
    setStatus(dirty ? 'Unexported changes are stored only in this browser session.' : 'No unexported changes.');
  };

  const collectLinks = () => [...linksEditor.querySelectorAll('.link-row')].map((row) => ({
    label: row.querySelector('[data-field="label"]').value.trim(),
    url: row.querySelector('[data-field="url"]').value.trim()
  })).filter((link) => link.label || link.url);

  const collectSections = () => [...sectionsEditor.querySelectorAll('.section-editor-item')].map((row) => {
    const section = {
      title: row.querySelector('[data-field="title"]').value.trim(),
      html: row.querySelector('.section-rich-editor').innerHTML.trim()
    };
    const src = row.querySelector('[data-field="embedSrc"]').value.trim();
    if (src) section.embed = {
      type: 'iframe', src,
      aspect: row.querySelector('[data-field="embedAspect"]').value.trim() || '16 / 9',
      title: row.querySelector('[data-field="embedTitle"]').value.trim() || section.title
    };
    return section;
  }).filter((section) => section.title || section.html || section.embed);

  const applyForm = (showConfirmation = true) => {
    if (activeIndex < 0) return false;
    const current = projects[activeIndex];
    const id = form.elements.namedItem('id').value.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    const duplicate = projects.some((project, index) => index !== activeIndex && project.id === id);
    if (!id || duplicate) {
      window.alert(!id ? 'Project ID is required.' : 'Another project already uses this ID.');
      return false;
    }
    current.id = id;
    current.title = form.elements.namedItem('title').value.trim();
    current.description = form.elements.namedItem('description').value.trim();
    current.media = { type: form.elements.namedItem('mediaType').value, src: form.elements.namedItem('mediaSrc').value.trim() };
    current.meta = {
      teamSize: form.elements.namedItem('teamSize').value.trim(),
      timeFrame: form.elements.namedItem('timeFrame').value.trim(),
      engine: form.elements.namedItem('engine').value.trim(),
      platform: form.elements.namedItem('platform').value.trim()
    };
    current.aboutHtml = document.getElementById('about-editor').innerHTML.trim();
    current.links = collectLinks();
    current.sections = collectSections();
    dirty = true;
    renderList();
    document.getElementById('editor-title').textContent = current.title || 'Edit project';
    if (showConfirmation) setStatus('Project changes applied. Export projects.json to publish them.', true);
    return true;
  };

  form.addEventListener('submit', (event) => { event.preventDefault(); applyForm(true); });
  form.addEventListener('input', markDirty);
  document.getElementById('about-editor').addEventListener('input', markDirty);
  document.getElementById('add-link').addEventListener('click', () => { addLinkRow(); markDirty(); });
  document.getElementById('add-section').addEventListener('click', () => { addSectionRow(); markDirty(); });

  document.getElementById('new-project').addEventListener('click', () => {
    if (activeIndex >= 0) applyForm(false);
    let candidate = 'new-project'; let counter = 2;
    while (projects.some((project) => project.id === candidate)) candidate = `new-project-${counter++}`;
    const project = blankProject(); project.id = candidate;
    projects.push(project); activeIndex = projects.length - 1; dirty = true;
    renderList(); loadForm();
  });

  document.getElementById('delete-project').addEventListener('click', () => {
    if (activeIndex < 0 || !window.confirm(`Delete “${projects[activeIndex].title}” from the exported data?`)) return;
    projects.splice(activeIndex, 1);
    activeIndex = Math.min(activeIndex, projects.length - 1); dirty = true;
    renderList(); loadForm();
  });

  const moveProject = (offset) => {
    const target = activeIndex + offset;
    if (activeIndex < 0 || target < 0 || target >= projects.length) return;
    applyForm(false);
    [projects[activeIndex], projects[target]] = [projects[target], projects[activeIndex]];
    activeIndex = target; dirty = true; renderList(); loadForm();
  };
  document.getElementById('move-up').addEventListener('click', () => moveProject(-1));
  document.getElementById('move-down').addEventListener('click', () => moveProject(1));

  document.getElementById('export-button').addEventListener('click', () => {
    if (activeIndex >= 0 && !applyForm(false)) return;
    const blob = new Blob([JSON.stringify(projects, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url; anchor.download = 'projects.json'; anchor.click();
    URL.revokeObjectURL(url);
    dirty = false; setStatus('projects.json exported successfully.', true);
  });

  document.getElementById('import-file').addEventListener('change', async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try {
      const imported = JSON.parse(await file.text());
      if (!Array.isArray(imported)) throw new Error('The JSON root must be an array.');
      projects = imported; activeIndex = projects.length ? 0 : -1; dirty = true;
      renderList(); loadForm(); setStatus('JSON imported. Review it, then export to save.', true);
    } catch (error) {
      window.alert(`Could not import this file: ${error.message}`);
    }
    event.target.value = '';
  });

  window.addEventListener('beforeunload', (event) => {
    if (!dirty) return;
    event.preventDefault(); event.returnValue = '';
  });

  fetch('data/projects.json')
    .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
    .then((data) => {
      projects = data; activeIndex = projects.length ? 0 : -1;
      renderList(); loadForm();
    })
    .catch((error) => {
      console.error(error);
      empty.innerHTML = '<div><strong>Could not load data/projects.json.</strong><p>Open this page through GitHub Pages or a local web server.</p></div>';
    });
})();
