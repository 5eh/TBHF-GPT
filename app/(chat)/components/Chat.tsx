"use client";

import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Organization {
  id: string;
  nickname: string;
  image: string;
  title: string;
  mission: string;
  tags: unknown;
  verified: boolean;
  premium: boolean;
  bgGradient: string | null;
  location: string | null;
  fullContext: string | null;
  website: string | null;
  email: string | null;
  originDate: Date | null;
  registrationNumber: string | null;
  president: string | null;
  founder: string | null;
  banner: string | null;
  bitcoinAddress: string | null;
  customMessage: string | null;
}

interface ChatProps {
  id: string;
  initialMessages: any[];
}

export default function Chat({ id, initialMessages }: ChatProps) {
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    id,
    initialMessages,
    api: '/api/chat',
    body: {
      organizations: organizations.map(org => ({
        ...org,
        tags: Array.isArray(org.tags) ? org.tags : [],
        originDate: org.originDate?.toISOString() || null
      }))
    },
    onError: (error) => {
      console.error('Chat error:', error);
      setError('Failed to send message. Please try again.');
    },
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await fetch("/api/organization/all");
        if (!response.ok) {
          throw new Error("Failed to fetch organizations");
        }
        const data = await response.json();
        const orgsWithParsedTags = data.map((org: any) => ({
          ...org,
          tags:
            typeof org.tags === "string"
              ? JSON.parse(org.tags)
              : org.tags || [],
        }));
        setOrganizations(orgsWithParsedTags);
      } catch (error) {
        console.error("Error fetching organizations:", error);
        setError("Failed to load organizations. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      await handleSubmit(e);
    } catch (error) {
      console.error('Error submitting message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => router.refresh()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-4 rounded-lg ${
              message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"
            } max-w-[80%]`}
          >
            <p className="text-sm text-gray-800">{message.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask about charities or how to donate..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
