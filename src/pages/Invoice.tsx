import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// Assuming Logo is a base64 string or an object that contains one after import
import Logo from "../assets/logo.jpg"; 

// IMPORTANT: Replace this placeholder with the actual base64 string 
// of your logo (e.g., const BASE64_LOGO = 'data:image/jpeg;base64,/9j/4AAQSkZJ...';)
const BASE64_LOGO = {Logo}; // <<< REPLACE THIS LINE

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

  // --- Header Section ---
  // Blue banner at the top
  doc.setFillColor(39, 90, 161); 
  doc.rect(0, 0, pageWidth, 25, 'F'); 

  // 🖼️ ADDED LOGO 🖼️
  try {
    // Add the image (Base64 string) to the PDF
    // X=10, Y=5, Width=15, Height=15 (Adjust these values as needed for your logo size)
    doc.addImage(BASE64_LOGO, 'JPEG', 10, 5, 15, 15);
  } catch (e) {
    console.warn("Logo image failed to load or is not a valid Base64 string. Using text placeholder.", e);
  }

  // Company Name/Details (Moved slightly to accommodate the logo)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); // White text
  doc.text("MA'S DE COZTA", 28, 10); // Start text after the logo area
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De cozta (PVT)LTD", 28, 15); // Start text after the logo area

  // REMOVED: Placeholder for the small green logo circle

  // Header Contact Info (Top Right)
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('39/3/3 A, Pannala Watta, Pannala', pageWidth - 5, 8, { align: 'right' });
  doc.text('+94 70 15 98 886 / +94 33 62 137', pageWidth - 5, 13, { align: 'right' });
  doc.text('decoztamadu01974@gmail.com', pageWidth - 5, 18, { align: 'right' });

  // ------------------------------------------------------------------
  // --- The rest of the function remains the same ---
  // ------------------------------------------------------------------

  // --- Invoice Title ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50); // Dark grey text
  doc.text('INVOICE', pageWidth / 2, 40, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De cozta (PVT)LTD", pageWidth / 2, 46, { align: 'center' });

  // --- Invoice Details Table-like Section ---
  const detailBoxX = 10;
  const detailBoxY = 55;
  const detailBoxWidth = pageWidth - 2 * detailBoxX;
  const detailRowHeight = 8;
  const labelWidth = 30; // Width for "Date", "Invoice No" etc.

  // Headers (Date, Invoice No, Due Date, PO No)
  doc.setFillColor(210, 235, 255); // Light blue
  doc.rect(detailBoxX, detailBoxY, labelWidth, detailRowHeight * 4, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', detailBoxX + 2, detailBoxY + 5);
  doc.text('Invoice No', detailBoxX + 2, detailBoxY + 5 + detailRowHeight);
  doc.text('Due Date', detailBoxX + 2, detailBoxY + 5 + detailRowHeight * 2);
  doc.text('PO No', detailBoxX + 2, detailBoxY + 5 + detailRowHeight * 3);

  // Values (Dynamic Data)
  doc.setFillColor(235, 245, 255); // Even lighter blue
  doc.rect(detailBoxX + labelWidth, detailBoxY, detailBoxWidth - labelWidth, detailRowHeight * 4, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(transaction.date).toLocaleDateString('en-GB')}`, detailBoxX + labelWidth + 2, detailBoxY + 5);
  doc.text(`${transaction.invoiceNo}`, detailBoxX + labelWidth + 2, detailBoxY + 5 + detailRowHeight);
  doc.text('N/A', detailBoxX + labelWidth + 2, detailBoxY + 5 + detailRowHeight * 2);
  doc.text(`${transaction.poNumber}`, detailBoxX + labelWidth + 2, detailBoxY + 5 + detailRowHeight * 3);

  // --- SHIP TO / TO sections ---
  const addressBlockY = detailBoxY + detailRowHeight * 4 + 10;
  const col1X = 10;
  const col2X = pageWidth / 2;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO :', col1X, addressBlockY);
  doc.text('TO :', col2X, addressBlockY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ceylon Agro Industries,', col1X, addressBlockY + 6);
  doc.text('346,', col1X, addressBlockY + 11);
  doc.text('Negombo Road,', col1X, addressBlockY + 16);
  doc.text('Seeduwa.', col1X, addressBlockY + 21);

  doc.text('Ceylon Agro Industries,', col2X, addressBlockY + 6);
  doc.text('346,', col2X, addressBlockY + 11);
  doc.text('Negombo Road,', col2X, addressBlockY + 16);
  doc.text('Seeduwa.', col2X, addressBlockY + 21);

  // --- ITEMS TABLE ---
  autoTable(doc, {
    startY: addressBlockY + 30, // Adjust Y position after address blocks
    head: [['NO', 'Description', 'Quantity', 'Unit Price', 'Amount']],
    body: [
      [
        '01',
        'Scotch Bonnet (Nai Miris) Powder',
        `${transaction.kilosDelivered}kg (${transaction.kilosDelivered}kgx1)`,
        `${(transaction.amount / transaction.kilosDelivered).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR/kg`,
        `${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR`
      ]
    ],
    theme: 'plain', // Use plain theme to control styling manually
    styles: {
      fontSize: 9,
      cellPadding: 2,
      textColor: [50, 50, 50],
      lineColor: [200, 200, 200], // Light grey borders
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [39, 90, 161], // Dark blue
      textColor: [255, 255, 255], // White
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center', // Center align header text
      lineColor: [39, 90, 161],
    },
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

  // --- Totals Section ---
  const totalsXLabel = pageWidth - 60; // X for "Sub Total"
  const totalsXValue = pageWidth - 10; // X for amounts, right aligned
  const totalsBlockY = finalY + 5;
  const totalRowSpacing = 5;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  // Sub Total
  doc.setFont('helvetica', 'normal');
  doc.text('Sub Total', totalsXLabel, totalsBlockY);
  doc.text(`${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR`, totalsXValue, totalsBlockY, { align: 'right' });

  // Taxes
  doc.text('Taxes', totalsXLabel, totalsBlockY + totalRowSpacing);
  doc.text(`0.00LKR`, totalsXValue, totalsBlockY + totalRowSpacing, { align: 'right' });

  // Discount (added based on image)
  doc.text('Discount', totalsXLabel, totalsBlockY + totalRowSpacing * 2);
  doc.text(`0.00LKR`, totalsXValue, totalsBlockY + totalRowSpacing * 2, { align: 'right' });

  // Total Amount (styled bold in image)
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount', totalsXLabel, totalsBlockY + totalRowSpacing * 3);
  doc.text(`${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR`, totalsXValue, totalsBlockY + totalRowSpacing * 3, { align: 'right' });

  // --- Bank Details and Thank You Message ---
  const bottomSectionY = totalsBlockY + totalRowSpacing * 3 + 15;
  const bankDetailsX = 10;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for Business with us!', pageWidth / 2, bottomSectionY, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De cozta (PVT)LTD", pageWidth / 2, bottomSectionY + 5, { align: 'center' });

  // Bank Details (mimicking the box-like structure)
  const bankBoxY = bottomSectionY + 15;
  const bankBoxHeight = 40;
  doc.setFillColor(235, 245, 255); // Light blue background
  doc.rect(bankDetailsX, bankBoxY, pageWidth / 2 - bankDetailsX - 5, bankBoxHeight, 'F'); // Left half box

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details', bankDetailsX + 2, bankBoxY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text('Bank', bankDetailsX + 5, bankBoxY + 12);
  doc.text(': Sampath Bank', bankDetailsX + 30, bankBoxY + 12);
  doc.text('Branch', bankDetailsX + 5, bankBoxY + 17);
  doc.text(': Pannala', bankDetailsX + 30, bankBoxY + 17);
  doc.text('Account Name', bankDetailsX + 5, bankBoxY + 22);
  doc.text(`: Ma's De Cozta Pvt Ltd`, bankDetailsX + 30, bankBoxY + 22);
  doc.text('Account Number', bankDetailsX + 5, bankBoxY + 27);
  doc.text(': 016610003145', bankDetailsX + 30, bankBoxY + 27);

  // Footer PV number (bottom blue bar)
  doc.setFillColor(39, 90, 161); // Darker blue
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('PV 00259719', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Trigger download
  try {
    doc.save(`invoice_${transaction.invoiceNo}.pdf`);
    console.log('Invoice generated successfully');
  } catch (error) {
    console.error('Error saving PDF:', error);
  }

  if (onGenerate) onGenerate();
};