"use client";

import { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";
import html2canvas from "html2canvas";
import { FontSelector } from "@/components/FontSelector";

// Color palettes for QR and background
const qrColorPalette = [
  { name: "Blue", value: "#2563eb" },
  { name: "Green", value: "#16a34a" },
  { name: "Purple", value: "#7c3aed" },
  { name: "Red", value: "#dc2626" },
  { name: "Orange", value: "#ea580c" },
  { name: "Teal", value: "#0d9488" },
  { name: "Pink", value: "#db2777" },
  { name: "Indigo", value: "#4f46e5" },
  { name: "Cyan", value: "#0891b2" },
  { name: "Lime", value: "#65a30d" },
  { name: "Amber", value: "#d97706" },
  { name: "Rose", value: "#e11d48" },
];

const bgColorPalette = [
  { name: "White", value: "#ffffff" },
  { name: "Light Gray", value: "#f3f4f6" },
  { name: "Warm Gray", value: "#fafaf9" },
  { name: "Light Blue", value: "#eff6ff" },
  { name: "Light Green", value: "#f0fdf4" },
  { name: "Light Purple", value: "#faf5ff" },
  { name: "Light Pink", value: "#fdf2f8" },
  { name: "Light Yellow", value: "#fefce8" },
  { name: "Light Orange", value: "#fff7ed" },
  { name: "Light Teal", value: "#f0fdfa" },
  { name: "Light Rose", value: "#fff1f2" },
  { name: "Light Indigo", value: "#eef2ff" },
];

export default function QRGeneratorPage() {
  const [restaurantName, setRestaurantName] = useState("Kanriapps");
  const [tableNumber, setTableNumber] = useState(1);
  const [qrColor, setQrColor] = useState("#2563eb");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Montserrat");
  const qrRef = useRef<HTMLDivElement>(null);

  // Load template settings if available
  useEffect(() => {
    const savedTemplate = localStorage.getItem("selectedTemplate");
    if (savedTemplate) {
      const template = JSON.parse(savedTemplate);
      setFont(template.font);
      setQrColor(template.qrColor);
      setBgColor(template.bgColor);
      // Clear the saved template
      localStorage.removeItem("selectedTemplate");
    }
  }, []);

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
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`tabletop-${restaurantName}-${tableNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      {/* Left: Editing Controls (Sidebar in desktop) */}
      <Card className="w-full lg:w-96 lg:min-h-[calc(100vh-4rem)] lg:rounded-none lg:border-r lg:border-b-0 border-b bg-white dark:bg-gray-900 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <CardHeader className="px-4 lg:px-6">
          <CardTitle className="text-xl sm:text-2xl text-blue-600 text-center">
            Tabletop Editor
          </CardTitle>
        </CardHeader>
        <CardContent className="px-4 lg:px-6 flex-1">
          <div className="space-y-4">
            <div>
              <Label htmlFor="restaurantName" className="mb-2">
                Restaurant Name
              </Label>
              <Input
                id="restaurantName"
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Enter restaurant name"
                maxLength={32}
              />
            </div>
            <div>
              <Label htmlFor="tableNumber" className="mb-2">
                Table Number
              </Label>
              <Input
                id="tableNumber"
                type="number"
                min={1}
                value={tableNumber}
                onChange={(e) => setTableNumber(Number(e.target.value))}
              />
            </div>
            {/* QR Color Palette */}
            <div className="space-y-1.5">
              <Label className="mb-1.5">QR Color</Label>
              <div className="grid grid-cols-6 gap-1">
                {qrColorPalette.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setQrColor(color.value)}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${
                      qrColor === color.value
                        ? "border-blue-500 scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Background Color Palette */}
            <div className="space-y-1.5">
              <Label className="mb-1.5">Background Color</Label>
              <div className="grid grid-cols-6 gap-1">
                {bgColorPalette.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setBgColor(color.value)}
                    className={`w-7 h-7 rounded-md border-2 transition-all ${
                      bgColor === color.value
                        ? "border-blue-500 scale-105"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <FontSelector selectedFont={font} onFontChange={setFont} />
            <Button className="mt-4 w-full" onClick={handleTableAppQRs}>
              Download PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Right: Live Preview (Main content area) */}
      <section className="flex-1 flex items-center justify-center p-4 lg:p-8 bg-gray-50 dark:bg-gray-900">
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
                <span
                  className="text-base font-semibold text-gray-500 tracking-wide"
                  style={{ fontFamily: font }}
                >
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
                className="text-sm text-gray-500"
                style={{ fontFamily: font }}
              >
                Scan to view menu
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
