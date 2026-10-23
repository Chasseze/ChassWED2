# WebEditor

A compact browser word processor, served by Node.js and Express.

## Run

```sh
npm install
npm start
```

Open [localhost:3000](http://localhost:3000). To use the current preview port:

```sh
PORT=3007 npm start
```

PDF and DOCX export need this Node server. PDF export uses the Chromium installed by Puppeteer; install its browser with `npx puppeteer browsers install chrome` if it is missing. HTML, Markdown, text export, editing and browser recovery run in the frontend. Word import and HTML sanitization libraries are bundled locally in `public/vendor/`, with their licenses.

## Editing

- The document title stays beside WebEditor. Choose another open document from that dropdown; press F2 to rename it, or right-click it (Shift+F10 from the keyboard) to duplicate or close it.
- All new formatting and layout controls live in the second toolbar. Controls wrap individually at smaller widths.
- Paragraph styles, font and point size, alignment, lists, indentation and line spacing act on the selection or current paragraph. Formatting preserves the selection when opening controls.
- Insert a table, then place the caret in a cell and use Table tools to add or remove rows and columns. Undo restores table edits.
- Find/replace preserves surrounding rich content. Search treats input as literal text and wraps around the document.
- Auto view uses paper geometry on wide screens and reflows text on narrow screens. Writing view always reflows. Print layout shows the selected A4, Letter or Legal dimensions and orientation. Fit and zoom controls adjust the view independently of the document's print settings.
- The sidebar has compact templates, recent documents, revision history, statistics and a heading outline. It starts collapsed on small screens and can be toggled from the toolbar.
- Templates can be applied, saved and reused. Applying a template is undoable.
- Writing tools run a small set of local rules for repeated words, extra spaces and common typos. Cleanup and shortening show a preview before replacement. They are not a full grammar engine or a generative AI service.

## Saving and recovery

Editing saves automatically after a two-second pause, with a periodic backup attempt. Recovery uses IndexedDB and a compact local-storage fallback. Existing local-storage documents are migrated without deleting the source. Open documents, active title, headers, footers and page settings are recovered on reload. Closing a document retains its recovery copy in Recent. Clearing Recent hides the list without deleting documents.

The status bar distinguishes browser recovery from a downloaded file. If storage fails, it keeps the in-memory document and asks for a file copy; it never frees space by deleting other documents. Browser recovery is scoped to the browser profile and origin (hostname and port). Clearing browser site data removes recovery copies, so use Save/Export for independent files.

Save uses the browser's file picker when supported and a format chooser otherwise. Export supports real PDF, DOCX, HTML, Markdown and plain text. PDF/DOCX service failures show an error and recommend HTML or Print instead of producing a misleading fallback file. HTML preserves WebEditor's page settings and headers/footers when reopened. Word import preserves supported document content; advanced Word features, exact fonts, page setup and headers/footers may differ. This is a continuous editing canvas, not Word's complete pagination engine.

Send a copy offers text copying, HTML download and native file sharing where available. Email opens a draft with plain text; it does not send mail automatically or attach a PDF. No public sharing links or Google Drive autosave are implemented.

## Implementation and checks

`public/main.js` coordinates the existing app. `public/editor/` separates editing commands, recovery storage, layout, export, templates, enhancements and workspace UI. `workspace.css` owns compact UI and canvas overrides; legacy styles remain in `style.css`. Server-side export sanitization and page settings live in `lib/document-export.js`.

```sh
npm test
```

The regression suite covers rich-text replace and undo, document recovery, quota failure, legacy migration, template application, sanitized import, Markdown export, DOCX export/reimport, PDF page geometry and invalid API requests. Browser verification also covers toolbar selection, page settings/reload, table edits, writing corrections, file downloads/reimport and narrow-screen reflow.
