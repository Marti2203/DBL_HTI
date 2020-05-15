--
-- PostgreSQL database dump
--

-- Dumped from database version 12.2
-- Dumped by pg_dump version 12.2

-- Started on 2020-05-13 10:07:31

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 1 (class 3079 OID 16471)
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- TOC entry 2922 (class 0 OID 0)
-- Dependencies: 1
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


--
-- TOC entry 3 (class 3079 OID 16434)
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- TOC entry 2923 (class 0 OID 0)
-- Dependencies: 3
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 208 (class 1259 OID 16490)
-- Name: File; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."File" (
    "Index" integer NOT NULL,
    "Timestamp" integer NOT NULL,
    "StimuliName" text NOT NULL,
    "FixationIndex" integer NOT NULL,
    "FixationDuration" integer NOT NULL,
    "MappedFixationPointX" integer NOT NULL,
    "MappedFixationPointY" integer NOT NULL,
    "user" text NOT NULL,
    description text NOT NULL
);


ALTER TABLE public."File" OWNER TO postgres;

--
-- TOC entry 207 (class 1259 OID 16488)
-- Name: File_Index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."File_Index_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."File_Index_seq" OWNER TO postgres;

--
-- TOC entry 2924 (class 0 OID 0)
-- Dependencies: 207
-- Name: File_Index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."File_Index_seq" OWNED BY public."File"."Index";


--
-- TOC entry 214 (class 1259 OID 16860)
-- Name: Filename; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Filename" (
    "ID" integer NOT NULL,
    "File" text
);


ALTER TABLE public."Filename" OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 16858)
-- Name: Filenames_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Filenames_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Filenames_ID_seq" OWNER TO postgres;

--
-- TOC entry 2925 (class 0 OID 0)
-- Dependencies: 213
-- Name: Filenames_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Filenames_ID_seq" OWNED BY public."Filename"."ID";


--
-- TOC entry 206 (class 1259 OID 16482)
-- Name: Researcher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Researcher" (
    "ResearcherId" integer NOT NULL,
    "Username" text NOT NULL,
    "Password" text NOT NULL
);


ALTER TABLE public."Researcher" OWNER TO postgres;

--
-- TOC entry 205 (class 1259 OID 16480)
-- Name: Researcher_ResearcherId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Researcher_ResearcherId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Researcher_ResearcherId_seq" OWNER TO postgres;

--
-- TOC entry 2926 (class 0 OID 0)
-- Dependencies: 205
-- Name: Researcher_ResearcherId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Researcher_ResearcherId_seq" OWNED BY public."Researcher"."ResearcherId";


--
-- TOC entry 204 (class 1259 OID 16429)
-- Name: Researcher_Upload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Researcher_Upload" (
    "ResearcherId" integer NOT NULL,
    "UploadId" integer NOT NULL
);


ALTER TABLE public."Researcher_Upload" OWNER TO postgres;

--
-- TOC entry 212 (class 1259 OID 16525)
-- Name: Stimuli; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Stimuli" (
    "Index" integer NOT NULL,
    "Stimuli" text NOT NULL
);


ALTER TABLE public."Stimuli" OWNER TO postgres;

--
-- TOC entry 2927 (class 0 OID 0)
-- Dependencies: 212
-- Name: TABLE "Stimuli"; Type: COMMENT; Schema: public; Owner: postgres
--

COMMENT ON TABLE public."Stimuli" IS 'The Stimuli that are provided get stored here. The names of the metromaps get stored.';


--
-- TOC entry 211 (class 1259 OID 16523)
-- Name: Stimuli_Index_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Stimuli_Index_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Stimuli_Index_seq" OWNER TO postgres;

--
-- TOC entry 2928 (class 0 OID 0)
-- Dependencies: 211
-- Name: Stimuli_Index_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Stimuli_Index_seq" OWNED BY public."Stimuli"."Index";


--
-- TOC entry 210 (class 1259 OID 16501)
-- Name: Upload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Upload" (
    "UploadId" integer NOT NULL,
    "Datetime" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "Size" integer,
    "File" text,
    "Stimuli" text
);


ALTER TABLE public."Upload" OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 16499)
-- Name: Upload_UploadId_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Upload_UploadId_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Upload_UploadId_seq" OWNER TO postgres;

--
-- TOC entry 2929 (class 0 OID 0)
-- Dependencies: 209
-- Name: Upload_UploadId_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Upload_UploadId_seq" OWNED BY public."Upload"."UploadId";


--
-- TOC entry 2759 (class 2604 OID 16493)
-- Name: File Index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."File" ALTER COLUMN "Index" SET DEFAULT nextval('public."File_Index_seq"'::regclass);


--
-- TOC entry 2763 (class 2604 OID 16863)
-- Name: Filename ID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Filename" ALTER COLUMN "ID" SET DEFAULT nextval('public."Filenames_ID_seq"'::regclass);


--
-- TOC entry 2758 (class 2604 OID 16485)
-- Name: Researcher ResearcherId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher" ALTER COLUMN "ResearcherId" SET DEFAULT nextval('public."Researcher_ResearcherId_seq"'::regclass);


