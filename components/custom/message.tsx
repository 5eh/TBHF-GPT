"use client";
// @ts-ignore
import { BitcoinQR } from "@ibunker/bitcoin-react";
import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import Image from "next/image";
import { ReactNode } from "react";
import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import "@ibunker/bitcoin-react/dist/index.css";

const CreateDonation = ({ donation }: { donation?: any }) => {
  if (!donation)
    return (
      <div className="w-full h-24 bg-gray-100 rounded-md animate-pulse"></div>
    );

  return (
    <div className="border rounded-md p-4 space-y-2">
      <h3 className="font-medium text-lg">Donation Summary</h3>
      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
        <div>
          <span className="font-medium">Charity:</span> {donation.charityName}
        </div>
        <div>
          <span className="font-medium">Amount:</span> $
          {donation.donationAmountInUSD}
        </div>
        <div>
          <span className="font-medium">Donor:</span> {donation.donorName}
        </div>
        <div>
          <span className="font-medium">Recurring:</span>{" "}
          {donation.isRecurring ? donation.recurringFrequency || "Yes" : "No"}
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-md mb-4">
        <div className="text-blue-800 font-medium mb-1">
          Ready to Make Your Impact
        </div>
        <p className="text-sm text-blue-700">
          Your donation will be processed securely. You can use Bitcoin for
          instant, secure payments.
        </p>
      </div>

      <div className="mt-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded-md w-full">
          Proceed to Payment
        </button>
      </div>
    </div>
  );
};

