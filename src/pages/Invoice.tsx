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

  // Colors - Define as tuples for TypeScript  
  const blueColor: [number, number, number] = [41, 128, 185]; // Blue color from original
  const darkColor: [number, number, number] = [52, 73, 94]; // Dark gray
  const lightGray: [number, number, number] = [236, 240, 241]; // Light background

  // HEADER - Company Info with Logo
  // Logo placeholder (circular green background)
  doc.setFillColor(46, 125, 50); // Green color
  doc.circle(30, 25, 15, 'F');
  
  // Logo text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text("Ma's De Costa", 30, 30, { align: 'center' });

  // Company Name - Large
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text("Ma's De cozta", 50, 20);
  
  // Underline
  doc.setLineWidth(2);
  doc.line(50, 22, pageWidth - 20, 22);
  
  // Company details
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text("Ma's De cozta(PVT)LTD.", 50, 30);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('📍 39/3/3 A Pannala watta,Pannala', 50, 36);
  doc.text('📞 0761518884', 50, 42);
  doc.text('✉ decostamadu81924@gmail.com', 50, 48);

  // INVOICE TITLE - Blue with underline
  doc.setTextColor(...blueColor);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth / 2, 70, { align: 'center' });
  
  // Underline for INVOICE
  doc.setLineWidth(2);
  doc.setDrawColor(...blueColor);
  doc.line(pageWidth / 2 - 35, 72, pageWidth / 2 + 35, 72);

  // Invoice details - Right side
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date :- ${new Date(transaction.date).toLocaleDateString('en-GB')}`, pageWidth - 20, 80, { align: 'right' });
  doc.text(`Invoice :- ${transaction.invoiceNo}`, pageWidth - 20, 86, { align: 'right' });
  doc.text('DUE Date :- N/A', pageWidth - 20, 92, { align: 'right' });
  doc.text(`Po No :- ${transaction.poNumber}`, pageWidth - 20, 98, { align: 'right' });

  // ITEMS TABLE with blue headers
  autoTable(doc, {
    startY: 175,
    head: [['No.', 'Description', 'Quantity', 'Unit Price', 'Amount']],
    body: [
      [
        '01',
        'Scotch Bonnet (Nai Miris) Powder',
        `${transaction.kilosDelivered}kg (${transaction.kilosDelivered} x 1kg)`,
        `${(transaction.amount / transaction.kilosDelivered).toLocaleString()}.00LKR/kg`,
        `${transaction.amount.toLocaleString()}.00LKR`
      ]
    ],
    styles: { 
      fontSize: 10,
      cellPadding: 8
    },
    headStyles: { 
      fillColor: blueColor,
      textColor: 255,
      fontSize: 11,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 249, 255] as [number, number, number]
    },
    tableLineColor: [200, 200, 200] as [number, number, number],
    tableLineWidth: 0.5,
    margin: { left: 20, right: 20 }
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // TOTALS SECTION - Right aligned
  const totalsX = pageWidth - 100;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sub Total', totalsX, finalY);
  doc.text(`${transaction.amount.toLocaleString()}.00LKR`, pageWidth - 20, finalY, { align: 'right' });
  
  doc.text('Taxes', totalsX, finalY + 8);
  doc.text('0', pageWidth - 20, finalY + 8, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total', totalsX, finalY + 16);
  doc.text(`${transaction.amount.toLocaleString()}.00LKR`, pageWidth - 20, finalY + 16, { align: 'right' });

  // Thank you message in cursive style
  doc.setTextColor(...blueColor);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business', 20, finalY + 40);

  // Reset color
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // BANK DETAILS
  doc.setFontSize(10);
  doc.text('BANK      : SAMPATH BANK', 20, finalY + 55);
  doc.text('BRANCH    : PANNALA', 20, finalY + 63);
  doc.text("ACOUNT NAME : MA'S DE COZTA PVT LTD", 20, finalY + 71);
  doc.text('ACCOUNT NUMBER: 016610003145', 20, finalY + 79);

  // Quality control section (right side)
  doc.setFontSize(9);
  doc.text('Quality Accepted', pageWidth - 50, finalY + 55, { align: 'center' });
  doc.rect(pageWidth - 70, finalY + 58, 40, 25);
  doc.text('Checked by : ________________', pageWidth - 50, finalY + 70, { align: 'center' });
  doc.text(`Date        : ${new Date(transaction.date).toLocaleDateString('en-GB')}`, pageWidth - 50, finalY + 78, { align: 'center' });

  // Signature line (left side)
  doc.setLineWidth(1);
  doc.line(20, finalY + 95, 80, finalY + 95);

  // Footer line
  doc.setLineWidth(2);
  doc.setDrawColor(...blueColor);
  doc.line(20, finalY + 110, pageWidth - 20, finalY + 110);
  
  // PV number at bottom
  doc.setFontSize(8);
  doc.text('PV 00259719', pageWidth / 2, finalY + 120, { align: 'center' });

  // Trigger download
  try {
    doc.save(`invoice_${transaction.invoiceNo}.pdf`);
    console.log('Invoice generated successfully');
  } catch (error) {
    console.error('Error saving PDF:', error);
  }

  if (onGenerate) onGenerate();
};