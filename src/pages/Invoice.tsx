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


  // Invoice details - Right side
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date :- ${new Date(transaction.date).toLocaleDateString('en-GB')}`, pageWidth - 20, 32, { align: 'right' });
  doc.text(`Invoice :- ${transaction.invoiceNo}`, pageWidth - 20, 40, { align: 'right' });
  doc.text('DUE Date :- N/A', pageWidth - 20, 48, { align: 'right' });
  doc.text(`Po No :- ${transaction.poNumber}`, pageWidth - 20, 56, { align: 'right' });

  // TO section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TO', 20, 90);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ceylon Agro Industries,', 20, 100);
  doc.text('346,', 20, 106);
  doc.text('Negombo Road,', 20, 112);
  doc.text('Seeduwa.', 20, 118);

  // SHIP TO section
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO', pageWidth - 70, 90);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Ceylon Agro Industries,', pageWidth - 70, 100);
  doc.text('346,', pageWidth - 70, 106);
  doc.text('Negombo Road,', pageWidth - 70, 112);
  doc.text('Seeduwa.', pageWidth - 70, 118);

  // ITEMS TABLE
  autoTable(doc, {
    startY: 130,
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
      cellPadding: 5
    },
    headStyles: { 
      fillColor: [41, 128, 185],
      textColor: 255,
      fontSize: 10,
      fontStyle: 'bold'
    },
    margin: { left: 20, right: 20 }
  });

  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // TOTALS SECTION - Right aligned
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Sub Total', pageWidth - 80, finalY);
  doc.text(`${transaction.amount.toLocaleString()}.00LKR`, pageWidth - 20, finalY, { align: 'right' });
  
  doc.text('Taxes', pageWidth - 80, finalY + 8);
  doc.text('0', pageWidth - 20, finalY + 8, { align: 'right' });
  
  doc.setFont('helvetica', 'bold');
  doc.text('Total', pageWidth - 80, finalY + 16);
  doc.text(`${transaction.amount.toLocaleString()}.00LKR`, pageWidth - 20, finalY + 16, { align: 'right' });

  // Thank you message
  doc.setFontSize(14);
  doc.setFont('helvetica', 'italic');
  doc.text('Thank you for your business', 20, finalY + 35);

  // BANK DETAILS
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('BANK      : SAMPATH BANK', 20, finalY + 50);
  doc.text('BRANCH    : PANNALA', 20, finalY + 58);
  doc.text("ACOUNT NAME : MA'S DE COZTA PVT LTD", 20, finalY + 66);
  doc.text('ACCOUNT NUMBER: 016610003145', 20, finalY + 74);

  // Quality control section (right side)
  doc.setFontSize(9);
  doc.text('Quality Accepted', pageWidth - 50, finalY + 45, { align: 'center' });
  doc.rect(pageWidth - 65, finalY + 48, 30, 20);
  doc.text('Checked by : ____________', pageWidth - 50, finalY + 60, { align: 'center' });
  doc.text(`Date : ${new Date(transaction.date).toLocaleDateString('en-GB')}`, pageWidth - 50, finalY + 66, { align: 'center' });

  // Signature line
  doc.line(20, finalY + 90, 70, finalY + 90);

  // Footer line
  doc.line(20, finalY + 105, pageWidth - 20, finalY + 105);
  
  // PV number at bottom
  doc.setFontSize(8);
  doc.text('PV 00259719', pageWidth / 2, finalY + 115, { align: 'center' });

  // Trigger download
  try {
    doc.save(`invoice_${transaction.invoiceNo}.pdf`);
    console.log('Invoice generated successfully');
  } catch (error) {
    console.error('Error saving PDF:', error);
  }

  if (onGenerate) onGenerate();
};