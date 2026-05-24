-- LGPD (princípio da minimização — art. 6º, III): remove o campo CPF
-- da tabela User. O CPF nunca foi utilizado para integração externa
-- (pagamento, nota fiscal) — servia apenas como identificação interna
-- redundante (já temos id UUID e e-mail único).
ALTER TABLE "User" DROP COLUMN IF EXISTS "cpf";
