--
-- PostgreSQL database dump
--

\restrict rZqLupR5dfuDvgvmLo8EPdF1OVuimtwYHqANeKWZShjEsd0lOa5gIkCIbaeRFdn

-- Dumped from database version 18.2 (Postgres.app)
-- Dumped by pg_dump version 18.2 (Postgres.app)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."WeeklyPlan" DROP CONSTRAINT IF EXISTS "WeeklyPlan_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."WeeklyPlanItem" DROP CONSTRAINT IF EXISTS "WeeklyPlanItem_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."WeeklyPlanItem" DROP CONSTRAINT IF EXISTS "WeeklyPlanItem_studyLogId_fkey";
ALTER TABLE IF EXISTS ONLY public."WeeklyPlanItem" DROP CONSTRAINT IF EXISTS "WeeklyPlanItem_planId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserSubject" DROP CONSTRAINT IF EXISTS "UserSubject_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserSubject" DROP CONSTRAINT IF EXISTS "UserSubject_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserConcurso" DROP CONSTRAINT IF EXISTS "UserConcurso_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserConcurso" DROP CONSTRAINT IF EXISTS "UserConcurso_concursoId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudyLog" DROP CONSTRAINT IF EXISTS "StudyLog_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudyLog" DROP CONSTRAINT IF EXISTS "StudyLog_subjectId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudyLog" DROP CONSTRAINT IF EXISTS "StudyLog_contentId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudyLogHistory" DROP CONSTRAINT IF EXISTS "StudyLogHistory_studyLogId_fkey";
ALTER TABLE IF EXISTS ONLY public."StudyLogHistory" DROP CONSTRAINT IF EXISTS "StudyLogHistory_changedById_fkey";
ALTER TABLE IF EXISTS ONLY public."MentorshipLink" DROP CONSTRAINT IF EXISTS "MentorshipLink_studentId_fkey";
ALTER TABLE IF EXISTS ONLY public."MentorshipLink" DROP CONSTRAINT IF EXISTS "MentorshipLink_mentorId_fkey";
ALTER TABLE IF EXISTS ONLY public."Content" DROP CONSTRAINT IF EXISTS "Content_subjectId_fkey";
DROP INDEX IF EXISTS public."WeeklyPlan_userId_startDate_key";
DROP INDEX IF EXISTS public."WeeklyPlan_userId_idx";
DROP INDEX IF EXISTS public."WeeklyPlanItem_subjectId_idx";
DROP INDEX IF EXISTS public."WeeklyPlanItem_studyLogId_key";
DROP INDEX IF EXISTS public."WeeklyPlanItem_planId_idx";
DROP INDEX IF EXISTS public."User_email_key";
DROP INDEX IF EXISTS public."UserSubject_userId_subjectId_key";
DROP INDEX IF EXISTS public."UserConcurso_userId_concursoId_key";
DROP INDEX IF EXISTS public."StudyLog_userId_idx";
DROP INDEX IF EXISTS public."StudyLog_date_idx";
DROP INDEX IF EXISTS public."StudyLogHistory_studyLogId_idx";
DROP INDEX IF EXISTS public."StudyLogHistory_changedById_idx";
DROP INDEX IF EXISTS public."MentorshipLink_studentId_key";
DROP INDEX IF EXISTS public."MentorshipLink_studentId_idx";
DROP INDEX IF EXISTS public."MentorshipLink_mentorId_idx";
DROP INDEX IF EXISTS public."Content_subjectId_idx";
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."WeeklyPlan" DROP CONSTRAINT IF EXISTS "WeeklyPlan_pkey";
ALTER TABLE IF EXISTS ONLY public."WeeklyPlanItem" DROP CONSTRAINT IF EXISTS "WeeklyPlanItem_pkey";
ALTER TABLE IF EXISTS ONLY public."User" DROP CONSTRAINT IF EXISTS "User_pkey";
ALTER TABLE IF EXISTS ONLY public."UserSubject" DROP CONSTRAINT IF EXISTS "UserSubject_pkey";
ALTER TABLE IF EXISTS ONLY public."UserConcurso" DROP CONSTRAINT IF EXISTS "UserConcurso_pkey";
ALTER TABLE IF EXISTS ONLY public."Subject" DROP CONSTRAINT IF EXISTS "Subject_pkey";
ALTER TABLE IF EXISTS ONLY public."StudyLog" DROP CONSTRAINT IF EXISTS "StudyLog_pkey";
ALTER TABLE IF EXISTS ONLY public."StudyLogHistory" DROP CONSTRAINT IF EXISTS "StudyLogHistory_pkey";
ALTER TABLE IF EXISTS ONLY public."Plan" DROP CONSTRAINT IF EXISTS "Plan_pkey";
ALTER TABLE IF EXISTS ONLY public."MethodItem" DROP CONSTRAINT IF EXISTS "MethodItem_pkey";
ALTER TABLE IF EXISTS ONLY public."MentorshipLink" DROP CONSTRAINT IF EXISTS "MentorshipLink_pkey";
ALTER TABLE IF EXISTS ONLY public."FeaturedStudent" DROP CONSTRAINT IF EXISTS "FeaturedStudent_pkey";
ALTER TABLE IF EXISTS ONLY public."Content" DROP CONSTRAINT IF EXISTS "Content_pkey";
ALTER TABLE IF EXISTS ONLY public."Concurso" DROP CONSTRAINT IF EXISTS "Concurso_pkey";
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."WeeklyPlanItem";
DROP TABLE IF EXISTS public."WeeklyPlan";
DROP TABLE IF EXISTS public."UserSubject";
DROP TABLE IF EXISTS public."UserConcurso";
DROP TABLE IF EXISTS public."User";
DROP TABLE IF EXISTS public."Subject";
DROP TABLE IF EXISTS public."StudyLogHistory";
DROP TABLE IF EXISTS public."StudyLog";
DROP TABLE IF EXISTS public."Plan";
DROP TABLE IF EXISTS public."MethodItem";
DROP TABLE IF EXISTS public."MentorshipLink";
DROP TABLE IF EXISTS public."FeaturedStudent";
DROP TABLE IF EXISTS public."Content";
DROP TABLE IF EXISTS public."Concurso";
DROP TYPE IF EXISTS public."Role";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'STUDENT',
    'MENTOR'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Concurso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Concurso" (
    id text NOT NULL,
    name text NOT NULL,
    description character varying(2048),
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Content; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Content" (
    id text NOT NULL,
    name text NOT NULL,
    "subjectId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    description character varying(2048)
);


--
-- Name: FeaturedStudent; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."FeaturedStudent" (
    id text NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    "imageUrl" text NOT NULL,
    quote text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MentorshipLink; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MentorshipLink" (
    id text NOT NULL,
    "mentorId" text NOT NULL,
    "studentId" text NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: MethodItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MethodItem" (
    id text NOT NULL,
    step text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    icon text NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: Plan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Plan" (
    id text NOT NULL,
    title text NOT NULL,
    description text,
    price double precision NOT NULL,
    "oldPrice" double precision,
    installments text,
    features text[],
    "whatsappMessage" text,
    highlighted boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "order" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: StudyLog; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudyLog" (
    id text NOT NULL,
    "userId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    "hoursStudied" double precision NOT NULL,
    "questionsAnswered" integer NOT NULL,
    "correctAnswers" integer NOT NULL,
    topic text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "contentId" text,
    "subjectId" text NOT NULL
);


--
-- Name: StudyLogHistory; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StudyLogHistory" (
    id text NOT NULL,
    "studyLogId" text NOT NULL,
    "previousValues" jsonb NOT NULL,
    "newValues" jsonb NOT NULL,
    "changedById" text NOT NULL,
    "changedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: Subject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Subject" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    active boolean DEFAULT true NOT NULL,
    description character varying(2048)
);


--
-- Name: User; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."User" (
    id text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    role public."Role" DEFAULT 'STUDENT'::public."Role" NOT NULL,
    phone text,
    cpf text,
    "birthDate" timestamp(3) without time zone,
    "targetExam" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "addressCity" text,
    "addressState" text,
    "dailyHours" integer,
    "educationLevel" text
);


--
-- Name: UserConcurso; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserConcurso" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "concursoId" text NOT NULL
);


--
-- Name: UserSubject; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserSubject" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "subjectId" text NOT NULL
);


--
-- Name: WeeklyPlan; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WeeklyPlan" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "startDate" timestamp(3) without time zone NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- Name: WeeklyPlanItem; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."WeeklyPlanItem" (
    id text NOT NULL,
    "planId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "blockIndex" integer NOT NULL,
    "subjectId" text,
    content text,
    "durationMinutes" integer,
    notes text,
    "questionsDone" integer,
    "correctCount" integer,
    completed boolean DEFAULT false NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "studyLogId" text
);


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Data for Name: Concurso; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Concurso" (id, name, description, active, "createdAt", "updatedAt") FROM stdin;
cmlu4acxi000ucbtkpm4jzxjo	Policia Penal do Tocantins		t	2026-02-19 23:53:46.231	2026-02-21 12:57:41.464
cmlwbqjgi0000cb8rtoozftjx	Polícia Militar do Maranhão		t	2026-02-21 12:57:50.85	2026-02-21 12:57:50.85
cmlwbqupz0001cb8r8y99wkjs	Polícia Civil do Maranhão		t	2026-02-21 12:58:05.447	2026-02-21 12:58:05.447
cmlwbr1u10002cb8rkqgh461r	Polícia Civil do Tocantins		t	2026-02-21 12:58:14.666	2026-02-21 12:58:14.666
\.


--
-- Data for Name: Content; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Content" (id, name, "subjectId", "createdAt", description) FROM stdin;
cmlscghp70001cbime67m9arz	Questões	cmlsbe6s60000cb1e7ptwu529	2026-02-18 18:06:56.923	Resolução de questões práticas
cmlscghpb0003cbimjpuoouy2	Questões	cmlsbe6sc0004cb1eol4zwzpb	2026-02-18 18:06:56.927	Resolução de questões práticas
cmlscghpc0005cbimbzs14aou	Questões	cmlsbe6sf0008cb1ex9y83irg	2026-02-18 18:06:56.929	Resolução de questões práticas
cmlscghpe0007cbim4ecjw5op	Questões	cmlsc203j0006cb9beqs6h0lu	2026-02-18 18:06:56.93	Resolução de questões práticas
cmlu7r3t00002cb3g38tokwng	Questões	cmlu7r3sw0000cb3g378fbed9	2026-02-20 01:30:46.405	Resolução de questões práticas e simulados
cmlu963vk000icbpdog0orsn0	Questões	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 02:10:25.952	Resolução de questões práticas e simulados
cmlv8a4vm000xcbpd9zbglu03	Questões	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 18:33:20.433	Resolução de questões práticas e simulados
cmlv8b1vo0010cbpditsmezt0	Questões	cmlv8b1vm000ycbpdujzca0wz	2026-02-20 18:34:03.205	Resolução de questões práticas e simulados
cmlv8c0ni0013cbpd8t4b35pn	Questões	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:34:48.271	Resolução de questões práticas e simulados
cmlv8c3o30016cbpdf8dt5mai	Questões	cmlv8c3nz0014cbpdjg341v8k	2026-02-20 18:34:52.179	Resolução de questões práticas e simulados
cmlv8fwt7001acbpdkruaf87v	Sintaxe do período simples	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:37:49.915	Sujeito, verbo e complemento.
cmlv8h5bi001ccbpdzsrj1csi	Sintaxe do período composto	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:38:47.598	Orações coordenadas e subordinadas.
cmlv8hjuq001ecbpd7qtmrq8v	Pontuação	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:39:06.434	Emprego de virgulas e outras pontuações.
cmlv8hra8001gcbpd95ao0tcm	Colocação Pronominal	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:39:16.065	
cmlv8hzfg001icbpdgmtlk5gj	Vozes verbais e funções do SE	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:39:26.62	
cmlv8i3ak001kcbpdbsr9khhp	Crase	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:39:31.629	
cmlv8ij6e001mcbpd81dsegp4	Concordância Nominal e Verbal	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:39:52.214	
cmlv8isi1001ocbpddgsdvz62	Regência Verbal e Nominal	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:40:04.297	
cmlv8j82g001qcbpdmuevo8s1	Estudo do Verbo	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:40:24.472	Conjungação, emprego e correlação verbal
cmlv8jinm001scbpdhjmzxk93	Processo de Formação de Palavras	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:40:38.195	
cmlv8jrin001ucbpdkai10heu	Ortografia e Acentuação Gráfica	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:40:49.679	
cmlv8f07x0018cbpdjgaxvnmp	Morfologia	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 18:37:07.573	Classes de Palavras
cmlv8luu2001wcbpdcoo99eir	Teoria da Constituição	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:42:27.237	
cmlv8mccf001ycbpdzens6gac	Princípios Fundamentais da República	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:42:49.983	Art. 1º ao 4º
cmlv8nxqx0020cbpdtl6wisif	Dos direitos e deveres individuais e coletivos 	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:44:04.377	Art. 5º
cmlv8qfzd0022cbpd81unh2ha	Dos direitos Sociais	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:46:01.321	Art. 6º ao 11
cmlv8qz0u0024cbpdpjjfexai	Da Nacionalidade	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:46:25.998	Art. 12 ao 13
cmlv8s5db0028cbpdtfu6qj9k	Dos partidos políticos	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:47:20.879	Art. 17
cmlv8rgpx0026cbpdvnzuheu0	Dos direitos políticos	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:46:48.933	Art. 14 ao 16
cmlv8tv9o002acbpdf4hw93ir	Da organização do Estado	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:48:41.044	Art. 18 ao 33
cmlv8ueik002ccbpdqkq4liyb	Da Intervenção	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:49:06.044	Art. 34 ao 36
cmlv8vf4r002ecbpdm0bv0bic	Da Administração Pública	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:49:53.499	Art. 37 ao 42
cmlv8xl0p002gcbpds6dc1jf9	Da Organização dos Poderes	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:51:34.441	Art. 44 ao 135
cmlv8yd2v002icbpdlbd963re	Da estado de defesa e de sítio	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:52:10.807	Art. 136 ao 141
cmlv8yuwk002kcbpd0gx6l6al	Das forças armadas	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:52:33.908	Art. 142 ao 143
cmlv8zasj002mcbpd3gnuvo6u	Da segurança pública	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:52:54.499	Art. 144
cmlv9173r002ocbpdqidf6xfv	Da ordem econômica e financeira 	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:54:22.976	Art. 170 ao 192
cmlv92ex4002qcbpdophz28yi	Da ordem social	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 18:55:19.81	Art. 193 ao 232
cmlv965ea002scbpd8xlau6of	Introdução ao Direito Penal	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 18:58:14.096	Conceito de Direito Penal\nFinalidades da pena\nFontes do Direito Penal\nPrincípios (legalidade, anterioridade, intervenção mínima, etc.)
cmlv96nwz002ucbpd0ybqcndi	Aplicação da Lei Penal	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 18:58:38.099	Lei penal no tempo\nLei penal no espaço\nConflito aparente de normas\nExtraterritorialidade
cmlv97f5f002wcbpdr4wgwgn8	Teoria do Crime - Fato Típico	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 18:59:13.395	Conduta\nResultado\nNexo causal\nTipicidade
cmlv97zvp002ycbpdhwqlw4il	Teoria do Crime - Ilicitude	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 18:59:40.21	Excludentes de ilicitude\nLegítima defesa\nEstado de necessidade\nEstrito cumprimento do dever legal\nExercício regular de direito
cmlv98f7e0030cbpdvt7fyh0i	Teoria do Crime - Culpabilidade	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:00:00.122	Imputabilidade\nPotencial consciência da ilicitude\nExigibilidade de conduta diversa
cmlv98rdf0032cbpd8fnl8pux	Concurso de Pessoas	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:00:15.891	Autoria e participação\nTeoria monista\nComunicação de circunstâncias
cmlv9utio005lcbpdk4p6psih	Geografia do Brasil	cmlv9qtk00053cbpdp4r95510	2026-02-20 19:17:25.104	
cmlv9uz1i005ncbpdrbdd4fwv	Geografia do Brasil	cmlsc203j0006cb9beqs6h0lu	2026-02-20 19:17:32.262	
cmlv9v4no005pcbpd5kehfu6q	Geografia do Tocantins	cmlsc203j0006cb9beqs6h0lu	2026-02-20 19:17:39.541	
cmlv9v9k2005rcbpdqn2tyetw	Geografia do Maranhão	cmlsc203j0006cb9beqs6h0lu	2026-02-20 19:17:45.891	
cmlv992rs0034cbpdrqszc8nt	Tentativa e Consumação	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:00:30.664	Iter criminis\nDesistência voluntária\nArrependimento eficaz\nCrime impossível
cmlv99ejo0036cbpdxsdzi8f9	Erro	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:00:45.924	Erro de tipo\nErro de proibição\nDescriminantes putativas
cmlv99pnx0038cbpd3flzrbu6	Concurso de Crimes	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:01:00.333	Concurso material\nConcurso formal\nCrime continuado
cmlv9a0o4003acbpdimz5u708	Penas	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:01:14.596	Espécies de pena\nAplicação da pena (dosimetria)\nRegimes de cumprimento\nSubstituição da pena
cmlv9abmn003ccbpdcqlsqcco	Extinção da Punibilidade	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:01:28.799	Prescrição\nAnistia\nGraça\nIndulto
cmlv9ayb2003ecbpd2317e0g3	Parte Especial - Crimes contra a Pessoa	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:01:58.19	Homicídio\nLesão corporal
cmlv9bad7003gcbpd23z32zhq	Parte Especial - Crimes contra o Patrimônio	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:02:13.819	Furto\nRoubo\nExtorsão\nEstelionato
cmlv9bnfh003icbpdw3mb0hch	Parte Especial - Crimes contra a Administração Pública	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:02:30.75	
cmlv9cn2d003kcbpd6002se8y	Revisão	cmlu963vh000gcbpdn5tsbr7f	2026-02-20 19:03:16.933	Revisão do conteúdo semanal
cmlv9crrf003mcbpdcwvo1yh0	Revisão	cmlsbe6sf0008cb1ex9y83irg	2026-02-20 19:03:23.02	Revisão do conteúdo semanal
cmlv9cxqe003ocbpdwso6j5ta	Revisão	cmlv8c0ng0011cbpdjsm6ixsm	2026-02-20 19:03:30.759	Revisão do conteúdo semanal
cmlv9e86v003qcbpdjoi85g1g	Introdução e Princípios	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:04:30.967	Conceito de Processo Pena\nSistemas processuais (inquisitivo, acusatório e misto)\nPrincípios constitucionais\nContraditório\nAmpla defesa\nDevido processo legal\nPresunção de inocência
cmlv9eicf003scbpd5hj836p3	Aplicação da Lei Processual Penal	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:04:44.073	Lei no tempo\nLei no espaço\nInterpretação da lei processual
cmlv9evnr003ucbpdyakhmo4u	Inquérito Policial	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:05:01.383	Conceito e finalidade\nNatureza jurídica\nCaracterísticas\nArquivamento\nIndiciamento\nValor probatório
cmlv9f7qx003wcbpdbtajjwdk	Ação Penal	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:05:17.049	Condições da ação\nAção penal pública\nAção penal privada\nRepresentação\nDecadência
cmlv9fjzq003ycbpdl088h7zh	Jurisdição e Competência	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:05:32.918	Competência material\nCompetência territorial\nConexão e continência\nPrerrogativa de função
cmlv9fub30040cbpdbpfgyhgf	Sujeitos do Processo	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:05:46.287	Juiz\nMinistério Público\nAcusado\nDefensor\nAssistente de acusação
cmlv9gazu0042cbpdjmqu66wp	Prisão e Medidas Cautelares	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:06:07.913	Prisão em flagrante\nPrisão preventiva\nPrisão temporária\nRelaxamento\nLiberdade provisória\nMedidas cautelares diversas da prisão
cmlv9gq6n0044cbpdl5k4yrvd	Provas	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:06:27.599	Teoria geral da prova\nProvas ilícitas\nCadeia de custódia\nProva testemunhal\nInterrogatório\nBusca e apreensão
cmlv9hbr60046cbpdyuzuu7dt	Procedimentos	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:06:55.554	Procedimento comum\nOrdinário\nSumário\nSumaríssimo\nProcedimentos especiais\nTribunal do Júri
cmlv9hyzg0048cbpdzodbbgt6	Sentença e Recursos	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:07:25.66	Sentença penal\nCoisa julgada\nRecursos em espécie\nApelação\nRESE\nEmbargos
cmlv9iare004acbpd20odxrvm	Nulidades	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:07:40.922	Nulidade absoluta\nNulidade relativa\nPrincípio do prejuízo
cmlv9jay2004ccbpdf2ml9acq	Revisão	cmlv8a4vi000vcbpd7ldvhkc9	2026-02-20 19:08:27.818	Revisão do conteúdo semanal
cmlv9kqz3004ecbpdcgv2p8eu	Introdução e Princípios	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:09:35.247	Conceito de Direito Administrativo\nRegime jurídico-administrativo\nPrincípios expressos e implícitos
cmlv9lf2q004gcbpdyhe3wurg	Organização Administrativa	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:10:06.427	Administração Direta\nAdministração Indireta\nAutarquias\nFundações públicas\nEmpresas públicas\nSociedades de economia mista\nDescentralização e desconcentração\nAgências reguladoras
cmlv9lwkt004icbpdkd5cj9bn	Poderes Administrativos	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:10:29.165	Poder vinculado\nPoder discricionário\nPoder hierárquico\nPoder disciplinar\nPoder regulamentar\nPoder de polícia
cmlv9mbjg004kcbpdtlfdeqd8	Atos Administrativos	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:10:48.556	Conceito\nRequisitos (competência, finalidade, forma, motivo, objeto)\nAtributos (presunção de legitimidade, imperatividade, autoexecutoriedade)\nAnulação\nRevogação\nConvalidação
cmlv9mwlo004mcbpdw7tzu9s0	Licitações e Contratos Administrativos	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:11:15.852	Lei nº 14.133/2021\nPrincípios da licitação\n\nModalidades\nDispensa e inexigibilidade\nFases do procedimento\nContratos administrativos
cmlv9n8ow004ocbpdewr7y09v	Agentes Públicos	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:11:31.52	Espécies de agentes públicos\nCargo, emprego e função\nConcurso público\nEstágio probatório\nEstabilidade\nProcesso administrativo disciplinar
cmlv9nkxs004qcbpdl13mavme	Responsabilidade Civil do Estado	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:11:47.392	Responsabilidade objetiva\nTeoria do risco administrativo\nExcludentes de responsabilidade\nDireito de regresso
cmlv9o0nv004scbpdbifpy0vu	Controle da Administração	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:12:07.772	Controle interno\nControle externo\nControle judicial\nTribunais de Contas\nAutotutela
cmlv9owqu004wcbpdesungf55	Revisão	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:12:49.35	Revisão do conteúdo semanal
cmlv9q581004ycbpds2ovgq6v	Revisão	cmlv8b1vm000ycbpdujzca0wz	2026-02-20 19:13:46.993	Revisão do conteúdo semanal
cmlv9qc970050cbpdxdl874h5	Revisão	cmlsc203j0006cb9beqs6h0lu	2026-02-20 19:13:56.107	Revisão do conteúdo semanal
cmlv9qfqa0052cbpdujo9800e	Revisão	cmlsbe6s60000cb1e7ptwu529	2026-02-20 19:14:00.61	Revisão do conteúdo semanal
cmlv9qtk20055cbpd423h3crf	Questões	cmlv9qtk00053cbpdp4r95510	2026-02-20 19:14:18.531	Resolução de questões práticas e simulados
cmlv9qxhe0057cbpdz7pcicyh	Revisão	cmlv9qtk00053cbpdp4r95510	2026-02-20 19:14:23.618	Revisão do conteúdo semanal
cmlv9rtl40059cbpd4f6c5v88	Lei nº 11.343/2006 - Tráfico de drogas	cmlv8b1vm000ycbpdujzca0wz	2026-02-20 19:15:05.224	
cmlv9scv7005bcbpdg1tacvag	Lei nº 8.072/1990 - crimes hediondos	cmlv8b1vm000ycbpdujzca0wz	2026-02-20 19:15:30.154	
cmlv9sqwj005dcbpdqcai3fa1	Lei nº 11.340/2006 - Lei Maria da penha	cmlv8b1vm000ycbpdujzca0wz	2026-02-20 19:15:48.403	
cmlv9ugrm005hcbpdxxopivem	Geografia do Tocantins	cmlv9qtk00053cbpdp4r95510	2026-02-20 19:17:08.578	
cmlv9unwn005jcbpdd6gyg356	Geografia do Maranhão	cmlv9qtk00053cbpdp4r95510	2026-02-20 19:17:17.832	
cmlv9oa83004ucbpdxb2aklp3	Improbidade Administrativa	cmlu7r3sw0000cb3g378fbed9	2026-02-20 19:12:20.163	Lei nº 8.429/1992\nAtos de improbidade\nSanções\nAlterações recentes
cmma0dg6m00018f3b6salrub2	Improbidade Administrativa	cmlsfzkhs0000cbhr4aepkex5	2026-03-03 02:48:30.764	Lei nº 8.429/1992\nAtos de improbidade\nSanções\nAlterações recentes
\.


