-- AlterTable
ALTER TABLE "facturas" ADD COLUMN "monto_efectivo" REAL;
ALTER TABLE "facturas" ADD COLUMN "monto_transferencia" REAL;
ALTER TABLE "facturas" ADD COLUMN "referencia_transferencia" TEXT;
