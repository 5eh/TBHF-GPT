import { NextRequest, NextResponse } from "next/server";
import { getBlogByNickname } from "@/db/queries";

interface Blog {
  id: number;
  nickname: string;
  image: string;
  title: string;
  banner: string;
  shortSummary: string;
  short_summary?: string;  // Database column name
  tags: string[];
  document: string;
  authors: string;
  finalNote: string;
  final_note?: string;  // Database column name
  date: string;
  metadata: Record<string, any>;
}

type ApiResponse = {
  data?: Blog;
  error?: string;
};

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { nickname: string } },
): Promise<NextResponse<ApiResponse>> {
  try {
    if (!params.nickname) {
      return NextResponse.json(
        { error: "Nickname parameter is required" },
        { status: 400 },
      );
    }

    const blog = await getBlogByNickname({
      nickname: params.nickname,
    });

    if (!blog) {
      return NextResponse.json(
        { error: "Blog not found" },
        { status: 404 },
      );
    }

    // Parse JSON fields if they are strings and map to the proper field names
    const processedBlog = {
      ...blog,
      tags: typeof blog.tags === 'string' ? JSON.parse(blog.tags) : blog.tags,
      metadata: typeof blog.metadata === 'string' ? JSON.parse(blog.metadata) : blog.metadata,
      shortSummary: blog.short_summary,
      finalNote: blog.final_note
    };

    return NextResponse.json({ data: processedBlog as Blog });
  } catch (error) {
    console.error("Failed to fetch blog:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
