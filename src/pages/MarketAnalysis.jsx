import { useRef } from "react";
import Logo from "../../src/assets/logo.jpg";
import AnalysisBg from "../../src/assets/invoicebg.jpg";
import html2pdf from "html2pdf.js";

export default function CertificateOfAnalysis() {
  const certRef = useRef();

  const handleDownload = () => {
    const element = certRef.current;
    const opt = {
      margin: 0,
      filename: "certificate-of-analysis.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={certRef}
        className="bg-white border font-[Montserrat] flex flex-col justify-between"
        style={{
          width: "8.27in",
          height: "11.69in", // Exact A4 size
          margin: 0,
          padding: 0,
        }}
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
          <div className="relative flex-1 flex flex-col px-6 py-10 space-y-6">
            {/* Title */}
            <div className="text-center py-4 border-b">
              <h2 className="text-2xl font-bold text-[#025291]">
                CERTIFICATE OF ANALYSIS
              </h2>
            </div>

            {/* Certificate Info */}
            <div className="grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-3">
                <p>
                  <strong>Customer Name :</strong> Ceylon Agro Industries
                </p>
                <p>
                  <strong>PO No :</strong>
                </p>
                <p>
                  <strong>Product Name :</strong> Scotch Bonnet Powder
                </p>
                <p>
                  <strong>Product Code :</strong> MASI00003
                </p>
                <p>
                  <strong>Quantity :</strong> 30 kg
                </p>
                <p>
                  <strong>Container / Truck Number :</strong>
                </p>
              </div>

              <div>
                <table className="w-full border-collapse text-xs table-fixed">
                  <thead>
                    <tr className="bg-[#025291] text-white text-center">
                      <th className="p-3">Doc No.</th>
                      <th className="p-3">QAP002</th>
                      <th className="p-3">Certificate No</th>
                      <th className="p-3">A2580</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="text-center">
                      <td className="bg-[#C3E4FF] p-3">Date of Production</td>
                      <td className="bg-[#C3E4FF] p-3"></td>
                      <td className="bg-[#C3E4FF] p-3">Date of Expiry</td>
                      <td className="bg-[#C3E4FF] p-3"></td>
                    </tr>
                    <tr className="text-center">
                      <td className="bg-[#C3E4FF] p-3">Batch Code/s</td>
                      <td className="bg-[#C3E4FF] p-3"></td>
                      <td className="bg-[#C3E4FF] p-3">No. of Boxes</td>
                      <td className="bg-[#C3E4FF] p-3"></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Analysis Table */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#025291] mb-2">Analysis</h3>
              <table className="w-full border-collapse text-xs bg-transparent flex-1">
                <thead>
                  <tr className="bg-[#025291] text-white text-left">
                    <th className="p-3">Parameters</th>
                    <th className="p-3">No of Samples</th>
                    <th className="p-3">Average Test Result</th>
                    <th className="p-3">Specifications</th>
                    <th className="p-3">Test Method</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Physical Section */}
                  <tr>
                    <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3">
                      Physical
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Appearance</td>
                    <td className="p-3">3</td>
                    <td className="p-3">Match with the specifications</td>
                    <td className="p-3">Light brownish-green color powder</td>
                    <td className="p-3">Visually</td>
                  </tr>
                  <tr>
                    <td className="p-3">Flavour</td>
                    <td className="p-3">3</td>
                    <td className="p-3">Match with the specifications</td>
                    <td className="p-3">
                      The characteristic extra pungent flavor
                    </td>
                    <td className="p-3">Sensory</td>
                  </tr>
                  <tr>
                    <td className="p-3">Aroma</td>
                    <td className="p-3">3</td>
                    <td className="p-3">Match with the specifications</td>
                    <td className="p-3">
                      Characteristic, mixed chili and fruity odor of scotch bonnets
                    </td>
                    <td className="p-3">Sensory</td>
                  </tr>
                  <tr>
                    <td className="p-3">Particle Size</td>
                    <td className="p-3">3</td>
                    <td className="p-3">100%, &lt; 50 mesh</td>
                    <td className="p-3">100% through 50 mesh</td>
                    <td className="p-3">Vibratory Sifter</td>
                  </tr>
                  <tr>
                    <td className="p-3">Foreign Matters</td>
                    <td className="p-3">3</td>
                    <td className="p-3">Free</td>
                    <td className="p-3">Free</td>
                    <td className="p-3">Visually</td>
                  </tr>

                  {/* Chemical Section */}
                  <tr>
                    <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3">
                      Chemical
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Moisture Content</td>
                    <td className="p-3">3</td>
                    <td className="p-3">6.0%</td>
                    <td className="p-3">8% Max.</td>
                    <td className="p-3">Electronic MoistureAnalyzer</td>
                  </tr>

                  {/* Microbiological Section */}
                  <tr>
                    <td colSpan={5} className="bg-[#C3E4FF] font-bold p-3">
                      Microbiological
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3">Coliform</td>
                    <td className="p-3">1</td>
                    <td className="p-3">&lt;10</td>
                    <td className="p-3">&lt;10 cfu/g</td>
                    <td className="p-3">ISO 4831:2006</td>
                  </tr>
                  <tr>
                    <td className="p-3">Foreign Matters</td>
                    <td className="p-3">3</td>
                    <td className="p-3">Negative</td>
                    <td className="p-3">Negative</td>
                    <td className="p-3">ISO 6579-1:2017</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Additional Remarks */}
            <div className="text-xs">
              <h3 className="font-bold text-[#025291] mb-2">Additional Remarks :</h3>
              <p>
                We hereby certify that the aforementioned product meets the most
                recent Ma’s De Cozta (Pvt) Ltd. product specifications and was
                produced in accordance with GMP principles
              </p>
            </div>

            {/* Signatures */}
            <div className="flex justify-between text-center text-xs">
              <div className="w-1/4 border-t pt-2">Quality Assurance Manager</div>
              <div className="w-1/4 border-t pt-2">Production Manager</div>
              <div className="w-1/4 border-t pt-2">Date</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div>
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
        Download Certificate
      </button>
    </div>
  );
}