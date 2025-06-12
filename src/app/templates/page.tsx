"use client";

import { TemplateGallery } from "@/components/TemplateGallery";
import { useRouter } from "next/navigation";

export default function TemplatesPage() {
  const router = useRouter();

  const handleTemplateSelect = (template: any) => {
    // Store template settings in localStorage
    localStorage.setItem(
      "selectedTemplate",
      JSON.stringify(template.defaultSettings)
    );
    // Redirect to editor
    router.push("/");
  };

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Tabletop Templates</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Choose from our collection of professionally designed templates. Click
        "Use Template" to apply it to your tabletop.
      </p>
      <TemplateGallery onTemplateSelect={handleTemplateSelect} />
    </div>
  );
}
