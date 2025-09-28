import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface PrimaTransaction {
  id: number;
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

  // Colors - Define as tuples for TypeScript
  const purpleColor: [number, number, number] = [107, 70, 193]; // #6b46c1
  const darkColor: [number, number, number] = [45, 27, 105]; // #2d1b69
  const blackColor: [number, number, number] = [26, 26, 26]; // #1a1a1a

  // HEADER BACKGROUND - Dark curved design
  doc.setFillColor(...darkColor);
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  // Add curved design elements
  doc.setFillColor(...purpleColor);
  // Top right curve
  doc.ellipse(pageWidth - 30, 30, 25, 15, 'F');
  // Bottom left accent
  doc.setFillColor(...blackColor);
  doc.ellipse(30, 50, 20, 10, 'F');

  // LOGO SECTION - White rounded rectangle
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 10, 60, 25, 3, 3, 'F');
  doc.setTextColor(...darkColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Logo Here', 45, 25, { align: 'center' });

  // CONTACT INFO - White text on dark background
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Address', pageWidth - 15, 15, { align: 'right' });
  doc.text("Ma's De Cozta (PVT) LTD.", pageWidth - 15, 20, { align: 'right' });
  doc.text('39/3/3 A Pannala watta, Pannala', pageWidth - 15, 24, { align: 'right' });
  
  doc.text('Phone', pageWidth - 15, 32, { align: 'right' });
  doc.text('0761518884', pageWidth - 15, 36, { align: 'right' });
  
  doc.text('Email', pageWidth - 15, 44, { align: 'right' });
  doc.text('decostamadu81924@gmail.com', pageWidth - 15, 48, { align: 'right' });

  // Reset text color to black for main content
  doc.setTextColor(0, 0, 0);

  // INVOICE TITLE SECTION
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Invoice To', 20, 80);
  
  // Client details
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Ceylon Agro Industries', 20, 88);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Agro Business', 20, 94);
  doc.text('E-mail: info@ceylonagro.lk', 20, 100);
  doc.text('Phone: +94112345678', 20, 105);
  doc.text('Address: 346, Negombo Road, Seeduwa', 20, 110);

  // LARGE INVOICE TITLE
  doc.setTextColor(...purpleColor);
  doc.setFontSize(36);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - 20, 85, { align: 'right' });

  // Invoice details
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice No: ${transaction.id}`, pageWidth - 20, 95, { align: 'right' });
  doc.text(`Invoice date: ${new Date(transaction.date).toLocaleDateString()}`, pageWidth - 20, 101, { align: 'right' });
  doc.text(`PO No: ${transaction.poNumber}`, pageWidth - 20, 107, { align: 'right' });
  doc.text('Due: Net 30', pageWidth - 20, 113, { align: 'right' });

  // ITEMS TABLE with styled header
  autoTable(doc, {
    startY: 125,
    head: [['Product Description', 'Price', 'Qty', 'Amount']],
    body: [
      [
        'Scotch Bonnet (Nai Miris) Powder',
        `LKR ${(transaction.amount / transaction.kilosDelivered).toLocaleString()}/kg`,
        `${transaction.kilosDelivered} kg`,
        `LKR ${transaction.amount.toLocaleString()}`
      ]
    ],
    styles: { 
      fontSize: 10,
      cellPadding: 8
    },
    headStyles: { 
      fillColor: purpleColor,
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 255] as [number, number, number] // Light purple tint
    },
    tableLineColor: [200, 200, 200] as [number, number, number],
    tableLineWidth: 0.5,
    margin: { left: 20, right: 20 }
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // TERMS AND CONDITIONS section
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Terms and Conditions', 20, finalY);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment is due within 30 days of invoice date.', 20, finalY + 8);
  doc.text('Late payments may incur additional charges.', 20, finalY + 14);

  // TOTALS SECTION - Right aligned with styled boxes
  const totalsX = pageWidth - 80;
  
  // Subtotal
  doc.text('Total', totalsX, finalY);
  doc.text(`LKR ${transaction.amount.toLocaleString()}`, pageWidth - 20, finalY, { align: 'right' });
  
  // Tax
  doc.text('Tax', totalsX, finalY + 8);
  doc.text('0%', pageWidth - 20, finalY + 8, { align: 'right' });
  
  // Discount
  doc.setTextColor(231, 76, 60); // Red color for discount
  doc.text('Discount', totalsX, finalY + 16);
  doc.text('- LKR 0.00', pageWidth - 20, finalY + 16, { align: 'right' });
  
  // Grand Total - Styled box
  doc.setFillColor(...purpleColor);
  doc.roundedRect(totalsX - 5, finalY + 22, 75, 12, 2, 2, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Grand Total', totalsX, finalY + 30);
  doc.text(`LKR ${transaction.amount.toLocaleString()}`, pageWidth - 20, finalY + 30, { align: 'right' });

  // Reset colors
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // BANK DETAILS
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 20, finalY + 50);
  
  doc.setFontSize(9);
  doc.text('BANK DETAILS:', 20, finalY + 60);
  doc.text('BANK: Sampath Bank', 20, finalY + 68);
  doc.text('BRANCH: Pannala', 20, finalY + 74);
  doc.text("ACCOUNT NAME: MA'S DE COZTA PVT LTD", 20, finalY + 80);
  doc.text('ACCOUNT NUMBER: 016610003145', 20, finalY + 86);

  // SIGNATURE SECTION
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Signature', 20, finalY + 105);
  
  // Signature line
  doc.setDrawColor(150, 150, 150);
  doc.line(20, finalY + 125, 80, finalY + 125);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature', 20, finalY + 130);
  doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 20, finalY + 136);

  // FOOTER CURVED DESIGN
  if (finalY + 140 < pageHeight - 30) {
    doc.setFillColor(...darkColor);
    // Create a curved bottom section
    doc.ellipse(pageWidth / 2, pageHeight - 15, pageWidth / 2, 15, 'F');
  }

  // Trigger download
  try {
    doc.save(`styled_invoice_${transaction.id}.pdf`);
    console.log('Styled invoice generated successfully');
  } catch (error) {
    console.error('Error saving PDF:', error);
  }

  if (onGenerate) onGenerate();
};