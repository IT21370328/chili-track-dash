import Logo from "../../src/assets/logo.jpg";
import AnalysisBg from "../../src/assets/invoicebg.jpg";

export default function CertificateOfAnalysis() {
  return (
    <div className="bg-white w-[900px] mx-auto shadow-lg rounded-lg overflow-hidden border font-[Montserrat]">
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
            src={AnalysisBg}
            alt="Background pattern"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Title */}
        <div className="relative text-center py-12 border-b">
          <h2 className="text-3xl font-bold text-[#025291]">
            CERTIFICATE OF ANALYSIS
          </h2>
        </div>

        {/* Certificate Info */}
        <div className="relative px-8 py-8 grid grid-cols-2 gap-6 text-sm space-y-3">
            <div className="space-y-3"> {/* Added space between lines */}
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
                <table className="w-full border-collapse text-sm table-fixed"> {/* table-fixed fixes column alignment */}
                <thead>
                    <tr className="bg-[#025291] text-white text-center"> {/* text-center for header */}
                    <th className="p-3">Doc No.</th>
                    <th className="p-3">QAP002</th>
                    <th className="p-3">Certificate No</th>
                    <th className="p-3">A2580</th>
                    </tr>
                </thead>
                <tbody>
                    <tr className="text-center"> {/* text-center for body */}
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
        <div className="relative px-8 py-8">
          <h3 className="text-lg font-bold text-[#025291] mb-2">Analysis</h3>
          <table className="w-full border-collapse text-sm">
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
        <div className="relative px-8 py-8 text-sm">
          <h3 className="font-bold text-[#025291] mb-2">Additional Remarks :</h3>
          <p>
            We hereby certify that the aforementioned product meets the most
            recent Ma’s De Cozta (Pvt) Ltd. product specifications and was
            produced in accordance with GMP principles
          </p>
        </div>

        {/* Signatures */}
        <div className="relative px-8 py-12 flex justify-between text-center text-sm">
          <div className="w-1/4 border-t">Quality Assurance Manager</div>
          <div className="w-1/4 border-t">Production Manager</div>
          <div className="w-1/4 border-t">Date</div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#025291]">
        <div className="text-center py-4 text-xs text-white">PV 00259719</div>
      </div>
    </div>
  );
}