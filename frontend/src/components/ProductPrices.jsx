import { useCallback, useMemo, useState } from 'react';

export default function ProductPrices({ products, onCreateProduct, onUpdateProduct, onDeleteProduct, onRefreshProducts }) {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editForm, setEditForm] = useState({ category: '', name: '', price: '', stock: '' });
  const [newProduct, setNewProduct] = useState({ category: '', name: '', price: '', stock: '' });
  const [mode, setMode] = useState('edit'); // 'edit' | 'add'
  const [feedback, setFeedback] = useState(null); // { msg, ok }

  const allProducts = useMemo(() => {
    if (!products || typeof products !== 'object') return [];
    if (Array.isArray(products)) return products;
    return Object.values(products).flat();
  }, [products]);

  const grouped = useMemo(() => {
    if (!products || typeof products !== 'object') return {};
    if (Array.isArray(products)) {
      return products.reduce((acc, p) => {
        const cat = p.category || 'Diğer';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(p);
        return acc;
      }, {});
    }
    return products;
  }, [products]);

  const categories = useMemo(() => Object.keys(grouped), [grouped]);

  const flash = (msg, ok = true) => {
    setFeedback({ msg, ok });
    setTimeout(() => setFeedback(null), 2800);
  };

  const handleSelectProduct = useCallback((product) => {
    setSelectedProduct(product);
    setEditForm({
      category: product.category ?? '',
      name: product.name ?? '',
      price: String(product.price ?? ''),
      stock: String(product.stock ?? ''),
    });
  }, []);

  const handleSaveProduct = useCallback(async () => {
    if (!selectedProduct) return;
    const category = editForm.category.trim();
    const name = editForm.name.trim();
    const price = parseFloat(editForm.price);
    const stock = Number(editForm.stock);

    if (!category || !name || Number.isNaN(price) || price < 0 || Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
      flash('Lütfen tüm alanları doğru doldurun.', false);
      return;
    }

    try {
      console.log('Updating product:', selectedProduct.id, { category, name, price, stock });
      await onUpdateProduct(selectedProduct.id, { category, name, price, stock });
      console.log('Product updated, refreshing...');
      if (onRefreshProducts) await onRefreshProducts();
      flash('Ürün güncellendi.');
      setSelectedProduct(null);
      setEditForm({ category: '', name: '', price: '', stock: '' });
    } catch (err) {
      console.error('Error updating product:', err);
      flash('Güncelleme başarısız: ' + (err?.error || err?.message || 'Bilinmeyen hata'), false);
    }
  }, [selectedProduct, editForm, onUpdateProduct, onRefreshProducts]);

  const handleDeleteProduct = useCallback(async () => {
    if (!selectedProduct || !onDeleteProduct) return;
    if (!window.confirm(`"${selectedProduct.name}" silinsin mi?`)) return;
    try {
      console.log('Deleting product:', selectedProduct.id);
      await onDeleteProduct(selectedProduct.id);
      console.log('Product deleted, refreshing...');
      if (onRefreshProducts) await onRefreshProducts();
      flash('Ürün silindi.');
      setSelectedProduct(null);
      setEditForm({ category: '', name: '', price: '', stock: '' });
    } catch (err) {
      console.error('Error deleting product:', err);
      flash('Silme başarısız: ' + (err?.error || err?.message || 'Bilinmeyen hata'), false);
    }
  }, [selectedProduct, onDeleteProduct, onRefreshProducts]);

  const handleCreateProduct = useCallback(async () => {
    const category = newProduct.category.trim();
    const name = newProduct.name.trim();
    const price = parseFloat(newProduct.price);

    const stock = Number(newProduct.stock);
    if (!category || !name || Number.isNaN(price) || price < 0 || Number.isNaN(stock) || !Number.isInteger(stock) || stock < 0) {
      flash('Lütfen tüm alanları doğru doldurun.', false);
      return;
    }

    try {
      console.log('Creating product:', { category, name, price, stock });
      await onCreateProduct(category, name, price, stock);
      console.log('Product created, refreshing...');
      if (onRefreshProducts) await onRefreshProducts();
      setNewProduct({ category: '', name: '', price: '', stock: '' });
      flash('Ürün eklendi.');
      setMode('edit');
    } catch (err) {
      console.error('Error creating product:', err);
      flash('Ekleme başarısız: ' + (err?.error || err?.message || 'Bilinmeyen hata'), false);
    }
  }, [newProduct, onCreateProduct, onRefreshProducts]);

  return (
    <div className="product-panel">
      {/* Başlık */}
      <div className="product-header">
        <div>
          <h2 className="product-title">Ürün Yönetimi</h2>
          <span className="product-count">{allProducts.length} ürün</span>
        </div>
        <div className="product-mode-tabs">
          <button
            type="button"
            className={`mode-tab ${mode === 'edit' ? 'active' : ''}`}
            onClick={() => { setMode('edit'); }}
          >
            Düzenle
          </button>
          <button
            type="button"
            className={`mode-tab ${mode === 'add' ? 'active' : ''}`}
            onClick={() => { setMode('add'); setSelectedProduct(null); }}
          >
            + Yeni Ürün
          </button>
          {onRefreshProducts && (
            <button
              type="button"
              className="mode-tab"
              onClick={onRefreshProducts}
            >
              Yenile
            </button>
          )}
        </div>
      </div>

      {/* Geri bildirim */}
      {feedback && (
        <div
          className="product-feedback"
          style={feedback.ok ? {} : { background: 'var(--clay-lt)', color: 'var(--clay)', borderColor: 'rgba(192,98,42,0.2)' }}
        >
          {feedback.msg}
        </div>
      )}

      <div className="product-body">
        {/* SOL: Ürün listesi */}
        <div className="product-list-col">
          {allProducts.length === 0 && (
            <p className="product-empty">Henüz ürün yok.</p>
          )}
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="product-category-group">
              <div className="product-category-label">{category}</div>
              {Array.isArray(items) && items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`product-list-item ${selectedProduct?.id === item.id ? 'selected' : ''}`}
                  onClick={() => { handleSelectProduct(item); setMode('edit'); }}
                >
                  <span className="product-item-name">{item.name}</span>
                  <span className="product-item-meta">{Number(item.price).toFixed(2)} ₺ · Stok: {item.stock}</span>
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* SAĞ: Tek düzenleme / ekleme kartı */}
        <div className="product-form-col">
          {mode === 'edit' && (
            <div className="product-form-card">
              {selectedProduct ? (
                <>
                  <div className="form-card-title">Ürünü Düzenle</div>

                  <div className="form-field">
                    <label className="form-label">Kategori</label>
                    <input
                      type="text"
                      value={editForm.category}
                      onChange={(e) => setEditForm((p) => ({ ...p, category: e.target.value }))}
                      className="form-input"
                      list="cat-list"
                    />
                    <datalist id="cat-list">
                      {categories.map((c) => <option key={c} value={c} />)}
                    </datalist>
                  </div>

                  <div className="form-field">
                    <label className="form-label">Ürün Adı</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Fiyat (₺)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={editForm.price}
                      onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-field">
                    <label className="form-label">Stok</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editForm.stock}
                      onChange={(e) => setEditForm((p) => ({ ...p, stock: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-save" onClick={handleSaveProduct}>
                      Kaydet
                    </button>
                    {onDeleteProduct && (
                      <button type="button" className="btn-delete" onClick={handleDeleteProduct}>
                        Sil
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn-cancel"
                      onClick={() => { setSelectedProduct(null); setEditForm({ category: '', name: '', price: '', stock: '' }); }}
                    >
                      İptal
                    </button>
                  </div>
                </>
              ) : (
                <div className="form-card-empty">
                  <div className="form-card-empty-icon">🎾</div>
                  <p>Düzenlemek için soldan<br />bir ürün seçin</p>
                </div>
              )}
            </div>
          )}

          {mode === 'add' && (
            <div className="product-form-card">
              <div className="form-card-title">Yeni Ürün Ekle</div>

              <div className="form-field">
                <label className="form-label">Kategori</label>
                <input
                  type="text"
                  placeholder="ör. İçecekler"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))}
                  className="form-input"
                  list="cat-list-new"
                />
                <datalist id="cat-list-new">
                  {categories.map((c) => <option key={c} value={c} />)}
                </datalist>
              </div>

              <div className="form-field">
                <label className="form-label">Ürün Adı</label>
                <input
                  type="text"
                  placeholder="ör. Çay"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Fiyat (₺)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct((p) => ({ ...p, price: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Stok</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-save" onClick={handleCreateProduct}>
                  Ekle
                </button>
                <button type="button" className="btn-cancel" onClick={() => setMode('edit')}>
                  İptal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}