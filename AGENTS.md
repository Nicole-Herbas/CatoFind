# CatoFind — Supabase Migration with Clean Architecture and Strict TDD

You are a senior software engineer working on the existing CatoFind project.

Repository: https://github.com/Nicole-Herbas/CatoFind

## 1. Main objective

Migrate CatoFind from in-memory data and localStorage persistence to a real PostgreSQL database hosted on Supabase.

Implement a Node.js + Express backend using the existing JavaScript ecosystem.

The existing frontend must continue working while its data sources are progressively replaced by real backend requests.

**IMPORTANT: Do not start coding yet. Your first task is to analyze the current repository, identify the affected functionality, and prepare a detailed, incremental implementation plan for my approval.**

## 2. Resolve the database requirements

The original user story mentions both PostgreSQL and MySQL. This is a contradiction.

The confirmed architectural decision is:

- Database: PostgreSQL.
- Provider: Supabase.
- Backend: Node.js + Express.
- Testing: Jest.
- Language: JavaScript, consistent with the existing project.

Do not install or configure MySQL.

Use version-controlled SQL migrations compatible with Supabase.

Use the existing Supabase connection only after verifying the project and the target environment.

Never create or modify tables in a production database without explicit approval.

## 3. Mandatory architecture

Follow Clean Architecture principles using simple, readable JavaScript.

Use these layers where appropriate:

- **Models:** domain entities and business concepts.
- **DTOs:** request and response contracts.
- **Repositories:** database access and persistence.
- **Services:** business rules and application use cases.
- **Controllers:** HTTP request and response handling.
- **Routes:** Express endpoint definitions.
- **Enums/constants:** shared valid states and business values.
- **Database migrations:** schema definitions and constraints.

Keep responsibilities separated.

Controllers must not execute SQL directly.

Services must not depend on Express request or response objects.

Repositories must not contain presentation logic.

Avoid unnecessary classes, interfaces, factories, abstractions, dependencies, or design patterns.

Reuse existing project conventions when they are appropriate.

Do not use TypeScript or introduce an ORM without explaining the need and obtaining approval.

## 4. Strict Test-Driven Development

TDD IS MANDATORY.

Every small behavior must follow:

### RED
1. Identify one small behavior.
2. Write its Jest test first.
3. Run only the relevant test.
4. Verify that it fails for the expected reason.
5. Record the test result.
6. Create a small test commit.

### GREEN
1. Write the minimum production code required.
2. Run the same test.
3. Verify that it passes.
4. Create a small implementation commit.

### REFACTOR
1. Improve readability if necessary.
2. Do not change externally observable behavior.
3. Run the relevant tests again.
4. Commit refactoring separately when it makes a meaningful change.

Never write production code before its corresponding test.

Never claim RED if you have not observed a failing test.

Never claim GREEN if you have not observed a passing test.

Use meaningful commit messages such as:

- test: define object persistence behavior
- feat: implement object repository save
- test: define published objects endpoint
- feat: implement published objects endpoint
- refactor: simplify object mapping

Commits should represent small, understandable steps.

Do not combine multiple unrelated functionalities in one commit.

A RED commit may temporarily fail on the feature branch, but never submit a failing branch as ready to merge.

Do not push or merge without my approval.

## 5. Required implementation approach

Before implementation, inspect the relevant existing files and identify every current data source.

Pay particular attention to:

- src/app/core/data/datosIniciales.js
- src/app/features/inicio/services/ObjetoService.js
- src/app/features/auth/services/UsuarioService.js
- src/app/features/recoveryRequest/pages/presenter.js
- Existing tests
- Existing models
- Existing package scripts and Git hooks

Identify other affected files using targeted searches.

Do not invent fields or database relationships that are not supported by the user story, the class diagram, or the existing domain.

The required tables are:

- usuario
- objeto
- reporte
- solicitud_recuperacion

The reporte entity must support:

- PERDIDO / ENCONTRADO
- Date
- Location
- Contact information
- PENDIENTE / APROBADO / RECHAZADO / CERRADO
- Rejection reason
- Review date
- Relationships with usuario and objeto

Do not assume the complete schema until the class diagram and existing domain have been inspected.

Preserve the business mapping:

APROBADO in persistence corresponds to "Publicado" in the existing application where appropriate.

The implementation must include GET /api/objetos to retrieve published objects.

Do not expose pending or rejected objects in public results.

## 6. Preserve existing functionality

Do not rewrite the frontend unnecessarily.

Migrate one feature at a time.

Existing object examples, categories, places, login flows, registration flows, and recovery request forms must be reviewed before changing their data source.

Preserve existing behavior unless a requirement explicitly changes it.

Do not delete the existing mock data until its replacement is verified.

Do not treat localStorage as a permanent source of truth after migration.

Do not store passwords in plaintext.

Do not move privileged Supabase credentials to frontend code.

## 7. Questions and decision management

If information is missing, ambiguous, or contradictory, STOP before the affected implementation step.

Ask a question in Spanish using this exact format:

**Question ID:** Q-001

**What I need to know:** Explain the decision in simple Spanish.

**Why I am asking:** Explain which functionality or architectural decision depends on it.

**Recommended option:** Explain the safest and simplest option.

**Alternatives:** Explain any reasonable alternatives and their consequences.

**Your answer (optional):** [The user may provide additional instructions or context.]

Do not require the optional answer field to be filled.

Never assume that a recommendation has been approved.

Persist every question in docs/decisions/questions.md with its ID, context, options, decision, and current status.

Use the states OPEN, ANSWERED, and BLOCKED.

When the user answers, update the existing question rather than creating a duplicate.

Before resuming, read unresolved questions and previous decisions.

If a question blocks only one task, you may propose continuing with independent tasks, but wait for approval.

