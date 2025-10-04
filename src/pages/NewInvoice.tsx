import { useRef } from "react";
import { useLocation } from "react-router-dom";
import Logo from "../../src/assets/logo.jpg";
import InvoiceBg from "../../src/assets/invoicebg.jpg";
import html2pdf from "html2pdf.js";

interface TransactionData {
  date: string;
  dateOfExpiration: string;
  invoiceNo: string;
  poNumber: string;
  amount: number;
  kilosDelivered: number;
  productCode?: string;
  batchCode?: string;
  truckNo?: string;
  numberOfBoxes?: number;
}

export default function Invoice(): JSX.Element {
  const location = useLocation();
  const transaction: TransactionData = location.state?.transaction || {
    date: "2025-10-04",
    dateOfExpiration: "2025-11-03",
    invoiceNo: "INV-2025-001",
    poNumber: "PO-2025-123",
    amount: 360000,
    kilosDelivered: 30,
    productCode: "MASI00003",
  };

  const invoiceRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const unitPrice = transaction.kilosDelivered > 0 ? Math.round(transaction.amount / transaction.kilosDelivered) : 0;

  const handleDownload = (): void => {
    const element = invoiceRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `${transaction.invoiceNo || "invoice"}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in" as const, format: "a4" as const, orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Invoice */}
      <div
        ref={invoiceRef}
        className="bg-white border font-[Montserrat] flex flex-col justify-between"
        style={{
          width: "8.27in",
          height: "11.69in", // Exact A4 size
          margin: 0,
          padding: 0,
        }}
      >
        {/* Header */}
        <div className="bg-[#025291] text-white p-4 flex justify-between items-start">
          <div className="flex items-start gap-2">
            <img
              src={Logo}
              alt="Company Logo"
              className="w-12 h-12 object-contain bg-white rounded flex-shrink-0"
            />
            <div className="flex-shrink-0">
              <h1 className="text-xl font-bold leading-tight">MA’S DE COZTA</h1>
              <p className="text-xs leading-tight">Ma’s De cozta (PVT)LTD</p>
            </div>
          </div>
          <div className="text-right text-xs leading-tight max-w-[3.5in]">
            <p>39/3/5 A, Pannala Watta, Pannala</p>
            <p>+94 76 15 18 884 / +94 33 62 137</p>
            <p>decostamadu81924@gmail.com</p>
          </div>
        </div>

        {/* Background + Content */}
        <div className="relative flex-1 flex flex-col">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
            <img
              src={InvoiceBg}
              alt="Background pattern"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col px-6 py-10 space-y-6">
            {/* Invoice Title */}
            <div className="text-center py-4 border-b">
              <h2 className="text-2xl font-bold text-[#025291]">INVOICE</h2>
              <p className="text-[#025291]/50 text-sm">Ma’s De cozta (PVT)LTD</p>
            </div>

            {/* Details Section */}
            <div>
              <table className="w-full border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3">
                      Date
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3">{formatDate(transaction.date)}</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3">
                      Invoice No
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3">{transaction.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3">
                      Due Date
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3">{formatDate(transaction.dateOfExpiration)}</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3">
                      PO No
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3">{transaction.poNumber}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Shipping Section */}
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-[#025291] mb-2 text-sm">SHIP TO :</h3>
                <p className="text-sm">Ceylon Agro Industries,</p>
                <p className="text-sm">346, Negombo Road,</p>
                <p className="text-sm">Seeduwa.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#025291] mb-2 text-sm">TO :</h3>
                <p className="text-sm">Ceylon Agro Industries,</p>
                <p className="text-sm">346, Negombo Road,</p>
                <p className="text-sm">Seeduwa.</p>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 flex flex-col">
              <table className="w-full border-collapse text-xs bg-transparent flex-1">
                <thead>
                  <tr className="bg-[#025291] text-white text-left">
                    <th className="p-1">NO</th>
                    <th className="p-1">Description</th>
                    <th className="p-1">Quantity</th>
                    <th className="p-1">Unit Price</th>
                    <th className="p-1">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-white/80">
                    <td className="p-1">01</td>
                    <td className="p-1 font-semibold text-left">
                      Scotch Bonnet (Nai Miris) Powder
                    </td>
                    <td className="p-1">{transaction.kilosDelivered}kg</td>
                    <td className="p-1">{unitPrice}LKR/kg</td>
                    <td className="p-1 text-right">{transaction.amount.toLocaleString()}LKR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-64 text-xs bg-white/80 p-3 rounded">
                <div className="flex justify-between py-1 border-b">
                  <span>Sub Total :</span>
                  <span className="font-bold">{transaction.amount.toLocaleString()}LKR</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Taxes :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between py-1 border-b">
                  <span>Discount :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between font-bold py-1">
                  <span>Total Amount :</span>
                  <span>{transaction.amount.toLocaleString()}LKR</span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div>
              <h3 className="font-bold text-[#025291] mb-2 text-xs">Bank Details</h3>
              <p className="text-xs">
                <strong>Bank:</strong> Sampath Bank
              </p>
              <p className="text-xs">
                <strong>Branch:</strong> Pannala
              </p>
              <p className="text-xs">
                <strong>Account Name:</strong> Ma’s De Cozta Pvt Ltd
              </p>
              <p className="text-xs">
                <strong>Account Number:</strong> 016610003145
              </p>
            </div>
          </div>
        </div>

        {/* Footer (sticks to bottom) */}
        <div>
          <div className="text-center py-4 bg-[#F5F9FD]">
            <p className="text-base font-bold text-[#025291]">
              Thank you for Business with us!
            </p>
            <p className="text-[#2B64A0] text-xs">Ma’s De cozta (PVT)LTD</p>
          </div>
          <div className="bg-[#025291]">
            <div className="text-center py-2 text-xs text-white">PV 00259719</div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="mt-6 px-6 py-2 bg-[#025291] text-white rounded-lg shadow hover:bg-[#013d6e] transition"
      >
        Download Invoice
      </button>
    </div>
  );
}