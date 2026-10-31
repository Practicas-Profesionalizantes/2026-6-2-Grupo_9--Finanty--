// frontend/js/auth.js
const Auth = {
    async login(email, password) {
        try {
        const res = await fetch('../../backend/auth/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (data.status === 'ok') {
            localStorage.setItem('finanty_user', JSON.stringify(data.usuario));
            window.location.href = 'dashboard.html';
        } else {
            alert(data.mensaje || 'No se pudo iniciar sesión.');
        }
        } catch (error) { alert('No se pudo conectar con Finanty. Abrí la aplicación desde un servidor PHP.'); }
    },

    async register(nombre, email, password) {
        try {
        const res = await fetch('../../backend/auth/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await res.json();
        alert(data.mensaje || 'No se pudo completar el registro.');
        if (data.status === 'ok') {
            window.location.href = 'login.html';
        }
        } catch (error) { alert('No se pudo conectar con Finanty. Abrí la aplicación desde un servidor PHP.'); }
    },

    async logout() {
        try { await fetch('../../backend/auth/logout.php'); }
        finally { localStorage.removeItem('finanty_user'); window.location.href = 'login.html'; }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const user = localStorage.getItem('finanty_user');
    const page = location.pathname.split('/').pop();
    if (['dashboard.html', 'movimientos.html', 'settings.html'].includes(page) && !user) location.href = 'login.html';
    if (user) {
        try { document.documentElement.dataset.theme = JSON.parse(user).tema || 'automatico'; }
        catch { localStorage.removeItem('finanty_user'); }
    }
});
