"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeCanvas } from "qrcode.react";
import jsPDF from "jspdf";
import QRCodeLib from "qrcode";
import html2canvas from "html2canvas";
import { FontSelector } from "@/components/FontSelector";
import MainLayout from "@/components/MainLayout";

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
  const [title, setTitle] = useState("Sample Title");
  const [subtitle, setSubtitle] = useState("Subtitle Text");
  const [qrLink, setQrLink] = useState("https://example.com");
  const [bottomText, setBottomText] = useState("Scan to learn more");
  const [additionalText, setAdditionalText] = useState("");
  const [qrColor, setQrColor] = useState("#2563eb");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Montserrat");
  const qrRef = useRef<HTMLDivElement>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

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
      // Create a new QR code canvas with standard colors
      const qrCanvas = document.createElement("canvas");
      const qrContext = qrCanvas.getContext("2d");
      // Increase QR code resolution
      qrCanvas.width = 360;
      qrCanvas.height = 360;

      // Generate QR code data URL with higher resolution
      const qrDataUrl = await QRCodeLib.toDataURL(qrLink, {
        width: 360,
        margin: 1,
        color: {
          dark: qrColor,
          light: "#ffffff",
        },
      });

      // Load QR code image
      const qrImage = new Image();
      qrImage.src = qrDataUrl;

      // Wait for QR image to load
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      // Draw QR code on canvas
      qrContext?.drawImage(qrImage, 0, 0);

      // Create a new canvas for the entire standee with higher resolution
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      // Double the resolution for better quality
      const scale = 2;
      canvas.width = 380 * scale;
      canvas.height = 540 * scale;

      // Enable image smoothing for better quality
      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";

      // Scale the context to match the higher resolution
      ctx!.scale(scale, scale);

      // Draw background
      ctx!.fillStyle = "#14213d";
      ctx!.fillRect(0, 0, canvas.width / scale, canvas.height / scale);

      // Draw white card background
      ctx!.fillStyle = bgColor;
      ctx!.fillRect(0, 0, canvas.width / scale, canvas.height / scale - 40);

      // Draw QR code with higher resolution
      // Draw white background with shadow for QR code
      ctx!.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx!.shadowBlur = 6;
      ctx!.shadowOffsetX = 0;
      ctx!.shadowOffsetY = 2;
      ctx!.fillStyle = "#ffffff";
      ctx!.beginPath();
      ctx!.roundRect((canvas.width / scale - 220) / 2, 150, 220, 220, 16);
      ctx!.fill();

      // Reset shadow for QR code
      ctx!.shadowColor = "transparent";
      ctx!.shadowBlur = 0;
      ctx!.shadowOffsetX = 0;
      ctx!.shadowOffsetY = 0;
      ctx!.drawImage(qrCanvas, (canvas.width / scale - 200) / 2, 160, 200, 200);

      // Draw text with improved quality
      ctx!.font = "bold 32px " + font;
      ctx!.fillStyle = qrColor;
      ctx!.textAlign = "center";
      ctx!.fillText(title, canvas.width / (2 * scale), 80);

      ctx!.font = "16px " + font;
      ctx!.fillStyle = "#6b7280";
      ctx!.fillText(subtitle, canvas.width / (2 * scale), 115);

      if (additionalText) {
        ctx!.font = "bold 18px " + font;
        ctx!.fillStyle = qrColor;
        ctx!.fillText(additionalText, canvas.width / (2 * scale), 400);
      }

      ctx!.font = "14px " + font;
      ctx!.fillStyle = "#6b7280";
      ctx!.fillText(bottomText, canvas.width / (2 * scale), 440);

      // Draw footer
      ctx!.fillStyle = "#14213d";
      ctx!.fillRect(0, canvas.height / scale - 40, canvas.width / scale, 40);

      // Footer text parts
      ctx!.font = "bold 20px Helvetica";
      ctx!.textAlign = "left";
      const kanriapps = "Kanriapps";
      const heart = " ❤️ "; // add spaces for separation
      const pos = "POS";
      const gap = 8; // extra gap in px
      const kanriappsWidth = ctx!.measureText(kanriapps).width;
      const heartWidth = ctx!.measureText(heart).width;
      const posWidth = ctx!.measureText(pos).width;
      const totalWidth = kanriappsWidth + heartWidth + posWidth;
      const startX = (canvas.width / scale - totalWidth) / 2;
      const y = canvas.height / scale - 16;

      // Draw 'Kanriapps'
      ctx!.fillStyle = "#ffffff";
      ctx!.fillText(kanriapps, startX, y);
      // Draw heart
      ctx!.fillStyle = "#f97316";
      ctx!.fillText(heart, startX + kanriappsWidth, y);
      // Draw 'POS'
      ctx!.fillStyle = "#fca311";
      ctx!.fillText(pos, startX + kanriappsWidth + heartWidth, y);

      // Convert to PDF with higher quality
      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight,
        undefined,
        "FAST"
      );
      pdf.save(`qr-standee-${title}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  // Batch PDF generation logic
  const handleBatchDownload = async (
    prefix: string,
    pageCount: number,
    qrLinkTemplate: string
  ) => {
    setIsBatchLoading(true);
    // A4 landscape: 297mm x 210mm. We'll use 10mm margin on all sides and 10mm between standees.
    const mmToPx = (mm: number) => Math.round((mm / 25.4) * 300); // 300dpi
    const margin = mmToPx(10); // 10mm margin
    const between = mmToPx(10); // 10mm between standees
    const pageWidthPx = mmToPx(297);
    const pageHeightPx = mmToPx(210);
    const standeeWidth = Math.floor((pageWidthPx - margin * 2 - between) / 2);
    const standeeHeight = pageHeightPx - margin * 2;
    const jsPDFLandscape = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    let standeeNum = 1;
    for (let page = 0; page < pageCount; page++) {
      // Create a canvas for the page
      const canvas = document.createElement("canvas");
      canvas.width = pageWidthPx;
      canvas.height = pageHeightPx;
      const ctx = canvas.getContext("2d");
      ctx!.fillStyle = "#fff";
      ctx!.fillRect(0, 0, canvas.width, canvas.height);

      for (let col = 0; col < 2; col++) {
        // Draw each standee
        const xOffset = margin + col * (standeeWidth + between);
        const yOffset = margin;
        // --- QR code ---
        const qrCanvas = document.createElement("canvas");
        qrCanvas.width = Math.floor(standeeWidth * 0.53);
        qrCanvas.height = Math.floor(standeeWidth * 0.53);
        // Use the template if provided, else fallback to current qrLink
        const qrValue =
          qrLinkTemplate && qrLinkTemplate.includes("{n}")
            ? qrLinkTemplate.replace("{n}", String(standeeNum))
            : qrLink;
        const qrDataUrl = await QRCodeLib.toDataURL(qrValue, {
          width: qrCanvas.width,
          margin: 1,
          color: { dark: qrColor, light: "#ffffff" },
        });
        const qrImage = new window.Image();
        qrImage.src = qrDataUrl;
        await new Promise((resolve) => {
          qrImage.onload = resolve;
        });
        // --- Standee background ---
        ctx!.fillStyle = "#14213d";
        ctx!.fillRect(xOffset, yOffset, standeeWidth, standeeHeight);
        ctx!.fillStyle = bgColor;
        ctx!.fillRect(
          xOffset,
          yOffset,
          standeeWidth,
          standeeHeight - Math.floor(standeeHeight * 0.07)
        );
        // --- Center QR code in white square ---
        // Calculate the white square (qrBox) size and position
        const qrBoxSize = qrCanvas.width + Math.floor(standeeWidth * 0.09);
        const qrBoxX = xOffset + (standeeWidth - qrBoxSize) / 2;
        const qrBoxY = yOffset + Math.floor(standeeHeight * 0.28);
        // Calculate the QR code position so it's centered in the box
        const qrX = qrBoxX + (qrBoxSize - qrCanvas.width) / 2;
        const qrY = qrBoxY + (qrBoxSize - qrCanvas.height) / 2;
        // --- QR code shadowed box ---
        ctx!.save();
        ctx!.shadowColor = "rgba(0, 0, 0, 0.15)";
        ctx!.shadowBlur = Math.floor(standeeWidth * 0.025);
        ctx!.shadowOffsetX = 0;
        ctx!.shadowOffsetY = Math.floor(standeeWidth * 0.01);
        ctx!.fillStyle = "#ffffff";
        ctx!.beginPath();
        ctx!.roundRect(
          qrBoxX,
          qrBoxY,
          qrBoxSize,
          qrBoxSize,
          Math.floor(qrBoxSize * 0.08)
        );
        ctx!.fill();
        ctx!.restore();
        ctx!.drawImage(qrImage, qrX, qrY, qrCanvas.width, qrCanvas.height);
        // --- Text ---
        ctx!.font = `bold ${Math.floor(standeeWidth * 0.11)}px ${font}`;
        ctx!.fillStyle = qrColor;
        ctx!.textAlign = "center";
        ctx!.fillText(
          title,
          xOffset + standeeWidth / 2,
          yOffset + Math.floor(standeeHeight * 0.15)
        );
        ctx!.font = `${Math.floor(standeeWidth * 0.055)}px ${font}`;
        ctx!.fillStyle = "#6b7280";
        ctx!.fillText(
          subtitle,
          xOffset + standeeWidth / 2,
          yOffset + Math.floor(standeeHeight * 0.22)
        );
        // --- Additional Text (auto-incremented) ---
        ctx!.font = `bold ${Math.floor(standeeWidth * 0.065)}px ${font}`;
        ctx!.fillStyle = qrColor;
        ctx!.fillText(
          `${prefix} ${standeeNum}`,
          xOffset + standeeWidth / 2,
          yOffset + Math.floor(standeeHeight * 0.8)
        );
        // --- Bottom Text ---
        ctx!.font = `${Math.floor(standeeWidth * 0.05)}px ${font}`;
        ctx!.fillStyle = "#6b7280";
        ctx!.fillText(
          bottomText,
          xOffset + standeeWidth / 2,
          yOffset + Math.floor(standeeHeight * 0.87)
        );
        // --- Footer ---
        ctx!.fillStyle = "#14213d";
        ctx!.fillRect(
          xOffset,
          yOffset + standeeHeight - Math.floor(standeeHeight * 0.07),
          standeeWidth,
          Math.floor(standeeHeight * 0.07)
        );
        ctx!.font = `bold ${Math.floor(standeeWidth * 0.06)}px Helvetica`;
        ctx!.textAlign = "left";
        const kanriapps = "Kanriapps";
        const heart = " ❤️ ";
        const pos = "POS";
        const kanriappsWidth = ctx!.measureText(kanriapps).width;
        const heartWidth = ctx!.measureText(heart).width;
        const posWidth = ctx!.measureText(pos).width;
        const totalWidth = kanriappsWidth + heartWidth + posWidth;
        const startX = xOffset + (standeeWidth - totalWidth) / 2;
        const y = yOffset + standeeHeight - Math.floor(standeeHeight * 0.025);
        ctx!.fillStyle = "#ffffff";
        ctx!.fillText(kanriapps, startX, y);
        ctx!.fillStyle = "#f97316";
        ctx!.fillText(heart, startX + kanriappsWidth, y);
        ctx!.fillStyle = "#fca311";
        ctx!.fillText(pos, startX + kanriappsWidth + heartWidth, y);
        standeeNum++;
      }
      // Add page to PDF
      const imgData = canvas.toDataURL("image/png", 1.0);
      if (page === 0) {
        jsPDFLandscape.addImage(
          imgData,
          "PNG",
          0,
          0,
          297,
          210,
          undefined,
          "FAST"
        );
      } else {
        jsPDFLandscape.addPage();
        jsPDFLandscape.addImage(
          imgData,
          "PNG",
          0,
          0,
          297,
          210,
          undefined,
          "FAST"
        );
      }
    }
    jsPDFLandscape.save(`qr-standee-batch.pdf`);
    setIsBatchLoading(false);
  };

  return (
    <>
      {isBatchLoading && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-50">
          <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg">
            <div className="animate-spin rounded-full border-4 border-blue-500 border-t-transparent h-12 w-12 mb-2" />
            <span className="text-lg font-semibold text-gray-800 dark:text-gray-100">
              Downloading...
            </span>
          </div>
        </div>
      )}
      <MainLayout onBatchDownload={handleBatchDownload}>
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4rem)]">
          {/* Left: Editing Controls (Sidebar in desktop) */}
          <Card className="w-full lg:w-96 lg:h-[calc(100vh-4rem)] lg:rounded-none lg:border-r lg:border-b-0 border-b bg-white dark:bg-gray-900 lg:sticky lg:top-0 lg:flex lg:flex-col">
            <CardContent className="px-4 lg:px-6 h-full overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title" className="mb-2">
                    Title
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter title"
                    maxLength={32}
                  />
                </div>
                <div>
                  <Label htmlFor="subtitle" className="mb-2">
                    Subtitle
                  </Label>
                  <Input
                    id="subtitle"
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Enter subtitle"
                    maxLength={32}
                  />
                </div>
                <div>
                  <Label htmlFor="qrLink" className="mb-2">
                    QR Code Link
                  </Label>
                  <Input
                    id="qrLink"
                    type="url"
                    value={qrLink}
                    onChange={(e) => setQrLink(e.target.value)}
                    placeholder="Enter URL for QR code"
                  />
                </div>
                <div>
                  <Label htmlFor="bottomText" className="mb-2">
                    Bottom Text
                  </Label>
                  <Input
                    id="bottomText"
                    type="text"
                    value={bottomText}
                    onChange={(e) => setBottomText(e.target.value)}
                    placeholder="Enter bottom text"
                    maxLength={32}
                  />
                </div>
                <div>
                  <Label htmlFor="additionalText" className="mb-2">
                    Additional Text (Optional)
                  </Label>
                  <Input
                    id="additionalText"
                    type="text"
                    value={additionalText}
                    onChange={(e) => setAdditionalText(e.target.value)}
                    placeholder="e.g., Table no #1"
                    maxLength={32}
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
                      style={{
                        color: qrColor,
                        letterSpacing: 1,
                        fontFamily: font,
                      }}
                    >
                      {title}
                    </span>
                    <span
                      className="text-base font-semibold text-gray-500 tracking-wide mt-2"
                      style={{ fontFamily: font }}
                    >
                      {subtitle}
                    </span>
                  </div>
                  {/* QR Code */}
                  <div className="my-4 bg-white p-3 rounded-lg shadow-md">
                    <QRCodeCanvas
                      value={qrLink}
                      size={200}
                      bgColor="#ffffff"
                      fgColor={qrColor}
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  {/* Additional Text */}
                  {additionalText && (
                    <div
                      className="text-lg font-bold mb-2"
                      style={{ color: qrColor, fontFamily: font }}
                    >
                      {additionalText}
                    </div>
                  )}
                  {/* Bottom Text */}
                  <div
                    className="text-sm text-gray-500"
                    style={{ fontFamily: font }}
                  >
                    {bottomText}
                  </div>
                </div>
                {/* Footer */}
                <div className="w-full bg-[#14213d] py-2 flex flex-col items-center">
                  <span
                    className="text-white font-bold text-lg tracking-wide flex items-center gap-1"
                    style={{ fontFamily: "Helvetica" }}
                  >
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
      </MainLayout>
    </>
  );
}
