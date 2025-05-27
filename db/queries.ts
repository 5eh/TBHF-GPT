import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  user,
  chat,
  User,
  reservation,
  blogs,
  Blog,
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

export async function createBlog(blog: {
  nickname: string;
  image: string;
  title: string;
  banner: string;
  shortSummary: string;
  tags: string[];
  document: string;
  authors: string;
  finalNote: string;
  date: Date | string;
  metadata?: Record<string, any>;
}) {
  try {
    // Map the input fields to match the database column names
    const newBlog = {
      nickname: blog.nickname,
      image: blog.image,
      title: blog.title,
      banner: blog.banner,
      short_summary: blog.shortSummary,
      document: blog.document,
      authors: blog.authors,
      final_note: blog.finalNote,
      date: blog.date instanceof Date ? blog.date : new Date(blog.date),
      tags: blog.tags ? JSON.stringify(blog.tags) : JSON.stringify([]),
      metadata: blog.metadata ? JSON.stringify(blog.metadata) : JSON.stringify({}),
    };

    return await db.insert(blogs).values(newBlog);
  } catch (error) {
    console.error("Failed to create blog in database");
    throw error;
  }
}

export async function getBlogById({ id }: { id: number }) {
  try {
    const [selectedBlog] = await db
      .select()
      .from(blogs)
      .where(eq(blogs.id, id));
    return selectedBlog;
  } catch (error) {
    console.error("Failed to get blog by id from database");
    throw error;
  }
}

export async function getAllBlogs() {
  try {
    return await db.select().from(blogs).orderBy(desc(blogs.date));
  } catch (error) {
    console.error("Failed to get all blogs from database");
    throw error;
  }
}

export async function updateBlog({
  id,
  values,
}: {
  id: number;
  values: Partial<Blog>;
}) {
  try {
    // If tags or metadata are included and they're arrays/objects, stringify them
    const processedValues = { ...values };
    
    // Fix field name mapping for column names with underscores
    if (values.shortSummary !== undefined) {
      processedValues.short_summary = values.shortSummary;
      delete processedValues.shortSummary;
    }
    
    if (values.finalNote !== undefined) {
      processedValues.final_note = values.finalNote;
      delete processedValues.finalNote;
    }
    
    if (processedValues.tags && typeof processedValues.tags !== 'string') {
      processedValues.tags = JSON.stringify(processedValues.tags);
    }
    if (processedValues.metadata && typeof processedValues.metadata !== 'string') {
      processedValues.metadata = JSON.stringify(processedValues.metadata);
    }
    
    return await db
      .update(blogs)
      .set(processedValues)
      .where(eq(blogs.id, id));
  } catch (error) {
    console.error("Failed to update blog in database");
    throw error;
  }
}

export async function deleteBlogById({ id }: { id: number }) {
  try {
    return await db.delete(blogs).where(eq(blogs.id, id));
  } catch (error) {
    console.error("Failed to delete blog by id from database");
    throw error;
  }
}

export async function getBlogByNickname({
  nickname,
}: {
  nickname: string;
}) {
  try {
    const [selectedBlog] = await db
      .select()
      .from(blogs)
      .where(eq(blogs.nickname, nickname));
    return selectedBlog;
  } catch (error) {
    console.error("Failed to get blog by nickname from database");
    throw error;
  }
}
