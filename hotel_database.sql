-- ====================================================
-- SCRIPT DATABASE: SISTEM RESERVASI HOTEL
-- ====================================================

-- Membuat database jika belum ada dan langsung menggunakannya
CREATE DATABASE IF NOT EXISTS hotel_reservasi_db;
USE hotel_reservasi_db;

-- Mematikan pengecekan Foreign Key sementara agar tabel bisa di-reset dengan aman
SET FOREIGN_KEY_CHECKS = 0;

-- Menghapus tabel lama jika sudah ada (agar tidak error saat dijalankan ulang)
DROP TABLE IF EXISTS detail_reservasi;
DROP TABLE IF EXISTS reservasi;
DROP TABLE IF EXISTS kamar;
DROP TABLE IF EXISTS tipe_kamar;
DROP TABLE IF EXISTS tamu;

-- Menyalakan kembali pengecekan relasi
SET FOREIGN_KEY_CHECKS = 1;


-- ==========================================
-- 1. PEMBUATAN STRUKTUR TABEL (DDL)
-- ==========================================

-- Tabel Tamu
CREATE TABLE tamu (
    id_tamu INT AUTO_INCREMENT PRIMARY KEY,
    nama_lengkap VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    nomor_telepon VARCHAR(15) NOT NULL
) ENGINE=InnoDB;

-- Tabel Tipe Kamar
CREATE TABLE tipe_kamar (
    id_tipe INT AUTO_INCREMENT PRIMARY KEY,
    nama_tipe VARCHAR(100) NOT NULL,
    kapasitas INT NOT NULL,
    harga_per_malam DECIMAL(10, 2) NOT NULL
) ENGINE=InnoDB;

-- Tabel Kamar Fisik
CREATE TABLE kamar (
    id_kamar INT AUTO_INCREMENT PRIMARY KEY,
    id_tipe INT NOT NULL,
    nomor_kamar VARCHAR(10) NOT NULL,
    lantai INT NOT NULL,
    status ENUM('Tersedia', 'Terisi', 'Perbaikan') DEFAULT 'Tersedia',
    FOREIGN KEY (id_tipe) REFERENCES tipe_kamar(id_tipe) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabel Reservasi Induk
CREATE TABLE reservasi (
    id_reservasi INT AUTO_INCREMENT PRIMARY KEY,
    id_tamu INT NOT NULL,
    tanggal_masuk DATE NOT NULL,
    tanggal_keluar DATE NOT NULL,
    total_harga DECIMAL(10, 2) NOT NULL,
    status_pesanan ENUM('Menunggu', 'Dikonfirmasi', 'Batal', 'Selesai') DEFAULT 'Menunggu',
    waktu_pesan TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_tamu) REFERENCES tamu(id_tamu) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabel Detail Reservasi (Penghubung Reservasi dan Kamar Fisik)
CREATE TABLE detail_reservasi (
    id_detail INT AUTO_INCREMENT PRIMARY KEY,
    id_reservasi INT NOT NULL,
    id_kamar INT NOT NULL,
    harga_terkunci DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (id_reservasi) REFERENCES reservasi(id_reservasi) ON DELETE CASCADE,
    FOREIGN KEY (id_kamar) REFERENCES kamar(id_kamar) ON DELETE CASCADE
) ENGINE=InnoDB;


-- ==========================================
-- 2. MEMASUKKAN DATA KAMAR (DML)
-- ==========================================

-- Masukkan 24 Tipe Kamar Baru
INSERT INTO tipe_kamar (nama_tipe, kapasitas, harga_per_malam) VALUES
-- STANDARD
('Standard Room - Room Only', 2, 300000),
('Standard Room - Breakfast Included', 2, 350000),
('Standard Twin Room', 2, 375000),
('Standard Queen Room', 2, 375000),
('Standard Garden View', 2, 400000),

-- DELUXE
('Deluxe Room with City View', 2, 500000),
('Deluxe Room with Balcony', 2, 550000),
('Deluxe Room - Breakfast Included', 2, 600000),
('Deluxe King Room', 2, 650000),
('Deluxe Executive Room', 2, 750000),

-- FAMILY
('Family Room for 4 Guests', 4, 800000),
('Family Suite with Breakfast', 4, 950000),
('Family Connecting Room', 4, 1000000),
('Family Room with Extra Bed', 5, 1100000),

-- SUITE
('Junior Suite', 2, 1200000),
('Executive Suite', 2, 1500000),
('Presidential Suite', 4, 2500000),
('Honeymoon Suite', 2, 2000000),
('Suite with Private Lounge', 4, 2200000),
('Suite with Jacuzzi', 2, 2800000);

-- Masukkan kamar fisik (satu unit per tipe untuk contoh)
INSERT INTO kamar (id_tipe, nomor_kamar, lantai, status)
SELECT id_tipe, CONCAT('K-', id_tipe), FLOOR(id_tipe/6)+1, 'Tersedia'
FROM tipe_kamar;


-- ==========================================
-- 3. DATA DUMMY UNTUK TESTING CEK PESANAN
-- ==========================================

-- Memasukkan 1 Tamu Uji Coba atas nama Ahza Taradiva Pasha
INSERT INTO tamu (nama_lengkap, email, nomor_telepon) VALUES
('Ahza Taradiva Pasha', 'ahza.pasha@email.com', '081234567890');

-- Membuat 1 Reservasi Sukses (Menginap 2 malam)
INSERT INTO reservasi (id_tamu, tanggal_masuk, tanggal_keluar, total_harga, status_pesanan) VALUES
(1, '2026-06-10', '2026-06-12', 3600000, 'Dikonfirmasi');

-- Mengunci Kamar Fisik (Kamar Honeymoon Suite) untuk reservasi di atas
INSERT INTO detail_reservasi (id_reservasi, id_kamar, harga_terkunci) VALUES
(1, 10, 1800000);

-- Mengubah status fisik kamar tersebut menjadi Terisi
UPDATE kamar SET status = 'Terisi' WHERE id_kamar = 10;