/**
 * Generator for Google Apps Script Code.gs and standalone index.html
 * Designed according to Section 6, 8, 10, and 12 of MASTER PROMPT SIM LENTERA
 */

export const GAS_CODE_GS = `/**
 * ============================================================================
 * SISTEM INFORMASI MANAJEMEN LENTERA (SIM LENTERA)
 * "Menerangi Potensi, Membangun Generasi, Mewujudkan SDM Bali Unggul"
 * Backend: Google Apps Script (Code.gs)
 * Database: Google Spreadsheet
 * Storage: Google Drive
 * ============================================================================
 */

// Konfigurasi Nama Sheet Database
const SHEETS = {
  PENGATURAN: 'PENGATURAN',
  PROGRAM: 'PROGRAM',
  PELAKSANAAN: 'PELAKSANAAN',
  DOKUMENTASI: 'DOKUMENTASI',
  MONITORING: 'MONITORING',
  EVALUASI_PEMANTAUAN: 'EVALUASI_PEMANTAUAN',
  GURU: 'GURU',
  SISWA: 'SISWA',
  KELAS: 'KELAS',
  MITRA: 'MITRA',
  PENGGUNA: 'PENGGUNA'
};

const DRIVE_FOLDER_NAME = 'DOKUMENTASI_LENTERA_SEKOLAH';

/**
 * Entry point untuk akses Web App (GET)
 */
function doGet(e) {
  const action = e && e.parameter ? e.parameter.action : '';
  
  // Jika akses langsung dari browser tanpa parameter action, tampilkan halaman web
  if (!action) {
    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('SIM LENTERA - Sistem Informasi Manajemen Sekolah')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }

  // Jika memanggil API via GET
  try {
    let result = {};
    if (action === 'getAllData') {
      result = getAllDataFromSheets();
    } else if (action === 'initDatabase') {
      result = initDatabase();
    } else {
      result = { status: 'error', message: 'Action tidak dikenal' };
    }
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Entry point untuk akses Web App (POST API)
 */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    // Kunci proses selama maksimal 30 detik untuk mencegah race conditions
    lock.waitLock(30000);

    const postData = JSON.parse(e.postData.contents);
    const action = postData.action;
    let response = {};

    switch (action) {
      case 'initDatabase':
        response = initDatabase();
        break;
      case 'getAllData':
        response = getAllDataFromSheets();
        break;
      case 'saveProgram':
        response = saveOrUpdateRow(SHEETS.PROGRAM, 'ID_Program', postData.data);
        break;
      case 'deleteProgram':
        response = deleteRowById(SHEETS.PROGRAM, 'ID_Program', postData.id);
        break;
      case 'savePelaksanaan':
        response = saveOrUpdateRow(SHEETS.PELAKSANAAN, 'ID_Pelaksanaan', postData.data);
        break;
      case 'deletePelaksanaan':
        response = deleteRowById(SHEETS.PELAKSANAAN, 'ID_Pelaksanaan', postData.id);
        break;
      case 'uploadDokumentasi':
        response = handleFileUpload(postData);
        break;
      case 'deleteDokumentasi':
        response = deleteDokumentasi(postData.id);
        break;
      case 'saveMonitoring':
        response = saveOrUpdateRow(SHEETS.MONITORING, 'ID_Monitoring', postData.data);
        break;
      case 'saveEvaluasi':
        response = saveOrUpdateRow(SHEETS.EVALUASI_PEMANTAUAN, 'ID_Evaluasi', postData.data);
        break;
      case 'deleteEvaluasi':
        response = deleteRowById(SHEETS.EVALUASI_PEMANTAUAN, 'ID_Evaluasi', postData.id);
        break;
      case 'savePengaturan':
        response = savePengaturan(postData.data);
        break;
      case 'saveMaster':
        response = saveOrUpdateRow(postData.sheetName, postData.idColumn, postData.data);
        break;
      case 'deleteMaster':
        response = deleteRowById(postData.sheetName, postData.idColumn, postData.id);
        break;
      default:
        response = { status: 'error', message: 'Action POST tidak dikenal: ' + action };
    }

    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/**
 * Mengambil atau membuat folder Google Drive khusus dokumentasi LENTERA
 */
function getOrCreateDriveFolder() {
  const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(DRIVE_FOLDER_NAME);
}

/**
 * Handle upload file dari Base64 ke Google Drive
 */
function handleFileUpload(payload) {
  try {
    const folder = getOrCreateDriveFolder();
    const base64Data = payload.fileData.split(',')[1] || payload.fileData;
    const decoded = Utilities.base64Decode(base64Data);
    const blob = Utilities.newBlob(decoded, payload.mimeType || 'image/jpeg', payload.fileName);
    
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const fileUrl = file.getUrl();

    // Catat ke Sheet DOKUMENTASI
    const docData = {
      'ID_Dokumentasi': payload.id || ('DOK-' + Utilities.formatDate(new Date(), 'Asia/Makassar', 'yyyyMMdd-HHmmss')),
      'ID_Program': payload.idProgram || '',
      'ID_Pelaksanaan': payload.idPelaksanaan || '',
      'Nama_File': payload.fileName,
      'Jenis_File': payload.fileType || 'image',
      'URL_Drive': fileUrl,
      'Tanggal_Upload': Utilities.formatDate(new Date(), 'Asia/Makassar', 'yyyy-MM-dd HH:mm'),
      'Keterangan': payload.keterangan || '',
      'Pengunggah': payload.pengunggah || 'Staff'
    };

    saveOrUpdateRow(SHEETS.DOKUMENTASI, 'ID_Dokumentasi', docData);

    return {
      status: 'success',
      message: 'File berhasil diunggah ke Google Drive',
      fileUrl: fileUrl,
      data: docData
    };
  } catch (e) {
    return { status: 'error', message: 'Gagal mengunggah file: ' + e.toString() };
  }
}

/**
 * Hapus dokumentasi dari Sheet
 */
function deleteDokumentasi(docId) {
  return deleteRowById(SHEETS.DOKUMENTASI, 'ID_Dokumentasi', docId);
}

/**
 * Inisialisasi Otomatis 10 Sheet Database di Google Spreadsheet
 */
function initDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const schema = {
    [SHEETS.PENGATURAN]: ['ID', 'Nama_Sekolah', 'Alamat', 'Kepala_Sekolah', 'NIP_Kepala_Sekolah', 'Koordinator_Lentera', 'Tahun_Pelajaran', 'Logo'],
    [SHEETS.PROGRAM]: ['ID_Program', 'Nama_Program', 'Pilar', 'Pilar_Code', 'Deskripsi', 'Tujuan', 'Sasaran', 'Kelas', 'Bentuk_Pelaksanaan', 'Integrasi_Kurikulum', 'Mapel_Terkait', 'Penanggung_Jawab', 'Tim_Pelaksana', 'Mitra', 'Target', 'Indikator', 'Tanggal_Mulai', 'Tanggal_Selesai', 'Anggaran', 'Status'],
    [SHEETS.PELAKSANAAN]: ['ID_Pelaksanaan', 'ID_Program', 'Nama_Kegiatan', 'Pilar', 'Tanggal', 'Waktu', 'Lokasi', 'Penanggung_Jawab', 'Peserta', 'Jumlah_Peserta', 'Uraian', 'Hasil', 'Capaian', 'Kendala', 'Solusi', 'Evaluasi', 'Status'],
    [SHEETS.DOKUMENTASI]: ['ID_Dokumentasi', 'ID_Program', 'ID_Pelaksanaan', 'Nama_File', 'Jenis_File', 'URL_Drive', 'Tanggal_Upload', 'Keterangan', 'Pengunggah'],
    [SHEETS.MONITORING]: ['ID_Monitoring', 'ID_Program', 'Pilar', 'Tanggal_Evaluasi', 'Target', 'Realisasi', 'Persentase', 'Kategori', 'Kendala', 'Rekomendasi', 'Evaluator'],
    [SHEETS.EVALUASI_PEMANTAUAN]: ['ID_Evaluasi', 'Jenis_Kegiatan', 'ID_Program', 'Pilar', 'Pilar_Code', 'Tanggal_Pemantauan', 'Pemantau', 'Hasil_Pemantauan', 'Keterangan', 'Tindak_Lanjut'],
    [SHEETS.GURU]: ['ID_Guru', 'Nama_Guru', 'NIP', 'Jabatan', 'Mata_Pelajaran', 'Email', 'Status'],
    [SHEETS.SISWA]: ['ID_Siswa', 'Nama_Siswa', 'NISN', 'Kelas', 'Konsentrasi_Keahlian', 'Status'],
    [SHEETS.KELAS]: ['ID_Kelas', 'Nama_Kelas', 'Tingkat', 'Konsentrasi_Keahlian', 'Wali_Kelas'],
    [SHEETS.MITRA]: ['ID_Mitra', 'Nama_Mitra', 'Jenis_Mitra', 'Alamat', 'Kontak', 'Keterangan'],
    [SHEETS.PENGGUNA]: ['ID_Pengguna', 'Nama', 'Email', 'Password_Hash', 'Role', 'Status']
  };

  const createdSheets = [];

  for (const sheetName in schema) {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      createdSheets.push(sheetName);
    }
    
    // Pastikan header rapi
    const headers = schema[sheetName];
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      const headerRange = sheet.getRange(1, 1, 1, headers.length);
      headerRange.setBackground('#1e3a8a'); // Navy Blue
      headerRange.setFontColor('#ffffff');
      headerRange.setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }

  // Siapkan folder Google Drive
  const folder = getOrCreateDriveFolder();

  return {
    status: 'success',
    message: 'Database SIM LENTERA berhasil diinisialisasi',
    createdSheets: createdSheets,
    driveFolderUrl: folder.getUrl()
  };
}

/**
 * Ambil seluruh data dari Google Spreadsheet
 */
function getAllDataFromSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const data = {};

  for (const key in SHEETS) {
    const sheetName = SHEETS[key];
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      data[sheetName] = [];
      continue;
    }
    
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      data[sheetName] = [];
      continue;
    }

    const headers = rows[0];
    const items = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue; // lewati baris kosong
      const item = {};
      for (let j = 0; j < headers.length; j++) {
        item[headers[j]] = row[j];
      }
      items.push(item);
    }
    data[sheetName] = items;
  }

  return {
    status: 'success',
    data: data,
    timestamp: new Date().toISOString()
  };
}

/**
 * Tambah atau perbarui data (Insert or Update / Upsert)
 */
function saveOrUpdateRow(sheetName, idColumn, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(sheetName);
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf(idColumn);
  
  if (idIndex === -1) {
    throw new Error('Kolom ID ' + idColumn + ' tidak ditemukan di sheet ' + sheetName);
  }

  const targetId = rowData[idColumn];
  let targetRowIndex = -1;

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(targetId)) {
      targetRowIndex = i + 1; // 1-indexed
      break;
    }
  }

  const newRowValues = headers.map(header => {
    return rowData[header] !== undefined ? rowData[header] : '';
  });

  if (targetRowIndex > 0) {
    sheet.getRange(targetRowIndex, 1, 1, headers.length).setValues([newRowValues]);
    return { status: 'success', action: 'updated', id: targetId };
  } else {
    sheet.appendRow(newRowValues);
    return { status: 'success', action: 'inserted', id: targetId };
  }
}

/**
 * Hapus data berdasarkan ID
 */
function deleteRowById(sheetName, idColumn, targetId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return { status: 'error', message: 'Sheet tidak ditemukan' };

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const idIndex = headers.indexOf(idColumn);

  if (idIndex === -1) return { status: 'error', message: 'Kolom ID tidak ditemukan' };

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIndex]) === String(targetId)) {
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'Data ID ' + targetId + ' berhasil dihapus' };
    }
  }

  return { status: 'error', message: 'Data ID ' + targetId + ' tidak ditemukan' };
}

/**
 * Simpan atau perbarui Pengaturan Sekolah
 */
function savePengaturan(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  if (!sheet) {
    initDatabase();
    sheet = ss.getSheetByName(SHEETS.PENGATURAN);
  }
  
  const headers = ['ID', 'Nama_Sekolah', 'Alamat', 'Kepala_Sekolah', 'NIP_Kepala_Sekolah', 'Koordinator_Lentera', 'Tahun_Pelajaran', 'Logo'];
  const rowValues = [
    'CFG-001',
    data.namaSekolah || '',
    data.alamat || '',
    data.kepalaSekolah || '',
    data.nipKepalaSekolah || '',
    data.koordinatorLentera || '',
    data.tahunPelajaran || '',
    data.logo || ''
  ];

  if (sheet.getLastRow() >= 2) {
    sheet.getRange(2, 1, 1, headers.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }

  return { status: 'success', message: 'Pengaturan sekolah berhasil diperbarui' };
}
`;

