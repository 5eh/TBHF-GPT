import { NextResponse } from "next/server";
import { getAllBlogs } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const blogs = await getAllBlogs();

    if (!blogs || blogs.length === 0) {
      return NextResponse.json(
        { error: "No blogs found" },
        { status: 404 },
      );
    }

    // Parse JSON fields if they are strings and map to proper field names
    const processedBlogs = blogs.map(blog => ({
      ...blog,
      tags: typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags,
      metadata: typeof blog.metadata === 'string' ? JSON.parse(blog.metadata) : blog.metadata,
      shortSummary: blog.short_summary,
      finalNote: blog.final_note
    }));

    return NextResponse.json(processedBlogs);
  } catch (error) {
    console.error("Failed to fetch blogs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
