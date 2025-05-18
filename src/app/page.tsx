"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const fonts = [
  { label: "Sans", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Mono", value: "monospace" },
  { label: "Cursive", value: "cursive" },
];

export default function QRGeneratorPage() {
  const [restaurantName, setRestaurantName] = useState("Kanriapps");
  const [tableNumber, setTableNumber] = useState(1);
  const [qrColor, setQrColor] = useState("#2563eb"); // Tailwind blue-600
  const [bgColor, setBgColor] = useState("#fff");
  const [font, setFont] = useState("sans-serif");
  const qrRef = useRef<HTMLDivElement>(null);

  const qrValue = `https://kanriapps.com/t/${tableNumber}`;

  const handleDownloadPDF = async () => {
    if (!qrRef.current) return;
    const canvas = await html2canvas(qrRef.current, { backgroundColor: null });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: [300, 400] });
    pdf.addImage(imgData, "PNG", 0, 0, 300, 400);
    pdf.save(`kanriapps-table-${tableNumber}-qr.pdf`);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 md:justify-center md:gap-8 max-w-5xl w-full mx-2 md:mx-8 my-4">
      {/* Left: Editing Controls */}
      <aside className="w-full md:w-2/5 lg:w-1/3 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-8 flex flex-col gap-8 shadow-md">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Tabletop Editor</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium">Restaurant Name</label>
              <input
                type="text"
                value={restaurantName}
                onChange={e => setRestaurantName(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter restaurant name"
                maxLength={32}
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Table Number</label>
              <input
                type="number"
                min={1}
                value={tableNumber}
                onChange={e => setTableNumber(Number(e.target.value))}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">QR Foreground Color</label>
              <input
                type="color"
                value={qrColor}
                onChange={e => setQrColor(e.target.value)}
                className="w-10 h-10 p-0 border-none bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Background Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-10 h-10 p-0 border-none bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Font</label>
              <select
                value={font}
                onChange={e => setFont(e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {fonts.map(f => (
                  <option value={f.value} key={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow"
            >
              Download PDF
            </button>
          </div>
        </div>
      </aside>
      {/* Right: Live Preview */}
      <section className="flex-1 flex items-center justify-center p-8 mx-2 md:mx-6">
        <div className="w-full max-w-md">
          <div
            ref={qrRef}
            className="relative flex flex-col items-center w-full rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "#14213d",
              minHeight: 420,
              minWidth: 320,
              maxWidth: 380,
              maxHeight: 540,
              width: "100%",
            }}
          >
            {/* White Card */}
            <div
              className="w-full flex-1 rounded-b-2xl flex flex-col items-center pt-6 pb-4 px-4"
              style={{
                background: bgColor,
                minHeight: 400,
              }}
            >
              {/* Header */}
              <div className="flex flex-col items-center mb-2">
                <span
                  className="text-3xl font-extrabold"
                  style={{ color: qrColor, letterSpacing: 1, fontFamily: font }}
                >
                  {restaurantName}
                </span>
                <span className="text-base font-semibold text-gray-500 tracking-wide" style={{ fontFamily: font }}>
                  Food Menu
                </span>
              </div>
              {/* QR Code */}
              <div className="my-4 bg-white p-2 rounded-lg shadow-md">
                <QRCodeCanvas
                  value={`https://api.kanriapps.com/table-app/${restaurantName}?table=${tableNumber}`}
                  size={180}
                  bgColor="#fff"
                  fgColor="#000"
                  level="H"
                />
              </div>
              {/* Table Number */}
              <div
                className="text-lg font-bold mb-2"
                style={{ color: qrColor, fontFamily: font }}
              >
                Table no #{tableNumber}
              </div>
              {/* Scan Text */}
              <div
                className="text-center text-sm mb-2"
                style={{ color: qrColor, fontFamily: font }}
              >
                Scan above QR to see menu/order food
              </div>
            </div>
            {/* Footer */}
            <div className="w-full bg-[#14213d] py-2 flex flex-col items-center">
              <span className="text-white font-bold text-lg tracking-wide flex items-center gap-1">
                Kanriapps <span className="text-orange-400">❤️</span>{" "}
                <span className="text-[#fca311] font-extrabold">POS</span>
              </span>
              <span className="text-xs text-gray-300 mt-1">
                made with love at Kanriapps.com
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}