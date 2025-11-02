export function downloadCSV(data: any[], filename: string) {
  if (data.length === 0) {
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportApplicationsToCSV(applications: any[]) {
  const exportData = applications.map(app => ({
    'Job ID': app.jobId || '',
    'Job Title': app.jobTitle,
    'Company': app.company,
    'Status': app.status,
    'Batch Number': app.batchNumber,
    'Applied Date': new Date(app.appliedDate).toLocaleDateString(),
    'Submission Mode': app.submissionMode,
    'Source': app.source,
  }));

  downloadCSV(exportData, `applications-${new Date().toISOString().split('T')[0]}.csv`);
}

export function exportAnalyticsToCSV(analytics: any) {
  const exportData = [
    {
      'Metric': 'Total Applications',
      'Value': analytics.totalApplications,
    },
    {
      'Metric': 'Success Rate',
      'Value': `${analytics.successRate.toFixed(1)}%`,
    },
    {
      'Metric': 'Credits Remaining',
      'Value': analytics.creditsRemaining,
    },
    {
      'Metric': 'Credits Used',
      'Value': analytics.creditsUsed,
    },
    ...analytics.statusBreakdown.map((item: any) => ({
      'Metric': `Status: ${item.status}`,
      'Value': item.count,
    })),
  ];

  downloadCSV(exportData, `analytics-${new Date().toISOString().split('T')[0]}.csv`);
}
