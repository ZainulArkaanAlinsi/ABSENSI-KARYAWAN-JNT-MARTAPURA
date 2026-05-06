// src/app/api/send-notification/route.ts
import { NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    const { token, title, body, data } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'FCM Token is required' }, { status: 400 });
    }

    const message = {
      notification: {
        title: title || 'Notifikasi JNE Martapura',
        body: body || 'Ada pesan baru untuk Anda.',
      },
      data: data || {},
      token: token,
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'high_importance_channel',
        },
      },
    };

    const response = await adminMessaging.send(message as any);
    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Error sending notification:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
