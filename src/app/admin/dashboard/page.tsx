"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Product, StoreConfig, Category } from "@/lib/types";
import { formatRupiah } from "@/lib/format";
import {
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateConfig,
  adminChangePassword,
  adminGetCategories,
  adminCreateCategory,
  adminDeleteCategory,
  getConfig,
  ApiError,
} from "@/lib/api";

async function deleteOldImage(imagePath: string, token: string) {
  if (!imagePath || imagePath.startsWith("http")) return;
  try {
    await fetch("/api/admin/delete-image", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ imagePath }),
    });
  } catch {
    // ignore
  }
}

const emptyForm: Partial<Product> = {
  name: "",
  price: 0,
  image: "",
  stock: 0,
  sold: 0,
  minBuy: 1,
  description: "",
  active: true,
  availability: "in_stock",
};

export default function AdminDashboard() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"products" | "categories" | "settings" | "password">("products");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Partial<Product>>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [config, setConfig] = useState<StoreConfig | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [pwForm, setPwForm] = useState({ current: "", next: "" });
  const [catName, setCatName] = useState("");

  useEffect(() => {
    const t = sessionStorage.getItem("haiz_admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
  }, [router]);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [ps, cats, cfg] = await Promise.all([adminGetProducts(token), adminGetCategories(token), getConfig()]);
      setProducts(ps);
      setCategories(cats);
      setConfig(cfg);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        sessionStorage.removeItem("haiz_admin_token");
        router.push("/admin/login");
      } else {
        setErr("Gagal memuat data");
      }
    }
  }, [token, router]);

  useEffect(() => {
    load();
  }, [load]);

  function logout() {
    sessionStorage.removeItem("haiz_admin_token");
    router.push("/admin/login");
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    setUploading(true);
    setErr("");
    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch("/api/admin/upload-image", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload gagal");
      }
      const data = await res.json();
      setForm((prev) => ({ ...prev, image: data.path }));
      setImagePreview(data.path);
      setMsg("Gambar berhasil diupload");
    } catch (error: any) {
      setErr(error.message || "Gagal upload gambar");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function submitProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr("");
    setMsg("");
    try {
      if (editingId) {
        const existing = products.find((p) => p.id === editingId);
        const oldImage = existing?.image || "";
        await adminUpdateProduct(token, editingId, form);
        if (oldImage && oldImage !== form.image) {
          await deleteOldImage(oldImage, token);
        }
        setMsg("Produk berhasil diperbarui");
      } else {
        await adminCreateProduct(token, form);
        setMsg("Produk berhasil ditambahkan");
      }
      setForm(emptyForm);
      setEditingId(null);
      setImagePreview("");
      load();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Gagal menyimpan produk");
    }
  }

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({ ...p });
    setImagePreview(p.image);
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setImagePreview("");
    setMsg("");
    setErr("");
  }

  async function removeProduct(id: string) {
    if (!token || !confirm("Hapus produk ini?")) return;
    try {
      const existing = products.find((p) => p.id === id);
      await adminDeleteProduct(token, id);
      if (existing?.image) {
        await deleteOldImage(existing.image, token);
      }
      load();
      cancelEdit();
    } catch {
      setErr("Gagal menghapus produk");
    }
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !catName.trim()) return;
    try {
      await adminCreateCategory(token, catName);
      setCatName("");
      load();
    } catch {
      setErr("Gagal menambah kategori");
    }
  }

  async function removeCategory(id: string) {
    if (!token || !confirm("Hapus kategori? Produk di kategori ini akan kehilangan kategorinya.")) return;
    try {
      await adminDeleteCategory(token, id);
      load();
    } catch {
      setErr("Gagal menghapus kategori");
    }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !config) return;
    setErr("");
    setMsg("");
    try {
      await adminUpdateConfig(token, config);
      setMsg("Pengaturan toko berhasil disimpan");
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Gagal menyimpan pengaturan");
    }
  }

  async function submitPasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    setErr("");
    setMsg("");
    try {
      await adminChangePassword(token, pwForm.current, pwForm.next);
      setMsg("Password berhasil diubah");
      setPwForm({ current: "", next: "" });
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Gagal mengubah password");
    }
  }

  if (!token) return null;

  return (
    <div className="admin-shell">
      <div className="top-row">
        <h2 style={{ color: "var(--gold-bright)", margin: 0 }}>Admin — Haiz Store</h2>
        <button className="btn" onClick={logout}>Keluar</button>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>Produk</button>
        <button className={`tab ${tab === "categories" ? "active" : ""}`} onClick={() => setTab("categories")}>Kategori</button>
        <button className={`tab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>Pengaturan Toko</button>
        <button className={`tab ${tab === "password" ? "active" : ""}`} onClick={() => setTab("password")}>Ganti Password</button>
      </div>

      {msg && <div className="success-text">{msg}</div>}
      {err && <div className="error-text">{err}</div>}

      {tab === "products" && (
        <>
          <form
            onSubmit={submitProduct}
            style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginTop: 16, marginBottom: 24 }}
          >
            <h3 style={{ marginTop: 0 }}>{editingId ? "Edit Produk" : "Tambah Produk Baru"}</h3>

            <div className="field">
              <label>Nama Produk</label>
              <input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div className="field">
              <label>Harga (Rp)</label>
              <input type="text" inputMode="numeric" value={form.price?.toLocaleString("id-ID") || ""} onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setForm({ ...form, price: val ? Number(val) : 0 });
              }} required />
            </div>

            <div className="field">
              <label>Kategori</label>
              <select value={form.categoryId || ""} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">Tanpa Kategori</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Gambar Produk</label>
              {imagePreview && <div style={{ marginBottom: 8 }}><img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: 160, borderRadius: 8, border: "1px solid var(--border)", objectFit: "cover" }}/></div>}
              <input type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleImageUpload} disabled={uploading} />
            </div>

            <div className="field">
              <label>Status Ketersediaan</label>
              <select value={form.availability || "in_stock"} onChange={(e) => setForm({ ...form, availability: e.target.value as "in_stock" | "pre_order" })}>
                <option value="in_stock">Tersedia</option>
                <option value="pre_order">Pre-Order</option>
              </select>
            </div>

            <div className="field">
              <label>Deskripsi Produk</label>
              <textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ minHeight: 120 }} placeholder="Masukkan deskripsi produk..." />
            </div>

            <div className="field">
              <label>Jumlah Terjual</label>
              <input type="number" min={0} value={form.sold ?? 0} onChange={(e) => setForm({ ...form, sold: Number(e.target.value) })} />
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn primary" type="submit" disabled={uploading}>{editingId ? "Simpan Perubahan" : "Tambah Produk"}</button>
              {editingId && <button type="button" className="btn" onClick={cancelEdit}>Batal</button>}
            </div>
          </form>

          <table className="table">
            <thead><tr><th>Nama</th><th>Kategori</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{categories.find(c => c.id === p.categoryId)?.name || "-"}</td>
                  <td>{p.availability === "in_stock" ? "Tersedia" : "Pre-Order"}</td>
                  <td style={{ display: "flex", gap: 6 }}>
                    <button className="btn" onClick={() => startEdit(p)}>Edit</button>
                    <button className="btn" onClick={() => removeProduct(p.id)}>Hapus</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {tab === "categories" && (
        <div style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginTop: 16 }}>
          <form onSubmit={addCategory} style={{ display: "flex", gap: 8, marginBottom: 20 }}>
            <input value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="Nama kategori baru" required style={{ flex: 1 }} />
            <button className="btn primary" type="submit">Tambah Kategori</button>
          </form>
          <table className="table">
            <tbody>
              {categories.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td style={{ textAlign: "right" }}><button className="btn" onClick={() => removeCategory(c.id)}>Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "settings" && config && (
        <form
          onSubmit={saveConfig}
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginTop: 16, maxWidth: 500 }}
        >
          <h3 style={{ marginTop: 0 }}>Informasi Toko</h3>
          <div className="field">
            <label>Nama Toko</label>
            <input value={config.storeName} onChange={(e) => setConfig({ ...config, storeName: e.target.value })} />
          </div>
          <div className="field">
            <label>Nomor WhatsApp (format: 62812xxxxxxx)</label>
            <input value={config.whatsapp} onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })} />
          </div>
          <div className="field">
            <label>Link Komunitas (Linktree)</label>
            <input value={config.linktreeUrl} onChange={(e) => setConfig({ ...config, linktreeUrl: e.target.value })} />
          </div>
          <div className="field">
            <label>Link TikTok</label>
            <input value={config.tiktokUrl} onChange={(e) => setConfig({ ...config, tiktokUrl: e.target.value })} placeholder="https://www.tiktok.com/@..." />
          </div>
          <div className="field">
            <label>Link Instagram</label>
            <input value={config.instagramUrl} onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })} placeholder="https://www.instagram.com/p/..." />
          </div>
          <h3 style={{ marginTop: 20 }}>Gambar</h3>
          <div className="field">
            <label>URL Gambar QRIS</label>
            <input value={config.qrisImage} onChange={(e) => setConfig({ ...config, qrisImage: e.target.value })} />
          </div>
          <div className="field">
            <label>URL Gambar Maskot</label>
            <input value={config.mascotImage} onChange={(e) => setConfig({ ...config, mascotImage: e.target.value })} />
          </div>
          <h3 style={{ marginTop: 20 }}>Teks Halaman Depan</h3>
          <div className="field">
            <label>Judul Hero (besar atas)</label>
            <input value={config.heroTitle || "Akun Game Terpercaya, Kirim Instant"} onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })} />
          </div>
          <div className="field">
            <label>Subtitle Hero (teks kecil atas)</label>
            <textarea value={config.heroSub || ""} onChange={(e) => setConfig({ ...config, heroSub: e.target.value })} style={{ minHeight: 60 }} />
          </div>
          <div className="field">
            <label>Pengumuman</label>
            <textarea value={config.announcement} onChange={(e) => setConfig({ ...config, announcement: e.target.value })} />
          </div>
          <h3 style={{ marginTop: 20 }}>Testimoni</h3>
          <div className="field">
            <label>Judul Testimoni</label>
            <input value={config.testimoniTitle || "Testimoni Pelanggan"} onChange={(e) => setConfig({ ...config, testimoniTitle: e.target.value })} />
          </div>
          <div className="field">
            <label>Teks Testimoni</label>
            <input value={config.testimoniText || "Lihat testimoni kami di sosial media:"} onChange={(e) => setConfig({ ...config, testimoniText: e.target.value })} />
          </div>
          <button className="btn primary" type="submit">Simpan Pengaturan</button>
        </form>
      )}

      {tab === "password" && (
        <form
          onSubmit={submitPasswordChange}
          style={{ background: "var(--bg-panel)", border: "1px solid var(--border)", borderRadius: 12, padding: 20, marginTop: 16, maxWidth: 380 }}
        >
          <div className="field">
            <label>Password Saat Ini</label>
            <input
              type="password"
              value={pwForm.current}
              onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label>Password Baru (min. 8 karakter)</label>
            <input
              type="password"
              value={pwForm.next}
              onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })}
              minLength={8}
              required
            />
          </div>
          <button className="btn primary" type="submit">Ubah Password</button>
        </form>
      )}
    </div>
  );
}
