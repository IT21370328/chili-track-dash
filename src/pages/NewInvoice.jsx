import { useRef } from "react";
import Logo from "../../src/assets/logo.jpg";
import InvoiceBg from "../../src/assets/invoicebg.jpg";
import html2pdf from "html2pdf.js";

export default function Invoice() {
  const invoiceRef = useRef();

  const handleDownload = () => {
    const element = invoiceRef.current;
    const opt = {
      margin: 0.5, // inches
      filename: "invoice.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex flex-col items-center">
      {/* Invoice */}
      <div
        ref={invoiceRef}
        className="bg-white shadow-lg rounded-lg overflow-hidden border font-[Montserrat]"
        style={{ width: "8.27in", height: "11.69in" }} // Exact A4 size in inches to ensure one page
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
          <div className="text-right text-xs leading-tight">
            <p>39/3/5 A, Pannala Watta, Pannala</p>
            <p>+94 76 15 18 884 / +94 33 62 137</p>
            <p>decostamadu81924@gmail.com</p>
          </div>
        </div>

        {/* Background Pattern Section */}
        <div className="relative bg-gray-50 h-[2.5in]">
          <div className="absolute inset-0 opacity-20">
            <img
              src={InvoiceBg}
              alt="Background pattern"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Invoice Title */}
          <div className="relative text-center py-4 border-b">
            <h2 className="text-2xl font-bold text-[#025291]">INVOICE</h2>
            <p className="text-[#025291]/50 text-sm">Ma’s De cozta (PVT)LTD</p>
          </div>

          {/* Invoice Details Section */}
          <div className="relative grid grid-cols-2 gap-2 px-4 py-4">
            <table className="w-full border-collapse text-xs">
              <tbody>
                <tr>
                  <td className="bg-[#025291] text-white font-semibold px-2 py-1 w-full">
                    Date
                  </td>
                  <td className="bg-[#C3E4FF] px-2 py-1">October 04, 2025</td>
                </tr>
                <tr>
                  <td className="bg-[#025291] text-white font-semibold px-2 py-1 w-full">
                    Invoice No
                  </td>
                  <td className="bg-[#C3E4FF] px-2 py-1">INV-2025-001</td>
                </tr>
                <tr>
                  <td className="bg-[#025291] text-white font-semibold px-2 py-1 w-full">
                    Due Date
                  </td>
                  <td className="bg-[#C3E4FF] px-2 py-1">November 03, 2025</td>
                </tr>
                <tr>
                  <td className="bg-[#025291] text-white font-semibold px-2 py-1 w-full">
                    PO No
                  </td>
                  <td className="bg-[#C3E4FF] px-2 py-1">PO-2025-123</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Shipping Section */}
          <div className="relative grid grid-cols-2 gap-4 px-4 py-4">
            <div>
              <h3 className="font-bold text-[#025291] mb-1 text-xs">SHIP TO :</h3>
              <p className="text-xs">Ceylon Agro Industries,</p>
              <p className="text-xs">346, Negombo Road,</p>
              <p className="text-xs">Seeduwa.</p>
            </div>
            <div>
              <h3 className="font-bold text-[#025291] mb-1 text-xs">TO :</h3>
              <p className="text-xs">Ceylon Agro Industries,</p>
              <p className="text-xs">346, Negombo Road,</p>
              <p className="text-xs">Seeduwa.</p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 py-2 overflow-hidden">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="bg-[#025291] text-white text-left">
                <th className="p-2">NO</th>
                <th className="p-2">Description</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Unit Price</th>
                <th className="p-2">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="border-b">
                <td className="p-2">01</td>
                <td className="p-2 font-semibold text-left">
                  Scotch Bonnet (Nai Miris) Powder
                </td>
                <td className="p-2">30kg</td>
                <td className="p-2">12,000LKR/kg</td>
                <td className="p-2 text-right">360,000LKR</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end px-4 py-2">
          <div className="w-48 text-xs">
            <div className="flex justify-between py-1 border-b">
              <span>Sub Total :</span>
              <span>360,000LKR</span>
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
              <span>360,000LKR</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="px-4 py-2">
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

        {/* Footer */}
        <div className="text-center py-4 bg-[#F5F9FD]">
          <p className="text-sm font-bold text-[#025291]">
            Thank you for Business with us!
          </p>
          <p className="text-[#2B64A0] text-xs">Ma’s De cozta (PVT)LTD</p>
        </div>
        <div className="bg-[#025291]">
          <div className="text-center py-2 text-xs text-white">PV 00259719</div>
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