--
-- Data for Name: FeaturedStudent; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."FeaturedStudent" (id, name, role, "imageUrl", quote, active, "order", "createdAt") FROM stdin;
cmlu6life0007cbucshljj9z7	Kelson Farias	Aprovado CFP PMTO 2025	/uploads/featured/1771549103841-add902b0-13d9-4993-893b-61798ce3582f.jpeg	A mentoria me ensinou a jogar o jogo dos grandes aprovados.	t	1	2026-02-20 00:58:25.803
cmlu6momw0008cbucaby6rc52	Weverton Farias	Aprovado CFP PMTO 2021	/uploads/featured/1771549159362-31f4adf7-3242-42a1-9e2a-4121532bc36d.jpeg	Disciplina não é esforço, é ter um plano que você confia 100%.	t	2	2026-02-20 00:59:20.504
cmlu6jloe0006cbucbhefg74n	Weverson Farias	Mentor\nProfessor de Língua Portuguesa e Redação \nAprovado CFO PMTO 2025 - dentro das vagas \nAprovado CFP PMTO 2021 - 1º lugar \nAprovado SEDUC 2023 - 1º lugar	/uploads/featured/1771548979855-768f60c0-37d9-4312-9b91-59f2310d8d11.jpeg	O método certo transforma o 'impossível' em algo inevitável.	f	0	2026-02-20 00:56:56.702
\.


--
-- Data for Name: MentorshipLink; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MentorshipLink" (id, "mentorId", "studentId", active, "createdAt") FROM stdin;
cmm6wtv07001h8fqe2bd8neff	fbacb428-eaa6-4b80-b81a-2a564412e5d0	6823540b-c18f-477a-b807-802deda531e9	t	2026-02-28 22:45:59.48
cmm7uk5g0000w8fj0hs0sbepu	fbacb428-eaa6-4b80-b81a-2a564412e5d0	575ecb40-5150-4a9c-b1b0-db571e61143a	t	2026-03-01 14:30:13.392
\.


--
-- Data for Name: MethodItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MethodItem" (id, step, title, description, icon, "order", active, "createdAt", "updatedAt") FROM stdin;
cmlu8zmz3000fcbpda639kki3	Passo 01	hora de agir	Acompanhamento e Sistema	Shield	0	t	2026-02-20 02:05:24.111	2026-02-20 02:06:29.401
\.


--
-- Data for Name: Plan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Plan" (id, title, description, price, "oldPrice", installments, features, "whatsappMessage", highlighted, active, "order", "createdAt", "updatedAt") FROM stdin;
cmlsbe6sm000ecb1evdvqr7sa	Mentoria 01	Acompanhamento e Software	189	\N	Pagamento Mensal	{"Software Operação 01","Ranking Nacional","Planilha de Horas Líquidas","Suporte Individual"}	Olá! Tenho interesse no plano Operação Mentoria 01 (R$ 189,00).	f	t	1	2026-02-18 17:37:09.862	2026-02-20 02:04:38.457
cmlsbe6sm000fcb1e65ozj4kg	Combo Total	Mentoria + Aulas de Português	289	378	Pagamento Mensal	{"Tudo do Plano Mentoria","Curso Português Completo","Curso de Redação Nota 1000","Mentor Weverson 24h","Acesso Vitalício aos Materiais"}	Olá! Quero garantir o Combo Mentoria + Aulas (R$ 289,00).	t	t	2	2026-02-18 17:37:09.862	2026-02-20 02:04:42.832
cmlsbe6sm000gcb1eansw7azw	Português + Redação	Foco em Conteúdo Base	189	\N	Pagamento Mensal	{"Videoaulas Teóricas","Correção de Redação","Material em PDF","Exercícios Gabaritados"}	Olá! Tenho interesse nas Aulas de Língua Portuguesa e Redação (R$ 189,00).	f	t	3	2026-02-18 17:37:09.862	2026-02-20 02:04:47.021
\.


