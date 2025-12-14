"use client";

import { useRef, useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

const templates = [
  { id: "none", name: "None", path: null },
  { id: "tp-1", name: "Template 1", path: "/tp-1.png" },
  { id: "tp-2", name: "Template 2", path: "/tp-2.png" },
  { id: "tp-3", name: "Template 3", path: "/tp-3.png" },
  { id: "tp-4", name: "Template 4", path: "/tp-4.png" },
  { id: "tp-5", name: "Template 5", path: "/tp-5.png" },
  { id: "tp-6", name: "Template 6", path: "/tp-6.png" },
];

interface TextPosition {
  x: number;
  y: number;
}

export default function QRGeneratorPage() {
  const [title, setTitle] = useState("Sample Title");
  const [subtitle, setSubtitle] = useState("Subtitle Text");
  const [qrLink, setQrLink] = useState("https://example.com");
  const [bottomText, setBottomText] = useState("Scan to learn more");
  const [additionalText, setAdditionalText] = useState("");
  const [qrColor, setQrColor] = useState("#2563eb");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [font, setFont] = useState("Montserrat");
  const [selectedTemplate, setSelectedTemplate] = useState<string>("none");
  const [textPositions, setTextPositions] = useState<{
    title: TextPosition;
    subtitle: TextPosition;
    additionalText: TextPosition;
    bottomText: TextPosition;
  }>({
    title: { x: 50, y: 15 },
    subtitle: { x: 50, y: 25 },
    additionalText: { x: 50, y: 75 },
    bottomText: { x: 50, y: 85 },
  });
  const [dragging, setDragging] = useState<string | null>(null);
  const [templateImage, setTemplateImage] = useState<HTMLImageElement | null>(
    null
  );
  const [qrPosition, setQrPosition] = useState<{
    x: number;
    y: number;
    size: number;
  } | null>(null);
  const qrRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // Load template image and detect white square for QR code placement
  useEffect(() => {
    if (selectedTemplate === "none") {
      setTemplateImage(null);
      setQrPosition(null);
      return;
    }

    const template = templates.find((t) => t.id === selectedTemplate);
    if (!template?.path) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setTemplateImage(img);

      // Detect white square area in the template
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Find white square - try multiple sizes
      let maxWhiteArea = 0;
      let bestX = 0;
      let bestY = 0;
      let bestSize = 0;

      // Try different square sizes (from 15% to 40% of image dimension)
      const minSize = Math.min(img.width, img.height) * 0.15;
      const maxSize = Math.min(img.width, img.height) * 0.4;
      const stepSize = Math.min(img.width, img.height) * 0.05;

      for (let scanSize = minSize; scanSize <= maxSize; scanSize += stepSize) {
        const step = Math.max(1, Math.floor(scanSize / 10));
        for (let y = 0; y < img.height - scanSize; y += step) {
          for (let x = 0; x < img.width - scanSize; x += step) {
            let whitePixels = 0;
            let totalPixels = 0;

            // Sample pixels in the square area
            const sampleStep = Math.max(1, Math.floor(scanSize / 20));
            for (let sy = 0; sy < scanSize; sy += sampleStep) {
              for (let sx = 0; sx < scanSize; sx += sampleStep) {
                const idx = ((y + sy) * img.width + (x + sx)) * 4;
                const r = data[idx];
                const g = data[idx + 1];
                const b = data[idx + 2];
                // Check if pixel is white (or very light)
                if (r > 240 && g > 240 && b > 240) {
                  whitePixels++;
                }
                totalPixels++;
              }
            }

            const whiteRatio = whitePixels / totalPixels;
            const area = scanSize * scanSize;

            // Prefer larger squares with high white ratio
            if (whiteRatio > 0.75 && area > maxWhiteArea) {
              maxWhiteArea = area;
              bestX = x + scanSize / 2; // Center of square
              bestY = y + scanSize / 2;
              bestSize = scanSize;
            }
          }
        }
      }

      if (maxWhiteArea > 0) {
        // Convert to percentage for responsive positioning
        setQrPosition({
          x: (bestX / img.width) * 100,
          y: (bestY / img.height) * 100,
          size: (bestSize / Math.max(img.width, img.height)) * 100,
        });
      } else {
        // Default position if no white square found (center, 30% size)
        setQrPosition({ x: 50, y: 50, size: 30 });
      }
    };
    img.src = template.path;
  }, [selectedTemplate]);

  const generateQRCodeDataURL = async (url: string) => {
    try {
      const dataUrl = await QRCodeLib.toDataURL(url);
      return dataUrl;
    } catch (err) {
      console.error("Error generating QR code", err);
      return null;
    }
  };

  // Drag handlers for text elements
  const handleMouseDown = (element: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(element);
  };

  useEffect(() => {
    if (!dragging || !previewRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      setTextPositions((prev) => ({
        ...prev,
        [dragging]: {
          x: Math.max(0, Math.min(100, x)),
          y: Math.max(0, Math.min(100, y)),
        },
      }));
    };

    const handleMouseUp = () => {
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  const handleTableAppQRs = async () => {
    if (!qrRef.current) return;

    try {
      const scale = 2;
      const canvasWidth = 380;
      const canvasHeight = 540;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = canvasWidth * scale;
      canvas.height = canvasHeight * scale;

      ctx!.imageSmoothingEnabled = true;
      ctx!.imageSmoothingQuality = "high";
      ctx!.scale(scale, scale);

      // Draw background - template or solid color
      if (selectedTemplate !== "none" && templateImage) {
        ctx!.drawImage(templateImage, 0, 0, canvasWidth, canvasHeight);
      } else {
        ctx!.fillStyle = bgColor;
        ctx!.fillRect(0, 0, canvasWidth, canvasHeight);
      }

      // Generate and draw QR code
      const qrSize = qrPosition
        ? (qrPosition.size / 100) * Math.min(canvasWidth, canvasHeight)
        : 200;
      const qrDataUrl = await QRCodeLib.toDataURL(qrLink, {
        width: qrSize * scale,
        margin: 1,
        color: {
          dark: qrColor,
          light: "#ffffff",
        },
      });

      const qrImage = new Image();
      qrImage.src = qrDataUrl;
      await new Promise((resolve) => {
        qrImage.onload = resolve;
      });

      const qrX = qrPosition
        ? (qrPosition.x / 100) * canvasWidth
        : canvasWidth / 2;
      const qrY = qrPosition
        ? (qrPosition.y / 100) * canvasHeight
        : canvasHeight / 2;

      // Draw white background for QR code
      const qrPadding = qrSize * 0.1;
      ctx!.shadowColor = "rgba(0, 0, 0, 0.15)";
      ctx!.shadowBlur = 6;
      ctx!.shadowOffsetX = 0;
      ctx!.shadowOffsetY = 2;
      ctx!.fillStyle = "#ffffff";
      ctx!.beginPath();
      ctx!.roundRect(
        qrX - qrSize / 2 - qrPadding,
        qrY - qrSize / 2 - qrPadding,
        qrSize + qrPadding * 2,
        qrSize + qrPadding * 2,
        16
      );
      ctx!.fill();

      ctx!.shadowColor = "transparent";
      ctx!.shadowBlur = 0;
      ctx!.drawImage(
        qrImage,
        qrX - qrSize / 2,
        qrY - qrSize / 2,
        qrSize,
        qrSize
      );

      // Draw text elements at their positions
      const titleX = (textPositions.title.x / 100) * canvasWidth;
      const titleY = (textPositions.title.y / 100) * canvasHeight;
      ctx!.font = `bold ${32 * scale}px ${font}`;
      ctx!.fillStyle = qrColor;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      ctx!.fillText(title, titleX, titleY);

      const subtitleX = (textPositions.subtitle.x / 100) * canvasWidth;
      const subtitleY = (textPositions.subtitle.y / 100) * canvasHeight;
      ctx!.font = `${16 * scale}px ${font}`;
      ctx!.fillStyle = "#6b7280";
      ctx!.fillText(subtitle, subtitleX, subtitleY);

      if (additionalText) {
        const addTextX = (textPositions.additionalText.x / 100) * canvasWidth;
        const addTextY = (textPositions.additionalText.y / 100) * canvasHeight;
        ctx!.font = `bold ${18 * scale}px ${font}`;
        ctx!.fillStyle = qrColor;
        ctx!.fillText(additionalText, addTextX, addTextY);
      }

      const bottomTextX = (textPositions.bottomText.x / 100) * canvasWidth;
      const bottomTextY = (textPositions.bottomText.y / 100) * canvasHeight;
      ctx!.font = `${14 * scale}px ${font}`;
      ctx!.fillStyle = "#6b7280";
      ctx!.fillText(bottomText, bottomTextX, bottomTextY);

      // Convert to PDF
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
                  <Label htmlFor="template" className="mb-2">
                    Template
                  </Label>
                  <Select
                    value={selectedTemplate}
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
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

                {/* Background Color Palette - only show if no template */}
                {selectedTemplate === "none" && (
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
                )}
                {selectedTemplate !== "none" && (
                  <div className="text-sm text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                    💡 Drag text elements in the preview to reposition them
                  </div>
                )}

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
                ref={previewRef}
                className="relative w-full rounded-2xl shadow-2xl overflow-hidden"
                style={{
                  width: "100%",
                  maxWidth: 380,
                  maxHeight: 540,
                  minHeight: 320,
                  aspectRatio: "380/540",
                }}
              >
                {/* Template Background or Default Background */}
                {selectedTemplate !== "none" && templateImage ? (
                  <img
                    src={templateImage.src}
                    alt="Template"
                    className="w-full h-full object-cover"
                    style={{ position: "absolute", top: 0, left: 0 }}
                  />
                ) : (
                  <div
                    className="w-full h-full"
                    style={{
                      background: bgColor,
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}

                {/* QR Code - positioned in white square or center */}
                <div
                  className="absolute"
                  style={{
                    left: qrPosition ? `${qrPosition.x}%` : "50%",
                    top: qrPosition ? `${qrPosition.y}%` : "50%",
                    transform: "translate(-50%, -50%)",
                    width: qrPosition
                      ? `${Math.min(qrPosition.size, 35)}%`
                      : "200px",
                    maxWidth: "200px",
                    aspectRatio: "1/1",
                  }}
                >
                  <div className="w-full h-full bg-white p-2 rounded-lg shadow-md flex items-center justify-center">
                    <QRCodeCanvas
                      value={qrLink}
                      size={200}
                      bgColor="#ffffff"
                      fgColor={qrColor}
                      level="H"
                      includeMargin={false}
                      style={{
                        width: "100%",
                        height: "100%",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  </div>
                </div>

                {/* Draggable Text Elements */}
                <div
                  className={`absolute select-none transition-opacity ${
                    dragging === "title"
                      ? "opacity-70 z-50"
                      : "cursor-move z-10 hover:opacity-90"
                  }`}
                  style={{
                    left: `${textPositions.title.x}%`,
                    top: `${textPositions.title.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontFamily: font,
                    color: qrColor,
                    fontSize: "clamp(1.5rem, 4vw, 2rem)",
                    fontWeight: "bold",
                    pointerEvents: dragging === "title" ? "none" : "auto",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                  onMouseDown={(e) => handleMouseDown("title", e)}
                >
                  {title}
                </div>

                <div
                  className={`absolute select-none transition-opacity ${
                    dragging === "subtitle"
                      ? "opacity-70 z-50"
                      : "cursor-move z-10 hover:opacity-90"
                  }`}
                  style={{
                    left: `${textPositions.subtitle.x}%`,
                    top: `${textPositions.subtitle.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontFamily: font,
                    color: "#6b7280",
                    fontSize: "clamp(0.875rem, 2vw, 1rem)",
                    fontWeight: "semibold",
                    pointerEvents: dragging === "subtitle" ? "none" : "auto",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                  onMouseDown={(e) => handleMouseDown("subtitle", e)}
                >
                  {subtitle}
                </div>

                {additionalText && (
                  <div
                    className={`absolute select-none transition-opacity ${
                      dragging === "additionalText"
                        ? "opacity-70 z-50"
                        : "cursor-move z-10 hover:opacity-90"
                    }`}
                    style={{
                      left: `${textPositions.additionalText.x}%`,
                      top: `${textPositions.additionalText.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontFamily: font,
                      color: qrColor,
                      fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
                      fontWeight: "bold",
                      pointerEvents:
                        dragging === "additionalText" ? "none" : "auto",
                      textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                    }}
                    onMouseDown={(e) => handleMouseDown("additionalText", e)}
                  >
                    {additionalText}
                  </div>
                )}

                <div
                  className={`absolute select-none transition-opacity ${
                    dragging === "bottomText"
                      ? "opacity-70 z-50"
                      : "cursor-move z-10 hover:opacity-90"
                  }`}
                  style={{
                    left: `${textPositions.bottomText.x}%`,
                    top: `${textPositions.bottomText.y}%`,
                    transform: "translate(-50%, -50%)",
                    fontFamily: font,
                    color: "#6b7280",
                    fontSize: "clamp(0.75rem, 2vw, 0.875rem)",
                    pointerEvents: dragging === "bottomText" ? "none" : "auto",
                    textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                  onMouseDown={(e) => handleMouseDown("bottomText", e)}
                >
                  {bottomText}
                </div>

                {/* Export container for PDF generation */}
                <div
                  ref={qrRef}
                  className="absolute inset-0 pointer-events-none opacity-0"
                >
                  {selectedTemplate !== "none" && templateImage ? (
                    <img
                      src={templateImage.src}
                      alt="Template"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full"
                      style={{ background: bgColor }}
                    />
                  )}
                  <div
                    className="absolute"
                    style={{
                      left: qrPosition ? `${qrPosition.x}%` : "50%",
                      top: qrPosition ? `${qrPosition.y}%` : "50%",
                      transform: "translate(-50%, -50%)",
                      width: qrPosition ? `${qrPosition.size}%` : "200px",
                      aspectRatio: "1/1",
                    }}
                  >
                    <div className="w-full h-full bg-white p-2 rounded-lg">
                      <QRCodeCanvas
                        value={qrLink}
                        size={200}
                        bgColor="#ffffff"
                        fgColor={qrColor}
                        level="H"
                        includeMargin={false}
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  <div
                    className="absolute"
                    style={{
                      left: `${textPositions.title.x}%`,
                      top: `${textPositions.title.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontFamily: font,
                      color: qrColor,
                      fontSize: "2rem",
                      fontWeight: "bold",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    className="absolute"
                    style={{
                      left: `${textPositions.subtitle.x}%`,
                      top: `${textPositions.subtitle.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontFamily: font,
                      color: "#6b7280",
                      fontSize: "1rem",
                      fontWeight: "semibold",
                    }}
                  >
                    {subtitle}
                  </div>
                  {additionalText && (
                    <div
                      className="absolute"
                      style={{
                        left: `${textPositions.additionalText.x}%`,
                        top: `${textPositions.additionalText.y}%`,
                        transform: "translate(-50%, -50%)",
                        fontFamily: font,
                        color: qrColor,
                        fontSize: "1.25rem",
                        fontWeight: "bold",
                      }}
                    >
                      {additionalText}
                    </div>
                  )}
                  <div
                    className="absolute"
                    style={{
                      left: `${textPositions.bottomText.x}%`,
                      top: `${textPositions.bottomText.y}%`,
                      transform: "translate(-50%, -50%)",
                      fontFamily: font,
                      color: "#6b7280",
                      fontSize: "0.875rem",
                    }}
                  >
                    {bottomText}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </MainLayout>
    </>
  );
}
