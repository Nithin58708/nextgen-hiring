--
-- PostgreSQL database dump
--

\restrict eqxXjPtnYeQDH3H801UD52tuw5xqHkTn13jRA8T7Dzabyo2TifT33Ovdke7p8sh

-- Dumped from database version 18.0
-- Dumped by pg_dump version 18.0

-- Started on 2026-03-28 12:33:19

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

--
-- TOC entry 5 (class 2615 OID 33455)
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: postgres
--

COMMENT ON SCHEMA public IS '';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 236 (class 1259 OID 35676)
-- Name: assessment_results; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessment_results (
    id integer NOT NULL,
    assessment_id integer,
    user_id integer,
    answers jsonb DEFAULT '[]'::jsonb,
    score integer,
    feedback jsonb DEFAULT '{}'::jsonb,
    strong_areas jsonb DEFAULT '[]'::jsonb,
    weak_areas jsonb DEFAULT '[]'::jsonb,
    submitted_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.assessment_results OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 35675)
-- Name: assessment_results_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessment_results_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessment_results_id_seq OWNER TO postgres;

--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 235
-- Name: assessment_results_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessment_results_id_seq OWNED BY public.assessment_results.id;


--
-- TOC entry 234 (class 1259 OID 35658)
-- Name: assessments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.assessments (
    id integer NOT NULL,
    user_id integer,
    job_id integer,
    job_role character varying(200),
    questions jsonb DEFAULT '[]'::jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.assessments OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 35657)
-- Name: assessments_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.assessments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assessments_id_seq OWNER TO postgres;

--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 233
-- Name: assessments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.assessments_id_seq OWNED BY public.assessments.id;


--
-- TOC entry 230 (class 1259 OID 35608)
-- Name: job_applications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_applications (
    id integer NOT NULL,
    job_id integer,
    user_id integer,
    cover_letter text,
    status character varying(20) DEFAULT 'applied'::character varying,
    applied_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.job_applications OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 35607)
-- Name: job_applications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_applications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_applications_id_seq OWNER TO postgres;

--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 229
-- Name: job_applications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_applications_id_seq OWNED BY public.job_applications.id;


--
-- TOC entry 226 (class 1259 OID 35567)
-- Name: job_finder_profiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_finder_profiles (
    id integer NOT NULL,
    user_id integer,
    primary_job_role character varying(200),
    primary_language character varying(100) DEFAULT 'JavaScript'::character varying,
    extracted_skills jsonb DEFAULT '[]'::jsonb,
    experience_level character varying(50) DEFAULT 'fresher'::character varying,
    weak_areas jsonb DEFAULT '[]'::jsonb,
    last_test_date timestamp without time zone
);


ALTER TABLE public.job_finder_profiles OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 35566)
-- Name: job_finder_profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_finder_profiles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_finder_profiles_id_seq OWNER TO postgres;

--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 225
-- Name: job_finder_profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_finder_profiles_id_seq OWNED BY public.job_finder_profiles.id;


--
-- TOC entry 232 (class 1259 OID 35633)
-- Name: job_matches; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.job_matches (
    id integer NOT NULL,
    user_id integer,
    job_id integer,
    score integer,
    reasoning text,
    matched_skills jsonb DEFAULT '[]'::jsonb,
    missing_skills jsonb DEFAULT '[]'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.job_matches OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 35632)
-- Name: job_matches_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.job_matches_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.job_matches_id_seq OWNER TO postgres;

--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 231
-- Name: job_matches_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.job_matches_id_seq OWNED BY public.job_matches.id;


--
-- TOC entry 228 (class 1259 OID 35588)
-- Name: jobs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.jobs (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    company character varying(200) NOT NULL,
    description text,
    salary character varying(100),
    location character varying(200),
    required_skills jsonb DEFAULT '[]'::jsonb,
    status character varying(20) DEFAULT 'pending'::character varying,
    posted_by integer,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.jobs OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 35587)
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.jobs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.jobs_id_seq OWNER TO postgres;

--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 227
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- TOC entry 222 (class 1259 OID 35535)
-- Name: resumes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.resumes (
    id integer NOT NULL,
    user_id integer,
    filename character varying(255),
    original_name character varying(255),
    raw_text text,
    uploaded_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.resumes OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 35534)