--
-- Data for Name: StudyLog; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudyLog" (id, "userId", date, "hoursStudied", "questionsAnswered", "correctAnswers", topic, "createdAt", "contentId", "subjectId") FROM stdin;
cmlsfasuf0019cbcqyhsdrbkh	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-19 03:00:00	1	50	20	Questões	2026-02-18 19:26:30.279	cmlscghpe0007cbim4ecjw5op	cmlsc203j0006cb9beqs6h0lu
cmlsg6tpr001bcbcqritpb9ne	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-19 03:00:00	1	10	5	Questões	2026-02-18 19:51:24.4	cmlscghpc0005cbimbzs14aou	cmlsbe6sf0008cb1ex9y83irg
cmlsg6v8j001dcbcqybri0ucw	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-20 03:00:00	1	0	0	Thermodynamics	2026-02-18 19:51:26.371	\N	cmlsbe6sc0004cb1eol4zwzpb
cmlu0dzqo0001cbtkiwynzy0u	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-20 03:00:00	1	0	0	Thermodynamics	2026-02-19 22:04:37.296	\N	cmlsbe6sc0004cb1eol4zwzpb
cmlu0vi8k0003cbtkmkknov6l	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-19 03:00:00	1	50	30	Questões	2026-02-19 22:18:14.42	cmlscghpe0007cbim4ecjw5op	cmlsc203j0006cb9beqs6h0lu
cmlu46kwq0007cbtkjtzmrbn8	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-19 03:00:00	1	30	20	Questões	2026-02-19 23:50:49.946	cmlscghpc0005cbimbzs14aou	cmlsbe6sf0008cb1ex9y83irg
cmlu46qxv000bcbtkypjomo1d	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-21 03:00:00	1	0	0	Estudo Planificado	2026-02-19 23:50:57.764	\N	cmlsfzkhs0000cbhr4aepkex5
cmlu4fqnq0016cbtk8w90jolg	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-20 03:00:00	1	10	6	Questões	2026-02-19 23:57:57.302	cmlscghpe0007cbim4ecjw5op	cmlsc203j0006cb9beqs6h0lu
cmlu4h7mq001acbtknw0pm6ze	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-19 03:00:00	1	30	19	Questões	2026-02-19 23:59:05.954	cmlscghpc0005cbimbzs14aou	cmlsbe6sf0008cb1ex9y83irg
cmlu4hcq0001ccbtklxsh2t97	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-19 03:00:00	1	15	10	Questões	2026-02-19 23:59:12.553	cmlscghpe0007cbim4ecjw5op	cmlsc203j0006cb9beqs6h0lu
cmlu4he1u001ecbtkxphevpf4	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-20 03:00:00	1	0	0	Thermodynamics	2026-02-19 23:59:14.274	\N	cmlsbe6sc0004cb1eol4zwzpb
cmlu4hftb001gcbtkrgqml8s4	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-21 03:00:00	1	0	0	Estudo Planificado	2026-02-19 23:59:16.56	\N	cmlsfzkhs0000cbhr4aepkex5
cmlu9vm2q000scbpd0avvbadp	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-16 03:00:00	0.5	50	45	Questões	2026-02-20 02:30:15.938	cmlscghpb0003cbimjpuoouy2	cmlsbe6sc0004cb1eol4zwzpb
cmlvecc50000mcbons8t0fl7f	e0af36f5-a0ee-45bc-8c79-e650056d49b3	2026-02-17 03:00:00	1	0	0	Estudo Planificado	2026-02-20 21:23:00.853	\N	cmlsbe6sc0004cb1eol4zwzpb
cmlveenkg000ocbon5xmhontv	e0af36f5-a0ee-45bc-8c79-e650056d49b3	2026-02-18 03:00:00	1	30	23	Questões	2026-02-20 21:24:48.976	cmlscghpb0003cbimjpuoouy2	cmlsbe6sc0004cb1eol4zwzpb
cmlwdd93m00escb8rdj6ypk1b	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-15 03:00:00	1	0	0	Morfologia	2026-02-21 13:43:30.13	cmlv8f07x0018cbpdjgaxvnmp	cmlv8c0ng0011cbpdjsm6ixsm
cmlwddaet00eucb8rgxac7t11	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-15 03:00:00	1	0	0	Princípios Fundamentais da República	2026-02-21 13:43:31.829	cmlv8mccf001ycbpdzens6gac	cmlsbe6sf0008cb1ex9y83irg
cmlwddbrh00ewcb8r12doygck	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-16 03:00:00	1	0	0	Lei nº 11.343/2006 - Tráfico de drogas	2026-02-21 13:43:33.581	cmlv9rtl40059cbpd4f6c5v88	cmlv8b1vm000ycbpdujzca0wz
cmlwddg2l00ficb8rrqfyu630	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-16 03:00:00	1	30	22	Questões	2026-02-21 13:43:39.166	cmlscghpb0003cbimjpuoouy2	cmlsbe6sc0004cb1eol4zwzpb
cmlwddh0500fkcb8rlnkt34gg	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-16 03:00:00	1	0	0	Revisão	2026-02-21 13:43:40.374	cmlv9cxqe003ocbpdwso6j5ta	cmlv8c0ng0011cbpdjsm6ixsm
cmlwddict00fmcb8rpjhhi6oc	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-17 03:00:00	1	0	0	Teoria do Crime - Fato Típico	2026-02-21 13:43:42.125	cmlv97f5f002wcbpdr4wgwgn8	cmlu963vh000gcbpdn5tsbr7f
cmlwdel8100g8cb8r7n68x94t	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-17 03:00:00	1	10	8	Questões	2026-02-21 13:44:32.497	cmlv8c0ni0013cbpd8t4b35pn	cmlv8c0ng0011cbpdjsm6ixsm
cmlwdere000gscb8rnzusto0v	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-17 03:00:00	1	0	0	Inquérito Policial	2026-02-21 13:44:40.489	cmlv9evnr003ucbpdyakhmo4u	cmlv8a4vi000vcbpd7ldvhkc9
cmlwdevyd00gucb8r0dh489fo	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-18 03:00:00	1	10	9	Questões	2026-02-21 13:44:46.405	cmlscghpb0003cbimjpuoouy2	cmlsbe6sc0004cb1eol4zwzpb
cmlwdex4400gwcb8rd4imjqbr	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-18 03:00:00	1	0	0	Morfologia	2026-02-21 13:44:47.908	cmlv8f07x0018cbpdjgaxvnmp	cmlv8c0ng0011cbpdjsm6ixsm
cmlwdexms00gycb8rxo7bidif	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-18 03:00:00	1	0	0	Organização Administrativa	2026-02-21 13:44:48.58	cmlv9lf2q004gcbpdyhe3wurg	cmlu7r3sw0000cb3g378fbed9
cmlwdf02w00h0cb8rfirmzepj	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-19 03:00:00	1	0	0	Geografia do Tocantins	2026-02-21 13:44:51.753	cmlv9v4no005pcbpd5kehfu6q	cmlsc203j0006cb9beqs6h0lu
cmlwdf0k200h2cb8rq6fmnwq5	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-19 03:00:00	1	0	0	Geografia do Tocantins	2026-02-21 13:44:52.37	cmlv9v4no005pcbpd5kehfu6q	cmlsc203j0006cb9beqs6h0lu
cmlwdf1a200h4cb8rnd9tns4j	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-19 03:00:00	1	0	0	Revisão	2026-02-21 13:44:53.307	cmlv9cxqe003ocbpdwso6j5ta	cmlv8c0ng0011cbpdjsm6ixsm
cmlwdf3ws00h6cb8rv27fkuex	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-20 03:00:00	1	0	0	Geografia do Tocantins	2026-02-21 13:44:56.717	cmlv9ugrm005hcbpdxxopivem	cmlv9qtk00053cbpdp4r95510
cmlwdf5g000h8cb8rqq5f11lo	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-20 03:00:00	1	0	0	Geografia do Tocantins	2026-02-21 13:44:58.704	cmlv9ugrm005hcbpdxxopivem	cmlv9qtk00053cbpdp4r95510
cmlwdf6dw00hacb8rqc2q42ld	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-20 03:00:00	1	0	0	Morfologia	2026-02-21 13:44:59.925	cmlv8f07x0018cbpdjgaxvnmp	cmlv8c0ng0011cbpdjsm6ixsm
cmlwdf7ez00hccb8rzslvz1m7	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-21 03:00:00	1	0	0	Introdução ao Direito Penal	2026-02-21 13:45:01.26	cmlv965ea002scbpd8xlau6of	cmlu963vh000gcbpdn5tsbr7f
cmlwdf7w500hecb8rz5ckju1q	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-21 03:00:00	1	0	0	Inquérito Policial	2026-02-21 13:45:01.877	cmlv9evnr003ucbpdyakhmo4u	cmlv8a4vi000vcbpd7ldvhkc9
cmlwdp6zh00i6cb8rykengznl	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-15 03:00:00	1	0	0	Da Nacionalidade	2026-02-21 13:52:47.261	cmlv8qz0u0024cbpdpjjfexai	cmlsbe6sf0008cb1ex9y83irg
cmlwdp84800i8cb8rhust8qrk	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-16 03:00:00	1	0	0	Princípios Fundamentais da República	2026-02-21 13:52:48.728	cmlv8mccf001ycbpdzens6gac	cmlsbe6sf0008cb1ex9y83irg
cmlwdp8pc00iacb8rp64sc6iy	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-17 03:00:00	1	0	0	Estudo Planificado	2026-02-21 13:52:49.488	\N	cmlsbe6sc0004cb1eol4zwzpb
cmlwdp9hu00iccb8r529qpr5l	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-18 03:00:00	1	0	0	Estudo Planificado	2026-02-21 13:52:50.514	\N	cmlv8a4vi000vcbpd7ldvhkc9
cmlwdp9wf00iecb8r1c1g74c4	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-19 03:00:00	1	0	0	Estudo Planificado	2026-02-21 13:52:51.039	\N	cmlv8b1vm000ycbpdujzca0wz
cmlwdpaqf00igcb8rbe5v18bm	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-20 03:00:00	1	0	0	Estudo Planificado	2026-02-21 13:52:52.119	\N	cmlv8b1vm000ycbpdujzca0wz
cmlwdpbn900iicb8rhvc80161	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-20 03:00:00	1	0	0	Estudo Planificado	2026-02-21 13:52:53.302	\N	cmlv8c0ng0011cbpdjsm6ixsm
cmlwdpc6w00ikcb8r3evlp2jt	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-21 03:00:00	1	0	0	Estudo Planificado	2026-02-21 13:52:54.009	\N	cmlv8c0ng0011cbpdjsm6ixsm
cmlwdprd100imcb8r7dt8byaj	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-21 03:00:00	3	0	0	Revisão	2026-02-21 13:53:13.67	cmlv9cxqe003ocbpdwso6j5ta	cmlv8c0ng0011cbpdjsm6ixsm
cmlwdprpg00iocb8r0wcjnxg2	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-20 03:00:00	1	0	0	Concurso de Pessoas	2026-02-21 13:53:14.117	cmlv98rdf0032cbpd8fnl8pux	cmlu963vh000gcbpdn5tsbr7f
cmlwdps3v00iqcb8rtcjvuzm5	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-20 03:00:00	1	0	0	Teoria do Crime - Ilicitude	2026-02-21 13:53:14.636	cmlv97zvp002ycbpdhwqlw4il	cmlu963vh000gcbpdn5tsbr7f
cmlwdpsun00iscb8rft4it652	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-19 03:00:00	1	0	0	Concurso de Pessoas	2026-02-21 13:53:15.599	cmlv98rdf0032cbpd8fnl8pux	cmlu963vh000gcbpdn5tsbr7f
cmlwdpthm00iucb8re6j61p9x	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-19 03:00:00	1	0	0	Atos Administrativos	2026-02-21 13:53:16.427	cmlv9mbjg004kcbpdtlfdeqd8	cmlu7r3sw0000cb3g378fbed9
cmlwdpu6b00iwcb8r27do7qgi	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-18 03:00:00	1	0	0	Provas	2026-02-21 13:53:17.315	cmlv9gq6n0044cbpdl5k4yrvd	cmlv8a4vi000vcbpd7ldvhkc9
cmlwdpugf00iycb8rh61j8awq	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-18 03:00:00	1	0	0	Teoria do Crime - Ilicitude	2026-02-21 13:53:17.679	cmlv97zvp002ycbpdhwqlw4il	cmlu963vh000gcbpdn5tsbr7f
cmlwdpvsx00j0cb8rx00483n2	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-17 03:00:00	1	0	0	Tentativa e Consumação	2026-02-21 13:53:19.425	cmlv992rs0034cbpdrqszc8nt	cmlu963vh000gcbpdn5tsbr7f
cmlwdpw2u00j2cb8rp18j2y97	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-17 03:00:00	1	0	0	Agentes Públicos	2026-02-21 13:53:19.782	cmlv9n8ow004ocbpdewr7y09v	cmlu7r3sw0000cb3g378fbed9
cmlwdpww300j4cb8ravptj3cp	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-16 03:00:00	1	0	0	Erro	2026-02-21 13:53:20.835	cmlv99ejo0036cbpdxsdzi8f9	cmlu963vh000gcbpdn5tsbr7f
cmlwdpx6n00j6cb8ri193fwhd	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-16 03:00:00	1	0	0	Controle da Administração	2026-02-21 13:53:21.215	cmlv9o0nv004scbpdbifpy0vu	cmlu7r3sw0000cb3g378fbed9
cmm47012i000n8fhhho021van	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-22 03:00:00	1	0	0	Lei nº 11.343/2006 - Tráfico de drogas	2026-02-27 01:07:24.907	cmlv9rtl40059cbpd4f6c5v88	cmlv8b1vm000ycbpdujzca0wz
cmm47012i000l8fhh85t8nz4w	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-22 03:00:00	1	0	0	Pontuação	2026-02-27 01:07:24.906	cmlv8hjuq001ecbpd7qtmrq8v	cmlv8c0ng0011cbpdjsm6ixsm
cmm4701gh000p8fhh3t53kqil	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-24 03:00:00	1	0	0	Dos direitos Sociais	2026-02-27 01:07:25.41	cmlv8qfzd0022cbpd81unh2ha	cmlsbe6sf0008cb1ex9y83irg
cmm470388000r8fhhl0teh35n	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-26 03:00:00	1	0	0	Atos Administrativos	2026-02-27 01:07:27.704	cmlv9mbjg004kcbpdtlfdeqd8	cmlu7r3sw0000cb3g378fbed9
cmm4704ko000t8fhhkyrcrwz4	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-28 03:00:00	1	0	0	Concurso de Pessoas	2026-02-27 01:07:29.449	cmlv98rdf0032cbpd8fnl8pux	cmlu963vh000gcbpdn5tsbr7f
cmm470bli000v8fhhu9dzsp3p	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-28 03:00:00	1	0	0	Lei nº 11.343/2006 - Tráfico de drogas	2026-02-27 01:07:38.55	cmlv9rtl40059cbpd4f6c5v88	cmlv8b1vm000ycbpdujzca0wz
cmm470gpa000x8fhhbsjypgf8	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-26 03:00:00	1	0	0	Lei nº 8.072/1990 - crimes hediondos	2026-02-27 01:07:45.166	cmlv9scv7005bcbpdg1tacvag	cmlv8b1vm000ycbpdujzca0wz
cmm470hf9000z8fhhi2y81n7w	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-24 03:00:00	1	0	0	Erro	2026-02-27 01:07:46.101	cmlv99ejo0036cbpdxsdzi8f9	cmlu963vh000gcbpdn5tsbr7f
cmm6iokfu00018f07ygeopqmz	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-22 03:00:00	1	0	0	Pontuação	2026-02-28 16:09:57.88	cmlv8hjuq001ecbpd7qtmrq8v	cmlv8c0ng0011cbpdjsm6ixsm
cmm6iolnz00038f078qxk40vu	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-22 03:00:00	1	0	0	Lei nº 11.343/2006 - Tráfico de drogas	2026-02-28 16:09:59.472	cmlv9rtl40059cbpd4f6c5v88	cmlv8b1vm000ycbpdujzca0wz
cmm6ioqlp00058f07i6ga0jh7	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-23 03:00:00	1	50	47	Questões	2026-02-28 16:10:05.869	cmlscghpe0007cbim4ecjw5op	cmlsc203j0006cb9beqs6h0lu
cmm6iovva00078f07xa40nq6u	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-24 03:00:00	1	0	0	Dos direitos Sociais	2026-02-28 16:10:12.694	cmlv8qfzd0022cbpd81unh2ha	cmlsbe6sf0008cb1ex9y83irg
cmm6ioxok00098f07nn95pm8d	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-24 03:00:00	1	0	0	Erro	2026-02-28 16:10:15.045	cmlv99ejo0036cbpdxsdzi8f9	cmlu963vh000gcbpdn5tsbr7f
cmm6ip04r000b8f0759722msc	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-28 03:00:00	1	0	0	Concurso de Pessoas	2026-02-28 16:10:18.219	cmlv98rdf0032cbpd8fnl8pux	cmlu963vh000gcbpdn5tsbr7f
cmm6ip0rt000d8f07qxyb9rl7	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-28 03:00:00	1	0	0	Lei nº 11.343/2006 - Tráfico de drogas	2026-02-28 16:10:19.049	cmlv9rtl40059cbpd4f6c5v88	cmlv8b1vm000ycbpdujzca0wz
cmm6iporc000f8f07qgsgp0ab	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-26 03:00:00	1	0	0	Lei nº 8.072/1990 - crimes hediondos	2026-02-28 16:10:50.136	cmlv9scv7005bcbpdg1tacvag	cmlv8b1vm000ycbpdujzca0wz
cmm6ipp4r000h8f07tsshrmd7	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-26 03:00:00	1	0	0	Atos Administrativos	2026-02-28 16:10:50.62	cmlv9mbjg004kcbpdtlfdeqd8	cmlu7r3sw0000cb3g378fbed9
cmm7w24dg000d8fz1itipik3d	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-03-03 03:00:00	0.5	0	0	Da segurança pública	2026-03-01 15:12:11.428	cmlv8zasj002mcbpd3gnuvo6u	cmlsbe6sf0008cb1ex9y83irg
cmm7w29zt000f8fz19ns46a1i	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-03-03 03:00:00	1	0	0	Aplicação da Lei Processual Penal	2026-03-01 15:12:18.713	cmlv9eicf003scbpd5hj836p3	cmlv8a4vi000vcbpd7ldvhkc9
cmm7w2js0000h8fz1f7sjuffc	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-03-03 03:00:00	1	10	8	Questões	2026-03-01 15:12:31.392	cmlscghpc0005cbimbzs14aou	cmlsbe6sf0008cb1ex9y83irg
\.


--
-- Data for Name: StudyLogHistory; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StudyLogHistory" (id, "studyLogId", "previousValues", "newValues", "changedById", "changedAt") FROM stdin;
\.


--
-- Data for Name: Subject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Subject" (id, name, "createdAt", active, description) FROM stdin;
cmlsc203j0006cb9beqs6h0lu	Historia	2026-02-18 17:55:40.927	t	
cmlsfzkhs0000cbhr4aepkex5	Geral	2026-02-18 19:45:45.857	t	Matéria para estudos gerais e itens sem classificação específica.
cmlsbe6s60000cb1e7ptwu529	Matematica	2026-02-18 17:37:09.847	t	
cmlu7r3sw0000cb3g378fbed9	Direito Administrativo	2026-02-20 01:30:46.401	t	
cmlu963vh000gcbpdn5tsbr7f	Direito Penal	2026-02-20 02:10:25.949	t	
cmlsbe6sf0008cb1ex9y83irg	Direito Constitucional	2026-02-18 17:37:09.856	t	
cmlv8a4vi000vcbpd7ldvhkc9	Direito Processual Penal	2026-02-20 18:33:20.43	t	
cmlsbe6sc0004cb1eol4zwzpb	Raciocínio Lógico Matemático	2026-02-18 17:37:09.852	t	
cmlv8b1vm000ycbpdujzca0wz	Legislações Extravagantes	2026-02-20 18:34:03.202	t	
cmlv8c0ng0011cbpdjsm6ixsm	Língua Portuguesa	2026-02-20 18:34:48.268	t	
cmlv8c3nz0014cbpdjg341v8k	Redação	2026-02-20 18:34:52.176	t	
cmlv9qtk00053cbpdp4r95510	Geografia	2026-02-20 19:14:18.528	t	
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."User" (id, name, email, "passwordHash", role, phone, cpf, "birthDate", "targetExam", notes, "createdAt", "updatedAt", active, "addressCity", "addressState", "dailyHours", "educationLevel") FROM stdin;
ee2d7899-0904-4500-ab84-45affaf0fb06	Administrador	admin@operacao01.com	$2b$10$N2PMNKnfe4VLjoNP8ZNxguEeKeKTY.kzZRBcqYN3a08eob1D2eQPm	ADMIN	\N	\N	\N	\N	\N	2026-02-18 17:37:09.835	2026-02-18 17:37:09.835	t	\N	\N	\N	\N
59e62d58-ab7d-4019-8c50-abb4ef5e2292	gustavo	gustavo@operacao01.com	$2b$10$pudSN3uR/3pmyHxWuDwgvul1vnmoA4AreH0O89NOsMR94OMhaM8i.	STUDENT			\N		\N	2026-02-21 13:11:38.068	2026-02-21 13:12:03.519	t			0	
a0202ba0-8a57-4afd-b83f-151f83989711	Daniel	daniel@operacao01.com	$2b$10$AYhThITnzG3nicIQUW2HA.Ge6Q/weoKPhICVTLFYj9drYdMdOe212	STUDENT			\N		\N	2026-02-21 13:02:23.374	2026-02-21 13:26:04.736	t			0	
6823540b-c18f-477a-b807-802deda531e9	Izia	izia@gmail.com	$2b$10$Xb95dnIMdZ88HhDt6Dn2Iu5LwJTac6T5KN1nk.H9T0gQjJyLruW9i	STUDENT	\N	\N	\N	\N	\N	2026-02-28 22:37:54.674	2026-02-28 22:45:59.483	t	\N	\N	0	\N
13eedd98-6ff0-4c78-85db-cc84749796a8	Gabriel	gabriel@operacao01.com	$2b$10$Te9oz..5fIEv80nUt86Hw.feF7r9U6Gyp5ZTg6w/CbrubBCFSSEsu	STUDENT			\N		\N	2026-02-21 13:03:59.918	2026-02-21 13:24:38.213	t			0	
260d7ef0-c4db-475f-be8b-edea05eb0c6b	hugo	hugo@operacao01.com	$2b$10$iRo0jd5rSU3.lV0KZlOCFOhjblZnRsvnoIUpiILd6MSNMCOPKOvIy	STUDENT	\N	\N	\N	\N	\N	2026-02-21 13:14:39.053	2026-02-28 22:30:17.319	t	\N	\N	0	\N
e0af36f5-a0ee-45bc-8c79-e650056d49b3	Allan	allan@gmail.com	$2b$10$6/gp.P65HeM.7JnmFGgVR.4z95NO2kwo1AgM1pjs9G2QRt8zTTn7i	STUDENT			\N		\N	2026-02-18 23:02:54.556	2026-02-20 21:16:27.853	t	SAMPAIO	TO	0	
3518a1ca-e56d-4fc9-9140-349d5c81e94f	maciel	maciel@operacao01.com	$2b$10$1PPTkQRsFGV8k3zfXUv9PudZi6Ms1rsx324q3mc2CsXjjspuUMU2a	STUDENT			\N		\N	2026-02-21 13:14:15.759	2026-02-21 13:18:19.205	t			0	
ee0dfa5f-c544-485b-b9bf-98ad8415fd63	Rafael	rafael@operacao01.com	$2b$10$SQEAj/UranDnpUz5CZ7mm.DKVWHd6PnrzdSo86rCifeC/RYk1dIrq	STUDENT			\N		\N	2026-02-21 13:13:58.625	2026-02-21 13:18:36.781	t			0	
639aa580-4c55-4107-9365-6e62becd0277	Samuel	samuel@operacao01.com	$2b$10$t/o.u6Dwqlm02ZqQN/9AdelQ61cGV7FzhGBrwkf7if08GGpaPtgVi	STUDENT			\N		\N	2026-02-21 13:13:31.567	2026-02-21 13:19:33.799	t			0	
5bf8dd93-3d55-4991-a4e4-d5837224fe10	Vinicius	vinicius@operacao01.com	$2b$10$AllAYssOXSZ1oAOsHY/I5Od46qIeUcYpCzRBTIfEyHzYj6vIgKqfy	STUDENT			\N		\N	2026-02-21 13:13:08.306	2026-02-21 13:19:47.748	t			0	
b4010bdb-cca2-495c-badf-91c5e83d8840	Everton	everton@operacao01.com	$2b$10$HgEqPXpbXZ9kKy/bssfOOesazVhHuffZ4QiWpEhzh4APEwd0inElm	STUDENT			\N		\N	2026-02-21 13:12:38.787	2026-02-21 13:20:03.176	t			0	
0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	Lucas	lucas@operacao01.com	$2b$10$yKzDwNaURb3TkjaizL.RpuDWfF/Mdu6TqgDjYyHLc8Dh0FzVq4.Cu	STUDENT			\N		\N	2026-02-21 13:10:51.163	2026-02-21 13:20:19.185	t			0	
b4aa2855-7cd8-4a96-ba37-32fda807b9fe	julio	julio@operacao01.com	$2b$10$L4hpVqL9WXbImzayZar5hO4iVpwLmKLs6fqyz5LCqwFR9czhlj.82	STUDENT			\N		\N	2026-02-21 13:10:13.981	2026-02-21 13:20:35.599	t			0	
f57df311-f79e-4b5c-a25a-3843c3132215	adriano	adriano@operacao01.com	$2b$10$Xn6N80m2pEcbFsbmUwRzk.XNdvNEgoF96yQa890Bnn8Y4slG.7/gS	STUDENT			\N		\N	2026-02-21 13:09:39.501	2026-02-21 13:20:56.156	t			0	
d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	caio	caio@operacao01.com	$2b$10$GGs7KVh2zTLKOVlELUv.U.o8Cj1VRG0y781das21ygBz84142yrBq	STUDENT			\N		\N	2026-02-21 13:09:03.671	2026-02-21 13:21:31.522	t			0	
aa0bd92a-7b84-4b3b-bef2-ce7789857064	Paulo	paulo@operacao01.com	$2b$10$wkRV3V3rqW6JqhSlBnS7wOTu050t..z0U3J9keCqEJJb3DLTD7/fC	STUDENT			\N		\N	2026-02-21 13:08:33.827	2026-02-21 13:21:47.503	t			0	
3d4103a2-2e65-4eee-8d49-64fe272370ac	Otavio	otavio@operacao01.com	$2b$10$WZV5CZ6Rvm0m72j0gq5uJ.faYqkG8AtvJ8pZ/0/jJNW.RAwKWCcTO	STUDENT			\N		\N	2026-02-21 13:07:57.016	2026-02-21 13:22:11.178	t			0	
75b9575c-701f-4f38-b135-01cfd31f2169	Leonardo	leonardo@operacao01.com	$2b$10$7qayiTXePzFIl.XGcKfn7.g8zEeCZA8y6WEWDyzITmmr.HAgdhdY.	STUDENT			\N		\N	2026-02-21 13:07:07.513	2026-02-21 13:22:33.008	t			0	
d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	Kleber	kleber@operacao01.com	$2b$10$b27ebYo/UtjL0VB/n7R9h.w43aZ8aXXhKpyaDXD9cq6l3qjjBnwY6	STUDENT			\N		\N	2026-02-21 13:06:31.523	2026-02-21 13:22:53.491	t			0	
b7ee0a22-c975-4086-aeac-7b5bef36855a	João	joao@operacao01.com	$2b$10$cuDGcIGISsthnIAYMJigk.NojIbWys/2VOkaIdIvXnsE2zid/LKNm	STUDENT			\N		\N	2026-02-21 13:05:53.282	2026-02-21 13:23:11.963	t			0	
fbdb5b20-4533-4809-b73d-dee754167cd8	Igor	igor@operacao01.com	$2b$10$6YJKR4.dyFDAOY49hL9eL.pGsmT90kPHcBVKcEUCzzoG5KcA8ycKC	STUDENT			\N		\N	2026-02-21 13:05:14.136	2026-02-21 13:23:30.699	t			0	
5108ec62-4dd4-4fd3-a367-0d7d21e58da7	Kelson	student@operacao01.com	$2b$10$mHcGDax1kAvEVQv0Gdu0mOjxxmv.0c/imz87rJ.ZPrBKzWyP/0diG	STUDENT	11999999999		\N		\N	2026-02-18 17:37:09.841	2026-02-21 13:23:56.999	t	Teste Script City		0	
db9d00fb-e4e5-43d1-9f6b-b66e6c810558	Henrique	henrique@operacao01.com	$2b$10$Av01s1Tlxt1nbvhd1byIEufOmva6kU4XLxM5ohsdym6v4q6Zxq0qy	STUDENT			\N		\N	2026-02-21 13:04:40.686	2026-02-21 13:24:17.323	t			0	
f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	felipe	felipe@operacao01.com	$2b$10$nWEfyRj2HXQ8.Hqd/FF81.zhLzSe36d0h5LjUx6I28psdl14dPU.y	STUDENT			\N		\N	2026-02-21 13:03:17.645	2026-02-21 13:24:57.261	t			0	
058b3068-a232-4b9c-9b69-e02774b162ab	Test Admin	testadmin@example.com	$2b$10$fDhSpF/6LhChjB/f29MsVug5xsyWY05YZ5TeAGJHaIwd4l5iCghfO	STUDENT			\N		\N	2026-02-19 17:54:26.895	2026-02-21 13:25:27.588	t		SP	0	
792a36ef-61b1-4880-a61e-743c921a645d	eduardo	eduardo@operacao01.com	$2b$10$UZz1l5.vt0prQ7AnUnXX8ezmzi.bYKNgOPe1vjZddGe0nf9kqYKuG	STUDENT			\N		\N	2026-02-21 13:02:43.841	2026-02-21 13:25:45.531	t			0	
96e790bc-ddad-484d-8ab6-e969fe2e9001	Carlos	carlos@operacao01.com	$2b$10$ZB6vxLkdL5zqVs8IwrzRWOCregtj0kc6bFT3CkdNbM2yFElR91qlC	STUDENT			\N		\N	2026-02-21 13:01:50.581	2026-02-21 13:26:27.156	t			0	
5a1cf561-cc22-42f8-bdae-0479cc290425	 Bruno	bruno@operacao01.com	$2b$10$SJhxpbvLFQRuIUfgQ5t22uIUkwrlPxCKT1asSV4Cdu/BnbWSY8wxO	STUDENT			\N		\N	2026-02-21 13:01:14.873	2026-02-21 13:26:51.981	t			0	
0e4ba94e-5429-47c6-bb32-91659dd4d019	anderson	anderson@operacao01.com	$2b$10$DJAmT0ZiIZiz7tFf6ocH/u66LEWvS1lk63qXt1IJ/rljY0Bk4q.rK	STUDENT			\N		\N	2026-02-21 13:00:09.807	2026-02-21 13:27:18.166	t			0	
8020becb-20d5-49c5-8d33-a9df196175a6	Maria Silva	maria@gmail.com	$2b$10$/DCJkwbS3uxdgIDHxHKsrOVqugyriUw3TdSgCW3sqZX.y/zhzFC0S	STUDENT			\N		\N	2026-02-20 01:28:35.965	2026-02-21 13:27:35.039	t			0	
fbacb428-eaa6-4b80-b81a-2a564412e5d0	Andre Martins	andrem@gmail.com	$2b$10$jStDM68TqWDkXUqLk9jsoOHwqcCj3iGwq7OQJLSh6PzlnjD8Lw1Ui	MENTOR	\N	236.311.713-15	2000-08-16 00:00:00	\N	\N	2026-02-28 18:28:07.724	2026-03-01 14:29:08.699	t	\N	\N	0	\N
575ecb40-5150-4a9c-b1b0-db571e61143a	Samara	samara@operacao01.com	$2b$10$woURgJ4mG72fsrQrHhw5peXL5f1OOfrZaQjZOtSUnepcqurb0yFy2	STUDENT	\N	\N	\N	\N	\N	2026-02-21 13:15:53.5	2026-03-01 14:30:13.396	t	\N	\N	0	\N
\.


