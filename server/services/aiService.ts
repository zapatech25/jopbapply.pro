import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

interface CVOptimizationInput {
  currentCV: string;
  targetRole?: string;
  targetIndustry?: string;
}

interface CoverLetterInput {
  jobTitle: string;
  company: string;
  jobDescription?: string;
  userCV?: string;
}

export async function generateCVOptimizationTips(input: CVOptimizationInput): Promise<string> {
  const { currentCV, targetRole, targetIndustry } = input;

  const prompt = `You are an expert career coach and CV consultant. Analyze the following CV and provide specific, actionable optimization tips to make it more effective.

${targetRole ? `Target Role: ${targetRole}` : ""}
${targetIndustry ? `Target Industry: ${targetIndustry}` : ""}

CV Content:
${currentCV}

Provide 5-8 specific, actionable tips to improve this CV. Focus on:
1. Content optimization (achievements, quantifiable results, impact)
2. Structure and formatting recommendations
3. Keywords and industry-specific terminology
4. Skills highlighting
5. Experience presentation

Format your response as a clear, organized list of tips with explanations.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach specializing in CV optimization and job application strategies. Provide practical, actionable advice.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    return response.choices[0]?.message?.content || "Unable to generate tips at this time.";
  } catch (error) {
    console.error("Error generating CV optimization tips:", error);
    throw new Error("Failed to generate CV optimization tips");
  }
}

export async function generateCoverLetter(input: CoverLetterInput): Promise<string> {
  const { jobTitle, company, jobDescription, userCV } = input;

  const prompt = `You are an expert career coach writing a professional cover letter. Create a compelling, personalized cover letter for the following job application.

Job Title: ${jobTitle}
Company: ${company}
${jobDescription ? `\nJob Description:\n${jobDescription}` : ""}
${userCV ? `\n\nApplicant's Background (from CV):\n${userCV}` : ""}

Write a professional cover letter that:
1. Opens with a strong, engaging introduction
2. Highlights relevant experience and skills matching the role
3. Shows genuine interest in the company and position
4. Demonstrates value the candidate can bring
5. Closes with a clear call to action

The tone should be professional yet personable. Keep it concise (around 250-350 words). Do not include placeholders like [Your Name] or [Date] - write the letter content only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert career coach specializing in writing compelling cover letters that get interviews. Write professional, engaging content.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "Unable to generate cover letter at this time.";
  } catch (error) {
    console.error("Error generating cover letter:", error);
    throw new Error("Failed to generate cover letter");
  }
}