-- Name: resumes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.resumes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.resumes_id_seq OWNER TO postgres;

--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 221
-- Name: resumes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.resumes_id_seq OWNED BY public.resumes.id;


--
-- TOC entry 238 (class 1259 OID 35701)
-- Name: suggestions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.suggestions (
    id integer NOT NULL,
    user_id integer,
    job_id integer,
    roadmap jsonb DEFAULT '{}'::jsonb,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.suggestions OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 35700)
-- Name: suggestions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.suggestions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.suggestions_id_seq OWNER TO postgres;

--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 237
-- Name: suggestions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.suggestions_id_seq OWNED BY public.suggestions.id;


--
-- TOC entry 224 (class 1259 OID 35553)
-- Name: user_skills; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_skills (
    id integer NOT NULL,
    user_id integer,
    skill_name character varying(100),
    skill_type character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_skills OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 35552)
-- Name: user_skills_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.user_skills_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_skills_id_seq OWNER TO postgres;

--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_skills_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.user_skills_id_seq OWNED BY public.user_skills.id;


--
-- TOC entry 220 (class 1259 OID 35516)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(100) NOT NULL,
    email character varying(200) NOT NULL,
    password character varying(255) NOT NULL,
    role character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    is_active boolean DEFAULT true
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 35515)
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- TOC entry 4929 (class 2604 OID 35679)
-- Name: assessment_results id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_results ALTER COLUMN id SET DEFAULT nextval('public.assessment_results_id_seq'::regclass);


--
-- TOC entry 4925 (class 2604 OID 35661)
-- Name: assessments id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments ALTER COLUMN id SET DEFAULT nextval('public.assessments_id_seq'::regclass);


--
-- TOC entry 4917 (class 2604 OID 35611)
-- Name: job_applications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications ALTER COLUMN id SET DEFAULT nextval('public.job_applications_id_seq'::regclass);


--
-- TOC entry 4908 (class 2604 OID 35570)
-- Name: job_finder_profiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_finder_profiles ALTER COLUMN id SET DEFAULT nextval('public.job_finder_profiles_id_seq'::regclass);


--
-- TOC entry 4921 (class 2604 OID 35636)
-- Name: job_matches id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches ALTER COLUMN id SET DEFAULT nextval('public.job_matches_id_seq'::regclass);


--
-- TOC entry 4913 (class 2604 OID 35591)
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- TOC entry 4904 (class 2604 OID 35538)
-- Name: resumes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes ALTER COLUMN id SET DEFAULT nextval('public.resumes_id_seq'::regclass);


--
-- TOC entry 4935 (class 2604 OID 35704)
-- Name: suggestions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions ALTER COLUMN id SET DEFAULT nextval('public.suggestions_id_seq'::regclass);


--
-- TOC entry 4906 (class 2604 OID 35556)
-- Name: user_skills id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills ALTER COLUMN id SET DEFAULT nextval('public.user_skills_id_seq'::regclass);


