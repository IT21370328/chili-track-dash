export default function Invoice() {
  return (
    <div className="bg-white w-[800px] mx-auto shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-blue-900 text-white p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">MA’S DE COZTA</h1>
          <p className="text-sm">Ma’s De cozta (PVT)LTD</p>
        </div>
        <div className="text-right text-sm">
          <p>39/3/5 A, Pannala Watta, Pannala</p>
          <p>+94 76 15 18 884 / +94 33 62 137</p>
          <p>decostamadu81924@gmail.com</p>
        </div>
      </div>

      {/* Invoice Title */}
      <div className="text-center py-6 border-b">
        <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
        <p className="text-blue-600">Ma’s De cozta (PVT)LTD</p>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-4 p-6">
        <div className="bg-blue-100 p-4 rounded">
          <p><strong>Date:</strong> __________</p>
          <p><strong>Invoice No:</strong> __________</p>
          <p><strong>Due Date:</strong> __________</p>
          <p><strong>PO No:</strong> __________</p>
        </div>
        <div className="flex justify-between text-sm">
          <div>
            <h3 className="font-bold text-blue-900">SHIP TO :</h3>
            <p>Ceylon Agro Industries,</p>
            <p>346, Negombo Road,</p>
            <p>Seeduwa.</p>
          </div>
          <div>
            <h3 className="font-bold text-blue-900">TO :</h3>
            <p>Ceylon Agro Industries,</p>
            <p>346, Negombo Road,</p>
            <p>Seeduwa.</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white text-left">
            <th className="p-2">NO</th>
            <th className="p-2">Description</th>
            <th className="p-2">Quantity</th>
            <th className="p-2">Unit Price</th>
            <th className="p-2">Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border">
            <td className="p-2">01</td>
            <td className="p-2">Scotch Bonnet (Nai Miris) Powder</td>
            <td className="p-2">30kg (30kgx1)</td>
            <td className="p-2">12,000LKR/kg</td>
            <td className="p-2">360,000LKR</td>
          </tr>
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end p-6">
        <div className="w-64 text-sm">
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
          <div className="flex justify-between font-bold py-1">
            <span>Total Amount :</span>
            <span>360,000LKR</span>
          </div>
        </div>
      </div>

      {/* Bank Details */}
      <div className="p-6">
        <h3 className="font-bold text-blue-900 mb-2">Bank Details</h3>
        <p><strong>Bank:</strong> Sampath Bank</p>
        <p><strong>Branch:</strong> Pannala</p>
        <p><strong>Account Name:</strong> Ma’s De Cozta Pvt Ltd</p>
        <p><strong>Account Number:</strong> 016610003145</p>
      </div>

      {/* Footer */}
      <div className="text-center py-6 bg-blue-50">
        <p className="text-lg font-bold text-blue-900">Thank you for Business with us!</p>
        <p className="text-blue-600">Ma’s De cozta (PVT)LTD</p>
      </div>
    </div>
  );
}
