import { useState } from "react";
import { Download, Plus } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function LabelGenerator() {
  const [designImage, setDesignImage] = useState<string | null>(null);

  const [labelForm, setLabelForm] = useState({
    mfg: "",
    exp: "",
    batch: "",
    weight: "1KG",
  });

  const [labels, setLabels] = useState<
    { id: number; mfg: string; exp: string; batch: string; weight: string }[]
  >([]);

  /* ================= UPLOAD DESIGN ================= */

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setDesignImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /* ================= ADD LABEL ================= */

  const handleAddLabel = () => {
    if (!labelForm.mfg || !labelForm.exp || !labelForm.batch) {
      alert("Fill all fields");
      return;
    }

    setLabels((prev) => [
      ...prev,
      { id: Date.now(), ...labelForm },
    ]);

    setLabelForm({
      mfg: "",
      exp: "",
      batch: "",
      weight: "1KG",
    });
  };

  /* ================= DOWNLOAD PDF ================= */

  const downloadPDF = async (label: any) => {
    const element = document.getElementById(`print-${label.id}`);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 3 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");

    const labelWidth = 95;
    const labelHeight = 55;

    let count = 0;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 2; col++) {
        const x = col * (labelWidth + 10) + 10;
        const y = row * (labelHeight + 10) + 10;

        pdf.addImage(imgData, "PNG", x, y, labelWidth, labelHeight);

        count++;
        if (count === 10) break;
      }
    }

    pdf.save(`Label_${label.batch}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 space-y-10">

      <h1 className="text-3xl font-bold">Label Generator (Preview Mode)</h1>

      {/* Upload Design */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">1️⃣ Upload Your Label Design</h2>
        <input type="file" accept="image/*" onChange={handleUpload} />
        {designImage && (
          <p className="text-green-600 text-sm">
            Design uploaded successfully
          </p>
        )}
      </div>

      {/* Add Label */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h2 className="font-semibold text-lg">2️⃣ Enter Label Details</h2>

        <div className="grid md:grid-cols-5 gap-4">
          <input
            type="date"
            value={labelForm.mfg}
            onChange={(e) =>
              setLabelForm({ ...labelForm, mfg: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            type="date"
            value={labelForm.exp}
            onChange={(e) =>
              setLabelForm({ ...labelForm, exp: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Batch Code"
            value={labelForm.batch}
            onChange={(e) =>
              setLabelForm({ ...labelForm, batch: e.target.value })
            }
            className="border p-2 rounded"
          />

          <input
            placeholder="Net Weight"
            value={labelForm.weight}
            onChange={(e) =>
              setLabelForm({ ...labelForm, weight: e.target.value })
            }
            className="border p-2 rounded"
          />

          <button
            onClick={handleAddLabel}
            className="bg-blue-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="grid md:grid-cols-2 gap-8">
        {labels.map((label) => (
          <div key={label.id} className="bg-white p-6 rounded-xl shadow space-y-4">

            <div
              id={`print-${label.id}`}
              className="relative w-full aspect-[16/9] border rounded-xl overflow-hidden"
            >
              {designImage && (
                <img
                  src={designImage}
                  alt="Design"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}

              {/* ================= ALIGNED TO RIGHT GREEN PANEL ================= */}

              <div className="absolute right-[8%] top-[52%] text-white font-semibold text-sm">
                {label.mfg}
              </div>

              <div className="absolute right-[8%] top-[59%] text-white font-semibold text-sm">
                {label.exp}
              </div>

              <div className="absolute right-[8%] top-[66%] text-white font-semibold text-sm">
                {label.batch}
              </div>

              <div className="absolute right-[30%] bottom-[10%] text-green-600 font-bold text-2xl">
                {label.weight}
              </div>

            </div>

            <button
              onClick={() => downloadPDF(label)}
              className="w-full bg-green-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
            >
              <Download size={16} /> Download PDF (10 per A4)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
