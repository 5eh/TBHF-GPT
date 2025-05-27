import { NextRequest, NextResponse } from "next/server";
import { createBlog } from "@/db/queries";

export const dynamic = "force-dynamic";

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

export async function POST(request: NextRequest) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 },
      );
    }

    const data: BlogSubmission = await request.json();
    console.log("Received data:", data);

    // Required fields validation
    const requiredFields = ['title', 'nickname', 'shortSummary', 'document'] as const;
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: "Missing required fields",
          fields: missingFields 
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }

    const blogData = {
      ...data,
      tags: data.tags || [],
      date: data.date ? new Date(data.date) : new Date(),
      metadata: data.metadata || {},
      shortSummary: data.shortSummary || '',
      authors: data.authors || '',
      finalNote: data.finalNote || '',
    };

    console.log("Processed data for DB:", blogData);

    // Ensure all properties are of the correct type before passing to DB
    const result = await createBlog({
      ...blogData,
      nickname: String(blogData.nickname || ''),
      image: String(blogData.image || ''),
      title: String(blogData.title || ''),
      banner: String(blogData.banner || ''),
      shortSummary: String(blogData.shortSummary || ''),
      document: String(blogData.document || ''),
      authors: String(blogData.authors || ''),
      finalNote: String(blogData.finalNote || ''),
    });

    return NextResponse.json(
      { message: "Blog created successfully", data: result },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create blog:", error);
    // Add more detailed error reporting
    return NextResponse.json(
      { 
        error: "Failed to create blog",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
