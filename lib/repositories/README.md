# Repositories

Couche d'accès à la base de données. Chaque repository encapsule les requêtes Prisma pour une entité.

## Règles
- Import `"server-only"` en tête de chaque fichier
- Toujours scoper par `workspaceId` pour l'isolation multi-tenant
- Retourner des types Prisma natifs (pas de transformation)
- Pas de logique métier ici — uniquement des requêtes DB

## Usage
```typescript
import { certificationRepo } from "@/lib/repositories/certification.repo";
const certs = await certificationRepo.findByWorkspace(workspaceId);
```
