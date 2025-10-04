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
      image: { type: "png" as const, quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true, 
        letterRendering: true 
      },
      jsPDF: { unit: "in" as const, format: "a4" as const, orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Invoice */}
      <div
        ref={invoiceRef}
        className="bg-white font-[Montserrat] flex flex-col justify-between leading-none"
        style={{
          width: "8.27in",
          height: "11.69in", // Exact A4 size
          margin: 0,
          padding: 0,
          border: "none",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div className="bg-[#025291] text-white p-4 flex justify-between items-start leading-tight">
          <div className="flex items-start gap-2">
            <img
              src={Logo}
              alt="Company Logo"
              className="w-12 h-12 object-contain bg-white rounded flex-shrink-0"
            />
            <div className="flex-shrink-0 leading-tight">
              <h1 className="text-xl font-bold">MA’S DE COZTA</h1>
              <p className="text-xs">Ma’s De cozta (PVT)LTD</p>
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
          <div className="relative flex-1 flex flex-col px-6 py-10 space-y-6 leading-tight">
            {/* Invoice Title */}
            <div className="text-center py-4 border-b leading-tight">
              <h2 className="text-2xl font-bold text-[#025291]">INVOICE</h2>
              <p className="text-[#025291]/50 text-sm">Ma’s De cozta (PVT)LTD</p>
            </div>

            {/* Details Section */}
            <div className="leading-tight">
              <table className="w-full border-collapse text-xs leading-tight">
                <tbody>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3 leading-tight">
                      Date
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3 leading-tight">{formatDate(transaction.date)}</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3 leading-tight">
                      Invoice No
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3 leading-tight">{transaction.invoiceNo}</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3 leading-tight">
                      Due Date
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3 leading-tight">{formatDate(transaction.dateOfExpiration)}</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3 leading-tight">
                      PO No
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3 leading-tight">{transaction.poNumber}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Shipping Section */}
            <div className="grid grid-cols-2 gap-6 leading-tight">
              <div className="leading-tight">
                <h3 className="font-bold text-[#025291] mb-2 text-sm">SHIP TO :</h3>
                <p className="text-sm">Ceylon Agro Industries,</p>
                <p className="text-sm">346, Negombo Road,</p>
                <p className="text-sm">Seeduwa.</p>
              </div>
              <div className="leading-tight">
                <h3 className="font-bold text-[#025291] mb-2 text-sm">TO :</h3>
                <p className="text-sm">Ceylon Agro Industries,</p>
                <p className="text-sm">346, Negombo Road,</p>
                <p className="text-sm">Seeduwa.</p>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 flex flex-col leading-tight">
              <table className="w-full border-collapse text-xs bg-transparent flex-1 leading-tight">
                <thead>
                  <tr className="bg-[#025291] text-white text-left leading-tight">
                    <th className="p-1 leading-tight">NO</th>
                    <th className="p-1 leading-tight">Description</th>
                    <th className="p-1 leading-tight">Quantity</th>
                    <th className="p-1 leading-tight">Unit Price</th>
                    <th className="p-1 leading-tight">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-white/80 leading-tight">
                    <td className="p-1 leading-tight">01</td>
                    <td className="p-1 font-semibold text-left leading-tight">
                      Scotch Bonnet (Nai Miris) Powder
                    </td>
                    <td className="p-1 leading-tight">{transaction.kilosDelivered}kg</td>
                    <td className="p-1 leading-tight">{unitPrice}LKR/kg</td>
                    <td className="p-1 text-right leading-tight">{transaction.amount.toLocaleString()}LKR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end leading-tight">
              <div className="w-64 text-xs bg-white/80 p-3 rounded leading-tight">
                <div className="flex justify-between py-1 border-b leading-tight">
                  <span>Sub Total :</span>
                  <span className="font-bold">{transaction.amount.toLocaleString()}LKR</span>
                </div>
                <div className="flex justify-between py-1 border-b leading-tight">
                  <span>Taxes :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between py-1 border-b leading-tight">
                  <span>Discount :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between font-bold py-1 leading-tight">
                  <span>Total Amount :</span>
                  <span>{transaction.amount.toLocaleString()}LKR</span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="leading-tight">
              <h3 className="font-bold text-[#025291] mb-2 text-xs">Bank Details</h3>
              <p className="text-xs leading-tight">
                <strong>Bank:</strong> Sampath Bank
              </p>
              <p className="text-xs leading-tight">
                <strong>Branch:</strong> Pannala
              </p>
              <p className="text-xs leading-tight">
                <strong>Account Name:</strong> Ma’s De Cozta Pvt Ltd
              </p>
              <p className="text-xs leading-tight">
                <strong>Account Number:</strong> 016610003145
              </p>
            </div>
          </div>
        </div>

        {/* Footer (sticks to bottom) */}
        <div>
          <div className="text-center py-4 bg-[#F5F9FD] leading-tight">
            <p className="text-base font-bold text-[#025291] leading-tight">
              Thank you for Business with us!
            </p>
            <p className="text-[#2B64A0] text-xs leading-tight">Ma’s De cozta (PVT)LTD</p>
          </div>
          <div className="bg-[#025291]">
            <div className="text-center py-2 text-xs text-white leading-tight">PV 00259719</div>
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