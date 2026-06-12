// Hari libur nasional tanggal-tetap (disamakan dengan kalender admin & mobile
// user_mobile/lib/utils/holidays.dart). Libur Hijriah/Imlek/Saka tidak
// di-hardcode karena tanggalnya berubah tiap tahun.
const FIXED_HOLIDAYS: Record<string, string> = {
  '01-01': 'Tahun Baru Masehi',
  '05-01': 'Hari Buruh Internasional',
  '06-01': 'Hari Lahir Pancasila',
  '08-17': 'Hari Kemerdekaan RI',
  '12-25': 'Hari Raya Natal',
};

function key(d: Date): string {
  return `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function isHoliday(d: Date): boolean {
  return key(d) in FIXED_HOLIDAYS;
}

export function holidayName(d: Date): string | null {
  return FIXED_HOLIDAYS[key(d)] ?? null;
}

/** Hari kerja = bukan Minggu dan bukan libur nasional (Sabtu tetap hari kerja). */
export function isWorkday(d: Date): boolean {
  return d.getDay() !== 0 && !isHoliday(d);
}
