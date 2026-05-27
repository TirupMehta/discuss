import { headers } from "next/headers";

const DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "";

// Simple in-memory fallback in case the database is not yet initialized or fails
const memoryCache = new Map<string, { count: number; lastReset: number }>();

export async function rateLimit(): Promise<{ success: boolean; limit?: number; remaining?: number }> {
  try {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for") || headerList.get("x-real-ip") || "127.0.0.1";
    
    // Sanitize IP address for Firebase keys (keys cannot contain '.', '#', '$', '[', or ']')
    const sanitizedIp = ip.replace(/[.#$[\]:/]/g, "_");
    
    const limit = 15; // Max 15 requests per minute
    const windowMs = 60 * 1000; // 1 minute window
    
    if (!DATABASE_URL) {
      const now = Date.now();
      const current = memoryCache.get(sanitizedIp);
      
      if (!current || now - current.lastReset > windowMs) {
        memoryCache.set(sanitizedIp, { count: 1, lastReset: now });
        return { success: true, limit, remaining: limit - 1 };
      }
      
      if (current.count >= limit) {
        return { success: false, limit, remaining: 0 };
      }
      
      current.count += 1;
      memoryCache.set(sanitizedIp, current);
      return { success: true, limit, remaining: limit - current.count };
    }

    const url = `${DATABASE_URL.replace(/\/$/, "")}/rateLimits/${sanitizedIp}.json`;
    
    const getRes = await fetch(url, {
      method: "GET",
      cache: "no-store",
    });
    
    let data = { count: 0, lastReset: 0 };
    if (getRes.ok) {
      const dbVal = await getRes.json();
      if (dbVal) {
        data = dbVal;
      }
    }
    
    const now = Date.now();
    
    if (now - data.lastReset > windowMs) {
      data.count = 1;
      data.lastReset = now;
    } else {
      if (data.count >= limit) {
        return { success: false, limit, remaining: 0 };
      }
      data.count += 1;
    }
    
    // Write the rate limit logs back to Firebase Realtime Database
    await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data),
      cache: "no-store",
    });
    
    return { success: true, limit, remaining: limit - data.count };
  } catch (err) {
    console.error("Rate limit check failed, letting request pass:", err);
    return { success: true };
  }
}
