/// <reference types="cypress" />
import { CORS, EMPLEADO_ADMIN, DASHBOARD } from '../support/datos'

/**
 * TC-WEB-01 | URL: /login | RF-03 (Gestión de usuarios por roles) | CU-03
 * Inicio de sesión de empleados: contenido, estilos, validación del formulario,
 * autenticación NO exitosa, autenticación exitosa y menú de navegación por rol.
 */
describe('TC-WEB-01 - Login de empleados (/login)', () => {
  const TITULO = Cypress.env('TITULO_ESPERADO') as string
  const CORREO = 'admin@genesis.com'
  const CLAVE_MALA = 'ClaveEquivocada1!'
  const CLAVE_OK = 'Genesis#2026ok'

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.stubCors()
    // Backend simulado: aislamos la prueba de la base de datos y de credenciales reales
    cy.intercept({ method: 'GET', pathname: '/api/dashboard' }, { statusCode: 200, body: DASHBOARD, headers: CORS })
    cy.intercept({ method: 'GET', pathname: '/api/dashboard/pedidos-por-estado' }, { statusCode: 200, body: [{ estado: 'Confirmado', cantidad: 4 }], headers: CORS })
    cy.intercept({ method: 'GET', pathname: '/api/dashboard/stock-bajo' }, { statusCode: 200, body: [], headers: CORS })
  })

  it('valida la pantalla de login, rechaza credenciales inválidas y permite el acceso con credenciales válidas', () => {
    // ── 1. Navegación ────────────────────────────────────────────────
    cy.paso(1, 'Abrir la página /login')
    cy.visit('/login')

    // ── 2. URL y título ──────────────────────────────────────────────
    cy.paso(2, 'Validar que la URL sea la esperada')
    cy.url().should('eq', `${Cypress.config('baseUrl')}/login`)
    cy.location('pathname').should('eq', '/login')

    cy.paso(3, 'Validar que el título de la página sea el esperado')
    cy.title().should('eq', TITULO)

    // ── 3. Aserciones de texto ───────────────────────────────────────
    cy.paso(4, 'Validar los textos visibles de la pantalla')
    cy.get('h1').should('have.text', 'GENESIS')
    cy.contains('p', 'Sistema Administrativo — Ropa Urbana').should('be.visible')
    cy.get('h2').should('have.text', 'Iniciar Sesión')
    cy.contains('label', 'Correo electrónico').should('be.visible')
    cy.contains('label', 'Contraseña').should('be.visible')
    cy.contains('¿No tienes cuenta?').should('be.visible')
    cy.contains('Genesis S.A.S © 2026 — Bello, Antioquia').should('be.visible')

    // ── 4. Aserciones de elementos presentes ─────────────────────────
    cy.paso(5, 'Validar elementos presentes: logo, inputs, botón y enlace de registro')
    cy.contains('span', /^G$/).should('be.visible')
    cy.get('input[type="email"]')
      .should('be.visible')
      .and('have.attr', 'placeholder', 'correo@genesis.com')
      .and('have.attr', 'required')
    cy.get('input[type="password"]')
      .should('be.visible')
      .and('have.attr', 'placeholder', '••••••••')
      .and('have.attr', 'required')
    cy.get('button[type="submit"]').should('be.visible').and('be.enabled').and('contain.text', 'Iniciar Sesión')
    cy.contains('a', 'Regístrate aquí').should('have.attr', 'href', '/registro')

    // ── 5. Aserciones de estilos CSS ─────────────────────────────────
    cy.paso(6, 'Validar estilos CSS: tipografía, colores, fondo, bordes')
    cy.get('h1')
      .should('have.css', 'font-size', '36px')
      .and('have.css', 'font-weight', '900')
      .and('have.css', 'text-align', 'center')
      .and('have.css', 'color', 'rgb(255, 255, 255)')
    cy.get('h1').invoke('css', 'font-family').should('contain', 'sans-serif')
    cy.get('h1').closest('.min-h-screen').shouldHaveColor('background-color', 'var(--color-gray-950)')
    cy.contains('h2', 'Iniciar Sesión').parent()
      .should('have.css', 'border-radius', '16px')
      .and('have.css', 'padding', '32px')
      .shouldHaveColor('background-color', 'var(--color-gray-900)')
    cy.get('button[type="submit"]')
      .should('have.css', 'font-size', '14px')
      .and('have.css', 'font-weight', '600')
      .and('have.css', 'border-radius', '8px')
      .and('have.css', 'color', 'rgb(255, 255, 255)')
      .shouldHaveColor('background-color', 'var(--color-indigo-600)')

    // ── 6. Acciones + validación nativa del formulario ───────────────
    cy.paso(7, 'Escribir un correo con formato inválido y enviar: el navegador debe bloquear el envío')
    cy.get('input[type="email"]').type('usuario-sin-arroba')
    cy.get('input[type="password"]').type(CLAVE_MALA)
    cy.get('button[type="submit"]').click()
    cy.get('input[type="email"]').then(($i) => {
      expect(($i[0] as HTMLInputElement).checkValidity(), 'checkValidity del correo').to.be.false
    })
    cy.location('pathname').should('eq', '/login')

    // ── 7. Autenticación NO exitosa ──────────────────────────────────
    cy.paso(8, 'Enviar credenciales incorrectas y validar el mensaje de error')
    cy.intercept({ method: 'POST', pathname: '/api/auth/login' }, { statusCode: 401, body: {}, headers: CORS }).as('loginFallido')
    cy.get('input[type="email"]').clear().type(CORREO)
    cy.get('input[type="password"]').clear().type(CLAVE_MALA)
    cy.get('button[type="submit"]').click()
    cy.wait('@loginFallido').its('request.body').should('deep.equal', { username: CORREO, password: CLAVE_MALA })
    cy.contains('div', 'Correo o contraseña incorrectos').should('be.visible').shouldHaveColor('color', 'var(--color-red-400)')
    cy.location('pathname').should('eq', '/login')

    cy.paso(9, 'Editar un campo y comprobar que el mensaje de error desaparece')
    cy.get('input[type="password"]').type('x')
    cy.contains('Correo o contraseña incorrectos').should('not.exist')

    // ── 8. Autenticación exitosa ─────────────────────────────────────
    cy.paso(10, 'Enviar credenciales válidas y validar la redirección al Dashboard')
    cy.intercept({ method: 'POST', pathname: '/api/auth/login' }, { statusCode: 200, body: EMPLEADO_ADMIN, headers: CORS }).as('loginExitoso')
    cy.get('input[type="password"]').clear().type(CLAVE_OK)
    cy.get('button[type="submit"]').click()
    cy.wait('@loginExitoso').its('request.body').should('deep.equal', { username: CORREO, password: CLAVE_OK })
    cy.location('pathname').should('eq', '/')
    cy.title().should('eq', TITULO)
    cy.get('main h1').should('have.text', 'Dashboard')

    // ── 9. Menú de navegación (lista de opciones) ────────────────────
    cy.paso(11, 'Validar el menú de navegación lateral para el rol Administrador (7 opciones)')
    const opciones = [
      ['Dashboard', '/'],
      ['Productos', '/productos'],
      ['Categorías', '/categorias'],
      ['Inventario', '/inventario'],
      ['Clientes', '/clientes'],
      ['Pedidos', '/pedidos'],
      ['Empleados', '/empleados'],
    ]
    cy.get('aside nav a').should('have.length', opciones.length)
    opciones.forEach(([texto, ruta]) => {
      cy.get('aside nav').contains('a', texto).should('be.visible').and('have.attr', 'href', ruta)
    })
    cy.get('aside nav a').first().shouldHaveColor('background-color', 'var(--color-indigo-600)') // opción activa

    cy.paso(12, 'Validar el nombre y el rol del usuario autenticado')
    cy.get('aside').should('contain.text', EMPLEADO_ADMIN.nombreCompleto).and('contain.text', 'Administrador')
    cy.contains('button', 'Cambiar Contraseña').should('be.visible')

    cy.paso(13, 'Validar que la sesión quedó guardada en el navegador')
    cy.window().its('localStorage').invoke('getItem', 'token').should('eq', EMPLEADO_ADMIN.token)

    // ── 10. Cierre de sesión ─────────────────────────────────────────
    cy.paso(14, 'Cerrar sesión y validar el regreso a /login')
    cy.contains('button', 'Cerrar Sesión').click()
    cy.location('pathname').should('eq', '/login')
    cy.window().its('localStorage').invoke('getItem', 'token').should('be.null')
    cy.get('h2').should('have.text', 'Iniciar Sesión')
  })
})
