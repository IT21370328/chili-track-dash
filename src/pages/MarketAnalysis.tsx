import { useRef } from "react";
import { useLocation } from "react-router-dom";
import Logo from "../../src/assets/logo.jpg";
import AnalysisBg from "../../src/assets/invoicebg.jpg";
import html2pdf from "html2pdf.js";

interface CertificateData {
  poNumber?: string;
  productName?: string;
  productCode?: string;
  amount?: number;
  truckNo?: string;
  date?: string;
  dateOfExpiration?: string;
  batchCode?: string;
  numberOfBoxes?: number;

}

export default function CertificateOfAnalysis(): JSX.Element {
  const location = useLocation();
  const certificate: CertificateData = location.state?.certificate || {
    poNumber: "PO-2025-123",
    productName: "Scotch Bonnet Powder",
    productCode: "MASI00003",
    quantity: 30,
    containerTruckNumber: "",
    dateOfProduction: "2025-10-04",
    dateOfExpiry: "2026-10-04",
    batchCodes: "",
    noOfBoxes: 3,
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
      filename: "certificate-of-analysis.pdf",
      image: { type: "png" as const, quality: 1 },
      html2canvas: { 
        scale: 2, 
        useCORS: true, 
        allowTaint: true, 
        letterRendering: true 
      },
      jsPDF: { unit: "in" as const, format: "a4" as const, orientation: "portrait" as const },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={certRef}
        className="bg-white border font-[Montserrat] flex flex-col justify-between leading-tight"
        style={{
          width: "8.27in",
          height: "11.69in", // Exact A4 size
          margin: 0,
          padding: 0,
        }}
      >
        {/* Header */}
        <div className="bg-[#025291] text-white p-4 flex justify-between items-start leading-tight">
          <div className="flex items-start gap-2">
            <img
              src={Logo}
              alt="Company Logo"
              className="w-12 h-12 object-contain bg-white rounded flex-shrink-0"
            />
            <div className="flex-shrink-0 leading-tight">
              <h1 className="text-xl font-bold">MA’S DE COZTA</h1>
              <p className="text-xs">Ma’s De cozta (PVT)LTD</p>
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
              src={AnalysisBg}
              alt="Background pattern"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Main Content */}
          <div className="relative flex-1 flex flex-col px-6 py-10 space-y-6 leading-tight pb-8">
            {/* Title */}
            <div className="text-center py-4 border-b border-[#025291] leading-tight">
              <h2 className="text-2xl font-bold text-[#025291]">CERTIFICATE OF ANALYSIS</h2>
            </div>

            {/* Certificate Info */}
            <div className="grid grid-cols-2 gap-6 text-xs leading-tight">
              <div className="space-y-3 leading-tight">
                <p className="leading-tight">
                  <strong>Customer Name :</strong> Ceylon Agro Industries
                </p>
                <p className="leading-tight">
                  <strong>PO No :</strong> {certificate.poNumber}
                </p>
                <p className="leading-tight">
                  <strong>Product Name :</strong> {certificate.productName}
                </p>
                <p className="leading-tight">
                  <strong>Product Code :</strong> {certificate.productCode}
                </p>
                <p className="leading-tight">
                  <strong>Quantity :</strong> {certificate.amount} kg
                </p>
                <p className="leading-tight">
                  <strong>Container / Truck Number :</strong> {certificate.truckNo}
                </p>
              </div>

              <div className="leading-tight">
                <table className="w-full border-collapse text-xs table-fixed border border-gray-300 leading-tight">
                  <thead>
                    <tr className="bg-[#025291] text-white text-center leading-tight">
                      <th className="p-3 pb-4 border border-gray-300 leading-tight">Doc No.</th>
                      <th className="p-3 pb-4 border border-gray-300 leading-tight">QAP002</th>
                      <th className="p-3 pb-4 border border-gray-300 leading-tight">Certificate No</th>
                      <th className="p-3 pb-4 border border-gray-300 leading-tight">A2580</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center leading-tight">
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">Date of Production</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">{formatDate(certificate.date || "")}</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">Date of Expiry</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">{formatDate(certificate.dateOfExpiration || "")}</td>
                    </tr>
                    <tr className="text-center leading-tight">
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">Batch Code/s</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">{certificate.batchCode}</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">No. of Boxes</td>
                      <td className="p-3 pb-4 bg-[#C3E4FF] border border-gray-300 leading-tight">{certificate.numberOfBoxes}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analysis Table */}
            <div className="flex-1 leading-tight">
              <h3 className="text-lg font-bold text-[#025291] mb-2 leading-tight">Analysis</h3>
              <table className="w-full border-collapse text-xs bg-transparent flex-1 border border-gray-300 leading-tight">
                <thead>
                  <tr className="bg-[#025291] text-white text-left leading-tight">
                    <th className="p-3 pb-4 border border-gray-300 leading-tight">Parameters</th>
                    <th className="p-3 pb-4 border border-gray-300 leading-tight">No of Samples</th>
                    <th className="p-3 pb-4 border border-gray-300 leading-tight">Average Test Result</th>
                    <th className="p-3 pb-4 border border-gray-300 leading-tight">Specifications</th>
                    <th className="p-3 pb-4 border border-gray-300 leading-tight">Test Method</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Physical Section */}
                  <tr>
                    <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3 pb-4 border border-gray-300 leading-tight">
                      Physical
                    </td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Appearance</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">3</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Match with the specifications</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Light brownish-green color powder</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Visually</td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Flavour</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">3</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Match with the specifications</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">
                      The characteristic extra pungent flavor
                    </td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Sensory</td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Aroma</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">3</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Match with the specifications</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">
                      Characteristic, mixed chili and fruity odor of scotch bonnets
                    </td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Sensory</td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Particle Size</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">3</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">100%, &lt; 50 mesh</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">100% through 50 mesh</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Vibratory Sifter</td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Foreign Matters</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">3</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Free</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Free</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Visually</td>
                  </tr>

                  {/* Chemical Section */}
                  <tr>
                    <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3 pb-4 border border-gray-300 leading-tight">
                      Chemical
                    </td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Moisture Content</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">3</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">6.0%</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">8% Max.</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Electronic Moisture Analyzer</td>
                  </tr>

                  {/* Microbiological Section */}
                  <tr>
                    <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3 pb-4 border border-gray-300 leading-tight">
                      Microbiological
                    </td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Coliform</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">1</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">&lt;10</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">&lt;10 cfu/g</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">ISO 4831:2006</td>
                  </tr>
                  <tr className="leading-tight">
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Foreign Matters</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">3</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Negative</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">Negative</td>
                    <td className="p-3 pb-4 border border-gray-300 leading-tight">ISO 6579-1:2017</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Remarks */}
            <div className="text-xs leading-tight">
              <h3 className="font-bold text-[#025291] mb-2 leading-tight">Additional Remarks :</h3>
              <p className="leading-tight">
                We hereby certify that the aforementioned product meets the most
                recent Ma’s De Cozta (Pvt) Ltd. product specifications and was
                produced in accordance with GMP principles
              </p>
            </div>
            {/* Signatures */}
            <div className="flex justify-between text-center text-xs mt-12 leading-tight">
              <div className="w-1/4 border-t-2 border-gray-300 pt-6 leading-tight">Quality Assurance Manager</div>
              <div className="w-1/4 border-t-2 border-gray-300 pt-6 leading-tight">Production Manager</div>
              <div className="w-1/4 border-t-2 border-gray-300 pt-6 leading-tight">Date</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div>
          <div className="bg-[#025291]">
            <div className="text-center py-2 text-xs text-white leading-tight">PV 00259719</div>
          </div>
        </div>
      </div>

      {/* Download Button */}
      <button
        onClick={handleDownload}
        className="mt-6 px-6 py-2 bg-[#025291] text-white rounded-lg shadow hover:bg-[#013d6e] transition"
      >
        Download Certificate
      </button>
    </div>
  );
}