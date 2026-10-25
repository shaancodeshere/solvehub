/**
 * SolveHub Keyboard Shortcuts & Browser Interception Verification Suite
 *
 * Validates:
 * 1. e.preventDefault() on browser-intercepted keys (Cmd+D, Cmd+K, Cmd+B, Cmd+U, Cmd+], Cmd+[, Escape, /)
 * 2. Single-key shortcut execution (C, L, H, T, /) when NOT typing
 * 3. Strict single-key typing isolation when activeElement is INPUT, TEXTAREA, or contentEditable
 * 4. Modifier shortcuts remain functional even while typing in inputs
 */

interface MockElement {
  tagName: string;
  isContentEditable?: boolean;
  closest?: (selector: string) => MockElement | null;
  id?: string;
}

interface ShortcutState {
  sidebarOpen: boolean;
  historyOpen: boolean;
  shortcutsOpen: boolean;
  templatesOpen: boolean;
  clearModalOpen: boolean;
  commandPaletteOpen: boolean;
  downloadModalOpen: boolean;
  activeMode: 'canvas' | 'library';
  activeTabId: string;
  tabs: { id: string; title: string }[];
  receiptCopied: boolean;
  searchFocused: boolean;
}

class KeyboardShortcutHarness {
  state: ShortcutState;
  activeElement: MockElement;
  hasSelection: boolean = false;
  hasReceiptItems: boolean = true;

  constructor() {
    this.activeElement = { tagName: 'BODY' };
    this.state = {
      sidebarOpen: true,
      historyOpen: false,
      shortcutsOpen: false,
      templatesOpen: false,
      clearModalOpen: false,
      commandPaletteOpen: false,
      downloadModalOpen: false,
      activeMode: 'canvas',
      activeTabId: 'tab-1',
      tabs: [
        { id: 'tab-1', title: 'Sheet 1' },
        { id: 'tab-2', title: 'Sheet 2' },
      ],
      receiptCopied: false,
      searchFocused: false,
    };
  }

  reset() {
    this.activeElement = { tagName: 'BODY' };
    this.hasSelection = false;
    this.hasReceiptItems = true;
    this.state = {
      sidebarOpen: true,
      historyOpen: false,
      shortcutsOpen: false,
      templatesOpen: false,
      clearModalOpen: false,
      commandPaletteOpen: false,
      downloadModalOpen: false,
      activeMode: 'canvas',
      activeTabId: 'tab-1',
      tabs: [
        { id: 'tab-1', title: 'Sheet 1' },
        { id: 'tab-2', title: 'Sheet 2' },
      ],
      receiptCopied: false,
      searchFocused: false,
    };
  }

