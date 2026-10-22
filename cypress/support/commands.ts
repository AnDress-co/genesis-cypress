/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /** Deja un paso numerado en el Command Log (útil en la sustentación). */
      paso(numero: number, descripcion: string): Chainable<void>
      /**
       * Valida una propiedad CSS de color comparando contra un valor esperado
       * (ej. 'var(--color-indigo-600)' o 'rgb(255, 255, 255)').
       * El esperado se normaliza con el mismo navegador, por lo que funciona
       * aunque Tailwind v4 publique los colores en oklch().
       */
      shouldHaveColor(
        propiedad: string,
        esperado: string
      ): Chainable<JQuery<HTMLElement>>
      /** Responde los preflight CORS hacia el backend simulado. */
      stubCors(): Chainable<void>
    }
  }
}

Cypress.Commands.add('paso', (numero: number, descripcion: string) => {
  cy.log(`**Paso ${numero}:** ${descripcion}`)
})

Cypress.Commands.add(
  'shouldHaveColor',
  { prevSubject: 'element' },
  (subject: JQuery<HTMLElement>, propiedad: string, esperado: string) => {
    return cy.wrap(subject, { log: false }).should(($el) => {
      const el = $el[0]
      const doc = el.ownerDocument
      const win = doc.defaultView as Window
      const sonda = doc.createElement('div')
      sonda.style.setProperty(propiedad, esperado)
      doc.body.appendChild(sonda)
      const esperadoCalculado = win.getComputedStyle(sonda).getPropertyValue(propiedad)
      sonda.remove()
      const actual = win.getComputedStyle(el).getPropertyValue(propiedad)
      expect(actual, `${propiedad} de <${el.tagName.toLowerCase()}>`).to.eq(esperadoCalculado)
    })
  }
)

Cypress.Commands.add('stubCors', () => {
  cy.intercept('OPTIONS', '**/api/**', {
    statusCode: 204,
    headers: {
      'access-control-allow-origin': '*',
      'access-control-allow-headers': '*',
      'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
    },
  })
})

export {}
