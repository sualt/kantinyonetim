import { useEffect, useMemo, useState } from 'react';

export default function UrunForm({ persons, selectedPerson, onAddSale, products }) {
  const [personId, setPersonId] = useState(selectedPerson?.id || '');
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paid, setPaid] = useState(false);

  useEffect(() => {
    if (selectedPerson) {
      setPersonId(selectedPerson.id);
    }
  }, [selectedPerson]);

  const allProducts = useMemo(() => Object.values(products).flat(), [products]);

  const selectedProduct = allProducts.find((item) => item.id === Number(productId));

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!personId || !selectedProduct || quantity < 1) return;
    onAddSale({ personId, product: selectedProduct.name, quantity: Number(quantity), paid });
    setProductId('');
    setQuantity(1);
    setPaid(false);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Yeni Alışveriş</h2>
        <p className="mt-1 text-sm text-slate-500">Kişinin harcamasını kaydedin, bakiye varsa otomatik düşsün.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <select
          value={personId}
          onChange={(e) => setPersonId(Number(e.target.value))}
          className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Alışveriş yapan kişi</option>
          {persons.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name} - Bakiye: {(person.balance ?? 0).toFixed(2)} TL
            </option>
          ))}
        </select>

        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Ürün seçin</option>
          {Object.entries(products).map(([category, items]) => (
            <optgroup key={category} label={category}>
              {Array.isArray(items) ? items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {(item.price || 0).toFixed(2)} TL
                </option>
              )) : null}
            </optgroup>
          ))}
        </select>

        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div className="grid gap-3">
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              placeholder="Adet"
              className="rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
            <label className="flex items-center gap-3 rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900">
              <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm font-medium text-slate-700">Ödeme yapıldı</span>
            </label>
          </div>
          <button type="submit" className="rounded-3xl bg-indigo-600 px-5 py-4 text-sm font-semibold text-white transition hover:bg-indigo-700">
            Kaydet
          </button>
        </div>

        {selectedProduct ? (
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
            Seçili ürün: <strong>{selectedProduct.name}</strong> — Fiyat: <strong>{selectedProduct.price.toFixed(2)} TL</strong> · Toplam: <strong>{(selectedProduct.price * quantity).toFixed(2)} TL</strong>
          </div>
        ) : null}
      </form>
    </div>
  );
}
