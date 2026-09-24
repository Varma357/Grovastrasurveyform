export function generateCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  const keys = Object.keys(data[0]);
  const headerRow = keys.join(',');

  const rows = data.map((item) =>
    keys
      .map((k) => {
        let val = item[k];
        if (val === null || val === undefined) return '""';
        if (typeof val === 'object') val = JSON.stringify(val);
        
        let strVal = String(val);

        // Sanitize raw base64 image data URLs so they don't corrupt CSV files
        if (strVal.startsWith('data:image/') || strVal.length > 500 && strVal.includes('base64')) {
          strVal = 'Photo Attached';
        }

        strVal = strVal.replace(/"/g, '""');
        return `"${strVal}"`;
      })
      .join(',')
  );

  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