--
-- Data for Name: UserConcurso; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserConcurso" (id, "userId", "concursoId") FROM stdin;
cmlve3wwe000ccbonqjtdsopu	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlu4acxi000ucbtkpm4jzxjo
cmlwc8tdt000hcb8ry193ofi8	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlwbqupz0001cb8r8y99wkjs
cmlwc8tdt000icb8rdpqqfjzl	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlwbr1u10002cb8rkqgh461r
cmlwcgv9g001scb8rwwo2pg6s	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlu4acxi000ucbtkpm4jzxjo
cmlwch8tp0027cb8rpzdlub48	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlwbqupz0001cb8r8y99wkjs
cmlwch8tp0028cb8rf9s0t5e4	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlwbr1u10002cb8rkqgh461r
cmlwcigtj002ncb8rfknaek3p	639aa580-4c55-4107-9365-6e62becd0277	cmlwbqjgi0000cb8rtoozftjx
cmlwcirl00032cb8r8j6frp1p	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlu4acxi000ucbtkpm4jzxjo
cmlwcj3hk003hcb8rli9ae5jd	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlwbqupz0001cb8r8y99wkjs
cmlwcj3hk003icb8rl76b5t6y	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlwbr1u10002cb8rkqgh461r
cmlwcjfu9003xcb8ru9j7ru4n	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlwbqjgi0000cb8rtoozftjx
cmlwcjsi7004ccb8r9i7fw5bt	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlu4acxi000ucbtkpm4jzxjo
cmlwck8d8004rcb8rfdqtusb7	f57df311-f79e-4b5c-a25a-3843c3132215	cmlwbqupz0001cb8r8y99wkjs
cmlwck8d8004scb8ropqlh7o7	f57df311-f79e-4b5c-a25a-3843c3132215	cmlwbr1u10002cb8rkqgh461r
cmlwckznm0057cb8r4zzczh8s	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlwbqjgi0000cb8rtoozftjx
cmlwclbzj005mcb8r5r3r0wm5	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlu4acxi000ucbtkpm4jzxjo
cmlwclu960061cb8rx4jsp9k8	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlwbqupz0001cb8r8y99wkjs
cmlwclu960062cb8r45i3d4sf	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlwbr1u10002cb8rkqgh461r
cmlwcmb3k006hcb8rhnjwlb5h	75b9575c-701f-4f38-b135-01cfd31f2169	cmlwbqjgi0000cb8rtoozftjx
cmlwcmqwj006wcb8r3ok0q7e4	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlwbqjgi0000cb8rtoozftjx
cmlwcn55n007bcb8r9mx703lz	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlwbqupz0001cb8r8y99wkjs
cmlwcn55n007ccb8rqop3bw1u	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlwbr1u10002cb8rkqgh461r
cmlwcnjm3007rcb8rwzssnpxk	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlwbqjgi0000cb8rtoozftjx
cmlwco3wn0086cb8r6g0fxc66	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlu4acxi000ucbtkpm4jzxjo
cmlwcojl7008lcb8rqz3orfyq	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlwbqupz0001cb8r8y99wkjs
cmlwcojl7008mcb8rs9xizpn6	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlwbr1u10002cb8rkqgh461r
cmlwcozph0091cb8r3fez6p0n	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlwbqjgi0000cb8rtoozftjx
cmlwcpeel009gcb8rks0fdt25	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlwbqupz0001cb8r8y99wkjs
cmlwcpeel009hcb8r0zq6thih	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlwbr1u10002cb8rkqgh461r
cmlwcq1t0009wcb8rp0b0o304	058b3068-a232-4b9c-9b69-e02774b162ab	cmlwbqupz0001cb8r8y99wkjs
cmlwcq1t0009xcb8rvndy5ngr	058b3068-a232-4b9c-9b69-e02774b162ab	cmlwbr1u10002cb8rkqgh461r
cmlwcqfnf00accb8rdpai1s5d	792a36ef-61b1-4880-a61e-743c921a645d	cmlu4acxi000ucbtkpm4jzxjo
cmlwcqugw00arcb8r9ufuqccf	a0202ba0-8a57-4afd-b83f-151f83989711	cmlwbqjgi0000cb8rtoozftjx
cmlwcrbro00b6cb8r3hi8svg9	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlu4acxi000ucbtkpm4jzxjo
cmlwcrux900blcb8r0vtgihta	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlwbqupz0001cb8r8y99wkjs
cmlwcrux900bmcb8rpmuosais	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlwbr1u10002cb8rkqgh461r
cmlwcsf4l00c1cb8rj73x3ymn	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlwbqjgi0000cb8rtoozftjx
cmlwcss5b00cgcb8rgt6yafga	8020becb-20d5-49c5-8d33-a9df196175a6	cmlu4acxi000ucbtkpm4jzxjo
cmm6w9o13000h8fqerz32iqmc	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlwbqjgi0000cb8rtoozftjx
cmm7uiriz000u8fj0pcdxf6ke	fbacb428-eaa6-4b80-b81a-2a564412e5d0	cmlwbqupz0001cb8r8y99wkjs
cmm7uk5g4001b8fj021vjx2uo	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlwbqupz0001cb8r8y99wkjs
cmm7uk5g4001c8fj0zrc4c5t3	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlwbr1u10002cb8rkqgh461r
\.


