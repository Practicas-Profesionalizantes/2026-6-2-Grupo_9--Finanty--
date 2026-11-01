const API = '../../backend';

async function apiRequest(path, options = {}) {
    let response;
    try {
        response = await fetch(`${API}/${path}`, { credentials: 'same-origin', ...options });
    } catch {
        throw new Error('No se pudo llegar al servidor de Finanty. Iniciá la aplicación desde ABRIR_FINANTY y comprobá que MySQL esté encendido.');
    }
    let data;
    try { data = await response.json(); }
    catch { throw new Error('El servidor no devolvió una respuesta válida. Revisá que XAMPP esté iniciado.'); }
    if (response.status === 401) {
        localStorage.removeItem('finanty_user');
        if (!location.pathname.endsWith('login.html')) location.href = 'login.html';
        throw new Error(data.mensaje || 'La sesión venció. Volvé a iniciar sesión.');
    }
    if (!response.ok || data.status !== 'ok') throw new Error(data.mensaje || 'No se pudo completar la operación.');
    return data;
}

const Auth = {
    async login(email, password) {
        try {
            const data = await apiRequest('auth/login.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password })
            });
            localStorage.setItem('finanty_user', JSON.stringify(data.usuario));
            location.href = 'dashboard.html';
        } catch (error) { alert(error.message); }
    },
    async register(nombre, email, password) {
        try {
            const data = await apiRequest('auth/register.php', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombre.trim(), email: email.trim(), password })
            });
            alert(data.mensaje || 'Cuenta creada. Ya podés iniciar sesión.');
            location.href = 'login.html';
        } catch (error) { alert(error.message); }
    },
    async logout() {
        try { await fetch(`${API}/auth/logout.php`, { method: 'POST' }); }
        finally { localStorage.removeItem('finanty_user'); location.href = 'login.html'; }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const page = location.pathname.split('/').pop();
    const protectedPages = ['dashboard.html', 'movimientos.html', 'settings.html'];
    const savedUser = localStorage.getItem('finanty_user');
    if (protectedPages.includes(page) && !savedUser) { location.replace('login.html'); return; }
    if (savedUser) {
        try { document.documentElement.dataset.theme = JSON.parse(savedUser).tema || 'automatico'; }
        catch { localStorage.removeItem('finanty_user'); }
    }
});
