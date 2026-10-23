// Format Painter Functionality
class FormatPainter {
  constructor() {
    this.copiedFormat = null;
    this.isActive = false;
    this.formatPainterBtn = document.getElementById("formatPainterBtn");
    this.init();
  }

  init() {
    if (this.formatPainterBtn) {
      this.formatPainterBtn.addEventListener("click", () => {
        this.toggleFormatPainter();
      });
    }

    // Keyboard shortcut Ctrl+Shift+C
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === "C") {
        e.preventDefault();
        this.copyFormat();
      }
      if (e.ctrlKey && e.shiftKey && e.key === "V") {
        e.preventDefault();
        this.applyFormat();
      }
    });
  }

  toggleFormatPainter() {
    if (!this.isActive) {
      this.copyFormat();
    } else {
      this.deactivate();
    }
  }

  copyFormat() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      const element =
        container.nodeType === 3 ? container.parentNode : container;

      // Copy computed styles
      const computedStyle = window.getComputedStyle(element);
      this.copiedFormat = {
        fontFamily: computedStyle.fontFamily,
        fontSize: computedStyle.fontSize,
        fontWeight: computedStyle.fontWeight,
        fontStyle: computedStyle.fontStyle,
        textDecoration: computedStyle.textDecoration,
        color: computedStyle.color,
        backgroundColor: computedStyle.backgroundColor,
      };

      this.activate();
      this.showToast("Format copied! Click text to apply.");
    }
  }

  activate() {
    this.isActive = true;
    if (this.formatPainterBtn) {
      this.formatPainterBtn.classList.add("format-painter-active");
    }
    document.getElementById("editor").style.cursor = "crosshair";

    // Add click listener to apply format
    this.applyHandler = () => this.applyFormat();
    document
      .getElementById("editor")
      .addEventListener("click", this.applyHandler);
  }

  deactivate() {
    this.isActive = false;
    if (this.formatPainterBtn) {
      this.formatPainterBtn.classList.remove("format-painter-active");
    }
    document.getElementById("editor").style.cursor = "text";
    if (this.applyHandler) {
      document
        .getElementById("editor")
        .removeEventListener("click", this.applyHandler);
    }
  }

  applyFormat() {
    const app = window.charlesEditor;
    if (!app || !this.copiedFormat) return;
    const selection = app.commands.restore();
    if (selection.isCollapsed) return app.showToast('Select text to apply the copied format.', 'info');
    app.commands.change(() => {
      const range = selection.getRangeAt(0), span = document.createElement('span');
      Object.assign(span.style, this.copiedFormat);
      span.append(range.extractContents()); range.insertNode(span); range.selectNodeContents(span);
      selection.removeAllRanges(); selection.addRange(range);
    });
    this.deactivate();
  }

  showToast(message) {
    if (window.charlesEditor) {
      window.charlesEditor.showToast(message, "success");
    }
  }
}

// Enhanced Statistics Dashboard
class StatsDashboard {
  constructor(editor) {
    this.editor = editor;
    this.init();
  }

  init() {
    if (!this.editor) return;
    this.updateStats();
    // Content changes include typing, imports, templates, undo, and document switches.
    this.observer = new MutationObserver(() => {
      cancelAnimationFrame(this.updateFrame);
      this.updateFrame = requestAnimationFrame(() => this.updateStats());
    });
    this.observer.observe(this.editor, { childList: true, characterData: true, subtree: true });
  }