--
-- Data for Name: UserSubject; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserSubject" (id, "userId", "subjectId") FROM stdin;
cmlve3wwd0001cbonfj5jb6pj	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlsbe6sc0004cb1eol4zwzpb
cmlve3wwd0002cbon3i9g4nmh	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlu7r3sw0000cb3g378fbed9
cmlve3wwd0003cbonk3z3gtvj	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlv8a4vi000vcbpd7ldvhkc9
cmlve3wwd0004cbon5i17t8si	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlsc203j0006cb9beqs6h0lu
cmlve3wwd0005cbone04rw12d	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlsbe6sf0008cb1ex9y83irg
cmlve3wwd0006cbonlmsxncsz	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlv9qtk00053cbpdp4r95510
cmlve3wwd0007cbony4sz7g8j	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlu963vh000gcbpdn5tsbr7f
cmlve3wwd0008cbon1li62pz1	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlsfzkhs0000cbhr4aepkex5
cmlve3wwd0009cbonuifgmmc8	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlv8b1vm000ycbpdujzca0wz
cmlve3wwe000acbonkrvndrns	e0af36f5-a0ee-45bc-8c79-e650056d49b3	cmlv8c0ng0011cbpdjsm6ixsm
cmlwc8tdt0004cb8rdo58ykdf	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlu7r3sw0000cb3g378fbed9
cmlwc8tdt0005cb8r31r70z85	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlv8a4vi000vcbpd7ldvhkc9
cmlwc8tdt0006cb8rs9ps7k6g	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlsc203j0006cb9beqs6h0lu
cmlwc8tdt0007cb8rcpsxeva6	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlsbe6s60000cb1e7ptwu529
cmlwc8tdt0008cb8rp7rkn3iu	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlsbe6sf0008cb1ex9y83irg
cmlwc8tdt0009cb8rq03iy9qq	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlv9qtk00053cbpdp4r95510
cmlwc8tdt000acb8rfcfh6rbk	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlv8b1vm000ycbpdujzca0wz
cmlwc8tdt000bcb8rqaamruqg	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlsbe6sc0004cb1eol4zwzpb
cmlwc8tdt000ccb8r330vimbm	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlv8c3nz0014cbpdjg341v8k
cmlwc8tdt000dcb8rdeh0c696	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlv8c0ng0011cbpdjsm6ixsm
cmlwc8tdt000ecb8r5mkt19my	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlsfzkhs0000cbhr4aepkex5
cmlwc8tdt000fcb8rw6b1oozy	59e62d58-ab7d-4019-8c50-abb4ef5e2292	cmlu963vh000gcbpdn5tsbr7f
cmlwcgv9g001fcb8rpjun0hu0	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlu7r3sw0000cb3g378fbed9
cmlwcgv9g001gcb8r2vjo3gzq	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcgv9g001hcb8ra8d0g8bf	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlsc203j0006cb9beqs6h0lu
cmlwcgv9g001icb8r2scs8l1w	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlsbe6s60000cb1e7ptwu529
cmlwcgv9g001jcb8rzanpy015	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlsbe6sf0008cb1ex9y83irg
cmlwcgv9g001kcb8raj4hp73i	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlv9qtk00053cbpdp4r95510
cmlwcgv9g001lcb8r4rvmjskt	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlv8b1vm000ycbpdujzca0wz
cmlwcgv9g001mcb8rqfg9mj5x	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlsbe6sc0004cb1eol4zwzpb
cmlwcgv9g001ncb8rqecutoce	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlu963vh000gcbpdn5tsbr7f
cmlwcgv9g001ocb8r8ha0yl0l	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlsfzkhs0000cbhr4aepkex5
cmlwcgv9g001pcb8ry5jz2pdy	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcgv9g001qcb8r7dvlsxsa	3518a1ca-e56d-4fc9-9140-349d5c81e94f	cmlv8c3nz0014cbpdjg341v8k
cmlwch8tp001ucb8rj7exd193	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlu7r3sw0000cb3g378fbed9
cmlwch8tp001vcb8rovqknbb7	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlv8a4vi000vcbpd7ldvhkc9
cmlwch8tp001wcb8rnqq8hdim	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlsc203j0006cb9beqs6h0lu
cmlwch8tp001xcb8r7uzzvr2f	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlsbe6s60000cb1e7ptwu529
cmlwch8tp001ycb8rq79uat74	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlsbe6sf0008cb1ex9y83irg
cmlwch8tp001zcb8rtl2rq71i	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlv9qtk00053cbpdp4r95510
cmlwch8tp0020cb8ry4fq7lxm	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlv8b1vm000ycbpdujzca0wz
cmlwch8tp0021cb8rc89tb2ts	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlsbe6sc0004cb1eol4zwzpb
cmlwch8tp0022cb8rikpwbuqy	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlv8c3nz0014cbpdjg341v8k
cmlwch8tp0023cb8rkq39vxqa	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlv8c0ng0011cbpdjsm6ixsm
cmlwch8tp0024cb8rgf6fvbm9	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlsfzkhs0000cbhr4aepkex5
cmlwch8tp0025cb8r0ixgrv8g	ee0dfa5f-c544-485b-b9bf-98ad8415fd63	cmlu963vh000gcbpdn5tsbr7f
cmlwcigti002acb8rj27sspu0	639aa580-4c55-4107-9365-6e62becd0277	cmlu7r3sw0000cb3g378fbed9
cmlwcigti002bcb8rt4jmu36e	639aa580-4c55-4107-9365-6e62becd0277	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcigti002ccb8ra097kqbm	639aa580-4c55-4107-9365-6e62becd0277	cmlsc203j0006cb9beqs6h0lu
cmlwcigti002dcb8rltx2rm2s	639aa580-4c55-4107-9365-6e62becd0277	cmlsbe6s60000cb1e7ptwu529
cmlwcigti002ecb8rwupe9eq0	639aa580-4c55-4107-9365-6e62becd0277	cmlsbe6sc0004cb1eol4zwzpb
cmlwcigti002fcb8r59jog8cn	639aa580-4c55-4107-9365-6e62becd0277	cmlv8b1vm000ycbpdujzca0wz
cmlwcigti002gcb8re7ofoehf	639aa580-4c55-4107-9365-6e62becd0277	cmlv9qtk00053cbpdp4r95510
cmlwcigti002hcb8ridrhagq6	639aa580-4c55-4107-9365-6e62becd0277	cmlsbe6sf0008cb1ex9y83irg
cmlwcigti002icb8r4mcairqb	639aa580-4c55-4107-9365-6e62becd0277	cmlu963vh000gcbpdn5tsbr7f
cmlwcigti002jcb8rfioya65r	639aa580-4c55-4107-9365-6e62becd0277	cmlsfzkhs0000cbhr4aepkex5
cmlwcigti002kcb8r6nsuq1h7	639aa580-4c55-4107-9365-6e62becd0277	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcigti002lcb8r3cyiwloz	639aa580-4c55-4107-9365-6e62becd0277	cmlv8c3nz0014cbpdjg341v8k
cmlwcirl0002pcb8r9poj8gb7	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlu7r3sw0000cb3g378fbed9
cmlwcirl0002qcb8ro3q2v2bd	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcirl0002rcb8rnwi0zqbv	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlsc203j0006cb9beqs6h0lu
cmlwcirl0002scb8re778jrpw	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlsbe6s60000cb1e7ptwu529
cmlwcirl0002tcb8rt601vpe8	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlsbe6sc0004cb1eol4zwzpb
cmlwcirl0002ucb8rjkpgweh3	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlv8b1vm000ycbpdujzca0wz
cmlwcirl0002vcb8rwq8ojs0r	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlv9qtk00053cbpdp4r95510
cmlwcirl0002wcb8rgt934aif	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlsbe6sf0008cb1ex9y83irg
cmlwcirl0002xcb8rmqwee3we	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlu963vh000gcbpdn5tsbr7f
cmlwcirl0002ycb8rve2blw8x	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlsfzkhs0000cbhr4aepkex5
cmlwcirl0002zcb8ry5wo2h7d	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcirl00030cb8r05pnmuhg	5bf8dd93-3d55-4991-a4e4-d5837224fe10	cmlv8c3nz0014cbpdjg341v8k
cmlwcj3hk0034cb8r0y69n8eg	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlu7r3sw0000cb3g378fbed9
cmlwcj3hk0035cb8rxb68d2rj	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcj3hk0036cb8r3h0iw6b9	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlsc203j0006cb9beqs6h0lu
cmlwcj3hk0037cb8r7f8731o4	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlsbe6s60000cb1e7ptwu529
cmlwcj3hk0038cb8rgtwmzwua	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlsbe6sc0004cb1eol4zwzpb
cmlwcj3hk0039cb8r58d0cdo3	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlv8b1vm000ycbpdujzca0wz
cmlwcj3hk003acb8r2kg06aps	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlv9qtk00053cbpdp4r95510
cmlwcj3hk003bcb8rz55tgdkk	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlsbe6sf0008cb1ex9y83irg
cmlwcj3hk003ccb8rz5yftr0g	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlu963vh000gcbpdn5tsbr7f
cmlwcj3hk003dcb8rh9tcwqxj	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlsfzkhs0000cbhr4aepkex5
cmlwcj3hk003ecb8r50jxtc9g	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcj3hk003fcb8rbo5gen4x	b4010bdb-cca2-495c-badf-91c5e83d8840	cmlv8c3nz0014cbpdjg341v8k
cmlwcjfu9003kcb8r8q3bceze	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlu7r3sw0000cb3g378fbed9
cmlwcjfu9003lcb8r0unleoed	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcjfu9003mcb8rtie6obde	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlsc203j0006cb9beqs6h0lu
cmlwcjfu9003ncb8r25pd49gd	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlsbe6s60000cb1e7ptwu529
cmlwcjfu9003ocb8rghka6fco	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlsbe6sc0004cb1eol4zwzpb
cmlwcjfu9003pcb8r9atlfak6	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlv8b1vm000ycbpdujzca0wz
cmlwcjfu9003qcb8r14z10bp6	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlv9qtk00053cbpdp4r95510
cmlwcjfu9003rcb8rubaxvw8x	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlsbe6sf0008cb1ex9y83irg
cmlwcjfu9003scb8rkmlig5fg	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlu963vh000gcbpdn5tsbr7f
cmlwcjfu9003tcb8riece0qkb	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlsfzkhs0000cbhr4aepkex5
cmlwcjfu9003ucb8rse9flbe4	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcjfu9003vcb8rennismmy	0bba8ec9-65c8-4dc7-9dad-4bf2f2dba584	cmlv8c3nz0014cbpdjg341v8k
cmlwcjsi7003zcb8r7whnu633	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlu7r3sw0000cb3g378fbed9
cmlwcjsi70040cb8rwik6ow6s	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcjsi70041cb8rv2bpjrz1	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlsc203j0006cb9beqs6h0lu
cmlwcjsi70042cb8r79x0waow	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlsbe6s60000cb1e7ptwu529
cmlwcjsi70043cb8rk098jjto	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlsbe6sc0004cb1eol4zwzpb
cmlwcjsi70044cb8rglg3dr66	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlv8b1vm000ycbpdujzca0wz
cmlwcjsi70045cb8ruvvire5s	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlv9qtk00053cbpdp4r95510
cmlwcjsi70046cb8r0te0ucf1	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlsbe6sf0008cb1ex9y83irg
cmlwcjsi70047cb8rzprsmhsc	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlu963vh000gcbpdn5tsbr7f
cmlwcjsi70048cb8rrs2g70x3	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlsfzkhs0000cbhr4aepkex5
cmlwcjsi70049cb8rdvn2fc0i	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcjsi7004acb8raegm006d	b4aa2855-7cd8-4a96-ba37-32fda807b9fe	cmlv8c3nz0014cbpdjg341v8k
cmlwck8d8004ecb8r2y1rkq3l	f57df311-f79e-4b5c-a25a-3843c3132215	cmlu7r3sw0000cb3g378fbed9
cmlwck8d8004fcb8rx12elyug	f57df311-f79e-4b5c-a25a-3843c3132215	cmlv8a4vi000vcbpd7ldvhkc9
cmlwck8d8004gcb8ryvcg3h9g	f57df311-f79e-4b5c-a25a-3843c3132215	cmlsc203j0006cb9beqs6h0lu
cmlwck8d8004hcb8rze3h3rfg	f57df311-f79e-4b5c-a25a-3843c3132215	cmlsbe6s60000cb1e7ptwu529
cmlwck8d8004icb8rw39c9fad	f57df311-f79e-4b5c-a25a-3843c3132215	cmlsbe6sc0004cb1eol4zwzpb
cmlwck8d8004jcb8rvz04otxm	f57df311-f79e-4b5c-a25a-3843c3132215	cmlv8b1vm000ycbpdujzca0wz
cmlwck8d8004kcb8rkuk71ppv	f57df311-f79e-4b5c-a25a-3843c3132215	cmlv9qtk00053cbpdp4r95510
cmlwck8d8004lcb8riblr29ww	f57df311-f79e-4b5c-a25a-3843c3132215	cmlsbe6sf0008cb1ex9y83irg
cmlwck8d8004mcb8rwjflry9s	f57df311-f79e-4b5c-a25a-3843c3132215	cmlu963vh000gcbpdn5tsbr7f
cmlwck8d8004ncb8r8tjbs7tk	f57df311-f79e-4b5c-a25a-3843c3132215	cmlsfzkhs0000cbhr4aepkex5
cmlwck8d8004ocb8rpax6d5rk	f57df311-f79e-4b5c-a25a-3843c3132215	cmlv8c0ng0011cbpdjsm6ixsm
cmlwck8d8004pcb8rt56dsdiv	f57df311-f79e-4b5c-a25a-3843c3132215	cmlv8c3nz0014cbpdjg341v8k
cmlwckznm004ucb8rhla1clk4	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlu7r3sw0000cb3g378fbed9
cmlwckznm004vcb8rrqr3kqoo	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlv8a4vi000vcbpd7ldvhkc9
cmlwckznm004wcb8ryiwg5gog	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlsc203j0006cb9beqs6h0lu
cmlwckznm004xcb8rm6vrwls0	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlsbe6s60000cb1e7ptwu529
cmlwckznm004ycb8rrrccgm8u	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlsbe6sc0004cb1eol4zwzpb
cmlwckznm004zcb8r5nzptamz	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlv8b1vm000ycbpdujzca0wz
cmlwckznm0050cb8r4d17xpo5	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlv9qtk00053cbpdp4r95510
cmlwckznm0051cb8r99ai5eno	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlsbe6sf0008cb1ex9y83irg
cmlwckznm0052cb8r200hwcxe	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlu963vh000gcbpdn5tsbr7f
cmlwckznm0053cb8rhbkj8fhi	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlsfzkhs0000cbhr4aepkex5
cmlwckznm0054cb8rp2s6w0kb	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlv8c0ng0011cbpdjsm6ixsm
cmlwckznm0055cb8r02cgma2n	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	cmlv8c3nz0014cbpdjg341v8k
cmlwclbzj0059cb8rla7ye8ty	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlu7r3sw0000cb3g378fbed9
cmlwclbzj005acb8rnp5pvu88	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlv8a4vi000vcbpd7ldvhkc9
cmlwclbzj005bcb8rdm8g0och	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlsc203j0006cb9beqs6h0lu
cmlwclbzj005ccb8rj0a6rlaz	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlsbe6s60000cb1e7ptwu529
cmlwclbzj005dcb8rc1g5zfhs	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlsbe6sc0004cb1eol4zwzpb
cmlwclbzj005ecb8rmjmwh91j	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlv8b1vm000ycbpdujzca0wz
cmlwclbzj005fcb8ro28lqf47	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlv9qtk00053cbpdp4r95510
cmlwclbzj005gcb8rd8bw78xw	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlsbe6sf0008cb1ex9y83irg
cmlwclbzj005hcb8r0bsuyhhg	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlu963vh000gcbpdn5tsbr7f
cmlwclbzj005icb8rhazqq5j7	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlsfzkhs0000cbhr4aepkex5
cmlwclbzj005jcb8rprs54dpx	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlv8c0ng0011cbpdjsm6ixsm
cmlwclbzj005kcb8re0up8dl8	aa0bd92a-7b84-4b3b-bef2-ce7789857064	cmlv8c3nz0014cbpdjg341v8k
cmlwclu96005ocb8rjg3js2ys	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlu7r3sw0000cb3g378fbed9
cmlwclu96005pcb8rc6w33a0g	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlv8a4vi000vcbpd7ldvhkc9
cmlwclu96005qcb8ryz5dn0o5	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlsc203j0006cb9beqs6h0lu
cmlwclu96005rcb8rctyp5hml	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlsbe6sc0004cb1eol4zwzpb
cmlwclu96005scb8rdx5xvtfo	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlv8b1vm000ycbpdujzca0wz
cmlwclu96005tcb8rnyqk6bsv	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlsbe6s60000cb1e7ptwu529
cmlwclu96005ucb8r8qckoxf0	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlv9qtk00053cbpdp4r95510
cmlwclu96005vcb8r3uwte31i	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlsbe6sf0008cb1ex9y83irg
cmlwclu96005wcb8ra5ogpx66	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlu963vh000gcbpdn5tsbr7f
cmlwclu96005xcb8r1bx5az0l	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlsfzkhs0000cbhr4aepkex5
cmlwclu96005ycb8rsuf9ovlr	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlv8c0ng0011cbpdjsm6ixsm
cmlwclu96005zcb8rlo15okub	3d4103a2-2e65-4eee-8d49-64fe272370ac	cmlv8c3nz0014cbpdjg341v8k
cmlwcmb3k0064cb8ro6qeai8c	75b9575c-701f-4f38-b135-01cfd31f2169	cmlu7r3sw0000cb3g378fbed9
cmlwcmb3k0065cb8r4g2i2d5a	75b9575c-701f-4f38-b135-01cfd31f2169	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcmb3k0066cb8rclr3bvht	75b9575c-701f-4f38-b135-01cfd31f2169	cmlsc203j0006cb9beqs6h0lu
cmlwcmb3k0067cb8rr7d6bb30	75b9575c-701f-4f38-b135-01cfd31f2169	cmlsbe6s60000cb1e7ptwu529
cmlwcmb3k0068cb8rlfjyyaav	75b9575c-701f-4f38-b135-01cfd31f2169	cmlsbe6sc0004cb1eol4zwzpb
cmlwcmb3k0069cb8r86gw5l49	75b9575c-701f-4f38-b135-01cfd31f2169	cmlv8b1vm000ycbpdujzca0wz
cmlwcmb3k006acb8rw87t3ieq	75b9575c-701f-4f38-b135-01cfd31f2169	cmlv9qtk00053cbpdp4r95510
cmlwcmb3k006bcb8rm7cb0x7c	75b9575c-701f-4f38-b135-01cfd31f2169	cmlsbe6sf0008cb1ex9y83irg
cmlwcmb3k006ccb8rrv10o9tc	75b9575c-701f-4f38-b135-01cfd31f2169	cmlu963vh000gcbpdn5tsbr7f
cmlwcmb3k006dcb8r1tvwyae4	75b9575c-701f-4f38-b135-01cfd31f2169	cmlsfzkhs0000cbhr4aepkex5
cmlwcmb3k006ecb8rcnhjlpp3	75b9575c-701f-4f38-b135-01cfd31f2169	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcmb3k006fcb8rqrhgdu97	75b9575c-701f-4f38-b135-01cfd31f2169	cmlv8c3nz0014cbpdjg341v8k
cmlwcmqwj006jcb8r811epk3n	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlu7r3sw0000cb3g378fbed9
cmlwcmqwj006kcb8rrvj0f63l	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcmqwj006lcb8rbqqpx65b	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlsc203j0006cb9beqs6h0lu
cmlwcmqwj006mcb8rqhpu5583	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlsbe6s60000cb1e7ptwu529
cmlwcmqwj006ncb8r98vewlqu	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlsbe6sc0004cb1eol4zwzpb
cmlwcmqwj006ocb8ryrnoo9pn	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlv8b1vm000ycbpdujzca0wz
cmlwcmqwj006pcb8raqcrl1zg	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlv9qtk00053cbpdp4r95510
cmlwcmqwj006qcb8r5ueuqy54	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlsbe6sf0008cb1ex9y83irg
cmlwcmqwj006rcb8rxu17e7jr	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlu963vh000gcbpdn5tsbr7f
cmlwcmqwj006scb8r5l4jskh1	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlsfzkhs0000cbhr4aepkex5
cmlwcmqwj006tcb8rwjm3tbbd	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcmqwj006ucb8rjk13fli2	d61e0f9e-ac80-4195-a728-fe4a9f9c0e6b	cmlv8c3nz0014cbpdjg341v8k
cmlwcn55n006ycb8r5c91m77g	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlu7r3sw0000cb3g378fbed9
cmlwcn55n006zcb8r481xbpbh	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlsc203j0006cb9beqs6h0lu
cmlwcn55n0070cb8rgn11uzpd	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcn55n0071cb8r005fbiwd	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlsbe6s60000cb1e7ptwu529
cmlwcn55n0072cb8rrb8x1pv4	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlsbe6sc0004cb1eol4zwzpb
cmlwcn55n0073cb8r5yk3sfm0	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlv8b1vm000ycbpdujzca0wz
cmlwcn55n0074cb8rszdk6l3s	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlv9qtk00053cbpdp4r95510
cmlwcn55n0075cb8rgixs56ua	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlsbe6sf0008cb1ex9y83irg
cmlwcn55n0076cb8rpyct4qvo	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlu963vh000gcbpdn5tsbr7f
cmlwcn55n0077cb8rybyp4ymg	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlsfzkhs0000cbhr4aepkex5
cmlwcn55n0078cb8r11or28jy	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcn55n0079cb8rjnjdbord	b7ee0a22-c975-4086-aeac-7b5bef36855a	cmlv8c3nz0014cbpdjg341v8k
cmlwcnjm2007ecb8rc6g2hhkr	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlu7r3sw0000cb3g378fbed9
cmlwcnjm2007fcb8r15n2tqfl	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlsbe6sf0008cb1ex9y83irg
cmlwcnjm2007gcb8ryu6jp6mw	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlu963vh000gcbpdn5tsbr7f
cmlwcnjm2007hcb8rtdcxnopt	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlsfzkhs0000cbhr4aepkex5
cmlwcnjm2007icb8r8hkoy4o8	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlv9qtk00053cbpdp4r95510
cmlwcnjm3007jcb8rkdfsyyot	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcnjm3007kcb8r2j45paba	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlv8b1vm000ycbpdujzca0wz
cmlwcnjm3007lcb8rih6td5f4	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcnjm3007mcb8rlfiywzym	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlv8c3nz0014cbpdjg341v8k
cmlwcnjm3007ncb8rpev3gi6l	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlsbe6sc0004cb1eol4zwzpb
cmlwcnjm3007ocb8r2xteim53	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlsc203j0006cb9beqs6h0lu
cmlwcnjm3007pcb8rasj4o91f	fbdb5b20-4533-4809-b73d-dee754167cd8	cmlsbe6s60000cb1e7ptwu529
cmlwco3wn007tcb8r3ymjp46m	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlsbe6s60000cb1e7ptwu529
cmlwco3wn007ucb8r8xk8fb5c	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlsbe6sc0004cb1eol4zwzpb
cmlwco3wn007vcb8rsg9czvxb	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlsbe6sf0008cb1ex9y83irg
cmlwco3wn007wcb8rin9pjbdb	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlsc203j0006cb9beqs6h0lu
cmlwco3wn007xcb8rljn2um8o	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlu7r3sw0000cb3g378fbed9
cmlwco3wn007ycb8rwuf1dmm9	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlv8a4vi000vcbpd7ldvhkc9
cmlwco3wn007zcb8ruklenezx	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlv9qtk00053cbpdp4r95510
cmlwco3wn0080cb8rw4kez636	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlv8b1vm000ycbpdujzca0wz
cmlwco3wn0081cb8rbfwu3xb9	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlv8c0ng0011cbpdjsm6ixsm
cmlwco3wn0082cb8ra9j4awwa	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlsfzkhs0000cbhr4aepkex5
cmlwco3wn0083cb8ra50vwcf3	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlu963vh000gcbpdn5tsbr7f
cmlwco3wn0084cb8rvegjofv2	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	cmlv8c3nz0014cbpdjg341v8k
cmlwcojl70088cb8r1z0xjdsr	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlu7r3sw0000cb3g378fbed9
cmlwcojl70089cb8rfpq2f6l5	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcojl7008acb8rtb25b70e	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlsc203j0006cb9beqs6h0lu
cmlwcojl7008bcb8rzt1y0nhe	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlsbe6s60000cb1e7ptwu529
cmlwcojl7008ccb8r8b96h8fe	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlsbe6sc0004cb1eol4zwzpb
cmlwcojl7008dcb8rdb1tb5gy	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlv8b1vm000ycbpdujzca0wz
cmlwcojl7008ecb8rnws1nu94	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlv9qtk00053cbpdp4r95510
cmlwcojl7008fcb8r51ct35m8	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlsbe6sf0008cb1ex9y83irg
cmlwcojl7008gcb8rz7vx84vd	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlu963vh000gcbpdn5tsbr7f
cmlwcojl7008hcb8rn7w0p4cw	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlsfzkhs0000cbhr4aepkex5
cmlwcojl7008icb8rlq8r9xzs	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcojl7008jcb8r9324xt5a	db9d00fb-e4e5-43d1-9f6b-b66e6c810558	cmlv8c3nz0014cbpdjg341v8k
cmlwcozph008ocb8rlukkm419	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlu7r3sw0000cb3g378fbed9
cmlwcozph008pcb8r2h77ns7w	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcozph008qcb8rgcy9kj73	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlsc203j0006cb9beqs6h0lu
cmlwcozph008rcb8rigqb4wp0	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlsbe6sc0004cb1eol4zwzpb
cmlwcozph008scb8rrwaloren	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlv8b1vm000ycbpdujzca0wz
cmlwcozph008tcb8rl78wsqsa	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlsbe6s60000cb1e7ptwu529
cmlwcozph008ucb8rtkufuvkg	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlv9qtk00053cbpdp4r95510
cmlwcozph008vcb8rojk671gr	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlsbe6sf0008cb1ex9y83irg
cmlwcozph008wcb8r4914siq8	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlu963vh000gcbpdn5tsbr7f
cmlwcozph008xcb8r5366nl6h	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlsfzkhs0000cbhr4aepkex5
cmlwcozph008ycb8r96ajpw72	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcozph008zcb8rzvxqyfqg	13eedd98-6ff0-4c78-85db-cc84749796a8	cmlv8c3nz0014cbpdjg341v8k
cmlwcpeel0093cb8rtt54y2bg	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlsbe6sf0008cb1ex9y83irg
cmlwcpeel0094cb8r79a5p200	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlv9qtk00053cbpdp4r95510
cmlwcpeel0095cb8r1xqmccy8	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlv8b1vm000ycbpdujzca0wz
cmlwcpeel0096cb8r6bmiqbdn	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlu7r3sw0000cb3g378fbed9
cmlwcpeel0097cb8rwe3bi7y5	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcpeel0098cb8r9zdrmxro	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlsc203j0006cb9beqs6h0lu
cmlwcpeel0099cb8rpus7bpq1	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlsbe6s60000cb1e7ptwu529
cmlwcpeel009acb8rfu5osmrw	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlsbe6sc0004cb1eol4zwzpb
cmlwcpeel009bcb8rmlxhzgym	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlv8c3nz0014cbpdjg341v8k
cmlwcpeel009ccb8rzpecmbbt	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcpeel009dcb8rmendk3j9	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlsfzkhs0000cbhr4aepkex5
cmlwcpeel009ecb8rwu45mhk2	f6da568d-ca5b-489e-bf4b-8b18e3fad6dd	cmlu963vh000gcbpdn5tsbr7f
cmlwcq1t0009jcb8r4zi4sn8e	058b3068-a232-4b9c-9b69-e02774b162ab	cmlu7r3sw0000cb3g378fbed9
cmlwcq1t0009kcb8rqre0xlwj	058b3068-a232-4b9c-9b69-e02774b162ab	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcq1t0009lcb8rrqpd37yb	058b3068-a232-4b9c-9b69-e02774b162ab	cmlsc203j0006cb9beqs6h0lu
cmlwcq1t0009mcb8rduy00ufv	058b3068-a232-4b9c-9b69-e02774b162ab	cmlsbe6s60000cb1e7ptwu529
cmlwcq1t0009ncb8r7qa31719	058b3068-a232-4b9c-9b69-e02774b162ab	cmlsbe6sc0004cb1eol4zwzpb
cmlwcq1t0009ocb8r0ax33di3	058b3068-a232-4b9c-9b69-e02774b162ab	cmlv8b1vm000ycbpdujzca0wz
cmlwcq1t0009pcb8rbgudth81	058b3068-a232-4b9c-9b69-e02774b162ab	cmlv9qtk00053cbpdp4r95510
cmlwcq1t0009qcb8r6lyhqmi1	058b3068-a232-4b9c-9b69-e02774b162ab	cmlsbe6sf0008cb1ex9y83irg
cmlwcq1t0009rcb8r01vlc5fa	058b3068-a232-4b9c-9b69-e02774b162ab	cmlu963vh000gcbpdn5tsbr7f
cmlwcq1t0009scb8ryijt66te	058b3068-a232-4b9c-9b69-e02774b162ab	cmlsfzkhs0000cbhr4aepkex5
cmlwcq1t0009tcb8rccdss08l	058b3068-a232-4b9c-9b69-e02774b162ab	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcq1t0009ucb8rol8ckk27	058b3068-a232-4b9c-9b69-e02774b162ab	cmlv8c3nz0014cbpdjg341v8k
cmlwcqfne009zcb8rp10yb1zm	792a36ef-61b1-4880-a61e-743c921a645d	cmlu7r3sw0000cb3g378fbed9
cmlwcqfne00a0cb8rxchddcjs	792a36ef-61b1-4880-a61e-743c921a645d	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcqfne00a1cb8rs20c84u0	792a36ef-61b1-4880-a61e-743c921a645d	cmlsc203j0006cb9beqs6h0lu
cmlwcqfne00a2cb8rgmt6oq7y	792a36ef-61b1-4880-a61e-743c921a645d	cmlsbe6s60000cb1e7ptwu529
cmlwcqfne00a3cb8ra3irscrj	792a36ef-61b1-4880-a61e-743c921a645d	cmlsbe6sc0004cb1eol4zwzpb
cmlwcqfne00a4cb8raorf7x75	792a36ef-61b1-4880-a61e-743c921a645d	cmlv8b1vm000ycbpdujzca0wz
cmlwcqfne00a5cb8rsap7v0yu	792a36ef-61b1-4880-a61e-743c921a645d	cmlv9qtk00053cbpdp4r95510
cmlwcqfne00a6cb8rbrbyc93z	792a36ef-61b1-4880-a61e-743c921a645d	cmlsbe6sf0008cb1ex9y83irg
cmlwcqfne00a7cb8rqwnuuldu	792a36ef-61b1-4880-a61e-743c921a645d	cmlu963vh000gcbpdn5tsbr7f
cmlwcqfne00a8cb8rrffde80y	792a36ef-61b1-4880-a61e-743c921a645d	cmlsfzkhs0000cbhr4aepkex5
cmlwcqfne00a9cb8rcfab4jx0	792a36ef-61b1-4880-a61e-743c921a645d	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcqfnf00aacb8rnrjmomhm	792a36ef-61b1-4880-a61e-743c921a645d	cmlv8c3nz0014cbpdjg341v8k
cmlwcqugv00aecb8rna074d5r	a0202ba0-8a57-4afd-b83f-151f83989711	cmlu963vh000gcbpdn5tsbr7f
cmlwcqugv00afcb8rgx0ovyn2	a0202ba0-8a57-4afd-b83f-151f83989711	cmlsbe6sf0008cb1ex9y83irg
cmlwcqugv00agcb8r0e5cm1ry	a0202ba0-8a57-4afd-b83f-151f83989711	cmlu7r3sw0000cb3g378fbed9
cmlwcqugv00ahcb8ryc41db7o	a0202ba0-8a57-4afd-b83f-151f83989711	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcqugv00aicb8rqbpnr8h8	a0202ba0-8a57-4afd-b83f-151f83989711	cmlsc203j0006cb9beqs6h0lu
cmlwcqugv00ajcb8r7nmt6aan	a0202ba0-8a57-4afd-b83f-151f83989711	cmlsbe6s60000cb1e7ptwu529
cmlwcqugv00akcb8rwb3tg1hc	a0202ba0-8a57-4afd-b83f-151f83989711	cmlv9qtk00053cbpdp4r95510
cmlwcqugv00alcb8rejccayy8	a0202ba0-8a57-4afd-b83f-151f83989711	cmlv8b1vm000ycbpdujzca0wz
cmlwcqugv00amcb8r0kom68pn	a0202ba0-8a57-4afd-b83f-151f83989711	cmlsbe6sc0004cb1eol4zwzpb
cmlwcqugv00ancb8r12kh3e9h	a0202ba0-8a57-4afd-b83f-151f83989711	cmlsfzkhs0000cbhr4aepkex5
cmlwcqugv00aocb8ryn1b46fe	a0202ba0-8a57-4afd-b83f-151f83989711	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcqugv00apcb8rrx524f9w	a0202ba0-8a57-4afd-b83f-151f83989711	cmlv8c3nz0014cbpdjg341v8k
cmlwcrbro00atcb8rqtsvpv38	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlu7r3sw0000cb3g378fbed9
cmlwcrbro00aucb8rz7gftjpi	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcrbro00avcb8ri6hwyaao	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlsc203j0006cb9beqs6h0lu
cmlwcrbro00awcb8rlgtuixti	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlsbe6s60000cb1e7ptwu529
cmlwcrbro00axcb8rjgf7o7cz	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlsbe6sf0008cb1ex9y83irg
cmlwcrbro00aycb8r4ljz5dt2	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlv9qtk00053cbpdp4r95510
cmlwcrbro00azcb8r7cro1vux	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlv8b1vm000ycbpdujzca0wz
cmlwcrbro00b0cb8r5ez41an6	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlsbe6sc0004cb1eol4zwzpb
cmlwcrbro00b1cb8ru69n4mmp	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlu963vh000gcbpdn5tsbr7f
cmlwcrbro00b2cb8rm3p1avru	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlsfzkhs0000cbhr4aepkex5
cmlwcrbro00b3cb8rmvp2li3y	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcrbro00b4cb8r2u9wwgad	96e790bc-ddad-484d-8ab6-e969fe2e9001	cmlv8c3nz0014cbpdjg341v8k
cmlwcrux900b8cb8r9ov04ywd	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlu7r3sw0000cb3g378fbed9
cmlwcrux900b9cb8rua9y6ppd	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcrux900bacb8rnfe8yfio	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlsc203j0006cb9beqs6h0lu
cmlwcrux900bbcb8rvv4beigx	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlsbe6s60000cb1e7ptwu529
cmlwcrux900bccb8r986v1cy3	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlsbe6sf0008cb1ex9y83irg
cmlwcrux900bdcb8rjk2e0xqa	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlv9qtk00053cbpdp4r95510
cmlwcrux900becb8rzivfvxt2	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlv8b1vm000ycbpdujzca0wz
cmlwcrux900bfcb8riz2ei48k	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlsbe6sc0004cb1eol4zwzpb
cmlwcrux900bgcb8rkaojcz5o	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlu963vh000gcbpdn5tsbr7f
cmlwcrux900bhcb8razi8fnea	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlsfzkhs0000cbhr4aepkex5
cmlwcrux900bicb8rt4z6epkv	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcrux900bjcb8rs7tvp1is	5a1cf561-cc22-42f8-bdae-0479cc290425	cmlv8c3nz0014cbpdjg341v8k
cmlwcsf4l00bocb8r53t6ovne	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlu7r3sw0000cb3g378fbed9
cmlwcsf4l00bpcb8riivk8pk8	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlv8a4vi000vcbpd7ldvhkc9
cmlwcsf4l00bqcb8r6q8lnsos	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlsc203j0006cb9beqs6h0lu
cmlwcsf4l00brcb8rsxw1mje9	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlsbe6s60000cb1e7ptwu529
cmlwcsf4l00bscb8r9izzohty	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlsbe6sf0008cb1ex9y83irg
cmlwcsf4l00btcb8rubxym6i5	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlv9qtk00053cbpdp4r95510
cmlwcsf4l00bucb8racj51yps	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlv8b1vm000ycbpdujzca0wz
cmlwcsf4l00bvcb8rcw6rkele	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlsbe6sc0004cb1eol4zwzpb
cmlwcsf4l00bwcb8rgev0xyo6	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlu963vh000gcbpdn5tsbr7f
cmlwcsf4l00bxcb8rynb4irsx	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlsfzkhs0000cbhr4aepkex5
cmlwcsf4l00bycb8r5xogz8wc	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcsf4l00bzcb8r2qe88x72	0e4ba94e-5429-47c6-bb32-91659dd4d019	cmlv8c3nz0014cbpdjg341v8k
cmlwcss5b00c3cb8r4rehyco1	8020becb-20d5-49c5-8d33-a9df196175a6	cmlsbe6sf0008cb1ex9y83irg
cmlwcss5b00c4cb8rr44tz8an	8020becb-20d5-49c5-8d33-a9df196175a6	cmlsc203j0006cb9beqs6h0lu
cmlwcss5b00c5cb8r0k0m13ij	8020becb-20d5-49c5-8d33-a9df196175a6	cmlsbe6sc0004cb1eol4zwzpb
cmlwcss5b00c6cb8rhzlnqebe	8020becb-20d5-49c5-8d33-a9df196175a6	cmlu7r3sw0000cb3g378fbed9
cmlwcss5b00c7cb8rhdxnsvyu	8020becb-20d5-49c5-8d33-a9df196175a6	cmlsbe6s60000cb1e7ptwu529
cmlwcss5b00c8cb8rr8kutsl8	8020becb-20d5-49c5-8d33-a9df196175a6	cmlsfzkhs0000cbhr4aepkex5
cmlwcss5b00c9cb8rszq04vqc	8020becb-20d5-49c5-8d33-a9df196175a6	cmlv9qtk00053cbpdp4r95510
cmlwcss5b00cacb8ri0e0cfv1	8020becb-20d5-49c5-8d33-a9df196175a6	cmlu963vh000gcbpdn5tsbr7f
cmlwcss5b00cbcb8r2sxf9rfl	8020becb-20d5-49c5-8d33-a9df196175a6	cmlv8c0ng0011cbpdjsm6ixsm
cmlwcss5b00cccb8rfm0x9bqc	8020becb-20d5-49c5-8d33-a9df196175a6	cmlv8c3nz0014cbpdjg341v8k
cmlwcss5b00cdcb8ru09rvuud	8020becb-20d5-49c5-8d33-a9df196175a6	cmlv8b1vm000ycbpdujzca0wz
cmlwcss5b00cecb8rumbtf9fn	8020becb-20d5-49c5-8d33-a9df196175a6	cmlv8a4vi000vcbpd7ldvhkc9
cmm6w9o1300048fqe72630sbw	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlu7r3sw0000cb3g378fbed9
cmm6w9o1300058fqe4mhaflx2	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlv8a4vi000vcbpd7ldvhkc9
cmm6w9o1300068fqezacu42as	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlsc203j0006cb9beqs6h0lu
cmm6w9o1300078fqe8uvvkf6u	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlsbe6s60000cb1e7ptwu529
cmm6w9o1300088fqercy08wsi	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlsbe6sf0008cb1ex9y83irg
cmm6w9o1300098fqeo5ncr945	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlv9qtk00053cbpdp4r95510
cmm6w9o13000a8fqedh4crcwi	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlv8b1vm000ycbpdujzca0wz
cmm6w9o13000b8fqelfp05d55	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlsbe6sc0004cb1eol4zwzpb
cmm6w9o13000c8fqej3hv6av1	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlu963vh000gcbpdn5tsbr7f
cmm6w9o13000d8fqelk3l34k5	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlsfzkhs0000cbhr4aepkex5
cmm6w9o13000e8fqewqbt7yeu	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlv8c0ng0011cbpdjsm6ixsm
cmm6w9o13000f8fqe7vrl09cn	260d7ef0-c4db-475f-be8b-edea05eb0c6b	cmlv8c3nz0014cbpdjg341v8k
cmm715eym00098f4o3yqc510v	6823540b-c18f-477a-b807-802deda531e9	cmlu7r3sw0000cb3g378fbed9
cmm715eym000a8f4oi446isuf	6823540b-c18f-477a-b807-802deda531e9	cmlsbe6sf0008cb1ex9y83irg
cmm715eym000b8f4ohtf9f4n0	6823540b-c18f-477a-b807-802deda531e9	cmlu963vh000gcbpdn5tsbr7f
cmm715eym000c8f4of6g6g8yn	6823540b-c18f-477a-b807-802deda531e9	cmlv8a4vi000vcbpd7ldvhkc9
cmm715eym000d8f4o9qvx8q52	6823540b-c18f-477a-b807-802deda531e9	cmlv9qtk00053cbpdp4r95510
cmm715eym000e8f4om83x5maf	6823540b-c18f-477a-b807-802deda531e9	cmlsfzkhs0000cbhr4aepkex5
cmm7uiriz000n8fj07xm0hz7v	fbacb428-eaa6-4b80-b81a-2a564412e5d0	cmlsbe6sf0008cb1ex9y83irg
cmm7uiriz000o8fj00ocp2w4o	fbacb428-eaa6-4b80-b81a-2a564412e5d0	cmlu7r3sw0000cb3g378fbed9
cmm7uiriz000p8fj0dxdhzmix	fbacb428-eaa6-4b80-b81a-2a564412e5d0	cmlu963vh000gcbpdn5tsbr7f
cmm7uiriz000q8fj00d4oxnab	fbacb428-eaa6-4b80-b81a-2a564412e5d0	cmlsfzkhs0000cbhr4aepkex5
cmm7uiriz000r8fj0w4pmwnpe	fbacb428-eaa6-4b80-b81a-2a564412e5d0	cmlv9qtk00053cbpdp4r95510
cmm7uiriz000s8fj0ncu4otyd	fbacb428-eaa6-4b80-b81a-2a564412e5d0	cmlv8a4vi000vcbpd7ldvhkc9
cmm7uk5g4000y8fj0e5audu0f	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlu7r3sw0000cb3g378fbed9
cmm7uk5g4000z8fj0uapapzxe	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlv8a4vi000vcbpd7ldvhkc9
cmm7uk5g400108fj09n3tr3xz	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlsc203j0006cb9beqs6h0lu
cmm7uk5g400118fj0chg22fjv	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlsbe6s60000cb1e7ptwu529
cmm7uk5g400128fj00ozefbhq	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlsbe6sf0008cb1ex9y83irg
cmm7uk5g400138fj0lqu4el6q	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlv9qtk00053cbpdp4r95510
cmm7uk5g400148fj0r3cuby20	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlv8b1vm000ycbpdujzca0wz
cmm7uk5g400158fj0gkx7lxtp	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlsbe6sc0004cb1eol4zwzpb
cmm7uk5g400168fj0nfws33pk	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlu963vh000gcbpdn5tsbr7f
cmm7uk5g400178fj0x4ymllyy	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlsfzkhs0000cbhr4aepkex5
cmm7uk5g400188fj03gtgsf5l	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlv8c0ng0011cbpdjsm6ixsm
cmm7uk5g400198fj0o39icnla	575ecb40-5150-4a9c-b1b0-db571e61143a	cmlv8c3nz0014cbpdjg341v8k
\.


