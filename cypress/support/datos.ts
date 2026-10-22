/** Datos de prueba y respuestas simuladas del backend (Spring Boot) de Génesis Fashion. */

export const CORS = { 'access-control-allow-origin': '*' }

/** Crea un JWT de mentira (sin firma real). LoginCliente solo decodifica el payload con atob(). */
export const crearJwtFalso = (payload: Record<string, unknown>): string => {
  const b64 = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_')
  return `${b64({ alg: 'HS256', typ: 'JWT' })}.${b64(payload)}.firma-de-prueba`
}

export const EMPLEADO_ADMIN = {
  token: 'token-empleado-de-prueba',
  tipo: 'Bearer',
  username: 'admin@genesis.com',
  rol: 'Administrador',
  documento: 1017000001,
  nombreCompleto: 'Marlon Gómez',
  requiereCambioPass: false,
}

export const CLIENTE_LAURA = {
  username: 'laura@correo.com',
  nombreCompleto: 'Laura Gómez',
  idCliente: 7,
}

/** SVG pequeño en data-URI: evita depender de imágenes remotas en la prueba. */
export const IMAGEN_PRODUCTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="#4f46e5"/></svg>'
  )

export const PRODUCTOS = [
  {
    idProducto: 1,
    nombre: 'Camiseta Oversize Genesis',
    descripcion: 'Camiseta de algodón corte oversize',
    precio: 89900,
    imagenUrl: IMAGEN_PRODUCTO,
    nombreCategoria: 'Camisetas',
    activo: true,
  },
  {
    idProducto: 2,
    nombre: 'Hoodie Urbano',
    descripcion: 'Hoodie con capucha',
    precio: 159900,
    imagenUrl: '',
    nombreCategoria: 'Buzos',
    activo: true,
  },
]

export const INVENTARIO = [
  { idInventario: 11, idProducto: 1, talla: 'M', color: 'Negro', stockOnline: 5 },
  { idInventario: 12, idProducto: 1, talla: 'M', color: 'Blanco', stockOnline: 2 },
  { idInventario: 13, idProducto: 1, talla: 'L', color: 'Negro', stockOnline: 3 },
  // Hoodie sin stock online -> la tarjeta debe mostrar "Sin stock"
  { idInventario: 21, idProducto: 2, talla: 'M', color: 'Gris', stockOnline: 0 },
]

export const DASHBOARD = {
  totalClientes: 120,
  totalProductos: 45,
  totalPedidos: 310,
  totalVentas: 25800000,
  pedidosHoy: 4,
  ventasHoy: 640000,
}
