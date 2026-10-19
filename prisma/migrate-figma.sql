-- Migração prévia (preserva dados) antes do `prisma db push`
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS username TEXT;
UPDATE "user" SET username = lower(replace(name, ' ', '')) WHERE username IS NULL;
ALTER TABLE "table" ALTER COLUMN number TYPE TEXT USING number::text;