  updateStats() {
    const text = (this.editor.innerText || "").replace(/\r\n/g, "\n");
    const content = text.trim();
    const locale = this.editor.lang || document.documentElement.lang || "en";
    const words = typeof Intl.Segmenter === "function"
      ? [...new Intl.Segmenter(locale, { granularity: "word" }).segment(content)].filter(part => part.isWordLike).map(part => part.segment)
      : content.match(/[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*/gu) || [];
    const sentences = content ? (typeof Intl.Segmenter === "function"
      ? [...new Intl.Segmenter(locale, { granularity: "sentence" }).segment(content)].filter(part => /[\p{L}\p{N}]/u.test(part.segment)).length
      : (content.match(/[^.!?]+[.!?]*/g) || []).filter(part => /[\p{L}\p{N}]/u.test(part)).length) : 0;
    const blockSelector = "p,h1,h2,h3,h4,h5,h6,li,blockquote,pre,div,td,th";
    const paragraphs = [...this.editor.querySelectorAll(blockSelector)].filter(el =>
      !el.querySelector(blockSelector) && el.textContent.trim()
    ).length || (content ? 1 : 0);
    const letterCount = words.reduce((sum, word) => sum + (word.match(/\p{L}/gu) || []).length, 0);
    const count = new Intl.NumberFormat(locale);
    this.updateElement("statsWords", count.format(words.length));
    this.updateElement("statsChars", count.format(content ? [...text].length : 0));
    this.updateElement("statsParagraphs", count.format(paragraphs));
    this.updateElement("statsReadingTime", !words.length ? "0 min" : words.length < 200 ? "<1 min" : Math.ceil(words.length / 200) + " min");
    this.updateElement("statsSentences", count.format(sentences));
    this.updateElement("statsAvgWordLen", words.length ? (letterCount / words.length).toLocaleString(locale, { maximumFractionDigits: 1 }) : "0");
  }

  updateElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  updateBar(id, percentage) {
    const bar = document.getElementById(id);
    if (bar) {
      bar.style.width = percentage + "%";
    }
  }
}

// Context Menu
class ContextMenu {
  constructor() {
    this.contextMenu = document.getElementById("contextMenu");
    this.init();
  }

  init() {
    // Show context menu on right-click in editor
    const editor = document.getElementById("editor");
    if (editor) {
      editor.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        this.show(e.pageX, e.pageY);
      });
    }

    // Hide context menu on click elsewhere
    document.addEventListener("click", () => {
      this.hide();
    });

    // Handle context menu item clicks
    if (this.contextMenu) {
      this.contextMenu
        .querySelectorAll(".context-menu-item")
        .forEach((item) => {
          item.addEventListener("click", (e) => {
            e.stopPropagation();
            const action = item.getAttribute("data-action");
            this.handleAction(action);
            this.hide();
          });
        });
    }
  }

  show(x, y) {
    if (!this.contextMenu) return;

    this.contextMenu.style.left = x + "px";
    this.contextMenu.style.top = y + "px";
    this.contextMenu.classList.add("active");

    // Adjust position if menu goes off screen
    const rect = this.contextMenu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      this.contextMenu.style.left = x - rect.width + "px";
    }
    if (rect.bottom > window.innerHeight) {
      this.contextMenu.style.top = y - rect.height + "px";
    }
  }

  hide() {
    if (this.contextMenu) {
      this.contextMenu.classList.remove("active");
    }
  }

  async handleAction(action) {
    const app = window.charlesEditor;
    if (!app) return;
    if (action === 'formatPainter') return window.formatPainter?.toggleFormatPainter();
    const selection = app.commands.restore();
    if (action === 'selectAll') {
      const range = document.createRange(); range.selectNodeContents(app.editor);
      selection.removeAllRanges(); selection.addRange(range); app.commands.remember();
    } else if (action === 'paste') {
      try { app.executeCommand('insertText', await navigator.clipboard.readText()); }
      catch (_) { app.showToast('Use Ctrl+V or ⌘V to paste with your browser.', 'info'); }
    } else if (action === 'copy') {
      try { await navigator.clipboard.writeText(selection.toString()); }
      catch (_) { app.showToast('Use Ctrl+C or ⌘C to copy.', 'info'); }
    } else app.executeCommand(action);
  }

}

// Autocomplete Feature
class Autocomplete {
  constructor(editor) {
    this.editor = editor;
    this.dropdown = document.getElementById("autocompleteDropdown");
    this.suggestions = [
      "However",
      "Therefore",
      "Furthermore",
      "Nevertheless",
      "Moreover",
      "Consequently",
      "In addition",
      "On the other hand",
      "For example",
      "In conclusion",
      "Specifically",
      "Generally speaking",
      "According to",
      "As a result",
      "In other words",
    ];
    this.isVisible = false;
    this.selectedIndex = -1;
    this.init();
  }

