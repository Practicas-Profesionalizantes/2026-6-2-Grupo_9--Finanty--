(() => {
  "use strict";

  const form = document.getElementById("movement-form");
  const incomeType = document.getElementById("type-income");
  const expenseType = document.getElementById("type-expense");
  const category = document.getElementById("category");
  const paymentType = document.getElementById("payment-type");
  const paymentMethod = document.getElementById("payment-method");
  const navFeedback = document.getElementById("nav-feedback");
  const feedback = document.getElementById("form-feedback");
  const feedbackCopy = document.getElementById("feedback-copy");
  const summaryCopy = document.getElementById("summary-copy");
  const fields = {
    type: { root: document.getElementById("type-field"), error: document.getElementById("type-error") },
    amount: { root: document.getElementById("amount-field"), error: document.getElementById("amount-error"), input: document.getElementById("amount") },
    date: { root: document.getElementById("date-field"), error: document.getElementById("date-error"), input: document.getElementById("movement-date") },
    time: { root: document.getElementById("time-field"), error: document.getElementById("time-error"), input: document.getElementById("movement-time") },
    category: { root: document.getElementById("category-field"), error: document.getElementById("category-error"), input: category },
    paymentType: { root: document.getElementById("payment-type-field"), error: document.getElementById("payment-type-error"), input: paymentType },
    paymentMethod: { root: document.getElementById("payment-field"), error: document.getElementById("payment-error"), input: paymentMethod }
  };

  const categories = {
    gasto: ["Alimentación", "Transporte", "Vivienda", "Salud", "Educación", "Entretenimiento", "Otros gastos"],
    ingreso: ["Sueldo", "Trabajos", "Ventas", "Otros ingresos"]
  };
  const paymentMethods = {
    wallet: ["Mercado Pago", "Naranja X", "Cuenta DNI"],
    card: ["Banco BBVA", "Banco Santander", "Banco Provincia"],
    cash: ["Efectivo"]
  };
  const paymentLabels = { wallet: "Billeteras virtuales", card: "Tarjetas", cash: "Efectivo" };
  function localDateTime() {
    const now = new Date();
    const pad = value => String(value).padStart(2, "0");
    return {
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      time: `${pad(now.getHours())}:${pad(now.getMinutes())}`
    };
  }

  function selectedMovementType() {
    return form.querySelector('input[name="movement-type"]:checked')?.value || "";
  }

  function replaceOptions(select, values, placeholder) {
    select.replaceChildren(new Option(placeholder, ""));
    for (const value of values) select.add(new Option(value, value));
    select.value = "";
  }

  function setError(name, message) {
    const field = fields[name];
    field.error.textContent = message;
    field.error.hidden = !message;
    field.root.classList.toggle("is-invalid", Boolean(message));
    if (field.input) field.input.setAttribute("aria-invalid", String(Boolean(message)));
    if (name === "type") {
      incomeType.setAttribute("aria-invalid", String(Boolean(message)));
      expenseType.setAttribute("aria-invalid", String(Boolean(message)));
    }
  }

  function clearFeedback() {
    feedback.hidden = true;
    feedbackCopy.textContent = "";
    summaryCopy.textContent = "";
  }

  function refreshCategories() {
    const type = selectedMovementType();
    replaceOptions(category, type ? categories[type] : [], type ? "Seleccionar categoría" : "Primero elegí el tipo de movimiento");
    category.disabled = !type;
    setError("category", "");
  }

  function refreshPaymentMethods() {
    const type = paymentType.value;
    replaceOptions(paymentMethod, type ? paymentMethods[type] : [], "Seleccionar medio");
    paymentMethod.disabled = !type;
    setError("paymentMethod", "");
  }

  function amountError() {
    const raw = fields.amount.input.value.trim();
    if (!raw) return "Ingresá el importe del movimiento.";
    if (!/^\d+(?:[.,]\d{1,2})?$/.test(raw)) return "Usá un importe válido, con hasta dos decimales (por ejemplo, 12500,50).";
    if (Number(raw.replace(",", ".")) <= 0) return "El importe debe ser mayor que cero.";
    return "";
  }

  function validate() {
    const type = selectedMovementType();
    const validType = type === "ingreso" || type === "gasto";
    const errors = {
      type: validType ? "" : "Elegí Ingreso o Gasto.",
      amount: amountError(),
      date: fields.date.input.value ? "" : "Completá la fecha del movimiento.",
      time: fields.time.input.value ? "" : "Completá la hora del movimiento.",
      category: validType && categories[type].includes(category.value) ? "" : "Elegí una categoría del tipo de movimiento seleccionado.",
      paymentType: Object.hasOwn(paymentMethods, paymentType.value) ? "" : "Seleccioná el tipo de medio de pago.",
      paymentMethod: Object.hasOwn(paymentMethods, paymentType.value) && paymentMethods[paymentType.value].includes(paymentMethod.value)
        ? ""
        : "Seleccioná un medio que corresponda al tipo elegido."
    };
    for (const [name, message] of Object.entries(errors)) setError(name, message);
    return { valid: Object.values(errors).every(message => !message), errors };
  }

  function focusFirstError(errors) {
    const order = ["type", "amount", "date", "time", "category", "paymentType", "paymentMethod"];
    const first = order.find(name => errors[name]);
    if (!first) return;
    if (first === "type") expenseType.focus();
    else fields[first].input.focus();
  }

  function formatAmount(value) {
    return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(Number(value.replace(",", ".")));
  }

  function clearAllErrors() {
    for (const name of Object.keys(fields)) setError(name, "");
  }

  function initializeDateTime() {
    const current = localDateTime();
    fields.date.input.value = current.date;
    fields.time.input.value = current.time;
  }

  form.addEventListener("change", event => {
    if (event.target.name === "movement-type") {
      refreshCategories();
      clearFeedback();
      setError("type", "");
    } else if (event.target === paymentType) {
      refreshPaymentMethods();
      clearFeedback();
      setError("paymentType", "");
    } else {
      const name = Object.keys(fields).find(key => fields[key].input === event.target);
      if (name) setError(name, "");
      clearFeedback();
    }
  });

  form.addEventListener("input", event => {
    const name = Object.keys(fields).find(key => fields[key].input === event.target);
    if (name) setError(name, "");
    clearFeedback();
  });

  form.addEventListener("submit", event => {
    event.preventDefault();
    clearFeedback();
    const result = validate();
    if (!result.valid) {
      focusFirstError(result.errors);
      return;
    }

    const type = selectedMovementType();
    const selectedTypeLabel = type === "ingreso" ? "Ingreso" : "Gasto";
    const description = document.getElementById("description").value.trim();
    const [year, month, day] = fields.date.input.value.split("-");
    feedbackCopy.textContent = "Se registró correctamente en la demostración del prototipo. No se guardó en una cuenta ni en una base de datos.";
    summaryCopy.textContent = `${selectedTypeLabel} · ${formatAmount(fields.amount.input.value)} · ${category.value} · ${paymentLabels[paymentType.value]} / ${paymentMethod.value} · ${day}/${month}/${year} ${fields.time.input.value}${description ? ` · ${description}` : ""}`;
    feedback.hidden = false;
    feedback.focus();
  });

  document.getElementById("cancel-button").addEventListener("click", () => {
    form.reset();
    clearAllErrors();
    clearFeedback();
    refreshCategories();
    refreshPaymentMethods();
    initializeDateTime();
    navFeedback.textContent = "Carga cancelada. El formulario volvió a su estado inicial.";
    navFeedback.hidden = false;
    window.setTimeout(() => { navFeedback.hidden = true; }, 3800);
    document.getElementById("type-income").focus();
  });

  document.querySelectorAll("[data-demo-nav]").forEach(button => {
    button.addEventListener("click", () => {
      navFeedback.textContent = `${button.dataset.demoNav}: acceso visual de demostración; esta pantalla no cambia de sección.`;
      navFeedback.hidden = false;
      window.setTimeout(() => { navFeedback.hidden = true; }, 3800);
    });
  });

  initializeDateTime();
  refreshCategories();
  refreshPaymentMethods();
})();
