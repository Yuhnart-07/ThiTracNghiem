# Thi Trac Nghiem

Node.js + Express + Pug scaffold for a SQL Server based multiple-choice exam project.

The current codebase is a clean foundation after:

- Phase 1: SQL Server scaffold and old-domain cleanup
- Phase 1.5: public script/asset cleanup
- Phase 2: module structure skeleton based on `THITRACNGHIEM.sql`

No real auth, exam generation, scoring, or full CRUD has been implemented yet.

## Tech Stack

- Node.js
- Express
- Pug
- SQL Server
- `mssql`
- ESLint + Prettier

## Installation

```bash
npm install
```

## Environment Setup

Create a local `.env` file from `.env.example`:

```bash
copy .env.example .env
```

Fill in local SQL Server values:

```env
PORT=3000
DB_SERVER=localhost
DB_PORT=1433
DB_DATABASE=THITRACNGHIEM
DB_USER=
DB_PASSWORD=
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true
```

Never commit `.env`.

## Run Project

```bash
npm start
```

Main paths:

- Client home: `http://localhost:3000/`
- Exam skeleton: `http://localhost:3000/thi`
- Admin dashboard: `http://localhost:3000/admin/dashboard`

## Folder Structure

```text
configs/      Shared configuration, database config, module metadata
controllers/  Express controller handlers
models/       SQL table metadata and data-access foundation
routes/       Admin/client route definitions
views/        Pug layouts, pages, partials, mixins
public/       Static CSS, JS, images
docs/         Project notes and module map
```

## Git Workflow

1. Pull latest `main` before starting work.
2. Create a feature branch, for example `feature/mon-hoc-crud`.
3. Commit small, focused changes.
4. Push your branch.
5. Open a Pull Request and ask teammate to review.
6. Merge only after review and conflict check.

## Coding Rules

- Do not change database schema unless the team agrees.
- Keep modules aligned with `THITRACNGHIEM.sql`.
- Do not mix unrelated modules in one commit.
- Avoid moving folders or renaming routes without discussion.
- Keep controller/model/view changes scoped to the module being worked on.
- Run checks before pushing:

```bash
npm run lint
npm run format:check
```
