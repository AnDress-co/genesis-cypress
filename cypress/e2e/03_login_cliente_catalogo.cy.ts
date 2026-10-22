/// <reference types="cypress" />
import { CORS, CLIENTE_LAURA, PRODUCTOS, INVENTARIO, crearJwtFalso } from '../support/datos'

/**
 * TC-WEB-03 | URL: /cliente/login (→ /cliente/catalogo) | RF-08 (Carrito de compras), RF-03
 * Portal de clientes: login no exitoso y exitoso, menú de navegación y menú desplegable de usuario, catálogo con imágenes,
 * selección de talla/color, carrito y realización de un pedido.
 */
describe('TC-WEB-03 - Portal de clientes (/cliente/login)', () => {
  const TITULO = Cypress.env('TITULO_ESPERADO') as string
  const MENU_USUARIO = '[data-testid="menu-usuario"]'
  const MENU_OPCIONES = '[data-testid="menu-usuario-opciones"]'

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.stubCors()
    cy.intercept({ method: 'GET', pathname: '/api/productos/activos' }, { statusCode: 200, body: PRODUCTOS, headers: CORS })
    cy.intercept({ method: 'GET', pathname: '/api/inventario' }, { statusCode: 200, body: INVENTARIO, headers: CORS })
  })

  it('valida el login de clientes, el menú, el catálogo y el flujo de compra', () => {
    // ── 1. Navegación, URL y título ──────────────────────────────────
    cy.paso(1, 'Abrir la página /cliente/login')
    cy.visit('/cliente/login')

    cy.paso(2, 'Validar URL y título de la página')
    cy.url().should('eq', `${Cypress.config('baseUrl')}/cliente/login`)
    cy.title().should('eq', TITULO)

    // ── 2. Textos ────────────────────────────────────────────────────
    cy.paso(3, 'Validar los textos visibles del portal')
    cy.get('h1').should('have.text', 'GENESIS')
    cy.contains('p', 'Portal de Clientes').should('be.visible')
    cy.get('h2').should('have.text', 'Iniciar Sesión')
    cy.contains('label', 'Correo electrónico').should('be.visible')
    cy.contains('label', 'Contraseña').should('be.visible')
    cy.contains('¿No tienes cuenta?').should('be.visible')
    cy.contains('¿Eres empleado?').should('be.visible')

    // ── 3. Elementos presentes ───────────────────────────────────────
    cy.paso(4, 'Validar elementos presentes: inputs, botón y enlaces')
    cy.get('input[type="email"]').should('be.visible').and('have.attr', 'placeholder', 'correo@ejemplo.com')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('be.visible').and('be.enabled').and('contain.text', 'Iniciar Sesión')
    cy.contains('a', 'Regístrate aquí').should('have.attr', 'href', '/registro')
    cy.contains('a', 'Ingresa aquí').should('have.attr', 'href', '/login')

    // ── 4. CSS ───────────────────────────────────────────────────────
    cy.paso(5, 'Validar estilos CSS del portal')
    cy.get('h1')
      .should('have.css', 'font-size', '36px')
      .and('have.css', 'font-weight', '900')
      .and('have.css', 'color', 'rgb(255, 255, 255)')
    cy.get('h1').invoke('css', 'font-family').should('contain', 'sans-serif')
    cy.get('h1').closest('.min-h-screen').shouldHaveColor('background-color', 'var(--color-gray-950)')
    cy.get('button[type="submit"]')
      .should('have.css', 'border-radius', '8px')
      .and('have.css', 'font-weight', '600')
      .shouldHaveColor('background-color', 'var(--color-indigo-600)')
    cy.contains('a', 'Ingresa aquí')
      .should('have.css', 'text-decoration-line', 'underline')
      .and('have.css', 'font-weight', '600')
      .shouldHaveColor('color', 'var(--color-indigo-400)')

    // ── 5. Autenticación NO exitosa ──────────────────────────────────
    cy.paso(6, 'Enviar credenciales incorrectas y validar el mensaje del servidor')
    cy.intercept({ method: 'POST', pathname: '/api/auth/cliente/login' }, { statusCode: 401, body: { message: 'Credenciales inválidas' }, headers: CORS }).as('loginFallido')
    cy.get('input[type="email"]').type('laura@correo.com')
    cy.get('input[type="password"]').type('ClaveMala123!')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginFallido')
    cy.contains('div', 'Credenciales inválidas').should('be.visible').shouldHaveColor('color', 'var(--color-red-400)')
    cy.location('pathname').should('eq', '/cliente/login')

    // ── 6. Autenticación exitosa ─────────────────────────────────────
    cy.paso(7, 'Enviar credenciales válidas y validar la redirección al catálogo')
    const token = crearJwtFalso({ idCliente: CLIENTE_LAURA.idCliente, sub: CLIENTE_LAURA.username })
    cy.intercept(
      { method: 'POST', pathname: '/api/auth/cliente/login' },
      {
        statusCode: 200,
        headers: CORS,
        body: { token, tipo: 'Bearer', username: CLIENTE_LAURA.username, rol: 'Cliente', documento: 1020304050, nombreCompleto: CLIENTE_LAURA.nombreCompleto, requiereCambioPass: false },
      }
    ).as('loginExitoso')
    cy.get('input[type="password"]').clear().type('Genesis#2026ok')
    cy.get('button[type="submit"]').click()
    cy.wait('@loginExitoso').its('request.body').should('deep.equal', { username: 'laura@correo.com', password: 'Genesis#2026ok' })
    cy.location('pathname').should('eq', '/cliente/catalogo')
    cy.title().should('eq', TITULO)

    // ── 7. Menú de navegación y menú desplegable de usuario ──────────
    cy.paso(8, 'Validar el menú de navegación del cliente y el botón de usuario')
    cy.get('nav a').should('have.length', 2)
    cy.contains('nav a', 'Catálogo').should('be.visible').and('have.attr', 'href', '/cliente/catalogo').shouldHaveColor('color', 'var(--color-indigo-400)')
    cy.contains('nav a', 'Mis Pedidos').should('be.visible').and('have.attr', 'href', '/cliente/pedidos').shouldHaveColor('color', 'var(--color-gray-400)')
    cy.get(MENU_USUARIO)
      .should('be.visible')
      .and('contain.text', 'Hola, Laura')
      .and('contain.text', '▾')
      .and('have.attr', 'aria-expanded', 'false')
      .and('have.css', 'border-radius', '8px')
      .and('have.css', 'font-size', '14px')
      .shouldHaveColor('background-color', 'var(--color-gray-800)')

    cy.paso(9, 'Validar que el menú desplegable está cerrado y abrirlo con un clic')
    cy.get(MENU_OPCIONES).should('not.exist')
    cy.get(MENU_USUARIO).click()
    cy.get(MENU_USUARIO).should('have.attr', 'aria-expanded', 'true')
    cy.get(MENU_OPCIONES).should('be.visible')

    cy.paso(10, 'Validar los elementos y estilos del menú desplegable')
    cy.get(MENU_OPCIONES)
      .should('have.css', 'border-radius', '12px')
      .and('have.css', 'width', '192px')
      .shouldHaveColor('background-color', 'var(--color-gray-900)')
    cy.get(`${MENU_OPCIONES} [role="menuitem"]`).should('have.length', 2).then(($op) => {
      expect($op.map((_, o) => o.textContent?.trim()).get()).to.deep.equal(['Mis Pedidos', 'Cerrar sesión'])
    })
    cy.get(`${MENU_OPCIONES} a[role="menuitem"]`)
      .should('have.attr', 'href', '/cliente/pedidos')
      .and('have.css', 'font-size', '14px')
      .shouldHaveColor('color', 'var(--color-gray-300)')
    cy.get(`${MENU_OPCIONES} button[role="menuitem"]`).shouldHaveColor('color', 'var(--color-red-400)')

    cy.paso(11, 'Cerrar el menú con la tecla Escape y con un clic fuera de él')
    cy.get('body').type('{esc}')
    cy.get(MENU_OPCIONES).should('not.exist')
    cy.get(MENU_USUARIO).should('have.attr', 'aria-expanded', 'false')
    cy.get(MENU_USUARIO).click()
    cy.get(MENU_OPCIONES).should('be.visible')
    cy.get('main h1').click()
    cy.get(MENU_OPCIONES).should('not.exist')

    // ── 8. Catálogo ──────────────────────────────────────────────────
    cy.paso(12, 'Validar el encabezado del catálogo y el contador de productos')
    cy.get('main h1').should('have.text', 'Catálogo').and('have.css', 'font-size', '24px').and('have.css', 'font-weight', '700')
    cy.contains('p', '2 productos disponibles').should('be.visible')
    cy.contains('button', 'Carrito').should('be.visible').shouldHaveColor('background-color', 'var(--color-indigo-600)')

    cy.paso(13, 'Validar las tarjetas de producto: imagen, categoría, precio y botón Agregar')
    cy.get('img[alt="Camiseta Oversize Genesis"]').should('be.visible').and(($img) => {
      expect(($img[0] as HTMLImageElement).naturalWidth, 'imagen cargada').to.be.greaterThan(0)
    })
    cy.contains('h3', 'Camiseta Oversize Genesis').parent().within(() => {
      cy.contains('Camisetas').should('be.visible')
      cy.contains('$89.900').should('be.visible')
      cy.contains('button', 'Agregar').should('be.visible')
    })

    cy.paso(14, 'Validar que el producto sin stock muestra "Sin stock" y no tiene botón Agregar')
    cy.contains('h3', 'Hoodie Urbano').parent().within(() => {
      cy.contains('Sin stock').should('be.visible')
      cy.contains('button', 'Agregar').should('not.exist')
    })

    // ── 9. Selección de talla y color ────────────────────────────────
    cy.paso(15, 'Abrir la selección de talla y color y validar las opciones disponibles')
    cy.contains('h3', 'Camiseta Oversize Genesis').parent().contains('button', 'Agregar').click()
    cy.get('div.fixed').within(() => {
      cy.contains('button', 'Agregar al carrito').should('be.disabled').shouldHaveColor('background-color', 'var(--color-gray-700)')
      cy.contains('label', 'Talla').next().find('button').should('have.length', 2).then(($b) => {
        expect($b.map((_, b) => b.textContent).get()).to.deep.equal(['M', 'L'])
      })
      cy.contains('label', 'Color').should('not.exist')
    })

    cy.paso(16, 'Elegir talla M, validar los colores disponibles y elegir Negro')
    cy.get('div.fixed').within(() => {
      cy.contains('label', 'Talla').next().contains('button', /^M$/).click()
      cy.contains('label', 'Color').next().find('button').should('have.length', 2).then(($b) => {
        expect($b.map((_, b) => b.textContent).get()).to.deep.equal(['Negro', 'Blanco'])
      })
      cy.contains('label', 'Color').next().contains('button', 'Negro').click()
      cy.contains('button', 'Agregar al carrito').should('be.enabled').shouldHaveColor('background-color', 'var(--color-indigo-600)')
    })

    // ── 10. Carrito y pedido ─────────────────────────────────────────
    cy.paso(17, 'Agregar al carrito y validar el contenido del panel del carrito')
    cy.get('div.fixed').contains('button', 'Agregar al carrito').click()
    cy.get('div.fixed').within(() => {
      cy.contains('h2', 'Carrito').should('be.visible')
      cy.contains('p', 'Camiseta Oversize Genesis').should('be.visible')
      cy.contains('p', 'M · Negro').should('be.visible')
      cy.contains('x1').should('be.visible')
      cy.contains('Total').next().should('have.text', '$89.900')
      cy.contains('button', 'Realizar pedido').should('be.enabled')
    })

    cy.paso(18, 'Realizar el pedido y validar el mensaje de éxito y el cuerpo de la petición')
    cy.intercept({ method: 'POST', pathname: '/api/pedidos' }, { statusCode: 201, body: { idPedido: 501 }, headers: CORS }).as('crearPedido')
    cy.contains('button', 'Realizar pedido').click()
    cy.wait('@crearPedido').its('request.body').should((body) => {
      expect(body).to.include({ idCliente: CLIENTE_LAURA.idCliente, canalVenta: 'Online' })
      expect(body.detalles).to.deep.equal([{ idProducto: 1, talla: 'M', color: 'Negro', cantidad: 1 }])
    })
    cy.contains('div', '¡Pedido realizado exitosamente!').should('be.visible').shouldHaveColor('color', 'var(--color-green-400)')
    cy.contains('a', 'Mis Pedidos').should('have.attr', 'href', '/cliente/pedidos')

    // ── 11. Cierre de sesión y ruta protegida ────────────────────────
    cy.paso(19, 'Cerrar sesión desde el menú desplegable y validar el regreso a /cliente/login')
    cy.get(MENU_USUARIO).click()
    cy.get(`${MENU_OPCIONES} button[role="menuitem"]`).contains('Cerrar sesión').click()
    cy.location('pathname').should('eq', '/cliente/login')
    cy.window().its('localStorage').invoke('getItem', 'clienteToken').should('be.null')

    cy.paso(20, 'Intentar abrir el catálogo sin sesión: debe redirigir al login')
    cy.visit('/cliente/catalogo')
    cy.location('pathname').should('eq', '/cliente/login')
    cy.get('h2').should('have.text', 'Iniciar Sesión')
  })
})
