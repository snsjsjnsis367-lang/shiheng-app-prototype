(() => {
  "use strict";

  const READ_ONLY = document.body.classList.contains("public-read-only");
  const STORAGE_KEY = "shiheng-editable-prototype-v2";
  const screensRoot = document.getElementById("screens");
  const screenList = document.getElementById("screenList");
  const inspectorBody = document.getElementById("inspectorBody");
  const editBtn = document.getElementById("editBtn");
  const editStatus = document.getElementById("editStatus");
  const resetBtn = document.getElementById("resetBtn");
  const exportBtn = document.getElementById("exportBtn");
  const stageTitle = document.getElementById("stageTitle");
  const stageTip = document.getElementById("stageTip");
  const stageIndex = document.getElementById("stageIndex");
  const toast = document.getElementById("toast");
  const saveToast = document.getElementById("saveToast");
  const deviceShell = document.getElementById("deviceShell");

  let currentScreen = "splash";
  let editing = false;
  let selected = null;
  let historyStack = [];
  let toastTimer = 0;
  let saveTimer = 0;
  let saveToastTimer = 0;

  const iconMap = {
    "arrow-right": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "arrow-up-right": '<path d="M7 17 17 7M7 7h10v10"/>',
    "chevron-right": '<path d="m9 18 6-6-6-6"/>',
    "chevron-left": '<path d="m15 18-6-6 6-6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 9h8M8 13h5"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z"/>',
    "phone-off": '<path d="M3 3l18 18M10.7 5.3A12 12 0 0 1 17 3l4 4-3.2 3.2M6.6 6.6 3 10l4 4c1.2 1.2 2.5 2.2 4 2.8"/><path d="M14 14 10 10"/>',
    cup: '<path d="M5 8h11v8a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5Z"/><path d="M16 10h1a3 3 0 0 1 0 6h-1M8 3v2M11 2v3M14 3v2"/>',
    book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    leaf: '<path d="M20 4c-9 0-16 4-16 11a5 5 0 0 0 5 5c7 0 11-7 11-16Z"/><path d="M4 20c3-5 7-8 12-11"/>',
    compass: '<circle cx="12" cy="12" r="9"/><path d="m16 8-2.6 5.4L8 16l2.6-5.4Z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    sliders: '<path d="M4 6h7M15 6h5M4 12h3M11 12h9M4 18h9M17 18h3"/><circle cx="13" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="15" cy="18" r="2"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/>',
    filter: '<path d="M4 5h16l-6 7v6l-4 2v-8Z"/>',
    mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M8 21h8"/>',
    bookmark: '<path d="M6 3h12v18l-6-4-6 4Z"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4M8.6 13.5l6.8 4"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    flame: '<path d="M12 22c4 0 7-3 7-7 0-3-2-5-3-7-1-2-1-4-1-5-2 2-4 4-4 7-1-1-2-2-3-4-1 2-3 5-3 9 0 4 3 7 7 7Z"/><path d="M9.5 17.5c0 1.5 1 2.5 2.5 2.5s2.5-1 2.5-2.5c0-1.2-.8-2.1-1.4-2.8-.5-.6-.8-1.2-.9-1.8-.7.8-2.7 2.4-2.7 4.6Z"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-4v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3v-4h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3h4v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v4h-.2a1.7 1.7 0 0 0-1.5 1Z"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    alert: '<path d="M10.3 4.3 2.9 18a2 2 0 0 0 1.8 3h14.6a2 2 0 0 0 1.8-3L13.7 4.3a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>'
  };

  const brandSVG = `
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <defs>
        <linearGradient id="brandBg" x1="7" y1="5" x2="57" y2="60" gradientUnits="userSpaceOnUse">
          <stop stop-color="#A7E0D3"/>
          <stop offset="1" stop-color="#2BA090"/>
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill="url(#brandBg)"/>
      <circle cx="32" cy="18" r="6.7" fill="#FF9F32"/>
      <path d="M11 34c6.5-8.7 12.5-8.3 18.2-2.1 6.4 7 12.4 7.2 23.4-5.7" fill="none" stroke="#F7FBFA" stroke-width="6.5" stroke-linecap="round"/>
      <path d="M31.8 47.7c4.5-7.5 12.6-7.2 16.1-.4-4.9 7.1-12.3 7.4-16.1.4Z" fill="#F7FBFA"/>
      <circle cx="32" cy="32" r="2.5" fill="#FF9F32"/>
      <path d="M16 44c2.4-1.1 4.2-.2 5.5 1.7-2.6 1.7-4.6 1.1-5.5-1.7Z" fill="#D6F5EE"/>
    </svg>`;

  function hydrateIcons(root = document) {
    root.querySelectorAll("[data-icon]").forEach((node) => {
      const key = node.dataset.icon;
      if (!iconMap[key] || node.querySelector("svg")) return;
      node.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconMap[key]}</svg>`;
    });
    root.querySelectorAll("[data-brand]").forEach((node) => {
      if (!node.querySelector("svg")) node.innerHTML = brandSVG;
    });
  }

  function hydrateAppIcon() {
    const appIcon = screensRoot.querySelector('[data-screen="splash"] .brand-mark--hero');
    if (appIcon && !appIcon.querySelector("img")) {
      appIcon.innerHTML = '<img src="assets/app-icon-main.png" alt="时衡 App 图标">';
    }

    const loginIcon = screensRoot.querySelector('[data-screen="login"] .brand-mark--medium');
    if (loginIcon && !loginIcon.querySelector("img")) {
      loginIcon.innerHTML = '<img src="assets/app-icon-main.png" alt="时衡 App 图标">';
    }
  }

  function getScreenInfo() {
    return [...screensRoot.querySelectorAll(".screen")].map((screen, index) => ({
      id: screen.dataset.screen,
      title: screen.dataset.title,
      tip: screen.dataset.tip,
      index: index + 1
    }));
  }

  function buildScreenList() {
    const info = getScreenInfo();
    screenList.innerHTML = info.map((item) => `
      <button class="screen-link${item.id === currentScreen ? " is-active" : ""}" type="button" data-screen-link="${item.id}">
        <span class="screen-link__no">${String(item.index).padStart(2, "0")}</span>
        <span class="screen-link__name">${item.title}</span>
        <span class="icon screen-link__arrow" data-icon="arrow-right"></span>
      </button>
    `).join("");
    hydrateIcons(screenList);
  }

  function syncChrome() {
    const info = getScreenInfo().find((item) => item.id === currentScreen);
    if (!info) return;
    deviceShell.dataset.screen = currentScreen;
    stageTitle.textContent = info.title;
    stageTip.textContent = info.tip;
    stageIndex.textContent = `${String(info.index).padStart(2, "0")} / ${String(getScreenInfo().length).padStart(2, "0")}`;
    screenList.querySelectorAll("[data-screen-link]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.screenLink === currentScreen);
    });
  }

  function resetScroll() {
    const activeScroll = screensRoot.querySelector(".screen.is-active .screen-scroll");
    if (activeScroll) activeScroll.scrollTop = 0;
  }

  function showToast(message, duration = 1800) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-showing");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-showing"), duration);
  }

  function showSaveToast(message = "修改已保存") {
    window.clearTimeout(saveToastTimer);
    saveToast.textContent = message;
    saveToast.classList.add("is-showing");
    saveToastTimer = window.setTimeout(() => saveToast.classList.remove("is-showing"), 1500);
  }

  function goTo(screenId, options = {}) {
    if (!screenId || !screensRoot.querySelector(`[data-screen="${screenId}"]`)) return;
    if (screenId === currentScreen && !options.force) {
      resetScroll();
      return;
    }
    if (!options.skipHistory) historyStack.push(currentScreen);
    screensRoot.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("is-active", screen.dataset.screen === screenId);
    });
    currentScreen = screenId;
    clearSelection();
    syncChrome();
    resetScroll();
    if (options.persist !== false) persist();
  }

  function goBack() {
    const previous = historyStack.pop();
    goTo(previous || "home", { skipHistory: true });
  }

  function getGlobals() {
    const style = getComputedStyle(document.documentElement);
    return {
      pagePadding: parseInt(style.getPropertyValue("--page-padding"), 10) || 18,
      pageGap: parseInt(style.getPropertyValue("--page-gap"), 10) || 12,
      cardRadius: parseInt(style.getPropertyValue("--card-radius"), 10) || 18,
      buttonRadius: parseInt(style.getPropertyValue("--button-radius"), 10) || 13,
      accent: normalizeColor(style.getPropertyValue("--accent"), "#FF9F32")
    };
  }

  function normalizeColor(value, fallback) {
    const v = (value || "").trim();
    return /^#[0-9a-f]{6}$/i.test(v) ? v : fallback;
  }

  function applyGlobals(globals) {
    if (!globals) return;
    const root = document.documentElement.style;
    if (globals.pagePadding) root.setProperty("--page-padding", `${globals.pagePadding}px`);
    if (globals.pageGap) root.setProperty("--page-gap", `${globals.pageGap}px`);
    if (globals.cardRadius) root.setProperty("--card-radius", `${globals.cardRadius}px`);
    if (globals.buttonRadius) root.setProperty("--button-radius", `${globals.buttonRadius}px`);
    if (globals.accent) root.setProperty("--accent", globals.accent);
  }

  function persist() {
    if (READ_ONLY) return;
    const state = {
      screens: screensRoot.innerHTML,
      current: currentScreen,
      globals: getGlobals(),
      savedAt: Date.now()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("Unable to save prototype state.", error);
    }
  }

  function persistSoon() {
    if (READ_ONLY) return;
    window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      persist();
      showSaveToast();
    }, 260);
  }

  function restoreState() {
    if (READ_ONLY) return false;
    let state = window.__SHIHENG_EXPORT__ || null;
    if (!state) {
      try {
        state = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      } catch (error) {
        state = null;
      }
    }
    if (!state) return false;
    if (state.globals) applyGlobals(state.globals);
    if (state.screens) screensRoot.innerHTML = state.screens;
    if (state.current) currentScreen = state.current;
    return true;
  }

  function makeTextEditable(root) {
    const selectors = "h1,h2,h3,h4,p,span,strong,small,b,em,time,label";
    root.querySelectorAll(selectors).forEach((element) => {
      if (element.closest("svg") || element.classList.contains("icon") || element.closest(".brand-mark")) return;
      if (element.matches("textarea,input,select,button") || element.querySelector("textarea,input,select")) return;
      const hasText = [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim());
      if (!hasText) return;
      if (element.querySelector("[contenteditable='true']")) return;
      element.setAttribute("contenteditable", "true");
      element.setAttribute("spellcheck", "false");
    });
  }

  function disableTextEditing(root = document) {
    root.querySelectorAll("[contenteditable='true']").forEach((element) => {
      element.setAttribute("contenteditable", "false");
    });
  }

  function clearSelection() {
    if (selected?.el) selected.el.classList.remove("is-selected");
    selected = null;
    if (editing) renderInspector();
  }

  function selectControl(element, type) {
    if (!element) return;
    if (selected?.el) selected.el.classList.remove("is-selected");
    selected = { el: element, type };
    element.classList.add("is-selected");
    renderInspector();
  }

  function setEditing(next) {
    if (READ_ONLY) next = false;
    editing = next;
    document.body.classList.toggle("is-editing", editing);
    if (!READ_ONLY) {
      editStatus.textContent = editing ? "编辑中" : "预览";
      editBtn.querySelector("span:last-child").textContent = editing ? "退出编辑" : "编辑模式";
    }
    if (editing) {
      makeTextEditable(screensRoot);
    } else {
      disableTextEditing();
      if (selected?.el) selected.el.classList.remove("is-selected");
      selected = null;
    }
    renderInspector();
  }

  function escapeHTML(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
  }

  function computedColor(element, property) {
    const value = getComputedStyle(element).getPropertyValue(property).trim();
    return normalizeColor(value, "#FFFFFF");
  }

  function renderPreviewInspector() {
    const info = getScreenInfo().find((item) => item.id === currentScreen);
    inspectorBody.innerHTML = `
      <div class="inspector-empty">
        <b>${escapeHTML(info?.title || "交互原型")}</b>
        当前处于预览模式。开启编辑模式后，可以直接修改页面文字、按钮参数和卡片布局。
      </div>
      <div class="inspector-section" style="margin-top:16px">
        <div class="inspector-section__title"><h3>交互说明</h3><span>how to use</span></div>
        <div class="control-row"><label>点击底部导航</label><output>切换主页面</output></div>
        <div class="control-row"><label>点击卡片与按钮</label><output>查看真实状态</output></div>
        <div class="control-row"><label>编辑模式</label><output>文字 / 按钮 / 布局</output></div>
      </div>
      <div class="button-row">
        <button class="inspector-button" type="button" id="startEditing">开启编辑模式</button>
        <button class="inspector-button inspector-button--danger" type="button" id="resetFromPanel">恢复初始原型</button>
      </div>
    `;
    document.getElementById("startEditing")?.addEventListener("click", () => setEditing(true));
    document.getElementById("resetFromPanel")?.addEventListener("click", resetPrototype);
  }

  function renderGlobalInspector() {
    const globals = getGlobals();
    inspectorBody.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-section__title">
          <h3>页面布局</h3>
          <span>global</span>
        </div>
        <div class="control-row">
          <label for="globalPadding">左右留白</label>
          <output id="globalPaddingOutput">${globals.pagePadding}px</output>
          <input id="globalPadding" type="range" min="12" max="26" step="1" value="${globals.pagePadding}">
        </div>
        <div class="control-row">
          <label for="globalGap">卡片间距</label>
          <output id="globalGapOutput">${globals.pageGap}px</output>
          <input id="globalGap" type="range" min="6" max="20" step="1" value="${globals.pageGap}">
        </div>
        <div class="control-row">
          <label for="globalRadius">卡片圆角</label>
          <output id="globalRadiusOutput">${globals.cardRadius}px</output>
          <input id="globalRadius" type="range" min="8" max="30" step="1" value="${globals.cardRadius}">
        </div>
        <div class="control-row">
          <label for="globalButtonRadius">按钮圆角</label>
          <output id="globalButtonRadiusOutput">${globals.buttonRadius}px</output>
          <input id="globalButtonRadius" type="range" min="6" max="28" step="1" value="${globals.buttonRadius}">
        </div>
        <div class="color-row">
          <label for="globalAccent">强调色</label>
          <input id="globalAccent" type="color" value="${globals.accent}">
        </div>
      </div>
      <div class="inspector-section">
        <div class="inspector-section__title"><h3>编辑方法</h3><span>tips</span></div>
        <div class="inspector-empty">
          <b>先点选，再修改</b>
          点击页面中的白色卡片可调整尺寸、留白、颜色与顺序；点击橙色描边按钮可修改文字、颜色和目标页面。文字可直接在画布内输入。
        </div>
      </div>
      <div class="button-row">
        <button class="inspector-button" type="button" id="selectCurrentPage">选中当前页面标题</button>
        <button class="inspector-button" type="button" id="saveNow">立即保存</button>
      </div>
    `;

    bindGlobalRange("globalPadding", "--page-padding", "globalPaddingOutput");
    bindGlobalRange("globalGap", "--page-gap", "globalGapOutput");
    bindGlobalRange("globalRadius", "--card-radius", "globalRadiusOutput");
    bindGlobalRange("globalButtonRadius", "--button-radius", "globalButtonRadiusOutput");
    document.getElementById("globalAccent")?.addEventListener("input", (event) => {
      document.documentElement.style.setProperty("--accent", event.target.value);
      persistSoon();
    });
    document.getElementById("saveNow")?.addEventListener("click", () => {
      persist();
      showSaveToast("原型状态已保存");
    });
    document.getElementById("selectCurrentPage")?.addEventListener("click", () => {
      const page = screensRoot.querySelector(`.screen[data-screen="${currentScreen}"]`);
      const heading = page?.querySelector("h2, h3");
      if (heading) selectControl(heading, "text");
    });
  }

  function bindGlobalRange(inputId, property, outputId) {
    const input = document.getElementById(inputId);
    const output = document.getElementById(outputId);
    input?.addEventListener("input", () => {
      const value = Number(input.value);
      document.documentElement.style.setProperty(property, `${value}px`);
      if (output) output.textContent = `${value}px`;
      persistSoon();
    });
  }

  function renderTextInspector() {
    if (!selected?.el) {
      renderGlobalInspector();
      return;
    }
    const el = selected.el;
    inspectorBody.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-section__title">
          <h3>文字内容</h3>
          <span>inline text</span>
        </div>
        <span class="selection-label">文字元素</span>
        <textarea class="inspector-input" id="selectedText" rows="4" style="margin-top:10px">${escapeHTML(el.textContent.trim())}</textarea>
      </div>
      <div class="inspector-section">
        <div class="inspector-section__title"><h3>文字样式</h3><span>type</span></div>
        <div class="control-row">
          <label for="textSize">字号</label>
          <output id="textSizeOutput">${parseFloat(getComputedStyle(el).fontSize).toFixed(0)}px</output>
          <input id="textSize" type="range" min="8" max="44" step="1" value="${parseFloat(getComputedStyle(el).fontSize).toFixed(0)}">
        </div>
        <div class="color-row">
          <label for="textColor">文字颜色</label>
          <input id="textColor" type="color" value="${computedColor(el, "color")}">
        </div>
      </div>
      <div class="button-row">
        <button class="inspector-button" type="button" id="backToPage">返回页面设置</button>
      </div>
    `;
    document.getElementById("selectedText")?.addEventListener("input", (event) => {
      el.textContent = event.target.value;
      persistSoon();
    });
    document.getElementById("textSize")?.addEventListener("input", (event) => {
      el.style.fontSize = `${event.target.value}px`;
      document.getElementById("textSizeOutput").textContent = `${event.target.value}px`;
      persistSoon();
    });
    document.getElementById("textColor")?.addEventListener("input", (event) => {
      el.style.color = event.target.value;
      persistSoon();
    });
    document.getElementById("backToPage")?.addEventListener("click", clearSelection);
  }

  function renderCardInspector() {
    if (!selected?.el) {
      renderGlobalInspector();
      return;
    }
    const el = selected.el;
    const style = getComputedStyle(el);
    const background = computedColor(el, "background-color");
    const padding = Math.round(parseFloat(style.paddingTop) || 15);
    const radius = Math.round(parseFloat(style.borderTopLeftRadius) || 18);
    const width = Math.round((el.getBoundingClientRect().width / el.parentElement.getBoundingClientRect().width) * 100);

    inspectorBody.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-section__title">
          <h3>卡片布局</h3>
          <span>card</span>
        </div>
        <span class="selection-label">可编辑卡片</span>
        <div class="control-row" style="margin-top:10px">
          <label for="cardWidth">相对宽度</label>
          <output id="cardWidthOutput">${Math.min(width, 100)}%</output>
          <input id="cardWidth" type="range" min="60" max="100" step="1" value="${Math.min(width, 100)}">
        </div>
        <div class="control-row">
          <label for="cardPadding">内边距</label>
          <output id="cardPaddingOutput">${padding}px</output>
          <input id="cardPadding" type="range" min="0" max="30" step="1" value="${padding}">
        </div>
        <div class="control-row">
          <label for="cardRadius">圆角</label>
          <output id="cardRadiusOutput">${radius}px</output>
          <input id="cardRadius" type="range" min="0" max="34" step="1" value="${radius}">
        </div>
        <div class="color-row">
          <label for="cardBackground">卡片底色</label>
          <input id="cardBackground" type="color" value="${background}">
        </div>
      </div>
      <div class="inspector-section">
        <div class="inspector-section__title"><h3>顺序与操作</h3><span>arrange</span></div>
        <div class="button-row">
          <button class="inspector-button" type="button" id="cardMoveUp">向上移动</button>
          <button class="inspector-button" type="button" id="cardMoveDown">向下移动</button>
          <button class="inspector-button" type="button" id="cardEditText">编辑首行文字</button>
          <button class="inspector-button inspector-button--danger" type="button" id="cardResetStyle">恢复此卡片样式</button>
        </div>
      </div>
    `;
    document.getElementById("cardWidth")?.addEventListener("input", (event) => {
      el.style.width = `${event.target.value}%`;
      document.getElementById("cardWidthOutput").textContent = `${event.target.value}%`;
      persistSoon();
    });
    document.getElementById("cardPadding")?.addEventListener("input", (event) => {
      el.style.padding = `${event.target.value}px`;
      document.getElementById("cardPaddingOutput").textContent = `${event.target.value}px`;
      persistSoon();
    });
    document.getElementById("cardRadius")?.addEventListener("input", (event) => {
      el.style.borderRadius = `${event.target.value}px`;
      document.getElementById("cardRadiusOutput").textContent = `${event.target.value}px`;
      persistSoon();
    });
    document.getElementById("cardBackground")?.addEventListener("input", (event) => {
      el.style.background = event.target.value;
      persistSoon();
    });
    document.getElementById("cardMoveUp")?.addEventListener("click", () => moveSelected(-1));
    document.getElementById("cardMoveDown")?.addEventListener("click", () => moveSelected(1));
    document.getElementById("cardEditText")?.addEventListener("click", () => {
      const text = el.querySelector("h1,h2,h3,p,span,strong,b");
      if (!text) return;
      selectControl(text, "text");
      text.focus();
    });
    document.getElementById("cardResetStyle")?.addEventListener("click", () => {
      el.style.cssText = "";
      persistSoon();
      selectControl(el, "card");
    });
  }

  function renderButtonInspector() {
    if (!selected?.el) {
      renderGlobalInspector();
      return;
    }
    const el = selected.el;
    const labelNode = el.querySelector(".button-label") || [...el.querySelectorAll("span")].find((span) =>
      !span.classList.contains("icon") && span.textContent.trim()
    );
    const label = labelNode?.textContent.trim() || "";
    const style = getComputedStyle(el);
    const background = computedColor(el, "background-color");
    const color = computedColor(el, "color");
    const height = Math.round(parseFloat(style.height) || 44);
    const target = el.dataset.go || "";
    const info = getScreenInfo();

    inspectorBody.innerHTML = `
      <div class="inspector-section">
        <div class="inspector-section__title">
          <h3>按钮设置</h3>
          <span>button</span>
        </div>
        <span class="selection-label">可编辑按钮</span>
        <label style="display:block;margin:10px 0 5px;color:#5e7774;font-size:9px" for="buttonLabel">按钮文字</label>
        <input class="inspector-input" id="buttonLabel" value="${escapeHTML(label)}" placeholder="按钮文字">
      </div>
      <div class="inspector-section">
        <div class="inspector-section__title"><h3>外观</h3><span>appearance</span></div>
        <div class="control-row">
          <label for="buttonHeight">高度</label>
          <output id="buttonHeightOutput">${height}px</output>
          <input id="buttonHeight" type="range" min="28" max="64" step="1" value="${height}">
        </div>
        <div class="control-row">
          <label for="buttonRadius">圆角</label>
          <output id="buttonRadiusValueOutput">${Math.round(parseFloat(style.borderTopLeftRadius) || 13)}px</output>
          <input id="buttonRadius" type="range" min="0" max="30" step="1" value="${Math.round(parseFloat(style.borderTopLeftRadius) || 13)}">
        </div>
        <div class="color-row">
          <label for="buttonBackground">按钮底色</label>
          <input id="buttonBackground" type="color" value="${background}">
        </div>
        <div class="color-row">
          <label for="buttonColor">文字颜色</label>
          <input id="buttonColor" type="color" value="${color}">
        </div>
      </div>
      <div class="inspector-section">
        <div class="inspector-section__title"><h3>交互目标</h3><span>link</span></div>
        <select class="inspector-input" id="buttonTarget">
          <option value="">不跳转</option>
          ${info.map((item) => `<option value="${item.id}"${item.id === target ? " selected" : ""}>${item.title}</option>`).join("")}
        </select>
      </div>
      <div class="button-row">
        <button class="inspector-button" type="button" id="buttonReset">恢复按钮样式</button>
      </div>
    `;

    document.getElementById("buttonLabel")?.addEventListener("input", (event) => {
      if (labelNode) labelNode.textContent = event.target.value;
      persistSoon();
    });
    document.getElementById("buttonHeight")?.addEventListener("input", (event) => {
      el.style.height = `${event.target.value}px`;
      document.getElementById("buttonHeightOutput").textContent = `${event.target.value}px`;
      persistSoon();
    });
    document.getElementById("buttonRadius")?.addEventListener("input", (event) => {
      el.style.borderRadius = `${event.target.value}px`;
      document.getElementById("buttonRadiusValueOutput").textContent = `${event.target.value}px`;
      persistSoon();
    });
    document.getElementById("buttonBackground")?.addEventListener("input", (event) => {
      el.style.background = event.target.value;
      persistSoon();
    });
    document.getElementById("buttonColor")?.addEventListener("input", (event) => {
      el.style.color = event.target.value;
      persistSoon();
    });
    document.getElementById("buttonTarget")?.addEventListener("change", (event) => {
      if (event.target.value) el.dataset.go = event.target.value;
      else delete el.dataset.go;
      persistSoon();
    });
    document.getElementById("buttonReset")?.addEventListener("click", () => {
      el.style.cssText = "";
      persistSoon();
      selectControl(el, "button");
    });
  }

  function renderInspector() {
    if (READ_ONLY || !inspectorBody) return;
    if (!editing) {
      renderPreviewInspector();
      return;
    }
    if (!selected) {
      renderGlobalInspector();
      return;
    }
    if (selected.type === "card") renderCardInspector();
    else if (selected.type === "button") renderButtonInspector();
    else renderTextInspector();
  }

  function moveSelected(direction) {
    const el = selected?.el;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;
    if (direction < 0 && el.previousElementSibling) {
      parent.insertBefore(el, el.previousElementSibling);
    } else if (direction > 0 && el.nextElementSibling) {
      parent.insertBefore(el.nextElementSibling, el);
    }
    persistSoon();
    renderInspector();
  }

  function toggleChip(target, single = false) {
    if (!target) return;
    if (single) {
      const group = target.parentElement;
      group.querySelectorAll("button").forEach((button) => button.classList.remove("is-active"));
      target.classList.add("is-active");
    } else {
      target.classList.toggle("is-selected");
    }
  }

  function handleAction(action, target) {
    switch (action) {
      case "send-code": {
        const button = target.closest("button");
        if (button.dataset.waiting === "true") return;
        button.dataset.waiting = "true";
        const original = button.textContent;
        let remaining = 30;
        button.textContent = `${remaining}s 后重发`;
        const timer = window.setInterval(() => {
          remaining -= 1;
          button.textContent = remaining > 0 ? `${remaining}s 后重发` : original;
          if (remaining <= 0) {
            window.clearInterval(timer);
            button.dataset.waiting = "false";
          }
        }, 1000);
        showToast("验证码已发送");
        break;
      }
      case "login":
        goTo("home");
        showToast("欢迎回来，小满");
        break;
      case "checkin": {
        const button = target.closest(".record-orbit");
        const label = button.querySelector(".button-label");
        if (button.classList.contains("is-done")) {
          goTo("detail");
          break;
        }
        button.classList.add("is-done");
        label.textContent = "已记录";
        showToast("今日作息记录已完成");
        persistSoon();
        break;
      }
      case "back":
        goBack();
        break;
      case "save-record":
        showToast("今日记录已保存");
        window.setTimeout(() => goTo("records"), 700);
        break;
      case "save-energy":
        showToast("精力感受已保存");
        break;
      case "bookmark": {
        const buttons = screensRoot.querySelectorAll('[data-action="bookmark"]');
        const shouldBookmark = ![...buttons].every((button) => button.classList.contains("is-bookmarked"));
        buttons.forEach((button) => {
          button.classList.toggle("is-bookmarked", shouldBookmark);
          const text = button.querySelector(".button-label");
          if (text) text.textContent = shouldBookmark ? "已收藏这篇文章" : "收藏这篇文章";
        });
        showToast(shouldBookmark ? "已收藏，可在我的内容中找到" : "已取消收藏");
        break;
      }
      case "share":
        showToast("分享链接已准备好");
        break;
      case "recipe":
        showToast("食谱步骤已加入今晚计划");
        break;
      case "notice":
        showToast("今晚 22:40 提醒你开始睡前准备");
        break;
      case "filter":
        showToast("筛选器已打开");
        break;
      case "reminder":
        showToast("晚间提醒已设为 22:40");
        break;
      case "search":
        showToast("可以搜索作息、饮食和精力内容");
        break;
      case "settings":
        showToast("设置项可在原型中继续扩展");
        break;
      case "profile-edit":
        showToast("个人资料编辑");
        break;
      case "setting":
        showToast("该设置项已选中");
        break;
      case "more":
        showToast("更多操作");
        break;
      default:
        break;
    }
  }

  document.addEventListener("click", (event) => {
    const screenLink = event.target.closest("[data-screen-link]");
    if (screenLink) {
      if (!editing) goTo(screenLink.dataset.screenLink);
      return;
    }

    const switchTarget = event.target.closest("[data-switch]");
    if (!editing && switchTarget) {
      switchTarget.classList.toggle("is-on");
      event.stopPropagation();
      showToast(switchTarget.classList.contains("is-on") ? "已开启" : "已关闭");
      persistSoon();
      return;
    }

    if (editing) {
      const button = event.target.closest("[data-button]");
      if (button) {
        selectControl(button, "button");
        return;
      }
      const card = event.target.closest("[data-card]");
      if (card) {
        const contentEditable = event.target.closest("[contenteditable='true']");
        if (contentEditable) {
          if (selected?.el !== contentEditable) selectControl(contentEditable, "text");
          return;
        }
        selectControl(card, "card");
        return;
      }
      if (!event.target.closest(".inspector")) clearSelection();
      return;
    }

    const goTarget = event.target.closest("[data-go]");
    if (goTarget?.closest(".record-item")) {
      const recordDate = goTarget.closest(".record-item").querySelector(".record-date small")?.textContent.trim();
      const detailDate = document.getElementById("detailDate");
      if (recordDate && detailDate) detailDate.textContent = recordDate;
    }
    if (goTarget) {
      goTo(goTarget.dataset.go);
      return;
    }

    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) {
      handleAction(actionTarget.dataset.action, actionTarget);
      return;
    }

    const singleTab = event.target.closest(".segmented-control button, .scroll-tabs button");
    if (singleTab) {
      toggleChip(singleTab, true);
      if (singleTab.dataset.range) showToast(`已切换到近 ${singleTab.dataset.range} 天`);
      return;
    }

    const choice = event.target.closest("[data-chip]");
    if (choice) {
      toggleChip(choice, false);
      return;
    }
  });

  document.addEventListener("input", (event) => {
    const range = event.target.closest(".energy-range");
    if (range) {
      const percent = ((Number(range.value) - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
      range.style.setProperty("--range", `${percent}%`);
      const output = range.parentElement.querySelector("b");
      if (output) output.textContent = range.value;
      return;
    }
    if (editing && event.target.matches("[contenteditable='true']")) persistSoon();
  });

  document.addEventListener("change", () => {
    if (editing) persistSoon();
  });

  editBtn?.addEventListener("click", () => {
    if (!READ_ONLY) setEditing(!editing);
  });

  function resetPrototype() {
    const confirmed = window.confirm("恢复初始原型会清除当前浏览器中的文字与布局修改，是否继续？");
    if (!confirmed) return;
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }

  if (!READ_ONLY) resetBtn.addEventListener("click", resetPrototype);

  if (!READ_ONLY) exportBtn.addEventListener("click", () => {
    persist();
    const clone = document.documentElement.cloneNode(true);
    clone.querySelectorAll(".is-selected").forEach((node) => node.classList.remove("is-selected"));
    clone.querySelectorAll("[contenteditable='true']").forEach((node) => node.setAttribute("contenteditable", "false"));
    clone.querySelectorAll(".screen-link.is-active").forEach((node) => node.classList.remove("is-active"));
    clone.querySelector("body")?.classList.remove("is-editing");
    clone.querySelector("#inspectorBody").innerHTML = "";
    clone.querySelector("#screenList").innerHTML = "";
    clone.querySelector("#saveToast")?.classList.remove("is-showing");
    clone.querySelector("#toast")?.classList.remove("is-showing");
    const exportData = {
      screens: screensRoot.innerHTML.replaceAll("</script>", "<\\/script>"),
      current: currentScreen,
      globals: getGlobals()
    };
    const injected = `<script>window.__SHIHENG_EXPORT__=${JSON.stringify(exportData)};</script>`;
    const appScript = clone.querySelector('script[src^="app.js"]');
    appScript?.insertAdjacentHTML("beforebegin", injected);
    const html = `<!doctype html>\n${clone.outerHTML}`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "时衡_编辑版交互原型.html";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showSaveToast("已下载编辑版 HTML");
  });

  window.addEventListener("beforeunload", () => {
    if (editing) persist();
  });

  const restored = restoreState();
  hydrateAppIcon();
  const query = new URLSearchParams(window.location.search);
  const queryScreen = query.get("screen");
  if (queryScreen && screensRoot.querySelector(`[data-screen="${queryScreen}"]`)) {
    currentScreen = queryScreen;
    screensRoot.querySelectorAll(".screen").forEach((screen) => {
      screen.classList.toggle("is-active", screen.dataset.screen === queryScreen);
    });
  }
  hydrateIcons();
  hydrateIcons(screensRoot);
  if (!screensRoot.querySelector(`.screen.is-active`)) {
    screensRoot.querySelector(`[data-screen="${currentScreen}"]`)?.classList.add("is-active");
  }
  if (!screensRoot.querySelector(`[data-screen="${currentScreen}"]`)) currentScreen = "splash";
  buildScreenList();
  syncChrome();
  setEditing(false);
  if (query.get("edit") === "1") setEditing(true);

  screensRoot.querySelectorAll(".energy-range").forEach((range) => {
    const percent = ((Number(range.value) - Number(range.min)) / (Number(range.max) - Number(range.min))) * 100;
    range.style.setProperty("--range", `${percent}%`);
  });

  if (restored) showSaveToast("已恢复上次修改");
})();
