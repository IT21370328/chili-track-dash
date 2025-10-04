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
        style={{ width: "8.27in", minHeight: "11.69in" }} // A4 size in inches
      >
        {/* Header */}
        <div className="bg-[#025291] text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src={Logo}
              alt="Company Logo"
              className="w-16 h-16 object-contain bg-white rounded"
            />
            <div>
              <h1 className="text-2xl font-bold">MA’S DE COZTA</h1>
              <p className="text-sm">Ma’s De cozta (PVT)LTD</p>
            </div>
          </div>
          <div className="text-right text-sm">
            <p>39/3/5 A, Pannala Watta, Pannala</p>
            <p>+94 76 15 18 884 / +94 33 62 137</p>
            <p>decostamadu81924@gmail.com</p>
          </div>
        </div>

        {/* Background Pattern Section */}
        <div className="relative bg-gray-50">
          <div className="absolute inset-0 opacity-20">
            <img
              src={InvoiceBg}
              alt="Background pattern"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Invoice Title */}
          <div className="relative text-center py-10 border-b">
            <h2 className="text-3xl font-bold text-[#025291]">INVOICE</h2>
            <p className="text-[#025291]/50">Ma’s De cozta (PVT)LTD</p>
          </div>

          {/* Invoice Details Section */}
          <div className="relative grid grid-cols-1 px-6 py-6">
            <table className="w-full border-collapse text-sm">
              <tbody>
                {["Date", "Invoice No", "Due Date", "PO No"].map((item, i) => (
                  <tr key={i}>
                    <td className="bg-[#025291] text-white font-semibold px-4 py-2 w-1/4">
                      {item}
                    </td>
                    <td className="bg-[#C3E4FF] px-4 py-2"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Shipping Section */}
          <div className="relative grid grid-cols-2 gap-4 px-6 py-6">
            {["SHIP TO :", "TO :"].map((title, i) => (
              <div key={i}>
                <h3 className="font-bold text-[#025291] mb-1">{title}</h3>
                <p>Ceylon Agro Industries,</p>
                <p>346, Negombo Road,</p>
                <p>Seeduwa.</p>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="px-6">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#025291] text-white text-left">
                <th className="p-3">NO</th>
                <th className="p-3">Description</th>
                <th className="p-3">Quantity</th>
                <th className="p-3">Unit Price</th>
                <th className="p-3">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">01</td>
                <td className="p-3 font-semibold">
                  Scotch Bonnet (Nai Miris) Powder
                </td>
                <td className="p-3">30kg (30kgx1)</td>
                <td className="p-3">12,000LKR/kg</td>
                <td className="p-3">360,000LKR</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end p-6">
          <div className="w-72 text-sm">
            {[
              ["Sub Total :", "360,000LKR"],
              ["Taxes :", "0LKR"],
              ["Discount :", "0LKR"],
            ].map(([label, value], i) => (
              <div
                key={i}
                className={`flex justify-between py-2 ${i < 2 ? "border-b" : ""}`}
              >
                <span>{label}</span>
                <span className={i === 2 ? "font-bold" : ""}>{value}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold py-2">
              <span>Total Amount :</span>
              <span>360,000LKR</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="px-6 pb-6">
          <h3 className="font-bold text-[#025291] mb-2">Bank Details</h3>
          <p>
            <strong>Bank:</strong> Sampath Bank
          </p>
          <p>
            <strong>Branch:</strong> Pannala
          </p>
          <p>
            <strong>Account Name:</strong> Ma’s De Cozta Pvt Ltd
          </p>
          <p>
            <strong>Account Number:</strong> 016610003145
          </p>
        </div>

        {/* Footer */}
        <div className="text-center py-8 bg-[#F5F9FD]">
          <p className="text-lg font-bold text-[#025291]">
            Thank you for Business with us!
          </p>
          <p className="text-[#2B64A0]">Ma’s De cozta (PVT)LTD</p>
        </div>
        <div className="bg-[#025291]">
          <div className="text-center py-3 text-xs text-white">PV 00259719</div>
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
