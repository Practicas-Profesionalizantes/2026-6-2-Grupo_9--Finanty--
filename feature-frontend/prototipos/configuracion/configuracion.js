(() => {
  "use strict";

  const MODEL_KEY = "finanty.configuration.prototype.v1";
  const THEME_KEY = "finanty.configuration.theme.v1";
  const DEFAULT_MODEL = {
    categories: [
      { id: "cat-income-salary", name: "Sueldo", type: "income", isDefault: true },
      { id: "cat-income-work", name: "Trabajos", type: "income", isDefault: true },
      { id: "cat-income-sales", name: "Ventas", type: "income", isDefault: true },
      { id: "cat-income-other", name: "Otros ingresos", type: "income", isDefault: true },
      { id: "cat-expense-food", name: "Alimentación", type: "expense", isDefault: true },
      { id: "cat-expense-transport", name: "Transporte", type: "expense", isDefault: true },
      { id: "cat-expense-home", name: "Vivienda", type: "expense", isDefault: true },
      { id: "cat-expense-health", name: "Salud", type: "expense", isDefault: true },
      { id: "cat-expense-education", name: "Educación", type: "expense", isDefault: true },
      { id: "cat-expense-leisure", name: "Entretenimiento", type: "expense", isDefault: true },
      { id: "cat-expense-other", name: "Otros gastos", type: "expense", isDefault: true }
    ],
    paymentTypes: [
      { id: "wallet", name: "Billeteras virtuales", isDefault: true },
      { id: "card", name: "Tarjetas", isDefault: true },
      { id: "cash", name: "Efectivo", isDefault: true }
    ],
    paymentMethods: [
      { id: "method-mp", typeId: "wallet", name: "Mercado Pago", isDefault: true },
      { id: "method-naranja", typeId: "wallet", name: "Naranja X", isDefault: true },
      { id: "method-cuenta-dni", typeId: "wallet", name: "Cuenta DNI", isDefault: true },
      { id: "method-bbva", typeId: "card", name: "Banco BBVA", isDefault: true },
      { id: "method-santander", typeId: "card", name: "Banco Santander", isDefault: true },
      { id: "method-provincia", typeId: "card", name: "Banco Provincia", isDefault: true },
      { id: "method-cash", typeId: "cash", name: "Efectivo", isDefault: true }
    ]
  };

  const announcement = document.getElementById("announcement");
  const themeInputs = [...document.querySelectorAll('input[name="theme"]')];
  const incomeList = document.getElementById("income-category-list");
  const expenseList = document.getElementById("expense-category-list");
  const paymentTypeList = document.getElementById("payment-type-list");
  const dialog = document.getElementById("editor-dialog");
  const editorForm = document.getElementById("editor-form");
  const editorName = document.getElementById("entity-name");
  const editorError = document.getElementById("editor-error");
  const editorCategoryKind = document.getElementById("category-kind");
  const editorPaymentType = document.getElementById("payment-type-select");
  const categoryKindWrap = document.getElementById("category-kind-wrap");
  const paymentTypeWrap = document.getElementById("payment-type-wrap");
  const announcementTimer = { id: 0 };

  let model = loadModel();
  let themePreference = readThemePreference();
  let editorKind = "";
  let lastTrigger = null;
  let lastTriggerTypeId = "";
  let hasShownStorageWarning = false;
  let expandedTypeIds = new Set(["wallet"]);

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function validModel(value) {
    if (!value || !Array.isArray(value.categories) || !Array.isArray(value.paymentTypes) || !Array.isArray(value.paymentMethods)) return false;
    const typeIds = new Set(value.paymentTypes.map(type => type && type.id));
    return value.categories.every(item => item && typeof item.id === "string" && typeof item.name === "string" && (item.type === "income" || item.type === "expense") && typeof item.isDefault === "boolean")
      && value.paymentTypes.every(item => item && typeof item.id === "string" && typeof item.name === "string" && typeof item.isDefault === "boolean")
      && value.paymentMethods.every(item => item && typeof item.id === "string" && typeof item.name === "string" && typeIds.has(item.typeId) && typeof item.isDefault === "boolean");
  }

  function loadModel() {
    try {
      const saved = localStorage.getItem(MODEL_KEY);
      if (!saved) return clone(DEFAULT_MODEL);
      const parsed = JSON.parse(saved);
      if (validModel(parsed)) return parsed;
      window.setTimeout(() => showAnnouncement("Los datos de demostración guardados no tienen un formato reconocido. Se muestran los ejemplos iniciales sin sobrescribir lo que estaba guardado.", "error"), 0);
    } catch {
      window.setTimeout(() => showAnnouncement("El navegador no permitió leer los datos guardados. Los cambios seguirán disponibles durante esta visita.", "error"), 0);
    }
    return clone(DEFAULT_MODEL);
  }

  function readThemePreference() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (["light", "dark", "auto"].includes(saved)) return saved;
    } catch {
      // El tema automático sigue funcionando aunque el almacenamiento no esté disponible.
    }
    return "auto";
  }

  function showAnnouncement(message, tone = "success") {
    window.clearTimeout(announcementTimer.id);
    announcement.textContent = message;
    announcement.dataset.tone = tone;
    announcement.hidden = false;
    announcementTimer.id = window.setTimeout(() => { announcement.hidden = true; }, 5200);
  }

  function saveModel() {
    try {
      localStorage.setItem(MODEL_KEY, JSON.stringify(model));
      return true;
    } catch {
      if (!hasShownStorageWarning) {
        showAnnouncement("El navegador no permitió conservar los cambios. Seguirán visibles hasta cerrar o recargar esta página.", "error");
        hasShownStorageWarning = true;
      }
      return false;
    }
  }

  function saveThemePreference() {
    try {
      localStorage.setItem(THEME_KEY, themePreference);
      return true;
    } catch {
      showAnnouncement("El tema se aplicó, pero el navegador no permitió conservar la preferencia para la próxima visita.", "error");
      return false;
    }
  }

  function applyTheme() {
    let resolved = themePreference;
    if (themePreference === "auto") {
      try {
        resolved = typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } catch {
        resolved = "light";
      }
    }
    document.documentElement.dataset.theme = resolved;
    const colorMeta = document.querySelector('meta[name="theme-color"]');
    if (colorMeta) colorMeta.content = resolved === "dark" ? "#111914" : "#f4f7f4";
    for (const input of themeInputs) input.checked = input.value === themePreference;
  }

  function createSvg(pathData, viewBox = "0 0 24 24") {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", viewBox);
    svg.setAttribute("aria-hidden", "true");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", pathData);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    return svg;
  }

  function makeOriginBadge(isDefault) {
    const badge = document.createElement("span");
    badge.className = `origin-badge${isDefault ? "" : " custom"}`;
    badge.textContent = isDefault ? "Predeterminada" : "Personalizada";
    return badge;
  }

  function makeDeleteButton(label, action, id) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "icon-button";
    button.setAttribute("aria-label", label);
    button.title = label;
    button.dataset.action = action;
    button.dataset.id = id;
    button.append(createSvg("M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"));
    return button;
  }

  function makeCategoryRow(item) {
    const row = document.createElement("li");
    row.className = "item-row";
    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = item.name;
    row.append(name, makeOriginBadge(item.isDefault));
    if (!item.isDefault) row.append(makeDeleteButton(`Eliminar categoría ${item.name}`, "delete-category", item.id));
    return row;
  }

  function renderCategoryGroup(list, countElement, entries, emptyMessage) {
    list.replaceChildren();
    countElement.textContent = String(entries.length);
    if (!entries.length) {
      const empty = document.createElement("li");
      empty.className = "empty-list";
      empty.textContent = emptyMessage;
      list.append(empty);
      return;
    }
    for (const item of entries) list.append(makeCategoryRow(item));
  }

  function renderCategories() {
    const income = model.categories.filter(item => item.type === "income");
    const expense = model.categories.filter(item => item.type === "expense");
    renderCategoryGroup(incomeList, document.getElementById("income-count"), income, "Todavía no hay categorías de ingresos.");
    renderCategoryGroup(expenseList, document.getElementById("expense-count"), expense, "Todavía no hay categorías de gastos.");
  }

  function makeMethodRow(method) {
    const row = document.createElement("li");
    row.className = "method-row";
    const name = document.createElement("span");
    name.className = "item-name";
    name.textContent = method.name;
    row.append(name, makeOriginBadge(method.isDefault));
    if (!method.isDefault) row.append(makeDeleteButton(`Eliminar medio ${method.name}`, "delete-method", method.id));
    return row;
  }

  function makePaymentTypeCard(type) {
    const card = document.createElement("article");
    card.className = "payment-type-card";
    const heading = document.createElement("div");
    heading.className = "payment-card-heading";

    const panelId = `methods-${type.id}`;
    const expanded = expandedTypeIds.has(type.id);
    const toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "expand-button";
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-controls", panelId);
    toggle.dataset.action = "toggle-type";
    toggle.dataset.id = type.id;
    const name = document.createElement("strong");
    name.textContent = type.name;
    const chevron = createSvg("m7 10 5 5 5-5");
    chevron.classList.add("chevron");
    toggle.append(name, chevron);
    heading.append(toggle, makeOriginBadge(type.isDefault));
    if (!type.isDefault) heading.append(makeDeleteButton(`Eliminar tipo ${type.name}`, "delete-type", type.id));

    const content = document.createElement("div");
    content.className = "payment-type-content";
    content.id = panelId;
    content.hidden = !expanded;
    const methods = model.paymentMethods.filter(method => method.typeId === type.id);
    const list = document.createElement("ul");
    list.className = "methods-list";
    list.setAttribute("aria-label", `Medios específicos de ${type.name}`);
    if (methods.length) {
      for (const method of methods) list.append(makeMethodRow(method));
    } else {
      const empty = document.createElement("li");
      empty.className = "empty-list";
      empty.textContent = "Todavía no hay medios específicos.";
      list.append(empty);
    }
    const addMethod = document.createElement("button");
    addMethod.type = "button";
    addMethod.className = "add-method";
    addMethod.dataset.action = "add-method";
    addMethod.dataset.typeId = type.id;
    addMethod.append(createSvg("M12 5v14M5 12h14"));
    addMethod.append(document.createTextNode("Agregar medio a este tipo"));
    content.append(list, addMethod);
    card.append(heading, content);
    return card;
  }

  function renderPaymentTypes() {
    paymentTypeList.replaceChildren();
    if (!model.paymentTypes.length) {
      const empty = document.createElement("p");
      empty.className = "empty-list";
      empty.textContent = "No hay tipos de medios disponibles.";
      paymentTypeList.append(empty);
      return;
    }
    for (const type of model.paymentTypes) paymentTypeList.append(makePaymentTypeCard(type));
  }

  function renderAll() {
    renderCategories();
    renderPaymentTypes();
  }

  function comparableName(value) {
    return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR");
  }

  function makeId(prefix) {
    const random = globalThis.crypto && typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    return `${prefix}-${random}`;
  }

  function showEditor(kind, trigger, typeId = "") {
    editorKind = kind;
    lastTrigger = trigger;
    lastTriggerTypeId = typeId;
    editorForm.reset();
    editorError.textContent = "";
    editorError.hidden = true;
    editorName.setAttribute("aria-invalid", "false");
    categoryKindWrap.hidden = kind !== "category";
    paymentTypeWrap.hidden = kind !== "payment-method";

    const title = document.getElementById("dialog-title");
    const help = document.getElementById("dialog-help");
    const label = document.getElementById("entity-name-label");
    const hint = document.getElementById("entity-name-hint");
    const save = document.getElementById("save-dialog");
    if (kind === "category") {
      title.textContent = "Agregar categoría";
      help.textContent = "Elegí el tipo y un nombre para la categoría personalizada.";
      label.firstChild.textContent = "Nombre de la categoría ";
      hint.textContent = "El nombre no puede repetirse dentro del mismo grupo.";
      editorName.maxLength = 80;
      save.textContent = "Guardar categoría";
    } else if (kind === "payment-type") {
      title.textContent = "Agregar tipo de medio";
      help.textContent = "Creá un grupo personalizado para organizar medios específicos.";
      label.firstChild.textContent = "Nombre del tipo ";
      hint.textContent = "Por ejemplo: una categoría general de medios que uses.";
      editorName.maxLength = 80;
      save.textContent = "Guardar tipo";
    } else {
      title.textContent = "Agregar medio de pago";
      help.textContent = "El medio específico quedará vinculado al tipo que elijas.";
      label.firstChild.textContent = "Nombre del medio ";
      hint.textContent = "El nombre no puede repetirse dentro del mismo tipo.";
      editorName.maxLength = 100;
      save.textContent = "Guardar medio";
      editorPaymentType.replaceChildren();
      for (const type of model.paymentTypes) editorPaymentType.add(new Option(type.name, type.id));
      editorPaymentType.value = model.paymentTypes.some(type => type.id === typeId) ? typeId : model.paymentTypes[0]?.id || "";
    }
    dialog.showModal();
    window.requestAnimationFrame(() => editorName.focus());
  }

  function clearEditorError() {
    editorError.textContent = "";
    editorError.hidden = true;
    editorName.setAttribute("aria-invalid", "false");
    editorPaymentType.removeAttribute("aria-invalid");
  }

  function closeEditor() {
    if (dialog.open) dialog.close();
  }

  function duplicateName(items, name) {
    const normalized = comparableName(name);
    return items.some(item => comparableName(item.name) === normalized);
  }

  function persistAndAnnounce(message) {
    if (saveModel()) showAnnouncement(message);
  }

  function handleEditorSubmit(event) {
    event.preventDefault();
    clearEditorError();
    const name = editorName.value.trim();
    if (!name) {
      editorError.textContent = "Ingresá un nombre para continuar.";
      editorError.hidden = false;
      editorName.setAttribute("aria-invalid", "true");
      editorName.focus();
      return;
    }

    if (editorKind === "category") {
      const type = editorCategoryKind.value;
      const sameGroup = model.categories.filter(item => item.type === type);
      if (duplicateName(sameGroup, name)) {
        editorError.textContent = "Ya existe una categoría con ese nombre dentro del grupo elegido.";
        editorError.hidden = false;
        editorName.setAttribute("aria-invalid", "true");
        editorName.focus();
        return;
      }
      model.categories.push({ id: makeId("cat"), name, type, isDefault: false });
      renderCategories();
      closeEditor();
      persistAndAnnounce(`Se agregó la categoría personalizada «${name}» en esta demostración.`);
      return;
    }

    if (editorKind === "payment-type") {
      if (duplicateName(model.paymentTypes, name)) {
        editorError.textContent = "Ya existe un tipo de medio con ese nombre.";
        editorError.hidden = false;
        editorName.setAttribute("aria-invalid", "true");
        editorName.focus();
        return;
      }
      const id = makeId("type");
      model.paymentTypes.push({ id, name, isDefault: false });
      expandedTypeIds.add(id);
      renderPaymentTypes();
      closeEditor();
      persistAndAnnounce(`Se agregó el tipo «${name}». Ahora podés sumar medios específicos.`);
      return;
    }

    const typeId = editorPaymentType.value;
    const type = model.paymentTypes.find(item => item.id === typeId);
    if (!type) {
      editorError.textContent = "Elegí un tipo de medio válido.";
      editorError.hidden = false;
      editorPaymentType.setAttribute("aria-invalid", "true");
      editorPaymentType.focus();
      return;
    }
    const sameType = model.paymentMethods.filter(item => item.typeId === typeId);
    if (duplicateName(sameType, name)) {
      editorError.textContent = "Ya existe un medio con ese nombre dentro del tipo elegido.";
      editorError.hidden = false;
      editorName.setAttribute("aria-invalid", "true");
      editorName.focus();
      return;
    }
    model.paymentMethods.push({ id: makeId("method"), typeId, name, isDefault: false });
    expandedTypeIds.add(typeId);
    renderPaymentTypes();
    closeEditor();
    persistAndAnnounce(`Se agregó «${name}» dentro de «${type.name}» en esta demostración.`);
  }

  function handleCategoryAction(event) {
    const button = event.target.closest('[data-action="delete-category"]');
    if (!button) return;
    const item = model.categories.find(category => category.id === button.dataset.id);
    if (!item || item.isDefault) return;
    const accepted = window.confirm(`¿Eliminar la categoría personalizada «${item.name}»? La demostración no verifica si hay movimientos reales asociados.`);
    if (!accepted) return;
    model.categories = model.categories.filter(category => category.id !== item.id);
    renderCategories();
    persistAndAnnounce(`Se quitó «${item.name}» de esta demostración. No se consultaron movimientos reales.`);
  }

  function handlePaymentAction(event) {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const { action, id, typeId } = actionButton.dataset;

    if (action === "toggle-type") {
      if (expandedTypeIds.has(id)) expandedTypeIds.delete(id);
      else expandedTypeIds.add(id);
      renderPaymentTypes();
      const updated = paymentTypeList.querySelector(`[data-action="toggle-type"][data-id="${CSS.escape(id)}"]`);
      updated?.focus();
      return;
    }
    if (action === "add-method") {
      showEditor("payment-method", actionButton, typeId);
      return;
    }
    if (action === "delete-method") {
      const item = model.paymentMethods.find(method => method.id === id);
      if (!item || item.isDefault) return;
      const type = model.paymentTypes.find(entry => entry.id === item.typeId);
      const accepted = window.confirm(`¿Eliminar el medio «${item.name}» de «${type?.name || "este tipo"}»? En el sistema real, una asociación con movimientos puede impedir el borrado. Esta demostración no verifica movimientos reales.`);
      if (!accepted) return;
      model.paymentMethods = model.paymentMethods.filter(method => method.id !== id);
      renderPaymentTypes();
      persistAndAnnounce(`Se quitó «${item.name}» de esta demostración. No se consultaron movimientos reales.`);
      return;
    }
    if (action === "delete-type") {
      const type = model.paymentTypes.find(entry => entry.id === id);
      if (!type || type.isDefault) return;
      const contained = model.paymentMethods.filter(method => method.typeId === id);
      if (contained.length) {
        showAnnouncement(`No se puede eliminar «${type.name}» mientras contenga medios específicos. Quitá primero sus medios personalizados; los predeterminados están protegidos.`, "error");
        return;
      }
      const accepted = window.confirm(`¿Eliminar el tipo personalizado «${type.name}»? La demostración no verifica movimientos históricos reales.`);
      if (!accepted) return;
      model.paymentTypes = model.paymentTypes.filter(entry => entry.id !== id);
      expandedTypeIds.delete(id);
      renderPaymentTypes();
      persistAndAnnounce(`Se quitó el tipo «${type.name}» de esta demostración. No se consultaron movimientos reales.`);
    }
  }

  function initialize() {
    applyTheme();
    renderAll();
    themeInputs.forEach(input => input.addEventListener("change", () => {
      if (!input.checked) return;
      themePreference = input.value;
      applyTheme();
      if (saveThemePreference()) showAnnouncement(`Tema ${input.value === "auto" ? "automático" : input.value === "dark" ? "oscuro" : "claro"} aplicado a esta demostración.`);
    }));

    if (typeof window.matchMedia === "function") {
      try {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handlePreferenceChange = () => { if (themePreference === "auto") applyTheme(); };
        if (typeof media.addEventListener === "function") media.addEventListener("change", handlePreferenceChange);
        else if (typeof media.addListener === "function") media.addListener(handlePreferenceChange);
      } catch {
        // Si la preferencia del dispositivo no está disponible, el modo automático usa claro.
      }
    }

    document.getElementById("add-category").addEventListener("click", event => showEditor("category", event.currentTarget));
    document.getElementById("add-payment-type").addEventListener("click", event => showEditor("payment-type", event.currentTarget));
    incomeList.addEventListener("click", handleCategoryAction);
    expenseList.addEventListener("click", handleCategoryAction);
    paymentTypeList.addEventListener("click", handlePaymentAction);
    editorForm.addEventListener("submit", handleEditorSubmit);
    editorName.addEventListener("input", clearEditorError);
    editorCategoryKind.addEventListener("change", clearEditorError);
    editorPaymentType.addEventListener("change", clearEditorError);
    document.getElementById("close-dialog").addEventListener("click", closeEditor);
    document.getElementById("cancel-dialog").addEventListener("click", closeEditor);
    dialog.addEventListener("click", event => { if (event.target === dialog) closeEditor(); });
    dialog.addEventListener("close", () => {
      clearEditorError();
      const focusTarget = lastTrigger?.isConnected ? lastTrigger : lastTriggerTypeId
        ? paymentTypeList.querySelector(`[data-action="add-method"][data-type-id="${CSS.escape(lastTriggerTypeId)}"]`)
        : null;
      (focusTarget || document.getElementById("add-category"))?.focus();
      lastTrigger = null;
      lastTriggerTypeId = "";
    });

    document.querySelectorAll("[data-demo-nav]").forEach(button => button.addEventListener("click", () => {
      showAnnouncement(`${button.dataset.demoNav} es un acceso visual de demostración; las otras secciones no están implementadas en esta pantalla.`, "info");
    }));
  }

  initialize();
})();
