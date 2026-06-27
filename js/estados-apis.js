/**
 * DólarCTD — Estado de APIs (movido a js/)
 * Monitorea todos los endpoints de DolarAPI en tiempo real
 */
document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    const APIS = [
        {
            nombre:   'Argentina',
            pais:     'ar',
            bandera:  'https://flagcdn.com/w160/ar.png',
            endpoints: [
                { url: 'https://dolarapi.com/v1/dolares',     etiqueta: 'Tipos de dólar' },
                { url: 'https://dolarapi.com/v1/cotizaciones', etiqueta: 'Otras monedas' }
            ]
        },
        {
            nombre:   'Brasil',
            pais:     'br',
            bandera:  'https://flagcdn.com/w160/br.png',
            endpoints: [
                { url: 'https://br.dolarapi.com/v1/cotacoes', etiqueta: 'Cotações' }
            ]
        },
        {
            nombre:   'Chile',
            pais:     'cl',
            bandera:  'https://flagcdn.com/w160/cl.png',
            endpoints: [
                { url: 'https://cl.dolarapi.com/v1/cotizaciones', etiqueta: 'Cotizaciones' }
            ]
        },
        {
            nombre:   'Uruguay',
            pais:     'uy',
            bandera:  'https://flagcdn.com/w160/uy.png',
            endpoints: [
                { url: 'https://uy.dolarapi.com/v1/cotizaciones', etiqueta: 'Cotizaciones' }
            ]
        },
        {
            nombre:   'Venezuela',
            pais:     've',
            bandera:  'https://flagcdn.com/w160/ve.png',
            endpoints: [
                { url: 'https://ve.dolarapi.com/v1/dolares', etiqueta: 'Tipos de dólar' }
            ]
        }
    ];

    const container     = document.getElementById('api-cards-container');
    const refreshBtn    = document.getElementById('refresh-btn');
    const lastUpdateEl  = document.getElementById('last-update-time');
    const totalApisEl   = document.getElementById('total-apis');
    const onlineApisEl  = document.getElementById('online-apis');
    const offlineApisEl = document.getElementById('offline-apis');

    async function verificarEndpoint(endpoint) {
        const inicio = performance.now();
        try {
            const res = await fetch(endpoint.url, { cache: 'no-store' });
            const latencia = Math.round(performance.now() - inicio);
            if (!res.ok) return { ...endpoint, ok: false, latencia, error: `HTTP ${res.status}` };
            const datos = await res.json();
            return { ...endpoint, ok: true, latencia, cantidad: Array.isArray(datos) ? datos.length : 1 };
        } catch (err) {
            return { ...endpoint, ok: false, latencia: Math.round(performance.now() - inicio), error: err.message };
        }
    }

    async function verificarApi(api) {
        const resultados = await Promise.all(api.endpoints.map(verificarEndpoint));
        return { ...api, online: resultados.every(r => r.ok), endpoints: resultados, verificadoEn: new Date() };
    }

    function crearCardApi(resultado) {
        const card = document.createElement('div');
        card.className = `api-card ${resultado.online ? 'online' : 'offline'}`;
        card.style.animationDelay = '0.1s';

        const hora = resultado.verificadoEn.toLocaleTimeString('es-AR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        let endpointsHtml = '';
        resultado.endpoints.forEach(ep => {
            endpointsHtml += `
                <div class="api-detail">
                    <span class="api-detail-label">${ep.etiqueta}</span>
                    <span class="api-detail-value" style="color:${ep.ok ? 'var(--positive)' : 'var(--negative)'}">
                        ${ep.ok ? `✓ OK · ${ep.latencia}ms · ${ep.cantidad} reg.` : `✗ ${ep.error}`}
                    </span>
                </div>`;
        });

        card.innerHTML = `
            <div class="api-header">
                <img src="${resultado.bandera}" alt="${resultado.nombre}" style="width:40px;height:27px;border-radius:4px;object-fit:cover">
                <div>
                    <h3 class="country-name">${resultado.nombre}</h3>
                    <p class="api-url">${resultado.endpoints.map(e => e.url).join('<br>')}</p>
                </div>
            </div>
            <div style="margin-bottom:0.875rem">
                <span class="api-status-badge ${resultado.online ? 'online' : 'offline'}">
                    <i class="fas ${resultado.online ? 'fa-circle-check' : 'fa-circle-xmark'}"></i>
                    ${resultado.online ? 'Online' : 'Offline'}
                </span>
            </div>
            <div>
                ${endpointsHtml}
                <div class="api-detail" style="margin-top:0.25rem">
                    <span class="api-detail-label">Última verificación</span>
                    <span class="api-detail-value">${hora}</span>
                </div>
            </div>`;

        return card;
    }

    async function verificarTodas() {
        refreshBtn.classList.add('loading');
        refreshBtn.disabled = true;
        container.innerHTML = `
            <div class="loading-state">
                <i class="fas fa-circle-notch"></i>
                <p>Verificando ${APIS.length} APIs...</p>
            </div>`;

        try {
            const resultados = await Promise.all(APIS.map(verificarApi));
            container.innerHTML = '';
            resultados.forEach((r, i) => {
                const card = crearCardApi(r);
                card.style.animationDelay = (i * 0.08) + 's';
                container.appendChild(card);
            });

            const online  = resultados.filter(r => r.online).length;
            totalApisEl.textContent  = resultados.length;
            onlineApisEl.textContent  = online;
            offlineApisEl.textContent = resultados.length - online;

            lastUpdateEl.textContent = new Date().toLocaleTimeString('es-AR', {
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            });
        } catch (err) {
            container.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-triangle-exclamation" style="color:var(--negative);animation:none"></i>
                    <p>Error al verificar: ${err.message}</p>
                </div>`;
        } finally {
            refreshBtn.classList.remove('loading');
            refreshBtn.disabled = false;
        }
    }

    refreshBtn.addEventListener('click', verificarTodas);
    verificarTodas();
    setInterval(verificarTodas, 5 * 60 * 1000);
});
