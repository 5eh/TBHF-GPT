"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import DirectSearch from "../../components/custom/search";

interface Blog {
  id: number;
  nickname: string;
  image: string;
  title: string;
  shortSummary: string;
  tags: string[];
  document: string;
  authors: string;
  finalNote: string;
  date: string;
  banner: string;
  metadata: Record<string, any>;
}

const Page = () => {
  const [spotlightId, setSpotlightId] = useState<number | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<
    Blog[]
  >([]);
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [blurEnabled, setBlurEnabled] = useState<boolean>(true);
  const spotlightTimerRef = useRef<NodeJS.Timeout | null>(null);
  const resetTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (query: string): void => {
    if (!query.trim()) {
      setFilteredBlogs(blogs);
      setSearchActive(false);
      return;
    }

    setSearchActive(true);
    const lowercaseQuery = query.toLowerCase();

    const filtered = blogs.filter((blog) => {
      return (
        blog.title.toLowerCase().includes(lowercaseQuery) ||
        blog.shortSummary.toLowerCase().includes(lowercaseQuery) ||
        blog.document.toLowerCase().includes(lowercaseQuery) ||
        blog.authors.toLowerCase().includes(lowercaseQuery) ||
        blog.finalNote.toLowerCase().includes(lowercaseQuery) ||
        (blog.tags || []).some((tag: string) =>
          tag.toLowerCase().includes(lowercaseQuery),
        )
      );
    });

    setFilteredBlogs(filtered);
  };

  const handleToggleBlur = (): void => {
    setBlurEnabled(!blurEnabled);
  };

  useEffect(() => {
    if (searchActive || !blurEnabled) {
      if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      setSpotlightId(null);
      return;
    }

    const pickRandomBlog = (): void => {
      if (filteredBlogs.length === 0) return;

      const randomIndex = Math.floor(
        Math.random() * filteredBlogs.length,
      );
      setSpotlightId(filteredBlogs[randomIndex].id);

      spotlightTimerRef.current = setTimeout(() => {
        setSpotlightId(null);

        resetTimerRef.current = setTimeout(pickRandomBlog, 2000);
      }, 2000);
    };

    pickRandomBlog();
    return () => {
      if (spotlightTimerRef.current) clearTimeout(spotlightTimerRef.current);
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    };
  }, [searchActive, filteredBlogs, blurEnabled]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await fetch(`/api/organization/all`);
        if (!response.ok) {
          throw new Error("Failed to fetch blogs");
        }
        const data = await response.json();
        // Parse the JSONB tags field for each blog
        const blogsWithParsedTags = data.map((blog: any) => ({
          ...blog,
          tags:
            typeof blog.tags === "string"
              ? JSON.parse(blog.tags)
              : blog.tags || [],
          metadata:
            typeof blog.metadata === "string"
              ? JSON.parse(blog.metadata)
              : blog.metadata || {},
        }));
        setBlogs(blogsWithParsedTags);
        setFilteredBlogs(blogsWithParsedTags);
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs();
  }, []);

  return (
    <div className="p-6 pt-16">
      <DirectSearch
        onSearch={handleSearch}
        blurEnabled={blurEnabled}
        onToggleBlur={handleToggleBlur}
      />

      <div className="w-full">
        {filteredBlogs.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-gray-700">
              No blogs found
            </h2>
            <p className="mt-2 text-gray-500">
              Try adjusting your search terms
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <div
                key={blog.id}
                className={`border overflow-hidden shadow-md transition-all duration-700 hover:scale-115 hover:z-10 hover:shadow-xl hover:blur-0 bg-gradient-to-br ${blog.metadata?.bgGradient || "from-gray-100 to-gray-200"} ${
                  spotlightId === blog.id &&
                  blurEnabled &&
                  !searchActive
                    ? "blur-0 scale-105 z-10 shadow-xl"
                    : !blurEnabled || searchActive
                      ? ""
                      : "blur-sm"
                }`}
              >
                <Link href={`blog/${blog.nickname}`}>
                  <div className="h-48 overflow-hidden relative group">
                    <div className="relative size-full">
                      <Image
                        src={
                          blog.image ||
                          "https://images.unsplash.com/photo-1620778182530-703effa65a06?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTh8fGJ0Y3xlbnwwfHwwfHx8MA%3D%3D"
                        }
                        alt={blog.title}
                        fill
                        className={`object-cover bg-black contrast-125 transition-all duration-700 ease-in-out ${
                          (spotlightId === blog.id &&
                            blurEnabled &&
                            !searchActive) ||
                          !blurEnabled
                            ? "grayscale-0"
                            : "grayscale"
                        } hover:grayscale-0`}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/placeholder-blog.jpg";
                        }}
                      />
                    </div>
                    <div
                      className={`absolute bottom-2 right-2 flex space-x-1 transition-opacity duration-300  ${
                        (spotlightId === blog.id &&
                          blurEnabled &&
                          !searchActive) ||
                        searchActive ||
                        !blurEnabled
                          ? "opacity-100"
                          : "opacity-0"
                      } group-hover:opacity-100`}
                    >
                      <span className="bg-primary/30 border backdrop-blur-md border-primary text-white text-xs px-2 py-1 rounded-bl-none rounded-tr-none rounded shadow-md">
                        {new Date(blog.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold dark:text-white text-black">
                        {blog.title}
                      </h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {blog.shortSummary}
                    </p>
                    <div className="flex flex-wrap gap-1 justify-end ">
                      {(blog.tags || []).map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-200/20 dark:bg-white/20 dark:text-white dark:border-white border border-black dark:hover:border dark:hover:text-primary hover:bg-primary/20 hover:border-primary hover:text-primary dark:hover:border-primary text-gray-700 text-xs px-2 py-1 "
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