const OrganizationList = ({ organizations }: { organizations?: any }) => {
  if (!organizations)
    return (
      <div className="w-full h-24 bg-gray-100 rounded-md animate-pulse"></div>
    );

  return (
    <div className="border rounded-md p-4 space-y-3">
      <h3 className="font-medium text-lg">Available Organizations</h3>
      <div className="grid gap-4">
        {organizations.organizations?.map((org: any) => {
          const tags = Array.isArray(org.tags)
            ? org.tags
            : typeof org.tags === "string"
              ? JSON.parse(org.tags)
              : [];

          return (
            <div key={org.id} className="border rounded-lg p-3">
              <div className="flex items-center gap-3">
                {org.image && (
                  <img
                    src={org.image}
                    alt={org.title}
                    className="w-10 h-10 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {org.title}
                    {org.verified && <span className="text-blue-500">✓</span>}
                    {org.premium && <span className="text-amber-500">★</span>}
                  </div>
                  <div className="text-sm text-gray-600">{org.nickname}</div>
                </div>
              </div>
              <div className="text-sm mt-2">{org.mission}</div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.slice(0, 3).map((tag: string, index: number) => (
                    <span
                      key={index}
                      className="bg-gray-200/20 dark:bg-white/20 dark:text-white dark:border-white border border-black dark:hover:border dark:hover:text-primary hover:bg-primary/20 hover:border-primary hover:text-primary dark:hover:border-primary text-gray-700 text-xs px-2 py-1 "
                    >
                      {tag}
                    </span>
                  ))}
                  {tags.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
              {org.location && (
                <div className="text-xs text-gray-500 mt-2">
                  📍 {org.location}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SearchCharities = ({ results }: { results?: any }) => {
  if (!results)
    return (
      <div className="w-full h-24 bg-gray-100 rounded-md animate-pulse"></div>
    );

  return (
    <div className="border rounded-md p-4 space-y-3">
      <h3 className="font-medium text-lg">Charity Search Results</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {results.charities?.map((charity: any) => (
          <div
            key={charity.id}
            className="border overflow-hidden shadow-md transition-all duration-700 hover:scale-105 hover:z-10 hover:shadow-xl bg-gradient-to-br from-white to-gray-50"
          >
            <div className="h-40 overflow-hidden relative group">
              <div className="relative size-full">
                <Image
                  src={charity.image || "/placeholder-org.jpg"}
                  alt={charity.name}
                  fill
                  className="object-cover contrast-125 transition-all duration-700 ease-in-out hover:grayscale-0"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "/placeholder-org.jpg";
                  }}
                />
              </div>
              <div className="absolute bottom-2 right-2 flex space-x-1">
                {charity.verified && (
                  <span className="bg-primary/30 border backdrop-blur-md border-primary text-white text-xs px-2 py-1 rounded shadow-md">
                    Verified
                  </span>
                )}
                {charity.premium && (
                  <span className="bg-[#f7931a]/30 border border-[#f7931a] backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                    Premium
                  </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-black">{charity.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {charity.description}
              </p>
              <div className="flex flex-wrap gap-1 justify-end">
                {(charity.tags || []).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="bg-gray-200/20 border border-black hover:bg-primary/20 hover:border-primary hover:text-primary text-gray-700 text-xs px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CharityDetails = ({ charityInfo }: { charityInfo?: any }) => {
  if (!charityInfo)
    return (
      <div className="w-full h-36 bg-gray-100 rounded-md animate-pulse"></div>
    );

  const tags = Array.isArray(charityInfo.tags)
    ? charityInfo.tags
    : typeof charityInfo.tags === "string"
      ? JSON.parse(charityInfo.tags)
      : [];

  return (
    <div className="border rounded-md overflow-hidden shadow-md">
      <div className="h-48 relative">
        <Image
          src={
            charityInfo.banner || charityInfo.image || "/placeholder-org.jpg"
          }
          alt={charityInfo.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute bottom-4 left-4 flex items-center gap-3">
          <div className="size-16 rounded-full overflow-hidden border-2 border-white relative">
            <Image
              src={charityInfo.image || "/placeholder-org.jpg"}
              alt={charityInfo.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          </div>
          <div className="text-white text-shadow">
            <h3 className="text-xl font-bold">{charityInfo.name}</h3>
            <div className="flex items-center gap-2">
              {charityInfo.verified && (
                <span className="bg-primary/30 border backdrop-blur-md border-primary text-white text-xs px-2 py-1 rounded">
                  Verified
                </span>
              )}
              {charityInfo.premium && (
                <span className="bg-[#f7931a]/30 border border-[#f7931a] backdrop-blur-md text-white text-xs px-2 py-1 rounded">
                  Premium
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-600 mb-4">{charityInfo.mission}</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="font-medium">Location:</span>
            <p className="text-gray-600">
              {charityInfo.location?.headquarters}
            </p>
          </div>
          <div>
            <span className="font-medium">Founded:</span>
            <p className="text-gray-600">{charityInfo.founded}</p>
          </div>
          <div>
            <span className="font-medium">Program Expenses:</span>
            <p className="text-gray-600">
              {charityInfo.financials?.programExpensePercentage}%
            </p>
          </div>
          <div>
            <span className="font-medium">Tax Deductible:</span>
            <p className="text-gray-600">
              {charityInfo.taxDeductible ? "Yes" : "No"}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="bg-gray-200/20 border border-black hover:bg-primary/20 hover:border-primary hover:text-primary text-gray-700 text-xs px-2 py-1"
            >
              {tag}
            </span>
          ))}
        </div>
        {charityInfo.bitcoinAddress && (
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium mb-2">Bitcoin Donation Address</h4>
            <div className="bg-white p-2 rounded border text-sm font-mono break-all">
              {charityInfo.bitcoinAddress}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const OrganizationDetails = ({ organization }: { organization?: any }) => {
  if (!organization)
    return (
      <div className="w-full h-36 bg-gray-100 rounded-md animate-pulse"></div>
    );

  const tags = Array.isArray(organization.tags)
    ? organization.tags
    : typeof organization.tags === "string"
      ? JSON.parse(organization.tags)
      : [];

  return (
    <div className="border rounded-md dark:border-white  p-4">
      <div className="flex items-center gap-3 mb-4">
        {organization.image && (
          <img
            src={organization.image}
            alt={organization.title}
            className="w-12 h-12"
          />
        )}
        <div>
          <h3 className="font-medium text-lg">{organization.title}</h3>
          <div className="text-sm text-gray-600">{organization.nickname}</div>
        </div>
      </div>
      <p className="my-2">{organization.mission}</p>
      <div className="grid grid-cols-2 gap-2 text-sm">
        {organization.location && (
          <div>
            <span className="font-medium">Location:</span>{" "}
            {organization.location}
          </div>
        )}
        {organization.website && (
          <div>
            <span className="font-medium">Website:</span>{" "}
            <a
              href={organization.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              Visit Site
            </a>
          </div>
        )}
        {organization.founder && (
          <div>
            <span className="font-medium">Founder:</span> {organization.founder}
          </div>
        )}
        {organization.president && (
          <div>
            <span className="font-medium">President:</span>{" "}
            {organization.president}
          </div>
        )}
      </div>
      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.map((tag: string, index: number) => (
            <span
              key={index}
              className="bg-gray-200/20 dark:bg-white/20 dark:text-white dark:border-white border border-black dark:hover:border dark:hover:text-primary hover:bg-primary/20 hover:border-primary hover:text-primary dark:hover:border-primary text-gray-700 text-xs px-2 py-1 "
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      {organization.fullContext && (
        <div className="mt-4 p-3 bg-gray-50 border-primary border dark:bg-primary/20 text-sm">
          <span className="font-medium dark:text-white">
            Additional Context:
          </span>
          <p className="mt-1 dark:text-white/80">{organization.fullContext}</p>
        </div>
      )}
      {organization.bitcoinAddress && (
        <div className="">
          <div className="mt-4 p-3 bg-gray-50 border-primary border dark:bg-primary/20 text-sm">
            <h4 className="font-medium mb-2">Bitcoin Donation Address</h4>

            {organization.bitcoinAddress}
          </div>
        </div>
      )}
    </div>
  );
};

const DonationCalculator = ({ donationDetails }: { donationDetails?: any }) => {
  if (!donationDetails)
    return (
      <div className="w-full h-24 bg-gray-100 rounded-md animate-pulse"></div>
    );

  return (
    <div className="border rounded-md p-4 space-y-2">
      <h3 className="font-medium text-lg">Donation Details</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">Amount (USD):</span> $
          {donationDetails.totalDonationInUSD}
        </div>
        <div>
          <span className="font-medium">Amount (BTC):</span> ₿
          {donationDetails.totalDonationInBTC}
        </div>
        <div>
          <span className="font-medium">Transaction Fee:</span> $
          {donationDetails.transactionFeeInUSD}
        </div>
        <div>
          <span className="font-medium">Tax Deduction:</span> $
          {donationDetails.taxDeductionEstimateInUSD}
        </div>
        {donationDetails.matchingAmountInUSD > 0 && (
          <div className="col-span-2">
            <span className="font-medium">Matching Amount:</span> $
            {donationDetails.matchingAmountInUSD}
          </div>
        )}
      </div>
      <div className="mt-2 p-2 bg-green-50 text-green-800 rounded-md">
        <span className="font-medium">Impact:</span>{" "}
        {donationDetails.estimatedImpact}
      </div>

      {donationDetails.bitcoinAddress && (
        <div className="mt-4 border-t pt-4">
          <h4 className="font-medium mb-2">Quick Bitcoin Donation</h4>
          <BitcoinQR
            amount={donationDetails.totalDonationInBTC}
            bitcoinAddress={donationDetails.bitcoinAddress}
            message={donationDetails.donationPurpose || "Support this cause"}
            title="Direct Donation"
          />
        </div>
      )}
    </div>
  );
};

const PaymentAuth = ({ intent }: { intent?: any }) => {
  if (!intent)
    return (
      <div className="w-full h-24 bg-gray-100 rounded-md animate-pulse"></div>
    );

  return (
    <div className="border rounded-md p-4 space-y-2">
      <h3 className="font-medium text-lg">Make a Bitcoin Donation</h3>
      <div className="text-sm text-gray-600 mb-2">
        Scan the QR code below to complete your donation
      </div>
      <BitcoinQR
        amount={intent.donationAmount || 0.00001}
        bitcoinAddress={
          intent.bitcoinAddress || "bc1qljwyvtarj5mvtf85ch3fa042qmquuemqgfh3wg"
        }
        message={intent.donationPurpose || "Support this charitable cause"}
        title={intent.charityName || "Charity Donation"}
      />
    </div>
  );
};

const VerifyDonation = ({ result }: { result?: any }) => {
  if (!result)
    return (
      <div className="w-full h-16 bg-gray-100 rounded-md animate-pulse"></div>
    );

  return (
    <div className="border rounded-md p-4">
      <div
        className={`flex items-center ${result?.hasCompletedPayment ? "text-green-600" : "text-amber-600"}`}
      >
        <div
          className={`rounded-full size-6 mr-2 flex items-center justify-center ${result?.hasCompletedPayment ? "bg-green-100" : "bg-amber-100"}`}
        >
          {result?.hasCompletedPayment ? "✓" : "!"}
        </div>
        <span className="font-medium">
          {result?.hasCompletedPayment
            ? "Payment verified successfully"
            : "Payment pending verification"}
        </span>
      </div>
    </div>
  );
};

const DonationReceipt = ({ receipt }: { receipt?: any }) => {
  if (!receipt)
    return (
      <div className="w-full h-36 bg-gray-100 rounded-md animate-pulse"></div>
    );

  return (
    <div className="border rounded-md p-4 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium text-lg">Donation Receipt</h3>
        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          Tax Deductible
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="font-medium">Receipt ID:</span> {receipt.donationId}
        </div>
        <div>
          <span className="font-medium">Date:</span>{" "}
          {new Date(receipt.donationDate).toLocaleDateString()}
        </div>
        <div>
          <span className="font-medium">Donor:</span> {receipt.donorName}
        </div>
        <div>
          <span className="font-medium">Charity:</span> {receipt.charityName}
        </div>
        <div>
          <span className="font-medium">Amount:</span> $
          {receipt.donationAmountInUSD}
        </div>
        <div>
          <span className="font-medium">Type:</span>{" "}
          {receipt.isRecurring ? "Recurring" : "One-time"}
        </div>
      </div>
      <div className="mt-2 p-2 bg-blue-50 text-blue-800 rounded-md">
        <span className="font-medium">Impact:</span> {receipt.estimatedImpact}
      </div>
      <div className="mt-2">
        <button className="border border-blue-500 text-blue-500 px-4 py-2 rounded-md w-full">
          Download Receipt PDF
        </button>
      </div>
    </div>
  );
};

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation) => {
              const { toolName, toolCallId, state } = toolInvocation;

              if (state === "result") {
                const { result } = toolInvocation;

                return (
                  <div key={toolCallId}>
                    {toolName === "getOrganizations" ? (
                      <OrganizationList organizations={result} />
                    ) : toolName === "getOrganizationInfo" ? (
                      <OrganizationDetails organization={result} />
                    ) : toolName === "searchCharities" ? (
                      <SearchCharities results={result} />
                    ) : toolName === "getCharityInfo" ? (
                      <CharityDetails charityInfo={result} />
                    ) : toolName === "processDonation" ? (
                      <DonationCalculator donationDetails={result} />
                    ) : toolName === "createDonation" ? (
                      Object.keys(result).includes("error") ? null : (
                        <CreateDonation donation={result} />
                      )
                    ) : toolName === "authorizePayment" ? (
                      <PaymentAuth intent={result} />
                    ) : toolName === "generateDonationReceipt" ? (
                      <DonationReceipt receipt={result} />
                    ) : toolName === "verifyPayment" ? (
                      <VerifyDonation result={result} />
                    ) : (
                      <div>{JSON.stringify(result, null, 2)}</div>
                    )}
                  </div>
                );
              } else {
                return (
                  <div key={toolCallId} className="skeleton">
                    {toolName === "getOrganizations" ? (
                      <OrganizationList />
                    ) : toolName === "getOrganizationInfo" ? (
                      <OrganizationDetails />
                    ) : toolName === "searchCharities" ? (
                      <SearchCharities />
                    ) : toolName === "getCharityInfo" ? (
                      <CharityDetails />
                    ) : toolName === "processDonation" ? (
                      <DonationCalculator />
                    ) : toolName === "createDonation" ? (
                      <CreateDonation />
                    ) : toolName === "authorizePayment" ? (
                      <PaymentAuth />
                    ) : toolName === "generateDonationReceipt" ? (
                      <DonationReceipt />
                    ) : null}
                  </div>
                );
              }
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};