  init() {
    if (!this.editor || !this.dropdown) return;

    // Listen for input in the editor
    this.editor.addEventListener("input", (e) => {
      this.handleInput(e);
    });

    // Listen for keyboard navigation
    this.editor.addEventListener("keydown", (e) => {
      if (this.isVisible) {
        this.handleKeydown(e);
      }
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!this.dropdown.contains(e.target) && e.target !== this.editor) {
        this.hide();
      }
    });
  }

  handleInput(e) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const text = textNode.textContent;
    const cursorPos = range.startOffset;

    // Get the word being typed
    const beforeCursor = text.substring(0, cursorPos);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    // Show suggestions if word is at least 2 characters
    if (currentWord.length >= 2) {
      const matches = this.suggestions.filter((suggestion) =>
        suggestion.toLowerCase().startsWith(currentWord.toLowerCase()),
      );

      if (matches.length > 0) {
        this.show(matches, currentWord);
      } else {
        this.hide();
      }
    } else {
      this.hide();
    }
  }

  show(suggestions, partialWord) {
    if (!this.dropdown) return;

    this.dropdown.innerHTML = suggestions
      .map(
        (suggestion, index) => `
      <div class="autocomplete-item ${index === this.selectedIndex ? "selected" : ""}"
           data-index="${index}"
           data-suggestion="${suggestion}">
        <strong>${suggestion.substring(0, partialWord.length)}</strong>${suggestion.substring(partialWord.length)}
      </div>
    `,
      )
      .join("");

    // Position dropdown near cursor
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      this.dropdown.style.left = rect.left + "px";
      this.dropdown.style.top = rect.bottom + 5 + "px";
    }

    this.dropdown.classList.add("active");
    this.isVisible = true;
    this.selectedIndex = -1;

    // Add click listeners to suggestions
    this.dropdown.querySelectorAll(".autocomplete-item").forEach((item) => {
      item.addEventListener("mousedown", e => e.preventDefault());
      item.addEventListener("click", () => {
        this.applySuggestion(item.dataset.suggestion);
      });
    });
  }

  hide() {
    if (this.dropdown) {
      this.dropdown.classList.remove("active");
      this.isVisible = false;
      this.selectedIndex = -1;
    }
  }

  handleKeydown(e) {
    const items = this.dropdown.querySelectorAll(".autocomplete-item");

    if (e.key === "ArrowDown") {
      e.preventDefault();
      this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
      this.updateSelection(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
      this.updateSelection(items);
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (this.selectedIndex >= 0 && items[this.selectedIndex]) {
        e.preventDefault();
        const suggestion = items[this.selectedIndex].dataset.suggestion;
        this.applySuggestion(suggestion);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      this.hide();
    }
  }

  updateSelection(items) {
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add("selected");
      } else {
        item.classList.remove("selected");
      }
    });
  }

  applySuggestion(suggestion) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const textNode = range.startContainer;

    if (textNode.nodeType !== Node.TEXT_NODE) return;

    const text = textNode.textContent;
    const cursorPos = range.startOffset;

    // Get the word being typed
    const beforeCursor = text.substring(0, cursorPos);
    const afterCursor = text.substring(cursorPos);
    const words = beforeCursor.split(/\s+/);
    const currentWord = words[words.length - 1];

    // Replace the partial word with the suggestion
    const newBefore = beforeCursor.substring(
      0,
      beforeCursor.length - currentWord.length,
    );
    window.charlesEditor.commands.change(() => {
    textNode.textContent = newBefore + suggestion + " " + afterCursor;

    // Move cursor after the inserted suggestion
    const newPos = newBefore.length + suggestion.length + 1;
    range.setStart(textNode, newPos);
    range.setEnd(textNode, newPos);
    selection.removeAllRanges();
    selection.addRange(range);
    });
    this.hide();
  }
}
