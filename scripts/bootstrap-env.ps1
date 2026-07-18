$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$authFile = Join-Path $root "GoogleAuth.txt"

if (-not (Test-Path $authFile)) {
    throw "GoogleAuth.txt was not found at project root."
}

$content = Get-Content $authFile -Raw

function Get-MatchValue {
    param(
        [string] $Pattern,
        [string] $Name
    )

    $match = [regex]::Match($content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::IgnoreCase)
    if (-not $match.Success) {
        throw "Could not parse $Name from GoogleAuth.txt"
    }

    return $match.Groups[1].Value.Trim()
}

$googleClientId = Get-MatchValue 'Client ID\s*-\s*"?([^"\r\n]+)"?' "GOOGLE_CLIENT_ID"
$googleClientSecret = Get-MatchValue 'Client secret ID\s*-\s*"?([^"\r\n]+)"?' "GOOGLE_CLIENT_SECRET"
$betterAuthSecret = Get-MatchValue 'BETTER_AUTH_SECRET\s*=\s*([^\r\n]+)' "BETTER_AUTH_SECRET"
$appUrl = Get-MatchValue 'NEXTAUTH_URL\s*=\s*([^\r\n]+)' "NEXTAUTH_URL"
$databaseUrl = Get-MatchValue 'Database URL\s*-\s*([^\r\n]+)' "DATABASE_URL"
$geminiKeys = [regex]::Matches($content, '^\s*\d+\.\s*"([^"]+)"', [System.Text.RegularExpressions.RegexOptions]::Multiline)

$webEnv = @"
BETTER_AUTH_SECRET=$betterAuthSecret
BETTER_AUTH_URL=$appUrl
NEXT_PUBLIC_APP_URL=$appUrl
GOOGLE_CLIENT_ID=$googleClientId
GOOGLE_CLIENT_SECRET=$googleClientSecret
DATABASE_URL=$databaseUrl
DATABASE_SSL=true
API_BASE_URL=http://localhost:8000
CODE_EXECUTION_PROVIDER=judge0
JUDGE0_BASE_URL=https://ce.judge0.com
JUDGE0_API_KEY=
JUDGE0_RAPIDAPI_HOST=
JUDGE0_PYTHON_LANGUAGE_ID=71
JUDGE0_JAVA_LANGUAGE_ID=62
JUDGE0_CPP_LANGUAGE_ID=54
"@

for ($i = 0; $i -lt [Math]::Min(4, $geminiKeys.Count); $i++) {
    $webEnv += "`nGEMINI_API_KEY_$($i + 1)=$($geminiKeys[$i].Groups[1].Value)"
}

$apiEnv = @"
APP_NAME=DSA Mentor AI API
APP_ENV=development
API_HOST=0.0.0.0
API_PORT=8000
BACKEND_CORS_ORIGINS=$appUrl
DATABASE_URL=$databaseUrl
DATABASE_SSL=true
GEMINI_MODEL=gemini-2.5-flash-lite
AI_TIMEOUT_SECONDS=30
AI_MAX_RETRIES=2
CONTENT_ROOT=content
CHROMA_PERSIST_DIR=data/chroma
CHROMA_COLLECTION=dsa_knowledge_base
RAG_CHUNK_SIZE=1400
RAG_CHUNK_OVERLAP=180
RAG_TOP_K=6
RAG_SCORE_THRESHOLD=0.25
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
"@

for ($i = 0; $i -lt [Math]::Min(4, $geminiKeys.Count); $i++) {
    $apiEnv += "`nGEMINI_API_KEY_$($i + 1)=$($geminiKeys[$i].Groups[1].Value)"
}

$webEnvPath = Join-Path $root "apps/web/.env.local"
$apiEnvPath = Join-Path $root "apps/api/.env"

Set-Content -Path $webEnvPath -Value $webEnv -Encoding UTF8
Set-Content -Path $apiEnvPath -Value $apiEnv -Encoding UTF8

Write-Output "Generated apps/web/.env.local and apps/api/.env from GoogleAuth.txt"
