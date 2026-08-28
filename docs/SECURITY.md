# Keamanan

- Web App Apps Script dapat dideploy `Anyone`, tetapi semua aksi sensitif tetap diverifikasi backend.
- PIN tidak disimpan sebagai plaintext.
- Hash PIN memakai SHA-256 + salt per user + pepper global.
- Session token ditandatangani HMAC SHA-256 dan memiliki masa berlaku 12 jam.
- Role admin/dosen diverifikasi di setiap endpoint admin.
- HTML input dibersihkan di backend secara dasar dan disanitasi lagi di frontend dengan DOMPurify.
- Jangan memasukkan secret/API key AI ke frontend.
- Jika LMS menyimpan materi berhak cipta, pastikan izin penggunaannya sesuai.
