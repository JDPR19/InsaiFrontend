import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import sisic from '../../public/assets/logo-sisic5.png';

export function exportToPDF({ data, columns, fileName = 'reporte.pdf', title = '', preview = false }) {
    const doc = new jsPDF();

    doc.addImage(sisic, 'PNG', 15, 8, 20, 20); // (x, y, width, height)

    doc.setTextColor(0, 0, 0); 
    doc.setFont('helvetica', 'bold'); 
    doc.setFontSize(18);
    // Título
    if (title) doc.text(title.toUpperCase(), 70, 20);

    const tableColumn = columns.map(col => col.header);
    const tableRows = data.map(row => columns.map(col => row[col.key]));

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 30,
        styles: { font: 'poppins', fontSize: 10 },
        headStyles: { fillColor: [152, 199, 154], textColor: 255 }, 
        alternateRowStyles: { fillColor: [232, 245, 233] }, 
        tableLineColor: [83, 158, 67],
        tableLineWidth: 0
    });

    if (preview) {
        // const pdfBlob = doc.output('bloburl');
        // window.open(pdfBlob, '_blank');
        return doc.output('blob');
    } else {
        doc.save(fileName);
    }
};


export function exportToExcel({ data, columns, fileName = 'reporte.xlsx', totalKey = null, totalLabel = 'TOTAL', count = false }) {
    const worksheetData = [
        columns.map(col => col.header.toUpperCase()),
        ...data.map(row => columns.map(col => row[col.key]))
    ];

    // Si se pide contar registros
    if (count) {
        const totalRow = Array(columns.length).fill('');
        totalRow[0] = totalLabel || 'TOTAL REGISTROS';
        totalRow[1] = data.length;
        worksheetData.push(totalRow);
    }

    if (totalKey) {
        const totalIndex = columns.findIndex(col => col.key === totalKey);
        const totalValue = data.reduce((sum, row) => sum + (parseFloat(row[totalKey]) || 0), 0);
        const totalRow = Array(columns.length).fill('');
        totalRow[totalIndex > 0 ? totalIndex - 1 : 0] = totalLabel;
        totalRow[totalIndex] = totalValue;
        worksheetData.push(totalRow);
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    worksheet['!cols'] = columns.map(() => ({ wch: 20 }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), fileName);
};