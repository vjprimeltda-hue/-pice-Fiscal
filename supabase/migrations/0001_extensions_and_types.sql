-- ============================================================================
-- 0001_extensions_and_types.sql
-- Extensions and shared enum types for the Ápice Fiscal SaaS.
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- Roles inside the application (not to be confused with Postgres roles).
create type public.app_role as enum ('aluno', 'admin');

-- Types of downloadable study material.
create type public.material_type as enum ('pdf', 'mapa-mental', 'resumo', 'lei', 'exercicios');

-- Question difficulty.
create type public.question_difficulty as enum ('facil', 'medio', 'dificil');

-- Agenda/calendar event type.
create type public.event_type as enum ('estudo', 'revisao', 'simulado', 'prova', 'outro');

-- Favoritable content kinds.
create type public.favorite_content_type as enum ('video', 'pdf', 'exercicio', 'mapa-mental');

-- Recent-activity kinds (mirrors favorite kinds + simulado/questoes).
create type public.activity_type as enum ('video', 'pdf', 'simulado', 'questoes');

-- Billing subscription status (mirrors Mercado Pago preapproval states).
create type public.subscription_status as enum (
  'pending',
  'authorized',
  'active',
  'paused',
  'cancelled',
  'expired'
);

-- Payment status (mirrors Mercado Pago payment states).
create type public.payment_status as enum (
  'pending',
  'approved',
  'authorized',
  'in_process',
  'in_mediation',
  'rejected',
  'cancelled',
  'refunded',
  'charged_back'
);

create type public.billing_interval as enum ('monthly', 'quarterly', 'yearly');
