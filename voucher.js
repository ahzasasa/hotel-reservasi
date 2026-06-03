document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const idReservasi = urlParams.get('id');
    const email = urlParams.get('email');

    const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);

    if (!idReservasi || !email) {
        Swal.fire("Error", "Data tidak valid. Pastikan Anda mengakses dari tautan yang benar.", "error").then(() => window.location.href = 'index.html');
        return;
    }

    // encetak data ke layar
    function cetakDataVoucher(dataResult, isFasilitas = false) {
        const p = dataResult.data || dataResult;
        
        document.getElementById('v-id').textContent = p.id_reservasi || idReservasi;
        document.getElementById('v-nama').textContent = p.nama_lengkap || p.nama_tamu || p.nama || '-';
        document.getElementById('v-telepon').textContent = p.nomor_telepon || p.telepon || '-';
        
        document.getElementById('v-tipe').textContent = p.nama_tipe || p.nama_fasilitas || 'Layanan Reservasi';
        document.getElementById('v-checkin').textContent = p.tanggal_masuk || p.tanggal_checkin || p.tanggal || '-';
        document.getElementById('v-checkout').textContent = p.tanggal_keluar || p.tanggal_checkout || p.waktu || '-';
        
        if (isFasilitas) {
            const sectionJudul = document.querySelectorAll('.section-title')[0];
            if(sectionJudul) sectionJudul.textContent = 'DETAIL FASILITAS';
            document.getElementById('v-tipe').previousElementSibling.textContent = 'Layanan / Fasilitas';
            document.getElementById('v-checkin').previousElementSibling.textContent = 'Tanggal Reservasi';
            document.getElementById('v-checkout').previousElementSibling.textContent = 'Waktu Kedatangan';
            
            document.getElementById('v-nokamar').previousElementSibling.textContent = 'Status Layanan';
            document.getElementById('v-nokamar').textContent = 'Sesuai Pesanan';
        } 
        else {
            document.getElementById('v-nokamar').textContent = p.nomor_kamar || 'Menunggu Alokasi';
        }

        document.getElementById('v-metode').textContent = p.metode_pembayaran || '-';
        document.getElementById('v-total').textContent = formatRupiah(p.harga_terkunci || p.total_harga || 0);
        document.getElementById('v-transaksi').innerText = p.referensi_transaksi || p.id_transaksi || 'Menunggu Pembayaran';

        const statusBadge = document.getElementById('v-status');
        const btnBayar = document.getElementById('btn-bayar-sekarang');
        const btnBatal = document.getElementById('btn-batal-pesanan');
        const opsiBayar = document.getElementById('opsi-bayar-container');
        const selectBayar = document.getElementById('pilihan-bayar');

        const statPesanan = p.status_pesanan || p.status || 'Pending';
        const statPembayaran = p.status_pembayaran || 'Unpaid';

        // 1. validasi status pembatalan pesanan
        if (statPesanan.toLowerCase().includes('batal')) {
            statusBadge.textContent = 'CANCELED / BATAL';
            statusBadge.style.borderColor = '#d9534f';
            statusBadge.style.color = '#d9534f';
            btnBatal.style.display = 'none';
            btnBayar.style.display = 'none';
            opsiBayar.style.display = 'none';
        } else {
            // tombol pembatalan
            if (!statPesanan.toLowerCase().includes('check-in') && !statPesanan.toLowerCase().includes('selesai')) {
                btnBatal.style.display = 'block';
            } else {
                btnBatal.style.display = 'none';
            }

            // 2. validasi status pembayaran
            if (statPembayaran.toLowerCase().includes('lunas') || statPembayaran.toLowerCase().includes('paid')) {
                statusBadge.textContent = 'PAID / LUNAS';
                statusBadge.style.borderColor = '#154230';
                statusBadge.style.color = '#154230';
                btnBayar.style.display = 'none';
                opsiBayar.style.display = 'none';
            } 
            else if (statPembayaran.toLowerCase().includes('dp')) {
                statusBadge.textContent = 'PARTIAL / DP 50%';
                statusBadge.style.borderColor = '#A6824A';
                statusBadge.style.color = '#A6824A';
                opsiBayar.style.display = 'block';
                selectBayar.innerHTML = '<option value="Lunas">Lunasi Sisa Tagihan (50%)</option>';
                btnBayar.style.display = 'block';
            } 
            else {
                statusBadge.textContent = 'UNPAID / PENDING';
                statusBadge.style.borderColor = '#5D1E21';
                statusBadge.style.color = '#5D1E21';
                opsiBayar.style.display = 'block';
                btnBayar.style.display = 'block';
            }
        }

        // handler pembayaran
        btnBayar.onclick = function() {
            const nominalPilihan = selectBayar.value;
            Swal.fire({
                title: 'Konfirmasi Pembayaran',
                text: `Anda yakin ingin memproses pembayaran dengan status: ${nominalPilihan}?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#198754',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Ya, Proses!',
                cancelButtonText: 'Batal',
                backdrop: `rgba(0,0,0,0.4)`
            }).then((result) => {
                if (result.isConfirmed) {
                    btnBayar.textContent = "MEMPROSES TRANSAKSI...";
                    btnBayar.disabled = true;

                    fetch('http://127.0.0.1:5000/api/proses-bayar', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id_reservasi: idReservasi,
                            status_pembayaran: nominalPilihan
                        })
                    })
                    .then(res => res.json())
                    .then(dataBayar => {
                        if(dataBayar.status === 'success') {
                            Swal.fire('Berhasil!', 'Pembayaran Diverifikasi! Status invoice diperbarui.', 'success')
                            .then(() => window.location.reload());
                        } else {
                            Swal.fire('Gagal!', "Pesan: " + dataBayar.message, 'error');
                            btnBayar.textContent = "PROSES PEMBAYARAN";
                            btnBayar.disabled = false;
                        }
                    })
                    .catch(err => {
                        Swal.fire('Error!', "Koneksi gagal ke server.", 'error');
                        btnBayar.textContent = "PROSES PEMBAYARAN";
                        btnBayar.disabled = false;
                    });
                }
            });
        };

        // handler pembatalan
        btnBatal.onclick = function() {
            Swal.fire({
                title: 'Batalkan Pesanan?',
                text: "PERINGATAN: Apakah Anda yakin ingin membatalkan pesanan ini?",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Ya, Batalkan!',
                cancelButtonText: 'Tidak, Kembali',
                backdrop: `rgba(0,0,0,0.6)`
            }).then((result) => {
                if (result.isConfirmed) {
                    btnBatal.textContent = "MEMBATALKAN...";
                    btnBatal.disabled = true;

                    fetch('http://127.0.0.1:5000/api/batal-pesanan', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ id_reservasi: idReservasi })
                    })
                    .then(res => res.json())
                    .then(dataBatal => {
                        if(dataBatal.status === 'success') {
                            Swal.fire('Dibatalkan!', 'Pesanan berhasil dibatalkan.', 'success')
                            .then(() => window.location.reload());
                        } else {
                            Swal.fire('Gagal!', "Pesan: " + dataBatal.message, 'error');
                            btnBatal.textContent = "BATALKAN PESANAN";
                            btnBatal.disabled = false;
                        }
                    })
                    .catch(err => {
                        Swal.fire('Error!', "Koneksi gagal ke server.", 'error');
                        btnBatal.textContent = "BATALKAN PESANAN";
                        btnBatal.disabled = false;
                    });
                }
            });
        };

        // Tampilkan konten voucher
        document.getElementById('voucher-content').style.display = 'block';
    }

    // PENCARIAN GANDA
    
    // 1. cari dulu di database Kamar
    fetch(`http://127.0.0.1:5000/api/cek-pesanan?id=${idReservasi}&email=${email}`)
        .then(res => res.ok ? res.json() : Promise.reject(res))
        .then(data => {
            if (data.status === 'success') {
                cetakDataVoucher(data, false); // Parameter false = Ini pesanan Kamar
            } else {
                throw new Error("Tidak ditemukan di tabel Kamar"); 
            }
        })
        .catch(errKamar => {
            // 2. jika gagal di kamar, cari di database fasilitas
            fetch(`http://127.0.0.1:5000/api/cek-pesanan-fasilitas?id=${idReservasi}&email=${email}`)
                .then(res => res.ok ? res.json() : {status: 'error'})
                .then(dataFas => {
                    if (dataFas.status === 'success') {
                        cetakDataVoucher(dataFas, true);
                    } else {
                        Swal.fire('Gagal', 'Pesanan Kamar maupun Fasilitas tidak ditemukan.', 'error')
                            .then(() => window.location.href = 'index.html');
                    }
                })
                .catch(errFas => {
                    console.error('Error Fasilitas:', errFas);
                    Swal.fire('Kesalahan Server', 'Gagal memuat data dari database fasilitas.', 'error');
                });
        });
});