// frontend/js/dashboard.js
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem('finanty_user');
    if (!user) { window.location.href = 'login.html'; return; }
    
    const userData = JSON.parse(user);
    document.documentElement.setAttribute('data-theme', userData.tema || 'automatico');

    cargarResumenDashboard();
});

async function cargarResumenDashboard() {
    try {
        const res = await fetch('../../backend/api/movimientos.php');
        if (res.status === 401) { window.location.href = 'login.html'; return; }
        const data = await res.json();
        
        if (data.status === 'ok') {
            document.getElementById('kpi-ingresos').textContent = `$ ${parseFloat(data.resumen.ingresos).toFixed(2)}`;
            document.getElementById('kpi-gastos').textContent = `$ ${parseFloat(data.resumen.gastos).toFixed(2)}`;
            
            const balanceEl = document.getElementById('kpi-balance');
            balanceEl.textContent = `$ ${parseFloat(data.resumen.balance).toFixed(2)}`;
            balanceEl.className = `kv ${data.resumen.balance >= 0 ? 'pos' : 'neg'}`;

            renderizarGraficoComparativo(data.resumen.ingresos, data.resumen.gastos);
            renderizarGraficoCategorias(data.movimientos);
        }
    } catch (e) {
        console.error("Error al cargar estadísticas", e);
    }
}

function renderizarGraficoComparativo(ingresos, gastos) {
    const el = document.getElementById('chartIG');
    const values = [{ label: 'Ingresos', value: Number(ingresos) || 0, cls: 'income' }, { label: 'Gastos', value: Number(gastos) || 0, cls: 'expense' }];
    const max = Math.max(...values.map(item => item.value), 1);
    el.innerHTML = values.map(item => `<div class="chart-row"><div class="chart-label"><span>${item.label}</span><strong>$ ${item.value.toFixed(2)}</strong></div><div class="chart-track"><span class="chart-fill ${item.cls}" style="width:${Math.max(item.value / max * 100, item.value ? 3 : 0)}%"></span></div></div>`).join('');
}

function renderizarGraficoCategorias(movimientos) {
    const gastos = movimientos.filter(m => m.tipo === 'gasto');
    const totalesPorCat = {};
    
    gastos.forEach(g => {
        totalesPorCat[g.categoria_nombre || 'Otros'] = (totalesPorCat[g.categoria_nombre || 'Otros'] || 0) + parseFloat(g.monto);
    });

    const el = document.getElementById('chartCat');
    const entries = Object.entries(totalesPorCat).sort((a, b) => b[1] - a[1]);
    if (!entries.length) { el.innerHTML = '<p class="empty-state">Todavía no hay gastos registrados.</p>'; return; }
    const max = Math.max(...entries.map(([, value]) => value), 1);
    el.innerHTML = entries.map(([label, value]) => `<div class="chart-row"><div class="chart-label"><span>${label}</span><strong>$ ${value.toFixed(2)}</strong></div><div class="chart-track"><span class="chart-fill category" style="width:${Math.max(value / max * 100, 3)}%"></span></div></div>`).join('');
}
