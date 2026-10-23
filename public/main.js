/**
 * CharlesWebEditor - Working version with all existing functionality
 */

class CharlesWebEditor {
  constructor() {
    // Version information
    this.version = "1.2.0";
    this.releaseDate = "2026";

    // State variables
    this.currentDocId = "doc1";
    this.documents = {
      doc1: {
        id: "doc1",
        name: "Document 1",
        content: "",
        history: [],
        historyIndex: -1,
        lastSave: null,
      },
    };
    this.currentDoc = this.documents["doc1"];

    // Editor DOM elements
    this.editor = document.getElementById("editor");
    this.page = document.getElementById("page");
    this.pageContainer = document.getElementById("pageContainer");

    // State variables
    this.zoomLevel = 100;
    this.currentTheme = WebEditorStorage.get("editor_theme") || "light";
    this.spellCheckEnabled = true;
    this.selectedImage = null;
    this.recentDocuments = [];
    this.hasUnsavedChanges = false;
    this.autoSaveTimer = null;
    this.debounceDelay = 2000;

    // Text-to-Speech state
    this.ttsActive = false;
    this.currentUtterance = null;

    // Voice dictation state
    this.dictationActive = false;
    this.recognition = null;
    this.dictationRange = null;

    // Header & Footer state
    this.hfEditMode = false;
    this.hfActiveZone = "header";

    // Templates - Merged old and new templates
    this.templates = WebEditorTemplates.map(template => ({...template}));

    this.commands = new WebEditorCommands(this);
    this.storage = new WebEditorStorage(this);
    this.layout = new EditorLayout(this);
    this.exports = new EditorExports(this);
    this.workspace = new EditorWorkspace(this);

    // Initialize
    this.loadFromLocalStorage();
    this.loadRecentDocuments();
    this.updateWordCount();
    this.updateStatusBar();
    this.setTheme(this.currentTheme);
    this.updateRecentDocumentsList();
    this.updateTemplatesList();

    // Setup event listeners
    this.setupEventListeners();

    // Auto-save interval (backup - saves every 30 seconds if user is idle)
    setInterval(() => {
      if (this.hasUnsavedChanges) {
        this.autoSave();
      }
    }, 30000);

    // Warn before leaving if there are unsaved changes
    window.addEventListener("beforeunload", (e) => {
      if (this.hasUnsavedChanges) {
        this.saveDocumentState();
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    });

    // Setup drag and drop for file opening
    this.setupDragAndDrop();

    // Log version info
    console.info(
      `CharlesWebEditor v${this.version} initialized - ${this.releaseDate}`,
    );
  }

  setupEventListeners() {
    // Welcome screen buttons
    const startEditorBtn = document.getElementById("startEditorBtn");

    if (startEditorBtn) {
      startEditorBtn.addEventListener("click", () => {
        this.startEditor();
      });
    } else {
      console.error("❌ Start Editor button not found!");
    }

    const tourBtn = document.getElementById("tourBtn");
    if (tourBtn) {
      tourBtn.addEventListener("click", () => {
        this.showTour();
      });
    }

    // Theme toggle
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", () => this.toggleTheme());
    }

    // Language select
    const languageSelect = document.getElementById("languageSelect");
    if (languageSelect) {
      languageSelect.addEventListener("change", (e) => {
        this.changeLanguage(e.target.value);
      });
    }

    // Sidebar tabs
    document.querySelectorAll(".sidebar-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchSidebarTab(e.currentTarget.dataset.tab);
      });
    });

    // Quick styles
    document.querySelectorAll("[data-style]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        this.applyStyle(e.target.closest("[data-style]").dataset.style);
      });
    });

    // Text color and highlight
    const textColor = document.getElementById("textColor");
    if (textColor) {
      textColor.addEventListener("input", (e) => {
        this.executeCommand("foreColor", e.target.value);
      });
    }

    const highlightColor = document.getElementById("highlightColor");
    if (highlightColor) {
      highlightColor.addEventListener("input", (e) => {
        this.executeCommand("backColor", e.target.value);
      });
    }

    // Formatting buttons with data-command
    document.querySelectorAll("[data-command]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const command = e.target.closest("[data-command]").dataset.command;
        this.executeCommand(command);
        this.saveDocumentState();
      });
    });

    // Font controls
    const fontFamily = document.getElementById("fontFamily");
    if (fontFamily) {
      fontFamily.addEventListener("change", (e) => {
        this.executeCommand("fontName", e.target.value);
      });
    }

    const fontSize = document.getElementById("fontSize");
    if (fontSize) {
      fontSize.addEventListener("change", (e) => {
        this.executeCommand("fontSize", e.target.value);
      });
    }

    // Undo/Redo
    const undoBtn = document.getElementById("undoBtn");
    if (undoBtn) {
      undoBtn.addEventListener("click", () => this.undo());
    }

    const redoBtn = document.getElementById("redoBtn");
    if (redoBtn) {
      redoBtn.addEventListener("click", () => this.redo());
    }

    // Insert buttons
    const insertImageBtn = document.getElementById("insertImageBtn");
    if (insertImageBtn) {
      insertImageBtn.addEventListener("click", () => this.insertImage());
    }

    const insertTableBtn = document.getElementById("insertTableBtn");
    if (insertTableBtn) {
      insertTableBtn.addEventListener("click", () => this.insertTable());
    }

    const insertLinkBtn = document.getElementById("insertLinkBtn");
    if (insertLinkBtn) {
      insertLinkBtn.addEventListener("click", () => this.insertLink());
    }

    // Find and replace
    const findBtn = document.getElementById("findBtn");
    if (findBtn) {
      findBtn.addEventListener("click", () => this.showFindModal());
    }

    const replaceBtn = document.getElementById("replaceBtn");
    if (replaceBtn) {
      replaceBtn.addEventListener("click", () => this.showReplaceModal());
    }

    // Page layout
    const toggleSidebarBtn = document.getElementById("toggleSidebarBtn");
    if (toggleSidebarBtn) {
      toggleSidebarBtn.addEventListener("click", () => this.toggleSidebar());
    }

    const pageSize = document.getElementById("pageSize");
    if (pageSize) {
      pageSize.addEventListener("change", (e) => {
        this.setPageSize(e.target.value);
      });
    }

    const pageSizeSelect = document.getElementById("pageSizeSelect");
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener("change", (e) => {
        this.setPageSize(e.target.value);
      });
    }

    const pageOrientation = document.getElementById("pageOrientation");
    if (pageOrientation) {
      pageOrientation.addEventListener("change", (e) => {
        this.setPageOrientation(e.target.value);
      });
    }

    // Document tabs
    const addTabBtn = document.getElementById("addTabBtn");
    if (addTabBtn) {
      addTabBtn.addEventListener("click", () => this.addNewDocument());
    }

    // Document management
    const newDocBtn = document.getElementById("newDocBtn");
    if (newDocBtn) {
      newDocBtn.addEventListener("click", () => this.addNewDocument());
    }

    const saveDocBtn = document.getElementById("saveDocBtn");
    if (saveDocBtn) {
      saveDocBtn.addEventListener("click", () => this.saveDocument());
    }

    const openDocBtn = document.getElementById("openDocBtn");
    if (openDocBtn) {
      openDocBtn.addEventListener("click", () => this.openDocument());
    }

    // Export functions
    const exportPdfBtn = document.getElementById("exportPdf");
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener("click", () => this.exportToPDF());
    }

    const exportDocxBtn = document.getElementById("exportDocx");
    if (exportDocxBtn) {
      exportDocxBtn.addEventListener("click", () => this.exportToDOCX());
    }

    const printBtn = document.getElementById("printBtn");
    if (printBtn) {
      printBtn.addEventListener("click", () => window.print());
    }

    // New header buttons
    const exportBtn = document.getElementById("exportBtn");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => this.showExportModal());
    }

    const emailBtn = document.getElementById("emailBtn");
    if (emailBtn) {
      emailBtn.addEventListener("click", () => this.showEmailModal());
    }

    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", () => this.showShareModal());
    }

    const templateManagerBtn = document.getElementById("templateManagerBtn");
    if (templateManagerBtn) {
      templateManagerBtn.addEventListener("click", () =>
        this.showTemplateManagerModal(),
      );
    }

    // Page Layout button
    const pageLayoutBtn = document.getElementById("pageLayoutBtn");
    if (pageLayoutBtn) {
      pageLayoutBtn.addEventListener("click", () => {
        this.showPageLayoutModal();
      });
    }

    // Quick Styles button
    const quickStylesBtn = document.getElementById("quickStylesBtn");
    if (quickStylesBtn) {
      quickStylesBtn.addEventListener("click", () => {
        this.showQuickStylesModal();
      });
    }

    // New feature buttons (AI, Templates, Advanced Formatting, Email Share)
    const aiAssistantBtn = document.getElementById("aiAssistantBtn");
    if (aiAssistantBtn) {
      aiAssistantBtn.addEventListener("click", () => {
        this.toggleAIAssistantPanel();
      });
    }

    const templatesBtn = document.getElementById("templatesBtn");
    if (templatesBtn) {
      templatesBtn.addEventListener("click", () => {
        this.showTemplatesModal();
      });
    }

    const advancedFormattingBtn = document.getElementById(
      "advancedFormattingBtn",
    );
    if (advancedFormattingBtn) {
      advancedFormattingBtn.addEventListener("click", () => {
        this.showAdvancedFormattingModal();
      });
    }

    const emailShareBtn = document.getElementById("emailShareBtn");
    if (emailShareBtn) {
      emailShareBtn.addEventListener("click", () => {
        this.showEmailShareModal();
      });
    }

    // Page Layout modal event listeners
    const closePageLayoutModal = document.getElementById(
      "closePageLayoutModal",
    );
    if (closePageLayoutModal) {
      closePageLayoutModal.addEventListener("click", () => {
        this.hidePageLayoutModal();
      });
    }

    const cancelPageLayoutBtn = document.getElementById("cancelPageLayoutBtn");
    if (cancelPageLayoutBtn) {
      cancelPageLayoutBtn.addEventListener("click", () => {
        this.hidePageLayoutModal();
      });
    }

    const applyPageLayoutBtn = document.getElementById("applyPageLayoutBtn");
    if (applyPageLayoutBtn) {
      applyPageLayoutBtn.addEventListener("click", () => {
        this.applyPageLayout();
      });
    }

    // Quick Styles modal event listeners
    const closeQuickStylesModal = document.getElementById(
      "closeQuickStylesModal",
    );
    if (closeQuickStylesModal) {
      closeQuickStylesModal.addEventListener("click", () => {
        this.hideQuickStylesModal();
      });
    }

    const cancelQuickStylesBtn = document.getElementById(
      "cancelQuickStylesBtn",
    );
    if (cancelQuickStylesBtn) {
      cancelQuickStylesBtn.addEventListener("click", () => {
        this.hideQuickStylesModal();
      });
    }

    // Style buttons in Quick Styles modal
    document.querySelectorAll(".style-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const style = e.target.closest(".style-btn").dataset.style;
        this.applyStyle(style);
        this.hideQuickStylesModal();
      });
    });

    // Templates modal event listeners
    const closeTemplatesModal = document.getElementById("closeTemplatesModal");
    if (closeTemplatesModal) {
      closeTemplatesModal.addEventListener("click", () => {
        this.hideTemplatesModal();
      });
    }

    const cancelTemplatesBtn = document.getElementById("cancelTemplatesBtn");
    if (cancelTemplatesBtn) {
      cancelTemplatesBtn.addEventListener("click", () => {
        this.hideTemplatesModal();
      });
    }

    // Advanced Formatting modal event listeners
    const closeAdvancedFormattingModal = document.getElementById(
      "closeAdvancedFormattingModal",
    );
    if (closeAdvancedFormattingModal) {
      closeAdvancedFormattingModal.addEventListener("click", () => {
        this.hideAdvancedFormattingModal();
      });
    }

    const cancelAdvancedFormattingBtn = document.getElementById(
      "cancelAdvancedFormattingBtn",
    );
    if (cancelAdvancedFormattingBtn) {
      cancelAdvancedFormattingBtn.addEventListener("click", () => {
        this.hideAdvancedFormattingModal();
      });
    }

    const applyAdvancedFormattingBtn = document.getElementById(
      "applyAdvancedFormattingBtn",
    );
    if (applyAdvancedFormattingBtn) {
      applyAdvancedFormattingBtn.addEventListener("click", () => {
        this.applyAdvancedFormatting();
      });
    }

    // Advanced formatting buttons
    const formatStrikethrough = document.getElementById("formatStrikethrough");
    if (formatStrikethrough) {
      formatStrikethrough.addEventListener("click", () => {
        this.executeCommand("strikeThrough");
      });
    }

    const formatSuperscript = document.getElementById("formatSuperscript");
    if (formatSuperscript) {
      formatSuperscript.addEventListener("click", () => {
        this.executeCommand("superscript");
      });
    }

    const formatSubscript = document.getElementById("formatSubscript");
    if (formatSubscript) {
      formatSubscript.addEventListener("click", () => {
        this.executeCommand("subscript");
      });
    }

    const lineSpacing = document.getElementById("lineSpacing");
    if (lineSpacing) {
      lineSpacing.addEventListener("change", (e) => {
        this.applyLineSpacing(e.target.value);
      });
    }

    const formatUppercase = document.getElementById("formatUppercase");
    if (formatUppercase) {
      formatUppercase.addEventListener("click", () => {
        this.transformText("uppercase");
      });
    }

    const formatLowercase = document.getElementById("formatLowercase");
    if (formatLowercase) {
      formatLowercase.addEventListener("click", () => {
        this.transformText("lowercase");
      });
    }

    const formatCapitalize = document.getElementById("formatCapitalize");
    if (formatCapitalize) {
      formatCapitalize.addEventListener("click", () => {
        this.transformText("capitalize");
      });
    }

    // Email Share modal event listeners
    const closeEmailShareModal = document.getElementById(
      "closeEmailShareModal",
    );
    if (closeEmailShareModal) {
      closeEmailShareModal.addEventListener("click", () => {
        this.hideEmailShareModal();
      });
    }

    const cancelEmailShareBtn = document.getElementById("cancelEmailShareBtn");
    if (cancelEmailShareBtn) {
      cancelEmailShareBtn.addEventListener("click", () => {
        this.hideEmailShareModal();
      });
    }

    // emailModal send button → sendEmailFromHeader()
    const sendEmailBtnModal = document.getElementById("sendEmailBtn");
    if (sendEmailBtnModal) {
      sendEmailBtnModal.addEventListener("click", () => {
        this.sendEmailFromHeader();
      });
    }

    // emailShareModal send button → sendEmail()
    const sendEmailShareBtn = document.getElementById("sendEmailShareBtn");
    if (sendEmailShareBtn) {
      sendEmailShareBtn.addEventListener("click", () => {
        this.sendEmail();
      });
    }

    // Export Modal event listeners (Header button)
    const closeExportModal = document.getElementById("closeExportModal");
    if (closeExportModal) {
      closeExportModal.addEventListener("click", () => {
        this.hideExportModal();
      });
    }

    // Save Modal event listeners
    const closeSaveModal = document.getElementById("closeSaveModal");
    if (closeSaveModal) {
      closeSaveModal.addEventListener("click", () => this.hideSaveModal());
    }
    const cancelSaveModal = document.getElementById("cancelSaveModal");
    if (cancelSaveModal) {
      cancelSaveModal.addEventListener("click", () => this.hideSaveModal());
    }
    document.querySelectorAll(".save-fmt-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.saveWithFormat(btn.dataset.format);
      });
    });

    // Email Modal event listeners (Header button)
    const closeEmailModal = document.getElementById("closeEmailModal");
    if (closeEmailModal) {
      closeEmailModal.addEventListener("click", () => {
        this.hideEmailModal();
      });
    }

    const cancelEmailBtn = document.getElementById("cancelEmailBtn");
    if (cancelEmailBtn) {
      cancelEmailBtn.addEventListener("click", () => {
        this.hideEmailModal();
      });
    }

    // Share Modal event listeners (Header button)
    const closeShareLinkModal = document.getElementById("closeShareLinkModal");
    if (closeShareLinkModal) {
      closeShareLinkModal.addEventListener("click", () => {
        this.hideShareModal();
      });
    }

    const cancelShareBtn = document.getElementById("cancelShareBtn");
    if (cancelShareBtn) {
      cancelShareBtn.addEventListener("click", () => {
        this.hideShareModal();
      });
    }

    const copyShareLinkBtn = document.getElementById("copyShareLinkBtn");
    if (copyShareLinkBtn) {
      copyShareLinkBtn.addEventListener("click", () => {
        this.copyShareLink();
      });
    }

    // Template Manager Modal event listeners (Header button)
    const closeTemplateManagerModal = document.getElementById(
      "closeTemplateManagerModal",
    );
    if (closeTemplateManagerModal) {
      closeTemplateManagerModal.addEventListener("click", () => {
        this.hideTemplateManagerModal();
      });
    }

    const saveAsTemplateBtn = document.getElementById("saveAsTemplateBtn");
    if (saveAsTemplateBtn) {
      saveAsTemplateBtn.addEventListener("click", () => {
        this.saveCurrentAsTemplate();
      });
    }

    // AI Assistant panel event listeners
    const closeAIAssistantBtn = document.getElementById("closeAIAssistantBtn");
    if (closeAIAssistantBtn) {
      closeAIAssistantBtn.addEventListener("click", () => {
        this.hideAIAssistantPanel();
      });
    }

    const checkGrammarBtn = document.getElementById("checkGrammarBtn");
    if (checkGrammarBtn) {
      checkGrammarBtn.addEventListener("click", () => {
        this.checkGrammarAndStyle();
      });
    }

    const refreshStatsBtn = document.getElementById("refreshStatsBtn");
    if (refreshStatsBtn) {
      refreshStatsBtn.addEventListener("click", () => {
        this.updateAIStats();
      });
    }

    const improveTextBtn = document.getElementById("improveTextBtn");
    if (improveTextBtn) {
      improveTextBtn.addEventListener("click", () => {
        this.improveSelectedText();
      });
    }

    const makeShorterBtn = document.getElementById("makeShorterBtn");
    if (makeShorterBtn) {
      makeShorterBtn.addEventListener("click", () => {
        this.makeTextShorter();
      });
    }

    const makeLongerBtn = document.getElementById("makeLongerBtn");
    if (makeLongerBtn) {
      makeLongerBtn.addEventListener("click", () => {
        this.makeTextLonger();
      });
    }

    const changeToneBtn = document.getElementById("changeToneBtn");
    if (changeToneBtn) {
      changeToneBtn.addEventListener("click", () => {
        this.changeTextTone();
      });
    }

    const summarizeBtn = document.getElementById("summarizeBtn");
    if (summarizeBtn) {
      summarizeBtn.addEventListener("click", () => {
        this.summarizeDocument();
      });
    }

    const generateTitleBtn = document.getElementById("generateTitleBtn");
    if (generateTitleBtn) {
      generateTitleBtn.addEventListener("click", () => {
        this.generateTitle();
      });
    }

    const expandIdeasBtn = document.getElementById("expandIdeasBtn");
    if (expandIdeasBtn) {
      expandIdeasBtn.addEventListener("click", () => {
        this.expandIdeas();
      });
    }

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      // Templates modal
      const templatesModal = document.getElementById("templatesModal");
      if (templatesModal && templatesModal.classList.contains("active")) {
        if (e.target === templatesModal) {
          this.hideTemplatesModal();
        }
      }

      // Advanced Formatting modal
      const advancedFormattingModal = document.getElementById(
        "advancedFormattingModal",
      );
      if (
        advancedFormattingModal &&
        advancedFormattingModal.classList.contains("active")
      ) {
        if (e.target === advancedFormattingModal) {
          this.hideAdvancedFormattingModal();
        }
      }

      // Email Share modal
      const emailShareModal = document.getElementById("emailShareModal");
      if (emailShareModal && emailShareModal.classList.contains("active")) {
        if (e.target === emailShareModal) {
          this.hideEmailShareModal();
        }
      }

      // Export modal (Header)
      const exportModal = document.getElementById("exportModal");
      if (exportModal && exportModal.classList.contains("active")) {
        if (e.target === exportModal) {
          this.hideExportModal();
        }
      }

      // Save modal
      const saveModal = document.getElementById("saveModal");
      if (saveModal && saveModal.classList.contains("active")) {
        if (e.target === saveModal) {
          this.hideSaveModal();
        }
      }

      // Email modal (Header)
      const emailModal = document.getElementById("emailModal");
      if (emailModal && emailModal.classList.contains("active")) {
        if (e.target === emailModal) {
          this.hideEmailModal();
        }
      }

      // Share Link modal (Header)
      const shareLinkModal = document.getElementById("shareLinkModal");
      if (shareLinkModal && shareLinkModal.classList.contains("active")) {
        if (e.target === shareLinkModal) {
          this.hideShareModal();
        }
      }

      // Template Manager modal (Header)
      const templateManagerModal = document.getElementById(
        "templateManagerModal",
      );
      if (
        templateManagerModal &&
        templateManagerModal.classList.contains("active")
      ) {
        if (e.target === templateManagerModal) {
          this.hideTemplateManagerModal();
        }
      }
    });

    // Document tab clicks and context menu
    document.addEventListener("click", (e) => {
      const tab = e.target.closest(".tab");
      if (tab) {
        const docId = tab.dataset.docId;
        if (docId && !e.target.closest(".tab-close")) {
          this.switchDocument(docId);
        }
      }

      // Tab close
      if (e.target.closest(".tab-close")) {
        e.stopPropagation();
        const tab = e.target.closest(".tab");
        const docId = tab.dataset.docId;
        this.closeDocument(docId);
      }
    });

    // Context menu for tabs
    document.addEventListener("contextmenu", (e) => {
      if (e.target.closest(".tab")) {
        e.preventDefault();
        this.showTabContextMenu(e.target.closest(".tab"), e.clientX, e.clientY);
      }
    });

    // Hide context menu on click outside
    document.addEventListener("click", (e) => {
      // Don't hide if clicking on the context menu itself
      if (!e.target.closest("#tabContextMenu")) {
        this.hideTabContextMenu();
      }
    });

    // Editor events
    this.editor.addEventListener("input", () => {
      this.handleEditorInput();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      // Focus mode toggle: Ctrl+Shift+F
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "f") {
        e.preventDefault();
        this.toggleFocusMode();
        return;
      }
      // Exit focus mode with Escape
      if (e.key === "Escape") {
        const container = document.getElementById("editorContainer");
        if (container && container.classList.contains("focus-mode")) {
          this.toggleFocusMode();
          return;
        }
      }
      if ((e.ctrlKey || e.metaKey) && ["z","y"].includes(e.key.toLowerCase()) && e.target.closest("input,textarea,select")) return;
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            this.addNewDocument();
            break;
          case "o":
            e.preventDefault();
            this.openDocument();
            break;
          case "s":
            e.preventDefault();
            this.saveDocument();
            break;
          case "z":
            e.preventDefault();
            if (e.shiftKey) this.redo(); else this.undo();
            break;
          case "y":
            e.preventDefault();
            this.redo();
            break;
          case "f":
            e.preventDefault();
            this.showFindModal();
            break;
          case "h":
            e.preventDefault();
            this.showReplaceModal();
            break;
          case "p":
            e.preventDefault();
            window.print();
            break;
          case "\\":
            e.preventDefault();
            this.toggleSidebar();
            break;
        }
      } else if (e.key === "F2") {
        e.preventDefault();
        this.renameCurrentDocument();
      }
    });

    // Help button
    const helpFab = document.getElementById("helpFab");
    if (helpFab) {
      helpFab.addEventListener("click", () => this.showHelpModal());
    }

    // Focus mode buttons
    const focusModeBtn = document.getElementById("focusModeBtn");
    if (focusModeBtn) {
      focusModeBtn.addEventListener("click", () => this.toggleFocusMode());
    }
    const focusModeExitBtn = document.getElementById("focusModeExitBtn");
    if (focusModeExitBtn) {
      focusModeExitBtn.addEventListener("click", () => this.toggleFocusMode());
    }

    // Insert TOC button
    const insertTOCBtn = document.getElementById("insertTOCBtn");
    if (insertTOCBtn) {
      insertTOCBtn.addEventListener("click", () => this.insertTOC());
    }

    // Text-to-Speech buttons
    const ttsBtn = document.getElementById("ttsBtn");
    if (ttsBtn) {
      ttsBtn.addEventListener("click", () => {
        if (this.ttsActive) {
          this.stopTextToSpeech();
        } else {
          this.startTextToSpeech();
        }
      });
    }
    const ttsPauseBtn = document.getElementById("ttsPauseBtn");
    if (ttsPauseBtn) {
      ttsPauseBtn.addEventListener("click", () => this.pauseTextToSpeech());
    }
    const ttsStopBtn = document.getElementById("ttsStopBtn");
    if (ttsStopBtn) {
      ttsStopBtn.addEventListener("click", () => this.stopTextToSpeech());
    }
    const ttsSpeed = document.getElementById("ttsSpeed");
    if (ttsSpeed) {
      ttsSpeed.addEventListener("change", () => {
        if (this.ttsActive) {
          // Restart with new speed seamlessly
          const selection = window.getSelection();
          const hadSelection = selection && selection.toString().trim();
          this.stopTextToSpeech();
          if (!hadSelection) this.startTextToSpeech();
        }
      });
    }

    // Voice Dictation buttons
    const dictateBtn = document.getElementById("dictateBtn");
    if (dictateBtn) {
      dictateBtn.addEventListener("click", () => this.toggleDictation());
    }
    const dictationStopBtn = document.getElementById("dictationStopBtn");
    if (dictationStopBtn) {
      dictationStopBtn.addEventListener("click", () => this.stopDictation());
    }

    // Header & Footer buttons
    const headerFooterBtn = document.getElementById("headerFooterBtn");
    if (headerFooterBtn) {
      headerFooterBtn.addEventListener("click", () =>
        this.openHeaderFooterMode("header"),
      );
    }
    const hfPageNumBtn = document.getElementById("hfPageNumBtn");
    if (hfPageNumBtn) {
      hfPageNumBtn.addEventListener("click", () => this.insertHFPageNumber());
    }
    const hfDateBtn = document.getElementById("hfDateBtn");
    if (hfDateBtn) {
      hfDateBtn.addEventListener("click", () => this.insertHFDate());
    }
    const hfSwitchBtn = document.getElementById("hfSwitchBtn");
    if (hfSwitchBtn) {
      hfSwitchBtn.addEventListener("click", () => this.switchHFZone());
    }
    const hfCloseBtn = document.getElementById("hfCloseBtn");
    if (hfCloseBtn) {
      hfCloseBtn.addEventListener("click", () => this.closeHeaderFooterMode());
    }

    // Double-click to enter header/footer editing
    document.getElementById("pageHeaderZone")?.addEventListener("dblclick", () => {
      this.openHeaderFooterMode("header");
    });
    document.getElementById("pageFooterZone")?.addEventListener("dblclick", () => {
      this.openHeaderFooterMode("footer");
    });

    // Click on editor body while in HF mode → close HF mode
    this.editor.addEventListener("mousedown", () => {
      if (this.hfEditMode) this.closeHeaderFooterMode();
    });

    // Zoom controls
    const zoomInBtn = document.getElementById("zoomInBtn");
    if (zoomInBtn) {
      zoomInBtn.addEventListener("click", () => this.zoomIn());
    }

    const zoomOutBtn = document.getElementById("zoomOutBtn");
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener("click", () => this.zoomOut());
    }

    // Modal close buttons
    const closeFindBtn = document.getElementById("closeFindBtn");
    if (closeFindBtn) {
      closeFindBtn.addEventListener("click", () => this.hideFindModal());
    }

    const closeReplaceBtn = document.getElementById("closeReplaceBtn");
    if (closeReplaceBtn) {
      closeReplaceBtn.addEventListener("click", () => this.hideReplaceModal());
    }

    // Find functionality
    const findNextBtn = document.getElementById("findNextBtn");
    if (findNextBtn) {
      findNextBtn.addEventListener("click", () => this.findNext());
    }

    const findPrevBtn = document.getElementById("findPrevBtn");
    if (findPrevBtn) {
      findPrevBtn.addEventListener("click", () => this.findPrevious());
    }

    const replaceBtnModal = document.getElementById("replaceBtnModal");
    if (replaceBtnModal) {
      replaceBtnModal.addEventListener("click", () => this.replaceCurrent());
    }

    const replaceAllBtn = document.getElementById("replaceAllBtn");
    if (replaceAllBtn) {
      replaceAllBtn.addEventListener("click", () => this.replaceAll());
    }

    // Clear recent documents
    const clearRecentBtn = document.getElementById("clearRecentBtn");
    if (clearRecentBtn) {
      clearRecentBtn.addEventListener("click", () =>
        this.clearRecentDocuments(),
      );
    }

    // Rename modal
    const closeRenameModal = document.getElementById("closeRenameModal");
    if (closeRenameModal) {
      closeRenameModal.addEventListener("click", () => {
        this.hideRenameModal();
      });
    }

    const cancelRenameBtn = document.getElementById("cancelRenameBtn");
    if (cancelRenameBtn) {
      cancelRenameBtn.addEventListener("click", () => {
        this.hideRenameModal();
      });
    }

    const confirmRenameBtn = document.getElementById("confirmRenameBtn");
    if (confirmRenameBtn) {
      confirmRenameBtn.addEventListener("click", () => {
        this.confirmRename();
      });
    }

    // Help modal
    const closeHelpModal = document.getElementById("closeHelpModal");
    if (closeHelpModal) {
      closeHelpModal.addEventListener("click", () => {
        this.hideHelpModal();
      });
    }

    const closeHelpBtn = document.getElementById("closeHelpBtn");
    if (closeHelpBtn) {
      closeHelpBtn.addEventListener("click", () => {
        this.hideHelpModal();
      });
    }

    // Spell check button
    const spellCheckBtn = document.getElementById("spellCheckBtn");
    if (spellCheckBtn) {
      spellCheckBtn.addEventListener("click", () => this.toggleSpellCheck());
    }

    // Help modal tabs
    document.querySelectorAll(".help-tab").forEach((tab) => {
      tab.addEventListener("click", (e) => {
        this.switchHelpTab(e.target.dataset.tab);
      });
    });

    // Context menu item clicks with event delegation
    document.addEventListener("click", (e) => {
      const contextMenuItem = e.target.closest(".context-menu-item");
      if (contextMenuItem && contextMenuItem.closest("#tabContextMenu")) {
        const action = contextMenuItem.textContent.trim().toLowerCase();
        if (action.includes("rename")) {
          this.renameCurrentDocument();
        } else if (action.includes("duplicate")) {
          this.duplicateCurrentDocument();
        } else if (action.includes("close")) {
          this.closeCurrentDocument();
        }
      }
    });
  }

  // All existing methods from the original implementation are preserved exactly
  startEditor() { document.getElementById("welcomeScreen").classList.remove("active"); document.getElementById("editorContainer").style.display = "flex"; this.layout.render(); this.updateWordCount(); window.statsDashboard?.updateStats?.(); }

  showTour() { this.showHelpModal(); }

  showHelpModal() {
    const modal = document.getElementById("helpModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideHelpModal() {
    const modal = document.getElementById("helpModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  switchHelpTab(tabName) {
    // Switch active tab button
    document.querySelectorAll(".help-tab").forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.tab === tabName) {
        tab.classList.add("active");
      }
    });

    // Switch active tab content
    document.querySelectorAll(".help-tab-content").forEach((content) => {
      content.classList.remove("active");
      if (content.dataset.tab === tabName) {
        content.classList.add("active");
      }
    });
  }

  showFindModal() {
    const modal = document.getElementById("findModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideFindModal() {
    const modal = document.getElementById("findModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  showReplaceModal() {
    const modal = document.getElementById("replaceModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideReplaceModal() {
    const modal = document.getElementById("replaceModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // Missing methods that are referenced in event listeners
  addNewDocument() {
  clearTimeout(this.autoSaveTimer); this.saveDocumentState();
  const id = "doc-" + crypto.randomUUID();
  const doc = this.storage.normalize({id,name:"Untitled document",content:"<p><br></p>"});
  this.documents[id] = doc; this.storage.rebuildTabs(); this.switchDocument(id); this.saveDocumentState();
}

  insertImage() { const input=document.createElement("input");input.type="file";input.accept="image/png,image/jpeg,image/gif,image/webp";const id=this.currentDocId;this.commands.remember();input.onchange=()=>{const file=input.files[0];if(!file)return;if(!/^image\/(png|jpeg|gif|webp)$/.test(file.type)||file.size>10*1024*1024)return this.showToast("Choose a PNG, JPEG, GIF, or WebP image under 10 MB.","warning");const reader=new FileReader();reader.onload=()=>{if(this.currentDocId!==id)return this.showToast("The document changed. Insert the image again.","info");const img=document.createElement("img");img.src=reader.result;img.alt=file.name.replace(/\.[^.]+$/,"");this.executeCommand("insertHTML",img.outerHTML);};reader.readAsDataURL(file);};input.click(); }

  insertTable() { this.workspace.insertTable(); }

  insertLink() { this.workspace.insertLink(); }

  toggleSidebar() { const collapsed=document.getElementById("sidebar").classList.toggle("collapsed");document.getElementById("toggleSidebarBtn").setAttribute("aria-expanded",!collapsed);this.layout.render(); }

  findNext() { this.commands.find(document.getElementById("findInput").value); }

  findPrevious() { this.commands.find(document.getElementById("findInput").value,true); }

  // Helper function to select text at a specific position
  selectTextAtPosition(start,end) { const range=this.commands.textRange(start,end);if(!range)return;getSelection().removeAllRanges();getSelection().addRange(range);this.commands.remember(); }

  replaceCurrent() { this.commands.replaceCurrent(); }

  // Helper function for find in replace modal
  findNextInReplace() { this.commands.find(document.getElementById("replaceFindInput").value); }

  replaceAll() { this.commands.replaceAll(); }

  clearRecentDocuments() { this.storage.clearRecent(); }

  confirmRename() { const name=document.getElementById("renameInput").value.trim();if(!name)return;this.currentDoc.name=name;this.storage.rebuildTabs();this.saveDocumentState();this.hideRenameModal(); }

  hideRenameModal() {
    const modal = document.getElementById("renameModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  switchDocument(id) {
  if (!this.documents[id]) return;
  clearTimeout(this.autoSaveTimer); this.saveDocumentState();
  if (this.hfEditMode) this.closeHeaderFooterMode();
  this.contextMenuDocId = null; this.currentDocId = id; this.currentDoc = this.documents[id];
  this.storage.apply(this.storage.stateFromRecord(this.currentDoc));
  this.storage.rebuildTabs(); this.storage.persistSession(); this.workspace.renderHistory();
  this.updateSaveStatus(this.currentDoc.dirty ? "Unsaved changes" : this.currentDoc.lastSave ? "Saved in this browser" : "Not saved yet");
}

  closeDocument(id) {
  if (!this.documents[id]) return;
  if (Object.keys(this.documents).length === 1) return this.showToast("Keep at least one document open.", "info");
  if (this.currentDocId === id) this.switchDocument(Object.keys(this.documents).find(key=>key!==id));
  delete this.documents[id]; this.storage.rebuildTabs(); this.storage.persistSession();
}

  saveDocumentState(recordHistory = true) { return this.storage.save(recordHistory); }

  loadFromLocalStorage() { this.storage.loadLegacyCurrent(); }

  loadRecentDocuments() { this.recentDocuments = []; }

  saveToRecent() { this.storage.refreshRecent(); }

  updateRecentDocumentsList() {
    const recentList = document.getElementById("recentList");
    if (!recentList) return;

    if (this.recentDocuments.length === 0) {
      recentList.innerHTML =
        '<div class="empty-recent">No recent documents</div>';
      return;
    }

    recentList.innerHTML = this.recentDocuments
      .map((doc) => {
        const date = new Date(doc.lastModified);
        const timeAgo = this.getTimeAgo(date);

        return `
                <div class="recent-item" data-doc-id="${this.escapeHtml(doc.id)}">
                    <div class="recent-item-info">
                        <div class="recent-item-name">${this.escapeHtml(doc.name)}</div>
                        <div class="recent-item-meta">${this.escapeHtml(timeAgo)} • ${this.escapeHtml(doc.contentPreview)}...</div>
                    </div>
                    <button class="recent-item-action" onclick="window.charlesEditor.openRecentDocument('${this.escapeHtml(doc.id)}')">
                        Open
                    </button>
                </div>
            `;
      })
      .join("");
  }

  getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;

    return date.toLocaleDateString();
  }

  openRecentDocument(id) { this.storage.open(id); }

  switchSidebarTab(tabName) {
    if (tabName === "stats") window.statsDashboard?.updateStats?.();
    document.querySelectorAll(".sidebar-tab").forEach((tab) => {
      tab.classList.remove("active");
      if (tab.dataset.tab === tabName) {
        tab.classList.add("active");
      }
    });

    document.querySelectorAll(".sidebar-tab-content").forEach((content) => {
      content.classList.remove("active");
      if (content.dataset.tab === tabName) {
        content.classList.add("active");
      }
    });
  }

  updateTemplatesList() { this.workspace.templateCards(document.getElementById('templatesList')); }

  applyTemplate(id) { const template=this.templates.find(t=>t.id===id);if(!template)return;this.commands.change(()=>{this.editor.innerHTML=WebEditorCommands.sanitize(template.content);});this.commands.clearSelection(); }

  // Page Layout Modal Functions
  showPageLayoutModal() { this.layout.showSettings(); }

  hidePageLayoutModal() {
    const modal = document.getElementById("pageLayoutModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  applyPageLayout() { this.layout.applySettings(); }

  // Quick Styles Modal Functions
  showQuickStylesModal() {
    const modal = document.getElementById("quickStylesModal");
    if (modal) {
      modal.classList.add("active");
    }
  }

  hideQuickStylesModal() {
    const modal = document.getElementById("quickStylesModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // Templates Modal Functions
  showTemplatesModal() { this.workspace.templateCards(document.getElementById('templatesModalList'));document.getElementById('templatesModal').classList.add('active'); }

  hideTemplatesModal() {
    const modal = document.getElementById("templatesModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  applyTemplateFromModal(templateId) {
    this.applyTemplate(templateId);
    this.hideTemplatesModal();
  }

  // Advanced Formatting Modal Functions
  showAdvancedFormattingModal() {
    const modal = document.getElementById("advancedFormattingModal");
    if (modal) {
      // Reset form values
      const lineSpacing = document.getElementById("lineSpacing");
      if (lineSpacing) lineSpacing.value = "2";
      const paragraphSpacingBefore = document.getElementById(
        "paragraphSpacingBefore",
      );
      if (paragraphSpacingBefore) paragraphSpacingBefore.value = "0";
      const paragraphSpacingAfter = document.getElementById(
        "paragraphSpacingAfter",
      );
      if (paragraphSpacingAfter) paragraphSpacingAfter.value = "12";

      modal.classList.add("active");
    }
  }

  hideAdvancedFormattingModal() {
    const modal = document.getElementById("advancedFormattingModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  applyLineSpacing(value) { this.commands.paragraphFormat({lineHeight:String(value)}); }

  transformText(transform) {
    const selection = this.commands.restore();
    const text = selection.toString();
    if (!text) return this.showToast("Select text to transform.", "warning");
    const value = transform === 'uppercase' ? text.toUpperCase() : transform === 'lowercase' ? text.toLowerCase() : text.replace(/\b\w/g, char => char.toUpperCase());
    this.commands.execute('insertText', value);
  }

  applyAdvancedFormatting() { this.commands.paragraphFormat({lineHeight:document.getElementById("lineSpacing").value,marginTop:Number(document.getElementById("paragraphSpacingBefore").value)+"pt",marginBottom:Number(document.getElementById("paragraphSpacingAfter").value)+"pt"}); this.hideAdvancedFormattingModal(); }

  // Email Share Modal Functions
  showEmailShareModal() {
    const modal = document.getElementById("emailShareModal");
    if (modal) {
      // Set default subject (uses renamed IDs unique to emailShareModal)
      const emailSubject = document.getElementById("shareEmailSubject");
      if (emailSubject) {
        emailSubject.value = `Document from CharlesWebEditor - ${this.currentDoc.name}`;
      }

      // Clear other fields
      const emailTo = document.getElementById("shareEmailTo");
      if (emailTo) emailTo.value = "";
      const emailMessage = document.getElementById("shareEmailMessage");
      if (emailMessage) emailMessage.value = "";

      // Reset selected email service
      const selectedService = document.getElementById("selectedEmailService");
      if (selectedService) selectedService.value = "default";

      // Setup email service button listeners
      this.setupEmailServiceButtons();

      // Setup copy and download buttons
      this.setupEmailAlternativeButtons();

      modal.classList.add("active");
    }
  }

  setupEmailServiceButtons() {
    const serviceButtons = document.querySelectorAll(".email-service-btn");
    const selectedServiceInput = document.getElementById(
      "selectedEmailService",
    );

    serviceButtons.forEach((btn) => {
      // Remove existing listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener("click", () => {
        // Remove active state from all buttons
        document.querySelectorAll(".email-service-btn").forEach((b) => {
          b.style.border = "2px solid #e5e7eb";
          b.style.background = "white";
          b.classList.remove("active");
        });

        // Add active state to clicked button
        newBtn.style.border = "2px solid #667eea";
        newBtn.style.background = "#f0f4ff";
        newBtn.classList.add("active");

        // Update hidden input
        if (selectedServiceInput) {
          selectedServiceInput.value = newBtn.dataset.service;
        }
      });
    });
  }

  setupEmailAlternativeButtons() {
    // Copy to clipboard button
    const copyBtn = document.getElementById("copyToClipboardBtn");
    if (copyBtn) {
      const newCopyBtn = copyBtn.cloneNode(true);
      copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);

      newCopyBtn.addEventListener("click", () => {
        this.copyDocumentToClipboard();
      });
    }

    // Download for email button
    const downloadBtn = document.getElementById("downloadForEmailBtn");
    if (downloadBtn) {
      const newDownloadBtn = downloadBtn.cloneNode(true);
      downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

      newDownloadBtn.addEventListener("click", () => {
        this.downloadDocumentForEmail();
      });
    }
  }

  copyDocumentToClipboard() {
    const documentText = this.editor.innerText;
    // Read the message from the emailShareModal field (renamed to avoid duplicate ID)
    const emailMessage = document.getElementById("shareEmailMessage");
    const message = emailMessage ? emailMessage.value : "";

    const textToCopy = message
      ? `${message}\n\n--- Document Content ---\n\n${documentText}`
      : documentText;

    // Use modern clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          this.showToast(
            "Content copied to clipboard! Paste into your email.",
            "success",
          );
        })
        .catch((err) => {
          console.error("Clipboard write failed:", err);
          this.fallbackCopyToClipboard(textToCopy);
        });
    } else {
      this.fallbackCopyToClipboard(textToCopy);
    }
  }

  fallbackCopyToClipboard(text) {
    // Fallback for older browsers
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();

    try {
      document.execCommand("copy");
      this.showToast(
        "Content copied to clipboard! Paste into your email.",
        "success",
      );
    } catch (err) {
      console.error("Fallback copy failed:", err);
      this.showToast(
        "Failed to copy. Please select and copy manually.",
        "error",
      );
    }

    document.body.removeChild(textarea);
  }

  downloadDocumentForEmail() { return this.exports.export("html").catch(()=>{}); }

  hideEmailShareModal() {
    const modal = document.getElementById("emailShareModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  sendEmail() {
    const emailTo = document.getElementById("shareEmailTo");
    const emailSubject = document.getElementById("shareEmailSubject");
    const emailMessage = document.getElementById("shareEmailMessage");
    const emailIncludeDocument = document.getElementById(
      "emailIncludeDocument",
    );
    const selectedService = document.getElementById("selectedEmailService");

    if (!emailTo || !emailTo.value.trim()) {
      this.showToast("Please enter recipient email address", "warning");
      return;
    }

    if (!emailSubject || !emailSubject.value.trim()) {
      this.showToast("Please enter email subject", "warning");
      return;
    }

    const recipients = emailTo.value.split(",").map((email) => email.trim());
    const subject = emailSubject.value;
    const message = emailMessage ? emailMessage.value : "";
    const includeDocument = emailIncludeDocument
      ? emailIncludeDocument.checked
      : true;
    const service = selectedService ? selectedService.value : "default";

    // Build email body
    let body = message;
    if (includeDocument) {
      const documentText = this.editor.innerText;
      body = message
        ? `${message}\n\n--- Document Content ---\n\n${documentText}`
        : `--- Document Content ---\n\n${documentText}`;
    }

    // Truncate body if too long for URL (keep under 1800 chars for safety)
    const maxBodyLength = 1800;
    let truncatedBody = body;
    let wasTruncated = false;
    if (body.length > maxBodyLength) {
      truncatedBody =
        body.substring(0, maxBodyLength) +
        "\n\n[Content truncated. Use 'Copy Content' or 'Download as File' for full document.]";
      wasTruncated = true;
    }

    // Build URL based on selected service
    let emailUrl = "";
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(truncatedBody);
    const recipientList = recipients.join(",");

    switch (service) {
      case "gmail":
        // Gmail compose URL
        emailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientList)}&su=${encodedSubject}&body=${encodedBody}`;
        break;

      case "outlook":
        // Outlook.com compose URL
        emailUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(recipientList)}&subject=${encodedSubject}&body=${encodedBody}`;
        break;

      case "yahoo":
        // Yahoo Mail compose URL
        emailUrl = `https://compose.mail.yahoo.com/?to=${encodeURIComponent(recipientList)}&subject=${encodedSubject}&body=${encodedBody}`;
        break;

      case "default":
      default:
        // Default mailto link for native email client
        emailUrl = `mailto:${recipientList}?subject=${encodedSubject}&body=${encodedBody}`;
        break;
    }

    // Open the email URL without navigating the app away.
    // Using a hidden <a> click works for both mailto: and https: URLs.
    const tempLink = document.createElement("a");
    tempLink.href = emailUrl;
    if (service !== "default") {
      // Web clients (Gmail, Outlook, Yahoo) open in a new tab
      tempLink.target = "_blank";
      tempLink.rel = "noopener noreferrer";
    }
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    // Show appropriate message
    const serviceNames = {
      gmail: "Gmail",
      outlook: "Outlook",
      yahoo: "Yahoo Mail",
      default: "your email client",
    };

    if (wasTruncated) {
      this.showToast(
        `Opening ${serviceNames[service]}... Document was truncated. Use 'Copy Content' for full text.`,
        "warning",
      );
    } else {
      this.showToast(`Opening ${serviceNames[service]}...`, "success");
    }

    this.hideEmailShareModal();
  }

  // Export Modal Functions (Header Button)
  showExportModal() {
    const modal = document.getElementById("exportModal");
    if (modal) {
      modal.classList.add("active");

      // Setup export format button listeners
      this.setupExportFormatButtons();
    }
  }

  hideExportModal() {
    const modal = document.getElementById("exportModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  setupExportFormatButtons() {
    const formatButtons = document.querySelectorAll(".export-format-btn");

    formatButtons.forEach((btn) => {
      // Remove existing listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);

      newBtn.addEventListener("click", () => {
        const format = newBtn.dataset.format;
        this.exportDocument(format);
        this.hideExportModal();
      });
    });
  }

  exportDocument(format) {
    switch (format) {
      case "pdf":
        this.exportToPDF();
        break;
      case "docx":
        this.exportToDOCX();
        break;
      case "markdown":
        this.exportToMarkdown();
        break;
      case "html":
        this.exportToHTML();
        break;
      case "txt":
        this.exportToPlainText();
        break;
      default:
        this.showToast("Export format not supported", "error");
    }
  }

  exportToMarkdown() { return this.exports.export("md").catch(()=>{}); }

  exportToHTML() { return this.exports.export("html").catch(()=>{}); }

  exportToPlainText() { return this.exports.export("txt").catch(()=>{}); }

  // Email Modal Functions (Header Button)
  showEmailModal() {
    const modal = document.getElementById("emailModal");
    if (modal) {
      // Set default subject
      const emailSubject = document.getElementById("emailSubject");
      if (emailSubject) {
        emailSubject.value = `Document from CharlesWebEditor - ${this.currentDoc.name}`;
      }

      // Set document name for attachment preview
      const currentDocName = document.getElementById("currentDocName");
      if (currentDocName) {
        currentDocName.textContent = this.currentDoc.name || "Document";
      }

      modal.classList.add("active");
    }
  }

  hideEmailModal() {
    const modal = document.getElementById("emailModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // Share Modal Functions (Header Button)
  showShareModal() { this.workspace.share(); }

  hideShareModal() {
    const modal = document.getElementById("shareLinkModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  // Template Manager Modal Functions (Header Button)
  showTemplateManagerModal() { this.workspace.templateManager(); }

  hideTemplateManagerModal() {
    const modal = document.getElementById("templateManagerModal");
    if (modal) {
      modal.classList.remove("active");
    }
  }

  updateTemplateManagerList() { this.workspace.templateManager(); }

  applyTemplateById(index) { const template=this.templates[index];if(template)this.applyTemplate(template.id);this.hideTemplateManagerModal(); }

  saveCurrentAsTemplate() { this.workspace.saveTemplate(); }

  sendEmailFromHeader() {
    const emailTo = document.getElementById("emailTo");
    const emailSubject = document.getElementById("emailSubject");
    const emailMessage = document.getElementById("emailMessage");

    if (!emailTo || !emailTo.value.trim()) {
      this.showToast("Please enter a recipient email address", "error");
      return;
    }

    // Get document content
    const documentText = this.editor.innerText;
    const subject = emailSubject
      ? emailSubject.value
      : `Document from CharlesWebEditor - ${this.currentDoc.name}`;
    const message = emailMessage ? emailMessage.value : "";

    // Build email body and truncate to stay within mailto URL limits
    let body = message
      ? `${message}\n\n--- Document Content ---\n\n${documentText}`
      : documentText;

    const maxBodyLength = 1800;
    if (body.length > maxBodyLength) {
      body =
        body.substring(0, maxBodyLength) +
        "\n\n[Content truncated. Export the document as PDF or DOCX for the full version.]";
    }

    const mailtoLink = `mailto:${encodeURIComponent(emailTo.value)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open the mail client without navigating the app away
    const tempLink = document.createElement("a");
    tempLink.href = mailtoLink;
    document.body.appendChild(tempLink);
    tempLink.click();
    document.body.removeChild(tempLink);

    this.showToast("Opening email client...", "success");
    this.hideEmailModal();
  }

  // AI Assistant Panel Functions
  toggleAIAssistantPanel() {
    const panel = document.getElementById("aiAssistantPanel");
    if (panel) {
      if (panel.classList.contains("visible")) {
        this.hideAIAssistantPanel();
      } else {
        this.showAIAssistantPanel();
      }
    }
  }

  showAIAssistantPanel() {
    const panel = document.getElementById("aiAssistantPanel");
    if (panel) {
      panel.classList.add("visible");
      this.updateAIStats();

      // Update stats when editor content changes
      if (!this.aiStatsUpdateInterval) {
        this.aiStatsUpdateInterval = setInterval(() => {
          if (panel.classList.contains("visible")) {
            this.updateAIStats();
          }
        }, 2000); // Update every 2 seconds
      }
    }
  }

  hideAIAssistantPanel() {
    const panel = document.getElementById("aiAssistantPanel");
    if (panel) {
      panel.classList.remove("visible");

      // Clear update interval when panel is closed
      if (this.aiStatsUpdateInterval) {
        clearInterval(this.aiStatsUpdateInterval);
        this.aiStatsUpdateInterval = null;
      }
    }
  }

  updateAIStats() { window.statsDashboard?.updateStats?.();for(const [to,from] of [["aiWordCount","statsWords"],["aiCharCount","statsChars"],["aiParagraphCount","statsParagraphs"],["aiReadingTime","statsReadingTime"]]){const el=document.getElementById(to);if(el)el.textContent=document.getElementById(from)?.textContent||"0";} }

  checkGrammarAndStyle() { this.workspace.checkWriting(); }

  improveSelectedText() { this.workspace.previewEdit("clean"); }

  improveText(text) {
    let improved = text.trim();

    // Capitalize first letter of the selection
    if (improved.length > 0) {
      improved = improved.charAt(0).toUpperCase() + improved.slice(1);
    }

    // Remove extra whitespace
    improved = improved.replace(/\s+/g, " ");

    // Remove common redundant filler phrases
    improved = improved.replace(
      /\b(very very|really really|quite quite)\b/gi,
      (m) => m.split(" ")[0],
    );
    improved = improved.replace(/\b(in order to)\b/gi, "to");
    improved = improved.replace(/\b(due to the fact that)\b/gi, "because");
    improved = improved.replace(/\b(at this point in time)\b/gi, "currently");
    improved = improved.replace(/\b(for the purpose of)\b/gi, "for");

    // Ensure sentence ends with punctuation
    if (improved.length > 0 && !/[.!?]$/.test(improved)) {
      improved += ".";
    }

    return improved;
  }

  makeTextShorter() { this.workspace.previewEdit("shorten"); }

  shortenText(text) {
    // Remove filler words and simplify (basic implementation)
    const fillerWords =
      /\b(very|really|quite|rather|pretty|somewhat|extremely|incredibly)\s+/gi;
    let shortened = text.replace(fillerWords, "");

    // Remove redundant phrases
    shortened = shortened.replace(
      /\b(due to the fact that|because of the fact that)\b/gi,
      "because",
    );
    shortened = shortened.replace(/\b(at this point in time)\b/gi, "now");
    shortened = shortened.replace(/\b(in order to)\b/gi, "to");

    // Clean up extra spaces
    shortened = shortened.replace(/\s+/g, " ").trim();

    return shortened || text; // Return original if too short
  }

  applyStyle(name) { this.commands.style(name); }

  updateWordCount() {
    const text = this.editor.innerText || this.editor.textContent;
    const words = typeof Intl.Segmenter === 'function' ? [...new Intl.Segmenter(this.editor.lang || 'en', {granularity:'word'}).segment(text)].filter(part=>part.isWordLike).length : (text.match(/[\p{L}\p{N}]+/gu)||[]).length;
    const characters = text.trim() ? [...text].length : 0;
    const readingTime = Math.ceil(words / 200);

    document.getElementById("wordCount").textContent = words;
    document.getElementById("charCount").textContent = characters;
    document.getElementById("readingTime").textContent = words > 0 && words < 200 ? "<1 min" : readingTime + " min";
  }

  updateStatusBar() {
    const fontFamily = document.getElementById("fontFamily").value;
    const fontSize = document.getElementById("fontSize").value;
    document.getElementById("currentFont").textContent =
      `${fontFamily}, ${fontSize}`;
  }

  updateSaveStatus(status) { document.getElementById("saveStatus").textContent=status;document.getElementById("autosaveSpinner").style.display=status.startsWith("Saving")?"inline-block":"none"; }

  autoSave() { return this.saveDocumentState(); }

  setupDragAndDrop() {
    // Prevent default drag behaviors on the page
    ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      document.addEventListener(
        eventName,
        (e) => {
          e.preventDefault();
          e.stopPropagation();
        },
        false,
      );
    });

    // Highlight drop zone when dragging over
    ["dragenter", "dragover"].forEach((eventName) => {
      document.addEventListener(
        eventName,
        () => {
          if (this.editor) {
            this.editor.classList.add("drag-over");
          }
        },
        false,
      );
    });

    ["dragleave", "drop"].forEach((eventName) => {
      document.addEventListener(
        eventName,
        () => {
          if (this.editor) {
            this.editor.classList.remove("drag-over");
          }
        },
        false,
      );
    });

    // Handle dropped files
    document.addEventListener(
      "drop",
      (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          const file = files[0];
          this.handleDroppedFile(file);
        }
      },
      false,
    );
  }

  handleDroppedFile(file) { this.workspace.openFile(file); }

  handleEditorInput() { this.currentDoc.dirty=true;this.hasUnsavedChanges=true;this.updateWordCount();this.updateOutline();this.updateSaveStatus("Unsaved changes");clearTimeout(this.autoSaveTimer);this.autoSaveTimer=setTimeout(()=>this.saveDocumentState(),this.debounceDelay); }

  // ── Text-to-Speech ───────────────────────────────────────────────────────

  startTextToSpeech() {
    if (!("speechSynthesis" in window)) {
      this.showToast(
        "Text-to-Speech is not supported in this browser.",
        "error",
      );
      return;
    }

    const selection = window.getSelection();
    const text =
      selection && selection.toString().trim()
        ? selection.toString().trim()
        : this.editor.innerText;

    if (!text.trim()) {
      this.showToast("Nothing to read. Add some text first.", "warning");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = parseFloat(
      document.getElementById("ttsSpeed")?.value || "1",
    );

    utterance.onstart = () => {
      this.ttsActive = true;
      document.getElementById("ttsPanel")?.classList.add("active");
      const btn = document.getElementById("ttsBtn");
      if (btn) {
        btn.classList.add("active");
        btn.innerHTML =
          '<i class="fas fa-volume-up"></i><span>Stop</span>';
      }
    };

    utterance.onend = () => this.stopTextToSpeech();
    utterance.onerror = (e) => {
      if (e.error !== "interrupted") this.stopTextToSpeech();
    };

    this.currentUtterance = utterance;
    window.speechSynthesis.speak(utterance);
    this.showToast(
      selection && selection.toString().trim()
        ? "Reading selected text..."
        : "Reading full document...",
      "info",
    );
  }

  pauseTextToSpeech() {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      const icon = document.getElementById("ttsPauseIcon");
      if (icon) icon.className = "fas fa-pause";
      const status = document.getElementById("ttsStatus");
      if (status)
        status.innerHTML = '<i class="fas fa-volume-up"></i> Reading...';
    } else if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      const icon = document.getElementById("ttsPauseIcon");
      if (icon) icon.className = "fas fa-play";
      const status = document.getElementById("ttsStatus");
      if (status) status.innerHTML = '<i class="fas fa-pause"></i> Paused';
    }
  }

  stopTextToSpeech() {
    window.speechSynthesis.cancel();
    this.ttsActive = false;
    this.currentUtterance = null;
    document.getElementById("ttsPanel")?.classList.remove("active");
    const btn = document.getElementById("ttsBtn");
    if (btn) {
      btn.classList.remove("active");
      btn.innerHTML = '<i class="fas fa-volume-up"></i><span>Read</span>';
    }
    const icon = document.getElementById("ttsPauseIcon");
    if (icon) icon.className = "fas fa-pause";
    const status = document.getElementById("ttsStatus");
    if (status)
      status.innerHTML = '<i class="fas fa-volume-up"></i> Reading...';
  }

  // ── Voice Dictation ───────────────────────────────────────────────────────

  toggleDictation() {
    if (this.dictationActive) {
      this.stopDictation();
    } else {
      this.startDictation();
    }
  }

  startDictation() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      this.showToast(
        "Voice dictation is not supported in this browser. Try Chrome or Edge.",
        "error",
      );
      return;
    }

    const langMap = { en: "en-US", es: "es-ES", fr: "fr-FR", de: "de-DE" };
    const langKey =
      document.getElementById("languageSelect")?.value || "en";

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = langMap[langKey] || "en-US";

    // Save cursor position in editor
    this.editor.focus();
    const sel = window.getSelection();
    if (sel.rangeCount) {
      this.dictationRange = sel.getRangeAt(0).cloneRange();
    }

    this.recognition.onstart = () => {
      this.dictationActive = true;
      document.getElementById("dictationIndicator")?.classList.add("active");
      const btn = document.getElementById("dictateBtn");
      if (btn)
        btn.innerHTML =
          '<i class="fas fa-microphone-slash"></i><span>Stop</span>';
      btn?.classList.add("active");
    };

    this.recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }

      const interimEl = document.getElementById("dictationInterim");
      if (interimEl) interimEl.textContent = interim || "Listening...";

      if (final) {
        this.editor.focus();
        if (this.dictationRange) {
          const s = window.getSelection();
          s.removeAllRanges();
          s.addRange(this.dictationRange);
        }
        document.execCommand("insertText", false, final + " ");
        const s = window.getSelection();
        if (s.rangeCount) {
          this.dictationRange = s.getRangeAt(0).cloneRange();
        }
        this.handleEditorInput();
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        this.showToast(`Dictation error: ${event.error}`, "error");
      }
      this.stopDictation();
    };

    // Auto-restart to keep listening continuously
    this.recognition.onend = () => {
      if (this.dictationActive && this.recognition) {
        try {
          this.recognition.start();
        } catch (_) {
          this.stopDictation();
        }
      }
    };

    this.recognition.start();
    this.showToast("Listening — speak now", "info");
  }

  stopDictation() {
    this.dictationActive = false;
    if (this.recognition) {
      this.recognition.onend = null;
      this.recognition.stop();
      this.recognition = null;
    }
    document.getElementById("dictationIndicator")?.classList.remove("active");
    const btn = document.getElementById("dictateBtn");
    if (btn) {
      btn.classList.remove("active");
      btn.innerHTML = '<i class="fas fa-microphone"></i><span>Dictate</span>';
    }
    const interimEl = document.getElementById("dictationInterim");
    if (interimEl) interimEl.textContent = "Listening...";
    this.showToast("Dictation stopped", "info");
  }

  // ── Header & Footer ──────────────────────────────────────────────────────

  openHeaderFooterMode(zone = "header") {
    this.hfEditMode = true;
    this.hfActiveZone = zone;

    const toolbar = document.getElementById("hfEditToolbar");
    const headerContent = document.getElementById("pageHeaderContent");
    const footerContent = document.getElementById("pageFooterContent");

    if (toolbar) toolbar.classList.add("active");
    if (headerContent) headerContent.contentEditable = "true";
    if (footerContent) footerContent.contentEditable = "true";

    document.getElementById("page")?.classList.add("hf-edit-mode");

    headerContent?.classList.remove("hf-zone-active");
    footerContent?.classList.remove("hf-zone-active");

    const target =
      zone === "header" ? headerContent : footerContent;
    target?.classList.add("hf-zone-active");
    target?.focus();

    this._updateHFLabel(zone);
  }

  _updateHFLabel(zone) {
    const label = document.getElementById("hfEditingLabel");
    const switchBtn = document.getElementById("hfSwitchBtn");
    if (label) {
      label.innerHTML =
        zone === "header"
          ? '<i class="fas fa-heading"></i> Editing: Header'
          : '<i class="fas fa-shoe-prints"></i> Editing: Footer';
    }
    if (switchBtn) {
      switchBtn.innerHTML =
        zone === "header"
          ? '<i class="fas fa-arrow-down"></i> Switch to Footer'
          : '<i class="fas fa-arrow-up"></i> Switch to Header';
    }
  }

  switchHFZone() {
    this.openHeaderFooterMode(
      this.hfActiveZone === "header" ? "footer" : "header",
    );
  }

  closeHeaderFooterMode() {
    this.hfEditMode = false;

    const toolbar = document.getElementById("hfEditToolbar");
    const headerContent = document.getElementById("pageHeaderContent");
    const footerContent = document.getElementById("pageFooterContent");

    if (headerContent) {
      this.currentDoc.headerHtml = headerContent.innerHTML;
      headerContent.contentEditable = "false";
      headerContent.classList.remove("hf-zone-active");
      headerContent.dataset.empty = headerContent.innerHTML.trim()
        ? "false"
        : "true";
    }
    if (footerContent) {
      this.currentDoc.footerHtml = footerContent.innerHTML;
      footerContent.contentEditable = "false";
      footerContent.classList.remove("hf-zone-active");
      footerContent.dataset.empty = footerContent.innerHTML.trim()
        ? "false"
        : "true";
    }

    if (toolbar) toolbar.classList.remove("active");
    document.getElementById("page")?.classList.remove("hf-edit-mode");
    this.saveDocumentState();
    this.editor.focus();
  }

  insertHFPageNumber() {
    const el = document.getElementById(
      this.hfActiveZone === "header"
        ? "pageHeaderContent"
        : "pageFooterContent",
    );
    if (!el) return;
    el.focus();
    document.execCommand(
      "insertHTML",
      false,
      '<span class="hf-page-num" contenteditable="false" title="Page number">1</span>&nbsp;',
    );
  }

  insertHFDate() {
    const el = document.getElementById(
      this.hfActiveZone === "header"
        ? "pageHeaderContent"
        : "pageFooterContent",
    );
    if (!el) return;
    el.focus();
    const today = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    document.execCommand("insertText", false, today);
  }

  restoreHeaderFooter() {
    const headerContent = document.getElementById("pageHeaderContent");
    const footerContent = document.getElementById("pageFooterContent");
    if (headerContent) {
      headerContent.innerHTML = this.currentDoc.headerHtml || "";
      headerContent.dataset.empty = (this.currentDoc.headerHtml || "").trim()
        ? "false"
        : "true";
    }
    if (footerContent) {
      footerContent.innerHTML = this.currentDoc.footerHtml || "";
      footerContent.dataset.empty = (this.currentDoc.footerHtml || "").trim()
        ? "false"
        : "true";
    }
  }

  _hfToExportHtml(html) {
    if (!html || !html.trim()) return "";
    return html.replace(
      /<span[^>]*class="hf-page-num"[^>]*>[^<]*<\/span>/g,
      '<span class="pageNumber"></span>',
    );
  }

  toggleFocusMode() {
    const container = document.getElementById("editorContainer");
    const isFocused = container.classList.toggle("focus-mode");
    const btn = document.getElementById("focusModeBtn");
    if (isFocused) {
      if (btn) btn.innerHTML = '<i class="fas fa-eye-slash"></i><span>Focus</span>';
      this.showToast("Focus mode on — press Esc or Ctrl+Shift+F to exit", "info");
      this.editor.focus();
    } else {
      if (btn) btn.innerHTML = '<i class="fas fa-eye"></i><span>Focus</span>';
    }
  }

  updateOutline() { const panel=document.getElementById("outlineList");if(!panel)return;panel.replaceChildren();const headings=[...this.editor.querySelectorAll("h1,h2,h3,h4")].filter(el=>!el.closest(".toc-container"));if(!headings.length){const empty=document.createElement("p");empty.className="empty-outline";empty.textContent="Use heading styles to build an outline.";panel.append(empty);return;}for(const heading of headings){const button=document.createElement("button");button.className="outline-item";button.textContent=heading.textContent||"Untitled heading";button.style.paddingLeft=(Number(heading.tagName[1])-1)*8+"px";button.addEventListener("click",()=>{heading.scrollIntoView({block:"center",inline:"nearest"});const range=document.createRange();range.selectNodeContents(heading);range.collapse(true);getSelection().removeAllRanges();getSelection().addRange(range);this.commands.remember();});panel.append(button);} }

  insertTOC() { const headings=[...this.editor.querySelectorAll("h1,h2,h3")].filter(el=>!el.closest(".toc-container"));if(!headings.length)return this.showToast("Add heading styles first.","info");this.commands.change(()=>{this.editor.querySelector(".toc-container")?.remove();const box=document.createElement("div");box.className="toc-container";const label=document.createElement("p");label.textContent="Contents";const list=document.createElement("ol");for(const heading of headings){heading.id||="heading-"+crypto.randomUUID();const item=document.createElement("li"),link=document.createElement("a");link.href="#"+heading.id;link.textContent=heading.textContent;item.style.marginLeft=(Number(heading.tagName[1])-1)*12+"px";item.append(link);list.append(item);}box.append(label,list);this.editor.prepend(box);}); }

  markdownToHtml(md) {
    const lines = md.split("\n");
    let html = "";
    let inList = false;
    let inOrderedList = false;
    let inCodeBlock = false;

    for (const line of lines) {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          html += "</code></pre>";
          inCodeBlock = false;
        } else {
          if (inList) { html += "</ul>"; inList = false; }
          if (inOrderedList) { html += "</ol>"; inOrderedList = false; }
          html += "<pre><code>";
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) { html += this._escHtml(line) + "\n"; continue; }

      if (inList && !line.match(/^[-*+]\s/)) { html += "</ul>"; inList = false; }
      if (inOrderedList && !line.match(/^\d+\.\s/)) { html += "</ol>"; inOrderedList = false; }

      if (line.startsWith("### ")) { html += `<h3>${this._inlineMd(line.slice(4))}</h3>`; continue; }
      if (line.startsWith("## ")) { html += `<h2>${this._inlineMd(line.slice(3))}</h2>`; continue; }
      if (line.startsWith("# ")) { html += `<h1>${this._inlineMd(line.slice(2))}</h1>`; continue; }
      if (line.match(/^---+$/) || line.match(/^\*\*\*+$/)) { html += "<hr>"; continue; }
      if (line.startsWith("> ")) { html += `<blockquote>${this._inlineMd(line.slice(2))}</blockquote>`; continue; }

      if (line.match(/^[-*+]\s/)) {
        if (!inList) { html += "<ul>"; inList = true; }
        html += `<li>${this._inlineMd(line.slice(2))}</li>`;
        continue;
      }
      if (line.match(/^\d+\.\s/)) {
        if (!inOrderedList) { html += "<ol>"; inOrderedList = true; }
        html += `<li>${this._inlineMd(line.replace(/^\d+\.\s/, ""))}</li>`;
        continue;
      }

      html += line.trim() === "" ? "<br>" : `<p>${this._inlineMd(line)}</p>`;
    }

    if (inList) html += "</ul>";
    if (inOrderedList) html += "</ol>";
    if (inCodeBlock) html += "</code></pre>";
    return html;
  }

  _inlineMd(text) {
    return this._escHtml(text)
      .replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/__(.+?)__/g, "<strong>$1</strong>")
      .replace(/_(.+?)_/g, "<em>$1</em>")
      .replace(/~~(.+?)~~/g, "<del>$1</del>")
      .replace(/`(.+?)`/g, "<code>$1</code>")
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  }

  _escHtml(text) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }

  showToast(message,type="success") { const toast=document.getElementById("toast");toast.className="toast "+type+" visible";toast.replaceChildren();const icon=document.createElement("i");icon.className="fas "+(type==="error"?"fa-exclamation-circle":type==="warning"?"fa-exclamation-triangle":"fa-info-circle");const text=document.createElement("span");text.textContent=message;toast.append(icon,text);clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>toast.classList.remove("visible"),3500); }

  showExportProgress(format) {
    // Create or update export progress indicator
    let progressIndicator = document.getElementById("exportProgress");
    if (!progressIndicator) {
      progressIndicator = document.createElement("div");
      progressIndicator.id = "exportProgress";
      progressIndicator.className = "export-progress";
      progressIndicator.innerHTML = `
        <div class="export-progress-content">
          <div class="export-progress-spinner"></div>
          <span class="export-progress-text">Exporting ${format}...</span>
        </div>
      `;
      document.body.appendChild(progressIndicator);
    } else {
      progressIndicator.querySelector(".export-progress-text").textContent =
        `Exporting ${format}...`;
      progressIndicator.style.display = "flex";
    }
  }

  hideExportProgress() {
    const progressIndicator = document.getElementById("exportProgress");
    if (progressIndicator) {
      progressIndicator.style.display = "none";
    }
  }

  executeCommand(command,value=null) { this.commands.execute(command,value); }

  // Missing essential methods
  undo() { this.commands.undo(); }

  redo() { this.commands.redo(); }

  toggleTheme() {
    this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
    this.setTheme(this.currentTheme);
  }

  setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);

    const themeIcon = document.getElementById("themeIcon");
    if (themeIcon) {
      themeIcon.className = theme === "dark" ? "fas fa-sun" : "fas fa-moon";
    }

    // Update editor page background
    if (this.page) {
      if (theme === "dark") {
        this.page.style.background = "#1e293b";
        this.page.style.color = "#f8fafc";
      } else {
        this.page.style.background = "white";
        this.page.style.color = "black";
      }
    }

    WebEditorStorage.set("editor_theme", theme);
    this.showToast(`Switched to ${theme} mode`, "success");
  }

  async exportToPDF() { return this.exports.export("pdf").catch(()=>{}); }

  async exportToDOCX() { return this.exports.export("docx").catch(()=>{}); }

  changeLanguage(lang) { this.editor.lang=({en:"en-US",es:"es-ES",fr:"fr-FR",de:"de-DE"})[lang]||"en-US";WebEditorStorage.set("editor_language",lang); }

  setPageSize(size) { this.layout.set({size}); }

  setPageOrientation(orientation) { this.layout.set({orientation}); }

  toggleSpellCheck() {
    this.spellCheckEnabled = !this.spellCheckEnabled;
    this.editor.spellcheck = this.spellCheckEnabled;

    const btn = document.getElementById("spellCheckBtn");
    if (this.spellCheckEnabled) {
      btn.classList.add("active");
      this.showToast("Spell check enabled", "success");
    } else {
      btn.classList.remove("active");
      this.showToast("Spell check disabled", "success");
    }
  }

  openDocument() { const input=document.createElement("input");input.type="file";input.accept=".txt,.html,.htm,.docx,.md";input.onchange=()=>{if(input.files[0])this.workspace.openFile(input.files[0]);};input.click(); }

  saveDocument() { this.saveDocumentState();if(this.fileHandles?.[this.currentDocId])return this.saveToExistingHandle(this.fileHandles[this.currentDocId]);return this.saveWithFilePicker(); }

  async saveWithFilePicker() {
 if(!window.showSaveFilePicker)return this.showSaveModal();
 const snapshot=this.exports.snapshot();
 try{const handle=await window.showSaveFilePicker({suggestedName:this.exports.filename("docx"),types:[{description:"Word document",accept:{"application/vnd.openxmlformats-officedocument.wordprocessingml.document":[".docx"]}},{description:"PDF",accept:{"application/pdf":[".pdf"]}},{description:"HTML",accept:{"text/html":[".html"]}},{description:"Markdown",accept:{"text/markdown":[".md"]}},{description:"Text",accept:{"text/plain":[".txt"]}}]});this.fileHandles||={};this.fileHandles[snapshot.id]=handle;return this.saveToExistingHandle(handle,snapshot);}catch(error){if(error.name!=="AbortError")this.showToast("File save failed. Try Export or another location.","error");}
}

  async saveToExistingHandle(handle,snapshot=this.exports.snapshot()) { try{const extension=handle.name.split(".").pop().toLowerCase();const blob=await this.exports.blob(extension,snapshot);const writable=await handle.createWritable();await writable.write(blob);await writable.close();this.showToast("Saved file: "+handle.name,"success");if(this.currentDocId===snapshot.id)this.updateSaveStatus(this.editor.innerHTML===snapshot.payload.html?"Saved to file":"File saved; newer edits remain");}catch(error){if(this.fileHandles)delete this.fileHandles[snapshot.id];this.showToast("File save failed: "+error.message,"error");} }

  generateMarkdownBlob() { return new Blob([this.exports.markdown()],{type:"text/markdown"}); }

  showSaveModal() {
    const modal = document.getElementById("saveModal");
    if (modal) modal.classList.add("active");
  }

  hideSaveModal() {
    const modal = document.getElementById("saveModal");
    if (modal) modal.classList.remove("active");
  }

  // ── Generate blobs ────────────────────────────────────────────────────────

  async generateDOCXBlob() { return {blob:await this.exports.blob("docx"),ext:".docx"}; }

  async generatePDFBlob() { return this.exports.blob("pdf"); }

  // ── Save to local drive ───────────────────────────────────────────────────

  async saveWithFormat(format) { this.hideSaveModal();return this.exports.export(format).catch(()=>{}); }

  zoomIn() { this.layout.zoom(this.zoomLevel+10); }

  zoomOut() { this.layout.zoom(this.zoomLevel-10); }

  updateZoom() { this.layout.render(); }

  // Context menu methods for tabs
  showTabContextMenu(tab, x, y) {
    this.contextMenuTab = tab;
    this.contextMenuDocId = tab.dataset.docId;

    let contextMenu = document.getElementById("tabContextMenu");
    if (!contextMenu) {
      contextMenu = document.createElement("div");
      contextMenu.id = "tabContextMenu";
      contextMenu.className = "context-menu";
      contextMenu.innerHTML = `
                <button class="context-menu-item" onclick="window.charlesEditor.renameCurrentDocument()">
                    <i class="fas fa-edit"></i> Rename
                </button>
                <button class="context-menu-item" onclick="window.charlesEditor.duplicateCurrentDocument()">
                    <i class="fas fa-copy"></i> Duplicate
                </button>
                <button class="context-menu-item" onclick="window.charlesEditor.closeCurrentDocument()">
                    <i class="fas fa-times"></i> Close
                </button>
            `;
      document.body.appendChild(contextMenu);
    }

    contextMenu.style.left = x + "px";
    contextMenu.style.top = y + "px";
    contextMenu.style.display = "block";
  }

  hideTabContextMenu() {
    const contextMenu = document.getElementById("tabContextMenu");
    if (contextMenu) {
      contextMenu.style.display = "none";
    }
  }

  renameCurrentDocument() { this.workspace.rename(); }

  duplicateCurrentDocument() {
  const originalId=this.contextMenuDocId||this.currentDocId;
  if(originalId===this.currentDocId)this.storage.record();
  const original=this.documents[originalId];if(!original)return;
  const id="doc-"+crypto.randomUUID();this.documents[id]=this.storage.normalize({...this.storage.stateFromRecord(original),id,name:original.name+" (Copy)"});
  this.hideTabContextMenu();this.storage.rebuildTabs();this.switchDocument(id);this.saveDocumentState();
}

  closeCurrentDocument() {
    const docId = this.contextMenuDocId || this.currentDocId;
    this.closeDocument(docId);
    this.hideTabContextMenu();
  }
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  try {
    window.charlesEditor = new CharlesWebEditor();
    // Alias for backward compatibility with inline handlers
    window.charliesEditor = window.charlesEditor;
    const app = window.charlesEditor;
    await app.storage.initialize();
    window.statsDashboard = new StatsDashboard(app.editor);
    app.workspace.init();
    window.formatPainter = new FormatPainter();
    window.contextMenu = new ContextMenu();
    window.autocomplete = new Autocomplete(app.editor);
    app.startEditor();


  } catch (error) {
    console.error("❌ Failed to initialize CharlesWebEditor:", error);

    // Show user-friendly error message
    document.body.innerHTML = `
      <div style="max-width:600px;margin:100px auto;padding:40px;
           background:#fee2e2;border:2px solid #dc2626;border-radius:10px;
           font-family:system-ui,sans-serif;text-align:center;">
        <h1 style="color:#dc2626;margin-bottom:20px;">⚠️ Initialization Error</h1>
        <p style="font-size:1.1em;color:#333;margin-bottom:15px;">
          CharlesWebEditor failed to load properly.
        </p>
        <p style="font-size:0.9em;color:#666;margin-bottom:25px;">
          Error: ${String(error.message).replace(/[<>&]/g, "")}
        </p>
        <button onclick="location.reload()"
                style="padding:12px 24px;background:#dc2626;color:white;
                border:none;border-radius:6px;cursor:pointer;font-size:1em;
                font-weight:600;">
          Reload Page
        </button>
      </div>
    `;
  }
});

// Handle errors gracefully
window.addEventListener("error", (event) => {
  console.error("WebEditor error:", event.message, event.filename, event.lineno, event.colno, event.error);
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", (event) => {
  console.error("Unhandled promise rejection:", event.reason);
});

// ========================================
// ENHANCED FEATURES IMPLEMENTATION
// ========================================

// Keep the compact header title in sync with existing document management.
document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("headerDocumentTitle");
  const tabs = document.getElementById("documentTabs");
  if (!title || !tabs || !window.charlesEditor) return;
  const refreshTitle = () => {
    title.replaceChildren(...Array.from(tabs.querySelectorAll(".tab"), tab => {
      const option = new Option(tab.querySelector("span")?.textContent || "Untitled", tab.dataset.docId);
      option.selected = tab.dataset.docId === window.charlesEditor.currentDocId;
      return option;
    }));
  };
  title.addEventListener("change", () => window.charlesEditor.switchDocument(title.value));
  new MutationObserver(refreshTitle).observe(tabs, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["class"] });
  refreshTitle();
});

// Show only the selected sidebar section, including on the first load.
document.addEventListener("DOMContentLoaded", () => {
  const active = document.querySelector(".sidebar-tab.active");
  window.charlesEditor?.switchSidebarTab(active?.dataset.tab || "templates");
});
