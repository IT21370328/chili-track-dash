import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// 🚨 IMPORTANT: Replace this placeholder with the actual Base64 string of your full template image (MDC Invoice.jpg)
const TEMPLATE_BASE64 = "data:image/jpeg;base64,..."; 

interface PrimaTransaction {
  id: number;
  invoiceNo: string;
  poNumber: string;
  date: string;
  kilosDelivered: number;
  amount: number;
  paymentStatus: "Pending" | "Approved" | "Paid" | "Rejected";
}

export const generateInvoice = (transaction: PrimaTransaction, onGenerate?: () => void) => {
  const doc = new jsPDF('portrait', 'mm', 'a4'); 
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- 1. Set Image as Background ---
  // This covers the entire page (210mm x 297mm for A4)
  // Ensure your image aspect ratio matches A4 to avoid stretching.
  doc.addImage(TEMPLATE_BASE64, 'JPEG', 0, 0, pageWidth, pageHeight);

  // Set default text style for overlaying data
  doc.setTextColor(0, 0, 0); // Black text for data
  doc.setFont('helvetica', 'normal');
  
  // 🚨 WARNING: All coordinates below are **highly specific** to your image
  // and will require tedious trial-and-error adjustment!

  // --- 2. Overwrite Data on Background ---

  // Invoice Details (Top Right Area)
  doc.setFontSize(9);
  const detailColX = pageWidth - 10; // Right margin for alignment
  
  // Date (Approximate Y=59, adjusted for text baseline)
  doc.text(`${new Date(transaction.date).toLocaleDateString('en-GB')}`, detailColX, 60.5, { align: 'right' }); 
  
  // Invoice No (Approximate Y=67)
  doc.text(`${transaction.invoiceNo}`, detailColX, 68.5, { align: 'right' });
  
  // Due Date (Approximate Y=75)
  doc.text('N/A', detailColX, 76.5, { align: 'right' }); 
  
  // PO No (Approximate Y=83)
  doc.text(`${transaction.poNumber}`, detailColX, 84.5, { align: 'right' });

  // --- ITEMS TABLE ---
  // Since the background has the table lines, we use a custom autoTable
  // theme to ensure only the text is written, with no headers, borders, or fills.
  
  // Calculate Unit Price and Total
  const unitPrice = (transaction.amount / transaction.kilosDelivered).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const totalAmount = transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const quantityText = `${transaction.kilosDelivered.toLocaleString()}kg (${transaction.kilosDelivered.toLocaleString()}kgx1)`;

  autoTable(doc, {
    startY: 120, // Starting Y must be aligned to the first row of the image table
    head: [['', '', '', '', '']], // No visible headers
    body: [
      [
        '01', 
        'Scotch Bonnet (Nai Miris) Powder', 
        quantityText,
        `${unitPrice}LKR/kg`,
        `${totalAmount}LKR`
      ]
    ],
    theme: 'plain', // Use plain theme
    styles: {
      fontSize: 9,
      cellPadding: 2.5, // Reduced padding to fit the template cells
      textColor: [0, 0, 0], 
      lineColor: [255, 255, 255], // White borders essentially hides them
      lineWidth: 0, // No border lines
      fillColor: [255, 255, 255], // No background fill
    },
    headStyles: { 
      lineWidth: 0,
      fillColor: [255, 255, 255], // Must be white to cover the blue from the image
    },
    // Column alignment must match the table on the background image
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 70 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: 10, right: 10 }
  });

  const finalY = (doc as any).lastAutoTable.finalY;
  
  // --- Total Amounts (Approximate Y position relative to table end) ---
  const totalsY = finalY + 15; // Requires manual adjustment
  const totalsXValue = pageWidth - 10; 
  
  // Sub Total (Approximate Y=145 on the original image template)
  doc.setFontSize(10);
  doc.text(`${totalAmount}LKR`, totalsXValue, totalsY, { align: 'right' }); 
  
  // Total Amount (Must be placed on the line in the image)
  doc.setFont('helvetica', 'bold');
  doc.text(`${totalAmount}LKR`, totalsXValue, totalsY + 15, { align: 'right' }); 

  // --- Footer PV number ---
  // The PV number in the image is usually static, but we'll place it here
  doc.setFontSize(7);
  doc.text('PV 00259719', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Trigger download
  try {
    doc.save(`invoice_${transaction.invoiceNo}.pdf`);
  } catch (error) {
    console.error('Error saving PDF:', error);
  }

  if (onGenerate) onGenerate();
};