--
-- Data for Name: WeeklyPlan; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WeeklyPlan" (id, "userId", "startDate", active, "createdAt", "updatedAt") FROM stdin;
cmlsbyze50001cb9b489n7m3z	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-15 03:00:00	t	2026-02-18 17:53:20.044	2026-02-18 17:53:20.044
cmlsf5g08000vcbcqkhxzr7ex	5108ec62-4dd4-4fd3-a367-0d7d21e58da7	2026-02-22 03:00:00	t	2026-02-18 19:22:20.361	2026-02-18 19:22:20.361
cmlu6au2j0001cbuc8r3dtkth	e0af36f5-a0ee-45bc-8c79-e650056d49b3	2026-02-15 03:00:00	t	2026-02-20 00:50:07.676	2026-02-20 00:50:07.676
cmlu8vc0x000acbpdru4p31rg	8020becb-20d5-49c5-8d33-a9df196175a6	2026-02-15 03:00:00	t	2026-02-20 02:02:03.297	2026-02-20 02:02:03.297
cmlve4rg1000ecbon6lpgnggx	e0af36f5-a0ee-45bc-8c79-e650056d49b3	2026-02-22 03:00:00	t	2026-02-20 21:17:07.441	2026-02-20 21:17:07.441
cmlwd76a100cicb8r1cgdl557	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-15 03:00:00	t	2026-02-21 13:38:46.536	2026-02-21 13:38:46.536
cmlwdb7uz00docb8r5m6m5zcx	f57df311-f79e-4b5c-a25a-3843c3132215	2026-02-15 03:00:00	t	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211
cmlwdby9900e8cb8rmxq0lnrm	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-02-15 03:00:00	t	2026-02-21 13:42:29.421	2026-02-21 13:42:29.421
cmlwde55n00focb8rn9mygjl6	d6ffaa51-78a2-451d-aa3d-cbc8a67cfbaa	2026-02-15 03:00:00	t	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63
cmlwdlrgd00hgcb8r52392tf4	96e790bc-ddad-484d-8ab6-e969fe2e9001	2026-02-15 03:00:00	t	2026-02-21 13:50:07.118	2026-02-21 13:50:07.118
cmm46y5ja00018fhhsioniy05	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-02-22 03:00:00	t	2026-02-27 01:05:57.38	2026-02-27 01:05:57.38
cmm6itk92000j8f07pro960rv	f57df311-f79e-4b5c-a25a-3843c3132215	2026-02-22 03:00:00	t	2026-02-28 16:13:50.918	2026-02-28 16:13:50.918
cmm6ksrnw00018fs7hl0184x0	a0202ba0-8a57-4afd-b83f-151f83989711	2026-02-22 03:00:00	t	2026-02-28 17:09:13.098	2026-02-28 17:09:13.098
cmm77anwx000g8f4o88g49jzt	6823540b-c18f-477a-b807-802deda531e9	2026-03-01 03:00:00	t	2026-03-01 03:38:59.601	2026-03-01 03:38:59.601
cmm77bpwd000m8f4omldffh19	6823540b-c18f-477a-b807-802deda531e9	2026-03-08 03:00:00	t	2026-03-01 03:39:48.83	2026-03-01 03:39:48.83
cmm7uhn1m00018fj0ds4uzk0w	0e4ba94e-5429-47c6-bb32-91659dd4d019	2026-03-01 03:00:00	t	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233
cmm7ukvmy001e8fj06higyw45	575ecb40-5150-4a9c-b1b0-db571e61143a	2026-03-01 03:00:00	t	2026-03-01 14:30:47.338	2026-03-01 14:30:47.338
cmm7w1luy00018fz1fc3rulo3	5a1cf561-cc22-42f8-bdae-0479cc290425	2026-03-01 03:00:00	t	2026-03-01 15:11:47.434	2026-03-01 15:11:47.434
\.


