import { generateObject } from "ai";
import { z } from "zod";
import {
  getAllOrganizations,
  getOrganizationById,
  getOrganizationByNickname,
} from "@/db/queries";
import { geminiFlashModel } from ".";

export async function getCharityCategories() {
  // Note: localStorage is only available in browser context, not in Node.js/server
  const cacheKey = "charity-categories";
  let cached;

  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined" && window.localStorage) {
      cached = localStorage.getItem(cacheKey);
    }

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.log("Cache retrieval error:", e);
  }

  const { object: categories } = (await generateObject({
    model: geminiFlashModel,
    prompt: `Generate a concise list of common charity categories`,
    output: "array",
    schema: z.array(
      z.object({
        id: z.string().describe("Unique identifier for the category"),
        name: z.string().describe("Name of the charity category"),
        description: z.string().describe("Brief description of the category"),
        popularCauses: z
          .array(z.string())
          .describe("Popular causes within this category"),
        iconName: z
          .string()
          .describe("Name of an icon that represents this category"),
      }),
    ),
  })) as { object: any[] };

  // Cache the result if in browser context
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      localStorage.setItem(cacheKey, JSON.stringify({ categories }));
    }
  } catch (e) {
    console.error("Cache storage error:", e);
  }

  return { categories };
}

export async function generateCharityRecommendations({
  userInterests,
  location,
  donationAmount,
}: {
  userInterests: string[];
  location?: string;
  donationAmount?: number;
}) {
  const { object: recommendations } = (await generateObject({
    model: geminiFlashModel,
    prompt: `Recommend top 3 charities based on: interests - ${userInterests.join(", ")}, location - ${location || "any"}, donation amount - ${donationAmount || "any"}`,
    output: "array",
    schema: z.array(
      z.object({
        id: z.string().describe("Unique identifier for the charity"),
        name: z.string().describe("Name of the charity organization"),
        category: z.string().describe("Primary category of the charity"),
        description: z
          .string()
          .max(120)
          .describe(
            "Brief description of why this charity matches the user's preferences",
          ),
        matchScore: z
          .number()
          .describe(
            "Score from 1-100 indicating how well this charity matches the user's preferences",
          ),
        impactHighlight: z
          .string()
          .max(80)
          .describe("Highlight of the potential impact of a donation"),
      }),
    ),
  })) as { object: any[] };

  return { recommendations };
}

