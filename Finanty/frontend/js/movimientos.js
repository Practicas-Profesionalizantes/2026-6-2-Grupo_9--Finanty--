let categorias = [];
let medios = [];
let tiposMedio = [];
let movimientoEditando = null;
let movimientosActuales = [];
const money = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' });

document.addEventListener('DOMContentLoaded', async () => {
    document.getElementById('f_type').addEventListener('change', actualizarCategoriasFormulario);
    document.getElementById('f_date').value = new Date().toISOString().slice(0, 10);
    try {
        const [catData, medioData] = await Promise.all([
            apiRequest('api/categorias.php'), apiRequest('api/medios_pago.php')
        ]);
        categorias = catData.categorias || [];
        medios = medioData.medios || [];
        tiposMedio = medioData.tipos || [];
        llenarTiposMedio();
        document.getElementById('f_tipo_medio').addEventListener('change', actualizarMediosFormulario);
        llenarFiltro('filtro-categoria', categorias, 'id_categoria');
        llenarFiltro('filtro-medio', medios, 'id_medio');
        await cargarTablaMovimientos();
    } catch (error) { mostrarError(error.message); }
});

function escapar(texto) {
    return String(texto ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

function llenarFiltro(id, rows, key) {
    const select = document.getElementById(id);
    select.insertAdjacentHTML('beforeend', rows.map(row => `<option value="${Number(row[key])}">${escapar(row.nombre)}</option>`).join(''));
}

async function cargarTablaMovimientos() {
    try {
        const query = new URLSearchParams({
            cat: document.getElementById('filtro-categoria').value,
            medio: document.getElementById('filtro-medio').value,
            desde: document.getElementById('filtro-desde').value,
            hasta: document.getElementById('filtro-hasta').value
        });
        const data = await apiRequest(`api/movimientos.php?${query}`);
        const tbody = document.getElementById('tabla-movimientos-body');
        movimientosActuales = data.movimientos || [];
        if (!movimientosActuales.length) {
            tbody.innerHTML = '<tr><td colspan="7" class="empty-state">Todavía no hay movimientos para mostrar.</td></tr>';
            return;
        }
        tbody.innerHTML = movimientosActuales.map(m => `<tr>
            <td>${escapar(String(m.fecha).slice(0, 10))}</td>
            <td><span class="${m.tipo === 'ingreso' ? 'pos' : 'neg'}">${m.tipo === 'ingreso' ? 'Ingreso' : 'Gasto'}</span></td>
            <td>${escapar(m.comercio || '—')}</td>
            <td>${escapar(m.categoria_nombre || 'Sin categoría')}</td>
            <td>${escapar(m.medio_nombre || 'Sin medio')}</td>
            <td><strong>${money.format(Number(m.monto) || 0)}</strong></td>
            <td class="movement-actions"><button type="button" class="btn sm" data-edit="${Number(m.id_movimiento)}" aria-label="Editar movimiento">Editar</button>
            <button type="button" class="btn sm" data-delete="${Number(m.id_movimiento)}" aria-label="Eliminar movimiento">Eliminar</button></td>
        </tr>`).join('');
        tbody.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => editarMovimiento(Number(button.dataset.edit))));
        tbody.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => eliminarMovimiento(button.dataset.delete)));
    } catch (error) { mostrarError(error.message); }
}

function actualizarCategoriasFormulario() {
    const tipo = document.getElementById('f_type').value;
    const select = document.getElementById('f_category');
    const filtradas = categorias.filter(c => c.tipo === tipo);
    select.innerHTML = filtradas.map(c => `<option value="${Number(c.id_categoria)}">${escapar(c.nombre)}</option>`).join('');
    select.disabled = filtradas.length === 0;
}

function llenarTiposMedio(tipoSeleccionado = '') {
    const select = document.getElementById('f_tipo_medio');
    select.innerHTML = '<option value="">Seleccionar tipo</option>' + tiposMedio
        .map(t => `<option value="${Number(t.id_tipo_medio)}">${escapar(t.nombre)}</option>`).join('');
    if (tipoSeleccionado) select.value = String(tipoSeleccionado);
    actualizarMediosFormulario();
}

