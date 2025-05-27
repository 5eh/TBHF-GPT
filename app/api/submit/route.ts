import { NextRequest, NextResponse } from "next/server";
import { createOrganization } from "@/db/queries";

export const dynamic = "force-dynamic";

interface OrganizationSubmission {
  nickname: string;
  image: string;
  title: string;
  banner: string;
  mission: string;
  tags: string[];
  bgGradient: string;
  bitcoinAddress: string;
  location: string;
  fullContext: string;
  website: string;
  email: string;
  startDate: string;
  registrationNumber: string;
  president: string;
  founder: string;
  customMessage: string;
  verified: boolean;
  premium: boolean;
}

export async function POST(request: NextRequest) {
  try {
    if (!request.body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 },
      );
    }

    const data: OrganizationSubmission = await request.json();
    console.log("Received data:", data);

    // Required fields validation
    const requiredFields = ['title', 'email', 'bitcoinAddress', 'nickname', 'mission'] as const;
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
    if (!bitcoinRegex.test(data.bitcoinAddress)) {
      return NextResponse.json(
        { error: "Invalid Bitcoin address format" },
        { status: 400 }
      );
    }


    if (!Array.isArray(data.tags)) {
      data.tags = [];
    }

    const organizationData = {
      ...data,
      verified: false,
      premium: false,
      tags: data.tags || [],
      startDate: data.startDate || new Date().toISOString(),
    };

    console.log("Processed data for DB:", organizationData);

    const result = await createOrganization(organizationData);

    return NextResponse.json(
      { message: "Organization created successfully", data: result },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create organization:", error);
    return NextResponse.json(
      { 
        error: "Failed to create organization",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
