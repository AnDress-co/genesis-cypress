/// <reference types="cypress" />
import { CORS } from '../support/datos'

/**
 * TC-WEB-02 | URL: /registro | RF-09 (Registro de nuevos clientes)
 * Selector de tipo de cuenta, código interno de empleados, listas desplegables,
 * formulario de registro con error de validación, error del servidor y registro exitoso.
 */
describe('TC-WEB-02 - Registro de usuarios (/registro)', () => {
  const TITULO = Cypress.env('TITULO_ESPERADO') as string
  const CLAVE = 'Genesis#2026'

  beforeEach(() => {
    cy.clearLocalStorage()
    cy.stubCors()
  })

  it('valida el selector de cuenta, las listas desplegables y el formulario de registro de cliente', () => {
    // alias para comprobar que NO se envía nada cuando la validación local falla
    cy.intercept({ method: 'POST', pathname: '/api/auth/registro/cliente' }, { statusCode: 500, body: {}, headers: CORS }).as('registroSinUso')

    // ── 1. Navegación, URL y título ──────────────────────────────────
    cy.paso(1, 'Abrir la página /registro')
    cy.visit('/registro')

    cy.paso(2, 'Validar URL y título de la página')
    cy.url().should('eq', `${Cypress.config('baseUrl')}/registro`)
    cy.title().should('eq', TITULO)

    // ── 2. Textos ────────────────────────────────────────────────────
    cy.paso(3, 'Validar los textos del selector de tipo de cuenta')
    cy.get('h1').should('have.text', 'GENESIS')
    cy.contains('p', 'Crear cuenta nueva').should('be.visible')
    cy.get('h2').should('have.text', '¿Cómo deseas registrarte?')
    cy.contains('p', 'Selecciona el tipo de cuenta').should('be.visible')
    cy.contains('p', 'Quiero comprar productos Genesis').should('be.visible')
    cy.contains('p', 'Pertenezco al equipo Genesis').should('be.visible')

    // ── 3. Elementos presentes ───────────────────────────────────────
    cy.paso(4, 'Validar elementos presentes: botones de tipo de cuenta y enlace a login')
    cy.contains('button', 'Soy Cliente').should('be.visible').and('be.enabled')
    cy.contains('button', 'Soy Empleado').should('be.visible').and('be.enabled')
    cy.contains('a', 'Iniciar sesión').should('have.attr', 'href', '/login')

    // ── 4. CSS ───────────────────────────────────────────────────────
    cy.paso(5, 'Validar estilos CSS de títulos, tarjeta y botones')
    cy.get('h1').should('have.css', 'font-size', '36px').and('have.css', 'font-weight', '900')
    cy.get('h2')
      .should('have.css', 'font-size', '20px')
      .and('have.css', 'font-weight', '700')
      .and('have.css', 'color', 'rgb(255, 255, 255)')
    cy.get('h1').closest('.min-h-screen').shouldHaveColor('background-color', 'var(--color-gray-950)')
    cy.contains('button', 'Soy Cliente')
      .should('have.css', 'border-radius', '12px')
      .and('have.css', 'padding', '16px')
      .and('have.css', 'text-align', 'left')
      .shouldHaveColor('background-color', 'var(--color-gray-800)')

    // ── 5. Flujo empleado: código interno ────────────────────────────
    cy.paso(6, 'Elegir "Soy Empleado" y validar que se solicita el código interno')
    cy.contains('button', 'Soy Empleado').click()
    cy.get('h2').should('have.text', 'Código interno requerido')
    cy.contains('p', 'Acceso para Empleados').should('be.visible')

    cy.paso(7, 'Ingresar un código incorrecto y validar el mensaje de error')
    cy.get('input[type="password"]').should('have.attr', 'placeholder', '••••••••••').type('CODIGO-MALO')
    cy.contains('button', 'Verificar código').click()
    cy.contains('div', 'Código interno incorrecto').should('be.visible').shouldHaveColor('color', 'var(--color-red-400)')

    cy.paso(8, 'Volver al selector de tipo de cuenta')
    cy.contains('button', '←').click()
    cy.get('h2').should('have.text', '¿Cómo deseas registrarte?')

    // ── 6. Flujo cliente: formulario y listas desplegables ───────────
    cy.paso(9, 'Elegir "Soy Cliente" y validar el encabezado del formulario')
    cy.contains('button', 'Soy Cliente').click()
    cy.contains('p', 'Registro — Cliente').should('be.visible')
    cy.get('h2').should('have.text', 'Crear cuenta de Cliente')
    cy.contains('button', '← Volver').should('be.visible')
    cy.contains('button', 'Crear cuenta').should('be.visible').and('be.enabled')

    cy.paso(10, 'Validar las opciones de la lista desplegable "Tipo de documento"')
    cy.get('select[name="tipoDocumento"]').should('have.value', 'CC')
    cy.get('select[name="tipoDocumento"] option').should('have.length', 4).then(($op) => {
      expect($op.map((_, o) => o.textContent).get()).to.deep.equal([
        'Cédula de Ciudadanía',
        'Tarjeta de Identidad',
        'Cédula Extranjera',
        'Pasaporte',
      ])
      expect($op.map((_, o) => (o as HTMLOptionElement).value).get()).to.deep.equal(['CC', 'TI', 'CE', 'PP'])
    })

    cy.paso(11, 'Validar las opciones de la lista desplegable "Género"')
    cy.get('select[name="genero"] option').should('have.length', 4).then(($op) => {
      expect($op.map((_, o) => o.textContent).get()).to.deep.equal(['Seleccionar', 'Masculino', 'Femenino', 'Otro'])
    })

    cy.paso(12, 'Seleccionar opciones en ambas listas desplegables')
    cy.get('select[name="tipoDocumento"]').select('Tarjeta de Identidad').should('have.value', 'TI')
    cy.get('select[name="genero"]').select('Femenino').should('have.value', 'F')

    cy.paso(13, 'Llenar el formulario con datos válidos y contraseñas distintas')
    cy.get('input[name="documento"]').type('1020304050')
    cy.get('input[name="primerNombre"]').type('Laura')
    cy.get('input[name="segundoNombre"]').type('Camila')
    cy.get('input[name="primerApellido"]').type('Gómez')
    cy.get('input[name="segundoApellido"]').type('Ríos')
    cy.get('input[name="fechaNacimiento"]').type('2000-05-17')
    cy.get('input[name="telefono"]').type('3001234567')
    cy.get('input[name="correo"]').type('laura.gomez@correo.com')
    cy.get('input[name="password"]').type(CLAVE)
    cy.get('input[name="confirmarPassword"]').type('Otra#2026')

    // ── 7. Registro NO exitoso (validación local) ────────────────────
    cy.paso(14, 'Enviar con contraseñas distintas: debe mostrar error y no llamar al servidor')
    cy.contains('button', 'Crear cuenta').click()
    cy.contains('div', 'Las contraseñas no coinciden').should('be.visible')
    cy.get('@registroSinUso.all').should('have.length', 0)

    // ── 8. Registro NO exitoso (error del servidor) ──────────────────
    cy.paso(15, 'Corregir la confirmación y simular que el servidor rechaza el correo ya registrado')
    cy.intercept({ method: 'POST', pathname: '/api/auth/registro/cliente' }, { statusCode: 409, body: { message: 'El correo ya está registrado' }, headers: CORS }).as('registroDuplicado')
    cy.get('input[name="confirmarPassword"]').clear().type(CLAVE)
    cy.contains('button', 'Crear cuenta').click()
    cy.wait('@registroDuplicado')
    cy.contains('div', 'El correo ya está registrado').should('be.visible')
    cy.get('input[name="correo"]').should('have.value', 'laura.gomez@correo.com') // el formulario conserva los datos

    // ── 9. Registro exitoso ──────────────────────────────────────────
    cy.paso(16, 'Reenviar el formulario con el servidor aceptando el registro')
    cy.intercept({ method: 'POST', pathname: '/api/auth/registro/cliente' }, { statusCode: 201, body: {}, headers: CORS }).as('registroOk')
    cy.contains('button', 'Crear cuenta').click()
    cy.wait('@registroOk').its('request.body').should((body) => {
      expect(body).to.include({
        tipoDocumento: 'TI',
        documento: '1020304050',
        primerNombre: 'Laura',
        segundoNombre: 'Camila',
        primerApellido: 'Gómez',
        segundoApellido: 'Ríos',
        fechaNacimiento: '2000-05-17',
        genero: 'F',
        telefono: '3001234567',
        correo: 'laura.gomez@correo.com',
        password: CLAVE,
      })
      expect(body).not.to.have.property('confirmarPassword')
    })

    cy.paso(17, 'Validar la pantalla de registro exitoso (textos, icono y estilos)')
    cy.get('h2').should('have.text', '¡Registro exitoso!')
    cy.contains('p', 'Tu cuenta ha sido creada. Ya puedes iniciar sesión.').should('be.visible')
    cy.contains('span', '✓').parent().shouldHaveColor('background-color', 'var(--color-green-600)')
    cy.contains('button', 'Ir a Iniciar Sesión').should('be.visible')
    cy.title().should('eq', TITULO)

    cy.paso(18, 'Ir a iniciar sesión y validar la URL final')
    cy.contains('button', 'Ir a Iniciar Sesión').click()
    cy.location('pathname').should('eq', '/login')
    cy.get('h2').should('have.text', 'Iniciar Sesión')
  })
})
