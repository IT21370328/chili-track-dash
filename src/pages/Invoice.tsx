import React from 'react';

// Data Mockup for the Invoice
const invoiceData = {
  company: {
    name: "MA'S DE COZTA",
    address: "39/3/3 A, Pannala Watta, Pannala",
    phone: "+94 76 15 98 886 / +94 33 62 137",
    email: "decoztamadu.0199245@gmail.com",
    logo: "https://i.imgur.com/your-logo-image.png" // Replace with your actual logo URL/path
  },
  details: {
    invoiceNo: '###',
    date: '###',
    dueDate: '###',
    poNo: '###',
  },
  shipTo: {
    name: "Ceylon Agro Industries,",
    street: "346,",
    city: "Negombo Road,",
    country: "Seeduwa.",
  },
  to: {
    name: "Ceylon Agro Industries,",
    street: "346,",
    city: "Negombo Road,",
    country: "Seeduwa.",
  },
  items: [
    {
      no: '01',
      description: 'Scotch Bonnet (Nai Miris) Powder',
      quantity: '30kg (30kgx1)',
      unitPrice: '12,000LKR/kg',
      amount: '360,000LKR',
    }
  ],
  totals: {
    subTotal: '360,000LKR',
    taxes: '0LKR', // Assuming 0LKR for exact match of the image
    discount: '0LKR', // Assuming 0LKR for exact match of the image
    totalAmount: '360,000LKR',
  },
  bank: {
    bank: 'Sampath Bank',
    branch: 'Pannala',
    accountName: "Ma's De Cozta Pvt Ltd",
    accountNumber: '016610003145',
  },
  pvNumber: 'PV 002599719'
};

