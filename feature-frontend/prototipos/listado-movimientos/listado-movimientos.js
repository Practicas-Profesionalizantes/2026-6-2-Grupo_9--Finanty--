(() => {
  "use strict";

  const THEME_KEY = "finanty.configuration.theme.v1";
  const CATEGORIES = {
    income: ["Sueldo", "Trabajos", "Ventas", "Otros ingresos"],
    expense: ["Alimentación", "Transporte", "Vivienda", "Salud", "Educación", "Entretenimiento", "Otros gastos"]
  };
  const PAYMENT_TYPES = [
    { id: "wallet", name: "Billeteras virtuales", methods: ["Mercado Pago", "Naranja X", "Cuenta DNI"] },
    { id: "card", name: "Tarjetas", methods: ["Banco BBVA", "Banco Santander", "Banco Provincia"] },
    { id: "cash", name: "Efectivo", methods: ["Efectivo"] }
  ];
  const DEMO_MOVEMENTS = [
    { id: "mov-01", date: "2026-10-09", time: "12:30", description: "Compra en Carrefour", category: "Alimentación", type: "expense", amount: 18500, paymentType: "wallet", paymentMethod: "Mercado Pago" },
    { id: "mov-02", date: "2026-10-09", time: "10:25", description: "Viaje en SUBE", category: "Transporte", type: "expense", amount: 6400, paymentType: "cash", paymentMethod: "Efectivo" },
    { id: "mov-03", date: "2026-10-08", time: "09:10", description: "Cobro de sueldo", category: "Sueldo", type: "income", amount: 650000, paymentType: "card", paymentMethod: "Banco BBVA" },
    { id: "mov-04", date: "2026-10-07", time: "18:30", description: "Carga de transporte", category: "Transporte", type: "expense", amount: 22600, paymentType: "wallet", paymentMethod: "Cuenta DNI" },
    { id: "mov-05", date: "2026-10-06", time: "08:15", description: "Pago de alquiler", category: "Vivienda", type: "expense", amount: 180000, paymentType: "card", paymentMethod: "Banco Provincia" },
    { id: "mov-06", date: "2026-10-05", time: "13:50", description: "Compra en farmacia", category: "Salud", type: "expense", amount: 14500, paymentType: "cash", paymentMethod: "Efectivo" },
    { id: "mov-07", date: "2026-10-04", time: "17:22", description: "Trabajo independiente", category: "Trabajos", type: "income", amount: 85000, paymentType: "wallet", paymentMethod: "Naranja X" },
    { id: "mov-08", date: "2026-10-03", time: "20:00", description: "Entrada de cine", category: "Entretenimiento", type: "expense", amount: 21500, paymentType: "wallet", paymentMethod: "Naranja X" },
    { id: "mov-09", date: "2026-10-02", time: "11:35", description: "Útiles escolares", category: "Educación", type: "expense", amount: 12000, paymentType: "card", paymentMethod: "Banco Santander" },
    { id: "mov-10", date: "2026-10-01", time: "16:05", description: "Artículos para el hogar", category: "Otros gastos", type: "expense", amount: 10000, paymentType: "cash", paymentMethod: "Efectivo" },
    { id: "mov-11", date: "2026-09-29", time: "14:10", description: "Venta de mueble usado", category: "Ventas", type: "income", amount: 42000, paymentType: "wallet", paymentMethod: "Mercado Pago" },
    { id: "mov-12", date: "2026-09-28", time: "19:05", description: "Ropa y calzado", category: "Otros gastos", type: "expense", amount: 32900, paymentType: "card", paymentMethod: "Banco BBVA" },
    { id: "mov-13", date: "2026-09-27", time: "10:00", description: "Abono de internet", category: "Vivienda", type: "expense", amount: 25900, paymentType: "card", paymentMethod: "Banco Santander" },
    { id: "mov-14", date: "2026-09-25", time: "16:20", description: "Diseño de folleto", category: "Trabajos", type: "income", amount: 65000, paymentType: "wallet", paymentMethod: "Cuenta DNI" },
    { id: "mov-15", date: "2026-09-24", time: "09:00", description: "Recarga de transporte", category: "Transporte", type: "expense", amount: 6300, paymentType: "cash", paymentMethod: "Efectivo" },
    { id: "mov-16", date: "2026-09-22", time: "08:00", description: "Cuota de curso", category: "Educación", type: "expense", amount: 18000, paymentType: "card", paymentMethod: "Banco Santander" },
    { id: "mov-17", date: "2026-09-20", time: "11:45", description: "Reintegro de compra", category: "Otros ingresos", type: "income", amount: 12000, paymentType: "cash", paymentMethod: "Efectivo" },
    { id: "mov-18", date: "2026-09-19", time: "18:30", description: "Compra de frutas", category: "Alimentación", type: "expense", amount: 7900, paymentType: "cash", paymentMethod: "Efectivo" },
    { id: "mov-19", date: "2026-09-18", time: "13:40", description: "Venta de libros usados", category: "Ventas", type: "income", amount: 24000, paymentType: "cash", paymentMethod: "Efectivo" },
    { id: "mov-20", date: "2026-09-16", time: "19:20", description: "Cena de cumpleaños", category: "Entretenimiento", type: "expense", amount: 16500, paymentType: "wallet", paymentMethod: "Mercado Pago" },
    { id: "mov-21", date: "2026-09-14", time: "09:30", description: "Consulta odontológica", category: "Salud", type: "expense", amount: 22000, paymentType: "card", paymentMethod: "Banco Provincia" }
  ];

  const form = document.getElementById("filter-form");
  const queryInput = document.getElementById("search-query");
  const typeSelect = document.getElementById("filter-type");
  const dateFrom = document.getElementById("date-from");
  const dateTo = document.getElementById("date-to");
  const categorySelect = document.getElementById("filter-category");
  const paymentTypeSelect = document.getElementById("filter-payment-type");
  const paymentMethodSelect = document.getElementById("filter-payment-method");
  const dateError = document.getElementById("date-error");
  const tableBody = document.getElementById("movement-table-body");
  const mobileList = document.getElementById("mobile-list");
  const tableWrap = document.getElementById("table-wrap");
  const emptyState = document.getElementById("empty-state");
  const count = document.getElementById("results-count");
  const summary = document.getElementById("results-summary");
  const sortSelect = document.getElementById("sort-order");
  const feedback = document.getElementById("page-feedback");
  const navFeedback = document.getElementById("nav-feedback");
  const detailDialog = document.getElementById("detail-dialog");
  const detailContent = document.getElementById("detail-content");
  const editDialog = document.getElementById("edit-dialog");
  const editForm = document.getElementById("edit-form");
  const editError = document.getElementById("edit-error");
  const editType = document.getElementById("edit-type");
  const editCategory = document.getElementById("edit-category");
  const editPaymentType = document.getElementById("edit-payment-type");
  const editPaymentMethod = document.getElementById("edit-payment-method");

  let movements = DEMO_MOVEMENTS.map(item => ({ ...item }));
  let appliedFilters = { query: "", type: "all", dateFrom: "", dateTo: "", category: "all", paymentType: "all", paymentMethod: "all" };
  let feedbackTimer = 0;
  let navTimer = 0;
  let themePreference = readThemePreference();

  function readThemePreference() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (["light", "dark", "auto"].includes(saved)) return saved;
    } catch { /* El prototipo conserva el tema claro si el almacenamiento no está disponible. */ }
    return "light";
  }

  function applyTheme() {
    let resolved = themePreference;
    if (themePreference === "auto") {
      try { resolved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
      catch { resolved = "light"; }
    }
    document.documentElement.dataset.theme = resolved;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = resolved === "dark" ? "#111914" : "#f4f7f4";
  }

  function currency(amount) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  }

  function formatDate(date) {
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(year, month - 1, day));
  }

  function normalize(value) {
    return String(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es-AR").trim();
  }

  function addOptions(select, entries, placeholder) {
    select.replaceChildren(new Option(placeholder.label, placeholder.value));
    for (const entry of entries) select.add(new Option(entry.label, entry.value));
  }

  function initializeFilterOptions() {
    const categories = [...CATEGORIES.income, ...CATEGORIES.expense];
    addOptions(categorySelect, categories.map(name => ({ label: name, value: name })), { label: "Todas las categorías", value: "all" });
    addOptions(paymentTypeSelect, PAYMENT_TYPES.map(type => ({ label: type.name, value: type.id })), { label: "Todos", value: "all" });
    updatePaymentMethodOptions("all", "all");
  }

  function updatePaymentMethodOptions(typeId, preferredValue = "all") {
    const types = typeId === "all" ? PAYMENT_TYPES : PAYMENT_TYPES.filter(type => type.id === typeId);
    const methods = types.flatMap(type => type.methods.map(method => ({ label: method, value: method })));
    addOptions(paymentMethodSelect, methods, { label: "Todos los medios", value: "all" });
    paymentMethodSelect.value = methods.some(method => method.value === preferredValue) ? preferredValue : "all";
  }

  function selectedFilters() {
    return {
      query: normalize(queryInput.value),
      type: typeSelect.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      category: categorySelect.value,
      paymentType: paymentTypeSelect.value,
      paymentMethod: paymentMethodSelect.value
    };
  }

  function validateDateRange() {
    const invalid = Boolean(dateFrom.value && dateTo.value && dateFrom.value > dateTo.value);
    dateError.hidden = !invalid;
    dateError.textContent = invalid ? "La fecha desde debe ser anterior o igual a la fecha hasta." : "";
    dateFrom.setAttribute("aria-invalid", String(invalid));
    dateTo.setAttribute("aria-invalid", String(invalid));
    return !invalid;
  }

  function getFilteredMovements() {
    return movements.filter(movement => {
      const searchable = normalize(`${movement.description} ${movement.merchant || ""}`);
      if (appliedFilters.query && !searchable.includes(appliedFilters.query)) return false;
      if (appliedFilters.type !== "all" && movement.type !== appliedFilters.type) return false;
      if (appliedFilters.dateFrom && movement.date < appliedFilters.dateFrom) return false;
      if (appliedFilters.dateTo && movement.date > appliedFilters.dateTo) return false;
      if (appliedFilters.category !== "all" && movement.category !== appliedFilters.category) return false;
      if (appliedFilters.paymentType !== "all" && movement.paymentType !== appliedFilters.paymentType) return false;
      if (appliedFilters.paymentMethod !== "all" && movement.paymentMethod !== appliedFilters.paymentMethod) return false;
      return true;
    }).sort((a, b) => {
      const aKey = `${a.date}T${a.time}`;
      const bKey = `${b.date}T${b.time}`;
      return sortSelect.value === "oldest" ? aKey.localeCompare(bKey) : bKey.localeCompare(aKey);
    });
  }

  function actionButton(action, id, label, text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `row-action${action === "delete" ? " delete" : ""}`;
    button.dataset.action = action;
    button.dataset.id = id;
    button.setAttribute("aria-label", `${label}: ${movements.find(item => item.id === id)?.description || "movimiento"}`);
    button.textContent = text;
    return button;
  }

  function createActions(id, compact = false) {
    const actions = document.createElement("div");
    actions.className = compact ? "card-actions" : "row-actions";
    actions.setAttribute("aria-label", "Acciones del movimiento");
    actions.append(
      actionButton("view", id, "Consultar", compact ? "Consultar" : "Ver"),
      actionButton("edit", id, "Modificar", compact ? "Modificar" : "Editar"),
      actionButton("delete", id, "Eliminar", compact ? "Eliminar" : "Borrar")
    );
    return actions;
  }

  function createTypePill(movement) {
    const pill = document.createElement("span");
    pill.className = `type-pill is-${movement.type}`;
    const dot = document.createElement("i");
    dot.setAttribute("aria-hidden", "true");
    pill.append(dot, document.createTextNode(movement.type === "income" ? "Ingreso" : "Gasto"));
    return pill;
  }

  function createTableRow(movement) {
    const row = document.createElement("tr");
    const date = document.createElement("td");
    date.className = "date-cell";
    date.textContent = `${formatDate(movement.date)} · ${movement.time}`;
    const description = document.createElement("td");
    description.className = "description-cell";
    description.textContent = movement.description;
    const category = document.createElement("td");
    category.className = "category-cell";
    category.textContent = movement.category;
    const paymentType = document.createElement("td");
    paymentType.className = "payment-cell";
    paymentType.textContent = PAYMENT_TYPES.find(type => type.id === movement.paymentType)?.name || movement.paymentType;
    const paymentMethod = document.createElement("td");
    paymentMethod.className = "payment-cell";
    paymentMethod.textContent = movement.paymentMethod;
    const type = document.createElement("td");
    type.className = "type-cell";
    type.append(createTypePill(movement));
    const amount = document.createElement("td");
    amount.className = `amount-cell is-${movement.type}`;
    amount.textContent = `${movement.type === "income" ? "+" : "−"}${currency(movement.amount)}`;
    const actions = document.createElement("td");
    actions.className = "actions-cell";
    actions.append(createActions(movement.id));
    row.append(date, description, category, paymentType, paymentMethod, type, amount, actions);
    return row;
  }

  function createMobileCard(movement) {
    const card = document.createElement("article");
    card.className = "movement-card";
    const main = document.createElement("div");
    main.className = "card-main";
    const description = document.createElement("strong");
    description.className = "card-description";
    description.textContent = movement.description;
    const category = document.createElement("span");
    category.className = "card-category";
    category.textContent = movement.category;
    main.append(description, category);
    const amount = document.createElement("strong");
    amount.className = `card-amount is-${movement.type}`;
    amount.textContent = `${movement.type === "income" ? "+" : "−"}${currency(movement.amount)}`;
    const meta = document.createElement("div");
    meta.className = "card-meta";
    const date = document.createElement("span");
    date.className = "card-date";
    date.textContent = `${formatDate(movement.date)} · ${movement.time}`;
    const typeName = document.createElement("span");
    typeName.textContent = PAYMENT_TYPES.find(type => type.id === movement.paymentType)?.name || movement.paymentType;
    const method = document.createElement("span");
    method.textContent = movement.paymentMethod;
    meta.append(date, createTypePill(movement), typeName, method);
    card.append(main, amount, meta, createActions(movement.id, true));
    return card;
  }

  function render() {
    const filtered = getFilteredMovements();
    document.getElementById("demo-count").textContent = `${movements.length} ejemplos`;
    count.textContent = String(filtered.length);
    summary.textContent = appliedFilters.query || appliedFilters.type !== "all" || appliedFilters.dateFrom || appliedFilters.dateTo || appliedFilters.category !== "all" || appliedFilters.paymentType !== "all" || appliedFilters.paymentMethod !== "all"
      ? `Coincidencias para los filtros seleccionados · ${filtered.length} ${filtered.length === 1 ? "movimiento" : "movimientos"}`
      : `Mostrando los ${filtered.length} movimientos de demostración`;
    tableBody.replaceChildren(...filtered.map(createTableRow));
    mobileList.replaceChildren(...filtered.map(createMobileCard));
    const isEmpty = filtered.length === 0;
    tableWrap.hidden = isEmpty;
    mobileList.hidden = isEmpty;
    emptyState.hidden = !isEmpty;
  }

  function announce(message, tone = "success") {
    window.clearTimeout(feedbackTimer);
    feedback.textContent = message;
    feedback.dataset.tone = tone;
    feedback.hidden = false;
    feedbackTimer = window.setTimeout(() => { feedback.hidden = true; }, 5200);
  }

  function applyFilters(event) {
    event?.preventDefault();
    if (!validateDateRange()) {
      dateFrom.focus();
      return;
    }
    appliedFilters = selectedFilters();
    render();
  }

  function clearFilters() {
    form.reset();
    updatePaymentMethodOptions("all", "all");
    dateError.hidden = true;
    dateError.textContent = "";
    dateFrom.setAttribute("aria-invalid", "false");
    dateTo.setAttribute("aria-invalid", "false");
    appliedFilters = { query: "", type: "all", dateFrom: "", dateTo: "", category: "all", paymentType: "all", paymentMethod: "all" };
    render();
  }

  function appendDetail(label, value, className = "") {
    const row = document.createElement("div");
    row.className = "detail-row";
    const name = document.createElement("span");
    name.textContent = label;
    const detail = document.createElement("strong");
    detail.className = className;
    detail.textContent = value;
    row.append(name, detail);
    detailContent.append(row);
  }

  function showDetails(movement) {
    detailContent.replaceChildren();
    appendDetail("Comercio o descripción", movement.description);
    appendDetail("Tipo de movimiento", movement.type === "income" ? "Ingreso" : "Gasto");
    appendDetail("Importe", currency(movement.amount), `is-${movement.type}`);
    appendDetail("Fecha y hora", `${formatDate(movement.date)} · ${movement.time}`);
    appendDetail("Categoría", movement.category);
    appendDetail("Tipo de medio", PAYMENT_TYPES.find(type => type.id === movement.paymentType)?.name || movement.paymentType);
    appendDetail("Medio específico", movement.paymentMethod);
    detailDialog.showModal();
  }

  function populateEditCategories(preferred = "") {
    const options = CATEGORIES[editType.value] || [];
    addOptions(editCategory, options.map(name => ({ label: name, value: name })), { label: "Seleccionar categoría", value: "" });
    editCategory.value = options.includes(preferred) ? preferred : options[0] || "";
  }

  function populateEditPaymentMethods(preferred = "") {
    const type = PAYMENT_TYPES.find(item => item.id === editPaymentType.value);
    const options = type?.methods || [];
    addOptions(editPaymentMethod, options.map(name => ({ label: name, value: name })), { label: "Seleccionar medio", value: "" });
    editPaymentMethod.value = options.includes(preferred) ? preferred : options[0] || "";
  }

  function openEditor(movement) {
    document.getElementById("edit-id").value = movement.id;
    document.getElementById("edit-description").value = movement.description;
    document.getElementById("edit-amount").value = movement.amount;
    document.getElementById("edit-date").value = movement.date;
    document.getElementById("edit-time").value = movement.time;
    editType.value = movement.type;
    populateEditCategories(movement.category);
    addOptions(editPaymentType, PAYMENT_TYPES.map(type => ({ label: type.name, value: type.id })), { label: "Seleccionar tipo", value: "" });
    editPaymentType.value = movement.paymentType;
    populateEditPaymentMethods(movement.paymentMethod);
    editError.hidden = true;
    editError.textContent = "";
    editDialog.showModal();
  }

  function handleMovementAction(event) {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const movement = movements.find(item => item.id === button.dataset.id);
    if (!movement) return;
    if (button.dataset.action === "view") showDetails(movement);
    if (button.dataset.action === "edit") openEditor(movement);
    if (button.dataset.action === "delete") {
      const accepted = window.confirm(`¿Eliminar «${movement.description}» de esta lista de demostración?`);
      if (!accepted) return;
      movements = movements.filter(item => item.id !== movement.id);
      render();
      announce("El movimiento se quitó de la lista de demostración. No se modificó una base de datos.");
    }
  }

  function saveEdit(event) {
    event.preventDefault();
    editError.hidden = true;
    if (!editForm.reportValidity()) return;
    const id = document.getElementById("edit-id").value;
    const movement = movements.find(item => item.id === id);
    const amount = Number(document.getElementById("edit-amount").value);
    if (!movement || !Number.isFinite(amount) || amount <= 0 || !editCategory.value || !editPaymentMethod.value) {
      editError.textContent = "Revisá el importe, la categoría y el medio de pago antes de guardar.";
      editError.hidden = false;
      return;
    }
    movement.description = document.getElementById("edit-description").value.trim();
    movement.amount = amount;
    movement.date = document.getElementById("edit-date").value;
    movement.time = document.getElementById("edit-time").value;
    movement.type = editType.value;
    movement.category = editCategory.value;
    movement.paymentType = editPaymentType.value;
    movement.paymentMethod = editPaymentMethod.value;
    editDialog.close();
    render();
    announce("Cambios aplicados a la lista local de demostración.");
  }

  function closeDialogs(event) {
    const button = event.target.closest("[data-close-dialog]");
    if (!button) return;
    button.closest("dialog")?.close();
  }

  function showNavFeedback(name) {
    window.clearTimeout(navTimer);
    navFeedback.textContent = `${name} todavía está pendiente de integración en este prototipo.`;
    navFeedback.hidden = false;
    navFeedback.focus();
    navTimer = window.setTimeout(() => { navFeedback.hidden = true; }, 5000);
  }

  function initialize() {
    applyTheme();
    initializeFilterOptions();
    document.getElementById("demo-count").textContent = `${movements.length} ejemplos`;
    form.addEventListener("submit", applyFilters);
    document.getElementById("clear-filters").addEventListener("click", clearFilters);
    document.getElementById("empty-clear").addEventListener("click", clearFilters);
    paymentTypeSelect.addEventListener("change", () => updatePaymentMethodOptions(paymentTypeSelect.value, paymentMethodSelect.value));
    dateFrom.addEventListener("input", validateDateRange);
    dateTo.addEventListener("input", validateDateRange);
    sortSelect.addEventListener("change", render);
    document.getElementById("movement-table-body").addEventListener("click", handleMovementAction);
    mobileList.addEventListener("click", handleMovementAction);
    document.querySelectorAll("[data-close-dialog]").forEach(button => button.addEventListener("click", closeDialogs));
    document.querySelectorAll("dialog").forEach(dialog => dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); }));
    editType.addEventListener("change", () => populateEditCategories());
    editPaymentType.addEventListener("change", () => populateEditPaymentMethods());
    editForm.addEventListener("submit", saveEdit);
    document.querySelectorAll("[data-demo-nav]").forEach(button => button.addEventListener("click", () => showNavFeedback(button.dataset.demoNav)));
    render();

    if (typeof window.matchMedia === "function") {
      try {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => { if (themePreference === "auto") applyTheme(); };
        if (typeof media.addEventListener === "function") media.addEventListener("change", handleChange);
        else if (typeof media.addListener === "function") media.addListener(handleChange);
      } catch { /* La preferencia del sistema es opcional. */ }
    }
  }

  initialize();
})();
