const bearer = [{ bearerAuth: [] }];
const jsonBody = (properties, required = []) => ({
  required: true,
  content: {
    'application/json': {
      schema: { type: 'object', required, properties },
    },
  },
});

const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'GarrafaYa API',
    version: '1.0.0',
    description: 'API de distribución de GLP para La Paz y El Alto, Bolivia.',
  },
  servers: [{ url: '/' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
  },
  paths: {
    '/health': { get: { summary: 'Estado de la API y PostgreSQL', responses: { 200: { description: 'Servicio disponible' }, 503: { description: 'Base de datos no disponible' } } } },
    '/api/auth/register': {
      post: {
        summary: 'Registro público de Cliente',
        requestBody: jsonBody({
          nombre: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          telefono: { type: 'string' },
          ci: { type: 'string' },
          rol: { type: 'string', enum: ['Cliente'] },
        }, ['nombre', 'email', 'password']),
        responses: { 201: { description: 'Cliente creado' }, 400: { description: 'Datos inválidos' } },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Inicio de sesión para los tres roles',
        requestBody: jsonBody({
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        }, ['email', 'password']),
        responses: { 200: { description: 'JWT y usuario' }, 401: { description: 'Credenciales inválidas' } },
      },
    },
    '/api/auth/me': { get: { summary: 'Perfil del usuario autenticado', security: bearer, responses: { 200: { description: 'Perfil actual' } } } },
    '/api/dashboard/resumen': { get: { summary: 'Resumen operativo', security: bearer, responses: { 200: { description: 'Métricas del día' } } } },
    '/api/usuarios': {
      get: { summary: 'Listar usuarios (Administrador)', security: bearer, responses: { 200: { description: 'Usuarios' } } },
      post: {
        summary: 'Crear Administrador o Camionero',
        security: bearer,
        requestBody: jsonBody({
          nombre: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          rol: { type: 'string', enum: ['Administrador', 'Camionero'] },
          telefono: { type: 'string' },
          ci: { type: 'string' },
        }, ['nombre', 'email', 'password', 'rol']),
        responses: { 201: { description: 'Usuario creado' } },
      },
    },
    '/api/usuarios/{id}': {
      put: {
        summary: 'Actualizar usuario',
        security: bearer,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: jsonBody({
          nombre: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          rol: { type: 'string', enum: ['Administrador', 'Camionero', 'Cliente'] },
          telefono: { type: 'string' },
          ci: { type: 'string' },
        }),
        responses: { 200: { description: 'Usuario actualizado' } },
      },
      delete: { summary: 'Desactivar usuario', security: bearer, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Usuario desactivado' } } },
    },
    '/api/usuarios/{id}/estado': {
      patch: {
        summary: 'Cambiar estado del usuario',
        security: bearer,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: jsonBody({ activo: { type: 'boolean' } }, ['activo']),
        responses: { 200: { description: 'Estado actualizado' } },
      },
    },
    '/api/camiones': {
      get: { summary: 'Listar camiones, stock restante y ubicación', security: bearer, responses: { 200: { description: 'Camiones' } } },
      post: {
        summary: 'Crear camión (Administrador)',
        security: bearer,
        requestBody: jsonBody({
          placa: { type: 'string' },
          camionero_id: { type: 'integer', nullable: true },
          marca: { type: 'string' },
          modelo: { type: 'string' },
        }, ['placa']),
        responses: { 201: { description: 'Camión creado' } },
      },
    },
    '/api/camiones/{id}': {
      put: {
        summary: 'Actualizar camión (Administrador)',
        security: bearer,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: jsonBody({
          placa: { type: 'string' },
          camionero_id: { type: 'integer', nullable: true },
          marca: { type: 'string', nullable: true },
          modelo: { type: 'string', nullable: true },
          activo: { type: 'boolean' },
        }),
        responses: { 200: { description: 'Camión actualizado' } },
      },
    },
    '/api/camiones/{id}/ubicacion': {
      patch: {
        summary: 'Actualizar ubicación (Camionero asignado)',
        security: bearer,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: jsonBody({
          latitud: { type: 'number', minimum: -90, maximum: 90 },
          longitud: { type: 'number', minimum: -180, maximum: 180 },
          ubicacion: { type: 'string', nullable: true },
        }, ['latitud', 'longitud']),
        responses: { 200: { description: 'Ubicación actualizada' } },
      },
    },
    '/api/zonas': {
      get: { summary: 'Listar zonas', responses: { 200: { description: 'Zonas de servicio' } } },
      post: {
        summary: 'Crear zona (Administrador)',
        security: bearer,
        requestBody: jsonBody({
          nombre: { type: 'string' },
          ciudad: { type: 'string', enum: ['La Paz', 'El Alto'] },
          macrodistrito: { type: 'string', nullable: true },
        }, ['nombre', 'ciudad']),
        responses: { 201: { description: 'Zona creada' } },
      },
    },
    '/api/zonas/{id}': {
      put: {
        summary: 'Actualizar zona (Administrador)',
        security: bearer,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: jsonBody({
          nombre: { type: 'string' },
          ciudad: { type: 'string', enum: ['La Paz', 'El Alto'] },
          macrodistrito: { type: 'string', nullable: true },
          activa: { type: 'boolean' },
        }),
        responses: { 200: { description: 'Zona actualizada' } },
      },
      delete: { summary: 'Eliminar zona (Administrador)', security: bearer, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Zona eliminada' } } },
    },
    '/api/rutas': {
      get: { summary: 'Listar rutas (Administrador/Camionero)', security: bearer, responses: { 200: { description: 'Rutas' } } },
      post: {
        summary: 'Crear ruta (Administrador)',
        security: bearer,
        requestBody: jsonBody({
          camion_id: { type: 'integer' },
          camionero_id: { type: 'integer' },
          zona_id: { type: 'integer' },
          capacidad_kg: { type: 'integer', enum: [10, 45] },
        }, ['camion_id', 'camionero_id', 'zona_id', 'capacidad_kg']),
        responses: { 201: { description: 'Ruta creada' } },
      },
    },
    '/api/rutas/mi-ruta': { get: { summary: 'Ruta activa del Camionero', security: bearer, responses: { 200: { description: 'Ruta activa o null' } } } },
    '/api/rutas/{id}': {
      get: { summary: 'Obtener ruta por ID', security: bearer, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Ruta' } } },
      put: {
        summary: 'Actualizar ruta (Administrador)',
        security: bearer,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: jsonBody({
          camion_id: { type: 'integer' },
          camionero_id: { type: 'integer' },
          zona_id: { type: 'integer' },
          capacidad_kg: { type: 'integer', enum: [10, 45] },
          estado: { type: 'string', enum: ['PENDIENTE', 'ACTIVA', 'FINALIZADA', 'CANCELADA'] },
          garrafas_iniciales: { type: 'integer', minimum: 0 },
          garrafas_entregadas: { type: 'integer', minimum: 0 },
        }),
        responses: { 200: { description: 'Ruta actualizada' } },
      },
      delete: { summary: 'Eliminar ruta (Administrador)', security: bearer, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Ruta eliminada' } } },
    },
    '/api/rutas/{id}/progreso': {
      patch: {
        summary: 'Actualizar entregas/finalizar ruta (Camionero asignado)',
        security: bearer,
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }],
        requestBody: jsonBody({
          garrafas_entregadas: { type: 'integer', minimum: 0 },
          finalizar: { type: 'boolean' },
        }, ['garrafas_entregadas']),
        responses: { 200: { description: 'Progreso actualizado' } },
      },
    },
    '/api/despachos': {
      get: { summary: 'Listar despachos (Administrador)', security: bearer, responses: { 200: { description: 'Despachos' } } },
      post: {
        summary: 'Crear despacho transaccional (Administrador)',
        security: bearer,
        requestBody: jsonBody({
          camion_id: { type: 'integer' },
          zona_id: { type: 'integer' },
          capacidad_kg: { type: 'integer', enum: [10, 45] },
          cantidad: { type: 'integer', minimum: 1 },
        }, ['camion_id', 'zona_id', 'capacidad_kg', 'cantidad']),
        responses: { 201: { description: 'Despacho y ruta actualizados' }, 409: { description: 'Stock insuficiente' } },
      },
    },
    '/api/garrafas/inventario': { get: { summary: 'Consultar stock de planta (Administrador)', security: bearer, responses: { 200: { description: 'Stock por capacidad' } } } },
    '/api/garrafas/movimientos': {
      get: { summary: 'Consultar movimientos (Administrador)', security: bearer, responses: { 200: { description: 'Movimientos' } } },
      post: {
        summary: 'Registrar entrada o retorno vacío (Administrador)',
        security: bearer,
        requestBody: jsonBody({
          capacidad_kg: { type: 'integer', enum: [10, 45] },
          cantidad: { type: 'integer', minimum: 1 },
          tipo: { type: 'string', enum: ['ENTRADA_PLANTA', 'RETORNO_VACIOS'] },
          detalle: { type: 'string', nullable: true },
        }, ['capacidad_kg', 'cantidad', 'tipo']),
        responses: { 201: { description: 'Movimiento creado' } },
      },
    },
    '/api/incidentes': {
      get: { summary: 'Listar incidentes (Administrador/Camionero)', security: bearer, responses: { 200: { description: 'Incidentes' } } },
      post: {
        summary: 'Reportar incidente (Administrador/Camionero)',
        security: bearer,
        requestBody: jsonBody({
          ruta_id: { type: 'integer' },
          descripcion: { type: 'string' },
          latitud: { type: 'number', minimum: -90, maximum: 90, nullable: true },
          longitud: { type: 'number', minimum: -180, maximum: 180, nullable: true },
        }, ['ruta_id', 'descripcion']),
        responses: { 201: { description: 'Incidente reportado' } },
      },
    },
    '/api/incidentes/{id}/resolver': { patch: { summary: 'Resolver incidente (Administrador)', security: bearer, parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'integer' } }], responses: { 200: { description: 'Incidente resuelto' } } } },
    '/api/avistamientos': {
      get: { summary: 'Listar últimos avistamientos (autenticado)', security: bearer, responses: { 200: { description: 'Avistamientos recientes' } } },
      post: {
        summary: 'Reportar avistamiento (Cliente)',
        security: bearer,
        requestBody: jsonBody({
          camion_id: { type: 'integer' },
          latitud: { type: 'number', minimum: -90, maximum: 90 },
          longitud: { type: 'number', minimum: -180, maximum: 180 },
          ubicacion: { type: 'string' },
          comentario: { type: 'string' },
        }, ['camion_id', 'latitud', 'longitud']),
        responses: { 201: { description: 'Avistamiento creado' } },
      },
    },
    '/api/noticias': {
      get: { summary: 'Listar noticias', responses: { 200: { description: 'Noticias activas' } } },
      post: {
        summary: 'Publicar noticia (Cliente/Administrador)',
        security: bearer,
        requestBody: jsonBody({
          titulo: { type: 'string' },
          contenido: { type: 'string' },
        }, ['titulo', 'contenido']),
        responses: { 201: { description: 'Noticia creada' } },
      },
    },
    '/api/precios': { get: { summary: 'Consultar precios públicos', responses: { 200: { description: 'Precios vigentes' } } } },
    '/api/precios/{capacidad_kg}': {
      put: {
        summary: 'Actualizar precio (Administrador)',
        security: bearer,
        parameters: [{ in: 'path', name: 'capacidad_kg', required: true, schema: { type: 'integer', enum: [10, 45] } }],
        requestBody: jsonBody({ precio_bs: { type: 'number', minimum: 0.01, multipleOf: 0.01 } }, ['precio_bs']),
        responses: { 200: { description: 'Precio actualizado' } },
      },
    },
  },
};

module.exports = swaggerDocument;
