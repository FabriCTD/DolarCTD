/**
 * DólarCTD — Script de Brasil (BRL)
 * API: https://br.dolarapi.com/v1/cotacoes
 */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    DolarCTD.inicializarModal();
    DolarCTD.initCountryDropdown();

    const SIMBOLO   = 'R$';
    const DECIMALES = 4; // Reales tienen más decimales relevantes
    const API_URL   = 'https://br.dolarapi.com/v1/cotacoes';
    const UPDATE_MS = DolarCTD.UPDATE_MS;

    const ICONOS_MONEDA = {
        USD: 'fa-dollar-sign', EUR: 'fa-euro-sign', ARS: 'fa-money-bill',
        CLP: 'fa-coins', UYU: 'fa-coins', GBP: 'fa-sterling-sign',
        JPY: 'fa-yen-sign', CHF: 'fa-landmark',
    };

    async function fetchCotizaciones() {
        DolarCTD.mostrarSkeletons('general-cards', 5);
        try {
            const res = await fetch(API_URL, { cache: 'no-store' });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const datos = await res.json();

            // La API de Brasil usa 'compra', 'venda', 'nome', 'moeda'
            const monedas = datos.map(d => {
                const compra = parseFloat(d.compra) || null;
                const venta  = parseFloat(d.venda)  || null;
                const spread = (compra && venta) ? parseFloat((venta - compra).toFixed(4)) : null;
                const moeda  = (d.moeda || '').toUpperCase();
                return {
                    nombre:   d.nome || moeda,
                    icono:    ICONOS_MONEDA[moeda] || 'fa-money-bill',
                    compra,
                    venta,
                    spread:   spread > 0 ? spread : null,
                    variacion: null
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
            if (updateText) updateText.textContent = `Última atualização: ${DolarCTD.formato.horaActual()} · Próxima em 1 minuto`;
            DolarCTD.progressBar.reiniciar(UPDATE_MS);

        } catch (err) {
            console.error('[DólarCTD BR] Erro:', err);
            DolarCTD.mostrarError('general-cards', 'Erro ao carregar cotações do Brasil');
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
