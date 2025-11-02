--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9 (165f042)
-- Dumped by pg_dump version 16.9

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

SET default_table_access_method = heap;

--
-- Name: admin_messages; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_messages (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sender_id character varying NOT NULL,
    recipient_type text NOT NULL,
    recipient_ids text[],
    subject text NOT NULL,
    body text NOT NULL,
    channel text DEFAULT 'email'::text NOT NULL,
    status text DEFAULT 'sent'::text NOT NULL,
    sent_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_messages OWNER TO neondb_owner;

--
-- Name: ai_artifacts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.ai_artifacts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    application_id character varying,
    artifact_type text NOT NULL,
    content jsonb NOT NULL,
    generated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.ai_artifacts OWNER TO neondb_owner;

--
-- Name: application_batches; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.application_batches (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    batch_number integer NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    submission_mode text DEFAULT 'manual'::text NOT NULL,
    automation_job_id character varying,
    total_applications integer DEFAULT 0 NOT NULL,
    started_at timestamp without time zone,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.application_batches OWNER TO neondb_owner;

--
-- Name: applications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.applications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    user_plan_id character varying NOT NULL,
    job_id text,
    job_title text NOT NULL,
    company text NOT NULL,
    status text DEFAULT 'applied'::text NOT NULL,
    batch_number integer NOT NULL,
    applied_date timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    submission_mode text DEFAULT 'manual'::text NOT NULL,
    automation_job_id character varying,
    source text DEFAULT 'csv_upload'::text NOT NULL
);


ALTER TABLE public.applications OWNER TO neondb_owner;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    admin_id character varying NOT NULL,
    action text NOT NULL,
    target_type text NOT NULL,
    target_id text,
    changes jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO neondb_owner;

--
-- Name: automation_jobs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.automation_jobs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    batch_id character varying,
    provider text NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    payload jsonb,
    error_log text,
    scheduled_at timestamp without time zone DEFAULT now() NOT NULL,
    executed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.automation_jobs OWNER TO neondb_owner;

--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.blog_posts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    excerpt text NOT NULL,
    content text NOT NULL,
    cover_image text,
    author text DEFAULT 'JobApply Team'::text NOT NULL,
    category text NOT NULL,
    tags text[],
    featured boolean DEFAULT false NOT NULL,
    published boolean DEFAULT true NOT NULL,
    published_at timestamp without time zone DEFAULT now() NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.blog_posts OWNER TO neondb_owner;

--
-- Name: cv_enhancement_orders; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cv_enhancement_orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    cv_upload_id character varying NOT NULL,
    plan_id character varying,
    stripe_payment_intent_id text,
    status text DEFAULT 'pending'::text NOT NULL,
    amount_paid numeric(10,2) NOT NULL,
    order_notes text,
    admin_assigned_to character varying,
    completed_by character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.cv_enhancement_orders OWNER TO neondb_owner;

--
-- Name: cv_uploads; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cv_uploads (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    original_filename text NOT NULL,
    stored_filename text NOT NULL,
    file_size integer NOT NULL,
    ats_score integer NOT NULL,
    ats_details jsonb NOT NULL,
    enhancement_purchased boolean DEFAULT false NOT NULL,
    enhancement_completed boolean DEFAULT false NOT NULL,
    enhancement_notes text,
    enhanced_filename text,
    uploaded_at timestamp without time zone DEFAULT now() NOT NULL,
    enhancement_completed_at timestamp without time zone
);


ALTER TABLE public.cv_uploads OWNER TO neondb_owner;

--
-- Name: job_roles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.job_roles (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    role_id text NOT NULL,
    role_name text NOT NULL,
    role_type text NOT NULL,
    industry text NOT NULL,
    key_skills text[] NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.job_roles OWNER TO neondb_owner;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    type text NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    channel text DEFAULT 'in_app'::text NOT NULL,
    metadata jsonb
);


ALTER TABLE public.notifications OWNER TO neondb_owner;

--
-- Name: page_content; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.page_content (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    page_name text NOT NULL,
    sections jsonb NOT NULL,
    updated_by character varying NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.page_content OWNER TO neondb_owner;

--
-- Name: payment_methods; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.payment_methods (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    stripe_payment_method_id text NOT NULL,
    type text NOT NULL,
    last4 text,
    brand text,
    expiry_month integer,
    expiry_year integer,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payment_methods OWNER TO neondb_owner;

--
-- Name: plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    sku text NOT NULL,
    name text NOT NULL,
    description text NOT NULL,
    credits integer DEFAULT 0 NOT NULL,
    price numeric(10,2) NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    type text DEFAULT 'one_time'::text NOT NULL,
    billing_period text,
    stripe_product_id text,
    stripe_price_id text
);


ALTER TABLE public.plans OWNER TO neondb_owner;

--
-- Name: promo_codes; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.promo_codes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    code text NOT NULL,
    description text,
    discount_type text NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    max_uses integer,
    current_uses integer DEFAULT 0 NOT NULL,
    expires_at timestamp without time zone,
    active boolean DEFAULT true NOT NULL,
    created_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.promo_codes OWNER TO neondb_owner;

--
-- Name: resources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.resources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    content text NOT NULL,
    category text NOT NULL,
    is_paid boolean DEFAULT false NOT NULL,
    price numeric(10,2),
    credits integer,
    tags text[],
    featured boolean DEFAULT false NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.resources OWNER TO neondb_owner;

--
-- Name: session; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO neondb_owner;

--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.subscriptions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    stripe_subscription_id text,
    stripe_customer_id text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    current_period_start timestamp without time zone NOT NULL,
    current_period_end timestamp without time zone NOT NULL,
    cancel_at_period_end boolean DEFAULT false NOT NULL,
    canceled_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    amount numeric(10,2) NOT NULL
);


ALTER TABLE public.subscriptions OWNER TO neondb_owner;

--
-- Name: transactions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transactions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    plan_id character varying,
    subscription_id character varying,
    stripe_payment_intent_id text,
    stripe_invoice_id text,
    type text NOT NULL,
    status text DEFAULT 'pending'::text NOT NULL,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'usd'::text NOT NULL,
    description text,
    promo_code_id character varying,
    discount_amount numeric(10,2),
    metadata jsonb,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transactions OWNER TO neondb_owner;

--
-- Name: uploaded_images; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.uploaded_images (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    filename text NOT NULL,
    url text NOT NULL,
    mime_type text NOT NULL,
    size integer NOT NULL,
    uploaded_by character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.uploaded_images OWNER TO neondb_owner;

--
-- Name: user_job_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_job_preferences (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    selected_role_ids text[] NOT NULL,
    preferred_email text NOT NULL,
    interview_phone text NOT NULL,
    setup_completed boolean DEFAULT false NOT NULL,
    admin_approved boolean DEFAULT false NOT NULL,
    admin_approved_by character varying,
    admin_approved_at timestamp without time zone,
    admin_notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_job_preferences OWNER TO neondb_owner;

--
-- Name: user_notification_preferences; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_notification_preferences (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    email_enabled boolean DEFAULT true NOT NULL,
    sms_enabled boolean DEFAULT false NOT NULL,
    batch_completion_alerts boolean DEFAULT true NOT NULL,
    status_update_alerts boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_notification_preferences OWNER TO neondb_owner;

--
-- Name: user_plans; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_plans (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    plan_id character varying NOT NULL,
    credits_remaining integer NOT NULL,
    purchased_at timestamp without time zone DEFAULT now() NOT NULL,
    subscription_id character varying,
    status text DEFAULT 'active'::text NOT NULL,
    auto_renew boolean DEFAULT false NOT NULL,
    expires_at timestamp without time zone
);


ALTER TABLE public.user_plans OWNER TO neondb_owner;

--
-- Name: user_resources; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_resources (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    resource_id character varying NOT NULL,
    purchase_method text NOT NULL,
    credits_spent integer,
    amount_paid numeric(10,2),
    purchased_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_resources OWNER TO neondb_owner;

--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'user'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    phone text,
    deactivated boolean DEFAULT false NOT NULL,
    deactivated_at timestamp without time zone,
    full_name text,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    approval_status text DEFAULT 'pending'::text,
    approved_at timestamp without time zone,
    approved_by character varying
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Data for Name: admin_messages; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_messages (id, sender_id, recipient_type, recipient_ids, subject, body, channel, status, sent_at) FROM stdin;
\.


--
-- Data for Name: ai_artifacts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.ai_artifacts (id, user_id, application_id, artifact_type, content, generated_at) FROM stdin;
\.


--
-- Data for Name: application_batches; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.application_batches (id, user_id, batch_number, status, submission_mode, automation_job_id, total_applications, started_at, completed_at, created_at) FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.applications (id, user_id, user_plan_id, job_id, job_title, company, status, batch_number, applied_date, created_at, updated_at, submission_mode, automation_job_id, source) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.audit_logs (id, admin_id, action, target_type, target_id, changes, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: automation_jobs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.automation_jobs (id, user_id, batch_id, provider, status, payload, error_log, scheduled_at, executed_at, created_at) FROM stdin;
\.


--
-- Data for Name: blog_posts; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.blog_posts (id, slug, title, excerpt, content, cover_image, author, category, tags, featured, published, published_at, created_at, updated_at) FROM stdin;
3ce3f540-2357-4006-ab71-088455fe2a86	how-jane-landed-faang-job	How Jane Landed a FAANG Job in 60 Days	From 200 applications to a $180k offer at a top tech company - here's Jane's complete journey and the strategies that worked.	# How Jane Landed a FAANG Job in 60 Days\n\nMeet Jane, a software engineer who went from sending 200 applications manually to landing her dream role at a FAANG company in just 60 days using JobApply.pro.\n\n## The Challenge\nJane had been applying to jobs for 6 months with minimal success. She was spending 30+ hours per week on applications but getting very few responses.\n\n## The Strategy\nAfter signing up for JobApply.pro, Jane implemented a three-pronged approach:\n\n### 1. Volume & Automation\nUsing our automated application system, Jane applied to 150+ relevant positions in the first month while focusing her energy on preparation.\n\n### 2. Quality Targeting\nJane used our resources to:\n- Optimize her resume for ATS systems\n- Craft compelling cover letters\n- Prepare for behavioral interviews\n- Practice system design questions\n\n### 3. Network Building\nWhile applications ran automatically, Jane built relationships on LinkedIn and attended virtual networking events.\n\n## The Results\n- Week 3: First round of callbacks (8 companies)\n- Week 5: Technical interviews (5 companies)\n- Week 7: Final rounds (3 companies)\n- Week 8: Multiple offers, accepted $180k role at FAANG\n\n## Key Takeaways\n1. Automation freed up time for meaningful preparation\n2. Quality application tracking helped identify successful patterns\n3. Consistency was key - applications every batch for 8 weeks straight\n\nReady to write your own success story? Get started with JobApply.pro today.	\N	JobApply Team	success_stories	{"success story",faang,"software engineering"}	t	t	2025-10-31 14:22:10.42	2025-10-31 14:22:10.439675	2025-10-31 14:22:10.439675
4c681333-a3c1-4af0-ae07-4006a59b5636	job-market-trends-2025	Job Market Trends to Watch in 2025	Industry insights and hiring trends that will shape your job search strategy this year.	# Job Market Trends to Watch in 2025\n\nThe job market is evolving rapidly. Here's what you need to know to stay ahead.\n\n## 1. AI Integration Everywhere\nCompanies are looking for candidates who can work alongside AI tools. Highlight your experience with:\n- ChatGPT and Claude for productivity\n- GitHub Copilot for development\n- AI-powered analytics tools\n- Automation platforms\n\n## 2. Remote-First is Here to Stay\n67% of companies now offer remote or hybrid positions as standard. Position yourself accordingly:\n- Build remote work experience\n- Demonstrate self-management\n- Showcase digital communication skills\n\n## 3. Skills Over Degrees\nMore employers are dropping degree requirements in favor of demonstrated skills and portfolios.\n\n## 4. Shorter Interview Cycles\nCompanies are streamlining hiring to avoid losing candidates. Average time-to-hire is down from 42 to 28 days.\n\n## 5. Compensation Transparency\nSalary ranges in job postings are becoming standard, giving candidates better negotiating power.\n\n## What This Means for You\n- Learn AI tools in your field\n- Build a strong online portfolio\n- Practice efficient interviewing\n- Research compensation data\n\nStay informed and adapt your strategy to these trends for maximum success.	\N	Sarah Chen, Career Strategist	job_market	{trends,2025,hiring,"remote work"}	t	t	2025-10-24 14:22:10.421	2025-10-31 14:22:10.480531	2025-10-31 14:22:10.480531
115e0679-06a0-494e-bf7a-b60042636a9e	introducing-automation-features	Introducing JobApply.pro Automation Features	We're excited to announce powerful new automation capabilities that will transform your job search.	# Introducing JobApply.pro Automation Features\n\nWe're thrilled to announce the launch of our Phase 3 automation features, designed to make your job search more efficient than ever.\n\n## What's New\n\n### Batch Processing\nSubmit up to 150 applications per batch with automatic tracking and status updates.\n\n### Automated Status Tracking\nWe monitor your applications and notify you of status changes so you never miss an update.\n\n### Smart Job Matching\nOur system learns from your preferences and suggests the most relevant opportunities.\n\n### Timeline Visualization\nSee your entire application journey at a glance with our new batch timeline feature.\n\n## Getting Started\n\n1. Purchase an application credit plan\n2. Upload your preferences and materials\n3. Let our system handle the submissions\n4. Track everything from your dashboard\n\n## Early Results\nBeta users have seen:\n- 3x increase in application volume\n- 40% more interview callbacks\n- 60% time savings on job search activities\n\n## Coming Soon\n- AI-powered cover letter generation\n- Advanced analytics dashboard\n- Integration with top job boards\n\nStart automating your job search today!	\N	JobApply Team	platform_updates	{features,automation,announcement}	f	t	2025-10-17 14:22:10.421	2025-10-31 14:22:10.517179	2025-10-31 14:22:10.517179
56d46ffe-383b-4279-b149-4b9e2e37be53	behavioral-interview-mastery	Mastering Behavioral Interviews: The Complete Framework	Learn the proven STAR method and how to craft compelling stories that win over hiring managers.	# Mastering Behavioral Interviews: The Complete Framework\n\nBehavioral interviews can make or break your candidacy. Here's how to excel.\n\n## Understanding the STAR Method\n\n**S**ituation: Set the context\n**T**ask: Describe the challenge\n**A**ction: Explain what you did\n**R**esult: Share the outcome\n\n## Common Questions & Example Responses\n\n### "Tell me about a time you faced a conflict with a teammate"\n\n**Situation:** During a product launch, my teammate and I disagreed about the priority of features.\n\n**Task:** We needed to align on the roadmap to meet our deadline.\n\n**Action:** I scheduled a meeting to understand their perspective, shared data on user impact, and we collaboratively reprioritized.\n\n**Result:** We launched on time with the highest-impact features, leading to a 25% increase in user engagement.\n\n## Top 10 Questions to Prepare\n\n1. Tell me about yourself\n2. Describe a challenge you overcame\n3. Talk about a time you showed leadership\n4. Give an example of handling failure\n5. Describe a successful project you led\n6. Talk about working with a difficult person\n7. Explain a time you went above and beyond\n8. Describe a time you had to learn quickly\n9. Give an example of innovative thinking\n10. Talk about receiving constructive criticism\n\n## Preparation Tips\n\n- Write out 5-7 core stories covering different competencies\n- Practice out loud, not just in your head\n- Get feedback from friends or mentors\n- Keep responses to 2-3 minutes max\n- Always include metrics and results\n\nMaster these techniques and you'll stand out from other candidates.	\N	Michael Torres, Interview Coach	career_tips	{interviews,behavioral,"star method",preparation}	f	t	2025-10-10 14:22:10.421	2025-10-31 14:22:10.552973	2025-10-31 14:22:10.552973
\.


--
-- Data for Name: cv_enhancement_orders; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cv_enhancement_orders (id, user_id, cv_upload_id, plan_id, stripe_payment_intent_id, status, amount_paid, order_notes, admin_assigned_to, completed_by, created_at, completed_at) FROM stdin;
188cf356-5a41-41ee-8217-d5fb6a60407a	88789620-c8fe-4082-8a51-a743b2559967	9a7778cc-9941-48ac-8d71-d6281a4b465b	c6d333c1-2e5d-41ee-ad2d-7a8052437191	\N	pending	39.00	\N	\N	\N	2025-11-02 18:41:58.796849	\N
\.


--
-- Data for Name: cv_uploads; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cv_uploads (id, user_id, original_filename, stored_filename, file_size, ats_score, ats_details, enhancement_purchased, enhancement_completed, enhancement_notes, enhanced_filename, uploaded_at, enhancement_completed_at) FROM stdin;
0779af6b-3ef0-4d14-b8da-31fe7a3b8556	a297b215-35fa-4cfd-981e-77271d78ca65	resume.pdf	resume.pdf	113	33	{"breakdown": {"keywords": 23, "structure": 34, "formatting": 38, "contactInfo": 70}, "overallScore": 33, "recommendations": ["Improve formatting: Use standard fonts (Arial, Calibri) and consistent spacing", "Add industry-specific keywords: Include technical skills, certifications, and relevant buzzwords from job descriptions", "Enhance structure: Use clear section headings (Experience, Education, Skills) and bullet points", "Complete contact information: Ensure phone number, email, and LinkedIn profile are prominently displayed", "Consider professional CV enhancement to maximize your ATS score", "Optimize content length: Most ATS systems prefer 1-2 page CVs", "Use action verbs: Start bullet points with strong verbs like 'Led', 'Implemented', 'Achieved'"]}	f	f	\N	\N	2025-11-02 18:26:05.430135	\N
250a023c-89ca-4dec-acfd-fb5d57498e4d	8c6add15-2ea2-4b82-b2bf-b009377e5a64	test-cv.pdf	test-cv.pdf	22	33	{"breakdown": {"keywords": 24, "structure": 37, "formatting": 37, "contactInfo": 70}, "overallScore": 33, "recommendations": ["Improve formatting: Use standard fonts (Arial, Calibri) and consistent spacing", "Add industry-specific keywords: Include technical skills, certifications, and relevant buzzwords from job descriptions", "Enhance structure: Use clear section headings (Experience, Education, Skills) and bullet points", "Complete contact information: Ensure phone number, email, and LinkedIn profile are prominently displayed", "Consider professional CV enhancement to maximize your ATS score", "Optimize content length: Most ATS systems prefer 1-2 page CVs", "Use action verbs: Start bullet points with strong verbs like 'Led', 'Implemented', 'Achieved'"]}	f	f	\N	\N	2025-11-02 18:34:40.523653	\N
3e3a32fb-7986-4f10-85b8-add6e5831dd4	34b2c9b0-6ce7-4cd4-b25d-b59a04fea4ce	test-resume.pdf	test-resume.pdf	58	38	{"breakdown": {"keywords": 31, "structure": 35, "formatting": 44, "contactInfo": 69}, "overallScore": 38, "recommendations": ["Improve formatting: Use standard fonts (Arial, Calibri) and consistent spacing", "Enhance structure: Use clear section headings (Experience, Education, Skills) and bullet points", "Complete contact information: Ensure phone number, email, and LinkedIn profile are prominently displayed", "Consider professional CV enhancement to maximize your ATS score", "Optimize content length: Most ATS systems prefer 1-2 page CVs", "Use action verbs: Start bullet points with strong verbs like 'Led', 'Implemented', 'Achieved'"]}	f	f	\N	\N	2025-11-02 18:38:14.09075	\N
9a7778cc-9941-48ac-8d71-d6281a4b465b	88789620-c8fe-4082-8a51-a743b2559967	final-cv.pdf	final-cv.pdf	30	37	{"breakdown": {"keywords": 27, "structure": 37, "formatting": 47, "contactInfo": 66}, "overallScore": 37, "recommendations": ["Improve formatting: Use standard fonts (Arial, Calibri) and consistent spacing", "Add industry-specific keywords: Include technical skills, certifications, and relevant buzzwords from job descriptions", "Enhance structure: Use clear section headings (Experience, Education, Skills) and bullet points", "Complete contact information: Ensure phone number, email, and LinkedIn profile are prominently displayed", "Consider professional CV enhancement to maximize your ATS score", "Optimize content length: Most ATS systems prefer 1-2 page CVs", "Use action verbs: Start bullet points with strong verbs like 'Led', 'Implemented', 'Achieved'"]}	f	f	\N	\N	2025-11-02 18:41:47.854211	\N
\.


--
-- Data for Name: job_roles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.job_roles (id, role_id, role_name, role_type, industry, key_skills, active, created_at, updated_at) FROM stdin;
e9817e9b-845c-4630-943a-5f4b53864861	1	Product Manager	Management	Technology, Healthcare, Retail, Finance	{"Product Strategy",Agile,"Product Lifecycle"}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
8080cb53-8b56-4342-9180-d38c6957398b	2	Program Manager	Management	Government, Technology, Construction, Health	{"Multi-project Coordination","Risk Management"}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
8ea354e1-aafa-4d79-b0c6-6791838bde05	3	Project Manager	Management	Any Industry, IT, Construction, Health, Marketing	{"Delivery Oversight",PMO,Agile,Waterfall}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
2581cada-68c3-4438-852e-b84faea9e4db	4	Customer Service	Support	Retail, Ecommerce, Telecom, Banking, Health	{"Inbound/Outbound Support","CRM Tools"}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
579cce31-6dbb-440a-8f71-8db2da6f3f3f	5	Sales Representative	Sales	Retail, FMCG, SaaS, Healthcare, Finance	{"B2B/B2C Sales","Lead Generation",CRM}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
1382b3a3-cf2f-4b8e-b0c6-c04e82d68c06	6	Data Entry	Administrative	Any Industry, Finance, Healthcare, Ecommerce	{"Database Management",Excel,Accuracy}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
c4555d28-a884-4b74-9751-cc97f081f8b2	7	Admin Assistant	Administrative	Corporate, Education, Healthcare, Non-profit	{"Office Management",Scheduling,Documentation}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
1aad5ed0-4e8f-4c1c-ae3f-fe515fe8d39f	8	Virtual Assistant	Administrative	Any Industry, Ecommerce, Startups, Real Estate	{"Remote Admin Support",Calendar,"Email Management"}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
72f47c1a-cb42-4965-96a7-22d5b465a37c	9	Software Engineer	Technical	Technology, Finance, Healthcare, Government	{Python,Java,C++,"Systems Design"}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
7b4f2e6a-464d-4be6-b66c-dcd2044ea70a	10	Software Developer	Technical	Any Industry, Ecommerce, Private, Public	{"Python Dev","Full Stack",Backend,Frontend}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
be5a6a1f-549c-4c16-b869-ceb853a544e3	11	Cyber Security	Technical	Finance, Government, Healthcare, Telecom	{"Network Security","Pen Testing",Compliance}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
74f497f8-4f10-4edb-ad00-6591848a1dda	12	Salesforce	Technical	CRM, SaaS, Consulting, Finance, Health	{"Salesforce Admin",Developer,Consultant}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
df903c9d-e3b8-4478-9fa0-055d15619a1c	13	Ecommerce Executive	Marketing	Ecommerce, Retail, Fashion, Consumer Goods	{"Digital Marketing","Product Listings",Analytics}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
87430050-8197-4403-91b2-d2b0a3b4964a	14	Ecommerce Assistant	Support	Ecommerce, Retail, Fashion, FMCG	{"Order Management",Listings,"Inventory Support"}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
2e66b0d3-b725-4204-b1bc-db92fba71d77	15	Ecommerce Specialist	Marketing	Ecommerce, Retail, Tech, Fashion	{SEO,PPC,"Email Campaigns",CRO}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
8b6b0113-3d41-4249-aed5-b2e25642c764	16	Support Worker	Care Services	Health, Social Care, Non-profit, Government	{"Home Care","Mental Health Support",Disabilities}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
02b7b162-6464-4166-a459-8681323edacd	17	Care Worker	Care Services	Health, Residential Care, Community Care, Private	{Safeguarding,"Patient Assistance","Elderly Care"}	t	2025-11-02 16:57:01.683867	2025-11-02 16:57:01.683867
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.notifications (id, user_id, type, message, read, created_at, channel, metadata) FROM stdin;
\.


--
-- Data for Name: page_content; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.page_content (id, page_name, sections, updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: payment_methods; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.payment_methods (id, user_id, stripe_payment_method_id, type, last4, brand, expiry_month, expiry_year, is_default, created_at) FROM stdin;
\.


--
-- Data for Name: plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.plans (id, sku, name, description, credits, price, active, created_at, type, billing_period, stripe_product_id, stripe_price_id) FROM stdin;
d7b6a1d0-ed43-494e-8e3a-2d0291c234e1	APPS_150	Professional	Perfect for active job seekers	150	79.00	t	2025-10-31 12:35:01.064043	one_time	\N	\N	\N
0dddd2db-761e-4535-9e9a-791b9187ac92	APPS_300	Premium	For serious job hunters	300	139.00	t	2025-10-31 12:35:01.107666	one_time	\N	\N	\N
a726dbdb-2fb4-4a3e-be21-7fd08c050f9e	APPS_500	Professional Plus	Maximum application volume	500	199.00	t	2025-10-31 12:35:01.153434	one_time	\N	\N	\N
bcfcdabc-9c4f-4b07-a884-4d34f0e2cfdb	APPS_1000	Enterprise	Unlimited opportunities	1000	349.00	t	2025-10-31 12:35:01.198584	one_time	\N	\N	\N
c6d333c1-2e5d-41ee-ad2d-7a8052437191	CV_RETOUCH	CV Enhancement	Professional CV review service	0	39.00	t	2025-10-31 12:35:01.24306	one_time	\N	\N	\N
60a9950c-bb66-43da-b20d-60f225ad66d8	TRIAL_10	Trial	Perfect for testing our service	10	3.00	t	2025-10-31 12:35:01.017908	one_time	\N	\N	\N
30635094-1be6-4dc8-9313-70bbe8399964	cv-enhancement	CV Enhancement Service	Professional CV enhancement and optimization by our expert team. Includes formatting, keyword optimization, and content improvements to maximize your ATS score and interview chances.	0	39.00	t	2025-11-02 16:55:59.242702	one_time	\N	\N	\N
\.


--
-- Data for Name: promo_codes; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.promo_codes (id, code, description, discount_type, discount_value, max_uses, current_uses, expires_at, active, created_by, created_at) FROM stdin;
3dc3a96c-0809-4113-87b6-38cdf2a42b32	TEST20		percentage	20.00	10	0	2025-11-30 00:00:00	f	16a5c1fa-3210-4b9e-ad2b-24be66907043	2025-10-31 17:32:52.075402
\.


--
-- Data for Name: resources; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.resources (id, slug, title, description, content, category, is_paid, price, credits, tags, featured, active, created_at, updated_at) FROM stdin;
6b36d24a-912d-486b-8219-1fd0c2a871a8	ultimate-interview-guide	The Ultimate Interview Preparation Guide	Master your next job interview with our comprehensive guide covering behavioral questions, technical interviews, and negotiation strategies.	# The Ultimate Interview Preparation Guide\n\n## Introduction\nLanding your dream job requires more than just a great resume. This guide will help you prepare for every aspect of the interview process.\n\n## Behavioral Questions\nLearn the STAR method (Situation, Task, Action, Result) to structure compelling responses to common behavioral questions.\n\n### Common Questions:\n- Tell me about yourself\n- Why do you want to work here?\n- What's your greatest weakness?\n- Describe a challenge you've overcome\n\n## Technical Interviews\nPrepare for coding challenges, system design questions, and domain-specific technical assessments.\n\n## Negotiation Strategies\nLearn how to negotiate salary, benefits, and work arrangements confidently.\n\n## Follow-up Best Practices\nMaster the art of post-interview communication to stay top-of-mind with hiring managers.	interview_tips	f	\N	\N	{interview,behavioral,technical,negotiation}	t	t	2025-10-31 14:22:10.218512	2025-10-31 14:22:10.218512
8d14313a-df97-4a49-b062-62ee5488dcac	cv-optimization-checklist	CV Optimization Checklist	Transform your resume into an ATS-friendly, recruiter-approved document that gets you noticed.	# CV Optimization Checklist\n\n## Format & Layout\n- ✓ Use a clean, professional template\n- ✓ Stick to 1-2 pages maximum\n- ✓ Use consistent formatting and spacing\n- ✓ Choose readable fonts (Arial, Calibri, Times New Roman)\n\n## Content Optimization\n- ✓ Include quantifiable achievements\n- ✓ Use action verbs (Led, Developed, Improved)\n- ✓ Tailor content to job description\n- ✓ Remove outdated or irrelevant experience\n\n## ATS Optimization\n- ✓ Include relevant keywords from job posting\n- ✓ Use standard section headings\n- ✓ Avoid images, tables, and complex formatting\n- ✓ Submit in .docx or PDF format\n\n## Contact Information\n- ✓ Professional email address\n- ✓ LinkedIn profile URL\n- ✓ Location (city, country)\n- ✓ Phone number	cv_guides	f	\N	\N	{cv,resume,ats,optimization}	t	t	2025-10-31 14:22:10.293033	2025-10-31 14:22:10.293033
fbb39e7a-dd9b-41ad-b269-05dc26bbbc6c	linkedin-networking-masterclass	LinkedIn Networking Masterclass	Build a powerful professional network and unlock hidden job opportunities on LinkedIn.	# LinkedIn Networking Masterclass\n\n## Profile Optimization\nCreate a compelling profile that attracts recruiters and hiring managers.\n\n### Key Elements:\n- Professional headshot\n- Compelling headline\n- Results-focused summary\n- Detailed work experience\n- Skills endorsements\n- Recommendations\n\n## Content Strategy\nPosition yourself as a thought leader in your industry.\n\n### Content Ideas:\n- Share industry insights\n- Comment on trending topics\n- Write original articles\n- Celebrate achievements\n\n## Networking Tactics\nBuild meaningful connections that lead to opportunities.\n\n### Best Practices:\n- Personalize connection requests\n- Engage with others' content\n- Join relevant groups\n- Attend virtual events\n\n## Job Search Strategy\nUse LinkedIn's tools to discover and apply for opportunities.	job_search	t	29.99	20	{linkedin,networking,"job search","personal branding"}	t	t	2025-10-31 14:22:10.3298	2025-10-31 14:22:10.3298
733a96a7-68ad-43f1-ac46-0dee40fc58da	salary-negotiation-scripts	Salary Negotiation Scripts & Templates	Proven email templates and conversation scripts for negotiating your best compensation package.	# Salary Negotiation Scripts & Templates\n\n## Email Templates\n\n### Template 1: Initial Offer Response\n"Thank you for the offer! I'm excited about the opportunity to join [Company]. Before I can formally accept, I'd like to discuss the compensation package to ensure it aligns with my experience and market rates."\n\n### Template 2: Counter Offer\n"Based on my research and the value I'll bring to the role, I was expecting a salary in the range of $X-Y. Is there flexibility to adjust the base salary?"\n\n## Phone Scripts\n\n### Opening Statement\n"I'm really enthusiastic about this role and I can see myself making significant contributions to the team. That said, I'd like to discuss the compensation to ensure we're aligned."\n\n### Responding to "What's your expected salary?"\n"Based on my X years of experience in [field], similar roles in [location], and the value I'll bring, I'm targeting a range of $X-Y. How does that align with your budget?"\n\n## Benefits Negotiation\nDon't forget to negotiate beyond base salary:\n- Signing bonus\n- Performance bonuses\n- Stock options/RSUs\n- Remote work flexibility\n- Professional development budget\n- Vacation days	career_advice	t	19.99	15	{salary,negotiation,compensation,templates}	f	t	2025-10-31 14:22:10.366181	2025-10-31 14:22:10.366181
6ee90b3a-ec63-46ac-b915-fc3ad8cd66c6	remote-job-search-guide	Remote Job Search Strategy Guide	Find and land remote positions with our specialized guide for distributed work opportunities.	# Remote Job Search Strategy Guide\n\n## Best Remote Job Boards\n- FlexJobs\n- We Work Remotely\n- Remote.co\n- Working Nomads\n- AngelList (for startups)\n\n## Optimizing for Remote Roles\n- Highlight remote work experience\n- Showcase self-management skills\n- Demonstrate communication abilities\n- Emphasize results over activity\n\n## Remote Interview Tips\n- Test your tech setup beforehand\n- Prepare your background\n- Practice video presence\n- Be ready to discuss time zone flexibility\n\n## Red Flags to Watch For\n- Vague job descriptions\n- No mention of communication tools\n- Lack of remote work policies\n- Unrealistic salary ranges	job_search	f	\N	\N	{remote,"work from home","distributed teams"}	f	t	2025-10-31 14:22:10.402443	2025-10-31 14:22:10.402443
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.session (sid, sess, expire) FROM stdin;
d9HnTwWXI7p2Fep9ScdSWrGW-aAkkThO	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:25:43.960Z","secure":false,"httpOnly":true,"path":"/"},"userId":"a297b215-35fa-4cfd-981e-77271d78ca65"}	2025-11-09 18:26:32
0z03Sjf8fWI5i8zufqPQF_-_BgHNZKf8	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:22:00.378Z","secure":false,"httpOnly":true,"path":"/"},"userId":"6ad67f20-075e-4d39-baf4-19b31e7237a7"}	2025-11-09 18:22:25
rl625EY6xeVXeh5aYQ55hmWQ_fxlOwLO	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:41:10.751Z","secure":false,"httpOnly":true,"path":"/"},"userId":"88789620-c8fe-4082-8a51-a743b2559967"}	2025-11-09 18:41:59
lnoP0HSK94peDOOcmW9OWKZd522WfS3v	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T19:01:49.607Z","secure":false,"httpOnly":true,"path":"/"},"userId":"ee848cc2-9132-4b6c-b0e2-59b08a131c73"}	2025-11-09 19:04:11
YUFMht3vPSol5PQWbl3XgPJJXVjMncG6	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:55:34.242Z","secure":false,"httpOnly":true,"path":"/"},"userId":"3878149d-6c09-4c68-a158-465b4252ed3e"}	2025-11-09 18:56:35
VVHjDoMj4cAROAXb2Ull5kywiX0jMjgc	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:17:27.477Z","secure":false,"httpOnly":true,"path":"/"},"userId":"ecce8af0-6c83-4a87-9904-be60e066a2e7"}	2025-11-09 18:17:50
3UUlrlVXrnOV-bGpBurIugaacXqmIij6	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:06:54.715Z","secure":false,"httpOnly":true,"path":"/"},"userId":"58f541d5-f99d-4bb0-906b-eaa8785de3c1"}	2025-11-09 18:06:55
xlHGfVtM9-BD9rOA4nWRrG19UUVcb7tA	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:48:17.714Z","secure":false,"httpOnly":true,"path":"/"},"userId":"31fb6861-8efd-40e5-9205-6a5b761aba67"}	2025-11-09 18:51:13
vJvP9XpAUzRXgEebxQ5y9AxfoF7AcOvP	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:28:27.959Z","secure":false,"httpOnly":true,"path":"/"},"userId":"4974aa08-6380-4353-b79b-60da7842427b"}	2025-11-09 18:29:41
nadwlBjwdKzDOOne3SmArEMbTVfZ-6ei	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T19:28:25.508Z","secure":false,"httpOnly":true,"path":"/"},"userId":"4bde9c7b-d264-46a4-b9c1-3ad90f008d00"}	2025-11-09 19:28:58
Sa5jhJgVE-FqjIaRtqx_hCd83aD-npYJ	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:09:05.714Z","secure":false,"httpOnly":true,"path":"/"},"userId":"904fce5b-afb7-4282-8618-32abc186f841"}	2025-11-09 18:09:18
BR-lKAkazuduIL5KMUMYlPk-ipL-a7wh	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T19:06:37.693Z","secure":false,"httpOnly":true,"path":"/"},"userId":"656e895d-9067-476b-a603-39ed45e2cd0f"}	2025-11-09 19:08:20
iX606TeIlH-HyNJ5dLFY3U-URbpVBe1s	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-08T13:32:03.415Z","secure":false,"httpOnly":true,"path":"/"},"userId":"16a5c1fa-3210-4b9e-ad2b-24be66907043"}	2025-11-09 20:36:51
sMv-XvpXeG8hMtX-Ivwru2PlFSB_h390	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:58:39.435Z","secure":false,"httpOnly":true,"path":"/"},"userId":"8766623b-1f03-4d04-a687-dc700b7394d0"}	2025-11-09 19:00:01
VLdBfxBzUXHlr_43OU17In7RzhYyrclk	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:34:01.244Z","secure":false,"httpOnly":true,"path":"/"},"userId":"8c6add15-2ea2-4b82-b2bf-b009377e5a64"}	2025-11-09 18:34:51
_UdhBhI4vuzGI9xDrh8Z3_v80WP6zGI0	{"cookie":{"originalMaxAge":604800000,"expires":"2025-11-09T18:37:43.710Z","secure":false,"httpOnly":true,"path":"/"},"userId":"34b2c9b0-6ce7-4cd4-b25d-b59a04fea4ce"}	2025-11-09 18:38:32
\.


--
-- Data for Name: subscriptions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.subscriptions (id, user_id, plan_id, stripe_subscription_id, stripe_customer_id, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at, amount) FROM stdin;
\.


--
-- Data for Name: transactions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transactions (id, user_id, plan_id, subscription_id, stripe_payment_intent_id, stripe_invoice_id, type, status, amount, currency, description, promo_code_id, discount_amount, metadata, created_at) FROM stdin;
3efd4b53-d6d2-4efa-b9c6-4daec759ea18	ee848cc2-9132-4b6c-b0e2-59b08a131c73	d7b6a1d0-ed43-494e-8e3a-2d0291c234e1	\N	\N	\N	purchase	completed	79.00	usd	\N	\N	\N	\N	2025-11-02 19:03:45.425667
77ccbd97-58bd-4308-bf2a-a9548646b875	656e895d-9067-476b-a603-39ed45e2cd0f	d7b6a1d0-ed43-494e-8e3a-2d0291c234e1	\N	\N	\N	purchase	completed	79.00	usd	\N	\N	\N	\N	2025-11-02 19:08:01.091525
\.


--
-- Data for Name: uploaded_images; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.uploaded_images (id, filename, url, mime_type, size, uploaded_by, created_at) FROM stdin;
\.


--
-- Data for Name: user_job_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_job_preferences (id, user_id, selected_role_ids, preferred_email, interview_phone, setup_completed, admin_approved, admin_approved_by, admin_approved_at, admin_notes, created_at, updated_at) FROM stdin;
a7e1cd9f-4869-4247-bae2-b2a76c1fa88d	4974aa08-6380-4353-b79b-60da7842427b	{c4555d28-a884-4b74-9751-cc97f081f8b2,1382b3a3-cf2f-4b8e-b0c6-c04e82d68c06,1aad5ed0-4e8f-4c1c-ae3f-fe515fe8d39f,02b7b162-6464-4166-a459-8681323edacd,e9817e9b-845c-4630-943a-5f4b53864861}	jobpref2uBdpo@example.com	+447555666777	f	f	\N	\N	\N	2025-11-02 18:29:27.929961	2025-11-02 18:29:27.929961
\.


--
-- Data for Name: user_notification_preferences; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_notification_preferences (id, user_id, email_enabled, sms_enabled, batch_completion_alerts, status_update_alerts, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: user_plans; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_plans (id, user_id, plan_id, credits_remaining, purchased_at, subscription_id, status, auto_renew, expires_at) FROM stdin;
cbd47f1d-f3af-4f72-b355-1e363d2c3bd8	ee848cc2-9132-4b6c-b0e2-59b08a131c73	d7b6a1d0-ed43-494e-8e3a-2d0291c234e1	150	2025-11-02 19:03:45.484891	\N	active	f	\N
7a498530-0e2d-4e48-8552-3650fd9c1f04	656e895d-9067-476b-a603-39ed45e2cd0f	d7b6a1d0-ed43-494e-8e3a-2d0291c234e1	150	2025-11-02 19:08:01.121532	\N	active	f	\N
\.


--
-- Data for Name: user_resources; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_resources (id, user_id, resource_id, purchase_method, credits_spent, amount_paid, purchased_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, email, password, role, created_at, phone, deactivated, deactivated_at, full_name, updated_at, approval_status, approved_at, approved_by) FROM stdin;
33150166-543c-4098-b3a8-16128762c8c6	newuserO0lRtk@example.com	$2b$10$ns8YWMhS3KqB4wMTvuH6Xe04W7zj0dyGHuVxsvgh0PMZMTwNWTOlO	user	2025-10-31 20:07:40.643047	\N	f	\N	\N	2025-11-02 18:04:39.785778	pending	\N	\N
1f1fafc8-5b5e-430f-a6e6-3807a5111ff5	testjourney8n0m2x@example.com	$2b$10$YZnRII9dMkplxwiJxO1Y4OPS/ahArioKO/hg3kaBVZ9XaSThslY.e	user	2025-10-31 20:12:36.103379	\N	f	\N	\N	2025-11-02 18:04:39.785778	pending	\N	\N
5fd2aa9f-c6ef-4bca-b143-fa1bb08b507a	admintest5FZZ31@example.com	$2b$10$ISQjTdTDB2L3krNQbASHNu8NG2WZorc3wSmMhZlXjgTfZNE2oktLe	user	2025-10-31 20:17:16.023452	+447700999888	f	\N	\N	2025-11-02 18:04:39.785778	pending	\N	\N
16a5c1fa-3210-4b9e-ad2b-24be66907043	admin@jobapply.pro	$2b$10$XtiQq3xycGV0bsvQ6OYJ0uZMmXX1rExuBGFsQ/SACVLni26ZNQa4S	admin	2025-10-31 12:35:00.962787	\N	f	\N	\N	2025-11-02 18:04:39.785778	pending	\N	\N
94988956-e074-4024-82f5-4aceb861c267	test-uNd5xM@example.com	$2b$10$y18L3qmLpzRWeZa7DnzPb.4m7OunNHix91ryjFodkrvTAJsSaMXKS	user	2025-11-01 12:10:43.16956	\N	f	\N	\N	2025-11-02 18:04:39.785778	pending	\N	\N
58f541d5-f99d-4bb0-906b-eaa8785de3c1	testusersVM1E4@example.com	$2b$10$cSuUAhFf427KpN/eXaySsOvNLg5gqdXk9U44Ij64hQvT92NY4nRV.	user	2025-11-02 18:06:54.698142	+447123456789	f	\N	Test User Kmc5GD	2025-11-02 18:06:54.698142	pending	\N	\N
904fce5b-afb7-4282-8618-32abc186f841	paymenttestm_dKhW@example.com	$2b$10$enuVCT7hnDVGX97Hkhx3EOb/vvRM55z9RmcfEOo4N4Ag37IsE8e5e	user	2025-11-02 18:09:05.700108	+447987654321	f	\N	Payment Test User m_dKhW	2025-11-02 18:09:05.700108	pending	\N	\N
ecce8af0-6c83-4a87-9904-be60e066a2e7	cvtestVVWOh2@example.com	$2b$10$5mCZaplvYC//56BxiGKOu.EeFFv8sfoErcNM4JtkY92BDYfXHQ0MS	user	2025-11-02 18:17:27.462204	+447111222333	f	\N	CV Test User VVWOh2	2025-11-02 18:17:27.462204	pending	\N	\N
6ad67f20-075e-4d39-baf4-19b31e7237a7	cvuploadiMSe8b@example.com	$2b$10$Bxl.At4vntkWruwVEaDFkeUizZT3UkJQvyvj.8qP1ztKhPresY2Sa	user	2025-11-02 18:22:00.363525	+447444555666	f	\N	CV Upload Tester M0a6PX	2025-11-02 18:22:00.363525	pending	\N	\N
a297b215-35fa-4cfd-981e-77271d78ca65	cvfinalMwqXjv@example.com	$2b$10$hrqD2rHpJ.XbvAMnCRRUJuUlC5eBAHUABNciz5pgAo81mILTgShQ6	user	2025-11-02 18:25:43.946592	+447888999000	f	\N	CV Tester Final 2sIjgS	2025-11-02 18:25:43.946592	pending	\N	\N
4974aa08-6380-4353-b79b-60da7842427b	jobpref2uBdpo@example.com	$2b$10$sZ937npa8zaiAReOz8VBtOpP2NY4ifE4Lk4BQ6VBINjD02z5yBgIi	user	2025-11-02 18:28:27.943766	+447222333444	f	\N	Job Pref Tester 2uBdpo	2025-11-02 18:28:27.943766	pending	\N	\N
8c6add15-2ea2-4b82-b2bf-b009377e5a64	cvenhancejxC3DX@example.com	$2b$10$5XZInAQBaznQEVylrScACO5TGrusIyl23G0S9dmoSQYOn59NyMEvy	user	2025-11-02 18:34:01.224839	+447444555666	f	\N	CV Enhance Tester jxC3DX	2025-11-02 18:34:01.224839	pending	\N	\N
34b2c9b0-6ce7-4cd4-b25d-b59a04fea4ce	cvenhance2fploIs@example.com	$2b$10$nb.XNQmNiGaK2qBch9DAXe2DgtX8DmjPnpS1t89QquFe/wGFoN.PO	user	2025-11-02 18:37:43.694741	+447444555777	f	\N	CV Enhance Test2 fploIs	2025-11-02 18:37:43.694741	pending	\N	\N
88789620-c8fe-4082-8a51-a743b2559967	cvfinalP-0lud@example.com	$2b$10$wzTRXoPAj/T/rn8zje6aS.AXLRsK1tD3LwKT09VCZ1FJrQFwmaanm	user	2025-11-02 18:41:10.735559	+447444555888	f	\N	CV Enhance Final P-0lud	2025-11-02 18:41:10.735559	pending	\N	\N
31fb6861-8efd-40e5-9205-6a5b761aba67	paymenttestIPGx4Z@example.com	$2b$10$6VDlPCTeGzk12qlN.tZKju64gcW1gNMk/qkvadt0jM48X0bSG276m	user	2025-11-02 18:48:17.69646	+447123456789	f	\N	Payment Test User IPGx4Z	2025-11-02 18:48:17.69646	pending	\N	\N
3878149d-6c09-4c68-a158-465b4252ed3e	paycompleter6ieyw@example.com	$2b$10$qXtliTI1xkEp1gAdZeQ6X.LXxgo/icyesTCXMC36AEnou7TgCe9yq	user	2025-11-02 18:55:34.224356	+447999888777	f	\N	Payment Complete Test GIqZUw	2025-11-02 18:55:34.224356	pending	\N	\N
8766623b-1f03-4d04-a687-dc700b7394d0	paysuccessNi2OEz@example.com	$2b$10$Rs29TWmLrcQbU6Hfco.qlOKb6.QFuCpgdPxuwAeAMnkHESkyg8xsO	user	2025-11-02 18:58:39.420816	+447111222333	f	\N	Payment Success Ni2OEz	2025-11-02 18:58:39.420816	pending	\N	\N
ee848cc2-9132-4b6c-b0e2-59b08a131c73	payfinalseXhz1@example.com	$2b$10$GCU4d6OPgHNXaWumxufjKe0MqCIbZbWsgU4sa6Zyf1D59kRXCpF3u	user	2025-11-02 19:01:49.59295	+447000111222	f	\N	Payment Final seXhz1	2025-11-02 19:01:49.59295	pending	\N	\N
656e895d-9067-476b-a603-39ed45e2cd0f	paycomplete93qFXW@example.com	$2b$10$Vj1WRcFXZF5BrhYuUCAzvu8krNp58pwOqs4Fa3zUEauwoP7J3Cc.C	user	2025-11-02 19:06:37.647524	+447888999111	f	\N	Payment Complete 93qFXW	2025-11-02 19:06:37.647524	pending	\N	\N
4bde9c7b-d264-46a4-b9c1-3ad90f008d00	checkouttestctzcql@example.com	$2b$10$jdG9DrKc.zjjEdeP7J6W0..V/m9GmqkRSDxYxko7P61lcSv5gEQ2e	user	2025-11-02 19:28:25.492478	+447111222333	f	\N	Checkout Test ctzcql	2025-11-02 19:28:25.492478	pending	\N	\N
\.


--
-- Name: admin_messages admin_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_messages
    ADD CONSTRAINT admin_messages_pkey PRIMARY KEY (id);


--
-- Name: ai_artifacts ai_artifacts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_artifacts
    ADD CONSTRAINT ai_artifacts_pkey PRIMARY KEY (id);


--
-- Name: application_batches application_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_batches
    ADD CONSTRAINT application_batches_pkey PRIMARY KEY (id);


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: automation_jobs automation_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.automation_jobs
    ADD CONSTRAINT automation_jobs_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_unique UNIQUE (slug);


--
-- Name: cv_enhancement_orders cv_enhancement_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_enhancement_orders
    ADD CONSTRAINT cv_enhancement_orders_pkey PRIMARY KEY (id);


--
-- Name: cv_uploads cv_uploads_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_uploads
    ADD CONSTRAINT cv_uploads_pkey PRIMARY KEY (id);


--
-- Name: job_roles job_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_pkey PRIMARY KEY (id);


--
-- Name: job_roles job_roles_role_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.job_roles
    ADD CONSTRAINT job_roles_role_id_key UNIQUE (role_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: page_content page_content_page_name_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_content_page_name_unique UNIQUE (page_name);


--
-- Name: page_content page_content_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_content_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_pkey PRIMARY KEY (id);


--
-- Name: payment_methods payment_methods_stripe_payment_method_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_stripe_payment_method_id_unique UNIQUE (stripe_payment_method_id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: plans plans_sku_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_sku_unique UNIQUE (sku);


--
-- Name: promo_codes promo_codes_code_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_code_unique UNIQUE (code);


--
-- Name: promo_codes promo_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_pkey PRIMARY KEY (id);


--
-- Name: resources resources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_pkey PRIMARY KEY (id);


--
-- Name: resources resources_slug_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.resources
    ADD CONSTRAINT resources_slug_unique UNIQUE (slug);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: subscriptions subscriptions_stripe_subscription_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_stripe_subscription_id_unique UNIQUE (stripe_subscription_id);


--
-- Name: transactions transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_pkey PRIMARY KEY (id);


--
-- Name: transactions transactions_stripe_payment_intent_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_stripe_payment_intent_id_unique UNIQUE (stripe_payment_intent_id);


--
-- Name: uploaded_images uploaded_images_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_pkey PRIMARY KEY (id);


--
-- Name: user_job_preferences user_job_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_job_preferences
    ADD CONSTRAINT user_job_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_job_preferences user_job_preferences_user_id_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_job_preferences
    ADD CONSTRAINT user_job_preferences_user_id_key UNIQUE (user_id);


--
-- Name: user_notification_preferences user_notification_preferences_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_pkey PRIMARY KEY (id);


--
-- Name: user_notification_preferences user_notification_preferences_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_unique UNIQUE (user_id);


--
-- Name: user_plans user_plans_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_plans
    ADD CONSTRAINT user_plans_pkey PRIMARY KEY (id);


--
-- Name: user_resources user_resources_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_resources
    ADD CONSTRAINT user_resources_pkey PRIMARY KEY (id);


--
-- Name: users users_email_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_unique UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: neondb_owner
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: admin_messages admin_messages_sender_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_messages
    ADD CONSTRAINT admin_messages_sender_id_users_id_fk FOREIGN KEY (sender_id) REFERENCES public.users(id);


--
-- Name: ai_artifacts ai_artifacts_application_id_applications_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_artifacts
    ADD CONSTRAINT ai_artifacts_application_id_applications_id_fk FOREIGN KEY (application_id) REFERENCES public.applications(id);


--
-- Name: ai_artifacts ai_artifacts_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.ai_artifacts
    ADD CONSTRAINT ai_artifacts_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: application_batches application_batches_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.application_batches
    ADD CONSTRAINT application_batches_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: applications applications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: applications applications_user_plan_id_user_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.applications
    ADD CONSTRAINT applications_user_plan_id_user_plans_id_fk FOREIGN KEY (user_plan_id) REFERENCES public.user_plans(id);


--
-- Name: audit_logs audit_logs_admin_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_admin_id_users_id_fk FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: automation_jobs automation_jobs_batch_id_application_batches_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.automation_jobs
    ADD CONSTRAINT automation_jobs_batch_id_application_batches_id_fk FOREIGN KEY (batch_id) REFERENCES public.application_batches(id);


--
-- Name: automation_jobs automation_jobs_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.automation_jobs
    ADD CONSTRAINT automation_jobs_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cv_enhancement_orders cv_enhancement_orders_admin_assigned_to_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_enhancement_orders
    ADD CONSTRAINT cv_enhancement_orders_admin_assigned_to_fkey FOREIGN KEY (admin_assigned_to) REFERENCES public.users(id);


--
-- Name: cv_enhancement_orders cv_enhancement_orders_completed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_enhancement_orders
    ADD CONSTRAINT cv_enhancement_orders_completed_by_fkey FOREIGN KEY (completed_by) REFERENCES public.users(id);


--
-- Name: cv_enhancement_orders cv_enhancement_orders_cv_upload_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_enhancement_orders
    ADD CONSTRAINT cv_enhancement_orders_cv_upload_id_fkey FOREIGN KEY (cv_upload_id) REFERENCES public.cv_uploads(id);


--
-- Name: cv_enhancement_orders cv_enhancement_orders_plan_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_enhancement_orders
    ADD CONSTRAINT cv_enhancement_orders_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: cv_enhancement_orders cv_enhancement_orders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_enhancement_orders
    ADD CONSTRAINT cv_enhancement_orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: cv_uploads cv_uploads_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cv_uploads
    ADD CONSTRAINT cv_uploads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: page_content page_content_updated_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.page_content
    ADD CONSTRAINT page_content_updated_by_users_id_fk FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: payment_methods payment_methods_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.payment_methods
    ADD CONSTRAINT payment_methods_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: promo_codes promo_codes_created_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.promo_codes
    ADD CONSTRAINT promo_codes_created_by_users_id_fk FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: subscriptions subscriptions_plan_id_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: subscriptions subscriptions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: transactions transactions_plan_id_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: transactions transactions_subscription_id_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: transactions transactions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: uploaded_images uploaded_images_uploaded_by_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.uploaded_images
    ADD CONSTRAINT uploaded_images_uploaded_by_users_id_fk FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: user_job_preferences user_job_preferences_admin_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_job_preferences
    ADD CONSTRAINT user_job_preferences_admin_approved_by_fkey FOREIGN KEY (admin_approved_by) REFERENCES public.users(id);


--
-- Name: user_job_preferences user_job_preferences_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_job_preferences
    ADD CONSTRAINT user_job_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_notification_preferences user_notification_preferences_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_notification_preferences
    ADD CONSTRAINT user_notification_preferences_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_plans user_plans_plan_id_plans_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_plans
    ADD CONSTRAINT user_plans_plan_id_plans_id_fk FOREIGN KEY (plan_id) REFERENCES public.plans(id);


--
-- Name: user_plans user_plans_subscription_id_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_plans
    ADD CONSTRAINT user_plans_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id);


--
-- Name: user_plans user_plans_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_plans
    ADD CONSTRAINT user_plans_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_resources user_resources_resource_id_resources_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_resources
    ADD CONSTRAINT user_resources_resource_id_resources_id_fk FOREIGN KEY (resource_id) REFERENCES public.resources(id);


--
-- Name: user_resources user_resources_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_resources
    ADD CONSTRAINT user_resources_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

