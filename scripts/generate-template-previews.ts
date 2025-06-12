import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';

const templates = [
    {
        id: "modern-minimal",
        name: "Modern Minimal",
        description: "Clean and minimal design with ample white space",
        defaultSettings: {
            font: "Montserrat",
            qrColor: "#2563eb",
            bgColor: "#ffffff",
        },
    },
    {
        id: "elegant-dark",
        name: "Elegant Dark",
        description: "Sophisticated dark theme with gold accents",
        defaultSettings: {
            font: "Playfair Display",
            qrColor: "#d4af37",
            bgColor: "#1a1a1a",
        },
    },
    {
        id: "vibrant-colorful",
        name: "Vibrant Colorful",
        description: "Bold and colorful design for casual settings",
        defaultSettings: {
            font: "Pacifico",
            qrColor: "#ff6b6b",
            bgColor: "#f8f9fa",
        },
    },
];

async function generateTemplatePreview(template: typeof templates[0]) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set viewport size for portrait mode
    await page.setViewport({ width: 300, height: 500 });

    const qrCodeSvg = await QRCode.toString('http://theguptaji.github.io', { type: 'svg', width: 120, color: { dark: template.defaultSettings.qrColor, light: '#ffffff' } });

    // Create HTML content for the template preview
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;500;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;700&family=Playfair+Display:wght@400;500;700&family=Merriweather:wght@400;700&family=Source+Code+Pro:wght@400;500&family=Dancing+Script:wght@400;700&family=Pacifico&display=swap" rel="stylesheet">
        <style>
          body {
            margin: 0;
            padding: 0;
            background: #f3f4f6;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
          }
          .preview-container {
            width: 260px;
            height: 460px;
            background: #14213d;
            border-radius: 1rem;
            overflow: hidden;
            box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
            display: flex;
            flex-direction: column;
            justify-content: space-evenly;
            align-items: center;
          }
          .preview-content {
            width: 100%;
            height: 100%;
            background: ${template.defaultSettings.bgColor};
            border-bottom-left-radius: 1rem;
            border-bottom-right-radius: 1rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-evenly;
            padding: 1rem 1rem;
            box-sizing: border-box;
          }
          .restaurant-name {
            font-family: ${template.defaultSettings.font};
            color: ${template.defaultSettings.qrColor};
            font-size: 1.5rem;
            font-weight: 800;
            letter-spacing: 0.025em;
            margin-bottom: 0.25rem;
            text-align: center;
            padding: 0 0.5rem;
          }
          .menu-text {
            font-family: ${template.defaultSettings.font};
            color: #6b7280;
            font-size: 1rem;
            font-weight: 600;
            letter-spacing: 0.025em;
            margin-bottom: 0.5rem;
          }
          .qr-container {
            background: white;
            padding: 0.5rem;
            border-radius: 0.5rem;
            margin-top: 2rem;
            margin-bottom: 1rem;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
          }
          .qr-container svg {
            display: block;
          }
          .table-number {
            font-family: ${template.defaultSettings.font};
            color: ${template.defaultSettings.qrColor};
            font-size: 1rem;
            font-weight: 700;
            margin-top: 2rem;
            margin-bottom: 0.25rem;
          }
          .scan-text {
            font-family: ${template.defaultSettings.font};
            color: #6b7280;
            font-size: 1rem;
            margin-top: 0.25rem;
          }
        </style>
      </head>
      <body>
        <div class="preview-container">
          <div class="preview-content">
            <div class="restaurant-name">Sample Restaurant</div>
            <div class="menu-text">Food Menu</div>
            <div class="qr-container">
              ${qrCodeSvg}
            </div>
            <div class="table-number">Table no #1</div>
            <div class="scan-text">Scan to view menu</div>
          </div>
        </div>
      </body>
    </html>
  `;

    await page.setContent(html);

    // Wait for fonts to load
    await page.evaluateHandle('document.fonts.ready');

    // Create public/templates directory if it doesn't exist
    const templatesDir = path.join(process.cwd(), 'public', 'templates');
    if (!fs.existsSync(templatesDir)) {
        fs.mkdirSync(templatesDir, { recursive: true });
    }

    // Take screenshot
    const screenshotPath = path.join(templatesDir, `${template.id}.png`) as `${string}.png`;
    await page.screenshot({
        path: screenshotPath,
        omitBackground: true,
    });

    await browser.close();
}

async function generateAllPreviews() {
    console.log('Generating template previews...');

    for (const template of templates) {
        console.log(`Generating preview for ${template.name}...`);
        await generateTemplatePreview(template);
    }

    console.log('All previews generated successfully!');
}

generateAllPreviews().catch(console.error); 