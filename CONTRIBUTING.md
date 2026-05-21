# Contributing

This project is prepared for a small 2-person team. Keep changes small and easy to review.

## Branch Naming

Use short, descriptive branch names:

```text
feature/mon-hoc-crud
feature/sinh-vien-list
fix/sql-connection
docs/readme-update
```

## Commit Naming

Use clear commit messages:

```text
feat: add mon hoc list skeleton
fix: handle missing sql config
docs: update setup guide
chore: configure prettier
```

## Pull / Push Workflow

Before starting:

```bash
git checkout main
git pull origin main
git checkout -b feature/your-task
```

Before pushing:

```bash
npm run lint
npm run format:check
git status
git add .
git commit -m "feat: short message"
git push origin feature/your-task
```

Then open a Pull Request on GitHub.

## Avoiding Git Conflicts

- One person should own one module at a time.
- Do not reformat the whole project while working on a feature.
- Avoid changing shared files like `index.js`, `configs/modules.config.js`, and layout files unless needed.
- Pull latest `main` before starting a new task.
- If two people need the same file, agree on the edit boundary first.

## Project Rules

- Do not add auth, exam logic, scoring, or new database tables without team agreement.
- Keep code aligned with the existing Express + Pug + SQL Server structure.
- Use `THITRACNGHIEM.sql` as database source of truth.