--
-- TOC entry 4901 (class 2604 OID 35519)
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- TOC entry 5146 (class 0 OID 35676)
-- Dependencies: 236
-- Data for Name: assessment_results; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessment_results (id, assessment_id, user_id, answers, score, feedback, strong_areas, weak_areas, submitted_at) FROM stdin;
1	1	7	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]	0	{"nextSteps": ["Review missed questions", "Practice weak topics", "Take test again"], "weakAreas": [], "strongAreas": [], "overallGrade": "F", "interviewTips": ["Practice coding daily", "Review OOP concepts", "Study SQL queries", "Build projects", "Mock interviews"], "feedbackSummary": "You completed the assessment with a score of 0%. Focus on weak areas to improve.", "improvementPlan": [], "scoreInterpretation": "You scored 0% on this assessment."}	[]	[]	2026-03-21 09:48:35.045183
2	2	7	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]	0	{"nextSteps": ["Review missed questions", "Practice weak topics", "Take test again"], "weakAreas": [], "strongAreas": [], "overallGrade": "F", "interviewTips": ["Practice coding daily", "Review OOP concepts", "Study SQL queries", "Build projects", "Mock interviews"], "feedbackSummary": "You completed the assessment with a score of 0%. Focus on weak areas to improve.", "improvementPlan": [], "scoreInterpretation": "You scored 0% on this assessment."}	[]	[]	2026-03-21 09:49:57.091429
3	3	7	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]	0	{"nextSteps": ["Review missed questions", "Practice weak topics", "Take test again"], "weakAreas": [], "strongAreas": [], "overallGrade": "F", "interviewTips": ["Practice coding daily", "Review OOP concepts", "Study SQL queries", "Build projects", "Mock interviews"], "feedbackSummary": "You completed the assessment with a score of 0%. Focus on weak areas to improve.", "improvementPlan": [], "scoreInterpretation": "You scored 0% on this assessment."}	[]	[]	2026-03-21 09:51:02.073965
4	4	7	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]	0	{"nextSteps": ["Review missed questions", "Practice weak topics", "Take test again"], "weakAreas": [], "strongAreas": [], "overallGrade": "F", "interviewTips": ["Practice coding daily", "Review OOP concepts", "Study SQL queries", "Build projects", "Mock interviews"], "feedbackSummary": "You completed the assessment with a score of 0%. Focus on weak areas to improve.", "improvementPlan": [], "scoreInterpretation": "You scored 0% on this assessment."}	[]	[]	2026-03-21 09:51:53.358092
5	5	7	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]	0	{"nextSteps": ["Review all wrong answers", "Practice weak topics for 2 weeks", "Retake the test"], "weakAreas": [], "strongAreas": [], "overallGrade": "F", "interviewTips": ["Practice coding problems daily on LeetCode", "Review OOP concepts and design patterns", "Study SQL query optimization", "Build projects to strengthen weak areas", "Practice mock interviews with peers"], "feedbackSummary": "You scored 0%. Focus on weak areas to improve placement readiness.", "improvementPlan": [], "recommendedCourses": [{"link": "https://udemy.com", "skill": "Problem Solving", "platform": "Udemy", "priority": "High", "courseName": "Data Structures & Algorithms"}], "scoreInterpretation": "You scored 0% on this assessment."}	[]	[]	2026-03-21 12:32:00.608171
6	20	7	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]	0	{"nextSteps": ["Review all wrong answers", "Practice weak topics for 2 weeks", "Retake the test"], "weakAreas": [], "strongAreas": [], "overallGrade": "F", "interviewTips": ["Practice coding problems daily on LeetCode", "Review OOP concepts and design patterns", "Study SQL query optimization", "Build projects to strengthen weak areas", "Practice mock interviews with peers"], "feedbackSummary": "You scored 0%. Focus on weak areas to improve placement readiness.", "improvementPlan": [], "recommendedCourses": [{"link": "https://udemy.com", "skill": "Problem Solving", "platform": "Udemy", "priority": "High", "courseName": "Data Structures & Algorithms"}], "scoreInterpretation": "You scored 0% on this assessment."}	[]	[]	2026-03-21 20:48:53.474526
\.


