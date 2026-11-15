import { db } from "./db";

export async function audit(
  actorId: string | null,
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
) {
  await db.auditLog.create({ data: { actorId, action, entity, entityId, details } });
}
