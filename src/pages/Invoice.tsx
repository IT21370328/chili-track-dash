import jsPDF from 'jspdf';

interface PrimaTransaction {
  id: number;
  poNumber: string;
  date: string;
  kilosDelivered: number;
  amount: number;
  paymentStatus: "Pending" | "Approved" | "Paid" | "Rejected";
}

interface InvoiceProps {
  transaction: PrimaTransaction;
  onGenerate?: () => void;
}

const Invoice = ({ transaction, onGenerate }: InvoiceProps) => {
  const generateInvoice = () => {
    const doc = new jsPDF();
    
    // Company Details (Hardcoded - customize as needed)
    doc.setFontSize(18);
    doc.text("Chili Track Dashboard", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Invoice", 105, 30, { align: "center" });
    doc.setFontSize(10);
    doc.text("Address: Your Company Address Here", 20, 40);
    doc.text("Phone: +123-456-7890", 20, 45);
    doc.text("Email: info@chilitrack.com", 20, 50);
    doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 20, 55);
    doc.text(`Invoice ID: DEL-${transaction.id}`, 20, 60);

    // Customer Details (Assuming Prima is the customer)
    doc.text("Billed To:", 120, 40);
    doc.text("Prima Company", 120, 45);
    doc.text("Customer Address Here", 120, 50);
    doc.text("Phone: +987-654-3210", 120, 55);

    // Horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 70, 190, 70);

    // Delivery Details
    doc.setFontSize(12);
    doc.text("Delivery Details:", 20, 80);
    doc.setFontSize(10);
    doc.text(`PO Number: ${transaction.poNumber}`, 20, 90);
    doc.text(`Delivery Date: ${new Date(transaction.date).toLocaleDateString()}`, 20, 95);
    doc.text(`Kilos Delivered: ${transaction.kilosDelivered} kg`, 20, 100);
    doc.text(`Amount: Rs ${transaction.amount.toLocaleString()}`, 20, 105);
    doc.text(`Payment Status: ${transaction.paymentStatus}`, 20, 110);

    // Table for Items (Single item table)
    doc.setFillColor(220, 220, 220);
    doc.rect(20, 120, 170, 10, "F");
    doc.text("Description", 22, 127);
    doc.text("Quantity (kg)", 100, 127);
    doc.text("Amount (Rs)", 150, 127);

    doc.text("Chili Powder Delivery", 22, 140);
    doc.text(`${transaction.kilosDelivered}`, 100, 140);
    doc.text(`${transaction.amount.toLocaleString()}`, 150, 140);

    // Total
    doc.setLineWidth(0.5);
    doc.line(20, 150, 190, 150);
    doc.text("Total Amount:", 130, 160);
    doc.text(`Rs ${transaction.amount.toLocaleString()}`, 150, 160);

    // Footer
    doc.setFontSize(9);
    doc.text("Thank you for your business!", 105, 200, { align: "center" });
    doc.text("Terms: Payment due within 30 days.", 105, 205, { align: "center" });

    // Save the PDF
    doc.save(`invoice_delivery_${transaction.id}.pdf`);

    // Call onGenerate callback if provided
    if (onGenerate) onGenerate();
  };

  return null; // This component doesn't render anything to the DOM
};

export default Invoice;