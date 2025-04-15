
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckIcon, BarChart2Icon, FilterIcon, AlignLeftIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  removeDuplicates,
  trimWhitespace,
  standardizeCase,
  removeEmptyRows,
} from "@/utils/csvUtils";
import { Separator } from "@/components/ui/separator";

interface CleaningOptionsProps {
  data: string[][];
  headers: string[];
  onDataCleaned: (cleanedData: string[][]) => void;
}

export function CleaningOptions({ data, headers, onDataCleaned }: CleaningOptionsProps) {
  const [options, setOptions] = useState({
    removeDuplicates: true,
    trimWhitespace: true,
    standardizeCase: false,
    removeEmptyRows: true,
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState<{
    duplicatesRemoved: number;
    whitespaceFixed: number;
    emptyRowsRemoved: number;
  } | null>(null);
  
  const { toast } = useToast();

  const toggleOption = (option: keyof typeof options) => {
    setOptions({ ...options, [option]: !options[option] });
  };

  const cleanData = () => {
    if (!data || data.length === 0) return;
    
    setIsProcessing(true);
    let cleanedData = [...data];
    let statsCopy = {
      duplicatesRemoved: 0,
      whitespaceFixed: 0,
      emptyRowsRemoved: 0,
    };

    setTimeout(() => {
      try {
        // Process the data based on selected options
        if (options.removeEmptyRows) {
          const { data: noEmptyRows, count } = removeEmptyRows(cleanedData);
          cleanedData = noEmptyRows;
          statsCopy.emptyRowsRemoved = count;
        }

        if (options.removeDuplicates) {
          const { data: noDuplicates, count } = removeDuplicates(cleanedData);
          cleanedData = noDuplicates;
          statsCopy.duplicatesRemoved = count;
        }

        if (options.trimWhitespace) {
          const { data: trimmed, count } = trimWhitespace(cleanedData);
          cleanedData = trimmed;
          statsCopy.whitespaceFixed = count;
        }

        if (options.standardizeCase) {
          cleanedData = standardizeCase(cleanedData, headers);
        }

        setStats(statsCopy);
        onDataCleaned(cleanedData);

        toast({
          title: "Data cleaning complete",
          description: `${statsCopy.duplicatesRemoved} duplicates and ${statsCopy.emptyRowsRemoved} empty rows removed`,
        });
      } catch (error) {
        toast({
          title: "Error cleaning data",
          description: String(error) || "An error occurred while cleaning the data",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    }, 500); // Small delay for visual feedback
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-4 w-4 text-primary" />
              <Label htmlFor="remove-duplicates">Remove duplicate rows</Label>
            </div>
            <Switch
              id="remove-duplicates"
              checked={options.removeDuplicates}
              onCheckedChange={() => toggleOption("removeDuplicates")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlignLeftIcon className="h-4 w-4 text-primary" />
              <Label htmlFor="trim-whitespace">Trim whitespace</Label>
            </div>
            <Switch
              id="trim-whitespace"
              checked={options.trimWhitespace}
              onCheckedChange={() => toggleOption("trimWhitespace")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckIcon className="h-4 w-4 text-primary" />
              <Label htmlFor="standardize-case">Standardize text case</Label>
            </div>
            <Switch
              id="standardize-case"
              checked={options.standardizeCase}
              onCheckedChange={() => toggleOption("standardizeCase")}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart2Icon className="h-4 w-4 text-primary" />
              <Label htmlFor="remove-empty">Remove empty rows</Label>
            </div>
            <Switch
              id="remove-empty"
              checked={options.removeEmptyRows}
              onCheckedChange={() => toggleOption("removeEmptyRows")}
            />
          </div>
        </div>

        <Button
          className="w-full"
          onClick={cleanData}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="animate-spin mr-2">⟳</span> Processing...
            </>
          ) : (
            "Apply Cleaning"
          )}
        </Button>

        {stats && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Cleaning Results</h4>
              <ul className="text-sm space-y-1">
                <li className="flex justify-between">
                  <span>Duplicates removed:</span>
                  <span className="font-mono">{stats.duplicatesRemoved}</span>
                </li>
                <li className="flex justify-between">
                  <span>Whitespace fixed:</span>
                  <span className="font-mono">{stats.whitespaceFixed}</span>
                </li>
                <li className="flex justify-between">
                  <span>Empty rows removed:</span>
                  <span className="font-mono">{stats.emptyRowsRemoved}</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