function actualizarMediosFormulario(medioSeleccionado = '') {
    const typeId = document.getElementById('f_tipo_medio').value;
    const select = document.getElementById('f_medio');

    const disponibles = medios.filter(m =>
        String(m.id_tipo_medio) === String(typeId)
    );

    const tipoActual = tiposMedio.find(t =>
        String(t.id_tipo_medio) === String(typeId)
    );

    const esEfectivo =
        tipoActual?.nombre?.trim().toLowerCase() === 'efectivo';

    select.innerHTML =
        '<option value="">Seleccionar medio</option>' +
        disponibles.map(m =>
            `<option value="${Number(m.id_medio)}">${escapar(m.nombre)}</option>`
        ).join('');

    select.disabled = !typeId || disponibles.length === 0;

    if (medioSeleccionado) {
        select.value = String(medioSeleccionado);
    } else if (esEfectivo) {
        const efectivo = disponibles.find(m =>
            m.nombre?.trim().toLowerCase() === 'efectivo'
        );

        if (efectivo) {
            select.value = String(efectivo.id_medio);
        }
    }

    if (esEfectivo && !select.value) {
        console.warn(
            'No se encontró Efectivo en los medios cargados.',
            { typeId, disponibles, medios }
        );
    }
}


function abrirModalNuevo() {
    movimientoEditando = null;
    document.getElementById('titulo-modal-movimiento').textContent = 'Nuevo movimiento';
    document.querySelector('#modal-movimiento form').reset();
    document.getElementById('f_date').value = new Date().toISOString().slice(0, 10);
    actualizarCategoriasFormulario();
    llenarTiposMedio();
    document.getElementById('modal-movimiento').style.display = 'flex';
}

function cerrarModal() { document.getElementById('modal-movimiento').style.display = 'none'; }

function editarMovimiento(id) {
    const movimiento = movimientosActuales.find(item => Number(item.id_movimiento) === id);
    if (!movimiento) return;
    movimientoEditando = id;
    document.getElementById('titulo-modal-movimiento').textContent = 'Editar movimiento';
    document.getElementById('f_type').value = movimiento.tipo;
    actualizarCategoriasFormulario();
    document.getElementById('f_category').value = movimiento.id_categoria;
    const medioActual = medios.find(m => Number(m.id_medio) === Number(movimiento.id_medio));
    llenarTiposMedio(medioActual?.id_tipo_medio || '');
    actualizarMediosFormulario(movimiento.id_medio);
    document.getElementById('f_amount').value = movimiento.monto;
    document.getElementById('f_date').value = String(movimiento.fecha).slice(0, 10);
    document.getElementById('f_merchant').value = movimiento.comercio || '';
    document.getElementById('modal-movimiento').style.display = 'flex';
}

async function guardarMovimiento(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = {
        tipo: document.getElementById('f_type').value,
        monto: document.getElementById('f_amount').value,
        id_categoria: document.getElementById('f_category').value,
        id_medio: document.getElementById('f_medio').value,
        comercio: document.getElementById('f_merchant').value.trim(),
        fecha: document.getElementById('f_date').value
    };
    if (!payload.id_categoria || !payload.id_medio) { alert('Primero agregá una categoría y un medio de pago en Configuración.'); return; }
    try {
        if (movimientoEditando) payload.id_movimiento = movimientoEditando;
        await apiRequest('api/movimientos.php', { method: movimientoEditando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        cerrarModal(); form.reset();
        document.getElementById('f_date').value = new Date().toISOString().slice(0, 10);
        await cargarTablaMovimientos();
    } catch (error) { alert(error.message); }
}

function limpiarFiltros() {
    ['filtro-desde', 'filtro-hasta', 'filtro-categoria', 'filtro-medio'].forEach(id => { document.getElementById(id).value = ''; });
    cargarTablaMovimientos();
}

async function eliminarMovimiento(id) {
    if (!confirm('¿Querés eliminar este movimiento?')) return;
    try {
        await apiRequest('api/movimientos.php', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id_movimiento: Number(id) }) });
        await cargarTablaMovimientos();
    } catch (error) { alert(error.message); }
}

function mostrarError(message) {
    document.getElementById('tabla-movimientos-body').innerHTML = `<tr><td colspan="7" class="empty-state">${escapar(message)}</td></tr>`;
}
