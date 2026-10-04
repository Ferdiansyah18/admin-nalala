'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/context/ToastContext';
import {
  Package,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Laptop,
  Box,
  Layers,
  X,
  Sparkles,
  Image as ImageIcon,
  DollarSign,
  Maximize2,
  Palette,
  Check,
} from 'lucide-react';

interface VariantFormItem {
  id: string;
  colorName: string;
  colorHex: string;
  sku: string;
  stock: number;
}

export default function ProductsAdminPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [categoryId, setCategoryId] = useState<string>('8');
  const [description, setDescription] = useState<string>('');
  const [fullDescription, setFullDescription] = useState<string>('');
  const [material, setMaterial] = useState<string>('Premium Synthetic Leather & Canvas');
  const [weightGrams, setWeightGrams] = useState<number>(450);
  const [basePriceCustomer, setBasePriceCustomer] = useState<number>(149000);
  const [discountPriceCustomer, setDiscountPriceCustomer] = useState<string>('');
  const [basePriceReseller, setBasePriceReseller] = useState<number>(79000);
  const [lengthCm, setLengthCm] = useState<number>(30);
  const [widthCm, setWidthCm] = useState<number>(12);
  const [heightCm, setHeightCm] = useState<number>(24);
  const [volumeLiters, setVolumeLiters] = useState<number>(8.6);
  const [maxLaptopSize, setMaxLaptopSize] = useState<string>('14');
  const [imageUrl, setImageUrl] = useState<string>(
    'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80'
  );

  // Dynamic Variants
  const [variants, setVariants] = useState<VariantFormItem[]>([
    { id: '1', colorName: 'Hitam Klasik', colorHex: '#18181b', sku: 'NL-BAG-BLK', stock: 35 },
    { id: '2', colorName: 'Coklat Karamel', colorHex: '#854d0e', sku: 'NL-BAG-BRN', stock: 25 },
  ]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any[]>('/products?limit=50');
      if (res.data) {
        setProducts(res.data);
      }
    } catch (err: any) {
      showToast(err?.message || 'Gagal memuat katalog produk.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get<any[]>('/categories');
      if (res.data && res.data.length > 0) {
        setCategories(res.data);
        setCategoryId(res.data[0].id.toString());
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    setSlug(generatedSlug);
  };

  // Auto-calculate volume from dimensions
  const handleDimensionChange = (l: number, w: number, h: number) => {
    setLengthCm(l);
    setWidthCm(w);
    setHeightCm(h);
    const vol = parseFloat(((l * w * h) / 1000).toFixed(1));
    setVolumeLiters(vol);
  };

  const handleAddVariant = () => {
    const newId = (variants.length + 1).toString();
    setVariants([
      ...variants,
      {
        id: newId,
        colorName: 'Varian Baru',
        colorHex: '#3f3f46',
        sku: `NL-SKU-${Date.now().toString().slice(-4)}`,
        stock: 20,
      },
    ]);
  };

  const handleRemoveVariant = (id: string) => {
    if (variants.length <= 1) {
      showToast('Produk minimal memiliki 1 varian warna.', 'warning');
      return;
    }
    setVariants(variants.filter((v) => v.id !== id));
  };

  const handleVariantChange = (id: string, field: keyof VariantFormItem, val: any) => {
    setVariants(
      variants.map((v) => (v.id === id ? { ...v, [field]: val } : v))
    );
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setDescription('');
    setFullDescription('');
    setDiscountPriceCustomer('');
    setVariants([
      { id: '1', colorName: 'Hitam Klasik', colorHex: '#18181b', sku: 'NL-BAG-BLK', stock: 35 },
    ]);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      showToast('Nama produk dan slug wajib diisi.', 'warning');
      return;
    }
    if (!description.trim()) {
      showToast('Deskripsi produk wajib diisi.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        categoryId: Number(categoryId),
        name: name.trim(),
        slug: slug.trim(),
        description: description.trim(),
        fullDescription: fullDescription.trim() || null,
        material: material.trim() || null,
        weightGrams: Number(weightGrams) || 500,
        basePriceCustomer: Number(basePriceCustomer),
        discountPriceCustomer: discountPriceCustomer ? Number(discountPriceCustomer) : null,
        basePriceReseller: Number(basePriceReseller),
        lengthCm: Number(lengthCm),
        widthCm: Number(widthCm),
        heightCm: Number(heightCm),
        volumeLiters: Number(volumeLiters),
        maxLaptopSize: maxLaptopSize ? Number(maxLaptopSize) : null,
        resellerPackageType: 'all',
        variants: variants.map((v) => ({
          colorName: v.colorName.trim(),
          colorHexes: [v.colorHex],
          sku: v.sku.trim(),
          stock: Number(v.stock) || 0,
        })),
        images: [
          {
            imageUrl:
              imageUrl.trim() ||
              'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80',
            isPrimary: true,
          },
        ],
      };

      await api.post('/products', payload);
      showToast(`Produk "${payload.name}" berhasil ditambahkan ke etalase!`, 'success');
      setIsCreateModalOpen(false);
      resetForm();
      fetchProducts();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menambahkan produk.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, prodName: string) => {
    if (!confirm(`Hapus produk "${prodName}" beserta seluruh varian dan fotonya?`)) return;
    try {
      await api.delete(`/products/${id}`);
      showToast(`Produk "${prodName}" berhasil dihapus.`, 'success');
      fetchProducts();
    } catch (err: any) {
      showToast(err?.message || 'Gagal menghapus produk.', 'error');
    }
  };

  const filtered = products.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-5 select-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200 dark:border-zinc-800/60">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-zinc-100 flex items-center gap-2">
            Katalog Produk & Tas
          </h1>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">
            Daftar master produk tas, spesifikasi kompartemen muatan, dan penetapan harga bertingkat.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama tas..."
              className="w-full pl-10 pr-3.5 py-1.5 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800/80 rounded-lg text-xs text-gray-900 dark:text-zinc-200 placeholder:text-gray-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 transition-all shadow-xs"
            />
          </div>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3.5 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 bg-white dark:bg-zinc-900/40 rounded-xl border border-gray-200 dark:border-zinc-800/80 flex flex-col items-center justify-center gap-2.5 text-gray-500 dark:text-zinc-500 shadow-xs">
          <div className="w-6 h-6 border-2 border-gray-300 dark:border-zinc-700 border-t-brand-500 dark:border-t-amber-400 rounded-full animate-spin" />
          <p className="text-xs">Memuat katalog produk dari database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white dark:bg-zinc-900/30 rounded-xl border border-gray-200 dark:border-zinc-800/70 p-8 space-y-3 shadow-xs">
          <Package className="w-10 h-10 text-gray-400 dark:text-zinc-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 dark:text-zinc-200 text-sm">Belum Ada Produk Ditemukan</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-500 max-w-sm mx-auto">
            Mulai isi etalase toko Anda dengan menekan tombol Tambah Produk di atas.
          </p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Produk Pertama</span>
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/80 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800/80 text-[11px] uppercase tracking-wider font-semibold bg-gray-50/80 dark:bg-zinc-950/40">
                  <th className="py-3 px-4">Produk</th>
                  <th className="py-3 px-4">Kategori</th>
                  <th className="py-3 px-4">Harga Retail / Diskon</th>
                  <th className="py-3 px-4">Harga Reseller</th>
                  <th className="py-3 px-4">Kapasitas Muatan</th>
                  <th className="py-3 px-4">Varian & Stok</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 dark:divide-zinc-800/50 font-normal">
                {filtered.map((prod) => {
                  const primaryImg =
                    prod.images?.find((img: any) => img.isPrimary)?.imageUrl ||
                    prod.images?.[0]?.imageUrl;
                  const totalStock = (prod.variants || []).reduce(
                    (sum: number, v: any) => sum + (v.stock || 0),
                    0
                  );

                  return (
                    <tr key={prod.id} className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/30 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 dark:bg-zinc-950 dark:border-zinc-800 shrink-0">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-zinc-600">
                                <Box className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-zinc-100 block">{prod.name}</span>
                            <span className="text-[10px] text-gray-400 dark:text-zinc-500 font-mono block">
                              {prod.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-gray-700 dark:text-zinc-300">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 border border-gray-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700/60 text-[11px] font-medium">
                          {prod.category?.name || '-'}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 dark:text-zinc-100 block">
                          Rp{Number(prod.pricing?.customer?.basePrice || 0).toLocaleString('id-ID')}
                        </span>
                        {prod.pricing?.customer?.discountPrice && (
                          <span className="text-[10px] text-rose-500 dark:text-rose-400 font-medium block">
                            Diskon: Rp{Number(prod.pricing.customer.discountPrice).toLocaleString('id-ID')}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-amber-600 dark:text-amber-400">
                          Rp{Number(prod.pricing?.reseller?.wholesalePrice || 0).toLocaleString('id-ID')}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-gray-600 dark:text-zinc-400">
                        <div className="space-y-0.5 text-[11px]">
                          <span>Volume: {prod.bagCapacitySpecs?.volumeLiters || 0} L</span>
                          {prod.bagCapacitySpecs?.maxLaptopSize && (
                            <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 text-[10px]">
                              <Laptop className="w-3 h-3" /> Laptop {prod.bagCapacitySpecs.maxLaptopSize}&quot;
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-gray-900 dark:text-zinc-200 block font-semibold">
                          {totalStock} pcs
                        </span>
                        <div className="flex items-center gap-1 mt-1">
                          {(prod.variants || []).slice(0, 3).map((v: any) => (
                            <span
                              key={v.id}
                              title={`${v.colorName} (${v.stock} pcs)`}
                              className="w-3.5 h-3.5 rounded-full border border-gray-300 dark:border-zinc-700 block shrink-0"
                              style={{
                                backgroundColor: Array.isArray(v.colorHexes)
                                  ? v.colorHexes[0]
                                  : v.colorHexes || '#666',
                              }}
                            />
                          ))}
                          {(prod.variants || []).length > 3 && (
                            <span className="text-[9px] text-gray-400 dark:text-zinc-500">
                              +{(prod.variants || []).length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(prod.id, prod.name)}
                          title="Hapus Produk"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-gray-100 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Tambah Produk Baru */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-6 max-h-[92vh] overflow-y-auto">
            {/* Header Modal */}
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200 dark:border-zinc-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500 dark:text-amber-400 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-zinc-100">Tambah Produk Tas Baru</h3>
                  <p className="text-[11px] text-gray-500 dark:text-zinc-400">
                    Masukkan rincian identitas, harga bertingkat, kapasitas, dan varian warna
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-6 text-xs">
              {/* Section 1: Identitas Produk */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  <span>1. Identitas & Kategori</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Nama Produk Tas:</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Contoh: Nalala Voyage Canvas Duffel"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Slug URL:</label>
                    <input
                      type="text"
                      required
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="nalala-voyage-canvas-duffel"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Kategori:</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Material / Bahan:</label>
                    <input
                      type="text"
                      value={material}
                      onChange={(e) => setMaterial(e.target.value)}
                      placeholder="Canvas Organic 16oz"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Berat Paket (Gram):</label>
                    <input
                      type="number"
                      required
                      value={weightGrams}
                      onChange={(e) => setWeightGrams(Number(e.target.value))}
                      placeholder="450"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Deskripsi Singkat:</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Penjelasan ringkas tas untuk kartu katalog dan ringkasan checkout..."
                    className="w-full p-2.5 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              {/* Section 2: Penetapan Harga */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-zinc-800/70">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span>2. Penetapan Harga Bertingkat (Pricing)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Harga Retail Customer (Rp):</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={basePriceCustomer}
                      onChange={(e) => setBasePriceCustomer(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Harga Diskon Coret (Rp, Opsional):</label>
                    <input
                      type="number"
                      value={discountPriceCustomer}
                      onChange={(e) => setDiscountPriceCustomer(e.target.value)}
                      placeholder="Kosongkan jika normal"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-zinc-300 font-medium mb-1">Harga Grosir Reseller (Rp):</label>
                    <input
                      type="number"
                      required
                      min={1000}
                      value={basePriceReseller}
                      onChange={(e) => setBasePriceReseller(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-amber-600 dark:text-amber-400 font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Dimensi & Kapasitas */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-zinc-800/70">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Maximize2 className="w-3.5 h-3.5 text-sky-500 dark:text-sky-400" />
                  <span>3. Dimensi Ruang & Kapasitas Tas</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-gray-500 dark:text-zinc-400 text-[11px] mb-1">Panjang (cm):</label>
                    <input
                      type="number"
                      required
                      value={lengthCm}
                      onChange={(e) =>
                        handleDimensionChange(Number(e.target.value), widthCm, heightCm)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-zinc-400 text-[11px] mb-1">Lebar (cm):</label>
                    <input
                      type="number"
                      required
                      value={widthCm}
                      onChange={(e) =>
                        handleDimensionChange(lengthCm, Number(e.target.value), heightCm)
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-zinc-400 text-[11px] mb-1">Tinggi (cm):</label>
                    <input
                      type="number"
                      required
                      value={heightCm}
                      onChange={(e) =>
                        handleDimensionChange(lengthCm, widthCm, Number(e.target.value))
                      }
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-zinc-400 text-[11px] mb-1">Volume (Liter):</label>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={volumeLiters}
                      onChange={(e) => setVolumeLiters(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-zinc-400 text-[11px] mb-1">Max Laptop (Inci):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={maxLaptopSize}
                      onChange={(e) => setMaxLaptopSize(e.target.value)}
                      placeholder="14"
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Foto Produk Utama */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-zinc-800/70">
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span>4. Foto Thumbnail Produk Utama</span>
                </h4>

                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 overflow-hidden shrink-0">
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e: any) => {
                        e.target.src =
                          'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-white dark:bg-zinc-950/80 border border-gray-200 dark:border-zinc-800 rounded-lg text-gray-900 dark:text-zinc-100 focus:outline-none focus:border-brand-500"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Varian Warna & Stok */}
              <div className="space-y-3 pt-3 border-t border-gray-200 dark:border-zinc-800/70">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                    <span>5. Varian Warna & Alokasi Stok</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="text-[11px] font-medium text-brand-600 hover:text-brand-700 dark:text-amber-400 dark:hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Tambah Varian Warna</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {variants.map((variant) => (
                    <div
                      key={variant.id}
                      className="p-3 rounded-lg bg-gray-50 dark:bg-zinc-950/70 border border-gray-200 dark:border-zinc-800/80 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-4">
                        <label className="block text-[10px] text-gray-500 dark:text-zinc-500 mb-0.5">Nama Warna:</label>
                        <input
                          type="text"
                          required
                          value={variant.colorName}
                          onChange={(e) =>
                            handleVariantChange(variant.id, 'colorName', e.target.value)
                          }
                          placeholder="Contoh: Midnight Black"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md text-xs text-gray-900 dark:text-zinc-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-500 dark:text-zinc-500 mb-0.5">Kode Hex:</label>
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={variant.colorHex}
                            onChange={(e) =>
                              handleVariantChange(variant.id, 'colorHex', e.target.value)
                            }
                            className="w-7 h-7 rounded border border-gray-300 dark:border-zinc-700 bg-transparent cursor-pointer shrink-0"
                          />
                          <input
                            type="text"
                            value={variant.colorHex}
                            onChange={(e) =>
                              handleVariantChange(variant.id, 'colorHex', e.target.value)
                            }
                            className="w-full px-1.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md text-[11px] font-mono text-gray-900 dark:text-zinc-200"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[10px] text-gray-500 dark:text-zinc-500 mb-0.5">SKU Barang:</label>
                        <input
                          type="text"
                          required
                          value={variant.sku}
                          onChange={(e) =>
                            handleVariantChange(variant.id, 'sku', e.target.value.toUpperCase())
                          }
                          placeholder="NL-VOY-BLK"
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md text-xs font-mono uppercase text-gray-900 dark:text-zinc-100"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-gray-500 dark:text-zinc-500 mb-0.5">Stok Awal:</label>
                        <input
                          type="number"
                          required
                          min={0}
                          value={variant.stock}
                          onChange={(e) =>
                            handleVariantChange(variant.id, 'stock', Number(e.target.value))
                          }
                          className="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-md text-xs text-gray-900 dark:text-zinc-100 font-semibold"
                        />
                      </div>

                      <div className="sm:col-span-1 flex items-center justify-end pt-3 sm:pt-0">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(variant.id)}
                          className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-gray-200 dark:text-zinc-500 dark:hover:text-rose-400 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-200 dark:border-zinc-800">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-300 font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-lg bg-[#465FFF] hover:bg-[#3641F5] text-white font-semibold shadow-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <span>Menyimpan ke Database...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Terbitkan Produk ke Etalase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
