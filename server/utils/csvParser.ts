import type { InsertApplication } from "@shared/schema";

export interface CSVRow {
  jobId?: string;
  jobTitle: string;
  company: string;
  jobLink: string;
  appliedDate: string;
  status: string;
}

export interface ParsedCSV {
  data: CSVRow[];
  errors: string[];
}

const REQUIRED_HEADERS = ["Job Title", "Company", "Job Link", "Application Date", "Status"];
const VALID_STATUSES = ["applied", "in_review", "interviewing", "rejected", "offer"];

export function parseCSV(csvContent: string): ParsedCSV {
  const errors: string[] = [];
  const data: CSVRow[] = [];

  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) {
    errors.push("CSV file must contain at least a header row and one data row");
    return { data, errors };
  }

  const headerLine = lines[0].trim();
  const headers = parseCSVLine(headerLine);

  const missingHeaders = REQUIRED_HEADERS.filter(
    (required) => !headers.some((h) => h.toLowerCase() === required.toLowerCase())
  );

  if (missingHeaders.length > 0) {
    errors.push(`Missing required headers: ${missingHeaders.join(", ")}`);
    return { data, errors };
  }

  const headerIndexes = {
    jobId: headers.findIndex((h) => h.toLowerCase() === "job id"),
    jobTitle: headers.findIndex((h) => h.toLowerCase() === "job title"),
    company: headers.findIndex((h) => h.toLowerCase() === "company"),
    jobLink: headers.findIndex((h) => h.toLowerCase() === "job link"),
    appliedDate: headers.findIndex((h) => h.toLowerCase() === "application date"),
    status: headers.findIndex((h) => h.toLowerCase() === "status"),
  };

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    const rowNum = i + 1;

    const jobTitle = values[headerIndexes.jobTitle]?.trim();
    const company = values[headerIndexes.company]?.trim();
    const jobLink = values[headerIndexes.jobLink]?.trim();
    const appliedDate = values[headerIndexes.appliedDate]?.trim();
    const status = values[headerIndexes.status]?.trim().toLowerCase();

    if (!jobTitle) {
      errors.push(`Row ${rowNum}: Missing Job Title`);
      continue;
    }

    if (!company) {
      errors.push(`Row ${rowNum}: Missing Company`);
      continue;
    }

    if (!jobLink) {
      errors.push(`Row ${rowNum}: Missing Job Link`);
      continue;
    }

    try {
      new URL(jobLink);
    } catch {
      errors.push(`Row ${rowNum}: Invalid Job Link URL "${jobLink}"`);
      continue;
    }

    if (!appliedDate) {
      errors.push(`Row ${rowNum}: Missing Application Date`);
      continue;
    }

    if (!status || !VALID_STATUSES.includes(status)) {
      errors.push(
        `Row ${rowNum}: Invalid status "${status}". Must be one of: ${VALID_STATUSES.join(", ")}`
      );
      continue;
    }

    const parsedDate = new Date(appliedDate);
    if (isNaN(parsedDate.getTime())) {
      errors.push(`Row ${rowNum}: Invalid date format "${appliedDate}"`);
      continue;
    }

    data.push({
      jobId: headerIndexes.jobId >= 0 ? values[headerIndexes.jobId]?.trim() : undefined,
      jobTitle,
      company,
      jobLink,
      appliedDate,
      status,
    });
  }

  return { data, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

export function convertCSVToApplications(
  csvData: CSVRow[],
  userId: string,
  userPlanId: string,
  batchNumber: number
): InsertApplication[] {
  return csvData.map((row) => ({
    userId,
    userPlanId,
    jobId: row.jobId,
    jobTitle: row.jobTitle,
    company: row.company,
    jobLink: row.jobLink,
    status: row.status as "applied" | "in_review" | "interviewing" | "rejected" | "offer",
    batchNumber,
    appliedDate: new Date(row.appliedDate),
  }));
}
