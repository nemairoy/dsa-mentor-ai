# Contributing

This is proprietary software owned solely by Nemai Roy, not an open-source project. Unsolicited code contributions are not accepted without prior written agreement from the owner. Opening an issue or pull request does not grant any license or ownership interest in the project.

## Workflow

1. Create a focused branch from current `main`.
2. Keep unrelated local changes out of the commit.
3. Follow the existing domain/application/infrastructure boundaries.
4. Add or update tests for behavior changes.
5. Open a pull request and wait for web, API, and Vercel preview checks.
6. Merge only after all required checks succeed.

## Local validation

```powershell
npm run validate:content
npm run validate:production
npm run lint:web
npm run build:web
$env:PYTHONPATH = "apps/api"
python -m unittest discover -s apps/api/tests -v
npm audit --audit-level=high
```

## Security rules

- Never commit `.env` files, OAuth downloads, database URLs, API keys, access tokens, private keys, or production logs.
- Use the checked-in environment examples and platform secret managers.
- Keep authentication and authorization checks in server routes even when the UI is protected.
- Do not run untrusted code in the web or API process; use Judge0.
- Avoid logging prompts, tokens, secrets, or personal profile data.

## Content changes

- Keep roadmap order in `content/roadmap.json`.
- Update the chapter metadata and matching Markdown lesson together.
- Regenerate derived search/AI maps when the generator owns them.
- Run `npm run validate:content` before committing.

## Commit and pull-request quality

- Use a concise outcome-focused commit subject.
- Explain the root cause and verification commands in the pull request.
- Include screenshots for visible UI changes when they do not expose personal data.
- Document migrations, environment additions, and rollback implications.
