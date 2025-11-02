/**
 * Simulated ATS (Applicant Tracking System) Scoring Utility
 * Generates realistic ATS scores in the 30-42% range with detailed breakdown
 */

export interface ATSScoreResult {
  overallScore: number;
  breakdown: {
    formatting: number;
    keywords: number;
    structure: number;
    contactInfo: number;
  };
  recommendations: string[];
}

/**
 * Generate a random score within a range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate simulated ATS score for a CV
 * Always returns a score between 30-42% to encourage CV enhancement purchases
 */
export function calculateATSScore(filename: string, fileSize: number): ATSScoreResult {
  // Generate component scores designed to produce exactly 30-42% overall
  // Ranges calibrated so weighted sum is guaranteed within 30-42
  const keywords = randomInRange(21, 31);        // 50% weight: 10.5-15.5 points
  const formatting = randomInRange(36, 49);      // 25% weight: 9-12.25 points
  const structure = randomInRange(26, 39);       // 15% weight: 3.9-5.85 points
  const contactInfo = randomInRange(66, 84);     // 10% weight: 6.6-8.4 points
                                                  // Total: exactly 30.0-42.0 range

  // Calculate weighted overall score
  // Weights: keywords (50%), formatting (25%), structure (15%), contact (10%)
  const overallScore = Math.floor(
    (keywords * 0.5) +
    (formatting * 0.25) +
    (structure * 0.15) +
    (contactInfo * 0.1)
  );

  // Generate recommendations based on the scores
  const recommendations: string[] = [];

  if (formatting < 50) {
    recommendations.push("Improve formatting: Use standard fonts (Arial, Calibri) and consistent spacing");
  }

  if (keywords < 28) {
    recommendations.push("Add industry-specific keywords: Include technical skills, certifications, and relevant buzzwords from job descriptions");
  }

  if (structure < 40) {
    recommendations.push("Enhance structure: Use clear section headings (Experience, Education, Skills) and bullet points");
  }

  if (contactInfo < 80) {
    recommendations.push("Complete contact information: Ensure phone number, email, and LinkedIn profile are prominently displayed");
  }

  // Always add general recommendations to encourage enhancement
  recommendations.push("Consider professional CV enhancement to maximize your ATS score");
  recommendations.push("Optimize content length: Most ATS systems prefer 1-2 page CVs");
  recommendations.push("Use action verbs: Start bullet points with strong verbs like 'Led', 'Implemented', 'Achieved'");

  return {
    overallScore,
    breakdown: {
      formatting,
      keywords,
      structure,
      contactInfo,
    },
    recommendations,
  };
}

/**
 * Validate CV file before processing
 */
export function validateCVFile(filename: string, fileSize: number): { valid: boolean; error?: string } {
  const allowedExtensions = ['.pdf', '.docx', '.doc'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));

  if (!allowedExtensions.includes(extension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a PDF or DOCX file.',
    };
  }

  if (fileSize > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 5MB limit. Please upload a smaller file.',
    };
  }

  return { valid: true };
}