export async function getDonationImpactReport({
  charityId,
  donationAmountInUSD,
  timeframe,
}: {
  charityId: string;
  donationAmountInUSD: number;
  timeframe: string;
}) {
  // Cache key for impact reports
  const cacheKey = `impact-${charityId}-${donationAmountInUSD}-${timeframe}`;
  let cached;

  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined" && window.sessionStorage) {
      cached = sessionStorage.getItem(cacheKey);
    }

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Cache retrieval error:", e);
    // Continue if cache parsing fails
  }

  const { object: impactReport } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate a concise impact report for a ${donationAmountInUSD} USD donation to charity ${charityId} over ${timeframe}`,
    output: "object",
    schema: z.object({
      summary: z.string().max(150).describe("Summary of the donation's impact"),
      metrics: z
        .array(
          z.object({
            name: z.string().describe("Name of the impact metric"),
            value: z.string().describe("Quantified impact value"),
            description: z
              .string()
              .max(80)
              .describe("Description of what this metric means"),
          }),
        )
        .max(3),
      timeline: z
        .array(
          z.object({
            milestone: z
              .string()
              .max(80)
              .describe("Description of an impact milestone"),
            timeframe: z.string().describe("When this impact will be achieved"),
          }),
        )
        .max(2),
      comparisons: z
        .array(z.string())
        .max(2)
        .describe("Comparisons to help understand the impact scale"),
      sustainabilityScore: z
        .number()
        .describe(
          "Score from 1-100 indicating the sustainability of this impact",
        ),
    }),
  });

  // Cache the result if in browser context
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(cacheKey, JSON.stringify(impactReport));
    }
  } catch (e) {
    console.error("Cache storage error:", e);
  }

  return impactReport;
}

// Cache for organizations to avoid repeated database queries and AI processing
let organizationsCache: {
  organizations: any[];
  timestamp: number;
} | null = null;

// Cache expiration time (5 minutes in milliseconds)
const CACHE_EXPIRATION = 5 * 60 * 1000;

export async function getOrganizationsList() {
  // Check if we have a valid cache
  if (
    organizationsCache &&
    Date.now() - organizationsCache.timestamp < CACHE_EXPIRATION
  ) {
    return organizationsCache;
  }

  // Fetch actual organizations from the database
  const dbOrganizations = await getAllOrganizations();

  // Process the organizations to handle tags and boolean values
  const organizations = dbOrganizations.map((org) => ({
    ...org,
    tags: typeof org.tags === "string" ? JSON.parse(org.tags) : org.tags,
    verified: !!org.verified,
    premium: !!org.premium,
    fullContext: org.fullContext || "",
    president: org.president || "",
    founder: org.founder || "",
    customMessage: org.customMessage || "",
    originDate: org.originDate || new Date().toISOString(),
  }));

  let enhancedOrgs: Array<{
    id: string;
    nickname: string;
    title: string;
    mission: string;
    tags: string[];
    verified: boolean;
    premium: boolean;
    impact: string;
    location: string | null;
    bitcoinAddress: string | null;
  }> = [];

  try {
    // Use organizations directly if they have essential fields
    if (
      organizations.length > 0 &&
      organizations.every((org) => org.title && org.nickname)
    ) {
      enhancedOrgs = organizations.map((org) => ({
        id: org.id,
        nickname: org.nickname,
        title: org.title,
        mission:
          org.mission ||
          `${org.title} is dedicated to making a positive impact.`,
        tags: org.tags || [],
        verified: org.verified || false,
        premium: org.premium || false,
        impact: org.fullContext || "Makes a positive impact in communities.",
        location: org.location || null,
        bitcoinAddress: org.bitcoinAddress || null,
      }));
    } else {
      // Only use AI enhancement if necessary
      const { object: aiEnhancedOrgs } = (await generateObject({
        model: geminiFlashModel,
        prompt: `Enhance these organizations concisely: ${JSON.stringify(
          organizations
            .map((o) => ({
              id: o.id,
              nickname: o.nickname,
              title: o.title,
            }))
            .slice(0, 5),
        )}`,
        output: "array",
        schema: z.array(
          z.object({
            id: z.string().describe("Organization's unique identifier"),
            nickname: z.string().describe("Organization's short name/nickname"),
            title: z.string().describe("Full organization name"),
            mission: z.string().describe("Organization's mission statement"),
            tags: z
              .array(z.string())
              .describe("Categories and tags for the organization"),
            verified: z
              .boolean()
              .describe("Whether the organization is verified"),
            premium: z
              .boolean()
              .describe("Whether the organization has premium status"),
            impact: z
              .string()
              .describe("Description of the organization's impact"),
            location: z.string().optional().describe("Organization's location"),
            bitcoinAddress: z
              .string()
              .optional()
              .describe("Bitcoin donation address"),
          }),
        ),
      })) as { object: any[] };
      // Convert AI-enhanced organizations to our expected format
      if (Array.isArray(aiEnhancedOrgs)) {
        enhancedOrgs = aiEnhancedOrgs.map((org: any) => ({
          id: String(org.id || ""),
          nickname: String(org.nickname || ""),
          title: String(org.title || ""),
          mission: String(org.mission || ""),
          tags: Array.isArray(org.tags) ? org.tags.map(String) : [],
          verified: Boolean(org.verified),
          premium: Boolean(org.premium),
          impact: String(org.impact || ""),
          location: org.location ? String(org.location) : null,
          bitcoinAddress: org.bitcoinAddress
            ? String(org.bitcoinAddress)
            : null,
        }));
      } else {
        // If somehow not an array, create a default entry
        enhancedOrgs = [
          {
            id: "default",
            nickname: "default",
            title: "Default Organization",
            mission: "Mission information unavailable",
            tags: [],
            verified: false,
            premium: false,
            impact: "Impact information unavailable",
            location: null,
            bitcoinAddress: null,
          },
        ];
      }
    }
  } catch (error) {
    console.error("Error enhancing organizations:", error);
    // Fallback to basic organization data without AI enhancement
    enhancedOrgs = organizations.map((org) => ({
      id: org.id,
      nickname: org.nickname,
      title: org.title || org.nickname,
      mission: org.mission || "Organization mission",
      tags: Array.isArray(org.tags) ? org.tags : [],
      verified: !!org.verified,
      premium: !!org.premium,
      impact: "Makes an impact in communities",
      location: org.location || null,
      bitcoinAddress: org.bitcoinAddress || null,
    }));
  }

  // Use enhancedOrgs directly as they're already validated
  const validatedOrgs = enhancedOrgs;

  // Update the cache
  organizationsCache = {
    organizations: validatedOrgs,
    timestamp: Date.now(),
  };

  return { organizations: validatedOrgs };
}

// Cache for organization details to avoid repeated database queries and AI processing
const organizationDetailsCache: Record<
  string,
  {
    details: any;
    timestamp: number;
  }
> = {};

// Cache expiration time (5 minutes in milliseconds)
const DETAILS_CACHE_EXPIRATION = 5 * 60 * 1000;

export async function getOrganizationDetails({
  orgId,
  nickname,
}: {
  orgId?: string;
  nickname?: string;
}) {
  // Create a cache key based on id or nickname
  const cacheKey = orgId || nickname || "";

  // Check if we have a valid cache entry
  if (
    organizationDetailsCache[cacheKey] &&
    Date.now() - organizationDetailsCache[cacheKey].timestamp <
      DETAILS_CACHE_EXPIRATION
  ) {
    return organizationDetailsCache[cacheKey].details;
  }

  // Fetch organization from database based on id or nickname
  const organization = orgId
    ? await getOrganizationById({ id: orgId })
    : await getOrganizationByNickname({ nickname: nickname! });

  if (!organization) {
    throw new Error("Organization not found");
  }

  // Process the organization data
  const processedOrg = {
    ...organization,
    tags:
      typeof organization.tags === "string"
        ? JSON.parse(organization.tags)
        : organization.tags,
    verified: !!organization.verified,
    premium: !!organization.premium,
  };

  // Use AI to enhance the organization details
  // First check if we need to enhance at all or can just return the processed org
  const hasAllRequiredFields =
    processedOrg.id &&
    processedOrg.nickname &&
    processedOrg.title &&
    processedOrg.mission &&
    processedOrg.tags;

  // If most fields exist, just use the processed org with minimal enhancements
  if (hasAllRequiredFields) {
    const enhancedDetails = {
      ...processedOrg,
      image: processedOrg.image || "https://placeholder.com/logo.png",
      fullContext: processedOrg.fullContext || processedOrg.mission,
      // Include any required fields with defaults if they're missing
    };
    return enhancedDetails;
  }

  // Otherwise use AI, but with reduced token usage
  const { object: enhancedDetails } = await generateObject({
    model: geminiFlashModel,
    prompt: `Provide essential information about this organization, keeping descriptions brief: ${JSON.stringify(processedOrg)}`,
    output: "object",
    schema: z.object({
      id: z.string().describe("Organization's unique identifier"),
      nickname: z.string().describe("Organization's short name/nickname"),
      image: z.string().describe("Organization's logo/image URL"),
      title: z.string().describe("Full organization name"),
      banner: z.string().optional().describe("Organization's banner image URL"),
      mission: z.string().max(150).describe("Organization's mission statement"),
      tags: z.array(z.string()).describe("Categories and tags"),
      verified: z.boolean().describe("Verification status"),
      premium: z.boolean().describe("Premium status"),
      bgGradient: z.string().optional().describe("Background gradient style"),
      location: z.string().optional().describe("Organization's location"),
      fullContext: z
        .string()
        .max(250)
        .describe("Detailed description and context"),
      website: z.string().optional().describe("Organization's website"),
      email: z.string().optional().describe("Contact email"),
      originDate: z
        .string()
        .optional()
        .describe("Organization's founding date"),
      registrationNumber: z
        .string()
        .optional()
        .describe("Official registration number"),
      president: z.string().optional().describe("Organization's president"),
      founder: z.string().optional().describe("Organization's founder"),
      bitcoinAddress: z
        .string()
        .optional()
        .describe("Bitcoin donation address"),
      customMessage: z.string().optional().describe("Custom donation message"),
      impactMetrics: z
        .array(
          z.object({
            metric: z.string().max(30).describe("Impact metric name"),
            value: z.string().max(20).describe("Impact metric value"),
            description: z
              .string()
              .max(50)
              .describe("Description of the impact"),
          }),
        )
        .max(2)
        .optional(),
    }),
  });

  // Update the cache
  organizationDetailsCache[cacheKey] = {
    details: enhancedDetails,
    timestamp: Date.now(),
  };

  return enhancedDetails;
}

export async function findCharities({
  category,
  keywords,
}: {
  category: string;
  keywords: string;
}) {
  // Cache search results for repeated queries
  const cacheKey = `charities-${category}-${keywords}`;
  let cached;

  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined" && window.sessionStorage) {
      cached = sessionStorage.getItem(cacheKey);
    }

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Cache retrieval error:", e);
    // Continue if cache parsing fails
  }

  const { object: charitySearchResults } = (await generateObject({
    model: geminiFlashModel,
    prompt: `Generate search results for charities in the ${category} category with focus on ${keywords}, limit to 3 results`,
    output: "array",
    schema: z.array(
      z.object({
        id: z.string().describe("Unique identifier for the charity"),
        name: z.string().describe("Name of the charity organization"),
        category: z.string().describe("Primary category of the charity"),
        description: z
          .string()
          .max(100)
          .describe("Brief description of the charity's mission"),
        location: z.object({
          city: z.string().describe("City where the charity is based"),
          country: z.string().describe("Country where the charity is based"),
        }),
        impactMetric: z
          .string()
          .max(60)
          .describe(
            "Primary impact metric (e.g., '100 meals per $50', '10 trees planted per $20')",
          ),

        minimumDonationInUSD: z
          .number()
          .describe("Minimum suggested donation in US dollars"),
      }),
    ),
  })) as { object: any[] };

  const result = { charities: charitySearchResults };
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(cacheKey, JSON.stringify(result));
    }
  } catch (e) {
    console.error("Cache storage error:", e);
  }

  return result;
}

export async function getCharityDetails({ charityId }: { charityId: string }) {
  // Cache charity details to avoid regenerating for the same charity
  const cacheKey = `charity-${charityId}`;
  let cached;

  try {
    // Check if we're in a browser environment
    if (typeof window !== "undefined" && window.sessionStorage) {
      cached = sessionStorage.getItem(cacheKey);
    }

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error("Cache retrieval error:", e);
    // Continue if cache parsing fails
  }

  const { object: charityDetails } = await generateObject({
    model: geminiFlashModel,
    prompt: `Provide concise information for charity with ID ${charityId}`,
    output: "object",
    schema: z.object({
      id: z.string().describe("Unique identifier for the charity"),
      name: z.string().describe("Name of the charity organization"),
      founded: z.number().describe("Year the charity was founded"),
      mission: z.string().max(150).describe("The charity's mission statement"),
      category: z.string().describe("Primary category of charity"),
      subcategories: z
        .array(z.string())
        .max(3)
        .describe("List of subcategories/focus areas"),
      location: z.object({
        headquarters: z.string().describe("City and country of headquarters"),
        operatingRegions: z
          .array(z.string())
          .max(3)
          .describe("Regions where the charity operates"),
      }),
      financials: z.object({
        totalAnnualBudget: z
          .number()
          .describe("Annual operating budget in USD"),
        programExpensePercentage: z
          .number()
          .describe("Percentage of funds that go to programs"),
        adminExpensePercentage: z
          .number()
          .describe("Percentage of funds that go to administration"),
        fundraisingExpensePercentage: z
          .number()
          .describe("Percentage of funds that go to fundraising"),
      }),
      impactMetrics: z
        .array(
          z.object({
            description: z
              .string()
              .max(60)
              .describe("Description of impact metric"),
            value: z
              .string()
              .max(40)
              .describe("Quantified impact per dollar amount"),
          }),
        )
        .max(2),
      websiteUrl: z.string().describe("URL to the charity's website"),
      bitcoinAddress: z
        .string()
        .describe("Bitcoin address for direct donations"),
      taxDeductible: z
        .boolean()
        .describe("Whether donations are tax-deductible"),
    }),
  });

  // Cache the results if in browser context
  try {
    if (typeof window !== "undefined" && window.sessionStorage) {
      sessionStorage.setItem(cacheKey, JSON.stringify(charityDetails));
    }
  } catch (e) {
    console.error("Cache storage error:", e);
  }

  return charityDetails;
}

export async function calculateDonation({
  charityId,
  charityName,
  donationAmountInUSD,
  isRecurring,
  recurringFrequency,
  donorName,
  matchingEnabled,
}: {
  charityId: string;
  charityName: string;
  donationAmountInUSD: number;
  isRecurring: boolean;
  recurringFrequency?: string;
  donorName: string;
  matchingEnabled: boolean;
}) {
  // For calculation, we can use a more direct approach with less AI overhead
  // Deterministic calculations can be performed directly

  // Calculate matching amount (simplified example)
  const matchingAmountInUSD = matchingEnabled ? donationAmountInUSD * 0.2 : 0;

  // Calculate total donation
  const totalDonationInUSD = donationAmountInUSD + matchingAmountInUSD;

  // Fetch latest BTC price - using a simplified approach for this example
  const btcPriceInUSD = 65000; // In a real app, fetch this from an API
  const totalDonationInBTC = totalDonationInUSD / btcPriceInUSD;

  // Transaction fee (simplified)
  const transactionFeeInUSD = Math.min(donationAmountInUSD * 0.015, 5);

  // Tax deduction estimate (simplified)
  const taxDeductionEstimateInUSD = donationAmountInUSD * 0.28;

  // If we need AI-generated content specifically, use a smaller model call
  const { object: aiGeneratedContent } = await generateObject({
    model: geminiFlashModel,
    prompt: `Generate only the estimated impact and donation purpose for a $${donationAmountInUSD} donation to ${charityName}`,
    output: "object",
    schema: z.object({
      estimatedImpact: z
        .string()
        .max(100)
        .describe("Estimated impact of donation"),
      donationPurpose: z.string().max(60).describe("Purpose for QR code"),
    }),
  });

  // Combine deterministic calculations with AI-generated content
  const donationDetails = {
    totalDonationInUSD,
    totalDonationInBTC,
    bitcoinAddress: `bc1q${charityId.substring(0, 8).toLowerCase()}`,
    donationPurpose: aiGeneratedContent.donationPurpose,
    estimatedImpact: aiGeneratedContent.estimatedImpact,
    transactionFeeInUSD,
    taxDeductionEstimateInUSD,
    matchingAmountInUSD,
    receiptId: `rcpt_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
  };

  return donationDetails;
}
