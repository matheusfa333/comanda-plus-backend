-- Papel CAIXA foi incorporado ao GERENTE
UPDATE "user" SET role = 'GERENTE' WHERE role = 'CAIXA';
-- Mesas já ocupadas: registra o horário de abertura (pelo primeiro pedido ativo, ou agora)
UPDATE "table" t SET "openedAt" = COALESCE(
  (SELECT MIN(o."createdAt") FROM "order" o WHERE o."tableId" = t.id AND o.status IN ('PENDING','PREPARING','READY','DELIVERED')),
  t."updatedAt")
WHERE t.status = 'OCCUPIED' AND t."openedAt" IS NULL;