Do not repeatedly ask questions that have already been answered.

## 8. Persistent execution plan

Create and maintain:

- docs/plans/supabase-migration.md
- docs/decisions/questions.md
- docs/progress/supabase-migration.md

The plan must contain small, independently testable tasks.

Each task must document:

- Task ID
- Purpose
- Affected files
- Acceptance criteria
- Required test
- RED evidence
- GREEN evidence
- Commit references
- Status
- Dependencies

Use these statuses:

NOT STARTED, RED, GREEN, VERIFIED, BLOCKED.

Update progress after each completed task.

Never mark a task VERIFIED without a successful test.

Read this progress file when resuming work instead of analyzing the whole repository again.

## 9. Context and token efficiency

Do not repeatedly inspect files that have not changed.

Do not repeatedly execute successful checks without a reason.

Use targeted searches rather than reading the entire repository.

Run focused Jest tests during development.

Run broader regression checks at meaningful checkpoints.

Reuse previously established findings.

Avoid long, repetitive explanations.

If the approved plan becomes invalid, explain the exact reason before proposing a modification.

## 10. Security requirements

- Use environment variables for database connectivity.
- Never commit .env files.
- Provide .env.example without real secrets.
- Never expose privileged Supabase keys to the browser.
- Validate and sanitize incoming data.
- Use parameterized queries or a safe database client.
- Handle database failures without exposing credentials or internal details.
- Keep access controls enforced on the server.
- Create indexes, foreign keys, constraints, and migrations where needed.
- Do not perform destructive database operations without approval.
- Use isolated test data and never run destructive tests against production.

## 11. Git workflow

Create a dedicated branch for this user story after confirming the repository state.

Never work directly on main.

Before creating the branch, inspect:

- Current branch
- Uncommitted changes
- Existing migration-related work

Never discard existing user changes.

Commit only the files related to the current small task.

Do not modify unrelated functionality.

Do not push, merge, or delete branches without approval.

## 12. Final acceptance criteria

The migration is complete only when:

1. The Supabase PostgreSQL schema has the required tables and relationships.
2. SQL migrations are version-controlled.
3. Seed data includes an administrator, a student, and the required object examples.
4. Express connects securely to Supabase/PostgreSQL.
5. GET /api/objetos returns only approved published objects.
6. Existing affected screens consume the appropriate persistent data.
7. Data remains available after page refresh and application restart.
8. Relevant Jest tests pass.
9. README explains setup, migrations, environment variables, tests, and startup.
10. No secrets are committed.
11. Existing working behavior remains intact.
12. All completed tasks have traceable commits.

## 13. What you must do NOW

This is a planning-only request.

Do not modify files.
Do not execute migrations.
Do not create database tables.
Do not create commits yet.

First:

1. Inspect the relevant repository structure.
2. Identify the existing in-memory and localStorage implementations.
3. Identify dependencies between existing screens.
4. Identify schema ambiguities using the class diagram if available.
5. Review the existing Jest, TDD, Husky and commit workflow.
6. Propose the smallest reasonable Clean Architecture structure.
7. Propose the complete RED → GREEN → REFACTOR task sequence.
8. Identify any blocking questions.
9. Show me the plan in Spanish.

Wait for my approval before making any changes.

**Your primary objective is correct, maintainable, human-readable code with complete TDD traceability — not generating the largest amount of code or finishing tasks as quickly as possible.**
## Acuerdos de trabajo vigentes

Estas reglas precisan las secciones TDD y Git anteriores:

- Mantener datos persistentes en Supabase. No guardar sesiones ni reportes en `localStorage` o `sessionStorage`.
- El frontend solo presenta pantallas y usa adaptadores HTTP en `src/app/api/`. La autenticacion, autorizacion, validacion de negocio y persistencia viven en `backend/`.
- Para cada comportamiento, escribir primero una prueba enfocada, observar RED, implementar lo minimo y repetir la misma prueba hasta GREEN. Registrar RED/GREEN; no crear commits con pruebas fallidas ni commits de prueba separados que rompan la rama.
- Hacer commits semanticos en espanol (`feat:`, `fix:`, `refactor:`, `test:`) despues de GREEN. Cada commit funcional debe tener entre 500 y 1000 lineas propias; excluir documentos y registros generados. Si una rebanada queda corta, agrupar solo cambios relacionados; nunca agregar relleno.
- Preferir nombres de variables que expliquen su contenido o proposito. Extraer una funcion o constante cuando la misma regla se repita; no crear abstracciones para un unico uso sencillo.
- Ejecutar pruebas focalizadas durante RED/GREEN y una regresion pertinente al cerrar el trabajo. No repetir suites exitosas sin un cambio que lo justifique.
- No publicar ni fusionar cambios a `main` sin autorizacion expresa.

## Plan de cliente HTTP compartido

En la rama `feat/cliente-http-compartido`, basada en `origin/main` actualizado:

1. Crear pruebas RED para `src/app/core/api/apiCliente.js`: JSON exitoso, red, HTTP con mensaje y respuesta 204.
2. Implementar el cliente con base `/api`, cookies del mismo origen, JSON y fetch inyectable.
3. Migrar `objetos.js`, `autenticacion.js`, `reportes.js` y `solicitudes.js`, preservando sus contratos y mensajes; conectar Buscar mediante `obtenerObjetos` con sus filtros.
4. Documentar el mapa pantalla/repositorio en README y mantener intactos los cambios locales preexistentes.
5. Ejecutar pruebas enfocadas RED/GREEN, luego `npm test` y `npm run build`; no incluir endpoints pendientes de aprobacion de solicitudes.

Criterios de aceptacion: no quedan llamadas `fetch` directas en presenters; las pantallas conservan sus respuestas y errores; todas las pruebas y el build pasan.
