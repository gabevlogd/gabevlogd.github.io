# Gabriele Garofalo — Portfolio website

A complete static redesign of the existing GitHub Pages portfolio. It uses plain HTML, CSS and JavaScript, so it can be published directly without a build step or framework.

## What changed

- New responsive visual design focused on C++, real-time systems and game development.
- All existing project, study, CV and profile information has been retained and reorganized.
- Shared project data replaces repeated project-page markup.
- Responsive project pages are generated from `data/projects.json`.
- Existing URLs such as `projectBW.html`, `SMS.html` and `weabot.html` redirect to the corresponding new pages.
- A contact form sends submissions to `gabrielegarofalo999@gmail.com` through FormSubmit.
- `admin.html` provides a visual editor for adding, editing, deleting and reordering projects without writing HTML or JavaScript.
- Accessibility improvements: keyboard navigation, semantic headings, reduced-motion support and responsive layouts.

## Important: assets from the existing repository

The supplied ZIP contained only HTML and CSS files. It did not contain the referenced `images`, `video` or `pdf` directories. The redesign deliberately preserves those paths.

When installing the redesign, keep these existing repository directories:

```text
images/
video/
pdf/
```

Copy the new files over the current website files without deleting those asset folders.

## Publish on GitHub Pages

1. Back up the current repository.
2. Keep the existing `images`, `video` and `pdf` folders.
3. Replace the old HTML/CSS files with the contents of this package.
4. Commit and push to the branch used by GitHub Pages.
5. Open the deployed site and verify media and PDF links.

There are no dependencies and no build command.

## Contact form activation

The form posts to FormSubmit using the portfolio email address. On the first real submission, FormSubmit sends a confirmation email to `gabrielegarofalo999@gmail.com`. Open that email and confirm the endpoint once. After confirmation, subsequent messages are delivered normally.

The form includes:

- name, email, subject and message fields;
- a honeypot field for basic spam reduction;
- a custom email subject and table template;
- redirect to `thanks.html` after submission;
- a direct `mailto:` link as a fallback.

## Add or edit projects without writing code

1. Open the deployed `/admin.html` page.
2. Select an existing project or press `+` to create a new one.
3. Fill in the project fields, links and content sections.
4. Press **Apply project changes**.
5. Press **Export projects.json**.
6. In the GitHub repository, upload the downloaded file and replace `data/projects.json`.
7. Upload any new image or video to the path entered in the editor.
8. Commit the changes. GitHub Pages will republish the site.

The editor runs entirely in the browser and does not receive GitHub credentials. This avoids storing a personal access token in a public website.

## Local preview

Because project data is loaded with `fetch`, opening `index.html` directly from the filesystem may be blocked by browser security rules. Run a small local server from the project folder instead:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Main files

```text
index.html                 Homepage
project.html               Shared project detail page
admin.html                 Visual project editor
thanks.html                Contact confirmation page
data/projects.json         All project content
assets/css/main.css        Public site styles
assets/css/admin.css       Editor styles
assets/js/site.js          Shared navigation and animations
assets/js/home.js          Homepage project rendering
assets/js/project.js       Project detail rendering
assets/js/admin.js         Visual editor logic
```
