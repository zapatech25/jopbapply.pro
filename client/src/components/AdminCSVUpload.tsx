import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload, AlertCircle, CheckCircle2, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export default function AdminCSVUpload() {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const { data: users = [] } = useQuery<Omit<User, "password">[]>({
    queryKey: ["/api/admin/users"],
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ userId, file }: { userId: string; file: File }) => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("csvFile", file);

      const res = await fetch("/api/admin/applications/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Upload failed");
      }

      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful!",
        description: `${data.applicationsCreated} applications added to Batch ${data.batchNumber}`,
      });
      setSelectedFile(null);
      setSelectedUserId("");
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV file",
          variant: "destructive",
        });
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = () => {
    if (!selectedUserId || !selectedFile) {
      toast({
        title: "Missing information",
        description: "Please select a user and CSV file",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate({ userId: selectedUserId, file: selectedFile });
  };

  const downloadSample = () => {
    const sampleCSV = `Job ID,Job Title,Company,Application Date,Status
JOB-001,Senior Software Engineer,Tech Corp,2025-01-15,applied
JOB-002,Product Manager,Innovation Inc,2025-01-16,in_review
JOB-003,Data Scientist,Analytics Ltd,2025-01-17,interviewing`;

    const blob = new Blob([sampleCSV], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample_applications.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Applications via CSV</CardTitle>
        <CardDescription>
          Upload job application data for a specific user. Each application deducts 1 credit.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            CSV must include: Job Title, Company, Application Date, Status
            <br />
            Valid statuses: applied, in_review, interviewing, rejected, offer
            <br />
            <button
              onClick={downloadSample}
              className="text-primary hover:underline text-sm mt-1 inline-block"
              data-testid="button-download-sample"
            >
              Download sample CSV
            </button>
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select User</label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger data-testid="select-user">
                <SelectValue placeholder="Choose a user" />
              </SelectTrigger>
              <SelectContent>
                {users
                  .filter((u) => u.role === "user")
                  .map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">CSV File</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                  data-testid="input-csv-file"
                />
                <label htmlFor="csv-upload">
                  <div className="border-2 border-dashed rounded-md p-4 hover-elevate cursor-pointer transition-colors">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Upload className="h-4 w-4" />
                      {selectedFile ? (
                        <span className="font-medium text-foreground">{selectedFile.name}</span>
                      ) : (
                        <span>Click to select CSV file</span>
                      )}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            disabled={!selectedUserId || !selectedFile || uploadMutation.isPending}
            className="w-full"
            data-testid="button-upload-csv"
          >
            {uploadMutation.isPending ? (
              "Uploading..."
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload Applications
              </>
            )}
          </Button>

          {uploadMutation.isSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>Applications uploaded successfully!</AlertDescription>
            </Alert>
          )}

          {uploadMutation.isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadMutation.error.message}</AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
