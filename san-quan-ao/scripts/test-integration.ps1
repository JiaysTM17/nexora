$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
$env:TEST_DATABASE_URL = 'postgresql://mac:mac_local_only@172.25.112.184:54320/mac_test?schema=public'
$previousDatabaseUrl = $env:DATABASE_URL
try {
  $env:DATABASE_URL = $env:TEST_DATABASE_URL
  pnpm db:migrate
  if ($LASTEXITCODE -ne 0) { throw 'Test migration failed' }
  pnpm test:integration
  if ($LASTEXITCODE -ne 0) { throw 'Integration tests failed' }
} finally {
  $env:DATABASE_URL = $previousDatabaseUrl
}
