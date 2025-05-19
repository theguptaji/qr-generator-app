"use client";

import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";
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


  const generateQRCodeDataURL = async (url: string) => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(url);
      return dataUrl;
    } catch (err) {
      console.error("Error generating QR code", err);
      return null;
    }
  };

  const handleTableAppQRs = async () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "b5",
    });

    for (let index = 0; index < tableNumber; index++) {
      if (index > 0) {
        doc.addPage();
      }
      // Navy background
      doc.setFillColor(20, 33, 61); // #14213d
      doc.rect(0, 0, 176, 250, "F");

      // White card with all corners rounded
      doc.setFillColor(bgColor);
      doc.roundedRect(10, 20, 156, 180, 20, 20, "F"); // all corners rounded

      // Header: Restaurant Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(qrColor);
      doc.text(restaurantName, 88, 40, { align: "center" });

      // Subtitle: Food Menu
      doc.setFont("helvetica", "normal");
      doc.setFontSize(16);
      doc.setTextColor(100, 116, 139); // Tailwind slate-500
      doc.text("Food Menu", 88, 50, { align: "center" });

      // QR Code
      const qrCodeURL = `https://api.kanriapps.com/table-app/${restaurantName}?table=${
        index + 1
      }`;
      const qrDataURL = await generateQRCodeDataURL(qrCodeURL);
      if (!qrDataURL) return;
      const imgProps = doc.getImageProperties(qrDataURL);
      const qrWidth = 90; // mm
      const qrHeight = (imgProps.height * qrWidth) / imgProps.width;
      const qrX = 88 - qrWidth / 2;
      const qrY = 60;
      doc.addImage(qrDataURL, "PNG", qrX, qrY, qrWidth, qrHeight);

      // Table Number
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(qrColor);
      doc.text(`Table no #${index + 1}`, 88, qrY + qrHeight + 16, {
        align: "center",
      });

      // Scan Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(18);
      doc.setTextColor(qrColor);
      doc.text(
        "Scan above QR to see menu/order food",
        88,
        qrY + qrHeight + 28,
        { align: "center" }
      );

      // Footer (navy bar)
      // doc.setFillColor(20, 33, 61); // #14213d
      // doc.rect(10, 250, 156, 30, "F"); // increase height for better spacing

      // Footer text: Centered 'Kanriapps POS' (no heart)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      // Measure width of both texts to center them as a group
      const kanriappsWidth = doc.getTextWidth("Kanriapps ");
      const posWidth = doc.getTextWidth("POS");
      const totalWidth = kanriappsWidth + posWidth;
      const startX = 88 - totalWidth / 2;
      doc.setTextColor(255, 255, 255);
      doc.text("Kanriapps ", startX, 215, { align: "left" });
      doc.setTextColor(252, 163, 17); // #fca311
      doc.text("POS", startX + kanriappsWidth, 215, { align: "left" });

      // Footer subtext
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(220, 220, 220);
      doc.text("made with love at Kanriapps.com", 88, 227, { align: "center" });
    }
    doc.save("table_qrs.pdf");
  };


  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 dark:bg-gray-900 md:justify-center md:gap-8 w-full px-1 sm:px-2 md:mx-8 my-2">
      {/* Left: Editing Controls */}
      <aside className="w-full max-w-md mx-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 sm:p-6 md:p-8 flex flex-col gap-4 sm:gap-6 md:gap-8 shadow-md rounded-lg">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-blue-600 text-center">Tabletop Editor</h2>
          <div className="space-y-4">
            <div>
              <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Restaurant Name</label>
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
              <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Table Number</label>
              <input
                type="number"
                min={1}
                value={tableNumber}
                onChange={e => setTableNumber(Number(e.target.value))}
                className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">QR Foreground Color</label>
              <input
                type="color"
                value={qrColor}
                onChange={e => setQrColor(e.target.value)}
                className="w-10 h-10 p-0 border-none bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Background Color</label>
              <input
                type="color"
                value={bgColor}
                onChange={e => setBgColor(e.target.value)}
                className="w-10 h-10 p-0 border-none bg-transparent"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-900 dark:text-gray-100">Font</label>
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
              onClick={handleTableAppQRs}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors shadow"
            >
              Download PDF
            </button>
          </div>
        </div>
      </aside>
      {/* Right: Live Preview */}
      <section className="flex-1 flex items-center justify-center p-2 sm:p-4 md:p-8 mx-0 sm:mx-2 md:mx-6 w-full">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md mx-auto">
          <div
            ref={qrRef}
            className="relative flex flex-col items-center w-full rounded-2xl shadow-2xl overflow-hidden"
            style={{
              background: "#14213d",
              width: "100%",
              maxWidth: 380,
              maxHeight: 540,
              minHeight: 320,
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