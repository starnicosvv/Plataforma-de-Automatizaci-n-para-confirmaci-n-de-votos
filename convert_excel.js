const XLSX = require('xlsx');

const wb = XLSX.readFile('Reporte_Referentes_Merged-10.xlsx');
const ws = wb.Sheets[wb.SheetNames[0]];
const rawData = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

// Headers from the file
const headers = rawData[0];
console.log('Headers:', headers);

const rows = rawData.slice(1);
console.log('Total rows:', rows.length);

const converted = [];
let skipped = 0;

rows.forEach((row, idx) => {
    // Column mapping based on observed structure:
    // 0: Referente
    // 1: Teléfono referente
    // 2: Zona/Ubicación referente
    // 3: Nombre votante
    // 4: Cédula votante
    // 5: Teléfono votante
    // 6: Orden
    // 7: Mesa
    // 8: Estado (POSITIVO/INDECISO)
    // 9: Colegio (zona_votacion)
    
    const referente = String(row[0] || '').trim();
    const nombre = String(row[3] || '').trim();
    const cedula = String(row[4] || '').trim().replace(/\D/g, '');
    const orden = row[6] ? parseInt(String(row[6]).trim()) : null;
    const mesa = row[7] ? parseInt(String(row[7]).trim()) : null;
    const zona_votacion = String(row[9] || '').trim();
    
    // Only keep rows with valid cedula and nombre
    if (cedula && nombre && cedula.length >= 6) {
        converted.push({
            cedula,
            nombre,
            orden,
            mesa,
            referente: referente || null,
            zona_votacion: zona_votacion || null
        });
    } else {
        skipped++;
    }
});

console.log('Converted:', converted.length);
console.log('Skipped (no cedula/nombre):', skipped);

// Save as new Excel
const newWs = XLSX.utils.json_to_sheet(converted);
const newWb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(newWb, newWs, 'padron');
XLSX.writeFile(newWb, 'padron_importar.xlsx');

console.log('Saved to padron_importar.xlsx');

// Show sample
console.log('\nFirst 5 records:');
console.log(converted.slice(0, 5));