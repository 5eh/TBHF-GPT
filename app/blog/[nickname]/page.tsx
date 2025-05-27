"use client";
import { Calendar, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Markdown } from "@/components/custom/markdown";

interface Blog {
  id: number;
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
  metadata: Record<string, any>;
}

type ApiResponse = {
  data?: Blog;
  error?: string;
};

export default function BlogPage() {
  const params = useParams();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlog() {
      try {
        if (!params.nickname || typeof params.nickname !== "string") {
          throw new Error("Invalid nickname parameter");
        }

        const response = await fetch(`/api/organization/${params.nickname}`);
        const contentType = response.headers.get("content-type");

        if (!contentType?.includes("application/json")) {
          throw new Error("Invalid server response format");
        }

        const result: ApiResponse = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || `HTTP error! status: ${response.status}`,
          );
        }

        if (!result.data) {
          throw new Error("Blog data is missing");
        }

        setBlog(result.data);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch blog:", err);
        setError(
          err instanceof Error ? err.message : "An unexpected error occurred",
        );
        setBlog(null);
      } finally {
        setLoading(false);
      }
    }

    fetchBlog();
  }, [params.nickname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full size-12 border-y-2 border-blue-500 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          Blog Not Found
        </h1>
        <p className="mb-6 dark:text-gray-300">
          {error || "Blog post not found"}
        </p>
        <Link
          href="/all"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          aria-label="Return to blogs list"
        >
          Return to Blogs
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-4xl px-4">
      {/* Banner Image */}
      <div className="h-64 md:h-96 overflow-hidden relative rounded-lg mb-8">
        <Image
          src={blog.banner || "/default-banner.jpg"}
          alt={`${blog.title} banner`}
          width={1200}
          height={400}
          className="size-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div className="absolute bottom-0 left-0 p-6">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {blog.title}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {blog.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-primary/20 border border-primary text-white text-xs px-2 py-1 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center space-x-4 text-white/80">
            <div className="flex items-center">
              <User className="size-4 mr-2" />
              <span>{blog.authors || 'Anonymous'}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="size-4 mr-2" />
              <span>{new Date(blog.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Short Summary */}
      <div className="mb-8">
        <p className="text-xl leading-relaxed text-gray-700 dark:text-gray-300 font-serif italic">
          {blog.shortSummary}
        </p>
      </div>

      {/* Main Content */}
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <Markdown>{blog.document}</Markdown>
      </div>

      {/* Final Note */}
      {blog.finalNote && (
        <div className="mt-12 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4 dark:text-white">Final Thoughts</h2>
          <Markdown>{blog.finalNote}</Markdown>
        </div>
      )}

      {/* Metadata */}
      {blog.metadata && blog.metadata.references && (
        <div className="mt-8 border-t pt-6 dark:border-gray-700">
          <h3 className="text-xl font-bold mb-4 dark:text-white">References</h3>
          <Markdown>{blog.metadata.references}</Markdown>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-12 flex justify-between border-t pt-6 dark:border-gray-700">
        <Link 
          href="/all" 
          className="text-primary hover:underline"
        >
          ← Back to All Blogs
        </Link>
      </div>
    </div>
  );
}