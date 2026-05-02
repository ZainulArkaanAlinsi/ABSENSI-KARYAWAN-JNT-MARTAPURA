import admin from 'firebase-admin';

// Ganti path ini jika file serviceAccountKey.json Anda ada di tempat lain
// Jika Anda belum punya file ini, Anda bisa mendapatkannya di:
// Firebase Console > Project Settings > Service Accounts > Generate New Private Key
import serviceAccount from '../serviceAccountKey.json' assert { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const auth = admin.auth();
const db = admin.firestore();

const adminEmail = 'admin@jnemtp.com';
const adminPassword = 'JNE.martapura#kalsel';

async function setupAdmin() {
  console.log('🛡️ Memulai setup akun Super Admin...');
  
  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(adminEmail);
      console.log('📧 User ditemukan, mengupdate password...');
      await auth.updateUser(userRecord.uid, {
        password: adminPassword,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        console.log('🆕 User tidak ditemukan, membuat user baru...');
        userRecord = await auth.createUser({
          email: adminEmail,
          password: adminPassword,
        });
      } else {
        throw error;
      }
    }

    console.log('📂 Mengupdate profil di Firestore...');
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      name: 'Super Admin JNE',
      email: adminEmail,
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('\n✅ SELESAI! Akun Admin Berhasil Disetup.');
    console.log(`ID: ${adminEmail}`);
    console.log(`PW: ${adminPassword}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal setup admin:', error);
    process.exit(1);
  }
}

setupAdmin();
