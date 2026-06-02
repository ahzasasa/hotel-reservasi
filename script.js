// DATA PELENGKAP (Gambar & Deskripsi Spesifik Tiap Kamar)

const dataPelengkap = {
    'Standard King': { 
        img: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80', 
        desc: 'Kamar nyaman seluas 25 meter persegi, dilengkapi dengan 1 tempat tidur King Size yang sangat empuk. Pilihan ekonomis terbaik untuk pasangan.' 
    },
    'Standard Twin': { 
        img: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80', 
        desc: 'Kamar seluas 25 meter persegi dengan 2 tempat tidur Single terpisah. Sangat cocok untuk rekan kerja atau teman perjalanan.' 
    },
    'Superior Room': { 
        img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80', 
        desc: 'Desain interior modern dengan ruang gerak yang lebih lega. Dilengkapi dengan meja kerja ergonomis dan pencahayaan hangat.' 
    },
    'Deluxe King': { 
        img: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&q=80', 
        desc: 'Ruangan mewah yang luas dengan tempat tidur King Size premium. Dilengkapi dengan area duduk santai kecil dan minibar.' 
    },
    'Deluxe City View': { 
        img: 'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?w=800&q=80', 
        desc: 'Nikmati pemandangan lampu kota yang memukau langsung dari jendela besar di kamar Anda. Pengalaman menginap yang tak terlupakan.' 
    },
    'Family King': { 
        img: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&q=80', 
        desc: 'Kamar ekstra luas yang dirancang khusus untuk keluarga. Memiliki area bersantai tambahan dan memastikan ruang gerak bebas.' 
    },
    'Family Twin': { 
        img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80', 
        desc: 'Solusi cerdas liburan keluarga dengan 2 tempat tidur besar. Desain ruangan yang lega memastikan seluruh anggota keluarga nyaman.' 
    },
    'Family Connecting': {
        img: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80',
        desc: 'Kamar keluarga yang luas dengan akses pintu penghubung. Sangat ideal untuk liburan keluarga besar tanpa kehilangan privasi.'
    },
    'Connecting Room': {
        img: 'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=800&q=80',
        desc: 'Dua kamar yang terhubung melalui pintu dalam, sangat ideal untuk keluarga besar atau rombongan yang ingin tetap dekat.'
    },
    'Junior Suite': {
        img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80',
        desc: 'Kamar elegan dengan pemisah semi-permanen antara area tidur dan ruang tamu kecil, memberikan kesan eksklusif seperti di rumah sendiri.'
    },
    'Suite Room': {
        img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        desc: 'Kemewahan puncak hotel kami. Suite luas ini dilengkapi ruang tamu privat, dapur kecil, perabotan mewah, dan kamar mandi marmer kelas satu.'
    },
    'Presidential Suite': {
        img: 'https://images.unsplash.com/photo-1631049035182-249067d7618e?w=800&q=80',
        desc: 'Layanan VVIP dengan fasilitas tiada duanya. Ruang tamu raksasa, ruang makan pribadi, dan pemandangan panorama terbaik.'
    }
};

// Fungsi Pintar Pencari Data Kamar
function getInfoKamar(namaTipe) {
    // 1. Prioritaskan mencari nama persis (agar tiap kamar beda gambar)
    if (dataPelengkap[namaTipe]) {
        return dataPelengkap[namaTipe];
    }
    
    // 2. Jika tidak ada yang sama persis, tebak dari kata kuncinya (Fallback)
    const keys = Object.keys(dataPelengkap);
    for (let key of keys) {
        if (namaTipe.toLowerCase().includes(key.toLowerCase())) {
            return dataPelengkap[key];
        }
    }
    
    // 3. Gambar & Deskripsi Default jika sama sekali tidak dikenali
    return { 
        img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80', 
        desc: 'Kamar eksklusif persembahan Hotel Reservasi dengan fasilitas lengkap dan kenyamanan maksimal.' 
    };
}


// VARIABEL GLOBAL 
let originalRoomData = [];
let globalRoomData = []; 
let currentPage = 1;     
const itemsPerPage = 4;
let hargaKamarGlobal = 0; 
let hargaFasilitasGlobal = 0; 