--
-- TOC entry 2762 (class 2604 OID 16528)
-- Name: Stimuli Index; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stimuli" ALTER COLUMN "Index" SET DEFAULT nextval('public."Stimuli_Index_seq"'::regclass);


--
-- TOC entry 2760 (class 2604 OID 16504)
-- Name: Upload UploadId; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Upload" ALTER COLUMN "UploadId" SET DEFAULT nextval('public."Upload_UploadId_seq"'::regclass);


--
-- TOC entry 2910 (class 0 OID 16490)
-- Dependencies: 208
-- Data for Name: File; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2916 (class 0 OID 16860)
-- Dependencies: 214
-- Data for Name: Filename; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2908 (class 0 OID 16482)
-- Dependencies: 206
-- Data for Name: Researcher; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2906 (class 0 OID 16429)
-- Dependencies: 204
-- Data for Name: Researcher_Upload; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2914 (class 0 OID 16525)
-- Dependencies: 212
-- Data for Name: Stimuli; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO public."Stimuli" VALUES (1, 'Antwerp');
INSERT INTO public."Stimuli" VALUES (2, 'Rotterdam');
INSERT INTO public."Stimuli" VALUES (3, 'Amsterdam');
INSERT INTO public."Stimuli" VALUES (4, 'Eindhoven');
INSERT INTO public."Stimuli" VALUES (5, 'Utrecht');
INSERT INTO public."Stimuli" VALUES (6, 'Breda');
INSERT INTO public."Stimuli" VALUES (7, 'London');
INSERT INTO public."Stimuli" VALUES (8, 'London');
INSERT INTO public."Stimuli" VALUES (9, 'London');
INSERT INTO public."Stimuli" VALUES (10, 'London');


--
-- TOC entry 2912 (class 0 OID 16501)
-- Dependencies: 210
-- Data for Name: Upload; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- TOC entry 2930 (class 0 OID 0)
-- Dependencies: 207
-- Name: File_Index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."File_Index_seq"', 1, false);


--
-- TOC entry 2931 (class 0 OID 0)
-- Dependencies: 213
-- Name: Filenames_ID_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Filenames_ID_seq"', 1, true);


--
-- TOC entry 2932 (class 0 OID 0)
-- Dependencies: 205
-- Name: Researcher_ResearcherId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Researcher_ResearcherId_seq"', 1, false);


--
-- TOC entry 2933 (class 0 OID 0)
-- Dependencies: 211
-- Name: Stimuli_Index_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Stimuli_Index_seq"', 10, true);


--
-- TOC entry 2934 (class 0 OID 0)
-- Dependencies: 209
-- Name: Upload_UploadId_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public."Upload_UploadId_seq"', 1, false);


--
-- TOC entry 2771 (class 2606 OID 16498)
-- Name: File File_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."File"
    ADD CONSTRAINT "File_pkey1" PRIMARY KEY ("Index");


--
-- TOC entry 2777 (class 2606 OID 16868)
-- Name: Filename Filenames_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Filename"
    ADD CONSTRAINT "Filenames_pkey" PRIMARY KEY ("ID");


--
-- TOC entry 2765 (class 2606 OID 16433)
-- Name: Researcher_Upload Researcher_Upload_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload"
    ADD CONSTRAINT "Researcher_Upload_pkey" PRIMARY KEY ("ResearcherId", "UploadId");


--
-- TOC entry 2769 (class 2606 OID 16487)
-- Name: Researcher Researcher_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher"
    ADD CONSTRAINT "Researcher_pkey1" PRIMARY KEY ("ResearcherId");


--
-- TOC entry 2775 (class 2606 OID 16533)
-- Name: Stimuli Stimuli_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Stimuli"
    ADD CONSTRAINT "Stimuli_pkey" PRIMARY KEY ("Index");


--
-- TOC entry 2773 (class 2606 OID 16510)
-- Name: Upload Upload_pkey1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Upload"
    ADD CONSTRAINT "Upload_pkey1" PRIMARY KEY ("UploadId");


--
-- TOC entry 2766 (class 1259 OID 16516)
-- Name: fki_ResearcherId Foreign Key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fki_ResearcherId Foreign Key" ON public."Researcher_Upload" USING btree ("ResearcherId");


--
-- TOC entry 2767 (class 1259 OID 16522)
-- Name: fki_UploadId_Foreign_Key ; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "fki_UploadId_Foreign_Key " ON public."Researcher_Upload" USING btree ("UploadId");


--
-- TOC entry 2778 (class 2606 OID 16511)
-- Name: Researcher_Upload ResearcherId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload"
    ADD CONSTRAINT "ResearcherId_fkey" FOREIGN KEY ("ResearcherId") REFERENCES public."Researcher"("ResearcherId") NOT VALID;


--
-- TOC entry 2779 (class 2606 OID 16517)
-- Name: Researcher_Upload UploadId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload"
    ADD CONSTRAINT "UploadId_fkey" FOREIGN KEY ("UploadId") REFERENCES public."Upload"("UploadId") NOT VALID;


-- Completed on 2020-05-13 10:07:32

--
-- PostgreSQL database dump complete
--

