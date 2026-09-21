import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/better-auth/auth';
import { connectToDatabase } from '@/database/mongoose';

/**
 * Temporary read‑only endpoint for diagnostic purposes.
 * Returns information about the existence of a specific email.
 */
export async function GET(request: Request) {
  const email = 'hackerdk555@gmail.com';

  try {
    // Ensure auth instance is initialized (even if not used for DB query)
    await getAuth();

    const mongoose = await connectToDatabase();
    // Better Auth uses the collection name "user" (model name is "user")
    const collection = mongoose.connection.db!.collection('user');
    const userDoc = await collection.findOne({ email: email.toLowerCase() });
    const exists = !!userDoc;
    const masked = email.replace(/(.{3}).+(.{3}@.+)/, '$1***$2');

    return NextResponse.json({
      emailMasked: masked,
      exists,
      userId: exists ? userDoc._id.toString() : null,
    });
  } catch (e) {
    console.error('[EMAIL CHECK DEBUG ERROR]', e);
    // Always return a JSON response on error
    return NextResponse.json({ error: 'diagnostic failed' }, { status: 500 });
  }
}
