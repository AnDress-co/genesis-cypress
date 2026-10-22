import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    // URL donde corre el frontend de Génesis Fashion (npm run dev en genesis-frontend)
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 6000,
    env: {
      // <title> esperado de la página. Debe coincidir con el <title> de genesis-frontend/index.html
      TITULO_ESPERADO: 'genesis-frontend',
    },
  },
})
