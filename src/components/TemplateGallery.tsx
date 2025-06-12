import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  name: string;
  description: string;
  defaultSettings: {
    font: string;
    qrColor: string;
    bgColor: string;
  };
}

const templates: Template[] = [
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

interface TemplateGalleryProps {
  onTemplateSelect: (template: Template) => void;
}

export function TemplateGallery({ onTemplateSelect }: TemplateGalleryProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Templates</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="relative group overflow-hidden rounded-lg shadow-lg aspect-[3/5]"
          >
            <img
              src={`/templates/${template.id}.png`}
              alt={template.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                onClick={() => onTemplateSelect(template)}
                className="w-auto"
              >
                Use Template
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
