import { NextRequest, NextResponse } from "next/server";
import { getOrganizationByNickname } from "@/db/queries";

interface Organization {
  id: string;
  image: string;
  title: string;
  mission: string;
  tags: string[];
  verified: boolean;
  premium: boolean;
  bgGradient: string;
  bitcoinAddress: string;
  location: string;
  fullContext: string;
  website: string;
  email: string;
  originDate: string;
  registrationNumber: string;
  president: string;
  founder: string;
  banner: string;
  nickname: string;
  customMessage: string;
  createdAt: string;
  updatedAt: string;
}

type ApiResponse = {
  data?: Organization;
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

    const organization = await getOrganizationByNickname({
      nickname: params.nickname,
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organization not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: organization as Organization });
  } catch (error) {
    console.error("Failed to fetch organization:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    );
  }
}
