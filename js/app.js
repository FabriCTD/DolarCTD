/**
 * DólarCTD — Lógica compartida entre todos los países
 * Módulo global: window.DolarCTD
 */

(function(global) {
    'use strict';

    const DolarCTD = {};

    /* ── Configuración global ── */
    DolarCTD.VERSION      = '2.0.0';
    DolarCTD.REPO_URL     = 'https://github.com/FabriCTD';
    DolarCTD.DISCORD_URL  = 'https://discord.gg/JU236MYtRy';
    DolarCTD.UPDATE_MS    = 60000; // 1 minuto

    /* ── Utilidades de formato ── */
    DolarCTD.formato = {
        /**
         * Formatea un número como moneda
         * @param {number} valor
         * @param {string} simbolo - ej: '$', 'R$', 'Bs'
         * @param {number} decimales
         */
        moneda(valor, simbolo = '$', decimales = 2) {
            if (valor == null || isNaN(valor)) return `${simbolo}--`;
            return `${simbolo}${valor.toFixed(decimales).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
        },

        /**
         * Formatea un porcentaje
         */
        porcentaje(valor) {
            if (valor == null || isNaN(valor)) return '--';
            const signo = valor >= 0 ? '+' : '';
            return `${signo}${valor.toFixed(2)}%`;
        },

        /**
         * Formatea la hora actual
         */
        horaActual() {
            return new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    };

    /* ── Animación de número ── */
    DolarCTD.animarValor = function(elemento, inicio, fin, duracion = 500) {
        if (isNaN(inicio) || isNaN(fin) || inicio === fin) return;
        const simbolo = elemento.dataset.simbolo || '$';
        const decimales = parseInt(elemento.dataset.decimales || '2');
        const rango = fin - inicio;
        const incremento = rango / (duracion / 16);
        let actual = inicio;

        const timer = setInterval(() => {
            actual += incremento;
            const llegó = incremento > 0 ? actual >= fin : actual <= fin;
            if (llegó) {
                elemento.textContent = DolarCTD.formato.moneda(fin, simbolo, decimales);
                clearInterval(timer);
            } else {
                elemento.textContent = DolarCTD.formato.moneda(actual, simbolo, decimales);
            }
        }, 16);
    };

    /* ── Íconos por tipo de moneda ── */
    DolarCTD.icono = function(tipo) {
        const mapa = {
            USD: 'fa-dollar-sign',
            EUR: 'fa-euro-sign',
            BRL: 'fa-money-bill-wave',
            CLP: 'fa-coins',
            UYU: 'fa-coins',
            GBP: 'fa-sterling-sign',
            CHF: 'fa-landmark',
            PYG: 'fa-coins',
            XAU: 'fa-gem',
            ARS: 'fa-money-bill',
        };
        return mapa[tipo] || 'fa-money-bill';
    };

    /* ── Crear card de cotización ── */
    DolarCTD.crearCard = function(moneda, opciones = {}) {
        const {
            simbolo = '$',
            decimales = 2,
            colorTitulo = 'var(--primary-light)',
            mostrarCalcular = true
        } = opciones;

        const card = document.createElement('div');
        card.className = 'card';

        // Valores principales
        let valoresHtml = '<div class="card-values">';
        if (moneda.compra != null && !isNaN(moneda.compra)) {
            valoresHtml += `
                <div class="card-value">
                    <span>Compra</span>
                    <span class="buy-value" data-simbolo="${simbolo}" data-decimales="${decimales}">
                        ${DolarCTD.formato.moneda(moneda.compra, simbolo, decimales)}
                    </span>
                </div>`;
        }
        if (moneda.venta != null && !isNaN(moneda.venta)) {
            valoresHtml += `
                <div class="card-value">
                    <span>Venta</span>
                    <span class="sell-value" data-simbolo="${simbolo}" data-decimales="${decimales}">
                        ${DolarCTD.formato.moneda(moneda.venta, simbolo, decimales)}
                    </span>
                </div>`;
        }
        if (moneda.promedio != null && !isNaN(moneda.promedio) && moneda.promedio !== moneda.compra) {
            valoresHtml += `
                <div class="card-value">
                    <span>Promedio</span>
                    <span>${DolarCTD.formato.moneda(moneda.promedio, simbolo, decimales)}</span>
                </div>`;
        }
        if (moneda.spread != null && !isNaN(moneda.spread) && moneda.spread > 0) {
            valoresHtml += `
                <div class="card-spread">
                    <span>Spread</span>
                    <span>${DolarCTD.formato.moneda(moneda.spread, simbolo, decimales)}</span>
                </div>`;
        }
        if (moneda.ultimoCierre != null && !isNaN(moneda.ultimoCierre)) {
            valoresHtml += `
                <div class="card-value">
                    <span>Último cierre</span>
                    <span>${DolarCTD.formato.moneda(moneda.ultimoCierre, simbolo, decimales)}</span>
                </div>`;
        }
        valoresHtml += '</div>';

        // Variación / nota
        let extraHtml = '';
        if (moneda.nota) {
            extraHtml = `<div class="card-note"><i class="fas fa-info-circle"></i>${moneda.nota}</div>`;
        } else if (moneda.variacion != null && !isNaN(moneda.variacion)) {
            const cls = moneda.variacion >= 0 ? 'positive' : 'negative';
            extraHtml = `
                <div class="card-change">
                    <span>Variación</span>
                    <span class="${cls}">${DolarCTD.formato.porcentaje(moneda.variacion)}</span>
                </div>`;
        }

        // Botón calcular
        const btnHtml = mostrarCalcular
            ? `<button class="card-btn" data-moneda="${encodeURIComponent(JSON.stringify(moneda))}">
                   <i class="fas fa-calculator"></i> Calcular
               </button>`
            : '';

        card.innerHTML = `
            <h3 class="card-title" style="color:${colorTitulo}">
                <i class="fas ${moneda.icono || 'fa-dollar-sign'}"></i>
                ${moneda.nombre}
            </h3>
            ${valoresHtml}
            ${extraHtml}
            ${btnHtml}
        `;

        if (mostrarCalcular) {
            card.querySelector('.card-btn').addEventListener('click', () =>
                DolarCTD.abrirModal(moneda, simbolo, decimales)
            );
        }

        return card;
    };

    /* ── Modal de calculadora ── */
    DolarCTD.abrirModal = function(moneda, simbolo = '$', decimales = 2) {
        const modal = document.getElementById('calc-modal');
        if (!modal) return;

        // Títulos
        document.getElementById('modal-title').textContent = `Calculadora · ${moneda.nombre}`;
        document.getElementById('currency-name').textContent  = moneda.nombre;
        document.getElementById('currency-name-2').textContent = moneda.nombre;

        // Obtener el label de moneda local del modal
        const localLabel = document.querySelector('#local-currency-label');
        if (localLabel) {
            document.getElementById('local-label-1').textContent = localLabel.dataset.label || simbolo;
            document.getElementById('local-label-2').textContent = localLabel.dataset.label || simbolo;
        }

        const inputLocal  = document.getElementById('local-input');
        const inputForeign = document.getElementById('foreign-input');
        const resLocalToForeign  = document.getElementById('result-local-to-foreign').querySelector('.result-value');
        const resForeignToLocal  = document.getElementById('result-foreign-to-local').querySelector('.result-value');

        // Reset
        inputLocal.value = '';
        inputForeign.value = '';
        resLocalToForeign.textContent = '—';
        resForeignToLocal.textContent = '—';

        const tasaUsar = moneda.compra || moneda.promedio || 1;

        document.getElementById('btn-local-to-foreign').onclick = () => {
            const val = parseFloat(inputLocal.value) || 0;
            resLocalToForeign.textContent = (val / tasaUsar).toFixed(4) + ' ' + moneda.nombre;
        };

        document.getElementById('btn-foreign-to-local').onclick = () => {
            const val = parseFloat(inputForeign.value) || 0;
            resForeignToLocal.textContent = DolarCTD.formato.moneda(val * tasaUsar, simbolo, decimales);
        };

        // Calcular con Enter
        [inputLocal, inputForeign].forEach(inp => {
            inp.onkeydown = (e) => {
                if (e.key === 'Enter') {
                    if (inp === inputLocal) document.getElementById('btn-local-to-foreign').click();
                    else document.getElementById('btn-foreign-to-local').click();
                }
            };
        });

        modal.classList.add('open');
        inputLocal.focus();
    };

    /* ── Cerrar modal ── */
    DolarCTD.cerrarModal = function() {
        const modal = document.getElementById('calc-modal');
        if (modal) modal.classList.remove('open');
    };

    /* ── Inicializar modal ── */
    DolarCTD.inicializarModal = function() {
        const modal = document.getElementById('calc-modal');
        if (!modal) return;

        document.getElementById('modal-close-btn')?.addEventListener('click', DolarCTD.cerrarModal);
        document.getElementById('modal-close-footer-btn')?.addEventListener('click', DolarCTD.cerrarModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) DolarCTD.cerrarModal(); });
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') DolarCTD.cerrarModal(); });
    };

    /* ── Barra de actualización ── */
    DolarCTD.progressBar = {
        timer: null,
        progress: 0,

        iniciar(ms = 60000) {
            clearInterval(this.timer);
            this.progress = 0;
            const bar  = document.getElementById('update-bar');
            const texto = document.getElementById('update-text');
            if (!bar) return;

            if (texto) texto.textContent = `Actualización automática cada 1 minuto`;
            const paso = 100 / (ms / 100);

            this.timer = setInterval(() => {
                this.progress = Math.min(this.progress + paso, 100);
                bar.style.width = this.progress + '%';
            }, 100);
        },

        reiniciar(ms) { this.iniciar(ms); }
    };

    /* ── Calcular todos (barra de cálculo superior) ── */
    DolarCTD.calcularTodos = function(valor) {
        document.querySelectorAll('.card').forEach(card => {
            const btnData = card.querySelector('.card-btn');
            if (!btnData) return;
            try {
                const moneda = JSON.parse(decodeURIComponent(btnData.getAttribute('data-moneda')));
                const buyEl  = card.querySelector('.buy-value');
                const sellEl = card.querySelector('.sell-value');
                const simbolo   = buyEl?.dataset.simbolo  || '$';
                const decimales = parseInt(buyEl?.dataset.decimales || '2');

                if (buyEl && moneda.compra) {
                    const inicio = parseFloat(buyEl.textContent.replace(/[^0-9.,-]/g,'').replace(',','.')) || 0;
                    DolarCTD.animarValor(buyEl, inicio, moneda.compra * valor, 500);
                    buyEl.dataset.simbolo   = simbolo;
                    buyEl.dataset.decimales = decimales;
                }
                if (sellEl && moneda.venta) {
                    const inicio = parseFloat(sellEl.textContent.replace(/[^0-9.,-]/g,'').replace(',','.')) || 0;
                    DolarCTD.animarValor(sellEl, inicio, moneda.venta * valor, 500);
                    sellEl.dataset.simbolo   = simbolo;
                    sellEl.dataset.decimales = decimales;
                }
            } catch (_) {}
        });
    };

    /* ── Mostrar skeletons de carga ── */
    DolarCTD.mostrarSkeletons = function(containerId, cantidad = 4) {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        for (let i = 0; i < cantidad; i++) {
            container.innerHTML += `
                <div class="skeleton-card">
                    <div class="skeleton-line" style="height:18px;width:55%;margin-bottom:1.2rem;"></div>
                    <div class="skeleton-line" style="height:12px;width:100%;"></div>
                    <div class="skeleton-line" style="height:12px;width:100%;"></div>
                    <div class="skeleton-line" style="height:12px;width:75%;"></div>
                    <div class="skeleton-line" style="height:36px;width:100%;margin-top:0.5rem;border-radius:6px;"></div>
                </div>`;
        }
    };

    /* ── Mostrar error en contenedor ── */
    DolarCTD.mostrarError = function(containerId, mensaje = 'Error al cargar datos') {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = `
            <div class="cards-error">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${mensaje}</p>
                <p style="font-size:0.75rem;margin-top:0.5rem;color:var(--text-dim)">Verificá tu conexión y recargá la página</p>
            </div>`;
    };

    /* ── Dropdown de países (navegación interna) ── */
    DolarCTD.initCountryDropdown = function() {
        const btn  = document.querySelector('.country-dropdown-btn');
        const menu = document.querySelector('.country-dropdown-menu');
        if (!btn || !menu) return;

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            menu.classList.toggle('open');
        });

        document.addEventListener('click', () => menu.classList.remove('open'));
        menu.addEventListener('click', (e) => e.stopPropagation());
    };

    /* ── Footer Dinámico (Año actual) ── */
    const currentYear = new Date().getFullYear();
    if (currentYear > 2025) {
        document.querySelectorAll('.footer-bottom p').forEach(p => {
            if (p.innerHTML.includes('&copy; 2025')) {
                p.innerHTML = p.innerHTML.replace('&copy; 2025', `&copy; 2025-${currentYear}`);
            } else if (p.textContent.includes('© 2025')) {
                p.innerHTML = p.innerHTML.replace('© 2025', `© 2025-${currentYear}`);
            }
        });
    }

    /* Exponer en global */
    global.DolarCTD = DolarCTD;

})(window);
