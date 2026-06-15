import { NextResponse, NextRequest } from 'next/server';
import { adminDb, adminMessaging } from '@/lib/firebase-admin';

/**
 * POST /api/notify-admin
 * Kirim push notification ke semua browser admin yang sedang login.
 * Dipanggil dari server-side action atau dari service lain.
 *
 * Body: { title: string, body: string, data?: Record<string, string> }
 */
export async function POST(request: NextRequest) {
  try {
    const { title, body, data } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'title dan body wajib diisi' }, { status: 400 });
    }

    // Ambil semua FCM token milik admin dari koleksi admin_fcm_tokens
    const tokensSnap = await adminDb.collection('admin_fcm_tokens').get();

    if (tokensSnap.empty) {
      return NextResponse.json({
        success: true,
        message: 'Tidak ada admin browser yang terdaftar',
      });
    }

    const tokens: string[] = tokensSnap.docs.map((doc: { id: string }) => doc.id);

    const messagePayload = {
      notification: { title, body },
      data: data || {},
      tokens,
      webpush: {
        notification: {
          icon: '/icon-192.png',
          badge: '/icon-72.png',
          requireInteraction: true,
          vibrate: [200, 100, 200],
          actions: [
            { action: 'open', title: '📋 Buka Dashboard' },
            { action: 'dismiss', title: 'Tutup' },
          ],
        },
        fcmOptions: {
          link: data?.url || '/dashboard',
        },
      },
    };

    const response = await adminMessaging.sendEachForMulticast(messagePayload as any);

    // Bersihkan token yang sudah tidak valid
    const invalidTokens = response.responses
      .map((res: { success: boolean }, idx: number) => (!res.success ? tokens[idx] : null))
      .filter(Boolean) as string[];

    if (invalidTokens.length > 0) {
      const batch = adminDb.batch();
      invalidTokens.forEach((token) => {
        batch.delete(adminDb.collection('admin_fcm_tokens').doc(token));
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error: any) {
    console.error('[notify-admin] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