--
-- TOC entry 5144 (class 0 OID 35658)
-- Dependencies: 234
-- Data for Name: assessments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.assessments (id, user_id, job_id, job_role, questions, status, created_at) FROM stdin;
1	7	\N	Full Stack Developer	[{"id": 1, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 1 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 2 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 3 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 4 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 5 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 6 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 7 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 8 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 9 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 10 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 11 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 12 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 13 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 14 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 15 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 16 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 17 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 18 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 19 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 20 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	completed	2026-03-21 09:48:34.896267
2	7	\N	Full Stack Developer	[{"id": 1, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 1 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 2 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 3 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 4 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 5 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 6 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 7 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 8 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 9 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 10 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 11 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 12 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 13 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 14 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 15 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 16 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 17 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 18 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 19 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 20 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	completed	2026-03-21 09:49:56.881123
3	7	\N	Full Stack Developer	[{"id": 1, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 1 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 2 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 3 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 4 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 5 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 6 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 7 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 8 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 9 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 10 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 11 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 12 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 13 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 14 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 15 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 16 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 17 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 18 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 19 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 20 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	completed	2026-03-21 09:51:01.938019
4	7	\N	Full Stack Developer	[{"id": 1, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 1 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 2 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 3 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 4 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 5 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 6 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 7 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 8 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 9 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 10 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 11 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 12 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 13 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 14 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 15 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 16 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 17 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 18 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 19 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Ans 1", "Ans 2", "Ans 3", "Ans 4"], "section": "TECHNICAL", "category": "General", "question": "Question 20 about Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	completed	2026-03-21 09:51:53.17039
5	7	\N	Full Stack Developer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	completed	2026-03-21 12:31:50.841196
20	7	\N	Full Stack Developer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Full Stack Developer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	completed	2026-03-21 20:48:37.289177
21	7	\N	Software Engineer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	pending	2026-03-26 20:39:02.421424
22	7	\N	Software Engineer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	pending	2026-03-26 20:39:02.473151
23	7	\N	Software Engineer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	pending	2026-03-26 20:39:57.137003
24	7	\N	Software Engineer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	pending	2026-03-26 20:39:57.449748
25	7	\N	Software Engineer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	pending	2026-03-26 21:34:25.945679
26	7	\N	Software Engineer	[{"id": 1, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 1 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 2, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 2 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 3, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 3 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 4, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 4 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 5, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "APTITUDE", "category": "General", "question": "Sample Question 5 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 6, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 6 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 7, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 7 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 8, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 8 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 9, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 9 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 10, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "OOP", "category": "General", "question": "Sample Question 10 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 11, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 11 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 12, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 12 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 13, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 13 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 14, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 14 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 15, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "SQL", "category": "General", "question": "Sample Question 15 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 16, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 16 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 17, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 17 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 18, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 18 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 19, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 19 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}, {"id": 20, "hasCode": false, "options": ["Option 1", "Option 2", "Option 3", "Option 4"], "section": "TECHNICAL", "category": "General", "question": "Sample Question 20 for Software Engineer?", "difficulty": "medium", "codeSnippet": null, "explanation": "Fallback correct answer explanation", "starterCode": null, "isCompilable": false, "correctAnswer": 0, "expectedOutput": null}]	pending	2026-03-26 21:34:26.153928
\.


--
-- TOC entry 5140 (class 0 OID 35608)
-- Dependencies: 230
-- Data for Name: job_applications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_applications (id, job_id, user_id, cover_letter, status, applied_at, updated_at) FROM stdin;
18	1	7	I am a fresher with React and Node.js skills	applied	2026-03-26 21:27:26.415447	2026-03-26 21:27:26.415447
\.


--
-- TOC entry 5136 (class 0 OID 35567)
-- Dependencies: 226
-- Data for Name: job_finder_profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_finder_profiles (id, user_id, primary_job_role, primary_language, extracted_skills, experience_level, weak_areas, last_test_date) FROM stdin;
60	97	Software Developer	Python	["Java", "Python", "React", "Node.js", "JavaScript", "HTML", "CSS", "SQL", "Git"]	fresher	[]	\N
7	7	Software Developer	Python	["Java", "Python", "React", "Node.js", "JavaScript", "HTML", "CSS", "SQL", "Git"]	fresher	[]	2026-03-21 20:48:53.481502
\.


--
-- TOC entry 5142 (class 0 OID 35633)
-- Dependencies: 232
-- Data for Name: job_matches; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.job_matches (id, user_id, job_id, score, reasoning, matched_skills, missing_skills, created_at) FROM stdin;
34	7	1	100	Score based on skill overlap with job requirements.	["React", "Node.js", "JavaScript", "SQL", "Git", "HTML", "CSS"]	[]	2026-03-26 21:27:26.447521
41	7	5	50	Score based on skill overlap with job requirements.	["JavaScript", "HTML", "CSS", "SQL", "Java"]	["PostgreSQL", "OOP", "ASP.NET MVC", "C#", "jQuery"]	2026-03-26 21:46:18.073325
\.


--
-- TOC entry 5138 (class 0 OID 35588)
-- Dependencies: 228
-- Data for Name: jobs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.jobs (id, title, company, description, salary, location, required_skills, status, posted_by, created_at) FROM stdin;
1	Full Stack Developer	TechSolutions India	Build scalable web applications using React and Node.js. Must know REST APIs, SQL, Git, JavaScript.	6-10 LPA	Chennai	["React", "Node.js", "JavaScript", "SQL", "Git", "HTML", "CSS"]	approved	3	2026-03-18 22:04:40.969331
2	Java Backend Developer	Infosys Limited	Develop microservices using Java Spring Boot. MySQL and REST API experience required. Fresher welcome.	5-8 LPA	Bangalore	["Java", "Spring Boot", "MySQL", "REST APIs", "Maven", "Git"]	approved	3	2026-03-18 22:04:40.975503
3	React Frontend Developer	Zoho Corporation	Develop UI components using React and TypeScript. Redux, CSS, HTML knowledge required.	5-9 LPA	Chennai	["React", "TypeScript", "Redux", "CSS", "HTML", "JavaScript"]	approved	3	2026-03-18 22:04:40.976967
4	Test Job	Test Co	test	5 LPA	Chennai	["React"]	pending	2	2026-03-18 22:31:48.799198
5	Full Stack Developer	TechSolutions India	We need a Full Stack Developer with JavaScript, HTML, CSS, SQL, PostgreSQL, Java, OOP, ASP.NET MVC, C# knowledge.	8-12 LPA		["JavaScript", "HTML", "CSS", "SQL", "PostgreSQL", "Java", "OOP", "ASP.NET MVC", "C#", "jQuery"]	approved	2	2026-03-18 22:45:35.642659
\.


--
-- TOC entry 5132 (class 0 OID 35535)
-- Dependencies: 222
-- Data for Name: resumes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.resumes (id, user_id, filename, original_name, raw_text, uploaded_at) FROM stdin;
34	97	resume_1774538740496.pdf	NextGen_Hiring_Abstract.pdf	Java Python JavaScript React Node.js HTML CSS SQL Git REST APIs	2026-03-26 20:55:42.936265
6	7	resume_1774541607547.pdf	complete process of leave management with api instruction.pdf	Java Python JavaScript React Node.js HTML CSS SQL Git REST APIs	2026-03-26 21:43:29.103781
\.


--
-- TOC entry 5148 (class 0 OID 35701)
-- Dependencies: 238
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.suggestions (id, user_id, job_id, roadmap, created_at) FROM stdin;
10	7	5	{"resumeTips": ["Quantify achievements with numbers (e.g. \\"Reduced load time by 40%\\")", "Add GitHub project links with live demos", "List tech stack prominently at the top"], "weeklyPlan": [{"week": 1, "focus": "Core Skills Review", "tasks": ["Review Java fundamentals", "Solve 10 LeetCode easy problems", "Build a small CRUD project"]}, {"week": 2, "focus": "Missing Skills: Docker", "tasks": ["Start Docker course", "Complete 3 hands-on labs", "Document learnings in GitHub"]}, {"week": 3, "focus": "Portfolio Project", "tasks": ["Build a full-stack project using Full Stack Developer stack", "Deploy on Vercel/Heroku", "Write a README with screenshots"]}, {"week": 4, "focus": "Interview Preparation", "tasks": ["Practice 20 mock interview questions", "Review system design basics", "Do 2 mock interviews with peers"]}], "skillsToAdd": ["Docker", "AWS", "TypeScript", "MongoDB"], "interviewTopics": ["Data Structures & Algorithms", "System Design Basics", "OOP Concepts", "SQL Queries & Joins", "Full Stack Developer specific questions"], "learningResources": [{"link": "https://www.udemy.com/course/the-complete-web-development-bootcamp/", "skill": "Full Stack", "course": "The Complete Web Developer Bootcamp", "platform": "Udemy", "durationWeeks": 4}, {"link": "https://www.youtube.com/watch?v=RBSGKlAvoiM", "skill": "DSA", "course": "Data Structures & Algorithms", "platform": "YouTube", "durationWeeks": 3}], "skillsAlreadyHave": ["Java", "Python", "React", "Node.js", "JavaScript", "HTML"], "estimatedReadyDate": "6-8 weeks", "targetMatchPercent": 85, "currentMatchPercent": 90}	2026-03-26 20:39:52.216459
\.


--
-- TOC entry 5134 (class 0 OID 35553)
-- Dependencies: 224
-- Data for Name: user_skills; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_skills (id, user_id, skill_name, skill_type, created_at) FROM stdin;
390	97	Java	technical	2026-03-26 20:55:42.962573
391	97	Python	technical	2026-03-26 20:55:42.965989
392	97	React	technical	2026-03-26 20:55:42.96827
393	97	Node.js	technical	2026-03-26 20:55:42.970667
394	97	JavaScript	technical	2026-03-26 20:55:42.972572
395	97	HTML	technical	2026-03-26 20:55:42.974239
396	97	CSS	technical	2026-03-26 20:55:42.976015
397	97	SQL	technical	2026-03-26 20:55:42.977377
398	97	Git	technical	2026-03-26 20:55:42.979682
399	97	Git	technology	2026-03-26 20:55:42.98105
400	97	REST APIs	technology	2026-03-26 20:55:42.982722
401	97	Problem Solving	soft	2026-03-26 20:55:42.983928
402	97	Communication	soft	2026-03-26 20:55:42.985025
403	97	Team Work	soft	2026-03-26 20:55:42.986124
432	7	Java	technical	2026-03-26 21:43:29.10789
433	7	Python	technical	2026-03-26 21:43:29.109438
434	7	React	technical	2026-03-26 21:43:29.110557
435	7	Node.js	technical	2026-03-26 21:43:29.111645
436	7	JavaScript	technical	2026-03-26 21:43:29.112974
437	7	HTML	technical	2026-03-26 21:43:29.115397
438	7	CSS	technical	2026-03-26 21:43:29.117671
439	7	SQL	technical	2026-03-26 21:43:29.118473
440	7	Git	technical	2026-03-26 21:43:29.119676
441	7	Git	technology	2026-03-26 21:43:29.120937
442	7	REST APIs	technology	2026-03-26 21:43:29.122139
443	7	Problem Solving	soft	2026-03-26 21:43:29.123466
444	7	Communication	soft	2026-03-26 21:43:29.125302
445	7	Team Work	soft	2026-03-26 21:43:29.126939
\.


--
-- TOC entry 5130 (class 0 OID 35516)
-- Dependencies: 220
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password, role, created_at, is_active) FROM stdin;
7	Karthi	karthi@nextgen.com	$2b$10$xYHSBXINm0Ue27BMNnKMLetWltkoKEm7Abt2TS9sakKkXGNXq2dSi	job_finder	2026-03-21 09:41:11.554752	t
2	Mani	mani@nextgen.com	$2b$10$Kn.BTeb3kWGgtZZzPAN4n.xw0TZex9FmfLqzivg5jsgyUeuyrp.bG	job_poster	2026-03-18 16:33:18.447761	t
3	Nithin	nithin58708@gmail.com	$2b$10$ImhMYaZs7F1JqlnPBXg8HuiIISt8W2qOJ5UaRRYkS6nAVlJSftG/S	admin	2026-03-18 16:33:18.528265	t
97	TestStudent	teststudent@test.com	$2b$10$XRs9M0mdaIcxlM2xOLxR2OFQuyKXTIe0CUmtRtkgZ12saH0.n2rvK	job_finder	2026-03-26 20:52:08.077286	t
\.


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 235
-- Name: assessment_results_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessment_results_id_seq', 6, true);


--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 233
-- Name: assessments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.assessments_id_seq', 26, true);


--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 229
-- Name: job_applications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_applications_id_seq', 18, true);


--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 225
-- Name: job_finder_profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_finder_profiles_id_seq', 64, true);


--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 231
-- Name: job_matches_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.job_matches_id_seq', 73, true);


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 227
-- Name: jobs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.jobs_id_seq', 24, true);


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 221
-- Name: resumes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.resumes_id_seq', 37, true);


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 237
-- Name: suggestions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.suggestions_id_seq', 10, true);


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 223
-- Name: user_skills_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.user_skills_id_seq', 445, true);


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 219
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 97, true);


--
-- TOC entry 4967 (class 2606 OID 35689)
-- Name: assessment_results assessment_results_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_pkey PRIMARY KEY (id);


--
-- TOC entry 4965 (class 2606 OID 35669)
-- Name: assessments assessments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_pkey PRIMARY KEY (id);


--
-- TOC entry 4957 (class 2606 OID 35621)
-- Name: job_applications job_applications_job_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_user_id_key UNIQUE (job_id, user_id);


--
-- TOC entry 4959 (class 2606 OID 35619)
-- Name: job_applications job_applications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_pkey PRIMARY KEY (id);


--
-- TOC entry 4951 (class 2606 OID 35579)
-- Name: job_finder_profiles job_finder_profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_finder_profiles
    ADD CONSTRAINT job_finder_profiles_pkey PRIMARY KEY (id);


--
-- TOC entry 4953 (class 2606 OID 35581)
-- Name: job_finder_profiles job_finder_profiles_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_finder_profiles
    ADD CONSTRAINT job_finder_profiles_user_id_key UNIQUE (user_id);


--
-- TOC entry 4961 (class 2606 OID 35644)
-- Name: job_matches job_matches_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_pkey PRIMARY KEY (id);


--
-- TOC entry 4963 (class 2606 OID 35646)
-- Name: job_matches job_matches_user_id_job_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_user_id_job_id_key UNIQUE (user_id, job_id);


--
-- TOC entry 4955 (class 2606 OID 35601)
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- TOC entry 4945 (class 2606 OID 35544)
-- Name: resumes resumes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_pkey PRIMARY KEY (id);


--
-- TOC entry 4947 (class 2606 OID 35546)
-- Name: resumes resumes_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_user_id_key UNIQUE (user_id);


--
-- TOC entry 4969 (class 2606 OID 35711)
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_pkey PRIMARY KEY (id);


--
-- TOC entry 4949 (class 2606 OID 35560)
-- Name: user_skills user_skills_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_pkey PRIMARY KEY (id);


--
-- TOC entry 4939 (class 2606 OID 35533)
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- TOC entry 4941 (class 2606 OID 35529)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 4943 (class 2606 OID 35531)
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- TOC entry 4979 (class 2606 OID 35690)
-- Name: assessment_results assessment_results_assessment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_assessment_id_fkey FOREIGN KEY (assessment_id) REFERENCES public.assessments(id);


--
-- TOC entry 4980 (class 2606 OID 35695)
-- Name: assessment_results assessment_results_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessment_results
    ADD CONSTRAINT assessment_results_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4978 (class 2606 OID 35670)
-- Name: assessments assessments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.assessments
    ADD CONSTRAINT assessments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4974 (class 2606 OID 35622)
-- Name: job_applications job_applications_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- TOC entry 4975 (class 2606 OID 35627)
-- Name: job_applications job_applications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_applications
    ADD CONSTRAINT job_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4972 (class 2606 OID 35582)
-- Name: job_finder_profiles job_finder_profiles_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_finder_profiles
    ADD CONSTRAINT job_finder_profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4976 (class 2606 OID 35652)
-- Name: job_matches job_matches_job_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_job_id_fkey FOREIGN KEY (job_id) REFERENCES public.jobs(id);


--
-- TOC entry 4977 (class 2606 OID 35647)
-- Name: job_matches job_matches_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.job_matches
    ADD CONSTRAINT job_matches_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4973 (class 2606 OID 35602)
-- Name: jobs jobs_posted_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_posted_by_fkey FOREIGN KEY (posted_by) REFERENCES public.users(id);


--
-- TOC entry 4970 (class 2606 OID 35547)
-- Name: resumes resumes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.resumes
    ADD CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4981 (class 2606 OID 35712)
-- Name: suggestions suggestions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.suggestions
    ADD CONSTRAINT suggestions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 4971 (class 2606 OID 35561)
-- Name: user_skills user_skills_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_skills
    ADD CONSTRAINT user_skills_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


-- Completed on 2026-03-28 12:33:19

--
-- PostgreSQL database dump complete
--

\unrestrict eqxXjPtnYeQDH3H801UD52tuw5xqHkTn13jRA8T7Dzabyo2TifT33Ovdke7p8sh