const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);


// INISIALISASI SAAT HALAMAN DIMUAT (ROUTER)
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname;
    if (currentPath.includes('detail.html')) { loadDetailKamar(); }
    else if (currentPath.includes('detail-fasilitas.html')) { loadDetailFasilitas(); } 
    else if (currentPath.includes('kamar.html')) { loadDataKamarGrid(); }
    else if (currentPath.includes('cek-pesanan.html')) { initCekPesanan(); }
    else if (currentPath.includes('voucher.html')) { loadVoucher(); } // <-- TAMBAHKAN BARIS INI
    else if (currentPath.includes('fasilitas.html')) { /* statis */ }
    else { loadDataBeranda(); }
});


// BERANDA & PENCARIAN
function loadDataBeranda() {
    fetch('http://127.0.0.1:5000/api/tipe-kamar')
        .then(response => response.json())
        .then(data => { 
            originalRoomData = data.data || data;
            globalRoomData = [...originalRoomData];
            currentPage = 1; 
            renderKamarCards(); 
        })
        .catch(error => document.getElementById('kamar-container').innerHTML = '<h3 style="color:red; text-align:center;">Gagal terhubung ke Database.</h3>');
}

function initSearchEngine() {
    const searchForm = document.querySelector('.search-engine-container');
    if (!searchForm) return;

    searchForm.addEventListener('submit', function(event) {
        event.preventDefault(); 
        const checkin = document.getElementById('checkin').value;
        const checkout = document.getElementById('checkout').value;
        const kapasitas = document.getElementById('kapasitas').value;

        if (!checkin || !checkout) return alert('Silakan pilih tanggal Check-In dan Check-Out terlebih dahulu.');
        if (new Date(checkout) <= new Date(checkin)) return alert('Kesalahan: Tanggal Check-Out harus setelah tanggal Check-In!');

        document.getElementById('kamar-container').innerHTML = '<p style="text-align: center; padding: 50px;">Mencari kamar yang tersedia...</p>';
        fetch(`http://127.0.0.1:5000/api/cari-kamar?checkin=${checkin}&checkout=${checkout}&kapasitas=${kapasitas}`)
            .then(response => response.json())
            .then(data => { 
                originalRoomData = data.data || data;
                globalRoomData = data;
                currentPage = 1;
                renderKamarCards(); })
            .catch(error => document.getElementById('kamar-container').innerHTML = '<h3 style="color:red; text-align:center;">Terjadi kesalahan sistem.</h3>');
    });
}

