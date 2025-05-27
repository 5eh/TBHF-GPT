import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";
import { geminiProModel } from "@/ai";
import {
  findCharities,
  getCharityDetails,
  calculateDonation,
  getOrganizationsList,
  getOrganizationDetails,
} from "@/ai/actions";
import { auth } from "@/app/(auth)/auth";
import {
  createReservation,
  deleteChatById,
  getChatById,
  getReservationById,
  saveChat,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    id,
    messages,
  }: {
    id: string;
    messages: Array<Message>;
  } = await request.json();

  if (!id || !Array.isArray(messages)) {
    return new Response("Invalid request format", { status: 400 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0,
  );

  const result = await streamText({
    model: geminiProModel,
    temperature: 0.5,
    system: `
      - you are 'Fund The World', a platform that helps users discover and donate to charity organizations!
      - when asked about specific organizations, use the getOrganizationInfo or getOrganizations tool to fetch details
      - for TBHF (The Black History Foundation), make sure to include their full mission and context
      - keep your responses limited to a sentence, unless the user wants a good understanding of a specific charity
      - ONLY output lists if the user asks for information about a category of organizations
      - today's date is ${new Date().toLocaleDateString()}
      - ask follow up questions to nudge user into the optimal flow
      - ask for any details you don't know
      - be knowledgeable and passionate about social impact and charitable causes
      - emphasize the concrete impact donations can make (e.g., "$10 provides 5 meals"), HOWEVER, be clear that this is an estimate
      - highlight tax deduction benefits IF applicable, and IF the user wants that
      - here's the optimal flow:
        - search for charities based on user's interests/causes
        - provide charity details and impact information
        - calculate donation (ask user about donation amount, recurring options)
        - process donation (ask user whether to proceed with payment or modify donation)
        - provide donation receipt and impact summary after payment confirmation
    `,
    messages: coreMessages,
    tools: {
      createDonation: {
        description: "Create a donation record in the database",
        parameters: z.object({
          charityId: z.string().describe("Unique identifier for the charity"),
          charityName: z.string().describe("Name of the charity"),
          donationAmountInUSD: z.number().describe("Donation amount in USD"),
          donationAmountInBTC: z
            .number()
            .optional()
            .describe("Donation amount in BTC"),
          bitcoinAddress: z
            .string()
            .optional()
            .describe("Bitcoin address for donation"),
          isRecurring: z
            .boolean()
            .describe("Whether this is a recurring donation"),
          recurringFrequency: z
            .string()
            .optional()
            .describe(
              "Frequency of recurring donation (e.g., monthly, quarterly, yearly)",
            ),
          donorName: z.string().describe("Name of the donor"),
          donorEmail: z
            .string()
            .optional()
            .describe("Email of the donor for receipt"),
        }),
        execute: async (props) => {
          const session = await auth();
          const id = generateUUID();

          if (session && session.user && session.user.id) {
            await createReservation({
              id,
              userId: session.user.id,
              details: { ...props },
            });

            return { id, ...props, success: true };
          } else {
            return { error: "User is not signed in to perform this action!" };
          }
        },
      },
      authorizePayment: {
        description:
          "User will enter credentials to authorize donation payment, wait for user to respond when they are done",
        parameters: z.object({
          donationId: z.string().describe("Unique identifier for the donation"),
          charityName: z
            .string()
            .describe("Name of the charity receiving the donation"),
          bitcoinAddress: z.string().describe("Bitcoin address for donation"),
          donationAmount: z.number().describe("Amount of BTC to donate"),
          donationPurpose: z
            .string()
            .describe("Purpose of the donation for QR code message"),
        }),
        execute: async ({
          donationId,
          charityName,
          bitcoinAddress,
          donationAmount,
          donationPurpose,
        }) => {
          return {
            donationId,
            charityName,
            bitcoinAddress,
            donationAmount,
            donationPurpose,
          };
        },
      },
      verifyPayment: {
        description: "Verify donation payment status",
        parameters: z.object({
          donationId: z.string().describe("Unique identifier for the donation"),
        }),
        execute: async ({ donationId }) => {
          const donation = await getReservationById({ id: donationId });
          return { hasCompletedPayment: !!donation?.hasCompletedPayment };
        },
      },
      generateDonationReceipt: {
        description: "Generate a receipt for a completed donation",
        parameters: z.object({
          donationId: z.string().describe("Unique identifier for the donation"),
          donorName: z.string().describe("Name of the donor, in title case"),
          charityName: z.string().describe("Name of the charity"),
          donationAmountInUSD: z.number().describe("Donation amount in USD"),
          donationAmountInBTC: z
            .number()
            .optional()
            .describe("Donation amount in BTC if applicable"),
          donationDate: z.string().describe("ISO 8601 date of donation"),
          isRecurring: z
            .boolean()
            .describe("Whether this is a recurring donation"),
          estimatedImpact: z
            .string()
            .describe("Estimated impact of the donation"),
          bitcoinTxId: z
            .string()
            .optional()
            .describe("Bitcoin transaction ID if paid via Bitcoin"),
        }),
        execute: async (receiptDetails) => {
          return receiptDetails;
        },
      },
      searchCharities: {
        description: "Search for charities based on category and keywords",
        parameters: z.object({
          category: z
            .string()
            .describe(
              "Category of charity (e.g., Education, Health, Environment)",
            ),
          keywords: z
            .string()
            .describe("Keywords to narrow down charity search"),
        }),
        execute: async ({ category, keywords }) => {
          const results = await findCharities({ category, keywords });
          return results;
        },
      },
      getCharityInfo: {
        description: "Get detailed information about a specific charity",
        parameters: z.object({
          charityId: z.string().describe("Unique identifier for the charity"),
        }),
        execute: async ({ charityId }) => {
          const charityInfo = await getCharityDetails({ charityId });
          return charityInfo;
        },
      },
      processDonation: {
        description: "Calculate donation details including impact and receipt",
        parameters: z.object({
          charityId: z.string().describe("Unique identifier for the charity"),
          charityName: z.string().describe("Name of the charity"),
          donationAmountInUSD: z.number().describe("Donation amount in USD"),
          isRecurring: z
            .boolean()
            .describe("Whether this is a recurring donation"),
          recurringFrequency: z
            .string()
            .optional()
            .describe(
              "Frequency of recurring donation (e.g., monthly, quarterly, yearly)",
            ),
          donorName: z.string().describe("Name of the donor"),
          bitcoinPreferred: z
            .boolean()
            .optional()
            .describe("Whether the user prefers to donate with Bitcoin"),
        }),
        execute: async (props) => {
          // Use a more direct approach for donation calculations to reduce token usage
          try {
            return await calculateDonation(props);
          } catch (error) {
            console.error("Error calculating donation:", error);
            // Return a minimal response to keep the conversation going
            return {
              totalDonationInUSD: props.donationAmountInUSD,
              totalDonationInBTC: props.donationAmountInUSD / 100000,
              bitcoinAddress: "1BitcoinAddressPlaceholder",
              donationPurpose: `Donation to ${props.charityName}`,
              estimatedImpact:
                "Your donation will help support this organization's mission",
              transactionFeeInUSD: 0,
              taxDeductionEstimateInUSD: 0,
              receiptId: "receipt_placeholder",
            };
          }
        },
      },
      getOrganizations: {
        description: "Get list of all available charity organizations",
        parameters: z.object({}),
        execute: async () => {
          try {
            const result = await getOrganizationsList();
            // Validate organizations to prevent JSON parsing errors
            const safeOrganizations = result.organizations.map((org: any) => ({
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
            return { organizations: safeOrganizations };
          } catch (error) {
            console.error("Error fetching organizations:", error);
            return { organizations: [] };
          }
        },
      },
      getOrganizationInfo: {
        description: "Get detailed information about a specific organization",
        parameters: z.object({
          orgId: z.string().optional().describe("Organization ID"),
          nickname: z.string().optional().describe("Organization nickname"),
        }),
        execute: async ({ orgId, nickname }) => {
          try {
            const details = await getOrganizationDetails({ orgId, nickname });
            // Validate organization details to prevent JSON parsing errors
            return {
              id: String(details.id || orgId || nickname || "unknown"),
              nickname: String(details.nickname || nickname || "unknown"),
              title: String(details.title || "Organization"),
              mission: String(details.mission || "Information unavailable"),
              image: String(details.image || ""),
              tags: Array.isArray(details.tags) ? details.tags.map(String) : [],
              verified: Boolean(details.verified),
              premium: Boolean(details.premium),
              bgGradient: details.bgGradient
                ? String(details.bgGradient)
                : null,
              location: details.location ? String(details.location) : null,
              fullContext: String(details.fullContext || details.mission || ""),
              website: details.website ? String(details.website) : null,
              email: details.email ? String(details.email) : null,
              originDate: details.originDate
                ? String(details.originDate)
                : null,
              registrationNumber: details.registrationNumber
                ? String(details.registrationNumber)
                : null,
              president: details.president ? String(details.president) : null,
              founder: details.founder ? String(details.founder) : null,
              banner: details.banner ? String(details.banner) : null,
              bitcoinAddress: details.bitcoinAddress
                ? String(details.bitcoinAddress)
                : null,
              customMessage: details.customMessage
                ? String(details.customMessage)
                : null,
            };
          } catch (error) {
            console.error("Error fetching organization details:", error);
            return {
              id: String(orgId || nickname || "unknown"),
              nickname: String(nickname || "unknown"),
              title: "Organization not found",
              mission: "Information unavailable",
              image: "",
              tags: [],
            };
          }
        },
      },
    },
    onFinish: async ({ responseMessages }) => {
      if (session?.user?.id) {
        setTimeout(async () => {
          try {
            const validMessages = [...coreMessages, ...responseMessages].filter(
              (msg) =>
                msg &&
                typeof msg.content === "string" &&
                msg.content.length > 0,
            );

            await saveChat({
              id,
              messages: validMessages,
              userId: session.user?.id || "",
            });
          } catch (error) {
            console.error("Failed to save chat:", error);
          }
        }, 100);
      }
    },
  });

  try {
    return result.toDataStreamResponse({
      headers: {
        "Cache-Control": "no-cache, no-transform",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Error generating response stream:", error);
    return new Response(
      "An error occurred while processing your request. Please try again.",
      {
        status: 500,
        headers: {
          "Content-Type": "text/plain",
        },
      },
    );
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });
    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
