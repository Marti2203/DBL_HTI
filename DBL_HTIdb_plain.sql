--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3
-- Dumped by pg_dump version 12.3

-- Started on 2020-05-25 16:37:12 CEST

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

SET default_tablespace = '';

--
-- TOC entry 203 (class 1259 OID 17642)
-- Name: Researcher; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Researcher" (
    "ID" integer NOT NULL,
    "Username" text NOT NULL,
    "Password" bytea NOT NULL
);


ALTER TABLE public."Researcher" OWNER TO postgres;

--
-- TOC entry 202 (class 1259 OID 17640)
-- Name: Researcher_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Researcher_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Researcher_ID_seq" OWNER TO postgres;

--
-- TOC entry 3622 (class 0 OID 0)
-- Dependencies: 202
-- Name: Researcher_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Researcher_ID_seq" OWNED BY public."Researcher"."ID";


--
-- TOC entry 208 (class 1259 OID 17677)
-- Name: Researcher_Upload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Researcher_Upload" (
    "ResearcherID" integer NOT NULL,
    "UploadID" integer NOT NULL
);


ALTER TABLE public."Researcher_Upload" OWNER TO postgres;

--
-- TOC entry 206 (class 1259 OID 17673)
-- Name: Researcher_Upload_ResearcherID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Researcher_Upload_ResearcherID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Researcher_Upload_ResearcherID_seq" OWNER TO postgres;

--
-- TOC entry 3623 (class 0 OID 0)
-- Dependencies: 206
-- Name: Researcher_Upload_ResearcherID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Researcher_Upload_ResearcherID_seq" OWNED BY public."Researcher_Upload"."ResearcherID";


--
-- TOC entry 207 (class 1259 OID 17675)
-- Name: Researcher_Upload_UploadID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Researcher_Upload_UploadID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Researcher_Upload_UploadID_seq" OWNER TO postgres;

--
-- TOC entry 3624 (class 0 OID 0)
-- Dependencies: 207
-- Name: Researcher_Upload_UploadID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Researcher_Upload_UploadID_seq" OWNED BY public."Researcher_Upload"."UploadID";


--
-- TOC entry 210 (class 1259 OID 17718)
-- Name: StimuliData; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."StimuliData" (
    "UploadID" integer NOT NULL,
    "StimuliName" text NOT NULL,
    "Participants" text[] NOT NULL,
    "ClusterData" json
);


ALTER TABLE public."StimuliData" OWNER TO postgres;

--
-- TOC entry 209 (class 1259 OID 17716)
-- Name: StimuliData_UploadID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."StimuliData_UploadID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."StimuliData_UploadID_seq" OWNER TO postgres;

--
-- TOC entry 3625 (class 0 OID 0)
-- Dependencies: 209
-- Name: StimuliData_UploadID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."StimuliData_UploadID_seq" OWNED BY public."StimuliData"."UploadID";


--
-- TOC entry 205 (class 1259 OID 17664)
-- Name: Upload; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Upload" (
    "ID" integer NOT NULL,
    "Created" date NOT NULL,
    "FileName" text NOT NULL,
    "Stimuli" text[],
    "DatasetName" text NOT NULL
);


ALTER TABLE public."Upload" OWNER TO postgres;

--
-- TOC entry 213 (class 1259 OID 17738)
-- Name: UploadRow; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."UploadRow" (
    "ID" integer NOT NULL,
    "UploadID" integer NOT NULL,
    "Timestamp" integer NOT NULL,
    "FixationIndex" integer NOT NULL,
    "FixationDuration" integer NOT NULL,
    "MappedFixationPointX" integer NOT NULL,
    "MappedFixationPointY" integer NOT NULL,
    "user" text NOT NULL,
    description text,
    "StimuliName" text NOT NULL
);


ALTER TABLE public."UploadRow" OWNER TO postgres;

--
-- TOC entry 211 (class 1259 OID 17734)
-- Name: UploadRow_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UploadRow_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UploadRow_ID_seq" OWNER TO postgres;

--
-- TOC entry 3626 (class 0 OID 0)
-- Dependencies: 211
-- Name: UploadRow_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UploadRow_ID_seq" OWNED BY public."UploadRow"."ID";


--
-- TOC entry 212 (class 1259 OID 17736)
-- Name: UploadRow_UploadID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."UploadRow_UploadID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."UploadRow_UploadID_seq" OWNER TO postgres;

--
-- TOC entry 3627 (class 0 OID 0)
-- Dependencies: 212
-- Name: UploadRow_UploadID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."UploadRow_UploadID_seq" OWNED BY public."UploadRow"."UploadID";


--
-- TOC entry 204 (class 1259 OID 17662)
-- Name: Upload_ID_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public."Upload_ID_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public."Upload_ID_seq" OWNER TO postgres;

--
-- TOC entry 3628 (class 0 OID 0)
-- Dependencies: 204
-- Name: Upload_ID_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public."Upload_ID_seq" OWNED BY public."Upload"."ID";


