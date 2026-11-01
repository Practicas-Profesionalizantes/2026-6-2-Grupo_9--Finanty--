const ars = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });
const coloresGrafico = ['#287451', '#d0a65a', '#527f67', '#95b59d', '#9a7650', '#739b86', '#b7cbb9', '#6e7e70'];

document.addEventListener('DOMContentLoaded', () => {
    try {
        const user = JSON.parse(localStorage.getItem('finanty_user') || '{}');
        document.getElementById('user-name').textContent = (user.nombre || 'bienvenida').split(' ')[0];
    } catch { document.getElementById('user-name').textContent = 'bienvenida'; }
    cargarResumenDashboard();
});

async function cargarResumenDashboard() {
    try {
        const data = await apiRequest('api/movimientos.php');
        const ingresos = Number(data.resumen.ingresos) || 0;
        const gastos = Number(data.resumen.gastos) || 0;
        const balance = Number(data.resumen.balance) || 0;
        document.getElementById('kpi-ingresos').textContent = ars.format(ingresos);
        document.getElementById('kpi-gastos').textContent = ars.format(gastos);
        const balanceEl = document.getElementById('kpi-balance');
        balanceEl.textContent = ars.format(balance);
        balanceEl.className = `kv ${balance >= 0 ? 'pos' : 'neg'}`;
        renderizarGraficoComparativo(ingresos, gastos, balance);
        renderizarGraficoCategorias(data.movimientos || []);
        renderizarRecientes(data.movimientos || []);
    } catch (error) {
        const message = escaparDashboard(error.message || 'No se pudieron cargar los datos.');
        document.getElementById('chartIG').innerHTML = `<p class="empty-state">${message}</p>`;
        document.getElementById('chartCat').innerHTML = '<p class="empty-state">Revisá la conexión con el servidor y volvé a cargar el panel.</p>';
        document.getElementById('recent-list').innerHTML = '<li class="empty-state">No pudimos cargar la actividad.</li>';
    }
}

function renderizarRecientes(movimientos) {
    const list = document.getElementById('recent-list');
    const recent = movimientos.slice(0, 5);
    if (!recent.length) {
        list.innerHTML = '<li class="empty-state">Todavía no hay movimientos. Usá “Registrar movimiento” para cargar el primero.</li>';
        return;
    }
    list.innerHTML = recent.map(m => {
        const income = m.tipo === 'ingreso';
        const amount = ars.format(Number(m.monto) || 0);
        const date = new Date(String(m.fecha).replace(' ', 'T')).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
        return `<li class="recent-item"><span class="recent-icon ${income ? 'income' : 'expense'}" aria-hidden="true">${income ? '+' : '−'}</span>
            <span class="recent-detail"><strong>${escaparDashboard(m.comercio || m.categoria_nombre || (income ? 'Ingreso' : 'Gasto'))}</strong>
            <small>${escaparDashboard(m.categoria_nombre || (income ? 'Ingreso' : 'Gasto'))} · ${date}</small></span>
            <span class="recent-amount ${income ? 'income' : 'expense'}">${income ? '+' : '−'}${amount}</span></li>`;
    }).join('');
}

function escaparDashboard(value) {
    return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function armarDona(items, centroTitulo, centroValor, ariaLabel) {
    const total = items.reduce((sum, item) => sum + item.value, 0);
    if (!total) return '<p class="empty-state">Todavía no hay datos para mostrar.</p>';
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const segments = items.map((item, index) => {
        const length = Math.max(0, item.value / total * circumference);
        const circle = `<circle cx="80" cy="80" r="${radius}" fill="none" stroke="${coloresGrafico[index % coloresGrafico.length]}" stroke-width="19" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" />`;
        offset += length;
        return circle;
    }).join('');
    const legend = items.map((item, index) => `
        <li class="donut-legend-item"><span class="donut-swatch" style="--swatch:${coloresGrafico[index % coloresGrafico.length]}"></span>
        <span class="donut-legend-name" title="${escaparDashboard(item.label)}">${escaparDashboard(item.label)}</span>
        <strong>${ars.format(item.value)}</strong></li>`).join('');
    return `<div class="donut-layout"><div class="donut-visual"><svg class="donut-svg" viewBox="0 0 160 160" role="img" aria-label="${escaparDashboard(ariaLabel)}">${segments}</svg>
        <div class="donut-center"><span>${escaparDashboard(centroTitulo)}</span><strong>${escaparDashboard(centroValor)}</strong></div></div>
        <ul class="donut-legend">${legend}</ul></div>`;
}

function renderizarGraficoComparativo(ingresos, gastos, balance) {
    const target = document.getElementById('chartIG');
    target.className = 'chart-area';
    target.innerHTML = armarDona([
        { label: 'Ingresos', value: ingresos },
        { label: 'Gastos', value: gastos }
    ], 'Balance neto', ars.format(balance), 'Gráfico circular de ingresos y gastos');
}

function renderizarGraficoCategorias(movimientos) {
    const totals = new Map();
    movimientos.filter(m => m.tipo === 'gasto').forEach(m => {
        const name = m.categoria_nombre || 'Otros';
        totals.set(name, (totals.get(name) || 0) + (Number(m.monto) || 0));
    });
    const rows = [...totals.entries()].sort((a, b) => b[1] - a[1]).map(([label, value]) => ({ label, value }));
    const target = document.getElementById('chartCat');
    target.className = 'chart-area';
    const total = rows.reduce((sum, row) => sum + row.value, 0);
    target.innerHTML = rows.length
        ? armarDona(rows, 'Total gastado', ars.format(total), 'Gráfico circular de gastos por categoría')
        : '<p class="empty-state">Todavía no hay gastos registrados.</p>';
}
