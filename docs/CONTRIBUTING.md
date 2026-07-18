# Contribution Guide

## Rules

- Do not hardcode secrets.
- Keep architecture boundaries.
- Add content through `content/` and generators.
- Add backend logic behind services and repositories.
- Run validation before submitting changes.

## Validation

```powershell
npm run validate:content
npm run validate:production
npm run lint:web
npm run build:web
```