function renderKamarCards() {
    const kamarContainer = document.getElementById('kamar-container');
    if (!kamarContainer) return;
    kamarContainer.innerHTML = ''; 

    if (globalRoomData.length === 0) {
        kamarContainer.innerHTML = '<h3 style="text-align:center; padding: 50px 20px; color: #5D1E21;">Maaf, tidak ada kamar yang sesuai dengan pencarian Anda.</h3>';
        return;
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedData = globalRoomData.slice(start, end);

    paginatedData.forEach(kamar => {
        // PERUBAHAN: Memanggil fungsi pintar pencari gambar
        const infoTambahan = getInfoKamar(kamar.nama_tipe);
        
        const fasilitasArray = kamar.fasilitas ? kamar.fasilitas.split(',') : [];
        let fasilitasSingkat = '';
        fasilitasArray.forEach(item => {
            fasilitasSingkat += `✔️ ${item.trim()}<br>`;
        });
        
        if (fasilitasSingkat === '') fasilitasSingkat = 'Fasilitas belum ditambahkan.<br>';

        const cardHTML = `
            <div class="horizontal-card">
                <img src="${infoTambahan.img}" alt="${kamar.nama_tipe}" class="horizontal-img">
                <div class="horizontal-body">
                    <div class="horizontal-header">
                        <h3>${kamar.nama_tipe}</h3>
                        <span style="color: #154230; font-weight: bold;">👥 ${kamar.kapasitas} Guest</span>
                    </div>
                    <div class="room-features">${fasilitasSingkat}</div>
                    <div class="horizontal-footer">
                        <a href="detail.html?id=${kamar.id_tipe}" class="link-more">More Info ↗</a>
                        <div class="price-section">
                            <span class="price-val">${formatRupiah(kamar.harga_per_malam)}</span>
                            <span class="price-tax">Rate for 1 Night • Tax Inclusive</span>
                            <button class="btn-book-now" onclick="window.location.href='detail.html?id=${kamar.id_tipe}'">Book</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        kamarContainer.innerHTML += cardHTML;
    });
    renderPaginationControls();
}

function renderPaginationControls() {
    const totalPages = Math.ceil(globalRoomData.length / itemsPerPage) || 1; 
    const kamarContainer = document.getElementById('kamar-container');
    let paginationHTML = `<div class="pagination-container">`;

    if (currentPage > 1) paginationHTML += `<button onclick="changePage(${currentPage - 1})" class="btn-page">❮ PREV</button>`;
    else paginationHTML += `<button class="btn-page disabled" disabled>❮ PREV</button>`;

    paginationHTML += `<span class="page-indicator">Halaman ${currentPage} dari ${totalPages}</span>`;

    if (currentPage < totalPages) paginationHTML += `<button onclick="changePage(${currentPage + 1})" class="btn-page">NEXT ❯</button>`;
    else paginationHTML += `<button class="btn-page disabled" disabled>NEXT ❯</button>`;

    paginationHTML += `</div>`;
    kamarContainer.innerHTML += paginationHTML;
}

window.changePage = function(page) {
    currentPage = page;
    renderKamarCards();
    const targetScroll = document.querySelector('.engine-layout');
    if(targetScroll) {
        const y = targetScroll.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({top: y, behavior: 'smooth'});
    }
}


// HALAMAN KAMAR GRID
function loadDataKamarGrid() {
    fetch('http://127.0.0.1:5000/api/tipe-kamar').then(res => res.json()).then(data => {
        const roomArray = data.data || data; 
        const gridContainer = document.getElementById('kamar-grid-container');
        if (!gridContainer) return;
        gridContainer.innerHTML = ''; 
        
        roomArray.forEach(kamar => {
            const infoTambahan = getInfoKamar(kamar.nama_tipe);
            
            const deskripsiFinal = kamar.deskripsi || infoTambahan.desc;
            
            gridContainer.innerHTML += `
                <div class="room-card-grid" onclick="window.location.href='detail.html?id=${kamar.id_tipe}'" style="cursor: pointer;">
                    <div class="img-wrapper">
                        <img src="${infoTambahan.img}" alt="${kamar.nama_tipe}">
                        <div class="img-overlay"><span class="overlay-btn">PERIKSA DETAILNYA ❯</span></div>
                    </div>
                    <div class="room-info-grid">
                        <h3>${kamar.nama_tipe}</h3>
                        <p>${deskripsiFinal}</p>
                        <span class="btn-detail-grid">PERIKSA DETAILNYA ❯</span>
                    </div>
                </div>`;
        });
    });
}


// DETAIL KAMAR & BOOKING
function loadDetailKamar() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('id');
    
    if (!roomId) return;

    fetch('http://127.0.0.1:5000/api/tipe-kamar')
        .then(res => res.json())
        .then(data => {
            const roomArray = data.data || data;
            const kamar = roomArray.find(k => k.id_tipe == roomId);
            if (kamar) {
                hargaKamarGlobal = kamar.harga_per_malam; 
                
                // PERUBAHAN: Memanggil fungsi pintar pencari gambar
                const infoTambahan = getInfoKamar(kamar.nama_tipe);
                
                document.getElementById('detail-nama').textContent = kamar.nama_tipe;
                document.getElementById('detail-img').src = infoTambahan.img;
                
                const elKapasitas = document.getElementById('detail-kapasitas');
                if (elKapasitas) {
                    elKapasitas.textContent = `${kamar.kapasitas} Guest Maximum`;
                }

                document.getElementById('detail-deskripsi').textContent = kamar.deskripsi || infoTambahan.desc;
                document.getElementById('detail-harga').textContent = formatRupiah(kamar.harga_per_malam) + ' / Malam';

                const wadahFasilitas = document.getElementById('detail-fasilitas');
                if (wadahFasilitas && kamar.fasilitas) {
                    wadahFasilitas.innerHTML = `<div class="amenity-item">🛏️ ${kamar.kapasitas} Guest Maximum</div>`;
                    const listFasilitas = kamar.fasilitas.split(',');
                    listFasilitas.forEach(item => {
                        wadahFasilitas.innerHTML += `<div class="amenity-item">✔️ ${item.trim()}</div>`;
                    });
                }

                hitungTotalKamar(); 

                const formBooking = document.getElementById('form-booking');
                if (formBooking) {
                    formBooking.addEventListener('submit', async function(e) {
                        e.preventDefault(); 
                        const btnSubmit = formBooking.querySelector('button');
                        btnSubmit.textContent = 'MEMPROSES...'; btnSubmit.disabled = true;
                        
                        const checkin = document.getElementById('book-in').value;
                        const checkout = document.getElementById('book-out').value;
                        const totalHarga = document.getElementById('total-harga-value').value;
                        
                        if (new Date(checkout) <= new Date(checkin)) {
                            alert("Tanggal Check-Out harus setelah Check-In!");
                            btnSubmit.textContent = 'KONFIRMASI PESANAN'; btnSubmit.disabled = false; return; 
                        }

                        const payload = {
                            id_tipe: kamar.id_tipe,
                            nama: document.getElementById('book-nama').value,
                            email: document.getElementById('book-email').value,
                            telepon: document.getElementById('book-tlp').value,
                            checkin: checkin,
                            checkout: checkout,
                            total_harga: totalHarga,
                            metode_pembayaran: document.getElementById('metode-bayar').value 
                        };

                        try {
                            const res = await fetch('http://127.0.0.1:5000/api/buat-pesanan', {
                                method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
                            });
                            const result = await res.json();
                            
                            if (result.status === 'success') {
                                window.location.href = `voucher.html?id=${result.id_reservasi}&email=${payload.email}`;
                            } else {
                                alert("Pemesanan Gagal: " + result.message);
                                btnSubmit.textContent = 'KONFIRMASI PESANAN'; btnSubmit.disabled = false;
                            }
                        } catch (err) {
                            alert("Gagal terhubung ke server.");
                            btnSubmit.textContent = 'KONFIRMASI PESANAN'; btnSubmit.disabled = false;
                        }
                    });
                }
            }
        });

    const bookInEl = document.getElementById('book-in');
    const bookOutEl = document.getElementById('book-out');
    if (bookInEl && bookOutEl) {
        bookInEl.addEventListener('input', hitungTotalKamar);
        bookInEl.addEventListener('change', hitungTotalKamar);
        bookOutEl.addEventListener('input', hitungTotalKamar);
        bookOutEl.addEventListener('change', hitungTotalKamar);
    }
}

function hitungTotalKamar() {
    const inputIn = document.getElementById('book-in');
    const inputOut = document.getElementById('book-out');
    const totalDisplay = document.getElementById('total-display');
    const totalValue = document.getElementById('total-harga-value'); 

    if (!inputIn || !inputOut || !totalDisplay) return;

    if (inputIn.value && inputOut.value) {
        const dateIn = new Date(inputIn.value);
        const dateOut = new Date(inputOut.value);

        if (dateOut > dateIn) {
            const diffTime = Math.abs(dateOut - dateIn);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const total = diffDays * hargaKamarGlobal;
            
            totalDisplay.value = formatRupiah(total);
            if (totalValue) totalValue.value = total;
        } else {
            totalDisplay.value = "Tanggal Tidak Valid";
            if (totalValue) totalValue.value = 0;
        }
    }
}


// DETAIL FASILITAS & BOOKING
const gambarFasilitas = {
    1: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80', 
    2: 'https://images.unsplash.com/photo-1574096079513-d8259312b78a?w=800&q=80', 
    3: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800&q=80', 
    4: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&q=80', 
    5: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800&q=80', 
    6: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80'  
};

// DATA PELENGKAP FASILITAS (Untuk menyamakan deskripsi detail dengan halaman depan)
const dataFasilitasLengkap = {
    1: { 
        nama: 'RESTORAN ANGGREK',
        desc: 'Restoran Anggrek adalah tempat yang sempurna untuk pertemuan sarapan, makan siang bisnis, atau makan malam. Nikmati beragam hidangan internasional kami yang luar biasa, mulai dari hidangan favorit Barat, Asia, hingga Indonesia.'
    },
    2: { 
        nama: 'ACAI BAR',
        desc: 'Bersantailah bersama teman-teman Anda sambil menikmati satu atau dua minuman. Nikmati beragam pilihan steak dan hidangan spesial harian lainnya yang menggugah selera. Kami menghibur Anda setiap Rabu hingga Jumat malam dengan penampilan band akustik lokal.'
    },
    3: { 
        nama: 'GRAND BALLROOM',
        desc: 'Ruang serbaguna terbesar kami, dirancang dengan kemewahan klasik dan akustik sempurna. Sangat ideal untuk konferensi tingkat tinggi, peluncuran produk, atau pesta perayaan berskala besar.'
    },
    4: { 
        nama: 'MEETING ROOM EXCLUSIVE',
        desc: 'Ruang rapat modern yang dirancang untuk produktivitas maksimal. Dilengkapi dengan proyektor definisi tinggi, papan tulis interaktif, dan koneksi internet super cepat.'
    },
    5: { 
        nama: 'WEDDING VENUE',
        desc: 'Wujudkan pernikahan impian Anda di lokasi kami yang menawan. Kami menawarkan layanan perencanaan pernikahan lengkap, mulai dari dekorasi elegan hingga menu katering yang tak terlupakan.'
    },
    6: { 
        nama: 'SPA & WELLNESS',
        desc: 'Manjakan diri Anda dan pulihkan energi di pusat Spa kami. Nikmati berbagai perawatan tradisional dan modern yang dilakukan oleh terapis profesional kami.'
    }
};

function loadDetailFasilitas() {
    const urlParams = new URLSearchParams(window.location.search);
    const fasId = urlParams.get('id');
    if (!fasId) return document.querySelector('.detail-content').innerHTML = '<h2>Fasilitas tidak ditemukan!</h2>';

    fetch('http://127.0.0.1:5000/api/fasilitas')
        .then(res => res.json())
        .then(data => {
            const fas = data.find(f => f.id_fasilitas == fasId);
            if (fas) {
                hargaFasilitasGlobal = fas.harga_dasar;
                
                // Mengambil nama dan deskripsi sinkron dari dataFasilitasLengkap
                const infoFasilitas = dataFasilitasLengkap[fasId] || { nama: fas.nama_fasilitas, desc: fas.deskripsi };
                
                document.getElementById('fas-nama').textContent = infoFasilitas.nama;
                document.getElementById('fas-kategori').textContent = fas.kategori;
                document.getElementById('fas-deskripsi').textContent = infoFasilitas.desc;
                document.getElementById('fas-harga').textContent = formatRupiah(fas.harga_dasar) + ' / per orang';
                
                if (gambarFasilitas[fasId]) document.getElementById('fas-img').src = gambarFasilitas[fasId];

                hitungTotalFasilitas();
            }
        });

    const paxInput = document.getElementById('fas-book-pax');
    if(paxInput) {
        paxInput.addEventListener('input', hitungTotalFasilitas);
        paxInput.addEventListener('change', hitungTotalFasilitas);
    }

    const formFasilitas = document.getElementById('form-fasilitas');
    if (formFasilitas) {
        formFasilitas.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = formFasilitas.querySelector('button');
            btn.textContent = 'MEMPROSES...'; btn.disabled = true;

            const payload = {
                id_fasilitas: fasId,
                nama: document.getElementById('fas-book-nama').value,
                email: document.getElementById('fas-book-email').value,
                telepon: document.getElementById('fas-book-tlp').value,
                tanggal: document.getElementById('fas-book-tanggal').value,
                waktu: document.getElementById('fas-book-waktu').value,
                pax: document.getElementById('fas-book-pax').value,
                catatan: document.getElementById('fas-book-catatan').value,
                total_harga: document.getElementById('fas-total-value').value,
                metode_pembayaran: document.getElementById('fas-metode-bayar').value
            };

            try {
                const res = await fetch('http://127.0.0.1:5000/api/buat-pesanan-fasilitas', {
                    method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(payload)
                });
                const result = await res.json();
                
                if (result.status === 'success') {
                    Swal.fire({
                        title: 'Reservasi Berhasil!',
                        text: `Fasilitas berhasil dipesan dengan ID: ${result.id_reservasi}`,
                        icon: 'success',
                        confirmButtonColor: '#198754',
                        confirmButtonText: 'Lihat E-Voucher'
                    }).then(() => {
                        window.location.href = `voucher.html?id=${result.id_reservasi}&email=${payload.email}`; 
                    });
                } else {
                    Swal.fire('Gagal!', "Pesan: " + result.message, 'error');
                    btn.textContent = 'KONFIRMASI RESERVASI'; btn.disabled = false;
                }
            } catch (err) {
                Swal.fire('Error!', "Kesalahan jaringan atau server.", 'error');
                btn.textContent = 'KONFIRMASI RESERVASI'; btn.disabled = false;
            }
        });
    }
}

function hitungTotalFasilitas() {
    const pax = document.getElementById('fas-book-pax')?.value;
    const totalDisplay = document.getElementById('fas-total-display');
    const totalValue = document.getElementById('fas-total-value');
    
    if (pax && pax > 0 && totalDisplay) {
        const total = pax * hargaFasilitasGlobal;
        totalDisplay.value = formatRupiah(total);
        if (totalValue) totalValue.value = total;
    } else if (totalDisplay) {
        totalDisplay.value = "Rp 0";
        if (totalValue) totalValue.value = 0;
    }
}


// CEK PESANAN -> VOUCHER
function initCekPesanan() {
    const form = document.getElementById('form-cek-pesanan');
    if(!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const idInput = document.getElementById('input-id').value;
        const emailInput = document.getElementById('input-email').value;
        const btnSubmit = form.querySelector('button');

        btnSubmit.textContent = "MENCARI..."; btnSubmit.disabled = true;
        
        // Percobaan 1: Cari di API Kamar
        fetch(`http://127.0.0.1:5000/api/cek-pesanan?id=${idInput}&email=${emailInput}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    window.location.href = `voucher.html?id=${idInput}&email=${emailInput}`;
                } else { 
                    // Percobaan 2: Cari di API Fasilitas
                    fetch(`http://127.0.0.1:5000/api/cek-pesanan-fasilitas?id=${idInput}&email=${emailInput}`)
                        .then(res2 => res2.ok ? res2.json() : {status: 'error'})
                        .then(data2 => {
                            btnSubmit.textContent = "CARI PESANAN"; btnSubmit.disabled = false;
                            if (data2.status === 'success') {
                                window.location.href = `voucher.html?id=${idInput}&email=${emailInput}`;
                            } else {
                                alert("Pesanan tidak ditemukan di database manapun.");
                            }
                        });
                }
            })
            .catch(err => { 
                alert("Kesalahan server."); 
                btnSubmit.textContent = "CARI PESANAN"; 
                btnSubmit.disabled = false; 
            });
    });
}


