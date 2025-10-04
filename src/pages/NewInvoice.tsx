export default function Invoice() {
  return (
    <div className="bg-white w-[900px] mx-auto shadow-lg rounded-lg overflow-hidden border">
      {/* Header */}
      <div className="bg-[#0B2D6D] text-white p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          {/* Logo Placeholder */}
          <img
            src="/sample-logo.png"
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
        {/* Placeholder for patterned background image */}
        <div className="absolute inset-0 opacity-20">
          <img
            src="/sample-bg.png"
            alt="Background pattern"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Invoice Title */}
        <div className="relative text-center py-10 border-b">
          <h2 className="text-3xl font-bold text-[#0B2D6D]">INVOICE</h2>
          <p className="text-[#2B64A0]">Ma’s De cozta (PVT)LTD</p>
        </div>

        {/* Invoice Details Section */}
        <div className="relative grid grid-cols-1 p-6">
          <table className="w-full border-collapse text-sm">
            <tbody>
              <tr>
                <td className="bg-[#0B2D6D] text-white font-semibold px-4 py-2 w-1/4">Date</td>
                <td className="bg-[#E9F2FA] px-4 py-2">__________</td>
              </tr>
              <tr>
                <td className="bg-[#0B2D6D] text-white font-semibold px-4 py-2">Invoice No</td>
                <td className="bg-[#E9F2FA] px-4 py-2">__________</td>
              </tr>
              <tr>
                <td className="bg-[#0B2D6D] text-white font-semibold px-4 py-2">Due Date</td>
                <td className="bg-[#E9F2FA] px-4 py-2">__________</td>
              </tr>
              <tr>
                <td className="bg-[#0B2D6D] text-white font-semibold px-4 py-2">PO No</td>
                <td className="bg-[#E9F2FA] px-4 py-2">__________</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Shipping Section */}
        <div className="relative grid grid-cols-2 gap-4 p-6">
          <div>
            <h3 className="font-bold text-[#0B2D6D] mb-1">SHIP TO :</h3>
            <p>Ceylon Agro Industries,</p>
            <p>346, Negombo Road,</p>
            <p>Seeduwa.</p>
          </div>
          <div>
            <h3 className="font-bold text-[#0B2D6D] mb-1">TO :</h3>
            <p>Ceylon Agro Industries,</p>
            <p>346, Negombo Road,</p>
            <p>Seeduwa.</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[#0B2D6D] text-white text-left">
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
            <td className="p-3 font-semibold">Scotch Bonnet (Nai Miris) Powder</td>
            <td className="p-3">30kg (30kgx1)</td>
            <td className="p-3">12,000LKR/kg</td>
            <td className="p-3">360,000LKR</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end p-6">
        <div className="w-72 text-sm">
          <div className="flex justify-between border-b py-2">
            <span>Sub Total :</span>
            <span className="font-bold">360,000LKR</span>
          </div>
          <div className="flex justify-between border-b py-2">
            <span>Taxes :</span>
            <span>0LKR</span>
          </div>
          <div className="flex justify-between border-b py-2">
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
      <div className="p-6">
        <h3 className="font-bold text-[#0B2D6D] mb-2">Bank Details</h3>
        <p><strong>Bank:</strong> Sampath Bank</p>
        <p><strong>Branch:</strong> Pannala</p>
        <p><strong>Account Name:</strong> Ma’s De Cozta Pvt Ltd</p>
        <p><strong>Account Number:</strong> 016610003145</p>
      </div>

      {/* Footer */}
      <div className="text-center py-8 bg-[#F5F9FD]">
        <p className="text-lg font-bold text-[#0B2D6D]">Thank you for Business with us!</p>
        <p className="text-[#2B64A0]">Ma’s De cozta (PVT)LTD</p>
      </div>
      <div className="text-center py-2 text-xs text-gray-600">
        PV 00259719
      </div>
    </div>
  );
}
