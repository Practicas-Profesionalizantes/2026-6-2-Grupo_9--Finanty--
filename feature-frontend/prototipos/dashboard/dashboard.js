(() => {
  "use strict";

  const THEME_KEY = "finanty.configuration.theme.v1";
  const DEMO_DATA = {
    period: "Octubre 2026",
    movements: [
      { date: "2026-10-08", time: "12:45", description: "Compra en supermercado", category: "Alimentación", type: "expense", amount: 58400, paymentType: "Billeteras virtuales", payment: "Mercado Pago" },
      { date: "2026-10-08", time: "09:10", description: "Cobro de sueldo", category: "Sueldo", type: "income", amount: 650000, paymentType: "Tarjetas", payment: "Banco BBVA" },
      { date: "2026-10-07", time: "18:30", description: "Viajes de la semana", category: "Transporte", type: "expense", amount: 22600, paymentType: "Billeteras virtuales", payment: "Cuenta DNI" },
      { date: "2026-10-06", time: "08:15", description: "Pago de alquiler", category: "Vivienda", type: "expense", amount: 180000, paymentType: "Tarjetas", payment: "Banco Provincia" },
      { date: "2026-10-05", time: "13:50", description: "Compra en farmacia", category: "Salud", type: "expense", amount: 14500, paymentType: "Efectivo", payment: "Efectivo" },
      { date: "2026-10-04", time: "17:22", description: "Trabajo independiente", category: "Trabajos", type: "income", amount: 85000, paymentType: "Efectivo", payment: "Efectivo" },
      { date: "2026-10-03", time: "20:00", description: "Salida al cine", category: "Entretenimiento", type: "expense", amount: 21500, paymentType: "Billeteras virtuales", payment: "Naranja X" },
      { date: "2026-10-02", time: "11:35", description: "Materiales de estudio", category: "Educación", type: "expense", amount: 12000, paymentType: "Tarjetas", payment: "Banco Santander" },
      { date: "2026-10-01", time: "16:05", description: "Artículos para el hogar", category: "Otros gastos", type: "expense", amount: 10000, paymentType: "Efectivo", payment: "Efectivo" }
    ]
  };

  const comparisonChart = document.getElementById("comparison-chart");
  const categoryChart = document.getElementById("category-chart");
  const recentList = document.getElementById("recent-list");
  const navigationNote = document.getElementById("navigation-note");
  let noteTimer = 0;
  let themePreference = readThemePreference();

  function readThemePreference() {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (["light", "dark", "auto"].includes(saved)) return saved;
    } catch {
      // Si no hay acceso al almacenamiento, el Dashboard usa el tema claro.
    }
    return "light";
  }

  function resolveTheme() {
    if (themePreference === "light" || themePreference === "dark") return themePreference;
    try {
      return typeof window.matchMedia === "function" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch {
      return "light";
    }
  }

  function applyTheme() {
    const theme = resolveTheme();
    document.documentElement.dataset.theme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#111914" : "#f4f7f4";
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  }

  function sumByType(type) {
    return DEMO_DATA.movements.filter(movement => movement.type === type).reduce((sum, movement) => sum + movement.amount, 0);
  }

  function createBarRow(label, amount, width, className) {
    const row = document.createElement("div");
    row.className = "compare-row";
    const name = document.createElement("span");
    name.className = "compare-label";
    name.textContent = label;
    const value = document.createElement("strong");
    value.className = "compare-value";
    value.textContent = formatCurrency(amount);
    const track = document.createElement("div");
    track.className = "bar-track";
    const fill = document.createElement("span");
    fill.className = `bar-fill ${className}`;
    fill.style.width = `${width}%`;
    track.append(fill);
    row.append(name, value, track);
    return row;
  }

  function renderSummaryAndComparison(incomeTotal, expenseTotal) {
    document.getElementById("period-label").textContent = DEMO_DATA.period;
    document.getElementById("comparison-period").textContent = DEMO_DATA.period;
    document.getElementById("income-period").textContent = `${DEMO_DATA.period} · ${DEMO_DATA.movements.filter(item => item.type === "income").length} ingresos ficticios`;
    document.getElementById("expense-period").textContent = `${DEMO_DATA.period} · ${DEMO_DATA.movements.filter(item => item.type === "expense").length} gastos ficticios`;
    const incomeOutput = document.getElementById("income-total");
    const expenseOutput = document.getElementById("expense-total");
    incomeOutput.textContent = formatCurrency(incomeTotal);
    expenseOutput.textContent = formatCurrency(expenseTotal);
    incomeOutput.dataset.value = String(incomeTotal);
    expenseOutput.dataset.value = String(expenseTotal);

    const maximum = Math.max(incomeTotal, expenseTotal, 1);
    comparisonChart.replaceChildren(
      createBarRow("Ingresos", incomeTotal, Math.round(incomeTotal / maximum * 100), "income-fill"),
      createBarRow("Gastos", expenseTotal, Math.round(expenseTotal / maximum * 100), "expense-fill")
    );
    comparisonChart.setAttribute("aria-label", `Comparación para ${DEMO_DATA.period}: ingresos ficticios ${formatCurrency(incomeTotal)} y gastos ficticios ${formatCurrency(expenseTotal)}. Las barras se escalan respecto al total mayor.`);
  }

  function renderCategoryChart(expenseTotal) {
    const totals = new Map();
    for (const movement of DEMO_DATA.movements) {
      if (movement.type !== "expense") continue;
      totals.set(movement.category, (totals.get(movement.category) || 0) + movement.amount);
    }
    const entries = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const largest = Math.max(...entries.map(([, amount]) => amount), 1);
    const accessibleValues = [];
    categoryChart.replaceChildren();
    for (const [name, amount] of entries) {
      const row = document.createElement("div");
      row.className = "category-bar-row";
      const label = document.createElement("span");
      label.className = "category-bar-name";
      label.textContent = name;
      const track = document.createElement("span");
      track.className = "category-bar-track";
      const fill = document.createElement("span");
      fill.className = "category-bar-fill";
      fill.style.width = `${Math.max(4, Math.round(amount / largest * 100))}%`;
      track.append(fill);
      const value = document.createElement("strong");
      value.className = "category-bar-value";
      const share = expenseTotal ? amount / expenseTotal * 100 : 0;
      value.textContent = `${formatCurrency(amount)} · ${share.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`;
      row.append(label, track, value);
      categoryChart.append(row);
      accessibleValues.push(`${name}: ${formatCurrency(amount)}, ${share.toLocaleString("es-AR", { maximumFractionDigits: 1 })}%`);
    }
    categoryChart.setAttribute("aria-label", `Distribución ficticia de gastos por categoría. Total: ${formatCurrency(expenseTotal)}. ${accessibleValues.join("; ")}.`);
    document.getElementById("category-chart-note").textContent = `${entries.length} categorías · total ${formatCurrency(expenseTotal)}.`;
  }

  function formatMovementDate(date, time) {
    const dateLabel = new Intl.DateTimeFormat("es-AR", { day: "2-digit", month: "short" }).format(new Date(`${date}T12:00:00`));
    return `${dateLabel} · ${time}`;
  }

  function createMovementRow(movement) {
    const row = document.createElement("li");
    row.className = "recent-row";
    row.dataset.type = movement.type;

    const main = document.createElement("div");
    main.className = "movement-main";
    const icon = document.createElement("span");
    icon.className = `movement-icon ${movement.type === "income" ? "is-income" : "is-expense"}`;
    icon.setAttribute("aria-hidden", "true");
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", movement.type === "income" ? "M5 16 16 5M7 5h9v9" : "M5 8 16 19M7 19h9v-9");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.8");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    svg.append(path);
    icon.append(svg);

    const text = document.createElement("span");
    text.className = "movement-text";
    const description = document.createElement("strong");
    description.textContent = movement.description;
    const category = document.createElement("span");
    category.className = "movement-category";
    category.textContent = movement.category;
    text.append(description, category);
    main.append(icon, text);

    const meta = document.createElement("div");
    meta.className = "movement-meta";
    const date = document.createElement("time");
    date.className = "movement-date";
    date.dateTime = `${movement.date}T${movement.time}`;
    date.textContent = formatMovementDate(movement.date, movement.time);
    const payment = document.createElement("span");
    payment.className = "movement-payment";
    payment.textContent = `${movement.payment} · ${movement.paymentType}`;
    meta.append(date, payment);

    const type = document.createElement("span");
    type.className = `type-pill ${movement.type === "income" ? "is-income" : "is-expense"}`;
    const typeDot = document.createElement("i");
    typeDot.setAttribute("aria-hidden", "true");
    type.append(typeDot, document.createTextNode(movement.type === "income" ? "Ingreso" : "Gasto"));

    const amount = document.createElement("strong");
    amount.className = `movement-amount ${movement.type === "income" ? "is-income" : "is-expense"}`;
    amount.textContent = `${movement.type === "income" ? "+" : "−"} ${formatCurrency(movement.amount)}`;

    row.append(main, meta, type, amount);
    return row;
  }

  function renderRecentMovements() {
    const recent = [...DEMO_DATA.movements].sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`)).slice(0, 6);
    recentList.replaceChildren(...recent.map(createMovementRow));
  }

  function showPendingSection(sectionName) {
    window.clearTimeout(noteTimer);
    navigationNote.textContent = `${sectionName}: esta pantalla de consulta todavía está pendiente de integración. Los datos de demostración del Dashboard no se guardan ni se consultan en una base de datos.`;
    navigationNote.hidden = false;
    navigationNote.focus();
    noteTimer = window.setTimeout(() => { navigationNote.hidden = true; }, 6000);
  }

  function initialize() {
    applyTheme();
    const incomeTotal = sumByType("income");
    const expenseTotal = sumByType("expense");
    renderSummaryAndComparison(incomeTotal, expenseTotal);
    renderCategoryChart(expenseTotal);
    renderRecentMovements();

    document.querySelectorAll("[data-demo-section]").forEach(button => {
      button.addEventListener("click", () => showPendingSection(button.dataset.demoSection));
    });

    if (themePreference === "auto" && typeof window.matchMedia === "function") {
      try {
        const media = window.matchMedia("(prefers-color-scheme: dark)");
        const handlePreferenceChange = () => applyTheme();
        if (typeof media.addEventListener === "function") media.addEventListener("change", handlePreferenceChange);
        else if (typeof media.addListener === "function") media.addListener(handlePreferenceChange);
      } catch {
        document.documentElement.dataset.theme = "light";
      }
    }
  }

  initialize();
})();
