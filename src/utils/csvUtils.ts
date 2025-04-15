
/**
 * CSV Utility functions for parsing, cleaning, and downloading CSV data.
 */

/**
 * Parse a CSV string into a 2D array of strings and extract headers
 */
export function parseCSV(csvContent: string): { data: string[][], headers: string[] } {
  // Split the CSV content by newlines
  const lines = csvContent.split(/\r?\n/).filter(line => line.trim() !== '');
  
  if (lines.length === 0) {
    return { data: [], headers: [] };
  }
  
  // Extract headers from the first line
  const headers = lines[0].split(',').map(header => header.trim());
  
  // Parse the data rows
  const data = lines.slice(1).map(line => {
    return line.split(',').map(cell => cell.trim());
  });
  
  return { data, headers };
}

/**
 * Remove duplicate rows from the data
 * Improved to properly detect and remove exact duplicates
 */
export function removeDuplicates(data: string[][]): { data: string[][], count: number } {
  // Create a more robust signature for each row by normalizing whitespace and case
  const seen = new Set<string>();
  const uniqueData: string[][] = [];
  let duplicatesCount = 0;
  
  for (const row of data) {
    // Create a normalized signature for comparison (trim and lowercase each cell)
    const normalizedRow = row.map(cell => cell.trim().toLowerCase());
    const rowSignature = JSON.stringify(normalizedRow);
    
    if (!seen.has(rowSignature)) {
      seen.add(rowSignature);
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
 * Improved to better detect truly empty rows
 */
export function removeEmptyRows(data: string[][]): { data: string[][], count: number } {
  const originalLength = data.length;
  
  // A row is considered empty if all cells are empty strings or only whitespace
  const filteredData = data.filter(row => {
    // Check if at least one cell in the row has content after trimming
    return row.some(cell => {
      const trimmed = (cell || '').trim();
      return trimmed !== '';
    });
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
  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map(row => row.join(','))
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
