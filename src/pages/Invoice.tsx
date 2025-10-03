import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- Design Constants based on Invoice Image ---
  // Ma's De Cozta Blue (Dark Header, Footer)
 // Correct type: [number, number, number] (a tuple of 3 numbers)
const MDC_DARK_BLUE: [number, number, number] = [0, 43, 84]; 
const MDC_LIGHT_BLUE: [number, number, number] = [198, 226, 255];

  // --- 1. HEADER (LOGO & BUSINESS INFO) ---
  // **NOTE: Logo image is not embedded here as it requires base64 encoding.**
  // To match the image, you'd need:
  // const logoBase64 = '...'; // Base64 string of the logo
  // doc.addImage(logoBase64, 'PNG', 20, 10, 20, 20); 

  // Company Name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.text("MA'S DE COZTA", 45, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De Cozta (PVT)LTD", 45, 20);

  // Business Address & Contact (Top Right)
  doc.setFontSize(8);
  doc.setTextColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.text('39/5/3 A, Pannala Watta, Pannala', pageWidth - 20, 10, { align: 'right' });
  doc.text('+94 70 15 98 886 / +94 33 62 137', pageWidth - 20, 15, { align: 'right' });
  doc.text('decozatamadu019245@gmail.com', pageWidth - 20, 20, { align: 'right' });

  // --- 2. INVOICE TITLE ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.text('INVOICE', pageWidth / 2, 50, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De Cozta (PVT)LTD", pageWidth / 2, 56, { align: 'center' });

  // --- 3. INVOICE INFO BLOCK ---
  const infoBlockY = 70;
  const infoBlockWidth = (pageWidth / 2) - 20; // Approx width
  const blockHeight = 50;

  // Invoice Date/No/PO Block - Left side
  doc.setFillColor(MDC_LIGHT_BLUE[0], MDC_LIGHT_BLUE[1], MDC_LIGHT_BLUE[2]);
  doc.rect(20, infoBlockY, infoBlockWidth - 5, blockHeight, 'F'); // Draw the light blue background
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0); // Black text
  doc.setFont('helvetica', 'normal');
  
  let currentY = infoBlockY + 5;
  
  // Custom function to draw date/info rows
  const drawInfoRow = (label: string, value: string, y: number) => {
    // Draw the label area with a slightly different shade for visual separation (mimicking the image)
    doc.setFillColor(MDC_LIGHT_BLUE[0] - 10, MDC_LIGHT_BLUE[1] - 10, MDC_LIGHT_BLUE[2] - 10);
    doc.rect(20, y, 40, 8, 'F'); 
    doc.text(label, 22, y + 6);
    
    // Draw the value
    doc.text(value, 65, y + 6);
  };

  drawInfoRow('Date', new Date(transaction.date).toLocaleDateString('en-GB'), currentY);
  drawInfoRow('Invoice No', transaction.invoiceNo, currentY += 10);
  drawInfoRow('Due Date', 'N/A', currentY += 10); // Not available in the image data
  drawInfoRow('PO No', transaction.poNumber, currentY += 10);

  // --- 4. SHIP TO / TO BLOCKS ---
  const shipToY = currentY + 30; // Position below the info block
  const column1X = 20;
  const column2X = pageWidth / 2 + 5; // Start right column after a gap

  // SHIP TO (Left)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.text('SHIP TO :', column1X, shipToY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); 
  doc.text('Ceylon Agro Industries,', column1X, shipToY + 8);
  doc.text('346,', column1X, shipToY + 14);
  doc.text('Negombo Road,', column1X, shipToY + 20);
  doc.text('Seeduwa.', column1X, shipToY + 26);

  // TO (Right)
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.text('TO :', column2X, shipToY);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); 
  doc.text('Ceylon Agro Industries,', column2X, shipToY + 8);
  doc.text('346,', column2X, shipToY + 14);
  doc.text('Negombo Road,', column2X, shipToY + 20);
  doc.text('Seeduwa.', column2X, shipToY + 26);

  // --- 5. ITEMS TABLE ---
  const tableStartY = shipToY + 40;
  
  const unitPrice = transaction.amount / transaction.kilosDelivered;
  
  autoTable(doc, {
    startY: tableStartY,
    head: [['NO', 'Description', 'Quantity', 'Unit Price', 'Amount']],
    body: [
      [
        '01',
        'Scotch Bonnet (Nai Miris) Powder',
        `${transaction.kilosDelivered}kg (${transaction.kilosDelivered}kg x 1)`,
        `${unitPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}LKR/kg`,
        `${transaction.amount.toLocaleString('en-US', {minimumFractionDigits: 2})}LKR`
      ]
    ],
    styles: { 
      fontSize: 10,
      cellPadding: 3,
      valign: 'middle',
    },
    headStyles: { 
      fillColor: MDC_DARK_BLUE, // Use the dark blue from the image
      textColor: 255, // White text
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center' // Center header text to match the image
    },
    columnStyles: {
      0: { halign: 'center' }, // NO
      2: { halign: 'center' }, // Quantity
      3: { halign: 'right' },  // Unit Price
      4: { halign: 'right' }   // Amount
    },
    margin: { left: 20, right: 20 },
    theme: 'grid' // Using 'grid' to ensure all cell borders are drawn
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY;

  // --- 6. TOTALS SECTION ---
  const totalsSectionY = finalY + 5;
  const totalLabelX = pageWidth - 60; // Approximate X for labels
  const totalValueX = pageWidth - 20; // Approximate X for values (right-aligned)
  const lineGap = 7;
  
  // Helper to format currency
  const formatLKR = (amount: number): string => 
    `${amount.toLocaleString('en-US', {minimumFractionDigits: 2})}LKR`;
    
  // Sub Total
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sub Total', totalLabelX, totalsSectionY, { align: 'right' });
  doc.text(':', totalLabelX + 2, totalsSectionY);
  doc.text(formatLKR(transaction.amount), totalValueX, totalsSectionY, { align: 'right' });

  // Taxes
  doc.text('Taxes', totalLabelX, totalsSectionY + lineGap, { align: 'right' });
  doc.text(':', totalLabelX + 2, totalsSectionY + lineGap);
  doc.text('0.00LKR', totalValueX, totalsSectionY + lineGap, { align: 'right' });

  // Discount
  doc.text('Discount', totalLabelX, totalsSectionY + 2 * lineGap, { align: 'right' });
  doc.text(':', totalLabelX + 2, totalsSectionY + 2 * lineGap);
  doc.text('0.00LKR', totalValueX, totalsSectionY + 2 * lineGap, { align: 'right' });
  
  // Total Amount (Bold/Boxed look)
  doc.setDrawColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]); // Set border color
  doc.setLineWidth(0.5); // Thicker line
  // Draw the surrounding rectangle for the Total Amount to mimic the image's boxed style
  doc.rect(pageWidth - 65, totalsSectionY + 3 * lineGap + 1, 45, lineGap + 4); 

  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount', totalLabelX, totalsSectionY + 3 * lineGap + 5, { align: 'right' });
  doc.text(':', totalLabelX + 2, totalsSectionY + 3 * lineGap + 5);
  doc.text(formatLKR(transaction.amount), totalValueX, totalsSectionY + 3 * lineGap + 5, { align: 'right' });

  // --- 7. BANK DETAILS & THANK YOU ---
  const bankDetailsY = totalsSectionY + 50;
  
  // Bank Details title
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.text('Bank Details', 20, bankDetailsY);

  // Bank Details content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0); 
  doc.text('Bank', 20, bankDetailsY + 8);
  doc.text(':', 60, bankDetailsY + 8);
  doc.text('Sampath Bank', 65, bankDetailsY + 8);

  doc.text('Branch', 20, bankDetailsY + 16);
  doc.text(':', 60, bankDetailsY + 16);
  doc.text('Pannala', 65, bankDetailsY + 16);

  doc.text('Account Name', 20, bankDetailsY + 24);
  doc.text(':', 60, bankDetailsY + 24);
  doc.text("Ma's De Cozta Pvt Ltd", 65, bankDetailsY + 24);

  doc.text('Account Number', 20, bankDetailsY + 32);
  doc.text(':', 60, bankDetailsY + 32);
  doc.text('016610003145', 65, bankDetailsY + 32);
  
  // Thank you message
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.text('Thank you for Business with us!', pageWidth / 2, bankDetailsY + 50, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De Cozta (PVT)LTD", pageWidth / 2, bankDetailsY + 55, { align: 'center' });


  // --- 8. FOOTER BANNER ---
  const footerY = pageHeight - 15;
  doc.setFillColor(MDC_DARK_BLUE[0], MDC_DARK_BLUE[1], MDC_DARK_BLUE[2]);
  doc.rect(0, footerY, pageWidth, 15, 'F'); // Dark blue footer banner

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(255, 255, 255); // White text
  doc.text('PV 00259719', pageWidth / 2, footerY + 5, { align: 'center' });

  // --- 9. SAVE DOCUMENT ---
  try {
    doc.save(`invoice_${transaction.invoiceNo}.pdf`);
    console.log('Invoice generated successfully');
  } catch (error) {
    console.error('Error saving PDF:', error);
  }

  if (onGenerate) onGenerate();
};