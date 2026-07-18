# Backup and Recovery

## Database Backup

Use managed Supabase backups or `pg_dump`:

```powershell
pg_dump "$env:DATABASE_URL" > backup.sql
```

## Database Restore

```powershell
psql "$env:DATABASE_URL" < backup.sql
```

## Knowledge Base Rebuild

```powershell
npm run content:generate
npm run content:index
npm run validate:content
```

## ChromaDB Rebuild

```powershell
Invoke-RestMethod -Method Post http://localhost:8000/api/v1/rag/index/rebuild
```

## Search Index Rebuild

```powershell
npm run content:index
```