  handleKeyDown(event: {
    key: string;
    metaKey?: boolean;
    ctrlKey?: boolean;
    altKey?: boolean;
    target?: MockElement;
  }): { defaultPrevented: boolean } {
    let defaultPrevented = false;
    const preventDefault = () => {
      defaultPrevented = true;
    };

    const target = event.target || this.activeElement;

    // 0. ESCAPE: Close active modal
    if (event.key === 'Escape') {
      if (
        this.state.historyOpen ||
        this.state.shortcutsOpen ||
        this.state.templatesOpen ||
        this.state.clearModalOpen ||
        this.state.commandPaletteOpen ||
        this.state.downloadModalOpen
      ) {
        preventDefault();
        if (this.state.historyOpen) this.state.historyOpen = false;
        if (this.state.shortcutsOpen) this.state.shortcutsOpen = false;
        if (this.state.templatesOpen) this.state.templatesOpen = false;
        if (this.state.clearModalOpen) this.state.clearModalOpen = false;
        if (this.state.commandPaletteOpen) this.state.commandPaletteOpen = false;
        if (this.state.downloadModalOpen) this.state.downloadModalOpen = false;
        return { defaultPrevented };
      }
    }

    const isModifierKey = Boolean(event.metaKey || event.ctrlKey);
    const isAltKey = Boolean(event.altKey);

    // 1. MODIFIER COMBINATIONS (Cmd / Ctrl)
    if (isModifierKey && !isAltKey) {
      const key = event.key.toLowerCase();

      // Cmd/Ctrl + B -> toggle sidebar collapse
      if (key === 'b') {
        preventDefault();
        this.state.sidebarOpen = !this.state.sidebarOpen;
        return { defaultPrevented };
      }

      // Cmd/Ctrl + K -> trigger Clear Sheet confirmation
      if (key === 'k') {
        preventDefault();
        this.state.clearModalOpen = true;
        return { defaultPrevented };
      }

      // Cmd/Ctrl + U -> new sheet
      if (key === 'u') {
        preventDefault();
        if (this.state.activeMode !== 'canvas') {
          this.state.activeMode = 'canvas';
        }
        const newTab = { id: `tab-${this.state.tabs.length + 1}`, title: 'Untitled' };
        this.state.tabs.push(newTab);
        this.state.activeTabId = newTab.id;
        return { defaultPrevented };
      }

      // Cmd/Ctrl + ]: next canvas sheet
      if (event.key === ']' || event.key === '}') {
        preventDefault();
        if (this.state.tabs.length > 1) {
          const currentIndex = this.state.tabs.findIndex((t) => t.id === this.state.activeTabId);
          const nextIndex = (currentIndex + 1) % this.state.tabs.length;
          this.state.activeTabId = this.state.tabs[nextIndex].id;
        }
        return { defaultPrevented };
      }

      // Cmd/Ctrl + [: previous canvas sheet
      if (event.key === '[' || event.key === '{') {
        preventDefault();
        if (this.state.tabs.length > 1) {
          const currentIndex = this.state.tabs.findIndex((t) => t.id === this.state.activeTabId);
          const prevIndex = (currentIndex - 1 + this.state.tabs.length) % this.state.tabs.length;
          this.state.activeTabId = this.state.tabs[prevIndex].id;
        }
        return { defaultPrevented };
      }

      // Cmd/Ctrl + C (when target is receipt) -> copy formatted receipt
      if (key === 'c') {
        if (this.hasSelection) {
          return { defaultPrevented }; // Native copy allowed
        }
        const isReceiptTarget = Boolean(
          target?.closest?.('aside') ||
          target?.id === 'receipt-panel'
        );
        const isTargetTyping = ['INPUT', 'TEXTAREA'].includes(target?.tagName || '');
        if ((isReceiptTarget || !isTargetTyping) && this.hasReceiptItems) {
          preventDefault();
          this.state.receiptCopied = true;
        }
        return { defaultPrevented };
      }

      // Cmd/Ctrl + D -> download receipt (.txt / .csv)
      if (key === 'd') {
        preventDefault();
        this.state.downloadModalOpen = true;
        return { defaultPrevented };
      }
    }

    // 2. SINGLE LETTER SHORTCUTS (Strict Input Guards)
    const activeEl = this.activeElement;
    const targetEl = target;
    const isTyping = Boolean(
      (activeEl && (
        activeEl.tagName === 'INPUT' ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable
      )) ||
      (targetEl && (
        targetEl.tagName === 'INPUT' ||
        targetEl.tagName === 'TEXTAREA' ||
        targetEl.isContentEditable
      ))
    );

    if (isTyping || isModifierKey || isAltKey) {
      return { defaultPrevented };
    }

    // 'c' / 'C' -> setMode('canvas')
    if (event.key === 'c' || event.key === 'C') {
      preventDefault();
      this.state.activeMode = 'canvas';
      return { defaultPrevented };
    }

    // 'l' / 'L' -> setMode('library')
    if (event.key === 'l' || event.key === 'L') {
      preventDefault();
      this.state.activeMode = 'library';
      return { defaultPrevented };
    }

    // 'h' / 'H' -> toggle calculation history modal
    if (event.key === 'h' || event.key === 'H') {
      preventDefault();
      this.state.historyOpen = !this.state.historyOpen;
      return { defaultPrevented };
    }

    // 't' / 'T' -> toggle templates modal
    if (event.key === 't' || event.key === 'T') {
      preventDefault();
      this.state.templatesOpen = !this.state.templatesOpen;
      return { defaultPrevented };
    }

    // '/' -> focus search input
    if (event.key === '/') {
      preventDefault();
      this.state.searchFocused = true;
      return { defaultPrevented };
    }

    return { defaultPrevented };
  }
}

