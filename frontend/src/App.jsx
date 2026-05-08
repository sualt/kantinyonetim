import { useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import Login from './pages/Login.jsx';
import Ana from './pages/Ana.jsx';
import Rapor from './pages/Rapor.jsx';
import './style.css';
import {
  createPerson, createProduct, createSale, deleteProduct,
  fetchPersons, fetchProducts, fetchReport, fetchSales,
  login, updateBalance, updatePayment, updateProduct,
} from './api.js';

function AppContent() {
  const { token, setToken, username, setUsername } = useAuth();
  const [page, setPage] = useState('ana');
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState({});
  const [report, setReport] = useState(null);
  const [reportDate, setReportDate] = useState(new Date().toISOString().slice(0, 10));
  const [reportType, setReportType] = useState('daily');
  const [error, setError] = useState('');

  const hasToken = Boolean(token);

  const refreshPersons = async () => {
    try {
      const data = await fetchPersons(token);
      const normalized = data.map((p) => ({
        ...p,
        balance: typeof p.balance === 'number' ? p.balance : 0,
      }));
      setPersons(normalized);
      if (normalized.length && !selectedPerson) setSelectedPerson(normalized[0]);
    } catch (err) {
      setError(err.error || 'Kişiler yüklenemedi');
    }
  };

  const refreshProducts = async () => {
    try {
      const data = await fetchProducts(token);
      // Backend array veya object döndürebilir — normalize et
      if (Array.isArray(data)) {
        const grouped = data.reduce((acc, p) => {
          const cat = p.category || 'Diğer';
          if (!acc[cat]) acc[cat] = [];
          acc[cat].push(p);
          return acc;
        }, {});
        setProducts(grouped);
      } else {
        setProducts(data || {});
      }
    } catch (err) {
      setError(err.error || 'Ürünler yüklenemedi');
    }
  };

  const refreshSales = async (personId) => {
    if (!personId) { setSales([]); return; }
    try {
      const data = await fetchSales(token, { personId });
      setSales(data);
    } catch (err) {
      setError(err.error || 'Satışlar yüklenemedi');
    }
  };

  useEffect(() => {
    if (hasToken) { refreshPersons(); refreshProducts(); }
  }, [hasToken]);

  useEffect(() => {
    if (selectedPerson) refreshSales(selectedPerson.id);
  }, [selectedPerson, hasToken]);

  const handleLogin = async (form) => {
    setError('');
    try {
      const data = await login(form.username, form.password);
      setToken(data.token);
      setUsername(data.username);
      setPage('ana');
    } catch (err) {
      setError(err.error || 'Giriş yapılamadı');
    }
  };

  const handleLogout = () => {
    setToken(''); setUsername('');
    setPersons([]); setSelectedPerson(null);
    setSales([]); setReport(null);
  };

  const handleAddPerson = async (name) => {
    setError('');
    try {
      const person = await createPerson(name, token);
      setPersons((prev) => [...prev, person]);
      setSelectedPerson(person);
    } catch (err) { setError(err.error || 'Kişi eklenemedi'); }
  };

  const handleUpdateBalance = async (personId, amount) => {
    setError('');
    try {
      const updated = await updateBalance(personId, amount, token);
      setPersons((prev) => prev.map((p) => (p.id === personId ? updated : p)));
      if (selectedPerson?.id === personId) setSelectedPerson(updated);
    } catch (err) { setError(err.error || 'Bakiye güncellenemedi'); }
  };

  const handleAddSale = async (saleData) => {
    setError('');
    try {
      await createSale(saleData, token);
      await refreshSales(saleData.personId);
      await refreshPersons();
      await refreshProducts();
    } catch (err) { setError(err.error || 'Ürün kaydedilemedi'); }
  };

  const handleCreateProduct = async (category, name, price) => {
    setError('');
    try {
      await createProduct(category, name, price, token);
      await refreshProducts();
    } catch (err) { setError(err.error || 'Ürün oluşturulamadı'); }
  };

  const handleUpdateProduct = async (productId, fields) => {
    setError('');
    try {
      await updateProduct(productId, fields, token);
      await refreshProducts();
    } catch (err) { setError(err.error || 'Ürün güncellenemedi'); }
  };

  const handleDeleteProduct = async (productId) => {
    setError('');
    try {
      await deleteProduct(productId, token);
      await refreshProducts();
    } catch (err) { setError(err.error || 'Ürün silinemedi'); }
  };

  const handleTogglePayment = async (saleId, paid) => {
    setError('');
    try {
      await updatePayment(saleId, paid, token);
      if (selectedPerson) await refreshSales(selectedPerson.id);
    } catch (err) { setError(err.error || 'Ödeme durumu güncellenemedi'); }
  };

  const handleFetchReport = async () => {
    setError('');
    try {
      const data = await fetchReport(reportDate, reportType, token);
      setReport(data);
    } catch (err) { setError(err.error || 'Rapor yüklenemedi'); }
  };

  if (!hasToken) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--court)' }}>
        <div className="card" style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🎾</div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.5rem', margin: 0, color: 'var(--court)' }}>
              Kantin Takip
            </h1>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted)', margin: '0.25rem 0 0' }}>
              Tenis Kulübü
            </p>
          </div>
          <Login onLogin={handleLogin} error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Top bar */}
        <div className="topbar">
          <div className="topbar-brand">
            <h1>🎾 Kantin Takip</h1>
            <p>Tenis Kulübü · {username && <span style={{ color: 'rgba(255,255,255,0.8)' }}>{username}</span>}</p>
          </div>
          <nav className="topbar-nav">
            <button className={`nav-btn ${page === 'ana' ? 'active' : ''}`} onClick={() => setPage('ana')}>
              Ana Sayfa
            </button>
            <button className={`nav-btn ${page === 'rapor' ? 'active' : ''}`} onClick={() => setPage('rapor')}>
              Rapor
            </button>
            <button className="nav-btn danger" onClick={handleLogout}>
              Çıkış
            </button>
          </nav>
        </div>

        {/* Hata */}
        {error && <div className="error-bar">{error}</div>}

        {/* Sayfa içeriği */}
        {page === 'ana' ? (
          <Ana
            persons={persons}
            selectedPerson={selectedPerson}
            sales={sales}
            products={products}
            onSelectPerson={setSelectedPerson}
            onAddPerson={handleAddPerson}
            onAddSale={handleAddSale}
            onTogglePayment={handleTogglePayment}
            onUpdateBalance={handleUpdateBalance}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        ) : (
          <Rapor
            report={report}
            date={reportDate}
            type={reportType}
            onDateChange={setReportDate}
            onTypeChange={setReportType}
            onFetchReport={handleFetchReport}
          />
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}