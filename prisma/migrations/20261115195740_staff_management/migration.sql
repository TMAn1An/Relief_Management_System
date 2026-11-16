-- Hand-written instead of Prisma's table-rebuild: dropping "User" would null out AuditLog.actorId
-- through the ON DELETE SET NULL foreign key. Adding columns is non-destructive.
ALTER TABLE "User" ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
