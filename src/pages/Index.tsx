
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FileUpload } from "@/components/FileUpload";
import { DataTable } from "@/components/DataTable";
import { CleaningOptions } from "@/components/CleaningOptions";
import { useToast } from "@/components/ui/use-toast";
import { downloadCleanedCSV } from "@/utils/csvUtils";

const Index = () => {
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [originalData, setOriginalData] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [activeTab, setActiveTab] = useState("upload");
  const { toast } = useToast();

  const handleFileUploaded = (data: string[][], headers: string[], name: string) => {
    setCsvData(data);
    setOriginalData(data);
    setHeaders(headers);
    setFileName(name);
    setActiveTab("preview");
    
    toast({
      title: "File uploaded successfully",
      description: `${name} with ${data.length} rows and ${headers.length} columns`,
    });
  };

  const handleDataCleaned = (cleanedData: string[][]) => {
    setCsvData(cleanedData);
    
    toast({
      title: "Data cleaned successfully",
      description: `${cleanedData.length} rows after cleaning`,
    });
  };

  const handleDownload = () => {
    if (csvData.length > 0 && headers.length > 0) {
      downloadCleanedCSV(csvData, headers, fileName.replace('.csv', '-cleaned.csv'));
      
      toast({
        title: "File downloaded",
        description: "Your cleaned CSV file is ready",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="space-y-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">CSV Data Cleaner</h1>
          <p className="text-muted-foreground">
            Upload, clean, and standardize your CSV files with ease
          </p>
        </div>
        
        <Separator />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="preview" disabled={csvData.length === 0}>Preview</TabsTrigger>
            <TabsTrigger value="clean" disabled={csvData.length === 0}>Clean</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="space-y-4">
            <FileUpload onFileUploaded={handleFileUploaded} />
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            {csvData.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{fileName}</h2>
                    <p className="text-sm text-muted-foreground">
                      {csvData.length} rows • {headers.length} columns
                    </p>
                  </div>
                  <Button variant="outline" onClick={() => setActiveTab("clean")}>
                    Proceed to Cleaning
                  </Button>
                </div>
                <DataTable data={csvData} headers={headers} />
              </>
            )}
          </TabsContent>
          
          <TabsContent value="clean" className="space-y-4">
            {csvData.length > 0 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-1 space-y-6">
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Cleaning Options</h2>
                      <CleaningOptions 
                        data={originalData} 
                        headers={headers} 
                        onDataCleaned={handleDataCleaned}
                      />
                    </div>
                    <div className="space-y-2">
                      <Button className="w-full" onClick={handleDownload}>
                        Download Cleaned CSV
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-2">Data Preview</h2>
                    <DataTable data={csvData} headers={headers} />
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
