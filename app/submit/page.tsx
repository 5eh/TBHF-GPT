"use client";

import { Label } from "@radix-ui/react-label";
import { Check, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Markdown } from "@/components/custom/markdown";
import MarkdownEditor from "@/components/markdown";
import { Button } from "@/components/ui/button";
import GradientPopup from "@/components/ui/gradient-popup";
import Preview from "@/components/ui/preview";
import { cn } from "@/lib/utils";

const steps = [
  { id: 1, name: "Basic Information" },
  { id: 2, name: "Blog Content" },
  { id: 3, name: "Media & Tags" },
  { id: 4, name: "Additional Details" },
  { id: 5, name: "Review & Submit" },
];

interface FormData {
  nickname: string;
  image: string;
  imageFile?: File | null;
  title: string;
  banner: string;
  bannerFile?: File | null;
  shortSummary: string;
  tags: string[];
  document: string;
  authors: string;
  finalNote: string;
  date: string;
  metadata: Record<string, any>;
}

// This type matches the API route's expected submission data
interface BlogSubmission {
  nickname: string;
  image: string;
  title: string;
  banner: string;
  shortSummary: string;
  tags: string[];
  document: string;
  authors: string;
  finalNote: string;
  date: string;
  metadata?: Record<string, any>;
}

const Page = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nickname: "",
    image: "",
    imageFile: null,
    title: "",
    banner: "",
    bannerFile: null,
    shortSummary: "",
    tags: [],
    document: "",
    authors: "",
    finalNote: "",
    date: new Date().toISOString().split("T")[0],
    metadata: { bgGradient: "from-gray-100 to-gray-200" },
  });
  const [isGradientPopupOpen, setIsGradientPopupOpen] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "file") {
      // File inputs are now handled by separate onChange handlers
      // for image and banner fields
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Function to handle image upload to ImgBB
  const uploadImageToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_CONNECTION}`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
      }

      const data = await response.json();
      // Return the direct image URL
      return data.data.url;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    try {
      // Images have already been uploaded to ImgBB when selected
      // We just need to prepare the submission data
      const submissionData: BlogSubmission = {
        nickname: formData.nickname,
        image: formData.image,
        title: formData.title,
        banner: formData.banner,
        shortSummary: formData.shortSummary,
        tags: formData.tags,
        document: formData.document,
        authors: formData.authors,
        finalNote: formData.finalNote,
        date: formData.date,
        metadata: {
          ...formData.metadata,
          bgGradient: formData.metadata.bgGradient,
        },
      };

      // Submit the form data to the API
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit organization");
      }

      // Handle success (redirect or show success message)
      alert("Blog submitted successfully!");

      // You could add navigation to a success page here
      // For example: window.location.href = "/success";
    } catch (error) {
      console.error("Submission error:", error);
      // Handle error (show error message)
      alert(
        `Error submitting blog: ${error instanceof Error ? error.message : String(error)}`,
      );
      // Reset to current step in case of error
      setCurrentStep(steps.length);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Blog Title</Label>
              <input
                type="text"
                id="title"
                name="title"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="nickname">Nickname (URL Identifier)</Label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                value={formData.nickname}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <Label htmlFor="shortSummary">Summary</Label>
              <textarea
                id="shortSummary"
                name="shortSummary"
                rows={4}
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                value={formData.shortSummary}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="document">Blog Content</Label>
              <MarkdownEditor
                value={formData.document}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, document: value }))
                }
                label="Blog Content"
                placeholder="Write your markdown content here..."
              />
            </div>
            <div>
              <Label htmlFor="date">Publication Date</Label>
              <input
                type="date"
                id="date"
                name="date"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                value={formData.date}
                onChange={handleInputChange}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image">Featured Image</Label>
              <input
                type="file"
                id="image"
                name="image"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    // Set temporary URL for preview
                    setFormData((prev) => ({
                      ...prev,
                      imageFile: file,
                      image: URL.createObjectURL(file),
                    }));

                    try {
                      // Upload to ImgBB immediately
                      const imgUrl = await uploadImageToImgBB(file);
                      setFormData((prev) => ({
                        ...prev,
                        image: imgUrl,
                      }));
                    } catch (error) {
                      console.error("Error uploading image:", error);
                    }
                  }
                }}
              />
              {formData.image && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 break-all">
                    Image URL: {formData.image}
                  </p>
                  <div className="mt-2 h-32 relative rounded-md overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-contain"
                      unoptimized={formData.image.startsWith("blob:")}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="banner">Banner Image</Label>
              <input
                type="file"
                id="banner"
                name="banner"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                accept="image/*"
                onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    // Set temporary URL for preview
                    setFormData((prev) => ({
                      ...prev,
                      bannerFile: file,
                      banner: URL.createObjectURL(file),
                    }));

                    try {
                      // Upload to ImgBB immediately
                      const imgUrl = await uploadImageToImgBB(file);
                      setFormData((prev) => ({
                        ...prev,
                        banner: imgUrl,
                      }));
                    } catch (error) {
                      console.error("Error uploading banner:", error);
                    }
                  }
                }}
              />
              {formData.banner && (
                <div className="mt-2">
                  <p className="text-xs text-gray-400 break-all">
                    Banner URL: {formData.banner}
                  </p>
                  <div className="mt-2 h-32 w-full relative rounded-md overflow-hidden">
                    <Image
                      src={formData.banner}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                      unoptimized={formData.banner.startsWith("blob:")}
                    />
                  </div>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="bgGradient">Background Gradient</Label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="bgGradient"
                  name="bgGradient"
                  className="flex-1 mt-1 bg-white/5 rounded border border-gray-600 p-2"
                  value={formData.metadata.bgGradient}
                  placeholder="Select gradient using picker"
                  readOnly
                />
                <Button
                  type="button"
                  onClick={() => setIsGradientPopupOpen(true)}
                  className="mt-1"
                >
                  Choose
                </Button>
              </div>
            </div>
            <div className="mt-8">
              <Label>Preview</Label>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="col-span-1">
                  <Preview
                    title={formData.title || "Blog Title"}
                    mission={
                      formData.shortSummary ||
                      "Your blog summary will appear here"
                    }
                    image={
                      formData.image ||
                      "https://images.unsplash.com/photo-1620778182530-703effa65a06?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJ0Y3xlbnwwfHwwfHx8MA%3D%3D"
                    }
                    tags={formData.tags}
                    gradient={formData.metadata.bgGradient}
                  />
                </div>
              </div>
            </div>
            <GradientPopup
              isOpen={isGradientPopupOpen}
              onClose={() => setIsGradientPopupOpen(false)}
              onSelect={(gradient) => {
                setFormData((prev) => ({
                  ...prev,
                  metadata: { ...prev.metadata, bgGradient: gradient },
                }));
                setIsGradientPopupOpen(false);
              }}
            />
            <div>
              <Label>Tags (comma-separated)</Label>
              <input
                type="text"
                id="tags"
                name="tags"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    tags: e.target.value
                      .split(",")
                      .map((tag) => tag.trim())
                      .slice(0, 3),
                  }))
                }
                placeholder="education, children, healthcare (max 3)"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="authors">Authors</Label>
              <input
                type="text"
                id="authors"
                name="authors"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                value={formData.authors}
                onChange={handleInputChange}
                placeholder="John Doe, Jane Smith"
              />
            </div>
            <div>
              <Label htmlFor="finalNote">Final Note</Label>
              <textarea
                id="finalNote"
                name="finalNote"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                rows={4}
                value={formData.finalNote}
                onChange={handleInputChange}
                placeholder="Any closing thoughts or call to action for readers"
              />
            </div>
            <div>
              <Label htmlFor="metadata.references">References (Optional)</Label>
              <textarea
                id="metadata.references"
                name="metadata.references"
                className="w-full mt-1 bg-white/5 rounded border border-gray-600 p-2"
                rows={4}
                value={formData.metadata.references || ""}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    metadata: { ...prev.metadata, references: e.target.value },
                  }));
                }}
                placeholder="List any references or sources used in your blog post"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Blog Preview</h3>
              <div className="bg-white/5 p-4 rounded-lg max-h-96 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-2">{formData.title}</h1>
                <p className="text-sm text-gray-400 mb-4">
                  By {formData.authors || "Anonymous"} •{" "}
                  {new Date(formData.date).toLocaleDateString()}
                </p>
                <div className="prose prose-sm dark:prose-invert">
                  <Markdown>{formData.document}</Markdown>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3 className="font-semibold mb-4">Review Your Information</h3>
              <pre className="bg-white/5 p-4 rounded-lg overflow-auto">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Clear object URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      if (
        typeof formData.image === "string" &&
        formData.image.startsWith("blob:")
      ) {
        URL.revokeObjectURL(formData.image);
      }
      if (
        typeof formData.banner === "string" &&
        formData.banner.startsWith("blob:")
      ) {
        URL.revokeObjectURL(formData.banner);
      }
    };
  }, [formData.image, formData.banner]);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="pt-16 min-h-screen flex justify-center">
      <div className="max-w-4xl w-full px-4">
        <div className="bg-white/5 rounded-lg p-8 backdrop-blur-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Blog Submission
          </h1>

          {/* Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between relative">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-center",
                    index !== steps.length - 1 && "flex-1",
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2",
                      currentStep > step.id
                        ? "bg-primary border-primary text-white"
                        : currentStep === step.id
                          ? "border-primary text-primary"
                          : "border-gray-600 text-gray-600",
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="size-5" />
                    ) : (
                      step.id
                    )}
                  </div>
                  {index !== steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-full mx-4",
                        currentStep > step.id ? "bg-primary" : "bg-gray-600",
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className={cn(
                    "text-xs",
                    currentStep >= step.id ? "text-primary" : "text-gray-600",
                  )}
                >
                  {step.name}
                </div>
              ))}
            </div>
          </div>

          {/* Form Content */}
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep((prev) => prev - 1)}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            <Button
              onClick={() => {
                if (currentStep === steps.length) {
                  void handleSubmit();
                } else {
                  setCurrentStep((prev) => prev + 1);
                }
              }}
            >
              {currentStep === steps.length ? "Submit" : "Next"}
              {currentStep !== steps.length && (
                <ChevronRight className="ml-2 size-4" />
              )}
            </Button>
          </div>

          {/* Payment widget removed for blog submissions */}
        </div>
      </div>
    </div>
  );
};

export default Page;