// FILTER KAMAR (HARGA & FASILITAS)
document.addEventListener('DOMContentLoaded', function() {
    const sliderHarga = document.getElementById('filter-harga');
    const labelHarga = document.getElementById('label-harga');
    if (sliderHarga && labelHarga) {
        sliderHarga.addEventListener('input', function() {
            labelHarga.textContent = formatRupiah(this.value);
        });
    }
});

async function terapkanFilter() {
    const checkin = document.getElementById('filter-checkin').value;
    const checkout = document.getElementById('filter-checkout').value;
    const kapasitas = document.getElementById('filter-kapasitas').value;
    const maxHarga = document.getElementById('filter-harga').value;
    
    let url = 'http://127.0.0.1:5000/api/tipe-kamar';
    let pakaiTanggal = false;

    if (checkin || checkout) {
        if (!checkin || !checkout) return alert('Silakan isi kedua tanggal Check-In dan Check-Out!');
        if (new Date(checkout) <= new Date(checkin)) return alert('Tanggal Check-Out harus setelah Check-In!');
        
        url = `http://127.0.0.1:5000/api/cari-kamar?checkin=${checkin}&checkout=${checkout}&kapasitas=${kapasitas}`;
        pakaiTanggal = true;

        const sumIn = document.getElementById('summary-in');
        const sumOut = document.getElementById('summary-out');
        if (sumIn) sumIn.textContent = checkin;
        if (sumOut) sumOut.textContent = checkout;
    }

    try {
        const wadah = document.getElementById('kamar-container');
        wadah.innerHTML = '<p style="text-align: center; padding: 50px;">Menerapkan filter...</p>';

        const response = await fetch(url);
        const data = await response.json();
        originalRoomData = data.data || data;

        const checkboxes = document.querySelectorAll('.filter-fasilitas:checked');
        const fasilitasPilihan = Array.from(checkboxes).map(cb => cb.value);

        globalRoomData = originalRoomData.filter(kamar => {
            const pasHarga = kamar.harga_per_malam <= parseInt(maxHarga);
            const pasFasilitas = fasilitasPilihan.every(fas => kamar.fasilitas && kamar.fasilitas.includes(fas));
            const pasKapasitas = pakaiTanggal ? true : (kamar.kapasitas >= parseInt(kapasitas)); 

            return pasHarga && pasFasilitas && pasKapasitas;
        });

        currentPage = 1;
        renderKamarCards();

    } catch (error) {
        console.error(error);
        document.getElementById('kamar-container').innerHTML = '<h3 style="color:red; text-align:center;">Gagal menerapkan filter.</h3>';
    }
}

