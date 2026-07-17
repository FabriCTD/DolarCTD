exports.handler = async function (event, context) {
  // Manejar preflight de CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: ''
    };
  }

  try {
    // Extraer la ruta eliminando '/api/'
    // event.path será algo como "/api/v2/rates"
    const cleanPath = event.path.replace(/^\/api\/?/, '');

    // Si entran directo a /api/ o está vacío, mostrar mensaje de bienvenida
    if (!cleanPath || cleanPath === '/') {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          error: false,
          message: "Bienvenido a la API de Divisas de FabriCTD.",
          docs_v2: "https://dolarctd.fabrictd.com/api/v2/docs.html",
          docs_v1: "https://dolarctd.fabrictd.com/api/v1/docs.html"
        })
      };
    }

    // Armar la URL para hacer fetch a Frankfurter
    const frankfurterUrl = new URL(`https://api.frankfurter.dev/${cleanPath}`);

    // Agregar los parámetros de la URL (ej: ?base=USD&quotes=ARS)
    if (event.queryStringParameters) {
      for (const [key, value] of Object.entries(event.queryStringParameters)) {
        frankfurterUrl.searchParams.append(key, value);
      }
    }

    // Consultar a la API original
    const response = await fetch(frankfurterUrl.toString(), {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'FabriCTD-Divisas-API/3.0 (Netlify)'
      }
    });

    // Obtener la respuesta como texto (JSON en string)
    const data = await response.text();

    // Devolver al cliente final
    return {
      statusCode: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: data
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: true,
        message: 'Error interno del proxy Serverless de FabriCTD.',
        details: error.message
      })
    };
  }
};