--
-- Data for Name: WeeklyPlanItem; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."WeeklyPlanItem" (id, "planId", "dayOfWeek", "blockIndex", "subjectId", content, "durationMinutes", notes, "questionsDone", "correctCount", completed, "createdAt", "updatedAt", "studyLogId") FROM stdin;
cmlwdb7uz00dqcb8reyams196	cmlwdb7uz00docb8r5m6m5zcx	0	1	cmlsbe6s60000cb1e7ptwu529	Questões	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlu8vc0x000ccbpdyo30r1b4	cmlu8vc0x000acbpdru4p31rg	4	1	cmlsbe6sf0008cb1ex9y83irg	Questões	60	https://www.uol.com.br/	\N	\N	f	2026-02-20 02:02:03.297	2026-02-20 02:02:03.297	\N
cmlwdb7uz00drcb8rvfbyx3me	cmlwdb7uz00docb8r5m6m5zcx	2	1	cmlv8a4vi000vcbpd7ldvhkc9	Introdução e Princípios	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlu49y81000scbtkc6a6kkmr	cmlsbyze50001cb9b489n7m3z	1	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	30	asdasd	50	45	t	2026-02-19 23:53:27.168	2026-02-20 02:30:15.941	cmlu9vm2q000scbpd0avvbadp
cmlve4rg1000gcbongyn9lrk6	cmlve4rg1000ecbon6lpgnggx	1	1	cmlsbe6sf0008cb1ex9y83irg	Dos direitos políticos	60	oasijdfasdfasdfas	\N	\N	f	2026-02-20 21:17:07.441	2026-02-20 21:17:07.441	\N
cmlu49y81000rcbtkosfu2am7	cmlsbyze50001cb9b489n7m3z	5	2	cmlsc203j0006cb9beqs6h0lu	Questões	60	do tocantins\n	10	6	t	2026-02-19 23:53:27.168	2026-02-19 23:57:57.304	cmlu4fqnq0016cbtk8w90jolg
cmlu49y81000pcbtk4jbcfs91	cmlsbyze50001cb9b489n7m3z	4	1	cmlsbe6sf0008cb1ex9y83irg	Questões	60	\N	30	19	t	2026-02-19 23:53:27.168	2026-02-19 23:59:05.957	cmlu4h7mq001acbtknw0pm6ze
cmlu49y81000ocbtk1y3o0g5b	cmlsbyze50001cb9b489n7m3z	4	2	cmlsc203j0006cb9beqs6h0lu	Questões	60	\N	15	10	t	2026-02-19 23:53:27.168	2026-02-19 23:59:12.555	cmlu4hcq0001ccbtklxsh2t97
cmlu49y81000ncbtk02azyi86	cmlsbyze50001cb9b489n7m3z	5	1	cmlsbe6sc0004cb1eol4zwzpb	Thermodynamics	60	\N	\N	\N	t	2026-02-19 23:53:27.168	2026-02-19 23:59:14.276	cmlu4he1u001ecbtkxphevpf4
cmlu49y81000qcbtk57gkqlpr	cmlsbyze50001cb9b489n7m3z	6	1	cmlsfzkhs0000cbhr4aepkex5	\N	60	\N	\N	\N	t	2026-02-19 23:53:27.168	2026-02-19 23:59:16.561	cmlu4hftb001gcbtkrgqml8s4
cmlu49y81000tcbtk5xion9gv	cmlsbyze50001cb9b489n7m3z	3	1	cmlsbe6s60000cb1e7ptwu529	Geometry	60	\N	\N	\N	t	2026-02-19 23:53:27.168	2026-02-19 23:58:57.447	\N
cmlu5wvb80008cbehb9ru3mne	cmlsf5g08000vcbcqkhxzr7ex	1	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	\N	\N	\N	f	2026-02-20 00:39:16.099	2026-02-20 00:39:16.099	\N
cmlu5wvb80009cbehlr7qlmsz	cmlsf5g08000vcbcqkhxzr7ex	2	1	cmlsc203j0006cb9beqs6h0lu	Questões	60	\N	\N	\N	f	2026-02-20 00:39:16.099	2026-02-20 00:39:16.099	\N
cmlu5wvb8000acbehg93s9pq7	cmlsf5g08000vcbcqkhxzr7ex	3	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	\N	\N	\N	f	2026-02-20 00:39:16.099	2026-02-20 00:39:16.099	\N
cmlu5wvb8000bcbehecuvemer	cmlsf5g08000vcbcqkhxzr7ex	3	2	cmlsbe6sf0008cb1ex9y83irg	Questões	60	\N	\N	\N	f	2026-02-20 00:39:16.099	2026-02-20 00:39:16.099	\N
cmlwdb7uz00dscb8rhk6jmiex	cmlwdb7uz00docb8r5m6m5zcx	4	1	cmlu7r3sw0000cb3g378fbed9	Introdução e Princípios	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlwdb7uz00dtcb8rvt8uu9r8	cmlwdb7uz00docb8r5m6m5zcx	5	1	cmlsbe6sf0008cb1ex9y83irg	Princípios Fundamentais da República	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlwdb7uz00ducb8rj2vcjfch	cmlwdb7uz00docb8r5m6m5zcx	0	2	cmlu963vh000gcbpdn5tsbr7f	Teoria do Crime - Fato Típico	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlwdb7uz00dvcb8rldbhgm2l	cmlwdb7uz00docb8r5m6m5zcx	2	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.343/2006 - Tráfico de drogas	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlwdb7uz00dwcb8r3stwk5rx	cmlwdb7uz00docb8r5m6m5zcx	4	2	cmlu963vh000gcbpdn5tsbr7f	Teoria do Crime - Fato Típico	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlwdb7uz00dxcb8r8r2ualzz	cmlwdb7uz00docb8r5m6m5zcx	5	2	cmlsbe6s60000cb1e7ptwu529	Questões	60	\N	\N	\N	f	2026-02-21 13:41:55.211	2026-02-21 13:41:55.211	\N
cmlwd76a100clcb8rj3bbphyb	cmlwd76a100cicb8r1cgdl557	0	2	cmlsbe6sf0008cb1ex9y83irg	Princípios Fundamentais da República	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:43:31.831	cmlwddaet00eucb8rgxac7t11
cmlwd76a100cncb8rema8xxqu	cmlwd76a100cicb8r1cgdl557	1	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.343/2006 - Tráfico de drogas	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:43:33.584	cmlwddbrh00ewcb8r12doygck
cmlwd76a100cmcb8rkkgub3vt	cmlwd76a100cicb8r1cgdl557	1	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	\N	30	22	t	2026-02-21 13:38:46.536	2026-02-21 13:43:39.168	cmlwddg2l00ficb8rrqfyu630
cmlwd76a100cocb8rmawez7u1	cmlwd76a100cicb8r1cgdl557	1	3	cmlv8c0ng0011cbpdjsm6ixsm	Revisão	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:43:40.375	cmlwddh0500fkcb8rlnkt34gg
cmlwd76a100cpcb8rs4wx6jbg	cmlwd76a100cicb8r1cgdl557	2	1	cmlu963vh000gcbpdn5tsbr7f	Teoria do Crime - Fato Típico	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:43:42.178	cmlwddict00fmcb8rpjhhi6oc
cmlwd76a100crcb8rds71ci1c	cmlwd76a100cicb8r1cgdl557	2	3	cmlv8c0ng0011cbpdjsm6ixsm	Questões	60	\N	10	8	t	2026-02-21 13:38:46.536	2026-02-21 13:44:32.5	cmlwdel8100g8cb8r7n68x94t
cmlwd76a100cqcb8roht47ksk	cmlwd76a100cicb8r1cgdl557	2	2	cmlv8a4vi000vcbpd7ldvhkc9	Inquérito Policial	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:40.491	cmlwdere000gscb8rnzusto0v
cmlwd76a100cucb8rvgz5qjf2	cmlwd76a100cicb8r1cgdl557	3	3	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	\N	10	9	t	2026-02-21 13:38:46.536	2026-02-21 13:44:46.407	cmlwdevyd00gucb8r0dh489fo
cmlwd76a100ctcb8rrv7q1c7h	cmlwd76a100cicb8r1cgdl557	3	2	cmlv8c0ng0011cbpdjsm6ixsm	Morfologia	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:47.91	cmlwdex4400gwcb8rd4imjqbr
cmlwd76a100cscb8r1d8w7ijb	cmlwd76a100cicb8r1cgdl557	3	1	cmlu7r3sw0000cb3g378fbed9	Organização Administrativa	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:48.582	cmlwdexms00gycb8rxo7bidif
cmlwd76a100cwcb8rrushhou8	cmlwd76a100cicb8r1cgdl557	4	2	cmlsc203j0006cb9beqs6h0lu	Geografia do Tocantins	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:51.755	cmlwdf02w00h0cb8rfirmzepj
cmlwd76a100cvcb8rtfbfbmch	cmlwd76a100cicb8r1cgdl557	4	1	cmlsc203j0006cb9beqs6h0lu	Geografia do Tocantins	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:52.371	cmlwdf0k200h2cb8rq6fmnwq5
cmlwd76a200cxcb8rsze84h6r	cmlwd76a100cicb8r1cgdl557	4	3	cmlv8c0ng0011cbpdjsm6ixsm	Revisão	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:53.308	cmlwdf1a200h4cb8rnd9tns4j
cmlwd76a200czcb8ruwyv2aml	cmlwd76a100cicb8r1cgdl557	5	2	cmlv9qtk00053cbpdp4r95510	Geografia do Tocantins	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:56.718	cmlwdf3ws00h6cb8rv27fkuex
cmlwd76a200cycb8rg5n5h9s6	cmlwd76a100cicb8r1cgdl557	5	1	cmlv9qtk00053cbpdp4r95510	Geografia do Tocantins	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:58.706	cmlwdf5g000h8cb8rqq5f11lo
cmlwd76a200d0cb8r7jnvkzvx	cmlwd76a100cicb8r1cgdl557	5	3	cmlv8c0ng0011cbpdjsm6ixsm	Morfologia	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:44:59.926	cmlwdf6dw00hacb8rqc2q42ld
cmlwd76a200d1cb8rsuoguonw	cmlwd76a100cicb8r1cgdl557	6	1	cmlu963vh000gcbpdn5tsbr7f	Introdução ao Direito Penal	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:45:01.261	cmlwdf7ez00hccb8rzslvz1m7
cmlwd76a200d2cb8rw8yh8pyy	cmlwd76a100cicb8r1cgdl557	6	2	cmlv8a4vi000vcbpd7ldvhkc9	Inquérito Policial	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:45:01.879	cmlwdf7w500hecb8rz5ckju1q
cmlwd76a100ckcb8roj1zcytq	cmlwd76a100cicb8r1cgdl557	0	1	cmlv8c0ng0011cbpdjsm6ixsm	Morfologia	60	\N	\N	\N	t	2026-02-21 13:38:46.536	2026-02-21 13:43:30.135	cmlwdd93m00escb8rdj6ypk1b
cmlwde55n00fqcb8rj67pwnsw	cmlwde55n00focb8rn9mygjl6	0	1	cmlsbe6sf0008cb1ex9y83irg	Dos direitos Sociais	60	\N	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwde55n00frcb8rvgc3yzj4	cmlwde55n00focb8rn9mygjl6	0	2	cmlv8c0ng0011cbpdjsm6ixsm	Processo de Formação de Palavras	60	https://www.uol.com.br/	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwde55n00fscb8rbcrv6a4d	cmlwde55n00focb8rn9mygjl6	2	1	cmlv8a4vi000vcbpd7ldvhkc9	Jurisdição e Competência	60	\N	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwde55n00ftcb8r2cwcwwq4	cmlwde55n00focb8rn9mygjl6	1	1	cmlu963vh000gcbpdn5tsbr7f	Concurso de Pessoas	60	\N	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwde55n00fucb8r9muvb0zp	cmlwde55n00focb8rn9mygjl6	3	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	\N	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwde55n00fvcb8r8oa4d4is	cmlwde55n00focb8rn9mygjl6	4	1	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.340/2006 - Lei Maria da penha	60	\N	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwde55n00fwcb8rn8tfbdek	cmlwde55n00focb8rn9mygjl6	5	1	cmlv8c3nz0014cbpdjg341v8k	Questões	60	\N	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwde55n00fxcb8rnn5vb878	cmlwde55n00focb8rn9mygjl6	6	1	cmlv8c0ng0011cbpdjsm6ixsm	Colocação Pronominal	60	\N	\N	\N	f	2026-02-21 13:44:11.63	2026-02-21 13:44:11.63	\N
cmlwdeqsn00gkcb8r4dbu8ntg	cmlu6au2j0001cbuc8r3dtkth	2	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	Link da apostila: https://drive.google.com/drive/folders/1BIcsU5D18hGHvCutDtMU5tmyI6KQBtb6?usp=sharing	\N	\N	f	2026-02-21 13:44:39.718	2026-02-21 13:44:39.718	\N
cmlwdeqsn00glcb8rmmtpdkry	cmlu6au2j0001cbuc8r3dtkth	3	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	\N	\N	\N	f	2026-02-21 13:44:39.718	2026-02-21 13:44:39.718	\N
cmlwdeqsn00gmcb8rsrbsujp3	cmlu6au2j0001cbuc8r3dtkth	4	1	cmlsbe6sc0004cb1eol4zwzpb	Questões	60	\N	\N	\N	f	2026-02-21 13:44:39.718	2026-02-21 13:44:39.718	\N
cmlwdeqsn00gncb8rpp2nhwik	cmlu6au2j0001cbuc8r3dtkth	5	1	cmlv8a4vi000vcbpd7ldvhkc9	Provas	60	\N	\N	\N	f	2026-02-21 13:44:39.718	2026-02-21 13:44:39.718	\N
cmlwdeqsn00gocb8ry69qzvrh	cmlu6au2j0001cbuc8r3dtkth	1	1	cmlv8a4vi000vcbpd7ldvhkc9	Provas	60	\N	\N	\N	f	2026-02-21 13:44:39.718	2026-02-21 13:44:39.718	\N
cmlwdeqsn00gpcb8rwcspnb3d	cmlu6au2j0001cbuc8r3dtkth	0	1	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.343/2006 - Tráfico de drogas	60	\N	\N	\N	f	2026-02-21 13:44:39.718	2026-02-21 13:44:39.718	\N
cmlwdeqsn00gqcb8r70eloux6	cmlu6au2j0001cbuc8r3dtkth	6	1	cmlv8b1vm000ycbpdujzca0wz	Lei nº 8.072/1990 - crimes hediondos	60	\N	\N	\N	f	2026-02-21 13:44:39.718	2026-02-21 13:44:39.718	\N
cmlwdder700f9cb8rvpnfxgy5	cmlwdby9900e8cb8rmxq0lnrm	0	1	cmlsbe6sf0008cb1ex9y83irg	Da Nacionalidade	60	https://www.uol.com.br/	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:47.266	cmlwdp6zh00i6cb8rykengznl
cmlwdder700fbcb8rteolox0p	cmlwdby9900e8cb8rmxq0lnrm	1	1	cmlsbe6sf0008cb1ex9y83irg	Princípios Fundamentais da República	60	\N	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:48.73	cmlwdp84800i8cb8rhust8qrk
cmlwdder700facb8rcmbc9b46	cmlwdby9900e8cb8rmxq0lnrm	2	1	cmlsbe6sc0004cb1eol4zwzpb	\N	60	https://www.uol.com.br/	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:49.497	cmlwdp8pc00iacb8rp64sc6iy
cmlwdder700fecb8rpy0dxl7p	cmlwdby9900e8cb8rmxq0lnrm	3	1	cmlv8a4vi000vcbpd7ldvhkc9	\N	60	\N	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:50.516	cmlwdp9hu00iccb8r529qpr5l
cmlwdder700ffcb8rdk7erzlb	cmlwdby9900e8cb8rmxq0lnrm	4	1	cmlv8b1vm000ycbpdujzca0wz	\N	60	https://www.uol.com.br/	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:51.041	cmlwdp9wf00iecb8r1c1g74c4
cmlwdder700fccb8rfcsi8lye	cmlwdby9900e8cb8rmxq0lnrm	5	1	cmlv8b1vm000ycbpdujzca0wz	\N	60	\N	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:52.121	cmlwdpaqf00igcb8rbe5v18bm
cmlwdder700fdcb8r5f549usq	cmlwdby9900e8cb8rmxq0lnrm	5	2	cmlv8c0ng0011cbpdjsm6ixsm	\N	60	https://www.uol.com.br/	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:53.303	cmlwdpbn900iicb8rhvc80161
cmlwdder700fgcb8ru5o4y3kj	cmlwdby9900e8cb8rmxq0lnrm	6	1	cmlv8c0ng0011cbpdjsm6ixsm	\N	60	\N	\N	\N	t	2026-02-21 13:43:37.459	2026-02-21 13:52:54.01	cmlwdpc6w00ikcb8r3evlp2jt
cmlwdlrgd00hncb8r0tsk3s5k	cmlwdlrgd00hgcb8r52392tf4	6	1	cmlv8c0ng0011cbpdjsm6ixsm	Revisão	180	Estude aqui: https://www.uol.com.br/	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:13.671	cmlwdprd100imcb8r7dt8byaj
cmlwdlrge00hscb8rgd7clacq	cmlwdlrgd00hgcb8r52392tf4	5	2	cmlu963vh000gcbpdn5tsbr7f	Concurso de Pessoas	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:14.118	cmlwdprpg00iocb8r0wcjnxg2
cmlwdlrgd00hmcb8rvzwjmj94	cmlwdlrgd00hgcb8r52392tf4	5	1	cmlu963vh000gcbpdn5tsbr7f	Teoria do Crime - Ilicitude	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:14.641	cmlwdps3v00iqcb8rtcjvuzm5
cmlwdlrge00hrcb8rkqdm1e7k	cmlwdlrgd00hgcb8r52392tf4	4	2	cmlu963vh000gcbpdn5tsbr7f	Concurso de Pessoas	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:15.601	cmlwdpsun00iscb8rft4it652
cmlwdlrgd00hlcb8r76s0tmp9	cmlwdlrgd00hgcb8r52392tf4	4	1	cmlu7r3sw0000cb3g378fbed9	Atos Administrativos	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:16.429	cmlwdpthm00iucb8re6j61p9x
cmlwdlrgd00hqcb8r21ftb20h	cmlwdlrgd00hgcb8r52392tf4	3	2	cmlv8a4vi000vcbpd7ldvhkc9	Provas	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:17.317	cmlwdpu6b00iwcb8r27do7qgi
cmlwdlrgd00hkcb8rlai803rl	cmlwdlrgd00hgcb8r52392tf4	3	1	cmlu963vh000gcbpdn5tsbr7f	Teoria do Crime - Ilicitude	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:17.681	cmlwdpugf00iycb8rh61j8awq
cmlwdlrgd00hpcb8rx4nq0d2w	cmlwdlrgd00hgcb8r52392tf4	2	2	cmlu963vh000gcbpdn5tsbr7f	Tentativa e Consumação	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:19.427	cmlwdpvsx00j0cb8rx00483n2
cmlwdlrgd00hjcb8r16996o23	cmlwdlrgd00hgcb8r52392tf4	2	1	cmlu7r3sw0000cb3g378fbed9	Agentes Públicos	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:19.784	cmlwdpw2u00j2cb8rp18j2y97
cmlwdlrgd00hocb8rre83cg1b	cmlwdlrgd00hgcb8r52392tf4	1	2	cmlu963vh000gcbpdn5tsbr7f	Erro	60	\N	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:20.837	cmlwdpww300j4cb8ravptj3cp
cmlwdlrgd00hicb8rxvxe25sr	cmlwdlrgd00hgcb8r52392tf4	1	1	cmlu7r3sw0000cb3g378fbed9	Controle da Administração	60	sdf	\N	\N	t	2026-02-21 13:50:07.118	2026-02-21 13:53:21.218	cmlwdpx6n00j6cb8ri193fwhd
cmm4xf4tf000e8f1zyvnxfazr	cmm46y5ja00018fhhsioniy05	0	1	cmlv8c0ng0011cbpdjsm6ixsm	Pontuação	60	https://www.youtube.com/?themeRefresh=1	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:09:57.899	cmm6iokfu00018f07ygeopqmz
cmm4xf4tf000f8f1zvk2d38mr	cmm46y5ja00018fhhsioniy05	0	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.343/2006 - Tráfico de drogas	60	\N	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:09:59.475	cmm6iolnz00038f078qxk40vu
cmm4xf4tf000l8f1z9stt8fck	cmm46y5ja00018fhhsioniy05	1	1	cmlsc203j0006cb9beqs6h0lu	Questões	60	\N	50	47	t	2026-02-27 13:26:59.615	2026-02-28 16:10:05.871	cmm6ioqlp00058f07i6ga0jh7
cmm4xf4tf000d8f1zhs0kipla	cmm46y5ja00018fhhsioniy05	2	1	cmlsbe6sf0008cb1ex9y83irg	Dos direitos Sociais	60	\N	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:10:12.699	cmm6iovva00078f07xa40nq6u
cmm4xf4tf000i8f1z7qemzbvf	cmm46y5ja00018fhhsioniy05	2	2	cmlu963vh000gcbpdn5tsbr7f	Erro	60	\N	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:10:15.047	cmm6ioxok00098f07nn95pm8d
cmm4xf4tf000g8f1zf87xpand	cmm46y5ja00018fhhsioniy05	6	1	cmlu963vh000gcbpdn5tsbr7f	Concurso de Pessoas	60	\N	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:10:18.221	cmm6ip04r000b8f0759722msc
cmm4xf4tf000k8f1zd1803qps	cmm46y5ja00018fhhsioniy05	6	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.343/2006 - Tráfico de drogas	60	\N	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:10:19.051	cmm6ip0rt000d8f07qxyb9rl7
cmm4xf4tf000h8f1z3yrqi8t7	cmm46y5ja00018fhhsioniy05	4	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 8.072/1990 - crimes hediondos	60	\N	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:10:50.14	cmm6iporc000f8f07qgsgp0ab
cmm4xf4tf000j8f1zlhaxgiua	cmm46y5ja00018fhhsioniy05	4	1	cmlu7r3sw0000cb3g378fbed9	Atos Administrativos	60	\N	\N	\N	t	2026-02-27 13:26:59.615	2026-02-28 16:10:50.623	cmm6ipp4r000h8f07tsshrmd7
cmm6itk93000l8f071df615nz	cmm6itk92000j8f07pro960rv	1	1	cmlu7r3sw0000cb3g378fbed9	Atos Administrativos	60	Estuda a aula 01 e 02 do drive: ajaj	\N	\N	f	2026-02-28 16:13:50.918	2026-02-28 16:13:50.918	\N
cmm6itk93000m8f07c954buiq	cmm6itk92000j8f07pro960rv	1	2	cmlu963vh000gcbpdn5tsbr7f	Introdução ao Direito Penal	60	\N	\N	\N	f	2026-02-28 16:13:50.918	2026-02-28 16:13:50.918	\N
cmm6ksrnw00038fs7aagwfvom	cmm6ksrnw00018fs7hl0184x0	1	1	cmlu7r3sw0000cb3g378fbed9	Atos Administrativos	60	Estuda a aula 01 e 02 do drive: ajaj	\N	\N	f	2026-02-28 17:09:13.098	2026-02-28 17:09:13.098	\N
cmm6ksrnw00048fs7gzw6x4lw	cmm6ksrnw00018fs7hl0184x0	1	2	cmlu963vh000gcbpdn5tsbr7f	Introdução ao Direito Penal	60	\N	\N	\N	f	2026-02-28 17:09:13.098	2026-02-28 17:09:13.098	\N
cmm77anwx000i8f4ozoci2fcd	cmm77anwx000g8f4o88g49jzt	2	1	cmlu7r3sw0000cb3g378fbed9	Introdução e Princípios	60	\N	\N	\N	f	2026-03-01 03:38:59.601	2026-03-01 03:38:59.601	\N
cmm77bpwd000o8f4o5ipj1lhw	cmm77bpwd000m8f4omldffh19	2	1	cmlu7r3sw0000cb3g378fbed9	Introdução e Princípios	60	\N	\N	\N	f	2026-03-01 03:39:48.83	2026-03-01 03:39:48.83	\N
cmm7uhn1m00038fj04bt6uu4w	cmm7uhn1m00018fj0ds4uzk0w	0	1	cmlv8c0ng0011cbpdjsm6ixsm	Pontuação	60	https://www.youtube.com/?themeRefresh=1	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m00048fj0i85hywpo	cmm7uhn1m00018fj0ds4uzk0w	0	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.343/2006 - Tráfico de drogas	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m00058fj0bnlp9j92	cmm7uhn1m00018fj0ds4uzk0w	1	1	cmlsc203j0006cb9beqs6h0lu	Questões	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m00068fj0la842w5b	cmm7uhn1m00018fj0ds4uzk0w	2	1	cmlsbe6sf0008cb1ex9y83irg	Dos direitos Sociais	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m00078fj09lz2fc9a	cmm7uhn1m00018fj0ds4uzk0w	2	2	cmlu963vh000gcbpdn5tsbr7f	Erro	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m00088fj07hrg8do2	cmm7uhn1m00018fj0ds4uzk0w	6	1	cmlu963vh000gcbpdn5tsbr7f	Concurso de Pessoas	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m00098fj0tcjag2wq	cmm7uhn1m00018fj0ds4uzk0w	6	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 11.343/2006 - Tráfico de drogas	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m000a8fj0nyv3pmuw	cmm7uhn1m00018fj0ds4uzk0w	4	2	cmlv8b1vm000ycbpdujzca0wz	Lei nº 8.072/1990 - crimes hediondos	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7uhn1m000b8fj0sn3rhz86	cmm7uhn1m00018fj0ds4uzk0w	4	1	cmlu7r3sw0000cb3g378fbed9	Atos Administrativos	60	\N	\N	\N	f	2026-03-01 14:28:16.233	2026-03-01 14:28:16.233	\N
cmm7ukvmy001g8fj0u2s2y8bv	cmm7ukvmy001e8fj06higyw45	2	1	cmlu7r3sw0000cb3g378fbed9	Introdução e Princípios	60	\N	\N	\N	f	2026-03-01 14:30:47.338	2026-03-01 14:30:47.338	\N
cmm7w1luy00068fz1s703rbzg	cmm7w1luy00018fz1fc3rulo3	2	4	cmlv8a4vi000vcbpd7ldvhkc9	Questões	30	10 questoes art 1 ao 28	\N	\N	f	2026-03-01 15:11:47.434	2026-03-01 15:11:47.434	\N
cmm7w1luy00038fz15osmroh1	cmm7w1luy00018fz1fc3rulo3	2	1	cmlsbe6sf0008cb1ex9y83irg	Da segurança pública	30	Leitura do artigo 144: https://www.planalto.gov.br/ccivil_03/constituicao/constituicao.htm	\N	\N	t	2026-03-01 15:11:47.434	2026-03-01 15:12:11.434	cmm7w24dg000d8fz1itipik3d
cmm7w1luy00048fz1obojcyil	cmm7w1luy00018fz1fc3rulo3	2	2	cmlv8a4vi000vcbpd7ldvhkc9	Aplicação da Lei Processual Penal	60	Leitura do artigo 1 ao 28. Link https://www.planalto.gov.br/ccivil_03/decreto-lei/del3689compilado.htm	\N	\N	t	2026-03-01 15:11:47.434	2026-03-01 15:12:18.716	cmm7w29zt000f8fz19ns46a1i
cmm7w1luy00058fz15zi23fd3	cmm7w1luy00018fz1fc3rulo3	2	3	cmlsbe6sf0008cb1ex9y83irg	Questões	60	10 questoes do art. 144	10	8	t	2026-03-01 15:11:47.434	2026-03-01 15:12:31.394	cmm7w2js0000h8fz1f7sjuffc
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
a8cfb25a-2778-4ae2-aa2c-31ce6f6a0582	02ce17d2e6fc3773d25e371474640dc411f5427e36fbc454d34ad9784f6fde52	2026-02-18 14:37:08.044781-03	20260213192007_init	\N	\N	2026-02-18 14:37:08.024084-03	1
dda1aafc-0645-4aba-9075-328af05337e9	abc71a653ee942327abd3f3222ad82ab113a7b9556b668c0746b8dd5017da7cd	2026-02-18 14:37:08.047482-03	20260213195528_update_studylog	\N	\N	2026-02-18 14:37:08.045514-03	1
5e2060a2-4548-4ce6-b7a1-475e40446252	d8a0be18fee383381b52ee7cee904ce4c908dc36c68d2040fe57c0588347e1a1	2026-02-18 14:37:08.063973-03	20260213220857_subjects_contents_user_relation	\N	\N	2026-02-18 14:37:08.048517-03	1
a2713882-55ab-410e-87b2-be1df7bb399b	316f2f547a05021bd43b5f0ab7f2e423beeba2ede60acea46c7d8053125d4233	2026-02-18 14:37:08.071734-03	20260214123325_structural_improvements	\N	\N	2026-02-18 14:37:08.065391-03	1
28daad88-941f-41da-a7a1-ed694084831c	e6ac885b9addac70891fa311d1703cf48052dc5ce2abb9afd53db2669558f4d6	2026-02-18 14:37:08.07498-03	20260214142035_add_description_active	\N	\N	2026-02-18 14:37:08.072579-03	1
e9d2be78-4e2a-403c-98d1-55e2f172ef15	75eaba547b633bcaf49f05fe9bc5021a3a368c61670ed6acd9f5781bdf3b6d89	2026-02-18 14:37:08.093868-03	20260214144220_add_concursos_users	\N	\N	2026-02-18 14:37:08.075894-03	1
3edcf6e2-bab1-4572-a524-ce7092098428	af7f56540ddcb30f85a85d0955a789397384b596fcb16d77417426240aecb78c	2026-02-18 14:37:08.09842-03	20260214145305_add_cascade_to_usersubject	\N	\N	2026-02-18 14:37:08.094685-03	1
8edc2b6b-deed-4740-a29a-9eba9ffafd0b	418008febbfbff5ade34afdd95706f3386af64449d3207e0ce128280730fac08	2026-02-18 14:37:08.109342-03	20260217130752_add_study_log_history	\N	\N	2026-02-18 14:37:08.099965-03	1
4c997216-49ae-4252-a8fe-008447e464eb	8318116742b8b64180ea8c5b033ccea0daeedb38ef4afbb1396b4801584289ad	2026-02-18 14:37:08.120922-03	20260217180436_add_featured_student	\N	\N	2026-02-18 14:37:08.110409-03	1
ed98166e-bc6c-4e58-9c7a-47b137fc202e	c1739fef6161ea06cbf9ecf8481bc0e1f5b8d9721f7d3c7e45c6c9d5c4149b4d	2026-02-18 14:37:08.150115-03	20260218173636_sync_schema	\N	\N	2026-02-18 14:37:08.122582-03	1
010591f7-0276-49e4-91df-0d28cbb06550	5941c1f1bc7adfb6611b88dbae2498657cfca073a9c874057badc4d2fb3be983	2026-02-18 16:59:46.421495-03	20260218195946_add_user_profile_fields	\N	\N	2026-02-18 16:59:46.418104-03	1
6758ae07-d1ef-41d8-b28c-1420002bc77f	b3fa9c2e6a398d00cc55e8cdeaeaad5c567ae7f94ffb6e32ea2b80cc261c1297	2026-02-28 13:42:47.241655-03	20260228164247_add_mentorship_link	\N	\N	2026-02-28 13:42:47.216631-03	1
ccd8f153-b991-42b7-9a32-d34e071a94aa	39c411477ed495c3067d186eb7e5351be8bb6ca5563ca57b240315654acfede3	2026-02-28 14:29:39.728187-03	20260228172939_add_mentor_role	\N	\N	2026-02-28 14:29:39.723494-03	1
\.


