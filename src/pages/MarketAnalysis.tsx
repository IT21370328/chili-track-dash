import { useRef } from "react";
import { useLocation } from "react-router-dom";
import Logo from "../../src/assets/logo.jpg";
import AnalysisBg from "../../src/assets/invoicebg.jpg";
import html2pdf from "html2pdf.js";

interface TransactionData {
  poNumber?: string;
  productName?: string;
  productCode?: string;
  kilosDelivered?: number;
  truckNo?: string;
  date?: string;
  dateOfExpiration?: string;
  batchCode?: string;
  numberOfBoxes?: number;
}

export default function CertificateOfAnalysis(): JSX.Element {
  const location = useLocation();
  const transaction: TransactionData = location.state?.transaction || {
    poNumber: "PO-2025-123",
    productName: "Scotch Bonnet Powder",
    productCode: "MASI00003",
    kilosDelivered: 30,
    truckNo: "",
    date: "2025-10-04",
    dateOfExpiration: "2026-10-04",
    batchCode: "",
    numberOfBoxes: 3,
  };

  const certRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
  };

  const handleDownload = (): void => {
    const element = certRef.current;
    if (!element) return;
    const opt = {
      margin: 0,
      filename: `${transaction.poNumber || "certificate-of-analysis"}.pdf`,
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
    <div className="flex flex-col items-center min-h-screen py-8">
      <div
        ref={certRef}
        className="bg-white border font-[Montserrat] flex flex-col justify-between"
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
              <h1 className="text-xl font-bold m-0 p-0">MA'S DE COZTA</h1>
              <p className="text-xs m-0 p-0">Ma's De cozta (PVT)LTD</p>
            </div>
          </div>
          <div className="text-left text-xs max-w-[3.5in]" style={{ lineHeight: 1 }}>
            <p className="m-0 p-0 flex items-center gap-2">
              <span>📍</span>
              <span>39/3/5 A, Pannala Watta, Pannala</span>
            </p>
            <p className="m-0 p-0 flex items-center gap-2 mt-1">
              <span>📞</span>
              <span>+94 76 15 18 884 / +94 33 62 137</span>
            </p>
            <p className="m-0 p-0 flex items-center gap-2 mt-1">
              <span>✉️</span>
              <span>decostamadu81924@gmail.com</span>
            </p>
          </div>
        </div>

        {/* Background + Content */}
        <div className="relative flex-1 flex flex-col">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-20">
            <img
              src={AnalysisBg}
              alt="Background pattern"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col px-6 py-4 space-y-3" style={{ lineHeight: 1 }}>
            {/* Title */}
            <div className="text-center py-2 border-b border-[#025291]" style={{ lineHeight: 1 }}>
              <h2 className="text-xl font-bold text-[#025291] -mt-2 p-0">CERTIFICATE OF ANALYSIS</h2>
            </div>

            {/* Certificate Info */}
            <div className="grid grid-cols-2 gap-4 text-xs" style={{ lineHeight: 1 }}>
              <div className="space-y-2" style={{ lineHeight: 1 }}>
                <p className="m-0 p-0">
                  <strong>Customer Name :</strong> Ceylon Agro Industries
                </p>
                <p className="m-0 p-0">
                  <strong>PO No :</strong> {transaction.poNumber}
                </p>
                <p className="m-0 p-0">
                  <strong>Product Name :</strong> Scotch Bonnet Powder
                </p>
                <p className="m-0 p-0">
                  <strong>Product Code :</strong> {transaction.productCode}
                </p>
                <p className="m-0 p-0">
                  <strong>Quantity :</strong> {transaction.kilosDelivered} kg
                </p>
                <p className="m-0 p-0">
                  <strong>Container / Truck Number :</strong> {transaction.truckNo}
                </p>
              </div>

              <div style={{ lineHeight: 1 }}>
                <table className="w-full border-collapse text-xs table-fixed border border-gray-300" style={{ lineHeight: 1 }}>
                  <thead>
                    <tr className="bg-[#025291] text-white text-center" style={{ lineHeight: 1 }}>
                      <th className="p-3 pb-4 border border-gray-300 m-0 p-0">Doc No.</th>
                      <th className="p-3 pb-4 border border-gray-300 m-0 p-0">QAP002</th>
                      <th className="p-3 pb-4 border border-gray-300 m-0 p-0">Certificate No</th>
                      <th className="p-3 pb-4 border border-gray-300 m-0 p-0">A2580</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center" style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">Date of Production</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">{formatDate(transaction.date || "")}</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">Date of Expiry</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">{formatDate(transaction.dateOfExpiration || "")}</td>
                    </tr>
                    <tr className="text-center" style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">Batch Code/s</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">{transaction.batchCode}</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">No. of Boxes</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 m-0 p-0">{transaction.numberOfBoxes}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analysis Table */}
            <div className="flex flex-col -mb-2" style={{ lineHeight: 1 }}>
              <h3 className="text-lg font-bold text-[#025291] mb-2 m-0 p-0">Analysis</h3>
              <div className="overflow-hidden">
                <table className="w-full border-collapse text-xs bg-transparent" style={{ lineHeight: 1 }}>
                  <thead>
                    <tr className="bg-[#025291] text-white text-left" style={{ lineHeight: 1 }}>
                      <th className="p-3 pb-4 m-0 p-0">Parameters</th>
                      <th className="p-3 pb-4 m-0 p-0">No of Samples</th>
                      <th className="p-3 pb-4 m-0 p-0">Average Test Result</th>
                      <th className="p-3 pb-4 m-0 p-0">Specifications</th>
                      <th className="p-3 pb-4 m-0 p-0">Test Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Physical Section */}
                    <tr>
                      <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3 pb-4 m-0 p-0">
                        Physical
                      </td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Appearance</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">3</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Match with the specifications</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Light brownish-green color powder</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Visually</td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Flavour</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">3</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Match with the specifications</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">
                        The characteristic extra pungent flavor
                      </td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Sensory</td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Aroma</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">3</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Match with the specifications</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">
                        Characteristic, mixed chili and fruity odor of scotch bonnets
                      </td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Sensory</td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Particle Size</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">3</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">100%, &lt; 50 mesh</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">100% through 50 mesh</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Vibratory Sifter</td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Foreign Matters</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">3</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Free</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Free</td>
                      <td className="p-3 pb-4 m-0 p-0bg-[#E9F5FF]">Visually</td>
                    </tr>

                    {/* Chemical Section */}
                    <tr>
                      <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3 pb-4 m-0 p-0">
                        Chemical
                      </td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Moisture Content</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">3</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">6.0%</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">8% Max.</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Electronic Moisture Analyzer</td>
                    </tr>

                    {/* Microbiological Section */}
                    <tr>
                      <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3 pb-4 m-0 p-0">
                        Microbiological
                      </td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Coliform</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">1</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">&lt;10</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">&lt;10 cfu/g</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">ISO 4831:2006</td>
                    </tr>
                    <tr style={{ lineHeight: 1 }}>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Foreign Matters</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">3</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Negative</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">Negative</td>
                      <td className="p-3 pb-4 m-0 p-0 bg-[#E9F5FF]">ISO 6579-1:2017</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Additional Remarks */}
            <div className="-mt-6">
            <div className="text-xs mt-2" style={{ lineHeight: 1 }}>
              <h3 className="font-bold text-[#025291] mb-2 m-0 p-0">Additional Remarks :</h3>
              <p className="m-0 p-0">
                We hereby certify that the aforementioned product meets the most
                recent Ma's De Cozta (Pvt) Ltd. product specifications and was
                produced in accordance with GMP principles
              </p>
            </div>
            </div>

            {/* Signatures */}
            <div className="mt-8 pt-11 flex justify-between text-center text-xs" style={{ lineHeight: 1 }}>
              <div className="w-1/4 border-t border-gray-300 pt-1 m-0 p-0">Quality Assurance Manager</div>
              <div className="w-1/4 border-t border-gray-300 pt-1 m-0 p-0">Production Manager</div>
              <div className="w-1/4 border-t border-gray-300 pt-1 m-0 p-0">Date</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div>
          <div className="bg-[#025291]">
            <div className="text-center pb-4 text-xs text-white" style={{ lineHeight: 1 }}>PV 00259719</div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <div className="h-24"></div>
      <button
        onClick={handleDownload}
        className="px-6 py-2 bg-[#025291] text-white rounded-lg shadow hover:bg-[#013d6e] transition"
      >
        Download Certificate
      </button>
    </div>
  );
}