"use server";

import { connectToDatabase } from "@/database/mongoose";
import { Watchlist } from "@/database/models/watchlist.model";

export async function getWatchlistSymbolsByEmail(
  email: string,
): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    // Better Auth stores users in the "user" collection
    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error("getWatchlistSymbolsByEmail error:", err);
    return [];
  }
}

export async function getWatchlistWithQuotes(userEmail: string) {
  if (!userEmail) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email: userEmail });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return [];

    const items = await Watchlist.find({ userId })
      .sort({ addedAt: -1 })
      .lean();

    return items.map((item) => ({
      symbol: String(item.symbol),
      company: String(item.company),
      addedAt: item.addedAt,
    }));
  } catch (err) {
    console.error("getWatchlistWithQuotes error:", err);
    return [];
  }
}

export async function isStockInWatchlist(
  symbol: string,
  userEmail: string,
): Promise<boolean> {
  if (!symbol || !userEmail) return false;

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email: userEmail });

    if (!user) return false;

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) return false;

    const item = await Watchlist.findOne({
      userId,
      symbol: symbol.toUpperCase().trim(),
    });

    return !!item;
  } catch (err) {
    console.error("isStockInWatchlist error:", err);
    return false;
  }
}

export async function addToWatchlist(
  symbol: string,
  company: string,
  userEmail: string,
): Promise<{ success: boolean; error?: string }> {
  if (!symbol || !company || !userEmail) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email: userEmail });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) {
      return { success: false, error: "User ID not found" };
    }

    const cleanSymbol = symbol.toUpperCase().trim();
    const cleanCompany = company.trim();

    // Try to create new watchlist item
    // If it exists, MongoDB will throw a duplicate key error, which we handle gracefully
    try {
      await Watchlist.create({
        userId,
        symbol: cleanSymbol,
        company: cleanCompany,
        addedAt: new Date(),
      });
      return { success: true };
    } catch (err: any) {
      // If duplicate key error, item already exists - still return success
      if (err.code === 11000) {
        return { success: true };
      }
      throw err;
    }
  } catch (err) {
    console.error("addToWatchlist error:", err);
    return { success: false, error: "Failed to add to watchlist" };
  }
}

export async function removeFromWatchlist(
  symbol: string,
  userEmail: string,
): Promise<{ success: boolean; error?: string }> {
  if (!symbol || !userEmail) {
    return { success: false, error: "Missing required fields" };
  }

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection not found");

    const user = await db
      .collection("user")
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email: userEmail });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const userId = (user.id as string) || String(user._id || "");
    if (!userId) {
      return { success: false, error: "User ID not found" };
    }

    const cleanSymbol = symbol.toUpperCase().trim();

    const result = await Watchlist.deleteOne({
      userId,
      symbol: cleanSymbol,
    });

    return { success: result.deletedCount > 0 };
  } catch (err) {
    console.error("removeFromWatchlist error:", err);
    return { success: false, error: "Failed to remove from watchlist" };
  }
}
