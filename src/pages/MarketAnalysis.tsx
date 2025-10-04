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
        <div className="relative text-center py-10 border-b">
          <h2 className="text-3xl font-bold text-[#025291]">
            CERTIFICATE OF ANALYSIS
          </h2>
        </div>

        {/* Certificate Info */}
        <div className="relative px-6 py-6 grid grid-cols-2 gap-6 text-sm">
          <div>
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
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-[#025291] text-white">
                  <th className="p-2">Doc No.</th>
                  <th className="p-2">QAP002</th>
                  <th className="p-2">Certificate No</th>
                  <th className="p-2">A2580</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="bg-[#C3E4FF] p-2">Date of Production</td>
                  <td className="bg-[#C3E4FF] p-2"></td>
                  <td className="bg-[#C3E4FF] p-2">Date of Expiry</td>
                  <td className="bg-[#C3E4FF] p-2"></td>
                </tr>
                <tr>
                  <td className="bg-[#C3E4FF] p-2">Batch Code/s</td>
                  <td className="bg-[#C3E4FF] p-2"></td>
                  <td className="bg-[#C3E4FF] p-2">No. of Boxes</td>
                  <td className="bg-[#C3E4FF] p-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Analysis Table */}
        <div className="relative px-6 py-6">
          <h3 className="text-lg font-bold text-[#025291] mb-2">Analysis</h3>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#025291] text-white text-left">
                <th className="p-2">Parameters</th>
                <th className="p-2">No of Samples</th>
                <th className="p-2">Average Test Result</th>
                <th className="p-2">Specifications</th>
                <th className="p-2">Test Method</th>
              </tr>
            </thead>
            <tbody>
              {/* Physical Section */}
              <tr>
                <td colSpan={5} className="bg-[#C3E4FF] font-bold p-2">
                  Physical
                </td>
              </tr>
              <tr>
                <td className="p-2">Appearance</td>
                <td className="p-2">3</td>
                <td className="p-2">Match with the specifications</td>
                <td className="p-2">Light brownish-green color powder</td>
                <td className="p-2">Visually</td>
              </tr>
              <tr>
                <td className="p-2">Flavour</td>
                <td className="p-2">3</td>
                <td className="p-2">Match with the specifications</td>
                <td className="p-2">
                  The characteristic extra pungent flavor
                </td>
                <td className="p-2">Sensory</td>
              </tr>
              <tr>
                <td className="p-2">Aroma</td>
                <td className="p-2">3</td>
                <td className="p-2">Match with the specifications</td>
                <td className="p-2">
                  Characteristic, mixed chili and fruity odor of scotch bonnets
                </td>
                <td className="p-2">Sensory</td>
              </tr>
              <tr>
                <td className="p-2">Particle Size</td>
                <td className="p-2">3</td>
                <td className="p-2">100%, &lt; 50 mesh</td>
                <td className="p-2">100% through 50 mesh</td>
                <td className="p-2">Vibratory Sifter</td>
              </tr>
              <tr>
                <td className="p-2">Foreign Matters</td>
                <td className="p-2">3</td>
                <td className="p-2">Free</td>
                <td className="p-2">Free</td>
                <td className="p-2">Visually</td>
              </tr>

              {/* Chemical Section */}
              <tr>
                <td colSpan={5} className="bg-[#C3E4FF] font-bold p-2">
                  Chemical
                </td>
              </tr>
              <tr>
                <td className="p-2">Moisture Content</td>
                <td className="p-2">3</td>
                <td className="p-2">6.0%</td>
                <td className="p-2">8% Max.</td>
                <td className="p-2">Electronic MoistureAnalyzer</td>
              </tr>

              {/* Microbiological Section */}
              <tr>
                <td colSpan={5} className="bg-[#C3E4FF] font-bold p-2">
                  Microbiological
                </td>
              </tr>
              <tr>
                <td className="p-2">Coliform</td>
                <td className="p-2">1</td>
                <td className="p-2">&lt;10</td>
                <td className="p-2">&lt;10 cfu/g</td>
                <td className="p-2">ISO 4831:2006</td>
              </tr>
              <tr>
                <td className="p-2">Foreign Matters</td>
                <td className="p-2">3</td>
                <td className="p-2">Negative</td>
                <td className="p-2">Negative</td>
                <td className="p-2">ISO 6579-1:2017</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Additional Remarks */}
        <div className="relative px-6 py-6 text-sm">
          <h3 className="font-bold text-[#025291] mb-2">Additional Remarks :</h3>
          <p>
            We hereby certify that the aforementioned product meets the most
            recent Ma’s De Cozta (Pvt) Ltd. product specifications and was
            produced in accordance with GMP principles
          </p>
        </div>

        {/* Signatures */}
        <div className="relative px-6 py-10 flex justify-between text-center text-sm">
          <div className="w-1/4 border-t">Quality Assurance Manager</div>
          <div className="w-1/4 border-t">Production Manager</div>
          <div className="w-1/4 border-t">Date</div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#025291]">
        <div className="text-center py-3 text-xs text-white">PV 00259719</div>
      </div>
    </div>
  );
}