--
-- TOC entry 3464 (class 2604 OID 17645)
-- Name: Researcher ID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher" ALTER COLUMN "ID" SET DEFAULT nextval('public."Researcher_ID_seq"'::regclass);


--
-- TOC entry 3466 (class 2604 OID 17680)
-- Name: Researcher_Upload ResearcherID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload" ALTER COLUMN "ResearcherID" SET DEFAULT nextval('public."Researcher_Upload_ResearcherID_seq"'::regclass);


--
-- TOC entry 3467 (class 2604 OID 17681)
-- Name: Researcher_Upload UploadID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload" ALTER COLUMN "UploadID" SET DEFAULT nextval('public."Researcher_Upload_UploadID_seq"'::regclass);


--
-- TOC entry 3468 (class 2604 OID 17721)
-- Name: StimuliData UploadID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StimuliData" ALTER COLUMN "UploadID" SET DEFAULT nextval('public."StimuliData_UploadID_seq"'::regclass);


--
-- TOC entry 3465 (class 2604 OID 17667)
-- Name: Upload ID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Upload" ALTER COLUMN "ID" SET DEFAULT nextval('public."Upload_ID_seq"'::regclass);


--
-- TOC entry 3469 (class 2604 OID 17741)
-- Name: UploadRow ID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UploadRow" ALTER COLUMN "ID" SET DEFAULT nextval('public."UploadRow_ID_seq"'::regclass);


--
-- TOC entry 3470 (class 2604 OID 17742)
-- Name: UploadRow UploadID; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UploadRow" ALTER COLUMN "UploadID" SET DEFAULT nextval('public."UploadRow_UploadID_seq"'::regclass);


--
-- TOC entry 3472 (class 2606 OID 17650)
-- Name: Researcher PrimaryResearcherID; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher"
    ADD CONSTRAINT "PrimaryResearcherID" PRIMARY KEY ("ID");


--
-- TOC entry 3478 (class 2606 OID 17683)
-- Name: Researcher_Upload PrimaryResearcher_UploadID; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload"
    ADD CONSTRAINT "PrimaryResearcher_UploadID" PRIMARY KEY ("ResearcherID", "UploadID");


--
-- TOC entry 3476 (class 2606 OID 17672)
-- Name: Upload PrimaryUploadID; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Upload"
    ADD CONSTRAINT "PrimaryUploadID" PRIMARY KEY ("ID");


--
-- TOC entry 3485 (class 2606 OID 17747)
-- Name: UploadRow RowPrimaryID; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UploadRow"
    ADD CONSTRAINT "RowPrimaryID" PRIMARY KEY ("ID");


--
-- TOC entry 3480 (class 2606 OID 17726)
-- Name: StimuliData StimuliDataPrimaryID; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StimuliData"
    ADD CONSTRAINT "StimuliDataPrimaryID" PRIMARY KEY ("UploadID", "StimuliName");


--
-- TOC entry 3474 (class 2606 OID 17652)
-- Name: Researcher UniqueName; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher"
    ADD CONSTRAINT "UniqueName" UNIQUE ("Username");


--
-- TOC entry 3483 (class 2606 OID 17728)
-- Name: StimuliData UniqueStimuliNameUploadID; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StimuliData"
    ADD CONSTRAINT "UniqueStimuliNameUploadID" UNIQUE ("StimuliName", "UploadID");


--
-- TOC entry 3481 (class 1259 OID 17755)
-- Name: StimuliDataUploadID; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "StimuliDataUploadID" ON public."StimuliData" USING btree ("UploadID");


--
-- TOC entry 3486 (class 1259 OID 17754)
-- Name: UploadRowUploadIDStimuliName; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "UploadRowUploadIDStimuliName" ON public."UploadRow" USING btree ("UploadID", "StimuliName");

ALTER TABLE public."UploadRow" CLUSTER ON "UploadRowUploadIDStimuliName";


--
-- TOC entry 3489 (class 2606 OID 17729)
-- Name: StimuliData ResearcherUploadID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."StimuliData"
    ADD CONSTRAINT "ResearcherUploadID" FOREIGN KEY ("UploadID") REFERENCES public."Upload"("ID");


--
-- TOC entry 3487 (class 2606 OID 17684)
-- Name: Researcher_Upload Researcher_UploadToResearchID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload"
    ADD CONSTRAINT "Researcher_UploadToResearchID" FOREIGN KEY ("ResearcherID") REFERENCES public."Researcher"("ID");


--
-- TOC entry 3488 (class 2606 OID 17689)
-- Name: Researcher_Upload Researcher_UploadToUploadID; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Researcher_Upload"
    ADD CONSTRAINT "Researcher_UploadToUploadID" FOREIGN KEY ("UploadID") REFERENCES public."Upload"("ID");


--
-- TOC entry 3490 (class 2606 OID 17748)
-- Name: UploadRow RowUpoadId; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."UploadRow"
    ADD CONSTRAINT "RowUpoadId" FOREIGN KEY ("UploadID") REFERENCES public."Upload"("ID");


-- Completed on 2020-05-25 16:37:13 CEST

--
-- PostgreSQL database dump complete
--

