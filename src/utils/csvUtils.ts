
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
 */
export function removeDuplicates(data: string[][]): { data: string[][], count: number } {
  const seen = new Set<string>();
  const uniqueData = data.filter(row => {
    const rowStr = JSON.stringify(row);
    if (seen.has(rowStr)) {
      return false;
    }
    seen.add(rowStr);
    return true;
  });
  
  return {
    data: uniqueData,
    count: data.length - uniqueData.length
  };
}

/**
 * Trim whitespace from all cells in the data
 */
export function trimWhitespace(data: string[][]): { data: string[][], count: number } {
  let cellsFixed = 0;
  
  const trimmedData = data.map(row => {
    return row.map(cell => {
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
 * Remove empty rows from the data (rows where all cells are empty)
 */
export function removeEmptyRows(data: string[][]): { data: string[][], count: number } {
  const filteredData = data.filter(row => {
    return row.some(cell => cell.trim() !== '');
  });
  
  return {
    data: filteredData,
    count: data.length - filteredData.length
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
