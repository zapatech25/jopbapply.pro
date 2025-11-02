import { storage } from "./storage";

async function seedPhase4Data() {
  console.log("Seeding Phase 4 data...");

  // Seed Resources
  const resources = [
    {
      slug: "ultimate-interview-guide",
      title: "The Ultimate Interview Preparation Guide",
      description: "Master your next job interview with our comprehensive guide covering behavioral questions, technical interviews, and negotiation strategies.",
      content: `# The Ultimate Interview Preparation Guide

## Introduction
Landing your dream job requires more than just a great resume. This guide will help you prepare for every aspect of the interview process.

## Behavioral Questions
Learn the STAR method (Situation, Task, Action, Result) to structure compelling responses to common behavioral questions.

### Common Questions:
- Tell me about yourself
- Why do you want to work here?
- What's your greatest weakness?
- Describe a challenge you've overcome

## Technical Interviews
Prepare for coding challenges, system design questions, and domain-specific technical assessments.

## Negotiation Strategies
Learn how to negotiate salary, benefits, and work arrangements confidently.

## Follow-up Best Practices
Master the art of post-interview communication to stay top-of-mind with hiring managers.`,
      category: "interview_tips",
      isPaid: false,
      price: null,
      credits: null,
      tags: ["interview", "behavioral", "technical", "negotiation"],
      featured: true,
      active: true,
    },
    {
      slug: "cv-optimization-checklist",
      title: "CV Optimization Checklist",
      description: "Transform your resume into an ATS-friendly, recruiter-approved document that gets you noticed.",
      content: `# CV Optimization Checklist

## Format & Layout
- ✓ Use a clean, professional template
- ✓ Stick to 1-2 pages maximum
- ✓ Use consistent formatting and spacing
- ✓ Choose readable fonts (Arial, Calibri, Times New Roman)

## Content Optimization
- ✓ Include quantifiable achievements
- ✓ Use action verbs (Led, Developed, Improved)
- ✓ Tailor content to job description
- ✓ Remove outdated or irrelevant experience

## ATS Optimization
- ✓ Include relevant keywords from job posting
- ✓ Use standard section headings
- ✓ Avoid images, tables, and complex formatting
- ✓ Submit in .docx or PDF format

## Contact Information
- ✓ Professional email address
- ✓ LinkedIn profile URL
- ✓ Location (city, country)
- ✓ Phone number`,
      category: "cv_guides",
      isPaid: false,
      price: null,
      credits: null,
      tags: ["cv", "resume", "ats", "optimization"],
      featured: true,
      active: true,
    },
    {
      slug: "linkedin-networking-masterclass",
      title: "LinkedIn Networking Masterclass",
      description: "Build a powerful professional network and unlock hidden job opportunities on LinkedIn.",
      content: `# LinkedIn Networking Masterclass

## Profile Optimization
Create a compelling profile that attracts recruiters and hiring managers.

### Key Elements:
- Professional headshot
- Compelling headline
- Results-focused summary
- Detailed work experience
- Skills endorsements
- Recommendations

## Content Strategy
Position yourself as a thought leader in your industry.

### Content Ideas:
- Share industry insights
- Comment on trending topics
- Write original articles
- Celebrate achievements

## Networking Tactics
Build meaningful connections that lead to opportunities.

### Best Practices:
- Personalize connection requests
- Engage with others' content
- Join relevant groups
- Attend virtual events

## Job Search Strategy
Use LinkedIn's tools to discover and apply for opportunities.`,
      category: "job_search",
      isPaid: true,
      price: "29.99",
      credits: 20,
      tags: ["linkedin", "networking", "job search", "personal branding"],
      featured: true,
      active: true,
    },
    {
      slug: "salary-negotiation-scripts",
      title: "Salary Negotiation Scripts & Templates",
      description: "Proven email templates and conversation scripts for negotiating your best compensation package.",
      content: `# Salary Negotiation Scripts & Templates

## Email Templates

### Template 1: Initial Offer Response
"Thank you for the offer! I'm excited about the opportunity to join [Company]. Before I can formally accept, I'd like to discuss the compensation package to ensure it aligns with my experience and market rates."

### Template 2: Counter Offer
"Based on my research and the value I'll bring to the role, I was expecting a salary in the range of $X-Y. Is there flexibility to adjust the base salary?"

## Phone Scripts

### Opening Statement
"I'm really enthusiastic about this role and I can see myself making significant contributions to the team. That said, I'd like to discuss the compensation to ensure we're aligned."

### Responding to "What's your expected salary?"
"Based on my X years of experience in [field], similar roles in [location], and the value I'll bring, I'm targeting a range of $X-Y. How does that align with your budget?"

## Benefits Negotiation
Don't forget to negotiate beyond base salary:
- Signing bonus
- Performance bonuses
- Stock options/RSUs
- Remote work flexibility
- Professional development budget
- Vacation days`,
      category: "career_advice",
      isPaid: true,
      price: "19.99",
      credits: 15,
      tags: ["salary", "negotiation", "compensation", "templates"],
      featured: false,
      active: true,
    },
    {
      slug: "remote-job-search-guide",
      title: "Remote Job Search Strategy Guide",
      description: "Find and land remote positions with our specialized guide for distributed work opportunities.",
      content: `# Remote Job Search Strategy Guide

## Best Remote Job Boards
- FlexJobs
- We Work Remotely
- Remote.co
- Working Nomads
- AngelList (for startups)

## Optimizing for Remote Roles
- Highlight remote work experience
- Showcase self-management skills
- Demonstrate communication abilities
- Emphasize results over activity

## Remote Interview Tips
- Test your tech setup beforehand
- Prepare your background
- Practice video presence
- Be ready to discuss time zone flexibility

## Red Flags to Watch For
- Vague job descriptions
- No mention of communication tools
- Lack of remote work policies
- Unrealistic salary ranges`,
      category: "job_search",
      isPaid: false,
      price: null,
      credits: null,
      tags: ["remote", "work from home", "distributed teams"],
      featured: false,
      active: true,
    },
  ];

  for (const resource of resources) {
    try {
      await storage.createResource(resource);
      console.log(`✓ Created resource: ${resource.title}`);
    } catch (error) {
      console.log(`  Resource already exists or error: ${resource.slug}`);
    }
  }

  // Seed Blog Posts
  const blogPosts = [
    {
      slug: "how-jane-landed-faang-job",
      title: "How Jane Landed a FAANG Job in 60 Days",
      excerpt: "From 200 applications to a $180k offer at a top tech company - here's Jane's complete journey and the strategies that worked.",
      content: `# How Jane Landed a FAANG Job in 60 Days

Meet Jane, a software engineer who went from sending 200 applications manually to landing her dream role at a FAANG company in just 60 days using JobApply.pro.

## The Challenge
Jane had been applying to jobs for 6 months with minimal success. She was spending 30+ hours per week on applications but getting very few responses.

## The Strategy
After signing up for JobApply.pro, Jane implemented a three-pronged approach:

### 1. Volume & Automation
Using our automated application system, Jane applied to 150+ relevant positions in the first month while focusing her energy on preparation.

### 2. Quality Targeting
Jane used our resources to:
- Optimize her resume for ATS systems
- Craft compelling cover letters
- Prepare for behavioral interviews
- Practice system design questions

### 3. Network Building
While applications ran automatically, Jane built relationships on LinkedIn and attended virtual networking events.

## The Results
- Week 3: First round of callbacks (8 companies)
- Week 5: Technical interviews (5 companies)
- Week 7: Final rounds (3 companies)
- Week 8: Multiple offers, accepted $180k role at FAANG

## Key Takeaways
1. Automation freed up time for meaningful preparation
2. Quality application tracking helped identify successful patterns
3. Consistency was key - applications every batch for 8 weeks straight

Ready to write your own success story? Get started with JobApply.pro today.`,
      coverImage: null,
      author: "JobApply Team",
      category: "success_stories",
      tags: ["success story", "faang", "software engineering"],
      featured: true,
      published: true,
      publishedAt: new Date(),
    },
    {
      slug: "job-market-trends-2025",
      title: "Job Market Trends to Watch in 2025",
      excerpt: "Industry insights and hiring trends that will shape your job search strategy this year.",
      content: `# Job Market Trends to Watch in 2025

The job market is evolving rapidly. Here's what you need to know to stay ahead.

## 1. AI Integration Everywhere
Companies are looking for candidates who can work alongside AI tools. Highlight your experience with:
- ChatGPT and Claude for productivity
- GitHub Copilot for development
- AI-powered analytics tools
- Automation platforms

## 2. Remote-First is Here to Stay
67% of companies now offer remote or hybrid positions as standard. Position yourself accordingly:
- Build remote work experience
- Demonstrate self-management
- Showcase digital communication skills

## 3. Skills Over Degrees
More employers are dropping degree requirements in favor of demonstrated skills and portfolios.

## 4. Shorter Interview Cycles
Companies are streamlining hiring to avoid losing candidates. Average time-to-hire is down from 42 to 28 days.

## 5. Compensation Transparency
Salary ranges in job postings are becoming standard, giving candidates better negotiating power.

## What This Means for You
- Learn AI tools in your field
- Build a strong online portfolio
- Practice efficient interviewing
- Research compensation data

Stay informed and adapt your strategy to these trends for maximum success.`,
      coverImage: null,
      author: "Sarah Chen, Career Strategist",
      category: "job_market",
      tags: ["trends", "2025", "hiring", "remote work"],
      featured: true,
      published: true,
      publishedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
    {
      slug: "introducing-automation-features",
      title: "Introducing JobApply.pro Automation Features",
      excerpt: "We're excited to announce powerful new automation capabilities that will transform your job search.",
      content: `# Introducing JobApply.pro Automation Features

We're thrilled to announce the launch of our Phase 3 automation features, designed to make your job search more efficient than ever.

## What's New

### Batch Processing
Submit up to 150 applications per batch with automatic tracking and status updates.

### Automated Status Tracking
We monitor your applications and notify you of status changes so you never miss an update.

### Smart Job Matching
Our system learns from your preferences and suggests the most relevant opportunities.

### Timeline Visualization
See your entire application journey at a glance with our new batch timeline feature.

## Getting Started

1. Purchase an application credit plan
2. Upload your preferences and materials
3. Let our system handle the submissions
4. Track everything from your dashboard

## Early Results
Beta users have seen:
- 3x increase in application volume
- 40% more interview callbacks
- 60% time savings on job search activities

## Coming Soon
- AI-powered cover letter generation
- Advanced analytics dashboard
- Integration with top job boards

Start automating your job search today!`,
      coverImage: null,
      author: "JobApply Team",
      category: "platform_updates",
      tags: ["features", "automation", "announcement"],
      featured: false,
      published: true,
      publishedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
    {
      slug: "behavioral-interview-mastery",
      title: "Mastering Behavioral Interviews: The Complete Framework",
      excerpt: "Learn the proven STAR method and how to craft compelling stories that win over hiring managers.",
      content: `# Mastering Behavioral Interviews: The Complete Framework

Behavioral interviews can make or break your candidacy. Here's how to excel.

## Understanding the STAR Method

**S**ituation: Set the context
**T**ask: Describe the challenge
**A**ction: Explain what you did
**R**esult: Share the outcome

## Common Questions & Example Responses

### "Tell me about a time you faced a conflict with a teammate"

**Situation:** During a product launch, my teammate and I disagreed about the priority of features.

**Task:** We needed to align on the roadmap to meet our deadline.

**Action:** I scheduled a meeting to understand their perspective, shared data on user impact, and we collaboratively reprioritized.

**Result:** We launched on time with the highest-impact features, leading to a 25% increase in user engagement.

## Top 10 Questions to Prepare

1. Tell me about yourself
2. Describe a challenge you overcame
3. Talk about a time you showed leadership
4. Give an example of handling failure
5. Describe a successful project you led
6. Talk about working with a difficult person
7. Explain a time you went above and beyond
8. Describe a time you had to learn quickly
9. Give an example of innovative thinking
10. Talk about receiving constructive criticism

## Preparation Tips

- Write out 5-7 core stories covering different competencies
- Practice out loud, not just in your head
- Get feedback from friends or mentors
- Keep responses to 2-3 minutes max
- Always include metrics and results

Master these techniques and you'll stand out from other candidates.`,
      coverImage: null,
      author: "Michael Torres, Interview Coach",
      category: "career_tips",
      tags: ["interviews", "behavioral", "star method", "preparation"],
      featured: false,
      published: true,
      publishedAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
    },
  ];

  for (const post of blogPosts) {
    try {
      await storage.createBlogPost(post);
      console.log(`✓ Created blog post: ${post.title}`);
    } catch (error) {
      console.log(`  Blog post already exists or error: ${post.slug}`);
    }
  }

  console.log("\nPhase 4 seeding complete!");
  console.log(`- ${resources.length} resources created`);
  console.log(`- ${blogPosts.length} blog posts created`);
}

export { seedPhase4Data };

// Auto-run when executed directly
seedPhase4Data()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding error:", error);
    process.exit(1);
  });