function resetFilter() {
    document.getElementById('filter-checkin').value = '';
    document.getElementById('filter-checkout').value = '';
    document.getElementById('filter-kapasitas').value = '2';
    document.getElementById('filter-harga').value = 10000000;
    document.getElementById('label-harga').textContent = "Rp 10.000.000";
    document.querySelectorAll('.filter-fasilitas').forEach(cb => cb.checked = false);

    const sumIn = document.getElementById('summary-in');
    const sumOut = document.getElementById('summary-out');
    if (sumIn) sumIn.textContent = '-';
    if (sumOut) sumOut.textContent = '-';

    loadDataBeranda();
}


// FUNGSI 6: MENAMPILKAN E-VOUCHER
function loadVoucher() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    const email = urlParams.get('email');

    if (!orderId || !email) {
        alert("Data pesanan tidak lengkap di URL.");
        window.location.href = 'index.html';
        return;
    }

    // Melakukan fetch ke backend Python untuk mengambil data dari MySQL
    fetch(`http://127.0.0.1:5000/api/cek-pesanan?id=${orderId}&email=${email}`)
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                // Menyesuaikan dengan struktur data yang dikirim oleh backend
                const p = data.data || data; 
                
                document.getElementById('v-id').textContent = p.id_reservasi || orderId;
                document.getElementById('v-nama').textContent = p.nama_tamu || p.nama || '-';
                document.getElementById('v-email').textContent = email;
                
                // Mendeteksi apakah pesanan ini Kamar (nama_tipe) atau Fasilitas (nama_fasilitas)
                document.getElementById('v-item').textContent = p.nama_tipe || p.nama_fasilitas || 'Layanan Reservasi';
                
                // Menyamakan nama kolom tanggal yang mungkin berbeda antara tabel kamar dan fasilitas
                document.getElementById('v-checkin').textContent = p.tanggal_checkin || p.tanggal || '-';
                document.getElementById('v-checkout').textContent = p.tanggal_checkout || p.waktu || '-';
                
                document.getElementById('v-total').textContent = formatRupiah(p.total_harga || 0);
            } else {
                alert("Peringatan: " + data.message);
            }
        })
        .catch(err => {
            console.error(err);
            alert("Gagal menarik data pesanan dari server database.");
        });
}