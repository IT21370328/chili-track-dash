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
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff'
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
        className="bg-white font-[Montserrat] flex flex-col justify-between"
        style={{
          width: "8.27in",
          height: "11.69in", // Exact A4 size
          margin: 0,
          padding: 0,
          border: "none",
          boxSizing: "border-box",
          lineHeight: 1,
          fontSize: '16px'
        }}
      >
        {/* Header */}
        <div className="bg-[#025291] text-white p-4 flex justify-between items-start" style={{ lineHeight: 1 }}>
          <div className="flex items-start gap-2">
            <img
              src={Logo}
              alt="Company Logo"
              className="w-12 h-12 object-contain bg-white rounded flex-shrink-0"
            />
            <div className="flex-shrink-0" style={{ lineHeight: 1 }}>
              <h1 className="text-xl font-bold m-0 p-0">MA’S DE COZTA</h1>
              <p className="text-xs m-0 p-0">Ma’s De cozta (PVT)LTD</p>
            </div>
          </div>
          <div className="text-right text-xs max-w-[3.5in]" style={{ lineHeight: 1 }}>
            <p className="m-0 p-0">39/3/5 A, Pannala Watta, Pannala</p>
            <p className="m-0 p-0">+94 76 15 18 884 / +94 33 62 137</p>
            <p className="m-0 p-0">decostamadu81924@gmail.com</p>
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
          <div className="relative flex-1 flex flex-col px-6 py-10 space-y-6" style={{ lineHeight: 1 }}>
            {/* Invoice Title */}
            <div className="text-center py-4 border-b" style={{ lineHeight: 1 }}>
              <h2 className="text-3xl font-bold text-[#025291] m-0 p-0">INVOICE</h2>
              <p className="text-[#025291]/50 text-sm m-0 p-0">Ma’s De cozta (PVT)LTD</p>
            </div>

            {/* Details Section */}
            <div style={{ lineHeight: 1 }}>
              <table className="w-full border-collapse text-xs" style={{ lineHeight: 1 }}>
                <tbody>
                  <tr className="pb-3">
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3" style={{ lineHeight: 1 }}>
                      Date
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3" style={{ lineHeight: 1 }}>{formatDate(transaction.date)}</td>
                  </tr>
                  <tr className="pb-3">
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3" style={{ lineHeight: 1 }}>
                      Invoice No
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3" style={{ lineHeight: 1 }}>{transaction.invoiceNo}</td>
                  </tr>
                  <tr className="pb-3">
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3" style={{ lineHeight: 1 }}>
                      Due Date
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3" style={{ lineHeight: 1 }}>{formatDate(transaction.dateOfExpiration)}</td>
                  </tr>
                  <tr className="pb-3">
                    <td className="bg-[#025291] text-white font-semibold px-3 py-3" style={{ lineHeight: 1 }}>
                      PO No
                    </td>
                    <td className="bg-[#C3E4FF] px-3 py-3" style={{ lineHeight: 1 }}>{transaction.poNumber}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Shipping Section */}
            <div className="grid grid-cols-2 gap-6" style={{ lineHeight: 1 }}>
              <div style={{ lineHeight: 1 }}>
                <h3 className="font-bold text-[#025291] mb-2 text-sm m-0 p-0">SHIP TO :</h3>
                <p className="text-sm m-0 p-0">Ceylon Agro Industries,</p>
                <p className="text-sm m-0 p-0">346, Negombo Road,</p>
                <p className="text-sm m-0 p-0">Seeduwa.</p>
              </div>
              <div style={{ lineHeight: 1 }}>
                <h3 className="font-bold text-[#025291] mb-2 text-sm m-0 p-0">TO :</h3>
                <p className="text-sm m-0 p-0">Ceylon Agro Industries,</p>
                <p className="text-sm m-0 p-0">346, Negombo Road,</p>
                <p className="text-sm m-0 p-0">Seeduwa.</p>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 flex flex-col" style={{ lineHeight: 1 }}>
              <table className="w-full border-collapse text-xs bg-transparent flex-1" style={{ lineHeight: 1 }}>
                <thead>
                  <tr className="bg-[#025291] text-white text-left" style={{ lineHeight: 1 }}>
                    <th className="p-1 pb-6" style={{ lineHeight: 1 }}>NO</th>
                    <th className="p-1 pb-6" style={{ lineHeight: 1 }}>Description</th>
                    <th className="p-1 pb-6" style={{ lineHeight: 1 }}>Quantity</th>
                    <th className="p-1 pb-6" style={{ lineHeight: 1 }}>Unit Price</th>
                    <th className="p-1 pb-6" style={{ lineHeight: 1 }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-white/80" style={{ lineHeight: 1 }}>
                    <td className="p-1" style={{ lineHeight: 1 }}>01</td>
                    <td className="p-1 font-semibold text-left" style={{ lineHeight: 1 }}>
                      Scotch Bonnet (Nai Miris) Powder
                    </td>
                    <td className="p-1" style={{ lineHeight: 1 }}>{transaction.kilosDelivered}kg</td>
                    <td className="p-1" style={{ lineHeight: 1 }}>{unitPrice}LKR/kg</td>
                    <td className="p-1 text-right" style={{ lineHeight: 1 }}>{transaction.amount.toLocaleString()}LKR</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end" style={{ lineHeight: 1 }}>
              <div className="w-64 text-xs bg-white/80 p-3 rounded" style={{ lineHeight: 1 }}>
                <div className="flex justify-between py-1 border-b" style={{ lineHeight: 1 }}>
                  <span>Sub Total :</span>
                  <span className="font-bold">{transaction.amount.toLocaleString()}LKR</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ lineHeight: 1 }}>
                  <span>Taxes :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between py-1 border-b" style={{ lineHeight: 1 }}>
                  <span>Discount :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between font-bold py-1" style={{ lineHeight: 1 }}>
                  <span>Total Amount :</span>
                  <span>{transaction.amount.toLocaleString()}LKR</span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div style={{ lineHeight: 1 }}>
              <h3 className="font-bold text-[#025291] mb-2 text-xs m-0 p-0">Bank Details</h3>
              <p className="text-xs m-0 p-0">
                <strong>Bank:</strong> Sampath Bank
              </p>
              <p className="text-xs m-0 p-0">
                <strong>Branch:</strong> Pannala
              </p>
              <p className="text-xs m-0 p-0">
                <strong>Account Name:</strong> Ma’s De Cozta Pvt Ltd
              </p>
              <p className="text-xs m-0 p-0">
                <strong>Account Number:</strong> 016610003145
              </p>
            </div>
          </div>
        </div>

        {/* Footer (sticks to bottom) */}
        <div>
          <div className="text-center py-4 bg-[#F5F9FD]" style={{ lineHeight: 1 }}>
            <p className="text-2xl font-bold text-[#025291] m-0 p-0">
              Thank you for Business with us!
            </p>
            <p className="text-[#2B64A0] text-xs m-0 p-0">Ma’s De cozta (PVT)LTD</p>
          </div>
          <div className="bg-[#025291] pb-4">
            <div className="text-center py-2 text-xs text-white" style={{ lineHeight: 1 }}>PV 00259719</div>
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