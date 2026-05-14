# Move to AI - Setup, reset et demarrage
# Usage : .\setup.ps1          -> setup complet + seed test + dev
#         .\setup.ps1 -Reset   -> clean + reseed sans reinstaller
#         .\setup.ps1 -NoSeed  -> setup sans seed (donnees demo prod)
#         .\setup.ps1 -NoDev   -> setup complet sans lancer npm run dev

param (
  [switch]$Reset,
  [switch]$NoSeed,
  [switch]$NoDev
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Move to AI - Setup and Reset"                        -ForegroundColor Cyan
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# -- Mode Reset rapide -------------------------------------------------
if ($Reset) {
  Write-Host "Mode Reset - clean + reseed uniquement" -ForegroundColor Magenta
  Write-Host ""
  Write-Host "[1/2] Nettoyage des donnees de test..." -ForegroundColor Yellow
  npm run db:seed:clean
  Write-Host "[2/2] Seed des donnees de test..." -ForegroundColor Yellow
  npm run db:seed:test
  Write-Host ""
  Write-Host "Reset termine." -ForegroundColor Green
  Write-Host ""
  Write-Host "  Comptes de test  ->  voir docs/test-accounts.md"
  Write-Host "  Mot de passe     ->  Test1234!"
  Write-Host ""
  if (-not $NoDev) {
    Write-Host "Demarrage du serveur de developpement..." -ForegroundColor Cyan
    Write-Host ""
    npm run dev
  }
  exit 0
}

# -- Setup complet -----------------------------------------------------

# 1. Dependances
if (-not (Test-Path "node_modules")) {
  Write-Host "[1/6] Installation des dependances..." -ForegroundColor Yellow
  npm install
} else {
  Write-Host "[1/6] Dependances deja installees - ignore." -ForegroundColor Green
}

# 2. Fichier .env
if (-not (Test-Path ".env")) {
  Write-Host "[2/6] Creation du .env depuis .env.example..." -ForegroundColor Yellow
  Copy-Item ".env.example" ".env"
  Write-Host "      Verifiez .env et renseignez AUTH_SECRET / ANTHROPIC_API_KEY." -ForegroundColor DarkYellow
} else {
  Write-Host "[2/6] .env existant - ignore." -ForegroundColor Green
}

# 3. MySQL via Docker
Write-Host "[3/6] Demarrage du conteneur MySQL..." -ForegroundColor Yellow

docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Host ""
  Write-Host "  Docker Desktop n'est pas lance." -ForegroundColor Red
  Write-Host "  Demarrez Docker Desktop puis relancez ce script." -ForegroundColor Red
  Write-Host ""
  exit 1
}

docker compose up -d mysql

Write-Host "     Attente que MySQL soit pret..." -ForegroundColor Yellow
$ready    = $false
$attempts = 0
while (-not $ready -and $attempts -lt 30) {
  Start-Sleep -Seconds 2
  docker compose exec mysql mysqladmin ping -h localhost -uroot -proot --silent 2>$null
  if ($LASTEXITCODE -eq 0) { $ready = $true }
  $attempts++
}
if (-not $ready) {
  Write-Host "  MySQL ne repond pas apres 60s. Verifiez Docker." -ForegroundColor Red
  exit 1
}
Write-Host "     MySQL pret." -ForegroundColor Green

# 4. Schema Prisma
Write-Host "[4/6] Push du schema Prisma..." -ForegroundColor Yellow
npm run prisma:push

# 5. Seed
if (-not $NoSeed) {
  Write-Host "[5/6] Seed des donnees de test..." -ForegroundColor Yellow
  npm run db:seed:test
} else {
  Write-Host "[5/6] Seed donnees demo (prod)..." -ForegroundColor Yellow
  npm run db:seed
}

# 6. Recapitulatif
Write-Host ""
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  Setup termine !"                                      -ForegroundColor Green
Write-Host ""
Write-Host "  Comptes de test  ->  docs/test-accounts.md"
Write-Host "  Mot de passe     ->  Test1234!"
Write-Host ""
Write-Host "  Commandes utiles :"
Write-Host "    npm run db:seed:reset   reset complet (clean + seed)"
Write-Host "    npm run db:seed:clean   nettoyage seul"
Write-Host "    npx prisma studio       GUI base de donnees"
Write-Host "======================================================" -ForegroundColor Cyan
Write-Host ""

# 6 bis. Demarrage dev
if (-not $NoDev) {
  Write-Host "[6/6] Demarrage du serveur de developpement..." -ForegroundColor Yellow
  Write-Host "      http://localhost:3000" -ForegroundColor Green
  Write-Host "      (Ctrl+C pour arreter)" -ForegroundColor DarkGray
  Write-Host ""
  npm run dev
} else {
  Write-Host "[6/6] -NoDev active - serveur non demarre." -ForegroundColor DarkGray
  Write-Host "      Lancez manuellement : npm run dev"
  Write-Host ""
}
