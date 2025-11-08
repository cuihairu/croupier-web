export async function exportToXLSX(fileName: string, sheets: { sheet: string; rows: any[][] }[]) {
  try {
    // Try dynamic import of xlsx; if missing, fall back to CSV first sheet
    // @ts-ignore
    const XLSX = (await import('xlsx')).default || (await import('xlsx'));
    const wb = XLSX.utils.book_new();
    for (const s of sheets) {
      const ws = XLSX.utils.aoa_to_sheet(s.rows);
      XLSX.utils.book_append_sheet(wb, ws, s.sheet || 'Sheet1');
    }
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName || 'export.xlsx'; a.click(); URL.revokeObjectURL(url);
  } catch (e) {
    // Fallback to CSV export using the first sheet
    try {
      const first = sheets[0];
      const csv = first.rows.map(r => r.map(x => {
        const s = String(x ?? '');
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
      }).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = (fileName||'export') + '.csv'; a.click(); URL.revokeObjectURL(url);
    } catch {}
  }
}

export function exportToCSV(fileName: string, rows: any[][]) {
  try {
    const csv = rows.map(r => r.map(x => {
      const s = String(x ?? '');
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = fileName || 'export.csv'; a.click(); URL.revokeObjectURL(url);
  } catch {}
}

