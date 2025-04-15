
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

interface DataTableProps {
  data: string[][];
  headers: string[];
}

export function DataTable({ data, headers }: DataTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const MAX_ROWS = 100;

  // Simple filter function for the data
  const filteredData = data.filter((row) => 
    row.some((cell) => 
      cell.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  // Show a preview of the data (limited to MAX_ROWS)
  const displayData = filteredData.slice(0, MAX_ROWS);
  const hasMoreRows = filteredData.length > MAX_ROWS;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search data..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <div className="text-sm text-muted-foreground">
          Showing {displayData.length} of {filteredData.length} rows
        </div>
      </div>

      <div className="border rounded-md">
        <ScrollArea className="h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-medium sticky top-0 bg-background">
                  Row
                </TableCell>
                {headers.map((header, index) => (
                  <TableCell 
                    key={index} 
                    className="font-medium sticky top-0 bg-background"
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium text-muted-foreground">
                    {rowIndex + 1}
                  </TableCell>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {hasMoreRows && (
            <div className="py-4 text-center text-sm text-muted-foreground border-t">
              {filteredData.length - MAX_ROWS} more rows not shown
            </div>
          )}
          
          {displayData.length === 0 && (
            <div className="flex items-center justify-center h-24 text-muted-foreground">
              No data to display
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
