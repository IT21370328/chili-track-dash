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
        <div className="bg-[#025291] text-white p-6 flex justify-between items-start">
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
          <div className="relative flex-1 flex flex-col px-4 py-6 space-y-3">
            {/* Invoice Title */}
            <div className="text-center py-2 border-b">
              <h2 className="text-[80px] font-bold text-[#025291]">INVOICE</h2>
              <p className="text-[#025291]/50 text-sm">Ma’s De cozta (PVT)LTD</p>
            </div>

            {/* Details Section */}
            <div className="mt-6">
              <table className="w-full border-collapse text-xs">
                <tbody>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-2 py-2">
                      Date
                    </td>
                    <td className="bg-[#C3E4FF] px-2 py-1">October 04, 2025</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-2 py-2">
                      Invoice No
                    </td>
                    <td className="bg-[#C3E4FF] px-2 py-1">INV-2025-001</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-2 py-2">
                      Due Date
                    </td>
                    <td className="bg-[#C3E4FF] px-2 py-1">November 03, 2025</td>
                  </tr>
                  <tr>
                    <td className="bg-[#025291] text-white font-semibold px-2 py-2">
                      PO No
                    </td>
                    <td className="bg-[#C3E4FF] px-2 py-1">PO-2025-123</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Shipping Section */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="font-bold text-[#025291] mb-2 text-md">SHIP TO :</h3>
                <p className="text-md">Ceylon Agro Industries,</p>
                <p className="text-md">346, Negombo Road,</p>
                <p className="text-md">Seeduwa.</p>
              </div>
              <div>
                <h3 className="font-bold text-[#025291] mb-2 text-md">TO :</h3>
                <p className="text-md">Ceylon Agro Industries,</p>
                <p className="text-md">346, Negombo Road,</p>
                <p className="text-md">Seeduwa.</p>
              </div>
            </div>

            {/* Table */}
            <div className="flex-1 mt-6">
              <table className="w-full border-collapse text-md bg-transparent">
                <thead>
                  <tr className="bg-[#025291] text-white text-left">
                    <th className="p-2">NO</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Unit Price</th>
                    <th className="p-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b bg-white/80">
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
            <div className="flex mt-6">
              <div className="w-48 text-xs bg-white/80 p-2 rounded">
                <div className="flex justify-between py-2 border-b">
                  <span>Sub Total :</span>
                  <span className="font-bold">360,000LKR</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Taxes :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Discount :</span>
                  <span>0LKR</span>
                </div>
                <div className="flex justify-between font-bold py-2">
                  <span>Total Amount :</span>
                  <span>360,000LKR</span>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="mt-6">
              <h3 className="font-bold text-[#025291] mb-1 text-lg">Bank Details</h3>
              <p className="text-md">
                <strong>Bank:</strong> Sampath Bank
              </p>
              <p className="text-md">
                <strong>Branch:</strong> Pannala
              </p>
              <p className="text-md">
                <strong>Account Name:</strong> Ma’s De Cozta Pvt Ltd
              </p>
              <p className="text-md">
                <strong>Account Number:</strong> 016610003145
              </p>
            </div>
          </div>
        </div>

        {/* Footer (sticks to bottom) */}
        <div>
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
