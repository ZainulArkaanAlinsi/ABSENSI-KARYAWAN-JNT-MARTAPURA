import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyD8_xQ095GsDSOr_nhONflsPa0qtMnWfkY',
  authDomain: 'admin-absensi-jne-mtp.firebaseapp.com',
  projectId: 'admin-absensi-jne-mtp',
  storageBucket: 'admin-absensi-jne-mtp.firebasestorage.app',
  messagingSenderId: '586449872388',
  appId: '1:586449872388:web:e72ef8330d71be35ce3751',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function seedEverything() {
  try {
    console.log('🔐 Melakukan autentikasi admin...');
    await signInWithEmailAndPassword(auth, 'admin@jnemtp.com', 'admin123');
    console.log('✅ Login berhasil! Memulai simulasi penggunaan fitur...');

    const usersSnap = await getDocs(collection(db, 'users'));
    const employees = usersSnap.docs.filter(d => d.data().role === 'employee');
    
    if (employees.length === 0) {
      console.error('❌ Tidak ada karyawan ditemukan!');
      return;
    }

    // 1. SET FACE REGISTERED (80% karyawan sudah daftar wajah)
    console.log('👤 Mendaftarkan wajah karyawan (Simulasi Biometrik)...');
    for (const empDoc of employees) {
      if (Math.random() > 0.2) {
        await updateDoc(doc(db, 'users', empDoc.id), {
          faceRegistered: true,
          isActive: true
        });
      }
    }

    // 2. SEED ATTENDANCE (14 Hari)
    console.log('📅 Mengisi riwayat absensi 14 hari...');
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() - i);
      if (currentDate.getDay() === 0) continue;
      const dateStr = currentDate.toISOString().split('T')[0];
      
      for (const empDoc of employees) {
        const emp = empDoc.data();
        if (Math.random() > 0.9) continue;

        const isLate = Math.random() > 0.8;
        const checkInHour = isLate ? 8 : 7;
        const checkInMin = isLate ? Math.floor(Math.random() * 45) + 16 : Math.floor(Math.random() * 59);
        const checkInDate = new Date(currentDate);
        checkInDate.setHours(checkInHour, checkInMin, 0);

        const checkOutHour = 17 + (Math.random() > 0.5 ? 1 : 0);
        const checkOutMin = Math.floor(Math.random() * 59);
        const checkOutDate = new Date(currentDate);
        checkOutDate.setHours(checkOutHour, checkOutMin, 0);

        const lateMinutes = checkInHour >= 8 && checkInMin > 15 ? (checkInHour - 8) * 60 + (checkInMin - 15) : 0;
        const attId = `${empDoc.id}_${dateStr}`;
        
        await setDoc(doc(db, 'attendance', attId), {
          userId: empDoc.id,
          userName: emp.name || 'Karyawan JNE',
          department: emp.department || 'Operasional',
          date: dateStr,
          checkIn: Timestamp.fromDate(checkInDate),
          checkOut: Timestamp.fromDate(checkOutDate),
          status: lateMinutes > 0 ? 'late' : 'present',
          lateMinutes,
          locationIn: { latitude: -3.4245, longitude: 114.8512 },
          method: 'face_biometric',
          createdAt: serverTimestamp()
        });
      }
    }

    // 3. SEED CALENDAR EVENTS
    console.log('🗓️ Mengisi jadwal kalender kantor...');
    const events = [
      { title: 'Rapat Koordinasi Cabang', type: 'meeting', date: 2 },
      { title: 'Training Driver Baru', type: 'event', date: 5 },
      { title: 'Evaluasi Mingguan', type: 'meeting', date: -2 },
      { title: 'Maintenance Server', type: 'event', date: 7 },
    ];
    for (const ev of events) {
      const evDate = new Date();
      evDate.setDate(today.getDate() + ev.date);
      await setDoc(doc(collection(db, 'events')), {
        title: ev.title,
        type: ev.type,
        start: Timestamp.fromDate(evDate),
        end: Timestamp.fromDate(evDate),
        allDay: true,
        createdAt: serverTimestamp()
      });
    }

    // 4. SEED ATTENDANCE CORRECTIONS (Minta koreksi absen)
    console.log('📝 Menambahkan permohonan koreksi absensi...');
    for (let k = 0; k < 5; k++) {
      const emp = employees[Math.floor(Math.random() * employees.length)].data();
      await setDoc(doc(collection(db, 'attendance_requests')), {
        userId: employees[k].id,
        userName: emp.name,
        date: '2026-04-28',
        reason: 'Lupa scan saat pulang karena overload kiriman.',
        requestType: 'check_out',
        requestedTime: '18:30',
        status: 'pending',
        createdAt: serverTimestamp()
      });
    }

    // 5. SEED LEAVES
    console.log('💊 Menambahkan riwayat izin & cuti...');
    for (let l = 0; l < 6; l++) {
      const emp = employees[l].data();
      await setDoc(doc(collection(db, 'leaves')), {
        userId: employees[l].id,
        userName: emp.name,
        department: emp.department || 'Operasional',
        type: l % 2 === 0 ? 'Sakit' : 'Cuti',
        reason: 'Ada urusan keluarga mendesak.',
        startDate: '2026-05-01',
        endDate: '2026-05-02',
        status: l < 3 ? 'approved' : 'pending',
        createdAt: serverTimestamp()
      });
    }

    console.log('✨ SIMULASI SELESAI! Seluruh fitur sistem sekarang terlihat aktif dan digunakan.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Gagal simulasi:', err.message);
    process.exit(1);
  }
}

seedEverything();