--
-- Name: Concurso Concurso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Concurso"
    ADD CONSTRAINT "Concurso_pkey" PRIMARY KEY (id);


--
-- Name: Content Content_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Content"
    ADD CONSTRAINT "Content_pkey" PRIMARY KEY (id);


--
-- Name: FeaturedStudent FeaturedStudent_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."FeaturedStudent"
    ADD CONSTRAINT "FeaturedStudent_pkey" PRIMARY KEY (id);


--
-- Name: MentorshipLink MentorshipLink_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MentorshipLink"
    ADD CONSTRAINT "MentorshipLink_pkey" PRIMARY KEY (id);


--
-- Name: MethodItem MethodItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MethodItem"
    ADD CONSTRAINT "MethodItem_pkey" PRIMARY KEY (id);


--
-- Name: Plan Plan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Plan"
    ADD CONSTRAINT "Plan_pkey" PRIMARY KEY (id);


--
-- Name: StudyLogHistory StudyLogHistory_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyLogHistory"
    ADD CONSTRAINT "StudyLogHistory_pkey" PRIMARY KEY (id);


--
-- Name: StudyLog StudyLog_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyLog"
    ADD CONSTRAINT "StudyLog_pkey" PRIMARY KEY (id);


--
-- Name: Subject Subject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Subject"
    ADD CONSTRAINT "Subject_pkey" PRIMARY KEY (id);


--
-- Name: UserConcurso UserConcurso_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserConcurso"
    ADD CONSTRAINT "UserConcurso_pkey" PRIMARY KEY (id);


--
-- Name: UserSubject UserSubject_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSubject"
    ADD CONSTRAINT "UserSubject_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: WeeklyPlanItem WeeklyPlanItem_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyPlanItem"
    ADD CONSTRAINT "WeeklyPlanItem_pkey" PRIMARY KEY (id);


--
-- Name: WeeklyPlan WeeklyPlan_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyPlan"
    ADD CONSTRAINT "WeeklyPlan_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Content_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Content_subjectId_idx" ON public."Content" USING btree ("subjectId");


--
-- Name: MentorshipLink_mentorId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MentorshipLink_mentorId_idx" ON public."MentorshipLink" USING btree ("mentorId");


--
-- Name: MentorshipLink_studentId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "MentorshipLink_studentId_idx" ON public."MentorshipLink" USING btree ("studentId");


--
-- Name: MentorshipLink_studentId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "MentorshipLink_studentId_key" ON public."MentorshipLink" USING btree ("studentId");


--
-- Name: StudyLogHistory_changedById_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudyLogHistory_changedById_idx" ON public."StudyLogHistory" USING btree ("changedById");


--
-- Name: StudyLogHistory_studyLogId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudyLogHistory_studyLogId_idx" ON public."StudyLogHistory" USING btree ("studyLogId");


--
-- Name: StudyLog_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudyLog_date_idx" ON public."StudyLog" USING btree (date);


--
-- Name: StudyLog_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "StudyLog_userId_idx" ON public."StudyLog" USING btree ("userId");


--
-- Name: UserConcurso_userId_concursoId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserConcurso_userId_concursoId_key" ON public."UserConcurso" USING btree ("userId", "concursoId");


--
-- Name: UserSubject_userId_subjectId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserSubject_userId_subjectId_key" ON public."UserSubject" USING btree ("userId", "subjectId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: WeeklyPlanItem_planId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WeeklyPlanItem_planId_idx" ON public."WeeklyPlanItem" USING btree ("planId");


--
-- Name: WeeklyPlanItem_studyLogId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WeeklyPlanItem_studyLogId_key" ON public."WeeklyPlanItem" USING btree ("studyLogId");


--
-- Name: WeeklyPlanItem_subjectId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WeeklyPlanItem_subjectId_idx" ON public."WeeklyPlanItem" USING btree ("subjectId");


--
-- Name: WeeklyPlan_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "WeeklyPlan_userId_idx" ON public."WeeklyPlan" USING btree ("userId");


--
-- Name: WeeklyPlan_userId_startDate_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "WeeklyPlan_userId_startDate_key" ON public."WeeklyPlan" USING btree ("userId", "startDate");


--
-- Name: Content Content_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Content"
    ADD CONSTRAINT "Content_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MentorshipLink MentorshipLink_mentorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MentorshipLink"
    ADD CONSTRAINT "MentorshipLink_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: MentorshipLink MentorshipLink_studentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MentorshipLink"
    ADD CONSTRAINT "MentorshipLink_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudyLogHistory StudyLogHistory_changedById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyLogHistory"
    ADD CONSTRAINT "StudyLogHistory_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StudyLogHistory StudyLogHistory_studyLogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyLogHistory"
    ADD CONSTRAINT "StudyLogHistory_studyLogId_fkey" FOREIGN KEY ("studyLogId") REFERENCES public."StudyLog"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudyLog StudyLog_contentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyLog"
    ADD CONSTRAINT "StudyLog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES public."Content"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudyLog StudyLog_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyLog"
    ADD CONSTRAINT "StudyLog_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StudyLog StudyLog_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StudyLog"
    ADD CONSTRAINT "StudyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserConcurso UserConcurso_concursoId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserConcurso"
    ADD CONSTRAINT "UserConcurso_concursoId_fkey" FOREIGN KEY ("concursoId") REFERENCES public."Concurso"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserConcurso UserConcurso_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserConcurso"
    ADD CONSTRAINT "UserConcurso_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserSubject UserSubject_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSubject"
    ADD CONSTRAINT "UserSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserSubject UserSubject_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserSubject"
    ADD CONSTRAINT "UserSubject_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeeklyPlanItem WeeklyPlanItem_planId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyPlanItem"
    ADD CONSTRAINT "WeeklyPlanItem_planId_fkey" FOREIGN KEY ("planId") REFERENCES public."WeeklyPlan"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: WeeklyPlanItem WeeklyPlanItem_studyLogId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyPlanItem"
    ADD CONSTRAINT "WeeklyPlanItem_studyLogId_fkey" FOREIGN KEY ("studyLogId") REFERENCES public."StudyLog"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WeeklyPlanItem WeeklyPlanItem_subjectId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyPlanItem"
    ADD CONSTRAINT "WeeklyPlanItem_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES public."Subject"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: WeeklyPlan WeeklyPlan_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."WeeklyPlan"
    ADD CONSTRAINT "WeeklyPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict rZqLupR5dfuDvgvmLo8EPdF1OVuimtwYHqANeKWZShjEsd0lOa5gIkCIbaeRFdn

