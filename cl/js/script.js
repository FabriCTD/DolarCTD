/**
 * DólarCTD — Script de Chile (CLP)
 * API: https://cl.dolarapi.com/v1/cotizaciones
 */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    DolarCTD.inicializarModal();
    DolarCTD.initCountryDropdown();

    const SIMBOLO   = '$';
    const DECIMALES = 2;
    const API_URL   = 'https://cl.dolarapi.com/v1/cotizaciones';
    const UPDATE_MS = DolarCTD.UPDATE_MS;

    const ICONOS_MONEDA = {
        USD: 'fa-dollar-sign',
        EUR: 'fa-euro-sign',
        ARS: 'fa-money-bill',
        BRL: 'fa-money-bill-wave',
        UYU: 'fa-coins',
        GBP: 'fa-sterling-sign',
        CHF: 'fa-landmark',
        JPY: 'fa-yen-sign',
    };

    async function fetchCotizaciones() {
        DolarCTD.mostrarSkeletons('general-cards', 6);

        try {
            const res = await fetch(API_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const datos = await res.json();

            const monedas = datos.map(d => {
                const compra  = parseFloat(d.compra)  || 0;
                const venta   = parseFloat(d.venta)   || 0;
                const promedio = (compra && venta) ? parseFloat(((compra + venta) / 2).toFixed(2)) : (compra || venta);
                const spread  = parseFloat((venta - compra).toFixed(2));
                const ultimoCierre = d.ultimoCierre ? parseFloat(d.ultimoCierre) : null;
                const moneda  = (d.moneda || '').toUpperCase();

                return {
                    nombre:      d.nombre || moneda,
                    icono:       ICONOS_MONEDA[moneda] || 'fa-money-bill',
                    compra:      compra   || null,
                    venta:       venta    || null,
                    promedio:    promedio || null,
                    spread:      spread > 0 ? spread : null,
                    ultimoCierre,
                    variacion:   null
                };
            });

            const container = document.getElementById('general-cards');
            container.innerHTML = '';
            monedas.forEach((m, i) => {
                const card = DolarCTD.crearCard(m, { simbolo: SIMBOLO, decimales: DECIMALES });
                card.style.animationDelay = (i * 0.07) + 's';
                container.appendChild(card);
            });

            const updateText = document.getElementById('update-text');
            if (updateText) updateText.textContent = `Última actualización: ${DolarCTD.formato.horaActual()} · Próxima en 1 minuto`;

            DolarCTD.progressBar.reiniciar(UPDATE_MS);

        } catch (err) {
            console.error('[DólarCTD CL] Error:', err);
            DolarCTD.mostrarError('general-cards', 'Error al cargar cotizaciones de Chile');
        }
    }

    document.getElementById('calculate-all-btn')?.addEventListener('click', () => {
        const valor = parseFloat(document.getElementById('currency-input')?.value) || 1;
        DolarCTD.calcularTodos(valor);
    });

    document.getElementById('currency-input')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') document.getElementById('calculate-all-btn')?.click();
    });

    DolarCTD.progressBar.iniciar(UPDATE_MS);
    fetchCotizaciones();
    setInterval(fetchCotizaciones, UPDATE_MS);
});
