import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

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

const departments = [
  {
    id: 'ops',
    name: 'DEPARTEMEN OPERASIONAL',
    color: '#E31E24',
    sections: ['Inbound Section', 'Outbound Section', 'Warehouse Section'],
    description: 'Manajemen pengiriman, gudang, dan logistik lapangan.'
  },
  {
    id: 'sales_mkt',
    name: 'DEPARTEMEN SALES & MARKETING',
    color: '#F97316',
    sections: ['Sales Retail', 'Sales Corporate', 'Marketing'],
    description: 'Penjualan layanan, hubungan korporat, dan promosi brand.'
  },
  {
    id: 'cs',
    name: 'DEPARTEMEN CUSTOMER SERVICE',
    color: '#3B82F6',
    sections: ['Customer Service Team'],
    description: 'Layanan pengaduan, tracking, dan penanganan klaim pelanggan.'
  },
  {
    id: 'hr_adm',
    name: 'DEPARTEMEN ADMINISTRASI & HR',
    color: '#8B5CF6',
    sections: ['Personalia', 'Administrasi', 'General Affairs (GA)'],
    description: 'Manajemen SDM, rekrutmen, absensi, dan fasilitas umum.'
  },
  {
    id: 'finance',
    name: 'DEPARTEMEN KEUANGAN & ACCOUNTING',
    color: '#10B981',
    sections: ['Finance & Accounting Team'],
    description: 'Pencatatan keuangan, payroll, perpajakan, dan invoice.'
  },
  {
    id: 'it',
    name: 'DEPARTEMEN IT/TECHNOLOGY',
    color: '#6366F1',
    sections: ['IT Support Team'],
    description: 'Pemeliharaan sistem, jaringan, hardware, dan dukungan teknis.'
  }
];

async function seed() {
  console.log('🚀 Memulai proses seeding departemen...');
  
  try {
    // 1. Bersihkan data lama (opsional, tapi bagus agar rapi)
    const querySnapshot = await getDocs(collection(db, 'departments'));
    for (const document of querySnapshot.docs) {
      await deleteDoc(doc(db, 'departments', document.id));
    }
    console.log('🗑️ Data lama dibersihkan.');

    // 2. Masukkan data baru
    for (const dept of departments) {
      await setDoc(doc(db, 'departments', dept.id), {
        ...dept,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Berhasil menambahkan: ${dept.name}`);
    }

    console.log('\n✨ SEMUA DEPARTEMEN BERHASIL DITAMBAHKAN!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Gagal seeding:', error);
    process.exit(1);
  }
}

seed();
