import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, CheckCircle, AlertCircle, TrendingUp } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface ATSScoreResult {
  overallScore: number;
  breakdown: {
    keywords: number;
    formatting: number;
    structure: number;
    contactInfo: number;
  };
  recommendations: string[];
}

interface CVUpload {
  id: string;
  originalFilename: string;
  storedFilename: string;
  fileSize: number;
  atsScore: number;
  atsDetails: {
    overallScore: number;
    breakdown: ATSScoreResult['breakdown'];
    recommendations: string[];
  };
  enhancementPurchased: boolean;
  enhancementCompleted: boolean;
  uploadedAt: string;
}

export default function CVUploadPage() {
  const { toast } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ upload: CVUpload; atsScore: ATSScoreResult } | null>(null);

  const { data: uploads = [] } = useQuery<CVUpload[]>({
    queryKey: ["/api/user/cv-uploads"],
  });

  const enhancementMutation = useMutation({
    mutationFn: async (cvUploadId: string) => {
      const response = await apiRequest('POST', '/api/cv-enhancement/checkout', {
        cvUploadId,
      });
      return response.json();
    },
    onSuccess: (data: any) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Checkout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('cv', file);
      
      const response = await fetch('/api/user/cv-upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload CV');
      }

      return response.json();
    },
    onSuccess: (data) => {
      setUploadResult(data);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/user/cv-uploads"] });
      toast({
        title: "CV uploaded successfully",
        description: `Your CV has been analyzed. ATS Score: ${data.atsScore.overallScore}%`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PDF or DOCX file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 70) return "default";
    if (score >= 50) return "secondary";
    return "destructive";
  };

  return (
    <div className="container max-w-6xl py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2" data-testid="heading-cv-upload">Upload Your CV</h1>
        <p className="text-secondary">
          Get an instant ATS compatibility score and recommendations to improve your CV
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Upload CV</CardTitle>
              <CardDescription>
                Upload your CV in PDF or DOCX format (max 5MB)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  border-2 border-dashed rounded-lg p-12 text-center transition-colors
                  ${isDragging ? 'border-primary bg-primary/5' : 'border-border'}
                  ${selectedFile ? 'bg-muted/30' : ''}
                `}
                data-testid="dropzone-cv-upload"
              >
                {selectedFile ? (
                  <div className="space-y-4">
                    <FileText className="mx-auto h-12 w-12 text-primary" />
                    <div>
                      <p className="font-medium" data-testid="text-selected-filename">{selectedFile.name}</p>
                      <p className="text-sm text-secondary">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                      data-testid="button-clear-file"
                    >
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div>
                      <p className="font-medium mb-1">Drag and drop your CV here</p>
                      <p className="text-sm text-secondary">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="cv-upload-input"
                      data-testid="input-cv-file"
                    />
                    <label htmlFor="cv-upload-input">
                      <Button variant="secondary" asChild data-testid="button-browse-file">
                        <span>Browse Files</span>
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              {/* Upload Button */}
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || uploadMutation.isPending}
                className="w-full"
                data-testid="button-upload-cv"
              >
                {uploadMutation.isPending ? "Analyzing..." : "Upload & Analyze"}
              </Button>

              {/* File Requirements */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  <ul className="list-disc list-inside space-y-1 mt-1">
                    <li>Accepted formats: PDF, DOC, DOCX</li>
                    <li>Maximum file size: 5MB</li>
                    <li>Analysis typically takes 2-3 seconds</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* ATS Score Results */}
        <div>
          {uploadResult && (
            <Card data-testid="card-ats-results">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>ATS Score</CardTitle>
                  <Badge variant={getScoreBadgeVariant(uploadResult.atsScore.overallScore)} className="text-lg px-4 py-1" data-testid="badge-overall-score">
                    {uploadResult.atsScore.overallScore}%
                  </Badge>
                </div>
                <CardDescription>
                  Your CV's compatibility with Applicant Tracking Systems
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score Breakdown */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Score Breakdown
                  </h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Keywords (50%)</span>
                        <span className={getScoreColor(uploadResult.atsScore.breakdown.keywords)} data-testid="score-keywords">
                          {uploadResult.atsScore.breakdown.keywords}%
                        </span>
                      </div>
                      <Progress value={uploadResult.atsScore.breakdown.keywords} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Formatting (25%)</span>
                        <span className={getScoreColor(uploadResult.atsScore.breakdown.formatting)} data-testid="score-formatting">
                          {uploadResult.atsScore.breakdown.formatting}%
                        </span>
                      </div>
                      <Progress value={uploadResult.atsScore.breakdown.formatting} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Structure (15%)</span>
                        <span className={getScoreColor(uploadResult.atsScore.breakdown.structure)} data-testid="score-structure">
                          {uploadResult.atsScore.breakdown.structure}%
                        </span>
                      </div>
                      <Progress value={uploadResult.atsScore.breakdown.structure} className="h-2" />
                    </div>

                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Contact Info (10%)</span>
                        <span className={getScoreColor(uploadResult.atsScore.breakdown.contactInfo)} data-testid="score-contact">
                          {uploadResult.atsScore.breakdown.contactInfo}%
                        </span>
                      </div>
                      <Progress value={uploadResult.atsScore.breakdown.contactInfo} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {uploadResult.atsScore.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2" data-testid="list-recommendations">
                      {uploadResult.atsScore.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <div className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Enhancement CTA */}
                <Alert className="bg-gradient-to-r from-primary/5 to-chart-2/5 border-primary/20">
                  <AlertDescription>
                    <p className="font-semibold mb-2">Want a professional CV review?</p>
                    <p className="text-sm text-secondary mb-4">
                      Our experts will enhance your CV to maximize ATS compatibility and improve your chances of getting interviews.
                    </p>
                    <Button 
                      variant="default" 
                      className="w-full" 
                      onClick={() => enhancementMutation.mutate(uploadResult.upload.id)}
                      disabled={enhancementMutation.isPending}
                      data-testid="button-enhance-cv"
                    >
                      {enhancementMutation.isPending ? "Redirecting to checkout..." : "Enhance CV for £39"}
                    </Button>
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {!uploadResult && uploads.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Uploads</CardTitle>
                <CardDescription>Your recent CV uploads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {uploads.slice(0, 3).map((upload) => (
                    <div key={upload.id} className="flex items-center justify-between p-3 rounded-lg border" data-testid={`upload-item-${upload.id}`}>
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{upload.originalFilename}</p>
                          <p className="text-xs text-secondary">
                            {new Date(upload.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getScoreBadgeVariant(upload.atsScore)}>
                        {upload.atsScore}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
