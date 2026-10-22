# Génesis Fashion – Pruebas E2E con Cypress

Automatización de 3 casos de prueba sobre el frontend de **Génesis Fashion** (React + Vite + Tailwind),
elaborada para el PPI de Quinto semestre – Tecnológico de Antioquia.

| Caso | URL (mismo dominio `localhost:5173`) | Pasos | Archivo |
|---|---|---|---|
| TC-WEB-01 – Login de empleados | `/login` | 14 | `cypress/e2e/01_login_empleado.cy.ts` |
| TC-WEB-02 – Registro de usuarios | `/registro` | 18 | `cypress/e2e/02_registro_cliente.cy.ts` |
| TC-WEB-03 – Portal de clientes | `/cliente/login` | 20 | `cypress/e2e/03_login_cliente_catalogo.cy.ts` |

## Requisitos
- Node.js 18 o superior
- El frontend corriendo: en la carpeta `genesis-frontend` ejecutar `npm run dev` (puerto 5173 por defecto)

## Instalación y ejecución
```bash
npm install            # instala Cypress (descarga el binario la primera vez)

npm run cy:open        # modo interactivo (recomendado para la sustentación)
npm run cy:run         # los 3 casos en modo headless
npm run cy:run:login   # solo TC-WEB-01
npm run cy:run:registro
npm run cy:run:cliente
```

Si el frontend corre en otro puerto, cambiar `baseUrl` en `cypress.config.ts`.

## Cambio requerido en el frontend
El caso 3 valida un menú desplegable de usuario. Reemplazar en el frontend el archivo
`genesis-frontend/src/pages/clientes/ClienteLayout.tsx` por el que está en `frontend/ClienteLayout.tsx` de este repositorio.

## Configuración importante
- **Título esperado** (`env.TITULO_ESPERADO` en `cypress.config.ts`): debe ser igual al `<title>` de
  `genesis-frontend/index.html`. Si lo cambias en el frontend, cámbialo también aquí.
- **Backend simulado:** las pruebas usan `cy.intercept()` para las llamadas a `http://localhost:8080/api`.
  Así son repetibles, no dependen de la base de datos ni de credenciales reales y no crean usuarios.
  El backend no necesita estar encendido.

## Condiciones cubiertas
| Condición | TC-WEB-01 | TC-WEB-02 | TC-WEB-03 |
|---|:-:|:-:|:-:|
| Comandos de acción (`type`, `click`, `select`, `clear`, `visit`) | ✔ | ✔ | ✔ |
| Aserciones de texto | ✔ | ✔ | ✔ |
| Aserciones de elementos presentes (imágenes, botones, inputs, enlaces) | ✔ | ✔ | ✔ |
| Aserción de título | ✔ | ✔ | ✔ |
| Aserción de URL | ✔ | ✔ | ✔ |
| Aserciones de estilos CSS (font, color, background, border-radius…) | ✔ | ✔ | ✔ |
| Menú de navegación / listas desplegables (`select`) | ✔ (menú lateral) | ✔ (2 selects) | ✔ (menú desplegable de usuario) |
| Formulario con mensaje exitoso / no exitoso / autenticación | ✔ | ✔ | ✔ |

## Estructura
```
cypress/
  e2e/       3 specs (un caso de prueba por archivo)
  support/   comandos personalizados (paso, shouldHaveColor, stubCors) y datos de prueba
frontend/    ClienteLayout.tsx con el menú desplegable (copiar al proyecto genesis-frontend)
testrail/    genesis_casos_testrail.csv  → importar en TestRail (plantilla "Test Case (Text)")
cypress.config.ts
```

## Subir a GitHub
```bash
git init
git add .
git commit -m "Pruebas E2E con Cypress - Génesis Fashion"
git branch -M main
git remote add origin https://github.com/<usuario>/genesis-cypress.git
git push -u origin main
```
