// Script del root — sin lógica especial, app.js ya está cargado
document.addEventListener('DOMContentLoaded', () => {
    // Resaltar país activo si se volvió desde una subpágina
    const params = new URLSearchParams(window.location.search);
    const pais = params.get('pais');
    if (pais) {
        const card = document.getElementById(`card-${pais}`);
        if (card) {
            card.style.borderColor = 'var(--primary)';
            card.style.boxShadow = 'var(--shadow-glow)';
        }
    }
});