import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Google Fonts that we'll use
const fonts = [
  { label: "Roboto", value: "Roboto", category: "Sans-serif" },
  { label: "Open Sans", value: "Open Sans", category: "Sans-serif" },
  { label: "Lato", value: "Lato", category: "Sans-serif" },
  { label: "Montserrat", value: "Montserrat", category: "Sans-serif" },
  { label: "Playfair Display", value: "Playfair Display", category: "Serif" },
  { label: "Merriweather", value: "Merriweather", category: "Serif" },
  { label: "Source Code Pro", value: "Source Code Pro", category: "Monospace" },
  { label: "Dancing Script", value: "Dancing Script", category: "Handwriting" },
  { label: "Pacifico", value: "Pacifico", category: "Handwriting" },
];

interface FontSelectorProps {
  selectedFont: string;
  onFontChange: (font: string) => void;
}

export function FontSelector({
  selectedFont,
  onFontChange,
}: FontSelectorProps) {
  return (
    <div>
      <Label htmlFor="font" className="mb-2">
        Font Family
      </Label>
      <Select value={selectedFont} onValueChange={onFontChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a font" />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: font.value }}>{font.label}</span>
                <span className="text-xs text-gray-500">({font.category})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
