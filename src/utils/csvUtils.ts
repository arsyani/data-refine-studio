
/**
 * CSV Utility functions for parsing, cleaning, and downloading CSV data.
 */

/**
 * Parse a CSV string into a 2D array of strings and extract headers
 * Improved to detect and handle different delimiters (comma or semicolon)
 */
export function parseCSV(csvContent: string): { data: string[][], headers: string[] } {
  // Detect delimiter (comma or semicolon)
  const firstLine = csvContent.split(/\r?\n/)[0] || '';
  const delimiter = firstLine.includes(';') ? ';' : ',';
  
  // Split the CSV content by newlines
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return { data: [], headers: [] };
  }
  
  // Extract headers from the first line
  const headers = lines[0].split(delimiter).map(header => header.trim());
  
  // Parse the data rows
  const data = lines.slice(1).map(line => {
    return line.split(delimiter).map(cell => cell.trim());
  });
  
  return { data, headers };
}

/**
 * Remove duplicate rows from the data
 * Fixed to correctly identify duplicates by column values, not by exact match
 */
export function removeDuplicates(data: string[][]): { data: string[][], count: number } {
  // For each row, create a signature based on the normalized content of each column
  const signatures = new Map<string, number>();
  const uniqueData: string[][] = [];
  let duplicatesCount = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Create a normalized key for comparison that ignores case and whitespace
    // We maintain the original row for the output but use normalized values for comparison
    const normalizedKey = row.map(cell => (cell || '').trim().toLowerCase()).join('|');
    
    // If this signature hasn't been seen before, add it to uniqueData
    if (!signatures.has(normalizedKey)) {
      signatures.set(normalizedKey, i);
      uniqueData.push(row);
    } else {
      duplicatesCount++;
    }
  }
  
  return {
    data: uniqueData,
    count: duplicatesCount
  };
}

/**
 * Trim whitespace from all cells in the data
 */
export function trimWhitespace(data: string[][]): { data: string[][], count: number } {
  let cellsFixed = 0;
  
  const trimmedData = data.map(row => {
    return row.map(cell => {
      if (!cell) return cell; // Skip null or undefined
      const trimmed = cell.trim();
      if (trimmed !== cell) {
        cellsFixed++;
      }
      return trimmed;
    });
  });
  
  return {
    data: trimmedData,
    count: cellsFixed
  };
}

/**
 * Standardize text case in the data (convert to lowercase for consistency)
 */
export function standardizeCase(data: string[][], headers: string[]): string[][] {
  return data.map(row => {
    return row.map((cell, index) => {
      // Only standardize text fields (not numbers, dates, etc.)
      if (isNaN(Number(cell)) && cell !== '') {
        return cell.toLowerCase();
      }
      return cell;
    });
  });
}

/**
 * Remove empty rows from the data (rows where all cells are empty or just whitespace)
 * Fixed to properly detect rows with empty name cells
 */
export function removeEmptyRows(data: string[][]): { data: string[][], count: number } {
  const originalLength = data.length;
  
  // A row is considered empty if the name column is empty (assuming name is first column)
  const filteredData = data.filter(row => {
    const nameColumn = row[0] || '';
    return nameColumn.trim() !== '';
  });
  
  return {
    data: filteredData,
    count: originalLength - filteredData.length
  };
}

/**
 * Download the cleaned CSV data as a file
 */
export function downloadCleanedCSV(data: string[][], headers: string[], fileName: string): void {
  // Detect the original delimiter from the fileName or default to comma
  const delimiter = fileName.includes('semicolon') ? ';' : ',';
  
  // Create CSV content
  const csvContent = [
    headers.join(delimiter),
    ...data.map(row => row.join(delimiter))
  ].join('\n');
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a download link
  const link = document.createElement('a');
  
  // Set the download link attributes
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', fileName);
  
  // Append the link to the document
  document.body.appendChild(link);
  
  // Trigger the download
  link.click();
  
  // Clean up
  document.body.removeChild(link);
}
