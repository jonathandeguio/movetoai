# Services

Logique métier construite sur les repositories. Les services orchestrent les repositories
et contiennent les règles métier (calculs, transformations, validations).

## Règles
- Import `"server-only"` en tête
- Utiliser les repositories — jamais Prisma directement
- Retourner des view models ou DTOs prêts pour l'UI
- Les Server Actions et Server Components appellent les services

## Usage
```typescript
import { complianceService } from "@/lib/services/compliance.service";
const summary = await complianceService.getSummary(workspaceId);
```
