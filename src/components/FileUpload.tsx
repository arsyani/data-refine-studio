
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileIcon, UploadCloudIcon, XIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { parseCSV } from "@/utils/csvUtils";

interface FileUploadProps {
  onFileUploaded: (data: string[][], headers: string[], fileName: string) => void;
}

export function FileUpload({ onFileUploaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast({
        title: "Invalid file format",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }

    setFile(file);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        try {
          const { data, headers } = parseCSV(content);
          onFileUploaded(data, headers, file.name);
        } catch (error) {
          toast({
            title: "Error parsing CSV",
            description: String(error) || "Failed to parse the uploaded file",
            variant: "destructive",
          });
        } finally {
          setIsProcessing(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      toast({
        title: "Error reading file",
        description: String(error) || "Failed to read the uploaded file",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const removeFile = () => {
    setFile(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Drag and drop your CSV file or click to browse
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          } transition-colors duration-200 cursor-pointer`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !file && !isProcessing && document.getElementById("file-upload")?.click()}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".csv"
            onChange={handleFileChange}
            disabled={isProcessing}
          />

          {!file && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="bg-primary/10 p-4 rounded-full text-primary">
                <UploadCloudIcon size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">
                  {isDragging ? "Drop to upload" : "Upload CSV file"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Drag and drop your CSV file here or click to browse
                </p>
              </div>
              <Button variant="outline" disabled={isProcessing}>
                Browse Files
              </Button>
            </div>
          )}

          {file && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-md">
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <FileIcon />
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(file.size / 1024)} KB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
              >
                <XIcon className="h-4 w-4" />
              </Button>
            </div>
          )}

          {isProcessing && (
            <div className="mt-4 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span className="ml-2 text-sm text-muted-foreground">Processing...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
