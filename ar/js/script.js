/**
 * DólarCTD — Script de Argentina (ARS)
 * Usa DolarAPI: https://dolarapi.com/docs/argentina/
 */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    /* ── Inicializar componentes compartidos ── */
    DolarCTD.inicializarModal();
    DolarCTD.initCountryDropdown();

    /* ── Configuración ── */
    const SIMBOLO    = '$';
    const DECIMALES  = 2;
    const UPDATE_MS  = DolarCTD.UPDATE_MS;

    /* ── Mapeo de nombres de dólar ── */
    const NOMBRES_DOLAR = {
        oficial:          'Dólar Oficial',
        blue:             'Dólar Blue',
        bolsa:            'Dólar MEP (Bolsa)',
        contadoconliqui:  'Dólar CCL',
        cripto:           'Dólar Cripto',
        mayorista:        'Dólar Mayorista',
        tarjeta:          'Dólar Tarjeta',
        solidario:        'Dólar Solidario',
        turista:          'Dólar Turista',
        qatar:            'Dólar Qatar',
        ahorro:           'Dólar Ahorro',
    };

    /* ── Mapeo de íconos por tipo de dólar ── */
    const ICONOS_DOLAR = {
        oficial:         'fa-landmark',
        blue:            'fa-dollar-sign',
        bolsa:           'fa-chart-line',
        contadoconliqui: 'fa-arrow-right-arrow-left',
        cripto:          'fa-bitcoin-sign',
        mayorista:       'fa-building-columns',
        tarjeta:         'fa-credit-card',
        solidario:       'fa-hand-holding-heart',
        turista:         'fa-plane',
        qatar:           'fa-futbol',
        ahorro:          'fa-piggy-bank',
    };

    /* ── Mapeo de nombres de otras monedas ── */
    const NOMBRES_MONEDAS = {
        USD: 'Dólar Estadounidense',
        EUR: 'Euro',
        BRL: 'Real Brasileño',
        CLP: 'Peso Chileno',
        UYU: 'Peso Uruguayo',
        GBP: 'Libra Esterlina',
        CHF: 'Franco Suizo',
        JPY: 'Yen Japonés',
    };

    /* ── Datos de cotizaciones ── */
    const cotizaciones = {
        steam:   [],
        general: [],
        otras:   []
    };

    /* ── Normalizar casa → clave limpia ── */
    function normalizarCasa(casa) {
        return (casa || '').toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /* ── Fetch principal ── */
    async function fetchCotizaciones() {
        // Mostrar skeletons
        DolarCTD.mostrarSkeletons('steam-cards', 2);
        DolarCTD.mostrarSkeletons('general-cards', 6);
        DolarCTD.mostrarSkeletons('euro-cards', 4);

        try {
            // Fetch paralelo de las 2 APIs principales
            const [resDolares, resCotizaciones] = await Promise.allSettled([
                fetch('https://dolarapi.com/v1/dolares', { cache: 'no-store' }),
                fetch('https://dolarapi.com/v1/cotizaciones', { cache: 'no-store' })
            ]);

            /* ── Processar dólares ── */
            if (resDolares.status === 'fulfilled' && resDolares.value.ok) {
                const dolares = await resDolares.value.json();

                // Dólar oficial para calcular Steam
                const oficial = dolares.find(d => normalizarCasa(d.casa) === 'oficial');
                const ventaOficial = oficial ? parseFloat(oficial.venta) : null;

                // Dólar Steam y Netflix (basado en el oficial)
                if (ventaOficial) {
                    cotizaciones.steam = [
                        {
                            nombre:  'Dólar Steam',
                            icono:   'fa-gamepad',
                            compra:  parseFloat((ventaOficial * 1.21).toFixed(2)),
                            venta:   null,
                            nota:    'Oficial + IVA 21% (servicios digitales básicos)'
                        },
                        {
                            nombre:  'Dólar Netflix / Streaming',
                            icono:   'fa-play-circle',
                            compra:  parseFloat((ventaOficial * 1.51).toFixed(2)),
                            venta:   null,
                            nota:    'Oficial + IVA 21% + Percepción AFIP 30%'
                        },
                        {
                            nombre:  'Dólar Ahorro / Turista',
                            icono:   'fa-suitcase',
                            compra:  parseFloat((ventaOficial * 1.60).toFixed(2)),
                            venta:   null,
                            nota:    'Oficial + impuestos para compras en el exterior (estimado)'
                        }
                    ];
                }

                // Todos los tipos de dólar
                cotizaciones.general = dolares.map(d => {
                    const clave  = normalizarCasa(d.casa);
                    const compra = parseFloat(d.compra) || null;
                    const venta  = parseFloat(d.venta)  || null;
                    const spread = (compra && venta) ? parseFloat((venta - compra).toFixed(2)) : null;
                    const variacion = (compra && venta)
                        ? parseFloat(((venta - compra) / compra * 100).toFixed(2))
                        : null;

                    return {
                        nombre:    NOMBRES_DOLAR[clave] || d.nombre || (d.casa.charAt(0).toUpperCase() + d.casa.slice(1)),
                        icono:     ICONOS_DOLAR[clave]  || 'fa-dollar-sign',
                        compra,
                        venta,
                        spread,
                        variacion,
                        fechaActualizacion: d.fechaActualizacion || null
                    };
                });

                // Ordenar: oficial primero, luego blue
                cotizaciones.general.sort((a, b) => {
                    const orden = ['Dólar Oficial', 'Dólar Blue', 'Dólar MEP (Bolsa)', 'Dólar CCL'];
                    const ia = orden.indexOf(a.nombre);
                    const ib = orden.indexOf(b.nombre);
                    if (ia !== -1 && ib !== -1) return ia - ib;
                    if (ia !== -1) return -1;
                    if (ib !== -1) return 1;
                    return a.nombre.localeCompare(b.nombre);
                });

            } else {
                DolarCTD.mostrarError('general-cards', 'No se pudieron cargar los tipos de dólar');
            }

            /* ── Procesar otras monedas ── */
            if (resCotizaciones.status === 'fulfilled' && resCotizaciones.value.ok) {
                const monedas = await resCotizaciones.value.json();
                cotizaciones.otras = monedas.map(d => {
                    const compra = parseFloat(d.compra) || null;
                    const venta  = parseFloat(d.venta)  || null;
                    const spread = (compra && venta) ? parseFloat((venta - compra).toFixed(2)) : null;
                    const moneda = (d.moneda || '').toUpperCase();
                    const casa   = normalizarCasa(d.casa);

                    // Determinar nombre
                    let nombre = NOMBRES_MONEDAS[moneda] || d.nombre || `${casa} (${moneda})`;

                    // Ícono según moneda
                    const iconoMap = { EUR: 'fa-euro-sign', BRL: 'fa-money-bill-wave', CLP: 'fa-coins', GBP: 'fa-sterling-sign', JPY: 'fa-yen-sign', CHF: 'fa-landmark', UYU: 'fa-coins' };

                    return {
                        nombre,
                        icono:    iconoMap[moneda] || 'fa-money-bill',
                        compra,
                        venta,
                        spread,
                        variacion: null
                    };
                });
            } else {
                DolarCTD.mostrarError('euro-cards', 'No se pudieron cargar las otras monedas');
            }

            renderizarTodo();
            DolarCTD.progressBar.reiniciar(UPDATE_MS);

        } catch (err) {
            console.error('[DólarCTD AR] Error al cargar cotizaciones:', err);
            DolarCTD.mostrarError('general-cards', 'Error de conexión. Reintentando en 1 minuto...');
        }
    }

    /* ── Renderizar todas las cards ── */
    function renderizarTodo() {
        const steamCont   = document.getElementById('steam-cards');
        const generalCont = document.getElementById('general-cards');
        const otrasCont   = document.getElementById('euro-cards');

        steamCont.innerHTML   = '';
        generalCont.innerHTML = '';
        otrasCont.innerHTML   = '';

        cotizaciones.steam.forEach((m, i) => {
            const card = DolarCTD.crearCard(m, { simbolo: SIMBOLO, decimales: DECIMALES, colorTitulo: 'var(--steam-color)' });
            card.style.animationDelay = (i * 0.08) + 's';
            steamCont.appendChild(card);
        });

        cotizaciones.general.forEach((m, i) => {
            const card = DolarCTD.crearCard(m, { simbolo: SIMBOLO, decimales: DECIMALES });
            card.style.animationDelay = (i * 0.06) + 's';
            generalCont.appendChild(card);
        });

        cotizaciones.otras.forEach((m, i) => {
            const card = DolarCTD.crearCard(m, { simbolo: SIMBOLO, decimales: DECIMALES, colorTitulo: 'var(--positive)' });
            card.style.animationDelay = (i * 0.06) + 's';
            otrasCont.appendChild(card);
        });

        // Actualizar texto de estado
        const updateText = document.getElementById('update-text');
        if (updateText) updateText.textContent = `Última actualización: ${DolarCTD.formato.horaActual()} · Próxima en 1 minuto`;
    }

    /* ── Calcular todos ── */
    document.getElementById('calculate-all-btn')?.addEventListener('click', () => {
        const valor = parseFloat(document.getElementById('currency-input')?.value) || 1;
        DolarCTD.calcularTodos(valor);
    });

    document.getElementById('currency-input')?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('calculate-all-btn')?.click();
    });

    /* ── Iniciar y programar actualización ── */
    DolarCTD.progressBar.iniciar(UPDATE_MS);
    fetchCotizaciones();
    setInterval(fetchCotizaciones, UPDATE_MS);
});
