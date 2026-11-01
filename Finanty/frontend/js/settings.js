// frontend/js/settings.js
document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem('finanty_user');
    if (!user) { window.location.href = 'login.html'; return; }
    
    const userData = JSON.parse(user);
    const selectTema = document.getElementById('tema-selector');
    if (selectTema) {
        selectTema.value = userData.tema || 'automatico';
        document.documentElement.setAttribute('data-theme', selectTema.value);
        document.querySelectorAll('input[name="tema-card"]').forEach(radio => {
            radio.checked = radio.value === selectTema.value;
            radio.addEventListener('change', () => {
                if (!radio.checked) return;
                selectTema.value = radio.value;
                selectTema.dispatchEvent(new Event('change', { bubbles: true }));
            });
        });
    }

    cargarCategoriasConfig();
    cargarMediosConfig();
    
    document.getElementById('tema-selector').addEventListener('change', async (e) => {
        const tema = e.target.value;
        document.documentElement.setAttribute('data-theme', tema);
        document.querySelectorAll('input[name="tema-card"]').forEach(radio => { radio.checked = radio.value === tema; });
        try {
        const res = await fetch('../../backend/api/settings.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tema })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            document.documentElement.setAttribute('data-theme', tema);
            userData.tema = tema;
            localStorage.setItem('finanty_user', JSON.stringify(userData));
        }
        } catch (error) {
            alert('No se pudo guardar la preferencia de tema. Se aplicó solo en esta pantalla.');
        }
    });
});

async function cargarCategoriasConfig() {
    const res = await fetch('../../backend/api/categorias.php');
    const data = await res.json();
    const lista = document.getElementById('lista-categorias');
    if(lista) {
        lista.innerHTML = data.categorias.map(c => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid var(--bd)">
                <span>${c.nombre} <b style="font-size:11px; text-transform:uppercase;">(${c.tipo})</b></span>
                <button class="btn sm" onclick="borrarCategoria(${c.id_categoria})">🗑️</button>
            </div>
        `).join('');
    }
}

async function agregarCategoria(e) {
    e.preventDefault();
    const nombre = document.getElementById('cat-nombre').value;
    const tipo = document.getElementById('cat-tipo').value;
    
    await fetch('../../backend/api/categorias.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, tipo })
    });
    document.getElementById('cat-nombre').value = '';
    cargarCategoriasConfig();
}

async function borrarCategoria(id) {
    await fetch('../../backend/api/categorias.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_categoria: id })
    });
    cargarCategoriasConfig();
}

async function cargarMediosConfig() {
    const res = await fetch('../../backend/api/medios_pago.php');
    const data = await res.json();
    
    const selectTipo = document.getElementById('medio-tipo');
    if (selectTipo && data.tipos) {
        selectTipo.innerHTML = data.tipos.map(t => `<option value="${t.id_tipo_medio}">${t.nombre}</option>`).join('');
    }

    const lista = document.getElementById('lista-medios');
    if (lista && data.medios) {
        lista.innerHTML = data.medios.map(m => `
            <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid var(--bd)">
                <span><b>${m.nombre}</b> <small style="color:var(--mu)">(${m.tipo_nombre || 'General'})</small></span>
                <button class="btn sm" onclick="borrarMedio(${m.id_medio})">🗑️</button>
            </div>
        `).join('');
    }
}

async function agregarMedio(e) {
    e.preventDefault();
    const nombre = document.getElementById('medio-nombre').value;
    const id_tipo_medio = document.getElementById('medio-tipo').value;

    await fetch('../../backend/api/medios_pago.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, id_tipo_medio })
    });
    document.getElementById('medio-nombre').value = '';
    cargarMediosConfig();
}

async function borrarMedio(id) {
    await fetch('../../backend/api/medios_pago.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_medio: id })
    });
    cargarMediosConfig();
}