// ─── TEST RUNNER ─────────────────────────────────────────────────────────────
async function runShortcutTestSuite() {
  console.log('🧪 SolveHub Comprehensive Keyboard Shortcuts Audit');
  console.log('==================================================');

  const harness = new KeyboardShortcutHarness();
  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, details?: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} ${details ? `(${details})` : ''}`);
      failed++;
    }
  }

  // Group 1: Browser Default Interception & Modifier Shortcuts
  console.log('\n[1. Browser Default Interception (Cmd/Ctrl Keys)]');
  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 'b', metaKey: true });
    assert('Cmd+B calls preventDefault()', res.defaultPrevented);
    assert('Cmd+B toggles sidebar', harness.state.sidebarOpen === false);
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 'k', metaKey: true });
    assert('Cmd+K calls preventDefault() (no browser URL focus)', res.defaultPrevented);
    assert('Cmd+K triggers clear sheet modal', harness.state.clearModalOpen === true);
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 'u', metaKey: true });
    assert('Cmd+U calls preventDefault() (no view source)', res.defaultPrevented);
    assert('Cmd+U creates new tab', harness.state.tabs.length === 3);
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 'd', metaKey: true });
    assert('Cmd+D calls preventDefault() (no browser bookmark)', res.defaultPrevented);
    assert('Cmd+D opens download receipt modal', harness.state.downloadModalOpen === true);
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: ']', metaKey: true });
    assert('Cmd+] calls preventDefault()', res.defaultPrevented);
    assert('Cmd+] cycles to next tab', harness.state.activeTabId === 'tab-2');
  }

  {
    harness.reset();
    harness.state.activeTabId = 'tab-2';
    const res = harness.handleKeyDown({ key: '[', metaKey: true });
    assert('Cmd+[ calls preventDefault()', res.defaultPrevented);
    assert('Cmd+[ cycles to previous tab', harness.state.activeTabId === 'tab-1');
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 'c', metaKey: true });
    assert('Cmd+C without text selection copies formatted receipt', res.defaultPrevented);
    assert('Receipt copy state triggered', harness.state.receiptCopied === true);
  }

  {
    harness.reset();
    harness.hasSelection = true;
    const res = harness.handleKeyDown({ key: 'c', metaKey: true });
    assert('Cmd+C with active text selection allows native copy', res.defaultPrevented === false);
    assert('Receipt copy state NOT triggered when copying text', harness.state.receiptCopied === false);
  }

  // Group 2: Modal Escape Handler
  console.log('\n[2. Escape Key Modal Dismissal]');
  {
    harness.reset();
    harness.state.historyOpen = true;
    const res = harness.handleKeyDown({ key: 'Escape' });
    assert('Escape calls preventDefault() when History modal open', res.defaultPrevented);
    assert('Escape closes History modal', (harness.state.historyOpen as boolean) === false);
  }

  {
    harness.reset();
    harness.state.shortcutsOpen = true;
    const res = harness.handleKeyDown({ key: 'Escape' });
    assert('Escape calls preventDefault() when Shortcuts modal open', res.defaultPrevented);
    assert('Escape closes Shortcuts modal', (harness.state.shortcutsOpen as boolean) === false);
  }

  {
    harness.reset();
    harness.state.templatesOpen = true;
    const res = harness.handleKeyDown({ key: 'Escape' });
    assert('Escape calls preventDefault() when Templates modal open', res.defaultPrevented);
    assert('Escape closes Templates modal', (harness.state.templatesOpen as boolean) === false);
  }

  {
    harness.reset();
    harness.state.clearModalOpen = true;
    const res = harness.handleKeyDown({ key: 'Escape' });
    assert('Escape calls preventDefault() when Clear modal open', res.defaultPrevented);
    assert('Escape closes Clear modal', (harness.state.clearModalOpen as boolean) === false);
  }

  {
    harness.reset();
    harness.state.downloadModalOpen = true;
    const res = harness.handleKeyDown({ key: 'Escape' });
    assert('Escape calls preventDefault() when Download modal open', res.defaultPrevented);
    assert('Escape closes Download modal', (harness.state.downloadModalOpen as boolean) === false);
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 'Escape' });
    assert('Escape without open modal does NOT intercept browser', res.defaultPrevented === false);
  }

  // Group 3: Single-Key Shortcuts When Not Typing
  console.log('\n[3. Single-Key Shortcuts (When Not Typing)]');
  {
    harness.reset();
    harness.state.activeMode = 'library';
    const res = harness.handleKeyDown({ key: 'c' });
    assert("'c' calls preventDefault()", res.defaultPrevented);
    assert("'c' switches to canvas mode", (harness.state.activeMode as string) === 'canvas');
  }

  {
    harness.reset();
    harness.state.activeMode = 'canvas';
    const res = harness.handleKeyDown({ key: 'l' });
    assert("'l' calls preventDefault()", res.defaultPrevented);
    assert("'l' switches to library mode", (harness.state.activeMode as string) === 'library');
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 'h' });
    assert("'h' calls preventDefault()", res.defaultPrevented);
    assert("'h' toggles calculation history modal", harness.state.historyOpen === true);
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: 't' });
    assert("'t' calls preventDefault()", res.defaultPrevented);
    assert("'t' toggles templates modal", harness.state.templatesOpen === true);
  }

  {
    harness.reset();
    const res = harness.handleKeyDown({ key: '/' });
    assert("'/' calls preventDefault()", res.defaultPrevented);
    assert("'/' triggers search input focus", harness.state.searchFocused === true);
  }

  // Group 4: Single-Key Shortcut Isolation (When Typing)
  console.log('\n[4. Strict Single-Key Typing Isolation]');
  const inputTypes: MockElement[] = [
    { tagName: 'INPUT' },
    { tagName: 'TEXTAREA' },
    { tagName: 'DIV', isContentEditable: true },
  ];

  for (const el of inputTypes) {
    const label = el.isContentEditable ? 'contentEditable' : el.tagName;
    harness.reset();
    harness.activeElement = el;

    const resC = harness.handleKeyDown({ key: 'c', target: el });
    assert(`'c' inside ${label} is NOT intercepted`, resC.defaultPrevented === false);

    const resL = harness.handleKeyDown({ key: 'l', target: el });
    assert(`'l' inside ${label} is NOT intercepted`, resL.defaultPrevented === false);

    const resH = harness.handleKeyDown({ key: 'h', target: el });
    assert(`'h' inside ${label} does NOT open history`, resH.defaultPrevented === false && (harness.state.historyOpen as boolean) === false);

    const resT = harness.handleKeyDown({ key: 't', target: el });
    assert(`'t' inside ${label} does NOT open templates`, resT.defaultPrevented === false && (harness.state.templatesOpen as boolean) === false);

    const resSlash = harness.handleKeyDown({ key: '/', target: el });
    assert(`'/' inside ${label} is NOT intercepted (allows typing /)`, resSlash.defaultPrevented === false);
  }

  // Group 5: Modifiers Still Fire While Typing
  console.log('\n[5. Modifier Shortcuts Active While Focused in Input]');
  {
    harness.reset();
    harness.activeElement = { tagName: 'INPUT' };

    const resB = harness.handleKeyDown({ key: 'b', metaKey: true, target: harness.activeElement });
    assert('Cmd+B while typing in INPUT still toggles sidebar', resB.defaultPrevented && harness.state.sidebarOpen === false);

    const resK = harness.handleKeyDown({ key: 'k', metaKey: true, target: harness.activeElement });
    assert('Cmd+K while typing in INPUT still triggers clear confirmation', resK.defaultPrevented && harness.state.clearModalOpen === true);

    const resD = harness.handleKeyDown({ key: 'd', metaKey: true, target: harness.activeElement });
    assert('Cmd+D while typing in INPUT still triggers download modal', resD.defaultPrevented && harness.state.downloadModalOpen === true);
  }

  console.log('\n==================================================');
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All keyboard shortcut and interception guards verified successfully!');
  }
}

runShortcutTestSuite().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
