import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  user,
  chat,
  User,
  reservation,
  organization,
  Organization,
} from "./schema";

let client = postgres(`${process.env.POSTGRES_URL!}?sslmode=require`);
let db = drizzle(client);

export async function getUser(email: string): Promise<Array<User>> {
  try {
    return await db.select().from(user).where(eq(user.email, email));
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    return await db.insert(user).values({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    const selectedChats = await db.select().from(chat).where(eq(chat.id, id));

    if (selectedChats.length > 0) {
      return await db
        .update(chat)
        .set({
          messages: JSON.stringify(messages),
        })
        .where(eq(chat.id, id));
    }

    return await db.insert(chat).values({
      id,
      createdAt: new Date(),
      messages: JSON.stringify(messages),
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    return await db.delete(chat).where(eq(chat.id, id));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    const [selectedChat] = await db.select().from(chat).where(eq(chat.id, id));
    return selectedChat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  return await db.insert(reservation).values({
    id,
    createdAt: new Date(),
    userId,
    hasCompletedPayment: false,
    details: JSON.stringify(details),
  });
}

export async function getReservationById({ id }: { id: string }) {
  const [selectedReservation] = await db
    .select()
    .from(reservation)
    .where(eq(reservation.id, id));

  return selectedReservation;
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  return await db
    .update(reservation)
    .set({
      hasCompletedPayment,
    })
    .where(eq(reservation.id, id));
}

export async function createOrganization(org: {
  nickname: string;
  image: string;
  title: string;
  banner: string;
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
  startDate: string;
  registrationNumber: string;
  president: string;
  founder: string;
  customMessage: string;
}) {
  try {
    const newOrg = {
      ...org,
      createdAt: new Date(),
      updatedAt: new Date(),
      verified: false,
      premium: false,
      tags: JSON.stringify(org.tags),
    };

    return await db.insert(organization).values(newOrg);
  } catch (error) {
    console.error("Failed to create organization in database");
    throw error;
  }
}

export async function getOrganizationById({ id }: { id: string }) {
  try {
    const [selectedOrg] = await db
      .select()
      .from(organization)
      .where(eq(organization.id, id));
    return selectedOrg;
  } catch (error) {
    console.error("Failed to get organization by id from database");
    throw error;
  }
}

export async function getAllOrganizations() {
  try {
    return await db.select().from(organization).orderBy(desc(organization));
  } catch (error) {
    console.error("Failed to get all organizations from database");
    throw error;
  }
}

export async function updateOrganization({
  id,
  values,
}: {
  id: string;
  values: Partial<Organization>;
}) {
  try {
    return await db
      .update(organization)
      .set(values)
      .where(eq(organization.id, id));
  } catch (error) {
    console.error("Failed to update organization in database");
    throw error;
  }
}

export async function deleteOrganizationById({ id }: { id: string }) {
  try {
    return await db.delete(organization).where(eq(organization.id, id));
  } catch (error) {
    console.error("Failed to delete organization by id from database");
    throw error;
  }
}

export async function getOrganizationByNickname({
  nickname,
}: {
  nickname: string;
}) {
  try {
    const [selectedOrg] = await db
      .select()
      .from(organization)
      .where(eq(organization.nickname, nickname));
    return selectedOrg;
  } catch (error) {
    console.error("Failed to get organization by nickname from database");
    throw error;
  }
}
