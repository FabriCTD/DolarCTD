# DólarCTD

<div align="center">

**Cotizaciones del dólar y otras monedas en tiempo real para Sudamérica.**

[![Sitio en vivo](https://img.shields.io/badge/🌐_Sitio_en_vivo-dolarctd.fabrictd.com-3b82f6?style=for-the-badge)](https://dolarctd.fabrictd.com)
[![GitHub](https://img.shields.io/badge/GitHub-FabriCTD%2FDolarCTD-181717?style=for-the-badge&logo=github)](https://github.com/FabriCTD/DolarCTD)
[![API](https://img.shields.io/badge/API-DolarAPI-f59e0b?style=for-the-badge)](https://dolarapi.com)

</div>

---

## ✨ Características

| Característica | Detalle |
|---|---|
| 🇦🇷 **Argentina** | Dólar Blue, Oficial, MEP, CCL, Cripto, Tarjeta, Mayorista y más |
| 🇧🇷 **Brasil** | Dólar, Euro y otras monedas en BRL |
| 🇨🇱 **Chile** | Dólar, Euro y otras monedas en CLP |
| 🇺🇾 **Uruguay** | Dólar, Euro y otras monedas en UYU |
| 🇻🇪 **Venezuela** | Dólar Oficial BCV, Paralelo y Cripto |
| 🎮 **Steam / Netflix** | Cálculo de dólar para servicios digitales (AR) |
| ⚡ **Actualización automática** | Cada 1 minuto sin recargar la página |
| 🧮 **Calculadora integrada** | Por cotización y en todas a la vez |
| 📊 **Estado de APIs** | Monitor en tiempo real de todos los endpoints |
| 🔍 **SEO completo** | Meta tags, Open Graph, Schema.org, sitemap |
| 📱 **Responsive** | Adaptado para móvil, tablet y desktop |
| 🚫 **Sin publicidad** | Sin registro, sin tracking, sin publicidad |

---

## 📡 APIs Utilizadas

| País | Endpoint |
|---|---|
| 🇦🇷 Argentina | [`dolarapi.com/v1/dolares`](https://dolarapi.com/docs/argentina/) · [`dolarapi.com/v1/cotizaciones`](https://dolarapi.com/docs/argentina/) |
| 🇧🇷 Brasil | [`br.dolarapi.com/v1/cotacoes`](https://br.dolarapi.com) |
| 🇨🇱 Chile | [`cl.dolarapi.com/v1/cotizaciones`](https://cl.dolarapi.com) |
| 🇺🇾 Uruguay | [`uy.dolarapi.com/v1/cotizaciones`](https://uy.dolarapi.com) |
| 🇻🇪 Venezuela | [`ve.dolarapi.com/v1/dolares`](https://ve.dolarapi.com) |

---

## 🗂 Estructura del Proyecto

```
DolarCTD/
│
├── index.html              # 🏠 Selector de país
├── estados-apis.html       # 📊 Monitor de APIs
├── robots.txt
├── sitemap.xml
│
├── css/
│   ├── style.css           # 🎨 CSS global único (todos los países lo usan)
│   └── estados-apis.css    # Estilos adicionales para el monitor
│
├── js/
│   ├── app.js              # 🧠 Lógica compartida (cards, modal, progress bar)
│   ├── script.js           # Script del root
│   └── estados-apis.js     # Lógica del monitor de APIs
│
├── ar/                     # 🇦🇷 Argentina
│   ├── inicio.html         # Página principal
│   ├── contacto.html       # Página de contacto
│   ├── desarrollador.html  # → github.com/FabriCTD
│   ├── ofertas-steam.html  # → Steam
│   ├── js/script.js        # Lógica específica AR (fetch + nombres)
│   └── css/style.css       # @import global
│
├── br/                     # 🇧🇷 Brasil (pt-BR)
│   ├── inicio.html
│   ├── js/script.js
│   └── css/style.css
│
├── cl/                     # 🇨🇱 Chile
│   ├── inicio.html
│   ├── js/script.js
│   └── css/style.css
│
├── uy/                     # 🇺🇾 Uruguay
│   ├── inicio.html
│   ├── js/script.js
│   └── css/style.css
│
└── ve/                     # 🇻🇪 Venezuela
    ├── inicio.html
    ├── js/script.js
    └── css/style.css
```

> **Nota de arquitectura:** Todo el CSS está centralizado en `css/style.css`. Los archivos `ar/css/style.css`, `cl/css/style.css`, etc. son simplemente `@import` del global — sin duplicación.

---

## 🎨 Diseño

- **Fuente:** [Inter](https://fonts.google.com/specimen/Inter) — tipografía premium
- **Paleta:** Azul profundo + Azul eléctrico + Ámbar dorado
- **Cards:** Glassmorphism con gradiente superior animado
- **Animaciones:** Fade-in con stagger, hover glow, progress bar, modal con spring physics
- **Skeleton loaders** mientras carga la API
- **Dropdown de países** en el header para navegar sin volver al inicio

---

## 🚀 Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/FabriCTD/DolarCTD.git

# Entrar al directorio
cd DolarCTD

# Abrir con cualquier servidor estático, por ejemplo:
npx serve .
# o simplemente abrir index.html en el navegador
```

> No requiere Node.js, npm ni ningún build step. HTML + CSS + JS puro.

---

## 👤 Desarrollador

<div align="center">

**FabriCTD**

[![GitHub](https://img.shields.io/badge/GitHub-FabriCTD-181717?style=flat-square&logo=github)](https://github.com/FabriCTD)
[![YouTube](https://img.shields.io/badge/YouTube-@FabriCTD-FF0000?style=flat-square&logo=youtube)](https://www.youtube.com/@FabriCTD)
[![Steam](https://img.shields.io/badge/Steam-FabriCTD-000000?style=flat-square&logo=steam)](https://store.steampowered.com)
[![Email](https://img.shields.io/badge/Email-dolarctd@fabrictd.com-3b82f6?style=flat-square&logo=gmail)](mailto:dolarctd@fabrictd.com)

</div>

---

## 📄 Licencia

MIT License — Libre para usar, modificar y distribuir.

---

<div align="center">

> ⚠️ **Aviso Legal:** La información mostrada en DólarCTD proviene de fuentes públicas y se ofrece únicamente con fines informativos. No constituye asesoramiento financiero. DólarCTD no está afiliado con Steam, Netflix ni ninguna plataforma de entretenimiento mencionada.

</div>
