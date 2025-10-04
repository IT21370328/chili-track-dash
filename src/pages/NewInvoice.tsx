import React from 'react';
import { useState } from 'react';
// Assuming the 'generateInvoice' function is imported from a separate file,
// e.g., import { generateInvoice } from './pdfGenerator';
// For this example, I will keep the PDF code right after the React component for completeness.

// ***************************************************************
// 1. DATA MOCKUP (Keep this as is)
// ***************************************************************
const invoiceData = {
  company: {
    name: "MA'S DE COZTA",
    address: "39/3/3 A, Pannala Watta, Pannala",
    phone: "+94 76 15 98 886 / +94 33 62 137",
    email: "decoztamadu.0199245@gmail.com",
    logo: "https://i.imgur.com/your-logo-image.png" // Replace with your actual logo URL/path
  },
  details: {
    invoiceNo: '12345',
    date: '2025-10-04',
    dueDate: '2025-11-04',
    poNo: 'PO-9876',
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
    taxes: '0LKR',
    discount: '0LKR',
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

// ***************************************************************
// 2. REACT COMPONENT (Invoice)
// ***************************************************************

// Interface/Type for the data needed by the PDF generator
interface PrimaTransaction {
  id: number;
  invoiceNo: string;
  poNumber: string;
  date: string;
  kilosDelivered: number;
  amount: number;
  paymentStatus: "Pending" | "Approved" | "Paid" | "Rejected";
}


const Invoice = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { company, details, shipTo, to, items, totals, bank, pvNumber } = invoiceData;

  // Function to prepare data and call the PDF generator
  const handleGeneratePdf = () => {
    setIsGenerating(true);

    // Prepare a mock transaction object that the PDF function expects
    const transactionToPdf: PrimaTransaction = {
      id: 1,
      invoiceNo: details.invoiceNo,
      poNumber: details.poNo,
      date: details.date,
      // NOTE: You need to parse the actual numerical values from the mock strings
      kilosDelivered: 30, // From '30kg' in mock data
      amount: 360000, // From '360,000LKR' in mock data
      paymentStatus: 'Approved',
    };

    // Call the PDF generation function
    generateInvoice(transactionToPdf, () => {
      // This is the onGenerate callback
      setIsGenerating(false);
      console.log('PDF generation complete!');
    });
  };

  // Utility component for a field block (Date, Invoice No, etc.)
  const DetailField = ({ label, value }: { label: string, value: string }) => (
    <div className="flex">
      <div className="w-1/4 py-2 px-4 font-semibold text-sm bg-blue-100/50 border-r border-blue-500/20">{label}</div>
      <div className="w-3/4 py-2 px-4 text-sm bg-blue-100/30">
        {value === '###' ? <span className="text-gray-400">Insert Data</span> : value}
      </div>
    </div>
  );

  // Utility component for address
  const AddressBlock = ({ title, data }: { title: string, data: typeof shipTo }) => (
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
  const TotalRow = ({ label, value, isTotal = false }: { label: string, value: string, isTotal?: boolean }) => (
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
      {/* -------------------- GENERATE PDF BUTTON (New Addition) -------------------- */}
      <div className="text-center mb-6">
        <button
          onClick={handleGeneratePdf}
          disabled={isGenerating}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-150 disabled:opacity-50"
        >
          {isGenerating ? 'Generating PDF...' : 'Download PDF Invoice'}
        </button>
      </div>
      
      {/* -------------------- HEADER SECTION -------------------- */}
      <div className="flex justify-between items-center border-b-8 border-blue-900/10 pb-4 mb-4">
        <div className="flex items-center space-x-4">
          {/* Logo - Placeholder used */}
          <div className="w-14 h-14 bg-green-700 rounded-full flex items-center justify-center text-white text-xs">
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

// ***************************************************************
// 3. PDF GENERATION FUNCTION (Kept here for single-file solution)
// ***************************************************************
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Note: The original implementation of generateInvoice already includes 
// the onGenerate function logic. I'm keeping the original function body.

export const generateInvoice = (transaction: PrimaTransaction, onGenerate?: () => void) => {
  const doc = new jsPDF('portrait', 'mm', 'a4'); // Using mm for units
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Header Section ---
  doc.setFillColor(39, 90, 161); // Darker blue from the image
  doc.rect(0, 0, pageWidth, 25, 'F'); 

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255); 
  doc.text("MA'S DE COZTA", 25, 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De cozta (PVT)LTD", 25, 15);

  // Placeholder for the small green logo circle
  doc.setFillColor(85, 172, 85); 
  doc.circle(12, 12, 6, 'F'); 
  doc.setTextColor(255, 255, 255); 
  doc.setFontSize(6);
  doc.text("MDC", 10.5, 13);

  // Header Contact Info (Top Right)
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text('39/3/3 A, Pannala Watta, Pannala', pageWidth - 5, 8, { align: 'right' });
  doc.text('+94 70 15 98 886 / +94 33 62 137', pageWidth - 5, 13, { align: 'right' });
  doc.text('decoztamadu01974@gmail.com', pageWidth - 5, 18, { align: 'right' });

  // --- Invoice Title ---
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(50, 50, 50); 
  doc.text('INVOICE', pageWidth / 2, 40, { align: 'center' });
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De cozta (PVT)LTD", pageWidth / 2, 46, { align: 'center' });

  // --- Invoice Details Table-like Section ---
  const detailBoxX = 10;
  const detailBoxY = 55;
  const detailBoxWidth = pageWidth - 2 * detailBoxX;
  const detailRowHeight = 8;
  const labelWidth = 30; 

  // Headers (Date, Invoice No, Due Date, PO No)
  doc.setFillColor(210, 235, 255); 
  doc.rect(detailBoxX, detailBoxY, labelWidth, detailRowHeight * 4, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Date', detailBoxX + 2, detailBoxY + 5);
  doc.text('Invoice No', detailBoxX + 2, detailBoxY + 5 + detailRowHeight);
  doc.text('Due Date', detailBoxX + 2, detailBoxY + 5 + detailRowHeight * 2);
  doc.text('PO No', detailBoxX + 2, detailBoxY + 5 + detailRowHeight * 3);

  // Values (Dynamic Data)
  doc.setFillColor(235, 245, 255); 
  doc.rect(detailBoxX + labelWidth, detailBoxY, detailBoxWidth - labelWidth, detailRowHeight * 4, 'F');
  doc.setTextColor(50, 50, 50);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`${new Date(transaction.date).toLocaleDateString('en-GB')}`, detailBoxX + labelWidth + 2, detailBoxY + 5);
  doc.text(`${transaction.invoiceNo}`, detailBoxX + labelWidth + 2, detailBoxY + 5 + detailRowHeight);
  doc.text('N/A', detailBoxX + labelWidth + 2, detailBoxY + 5 + detailRowHeight * 2);
  doc.text(`${transaction.poNumber}`, detailBoxX + labelWidth + 2, detailBoxY + 5 + detailRowHeight * 3);

  // --- SHIP TO / TO sections ---
  const addressBlockY = detailBoxY + detailRowHeight * 4 + 10;
  const col1X = 10;
  const col2X = pageWidth / 2;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('SHIP TO :', col1X, addressBlockY);
  doc.text('TO :', col2X, addressBlockY);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ceylon Agro Industries,', col1X, addressBlockY + 6);
  doc.text('346,', col1X, addressBlockY + 11);
  doc.text('Negombo Road,', col1X, addressBlockY + 16);
  doc.text('Seeduwa.', col1X, addressBlockY + 21);

  doc.text('Ceylon Agro Industries,', col2X, addressBlockY + 6);
  doc.text('346,', col2X, addressBlockY + 11);
  doc.text('Negombo Road,', col2X, addressBlockY + 16);
  doc.text('Seeduwa.', col2X, addressBlockY + 21);

  // --- ITEMS TABLE ---
  autoTable(doc, {
    startY: addressBlockY + 30, 
    head: [['NO', 'Description', 'Quantity', 'Unit Price', 'Amount']],
    body: [
      [
        '01',
        'Scotch Bonnet (Nai Miris) Powder',
        `${transaction.kilosDelivered}kg (${transaction.kilosDelivered}kgx1)`,
        `${(transaction.amount / transaction.kilosDelivered).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR/kg`,
        `${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR`
      ]
    ],
    theme: 'plain', 
    styles: {
      fontSize: 9,
      cellPadding: 2,
      textColor: [50, 50, 50],
      lineColor: [200, 200, 200], 
      lineWidth: 0.1,
    },
    headStyles: {
      fillColor: [39, 90, 161], 
      textColor: [255, 255, 255], 
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center', 
      lineColor: [39, 90, 161],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 70 },
      2: { halign: 'right', cellWidth: 30 },
      3: { halign: 'right', cellWidth: 30 },
      4: { halign: 'right', cellWidth: 30 },
    },
    margin: { left: 10, right: 10 }
  });

  const finalY = (doc as any).lastAutoTable.finalY;

  // --- Totals Section ---
  const totalsXLabel = pageWidth - 60; 
  const totalsXValue = pageWidth - 10; 
  const totalsBlockY = finalY + 5;
  const totalRowSpacing = 5;

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  // Sub Total
  doc.setFont('helvetica', 'normal');
  doc.text('Sub Total', totalsXLabel, totalsBlockY);
  doc.text(`${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR`, totalsXValue, totalsBlockY, { align: 'right' });

  // Taxes
  doc.text('Taxes', totalsXLabel, totalsBlockY + totalRowSpacing);
  doc.text(`0.00LKR`, totalsXValue, totalsBlockY + totalRowSpacing, { align: 'right' });

  // Discount
  doc.text('Discount', totalsXLabel, totalsBlockY + totalRowSpacing * 2);
  doc.text(`0.00LKR`, totalsXValue, totalsBlockY + totalRowSpacing * 2, { align: 'right' });

  // Total Amount 
  doc.setFont('helvetica', 'bold');
  doc.text('Total Amount', totalsXLabel, totalsBlockY + totalRowSpacing * 3);
  doc.text(`${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}LKR`, totalsXValue, totalsBlockY + totalRowSpacing * 3, { align: 'right' });

  // --- Bank Details and Thank You Message ---
  const bottomSectionY = totalsBlockY + totalRowSpacing * 3 + 15;
  const bankDetailsX = 10;

  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('Thank you for Business with us!', pageWidth / 2, bottomSectionY, { align: 'center' });
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text("Ma's De cozta (PVT)LTD", pageWidth / 2, bottomSectionY + 5, { align: 'center' });

  // Bank Details 
  const bankBoxY = bottomSectionY + 15;
  const bankBoxHeight = 40;
  doc.setFillColor(235, 245, 255); 
  doc.rect(bankDetailsX, bankBoxY, pageWidth / 2 - bankDetailsX - 5, bankBoxHeight, 'F'); 

  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Details', bankDetailsX + 2, bankBoxY + 5);

  doc.setFont('helvetica', 'normal');
  doc.text('Bank', bankDetailsX + 5, bankBoxY + 12);
  doc.text(': Sampath Bank', bankDetailsX + 30, bankBoxY + 12);
  doc.text('Branch', bankDetailsX + 5, bankBoxY + 17);
  doc.text(': Pannala', bankDetailsX + 30, bankBoxY + 17);
  doc.text('Account Name', bankDetailsX + 5, bankBoxY + 22);
  doc.text(`: Ma's De Cozta Pvt Ltd`, bankDetailsX + 30, bankBoxY + 22);
  doc.text('Account Number', bankDetailsX + 5, bankBoxY + 27);
  doc.text(': 016610003145', bankDetailsX + 30, bankBoxY + 27);

  // Footer PV number 
  doc.setFillColor(39, 90, 161); 
  doc.rect(0, pageHeight - 10, pageWidth, 10, 'F');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('PV 00259719', pageWidth / 2, pageHeight - 5, { align: 'center' });

  // Trigger download
  try {
    doc.save(`invoice_${transaction.invoiceNo}.pdf`);
    console.log('Invoice generated successfully');
  } catch (error) {
    console.error('Error saving PDF:', error);
  }

  // Call the optional callback function
  if (onGenerate) onGenerate(); 
};