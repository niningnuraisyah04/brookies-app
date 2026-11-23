// KOMPONEN PUBLIK — dipindahkan dari App.jsx (Tahap 3).
import { rupiah } from '@/lib/utils'

// ProductGrid menampilkan kartu produk pada halaman publik.
export default function ProductGrid({ items }) {
  const fotoProduk = {
    "Original": "original.jpg",
    "Choco Cheese": "choco-cheese.jpg",
    "Biscoff": "biscoff.jpg",
    "Red Velvet Cheese": "red-velvet-cheese.jpg",
    "Blue & Red Monster": "blue-red-monster.jpg",
    "Dubai Cuwi Cookie": "dubai-cuwi-cookie.jpg",
    "Red Velvet Nutella": "red-velvet-nutella.jpg",
    "Red Velvet Chips": "red-velvet-chips.jpg",
    "Matcha Cheese": "matcha-cheese.jpg",
    "Matcha Nutella": "matcha-nutella.jpg",
  };

  return (
    <div className="product-grid">
      {items.map((p) => (
        <div key={p.id} className="product-card">
          <img
            src={`/images/${fotoProduk[p.nama] || "original.jpg"}`}
            alt={p.nama}
            className="product-photo"
          />

          <div className="product-info">
            <p className="product-name">{p.nama}</p>
            <p className="product-price">{rupiah(p.harga)}</p>

            <a
              href="https://wa.me/6281242760809"
              target="_blank"
              rel="noreferrer"
              className="product-order"
            >
              Pesan via WhatsApp
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
