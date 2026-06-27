/**
 * DólarCTD — Script de Venezuela (VES)
 * API: https://ve.dolarapi.com/v1/dolares
 */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    DolarCTD.inicializarModal();
    DolarCTD.initCountryDropdown();

    const SIMBOLO   = 'Bs';
    const DECIMALES = 2;
    const API_URL   = 'https://ve.dolarapi.com/v1/dolares';
    const UPDATE_MS = DolarCTD.UPDATE_MS;

    const ICONOS_FUENTE = {
        oficial:  'fa-landmark',
        paralelo: 'fa-dollar-sign',
        bitcoin:  'fa-bitcoin-sign',
        criptodivisa: 'fa-bitcoin-sign',
        permuta:  'fa-arrow-right-arrow-left',
    };

    const NOMBRES_FUENTE = {
        oficial:  'Dólar Oficial (BCV)',
        paralelo: 'Dólar Paralelo',
        bitcoin:  'Dólar Cripto / Bitcoin',
        criptodivisa: 'Dólar Criptodivisa',
        permuta:  'Dólar Permuta',
    };

    async function fetchCotizaciones() {
        DolarCTD.mostrarSkeletons('general-cards', 3);
        try {
            const res = await fetch(API_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const datos = await res.json();

            // La API de VE devuelve: nombre, promedio, fuente
            const monedas = datos.map(d => {
                const promedio = parseFloat(d.promedio) || null;
                const fuente   = (d.fuente || '').toLowerCase();
                return {
                    nombre:   NOMBRES_FUENTE[fuente] || d.nombre || 'Dólar',
                    icono:    ICONOS_FUENTE[fuente]   || 'fa-dollar-sign',
                    compra:   promedio,
                    venta:    null,
                    nota:     promedio ? `Promedio: ${DolarCTD.formato.moneda(promedio, SIMBOLO, DECIMALES)}` : null,
                    variacion: null
                };
            });

            const container = document.getElementById('general-cards');
            container.innerHTML = '';
            monedas.forEach((m, i) => {
                const card = DolarCTD.crearCard(m, { simbolo: SIMBOLO, decimales: DECIMALES });
                card.style.animationDelay = (i * 0.1) + 's';
                container.appendChild(card);
            });

            const updateText = document.getElementById('update-text');
            if (updateText) updateText.textContent = `Última actualización: ${DolarCTD.formato.horaActual()} · Próxima en 1 minuto`;
            DolarCTD.progressBar.reiniciar(UPDATE_MS);

        } catch (err) {
            console.error('[DólarCTD VE] Error:', err);
            DolarCTD.mostrarError('general-cards', 'Error al cargar cotizaciones de Venezuela');
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
