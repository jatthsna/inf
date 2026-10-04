import { formatCurrency, formatDateID } from './formatters';

export function exportToCSV(filename: string, headers: string[], rows: (string | number)[][]) {
  const processRow = (row: (string | number)[]) => {
    return row
      .map(val => {
        let text = val === null || val === undefined ? '' : String(val);
        // Escape quotes
        if (text.includes(',') || text.includes('"') || text.includes('\n')) {
          text = `"${text.replace(/"/g, '""')}"`;
        }
        return text;
      })
      .join(',');
  };

  const csvContent = [headers.join(','), ...rows.map(processRow)].join('\r\n');
  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printFinancialReport(title: string) {
  const previousTitle = document.title;
  document.title = `${title} - ${formatDateID(new Date().toISOString())}`;
  window.print();
  document.title = previousTitle;
}