const Invoice = () => {
  const { company, details, shipTo, to, items, totals, bank, pvNumber } = invoiceData;

  // Utility component for a field block (Date, Invoice No, etc.)
  const DetailField = ({ label, value }) => (
    <div className="flex">
      <div className="w-1/4 py-2 px-4 font-semibold text-sm bg-blue-100/50 border-r border-blue-500/20">{label}</div>
      <div className="w-3/4 py-2 px-4 text-sm bg-blue-100/30">
        {value === '###' ? <span className="text-gray-400">Insert Data</span> : value}
      </div>
    </div>
  );

  // Utility component for address
  const AddressBlock = ({ title, data }) => (
    <div className="w-1/2 p-6">
      <h3 className="text-lg font-bold text-gray-700 mb-2">{title}</h3>
      <div className="text-sm font-medium">
        <p>{data.name}</p>
        <p>{data.street}</p>
        <p>{data.city}</p>
        <p>{data.country}</p>
      </div>
    </div>
  );

  // Utility component for Total Rows
  const TotalRow = ({ label, value, isTotal = false }) => (
    <div className={`flex justify-between items-center py-1.5 ${isTotal ? 'font-extrabold text-lg pt-4' : 'font-semibold text-sm'}`}>
      <span className="w-1/2 text-right pr-4">{label}</span>
      <span className="w-1/2 text-left pl-4 border-l border-gray-300 text-right pr-2">
        {isTotal ? (
          <span className="text-white bg-blue-500 px-3 py-1.5 rounded-sm">{value}</span>
        ) : (
          <span className={`${value === '0LKR' ? 'text-gray-400' : 'text-gray-700'} tracking-wider`}>
            {value}
          </span>
        )}
      </span>
    </div>
  );


  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 bg-white shadow-xl font-sans tracking-wide">
      {/* -------------------- HEADER SECTION -------------------- */}
      <div className="flex justify-between items-center border-b-8 border-blue-900/10 pb-4 mb-4">
        <div className="flex items-center space-x-4">
          {/* Logo - Placeholder used */}
          <div className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center text-white text-xs">
            {/* The provided image uses a circular logo with a green base. */}
            <span className="text-white font-bold">Logo</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-blue-900">{company.name}</h1>
            <p className="text-sm font-semibold text-gray-700">{company.name} (PVT)LTD</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-600 font-medium space-y-0.5">
          <p>{company.address}</p>
          <p>{company.phone}</p>
          <p>{company.email}</p>
        </div>
      </div>

      {/* -------------------- INVOICE TITLE -------------------- */}
      <div className="text-center py-4 bg-gray-50/70 border-b-2 border-t-2 border-blue-500/50 mb-6">
        <h2 className="text-3xl font-extrabold text-blue-800">INVOICE</h2>
        <p className="text-sm font-medium text-gray-600">{company.name} (PVT)LTD</p>
      </div>

      {/* -------------------- INVOICE DETAILS BLOCK -------------------- */}
      <div className="grid grid-cols-2 gap-0 mb-8 border border-blue-500/20">
        <div className="border-r border-blue-500/20">
          <DetailField label="Date" value={details.date} />
          <DetailField label="Invoice No" value={details.invoiceNo} />
        </div>
        <div>
          <DetailField label="Due Date" value={details.dueDate} />
          <DetailField label="PO No" value={details.poNo} />
        </div>
      </div>

      {/* -------------------- ADDRESS BLOCKS -------------------- */}
      <div className="flex mb-8 border border-gray-200 bg-gray-50/50 rounded-lg">
        <AddressBlock title="SHIP TO :" data={shipTo} />
        <AddressBlock title="TO :" data={to} />
      </div>

      {/* -------------------- ITEM TABLE -------------------- */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-8">
        {/* Table Header */}
        <div className="flex font-bold text-white bg-blue-600">
          <div className="w-1/12 py-3 px-2 text-center">NO</div>
          <div className="w-5/12 py-3 px-4">Description</div>
          <div className="w-2/12 py-3 px-2 text-center">Quantity</div>
          <div className="w-2/12 py-3 px-2 text-right">Unit Price</div>
          <div className="w-2/12 py-3 px-4 text-right">Amount</div>
        </div>
        
        {/* Table Body */}
        {items.map((item, index) => (
          <div key={index} className="flex text-gray-700 border-t border-gray-200 odd:bg-white even:bg-blue-50/50">
            <div className="w-1/12 py-3 px-2 text-center text-sm">{item.no}</div>
            <div className="w-5/12 py-3 px-4 text-sm">{item.description}</div>
            <div className="w-2/12 py-3 px-2 text-center text-sm">{item.quantity}</div>
            <div className="w-2/12 py-3 px-2 text-right text-sm">{item.unitPrice}</div>
            <div className="w-2/12 py-3 px-4 text-right font-semibold text-sm">{item.amount}</div>
          </div>
        ))}
      </div>

      {/* -------------------- BANK DETAILS & TOTALS -------------------- */}
      <div className="flex justify-between">
        {/* Bank Details */}
        <div className="w-1/2 pr-12">
          <h3 className="text-xl font-extrabold text-blue-800 mb-3">Bank Details</h3>
          <div className="space-y-2 text-gray-700 text-sm">
            <div className="flex">
              <span className="w-1/3 font-semibold">Bank</span>
              <span className="w-2/3">: {bank.bank}</span>
            </div>
            <div className="flex">
              <span className="w-1/3 font-semibold">Branch</span>
              <span className="w-2/3">: {bank.branch}</span>
            </div>
            <div className="flex">
              <span className="w-1/3 font-semibold">Account Name</span>
              <span className="w-2/3">: {bank.accountName}</span>
            </div>
            <div className="flex">
              <span className="w-1/3 font-semibold">Account Number</span>
              <span className="w-2/3 font-bold">{bank.accountNumber}</span>
            </div>
          </div>
        </div>

        {/* Totals Box */}
        <div className="w-1/2 p-4 bg-gray-50 border border-gray-300">
          <TotalRow label="Sub Total" value={totals.subTotal} />
          <TotalRow label="Taxes" value={totals.taxes} />
          <TotalRow label="Discount" value={totals.discount} />
          <div className="border-t border-dashed border-gray-400 my-2"></div>
          <TotalRow label="Total Amount" value={totals.totalAmount} isTotal={true} />
        </div>
      </div>

      {/* -------------------- FOOTER -------------------- */}
      <div className="mt-12 pt-8 text-center">
        <h3 className="text-2xl font-bold text-gray-700">Thank you for Business with us!</h3>
        <p className="text-lg font-semibold text-gray-500 mt-1">{company.name} (PVT)LTD</p>
        <div className="mt-8 text-xs text-gray-400">
          {pvNumber}
        </div>
      </div>
    </div>
  );
};

export default Invoice;