export const GAS_INSTALLATION_GUIDE = `# PANDUAN LENGKAP DEPLOYMENT GOOGLE APPS SCRIPT & SPREADSHEET
## SISTEM INFORMASI MANAJEMEN LENTERA (SIM LENTERA)

Ikuti 5 langkah mudah berikut untuk menghubungkan SIM LENTERA dengan Google Spreadsheet & Google Drive Anda:

### LANGKAH 1: Buat Google Spreadsheet Baru
1. Buka [Google Spreadsheet](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet: **DATABASE MASTER SIM LENTERA**.
3. Simpan tautan URL spreadsheet tersebut.

### LANGKAH 2: Buka Script Editor (Google Apps Script)
1. Pada menu atas Spreadsheet, klik **Ekstensi (Extensions)** -> **Apps Script**.
2. Beri nama proyek: **SIM_LENTERA_BACKEND**.
3. Hapus seluruh isi default pada file \`Code.gs\`.
4. Salin (Copy) seluruh kode dari tab **Code.gs** di aplikasi ini dan Tempelkan (Paste) ke editor Apps Script.
5. Klik ikon **Simpan (Ctrl+S / Cmd+S)**.

### LANGKAH 3: Inisialisasi Database Otomatis
1. Pada toolbar dropdown fungsi di Apps Script, pilih fungsi: **\`initDatabase\`**.
2. Klik tombol **Run (Jalankan)**.
3. Google akan meminta izin akses (Authorization Required).
   - Klik **Tinjau Izin (Review Permissions)**.
   - Pilih akun Google Anda.
   - Klik **Lanjutan (Advanced)** -> **Buka SIM_LENTERA_BACKEND (tidak aman)**.
   - Klik **Izinkan (Allow)**.
4. Periksa kembali spreadsheet Anda: 10 Sheet (PENGATURAN, PROGRAM, PELAKSANAAN, DOKUMENTASI, MONITORING, GURU, SISWA, KELAS, MITRA, PENGGUNA) akan dibuat otomatis lengkap dengan header berwarna Navy Blue! Folder Google Drive \`DOKUMENTASI_LENTERA_SEKOLAH\` juga telah otomatis dibuat.

### LANGKAH 4: Deploy sebagai Web App
1. Di pojok kanan atas Apps Script, klik tombol **Deploy (Terapkan)** -> **New Deployment (Penerapan Baru)**.
2. Pada jenis penerapan, klik ikon gerigi ⚙️ lalu pilih **Web app**.
3. Isi parameter konfigurasi berikut:
   - **Description**: SIM LENTERA Web API Production v1.0
   - **Execute as (Jalankan sebagai)**: **Me (Akun saya - email Anda)**
   - **Who has access (Siapa yang memiliki akses)**: **Anyone (Siapa saja)** *(PENTING: Pilih Anyone agar aplikasi web frontend dapat menyimpan data tanpa kendala autentikasi CORS)*
4. Klik **Deploy (Terapkan)**.
5. Salin URL Web App yang dihasilkan (formatnya: \`https://script.google.com/macros/s/.../exec\`).

### LANGKAH 5: Masukkan URL ke SIM LENTERA
1. Buka menu **Pengaturan** di aplikasi SIM LENTERA ini.
2. Tempelkan URL Web App ke kolom **Google Apps Script Web App URL**.
3. Ubah mode penyimpanan menjadi **Google Apps Script Live Sync**.
4. Klik tombol **Uji Koneksi & Simpan**. Data kini tersimpan langsung di Google Spreadsheet & Google Drive Anda secara permanen!
`;
