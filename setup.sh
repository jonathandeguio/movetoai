#!/usr/bin/env bash
set -e

echo ""
echo "==============================="
echo "  Move to AI — Setup & Reset"
echo "==============================="
echo ""

# 1. Dependencies
if [ ! -d "node_modules" ]; then
  echo "[1/5] Installing dependencies..."
  npm install
else
  echo "[1/5] Dependencies already installed — skipping."
fi

# 2. Environment file
if [ ! -f ".env" ]; then
  echo "[2/5] Creating .env from .env.example..."
  cp .env.example .env
  echo "      ⚠  Review .env and set AUTH_SECRET / NEXTAUTH_SECRET before going to production."
else
  echo "[2/5] .env already exists — skipping."
fi

# 3. MySQL via Docker
echo "[3/5] Starting MySQL container..."
docker compose up -d mysql

echo "      Waiting for MySQL to be healthy..."
until docker compose exec mysql mysqladmin ping -h localhost -uroot -proot --silent 2>/dev/null; do
  sleep 2
done
echo "      MySQL is ready."

# 4. Prisma schema
echo "[4/5] Pushing Prisma schema..."
npm run prisma:push

# 5. Seed
echo "[5/5] Seeding demo data..."
npm run db:seed

echo ""
echo "==============================="
echo "  Setup complete!"
echo ""
echo "  Run the app:  npm run dev"
echo "  URL:          http://localhost:3000"
echo ""
echo "  Demo login:   admin@movetoai.app"
echo "  Password:     MoveToAI!2026"
echo "==============================="
echo ""
