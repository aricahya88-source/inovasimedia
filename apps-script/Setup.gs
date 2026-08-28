/**
 * SATU FUNGSI INSTALASI: isi StorageConfig.gs lalu Run setupLms().
 * Aman dijalankan ulang: schema diverifikasi, seed struktur tidak menghapus data mahasiswa.
 */
function setupLms() {
  var lock=LockService.getScriptLock();lock.waitLock(30000);
  try{
    var sid=String(LMS_STORAGE_CONFIG.SPREADSHEET_ID||'').trim();
    var fid=String(LMS_STORAGE_CONFIG.ROOT_FOLDER_ID||'').trim();
    if(!sid||sid.indexOf('PASTE_')===0)throw new Error('Isi SPREADSHEET_ID pada StorageConfig.gs.');
    if(!fid||fid.indexOf('PASTE_')===0)throw new Error('Isi ROOT_FOLDER_ID pada StorageConfig.gs.');
    var ss=SpreadsheetApp.openById(sid);ss.getName();
    var root=DriveApp.getFolderById(fid);root.getName();
    props_().setProperties({SPREADSHEET_ID:sid,ROOT_FOLDER_ID:fid},false);
    ensureSecrets_();
    ensureSchema_();
    seedSettings_();
    seedWeeks_();
    seedProjects_();
    cleanupLegacyStaticMetaV12_();
    seedStaticActivityMeta_();
    ensureFolders_();
    var admin=ensureAdmin_();
    Logger.log('=== LMS SIAP ===');
    Logger.log('Spreadsheet: '+ss.getUrl());
    Logger.log('Drive: '+root.getUrl());
    Logger.log('Login admin: ADMIN');
    if(admin.pin)Logger.log('PIN admin sementara: '+admin.pin);
    Logger.log('Konten inti: 28 materi, 7 kuis, 7 diskusi. Konten dibaca dari Vercel; Sheets menyimpan data dinamis.');
    return {success:true,spreadsheetUrl:ss.getUrl(),folderUrl:root.getUrl(),adminLogin:'ADMIN',temporaryPin:admin.pin||''};
  }finally{lock.releaseLock();}
}
function ensureSchema_() {
  var ss=db_();
  Object.keys(SCHEMA).forEach(function(key){
    var name=LMS.SHEETS[key],headers=SCHEMA[key],sh=ss.getSheetByName(name)||ss.insertSheet(name);
    if(sh.getLastRow()===0){
      sh.getRange(1,1,1,headers.length).setValues([headers]);
      sh.setFrozenRows(1);
      sh.getRange(1,1,1,headers.length).setFontWeight('bold').setBackground('#E7F4F1').setFontColor('#0A7C6E');
      return;
    }
    var current=sh.getRange(1,1,1,sh.getLastColumn()).getValues()[0].map(String);
    if(current.join('|')!==headers.join('|'))throw new Error('Header sheet '+name+' berbeda. Sistem berhenti agar data tidak tertimpa.');
  });
  var d=ss.getSheetByName('Sheet1');
  if(d&&ss.getSheets().length>1&&d.getLastRow()===0)ss.deleteSheet(d);
}
function seedSettings_() {
  Object.keys(DEFAULT_SETTINGS).forEach(function(k){if(!findOne_(LMS.SHEETS.SETTINGS,'key',k))setSetting_(k,DEFAULT_SETTINGS[k]);});
}
function seedWeeks_() {
  var dates=['2026-09-07','2026-09-14','2026-09-21','2026-09-28','2026-10-05','2026-10-12','2026-10-19','2026-10-26','2026-11-02','2026-11-09','2026-11-16','2026-11-23','2026-11-30','2026-12-07'];
  var deadline1='2026-10-19T23:59:59+07:00',deadline2='2026-12-07T23:59:59+07:00';
  for(var w=1;w<=14;w++){
    var id='W'+('0'+w).slice(-2),m1=w*2-1,m2=w*2,block=w<=7?1:2,deadline=block===1?deadline1:deadline2;
    upsertObj_(LMS.SHEETS.WEEKS,'week_id',{week_id:id,week_no:w,title:'Pertemuan '+w+' — Materi '+m1+' & '+m2,summary_html:'<p>Blok '+block+'. Batas akhir pengumpulan blok: '+(block===1?'19 Oktober 2026':'7 Desember 2026')+'.</p>',open_at:dates[w-1]+'T00:00:00+07:00',close_at:deadline,visible:true,updated_at:nowIso_()});
  }
}
function seedProjects_() {
  [
    ['PRJ_WEBSITE','W09','Proyek Website','WEBSITE','individual'],
    ['PRJ_PWA','W11','Proyek PWA','PWA','individual'],
    ['PRJ_AUDIO','W12','Proyek Media Audio','AUDIO','individual'],
    ['PRJ_VISUAL','W13','Proyek Media Visual','VISUAL','individual'],
    ['PRJ_AUDIOVISUAL','W14','Proyek Media Audiovisual','AUDIOVISUAL','group']
  ].forEach(function(p){
    if(!findOne_(LMS.SHEETS.ACTIVITIES,'activity_id',p[0])){
      appendObj_(LMS.SHEETS.ACTIVITIES,{activity_id:p[0],week_id:p[1],type:'project',title:p[2],description_html:'<p>Susun perencanaan proyek, ajukan kepada dosen, kembangkan produk, uji, revisi, dan finalisasi.</p>',mode:p[4],max_score:100,due_at:'',visible:true,allow_comments:true,project_code:p[3],created_at:nowIso_(),updated_at:nowIso_()});
    }
  });
}
function cleanupLegacyStaticMetaV12_(){
  // v1.4: metadata statis lama (28 kuis + 28 diskusi) selalu dinonaktifkan.
  // Row tidak dihapus agar attempt/nilai/post uji lama tetap dapat dilacak jika diperlukan.
  for(var n=1;n<=28;n++){
    var s=('0'+n).slice(-2),qa=findOne_(LMS.SHEETS.ACTIVITIES,'activity_id','QUIZ_M'+s),da=findOne_(LMS.SHEETS.ACTIVITIES,'activity_id','DISC_M'+s);
    if(qa)updateRowObj_(LMS.SHEETS.ACTIVITIES,qa.__row,{visible:false,updated_at:nowIso_()});
    if(da)updateRowObj_(LMS.SHEETS.ACTIVITIES,da.__row,{visible:false,updated_at:nowIso_()});
  }
  SpreadsheetApp.flush();
}
function ensureAdmin_() {
  var users=rows_(LMS.SHEETS.USERS),found=null;
  for(var i=0;i<users.length;i++)if(String(users[i].role).toLowerCase()==='admin'&&asBool_(users[i].active)){found=users[i];break;}
  if(found)return {created:false,pin:''};
  var pin=String(Math.floor(100000+Math.random()*900000)),hp=makeUserPin_(pin);
  appendObj_(LMS.SHEETS.USERS,{user_id:makeId_('USR'),nim:'ADMIN',name:'Administrator',email:'',role:'admin',class_name:'',pin_salt:hp.salt,pin_hash:hp.hash,active:true,created_at:nowIso_(),updated_at:nowIso_()});
  return {created:true,pin:pin};
}
function repairLms() {
  ensureSecrets_();ensureSchema_();seedSettings_();seedWeeks_();seedProjects_();cleanupLegacyStaticMetaV12_();seedStaticActivityMeta_();ensureFolders_();return {success:true,message:'Patch v1.4 selesai: cache konten diperbarui dan metadata lama 28 kuis/diskusi dinonaktifkan. Aktif: 14 pertemuan, 7 kuis, 7 diskusi.'};
}
function resetAdminPin() {
  var pin='123456'; // GANTI sebelum Run, lalu hapus fungsi ini jika sudah selesai.
  if(String(pin).length<6)throw new Error('PIN minimal 6 karakter.');
  var admin=findUserByIdentity_('ADMIN');if(!admin)throw new Error('Admin tidak ditemukan.');
  var hp=makeUserPin_(pin);updateRowObj_(LMS.SHEETS.USERS,admin.__row,{pin_salt:hp.salt,pin_hash:hp.hash,updated_at:nowIso_()});
  Logger.log('PIN admin baru: '+pin);return true;
}
