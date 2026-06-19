import { NextResponse, NextRequest } from 'next/server';
import { adminAuth, adminDb, adminMessaging } from '@/lib/firebase-admin';

// Only allow authenticated admin users
export async function POST(request: NextRequest) {
  try {
    // Verify admin session via cookie
    const session = request.cookies.get('jne_admin_session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user exists and is admin
    await adminAuth.getUser(session.value);
    const userDoc = await adminDb.collection('users').doc(session.value).get();
    const userData = userDoc.data();

    if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, title, body: message, data: customData } = body;

    if (!userId || !title || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, title, message' },
        { status: 400 },
      );
    }

    // Get user's FCM tokens
    const tokensSnap = await adminDb.collection('fcm_tokens').where('userId', '==', userId).get();

    if (tokensSnap.empty) {
      return NextResponse.json({ success: true, message: 'No FCM tokens found for user' });
    }

    const tokens = tokensSnap.docs.map((doc) => doc.id);

    // Send to all user tokens (multicast)
    const messagePayload: import('firebase-admin/messaging').MulticastMessage = {
      notification: {
        title,
        body: message,
      },
      data: customData || {},
      tokens,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };

    const response = await adminMessaging.sendEachForMulticast(messagePayload);

    // Clean up invalid tokens
    const invalidTokens = response.responses
      .filter((res) => !res.success)
      .map((res, idx) => tokens[idx]);

    if (invalidTokens.length > 0) {
      const batch = adminDb.batch();
      invalidTokens.forEach((token: string) => {
        const tokenRef = adminDb.collection('fcm_tokens').doc(token);
        batch.delete(tokenRef);
      });
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      sentCount: response.successCount,
      failureCount: response.failureCount,
    });
  } catch (error) {
    console.error('FCM send error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
