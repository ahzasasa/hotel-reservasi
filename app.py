from flask import Flask, jsonify, request
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
# Mengaktifkan CORS agar frontend (HTML/JS) diizinkan mengambil data dari backend Python
CORS(app)

# ==========================================
# KONFIGURASI KONEKSI DATABASE
# ==========================================
def get_db_connection():
    connection = mysql.connector.connect(
        host='localhost',
        user='root',       # Sesuaikan dengan username MySQL Anda
        password='',       # Kosongkan jika menggunakan XAMPP bawaan
        database='hotel_reservasi_db'
    )
    return connection


# ==========================================
# ENDPOINT API
# ==========================================

# 1. Endpoint Uji Coba Server
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "Server Backend Hotel Reservasi Berjalan Normal!"
    })


# 2. Endpoint Mengambil Data Seluruh Tipe Kamar (Digunakan di Beranda & Detail)
@app.route('/api/tipe-kamar', methods=['GET'])
def get_tipe_kamar():
    conn = None
    cursor = None
    try:
        # Membuka koneksi
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True) 
        
        # Menarik data tipe kamar
        cursor.execute("SELECT * FROM tipe_kamar")
        data_kamar = cursor.fetchall()
        
        return jsonify(data_kamar)
        
    except Exception as e:
        # Menangkap dan menampilkan pesan jika terjadi kegagalan (misal: XAMPP mati)
        return jsonify({"status": "error", "message": str(e)}), 500
        
    finally:
        # Blok ini dipastikan akan berjalan untuk menutup jalan koneksi database
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 3. Endpoint Pencarian Kamar Tersedia (Persiapan Fitur Booking Engine)
@app.route('/api/cari-kamar', methods=['GET'])
def cari_kamar():
    # Menangkap parameter dari URL frontend (misal: ?checkin=2026-05-23&kapasitas=2)
    checkin = request.args.get('checkin')
    checkout = request.args.get('checkout')
    kapasitas = request.args.get('kapasitas', 1) # Default kapasitas 1 jika kosong
    
    if not checkin or not checkout:
        return jsonify({"status": "error", "message": "Tanggal Check-In dan Check-Out wajib diisi."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Logika SQL: Mencari tipe kamar yang unit fisiknya masih 'Tersedia' dan kapasitasnya sesuai
        query = """
            SELECT DISTINCT tk.* FROM tipe_kamar tk
            JOIN kamar k ON tk.id_tipe = k.id_tipe
            WHERE k.status = 'Tersedia' 
            AND tk.kapasitas >= %s
        """
        cursor.execute(query, (kapasitas,))
        kamar_tersedia = cursor.fetchall()
        
        return jsonify(kamar_tersedia)
        
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
        
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()


# 4. Endpoint Cek Status Pesanan
@app.route('/api/cek-pesanan', methods=['GET'])
def cek_pesanan():
    id_res = request.args.get('id')
    email = request.args.get('email')

    if not id_res or not email:
        return jsonify({"status": "error", "message": "ID dan Email wajib diisi."}), 400

    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Logika SQL: Menggabungkan (JOIN) 5 tabel untuk merangkum data pesanan secara utuh
        query = """
            SELECT 
                r.id_reservasi, r.tanggal_masuk, r.tanggal_keluar, r.total_harga, r.status_pesanan,
                t.nama_lengkap, t.nomor_telepon, t.email,
                tk.nama_tipe
            FROM reservasi r
            JOIN tamu t ON r.id_tamu = t.id_tamu
            JOIN detail_reservasi dr ON r.id_reservasi = dr.id_reservasi
            JOIN kamar k ON dr.id_kamar = k.id_kamar
            JOIN tipe_kamar tk ON k.id_tipe = tk.id_tipe
            WHERE r.id_reservasi = %s AND t.email = %s
            LIMIT 1
        """
        cursor.execute(query, (id_res, email))
        pesanan = cursor.fetchone()
        
        if pesanan:
            # Mengubah format tanggal agar mudah dibaca Javascript (opsional)
            pesanan['tanggal_masuk'] = pesanan['tanggal_masuk'].strftime('%Y-%m-%d')
            pesanan['tanggal_keluar'] = pesanan['tanggal_keluar'].strftime('%Y-%m-%d')
            return jsonify({"status": "success", "data": pesanan})
        else:
            return jsonify({"status": "not_found", "message": "Pesanan tidak ditemukan. Periksa kembali ID dan Email Anda."}), 404
            
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
        
    finally:
        if cursor: cursor.close()
        if conn: conn.close()


# 5. Endpoint Membuat Pesanan Baru (Booking)
@app.route('/api/buat-pesanan', methods=['POST'])
def buat_pesanan():
    data = request.json
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Mulai transaksi (agar jika satu tabel gagal, semuanya otomatis dibatalkan)
        conn.start_transaction()
        
        # 1. Cek ketersediaan fisik kamar di database
        cursor.execute("SELECT id_kamar FROM kamar WHERE id_tipe = %s AND status = 'Tersedia' LIMIT 1", (data['id_tipe'],))
        kamar = cursor.fetchone()
        
        if not kamar:
            return jsonify({"status": "error", "message": "Maaf, seluruh unit kamar tipe ini sedang terisi/penuh."}), 400
            
        id_kamar = kamar['id_kamar']
        
        # 2. Proses Data Tamu (Cari apakah email sudah pernah mendaftar sebelumnya)
        cursor.execute("SELECT id_tamu FROM tamu WHERE email = %s", (data['email'],))
        tamu = cursor.fetchone()
        
        if tamu:
            id_tamu = tamu['id_tamu'] # Gunakan ID lama
        else:
            # Jika tamu baru, masukkan ke tabel tamu
            cursor.execute(
                "INSERT INTO tamu (nama_lengkap, email, nomor_telepon) VALUES (%s, %s, %s)", 
                (data['nama'], data['email'], data['telepon'])
            )
            id_tamu = cursor.lastrowid # Ambil ID yang baru saja dibuat
            
        # 3. Buat Rekam Reservasi
        cursor.execute(
            "INSERT INTO reservasi (id_tamu, tanggal_masuk, tanggal_keluar, total_harga, status_pesanan) VALUES (%s, %s, %s, %s, 'Menunggu')",
            (id_tamu, data['checkin'], data['checkout'], data['total_harga'])
        )
        id_reservasi = cursor.lastrowid
        
        # 4. Kunci Kamar Spesifik di Detail Reservasi
        cursor.execute(
            "INSERT INTO detail_reservasi (id_reservasi, id_kamar, harga_terkunci) VALUES (%s, %s, %s)",
            (id_reservasi, id_kamar, data['total_harga'])
        )
        
        # 5. Ubah status kamar fisik menjadi 'Terisi' agar tidak dipesan orang lain
        cursor.execute("UPDATE kamar SET status = 'Terisi' WHERE id_kamar = %s", (id_kamar,))
        
        # Simpan seluruh proses secara permanen ke database
        conn.commit()
        
        return jsonify({"status": "success", "message": "Pesanan Berhasil!", "id_reservasi": id_reservasi})
        
    except Exception as e:
        if conn: conn.rollback() # Batalkan semua proses SQL jika terjadi error di tengah jalan
        return jsonify({"status": "error", "message": str(e)}), 500
        
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
        

# ==========================================
# MENJALANKAN SERVER
# ==========================================
if __name__ == '__main__':
    # debug=True membuat server langsung memperbarui diri jika ada kode yang diubah
    app.run(debug=True, port=5000)