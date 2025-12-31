-- ==============================================
-- SCRIPT DE CONFIGURAÇÃO GERAL - COLONIA Z8
-- ==============================================

-- 1. Limpeza (Opcional - remove tabela antiga se existir para recriar do zero)
DROP TABLE IF EXISTS bookings;

-- 2. Criação da Tabela de Agendamentos
CREATE TABLE public.bookings (
    id text NOT NULL PRIMARY KEY,
    name text NOT NULL,
    cpf text NOT NULL,
    phone text,
    service_type text NOT NULL CHECK (service_type IN ('DAE', 'SEGURO')),
    zone text NOT NULL CHECK (zone IN ('RURAL', 'URBANA')),
    date text NOT NULL, -- Formato YYYY-MM-DD
    time text NOT NULL, -- Formato HH:MM
    status text NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'CONCLUIDO', 'CANCELADO')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Habilitar Segurança em Nível de Linha (RLS)
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ==============================================
-- POLÍTICAS DE SEGURANÇA (PERMISSÕES)
-- ==============================================

-- A. PERMISSÃO DE LEITURA (SELECT)
-- Permite que o painel admin (e o app) leiam os dados.
-- Importante: Para "Esqueci meu agendamento" funcionar, anon precisa ler.
CREATE POLICY "Permitir Leitura Publica" ON public.bookings
    FOR SELECT
    USING (true);

-- B. PERMISSÃO DE CRIAÇÃO (INSERT)
-- Permite que qualquer pessoa (anonima) crie um agendamento.
CREATE POLICY "Permitir Criacao Publica" ON public.bookings
    FOR INSERT
    WITH CHECK (true);

-- C. PERMISSÃO DE ATUALIZAÇÃO (UPDATE)
-- Apenas usuários logados (Admins) podem alterar status ou editar.
CREATE POLICY "Permitir Atualizacao Apenas Admins" ON public.bookings
    FOR UPDATE
    USING (auth.role() = 'authenticated');

-- D. PERMISSÃO DE EXCLUSÃO (DELETE)
-- Apenas usuários logados (Admins) podem deletar.
CREATE POLICY "Permitir Exclusao Apenas Admins" ON public.bookings
    FOR DELETE
    USING (auth.role() = 'authenticated');

-- ==============================================
-- CRIAÇÃO DE USUÁRIOS ADMIN (TABELA OPCIONAL)
-- ==============================================
-- Opcional: Se quisermos persistir configs no futuro.
CREATE TABLE IF NOT EXISTS public.app_settings (
    key text PRIMARY KEY,
    value jsonb
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins Podem Gerenciar Settings" ON public.app_settings
    FOR ALL
    USING (auth.role() = 'authenticated');
