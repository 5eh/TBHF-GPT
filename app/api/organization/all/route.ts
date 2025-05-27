import { NextResponse } from "next/server";
import { getAllOrganizations } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const organizations = await getAllOrganizations();

    if (!organizations || organizations.length === 0) {
      return NextResponse.json(
        { error: "No organizations found" },
        { status: 404 },
      );
    }

    return NextResponse.json(organizations);
  } catch (error) {
    console.error("Failed to fetch organizations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
