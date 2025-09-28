import jsPDF from "jspdf";
import "jspdf-autotable";

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

  // HEADER (Company Info)
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Ma's De Cozta (PVT) LTD.", 20, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("39/3/3 A Pannala watta, Pannala", 20, 26);
  doc.text("Phone: 0761518884", 20, 31);
  doc.text("Email: decostamadu81924@gmail.com", 20, 36);

  // INVOICE TITLE
  doc.setFontSize(16);
  doc.setTextColor(0, 102, 204);
  doc.text("INVOICE", 170, 20, { align: "right" });
  doc.setTextColor(0, 0, 0);

  // Invoice Details
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 150, 30);
  doc.text(`Invoice #: ${transaction.id}`, 150, 36);
  doc.text(`Due Date: N/A`, 150, 42);
  doc.text(`PO No: ${transaction.poNumber}`, 150, 48);

  // TO & SHIP TO
  doc.setFont("helvetica", "bold");
  doc.text("TO:", 20, 55);
  doc.text("SHIP TO:", 120, 55);
  doc.setFont("helvetica", "normal");
  doc.text("Ceylon Agro Industries\n346, Negombo Road,\nSeeduwa.", 20, 62);
  doc.text("Ceylon Agro Industries\n346, Negombo Road,\nSeeduwa.", 120, 62);

  // TABLE
  (doc as any).autoTable({
    startY: 90,
    head: [["No.", "Description", "Quantity", "Unit Price", "Amount"]],
    body: [
      [
        "01",
        "Scotch Bonnet (Nai Miris) Powder",
        `${transaction.kilosDelivered} kg`,
        `12,000.00 LKR/kg`,
        `${transaction.amount.toLocaleString()} LKR`,
      ],
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 102, 204] },
  });

  // TOTALS
  let finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Sub Total: ${transaction.amount.toLocaleString()} LKR`, 140, finalY);
  doc.text(`Taxes: 0`, 140, finalY + 6);
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${transaction.amount.toLocaleString()} LKR`, 140, finalY + 12);
  doc.setFont("helvetica", "normal");

  // BANK DETAILS
  doc.setFontSize(10);
  doc.text("Thank you for your business", 20, finalY + 25);
  doc.text("BANK: Sampath Bank", 20, finalY + 32);
  doc.text("BRANCH: Pannala", 20, finalY + 38);
  doc.text("ACCOUNT NAME: MA'S DE COZTA PVT LTD", 20, finalY + 44);
  doc.text("ACCOUNT NUMBER: 016610003145", 20, finalY + 50);

  // FOOTER - Signature
  doc.text("Checked by: ___________", 20, finalY + 70);
  doc.text(`Date: ${new Date(transaction.date).toLocaleDateString()}`, 20, finalY + 76);

  // SAVE PDF
  doc.save(`invoice_${transaction.id}.pdf`);

  if (onGenerate) onGenerate();
};

// Dummy component
const Invoice = () => null;
export default Invoice;
