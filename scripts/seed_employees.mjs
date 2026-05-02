import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyD8_xQ095GsDSOr_nhONflsPa0qtMnWfkY',
  authDomain: 'admin-absensi-jne-mtp.firebaseapp.com',
  projectId: 'admin-absensi-jne-mtp',
  storageBucket: 'admin-absensi-jne-mtp.firebasestorage.app',
  messagingSenderId: '586449872388',
  appId: '1:586449872388:web:e72ef8330d71be35ce3751',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const employees = [
  // OPERASIONAL
  { name: 'Ahmad Fauzi', dept: 'Operasional', pos: 'Kurir Rider', id: 'JNE-OPS-001' },
  { name: 'Budi Santoso', dept: 'Operasional', pos: 'Kurir Driver', id: 'JNE-OPS-002' },
  { name: 'Rahmat Hidayat', dept: 'Operasional', pos: 'Kurir Rider', id: 'JNE-OPS-003' },
  { name: 'Eko Prasetyo', dept: 'Operasional', pos: 'Kurir Driver', id: 'JNE-OPS-004' },
  { name: 'Fajar Siddiq', dept: 'Operasional', pos: 'Kurir Rider', id: 'JNE-OPS-005' },
  // CUSTOMER SERVICE
  { name: 'Siti Aminah', dept: 'Customer Service', pos: 'Senior CS', id: 'JNE-CS-001' },
  { name: 'Dewi Sartika', dept: 'Customer Service', pos: 'CS Officer', id: 'JNE-CS-002' },
  { name: 'Anisa Bahar', dept: 'Customer Service', pos: 'CS Junior', id: 'JNE-CS-003' },
  { name: 'Putri Lestari', dept: 'Customer Service', pos: 'CS Officer', id: 'JNE-CS-004' },
  // SALES & SCO
  { name: 'Rina Wijaya', dept: 'Sales & SCO', pos: 'Counter Officer', id: 'JNE-SLS-001' },
  { name: 'Maya Indah', dept: 'Sales & SCO', pos: 'SCO Lead', id: 'JNE-SLS-002' },
  { name: 'Bambang Irawan', dept: 'Sales & SCO', pos: 'Counter Officer', id: 'JNE-SLS-003' },
  { name: 'Dian Sastro', dept: 'Sales & SCO', pos: 'Sales Support', id: 'JNE-SLS-004' },
  // INBOUND & OUTBOUND
  { name: 'Dedi Kurniawan', dept: 'Inbound & Outbound', pos: 'Staff Gudang', id: 'JNE-GUD-001' },
  { name: 'Hendra Wijaya', dept: 'Inbound & Outbound', pos: 'Checker', id: 'JNE-GUD-002' },
  { name: 'Taufik Hidayat', dept: 'Inbound & Outbound', pos: 'Sorting Staff', id: 'JNE-GUD-003' },
  { name: 'Guruh Soekarno', dept: 'Inbound & Outbound', pos: 'Staff Gudang', id: 'JNE-GUD-004' },
  // PICK UP DELIVERY
  { name: 'Andi Perkasa', dept: 'Pick Up Delivery', pos: 'Staff Pick Up', id: 'JNE-PUD-001' },
  { name: 'Rizky Billar', dept: 'Pick Up Delivery', pos: 'Pick Up Driver', id: 'JNE-PUD-002' },
  { name: 'Atta Halilintar', dept: 'Pick Up Delivery', pos: 'Staff Pick Up', id: 'JNE-PUD-003' },
  // ACCOUNTING & FINANCE
  { name: 'Novi Rahmawati', dept: 'Accounting', pos: 'Accounting Staff', id: 'JNE-ACC-001' },
  { name: 'Yulia Safitri', dept: 'Accounting', pos: 'Senior Finance', id: 'JNE-ACC-002' },
  { name: 'Indah Permata', dept: 'Accounting', pos: 'Admin Invoice', id: 'JNE-ACC-003' },
  { name: 'Lestari Putri', dept: 'Accounting', pos: 'Admin Finance', id: 'JNE-ACC-004' },
  { name: 'Hani Shofia', dept: 'Accounting', pos: 'Staff HR', id: 'JNE-ACC-005' },
  { name: 'Zaskia Gotik', dept: 'Accounting', pos: 'General Admin', id: 'JNE-ACC-006' },
  // HEAD UNIT
  { name: 'Fikri Haikal', dept: 'Head Unit', pos: 'Supervisor Ops', id: 'JNE-MGR-001' },
  { name: 'Agus Kotak', dept: 'Head Unit', pos: 'Unit Manager', id: 'JNE-MGR-002' },
  { name: 'Syahrini', dept: 'Head Unit', pos: 'Asst Manager', id: 'JNE-MGR-003' },
  { name: 'Raffi Ahmad', dept: 'Head Unit', pos: 'Director', id: 'JNE-MGR-004' },
];

async function seed() {
  console.log(`🚀 Mendaftarkan ${employees.length} karyawan baru ke sistem...`);

  for (const emp of employees) {
    const email = `${emp.name.toLowerCase().replace(/\s+/g, '')}@jne.mtp.com`;
    const password = 'jne12345';

    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCred.user.uid;

      await setDoc(doc(db, 'users', uid), {
        uid: uid,
        name: emp.name,
        email: email,
        employeeId: emp.id,
        department: emp.dept,
        position: emp.pos,
        role: 'employee',
        jamKerjaId: 'standard_shift',
        faceRegistered: false,
        isActive: true,
        contractType: 'permanent',
        joinDate: new Date().toISOString().split('T')[0],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      console.log(`✅ Sukses: ${emp.name} [${emp.dept}]`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        console.log(`ℹ️ Lewati: ${emp.name} (Sudah ada)`);
      } else {
        console.error(`❌ Gagal: ${emp.name} - ${error.message}`);
      }
    }
  }
  console.log('✨ BERHASIL! 30 Karyawan sudah masuk ke database.');
  console.log('Silakan Refresh halaman Admin Anda.');
}

seed();
