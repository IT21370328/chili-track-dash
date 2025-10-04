import { useRef } from "react";
import Logo from "../../src/assets/logo.jpg";
import InvoiceBg from "../../src/assets/invoicebg.jpg";
import html2pdf from "html2pdf.js";

export default function Invoice() {
  const invoiceRef = useRef();

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0,
      filename: "invoice.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={invoiceRef}
        className="relative bg-white font-[Montserrat] flex flex-col justify-between"
        style={{
          width: "8.27in",
          height: "11.69in", // A4 size
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <img
            src={InvoiceBg}
            alt="Invoice Background"
            className="w-full h-full object-cover opacity-40"
          />
        </div>

        {/* Header */}
        <div className="relative bg-[#025291] text-white p-4 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <img src={Logo} alt="Logo" className="w-12 h-12 bg-white rounded" />
            <div>
              <h1 className="text-xl font-bold">MA’S DE COZTA</h1>
              <p className="text-xs">Ma’s De cozta (PVT)LTD</p>
            </div>
          </div>
          <div className="text-right text-xs leading-tight">
            <p>39/3/5 A, Pannala Watta, Pannala</p>
            <p>+94 76 15 18 884 / +94 33 62 137</p>
            <p>decostamadu81924@gmail.com</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex-1 flex flex-col px-6 py-4">
          {/* Title */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-[#025291]">INVOICE</h2>
            <p className="text-sm text-[#025291]/70">
              Ma’s De cozta (PVT)LTD
            </p>
          </div>

          {/* Details Table */}
          <table className="w-full text-xs mb-4 border-collapse">
            <tbody>
              <tr className="bg-white/70">
                <td className="bg-[#025291] text-white font-semibold px-2 py-1">
                  Date
                </td>
                <td className="px-2 py-1">October 04, 2025</td>
              </tr>
              <tr className="bg-white/70">
                <td className="bg-[#025291] text-white font-semibold px-2 py-1">
                  Invoice No
                </td>
                <td className="px-2 py-1">INV-2025-001</td>
              </tr>
              <tr className="bg-white/70">
                <td className="bg-[#025291] text-white font-semibold px-2 py-1">
                  Due Date
                </td>
                <td className="px-2 py-1">November 03, 2025</td>
              </tr>
              <tr className="bg-white/70">
                <td className="bg-[#025291] text-white font-semibold px-2 py-1">
                  PO No
                </td>
                <td className="px-2 py-1">PO-2025-123</td>
              </tr>
            </tbody>
          </table>

          {/* Shipping */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/70 p-2">
              <h3 className="font-bold text-[#025291] mb-1 text-xs">SHIP TO :</h3>
              <p className="text-xs">Ceylon Agro Industries,</p>
              <p className="text-xs">346, Negombo Road,</p>
              <p className="text-xs">Seeduwa.</p>
            </div>
            <div className="bg-white/70 p-2">
              <h3 className="font-bold text-[#025291] mb-1 text-xs">TO :</h3>
              <p className="text-xs">Ceylon Agro Industries,</p>
              <p className="text-xs">346, Negombo Road,</p>
              <p className="text-xs">Seeduwa.</p>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse text-xs mb-4">
            <thead>
              <tr className="bg-[#025291] text-white">
                <th className="p-2 text-left">NO</th>
                <th className="p-2 text-left">Description</th>
                <th className="p-2 text-left">Quantity</th>
                <th className="p-2 text-left">Unit Price</th>
                <th className="p-2 text-left">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white/70 border-b">
                <td className="p-2">01</td>
                <td className="p-2 font-semibold">
                  Scotch Bonnet (Nai Miris) Powder
                </td>
                <td className="p-2">30kg (30kgx1)</td>
                <td className="p-2">12,000LKR/kg</td>
                <td className="p-2">360,000LKR</td>
              </tr>
            </tbody>
          </table>

          {/* Totals + Bank Details */}
          <div className="grid grid-cols-2 gap-4">
            {/* Bank */}
            <div className="bg-white/70 p-2">
              <h3 className="font-bold text-[#025291] mb-1 text-xs">Bank Details</h3>
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

            {/* Totals */}
            <div className="bg-white/70 p-2">
              <div className="flex justify-between border-b py-1">
                <span>Sub Total :</span>
                <span className="font-bold">360,000LKR</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Taxes :</span>
                <span>0LKR</span>
              </div>
              <div className="flex justify-between border-b py-1">
                <span>Discount :</span>
                <span>0LKR</span>
              </div>
              <div className="flex justify-between py-1 font-bold">
                <span>Total Amount :</span>
                <span>360,000LKR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <div className="text-center py-3 bg-white/70">
            <p className="text-sm font-bold text-[#025291]">
              Thank you for Business with us!
            </p>
            <p className="text-xs text-[#025291]/80">Ma’s De cozta (PVT)LTD</p>
          </div>
          <div className="bg-[#025291] text-white text-center text-xs py-1">
            PV 00259719
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
