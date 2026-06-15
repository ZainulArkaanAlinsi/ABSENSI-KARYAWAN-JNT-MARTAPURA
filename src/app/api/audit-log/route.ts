import { NextResponse, NextRequest } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { serverTimestamp } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const session = request.cookies.get('jne_admin_session');
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const userDoc = await adminDb.collection('users').doc(session.value).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userData = userDoc.data();
    if (!userData || (userData.role !== 'admin' && userData.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { action, targetUserId, metadata } = body;

    if (!action || !targetUserId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, targetUserId' },
        { status: 400 },
      );
    }

    const currentUser = await adminAuth.getUser(session.value);

    // Write audit log
    await adminDb.collection('audit_log').add({
      action,
      actorId: currentUser.uid,
      actorEmail: currentUser.email,
      actorName: userData.name || currentUser.displayName || 'Admin',
      targetUserId,
      metadata: metadata || {},
      timestamp: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Audit log error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
