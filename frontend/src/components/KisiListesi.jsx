import { useState } from 'react';

export default function KisiListesi({ persons, selectedId, onSelect, onAddPerson, onUpdateBalance, onDeletePerson }) {
  const [name, setName] = useState('');
  const [balanceAmount, setBalanceAmount] = useState('');
  const [selectedPersonForBalance, setSelectedPersonForBalance] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'balance', 'date'

  const handleAdd = (event) => {
    event.preventDefault();
    if (!name.trim()) return;
    onAddPerson(name.trim());
    setName('');
  };

  const handleBalanceUpdate = (event) => {
    event.preventDefault();
    if (!balanceAmount || !selectedPersonForBalance) return;
    onUpdateBalance(Number(selectedPersonForBalance), Number(balanceAmount));
    setBalanceAmount('');
    setSelectedPersonForBalance('');
  };

  // Filter and sort persons
  const filteredPersons = persons
    .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'balance':
          return (b.balance ?? 0) - (a.balance ?? 0);
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'name':
        default:
          return a.name.localeCompare(b.name, 'tr-TR');
      }
    });

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50/80 p-5 shadow-soft">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-slate-900">Kişiler</h2>
          <p className="mt-1 text-sm text-slate-500">Kişi ekleyin, bakiye girin ve kişi seçerek işlem yapın.</p>
          <div className="mt-3 rounded-3xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            Kişinin bakiyesi yeterliyse, ödeme yapıldı seçeneğini işaretlemeye gerek kalmadan işlem otomatik olarak ödenmiş sayılır.
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            value={name}
            placeholder="Yeni kişi adı"
            onChange={(e) => setName(e.target.value)}
            className="rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button type="submit" className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700">
            Kişi Ekle
          </button>
        </form>

        <form onSubmit={handleBalanceUpdate} className="grid gap-3 sm:grid-cols-3 mt-4">
          <select
            value={selectedPersonForBalance}
            onChange={(e) => setSelectedPersonForBalance(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">Kişi seçin</option>
            {persons.map((person) => (
              <option key={person.id} value={person.id}>{person.name}</option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            placeholder="Miktar (TL)"
            value={balanceAmount}
            onChange={(e) => setBalanceAmount(e.target.value)}
            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button type="submit" className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Bakiyeyi Güncelle
          </button>
        </form>
      </div>

      <div className="grid gap-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-2">
          <div className="text-sm text-slate-600 font-medium">
            {searchTerm ? `${filteredPersons.length}` : `Toplam ${persons.length}`} kişi
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1 text-sm outline-none transition focus:border-indigo-500"
            >
              <option value="name">İsme göre</option>
              <option value="balance">Bakiyeye göre</option>
              <option value="date">Tarihe göre</option>
            </select>
            <button 
              type="button" 
              className="rounded-xl border border-slate-300 px-3 py-1 text-sm transition hover:bg-slate-50" 
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? 'Göster' : 'Gizle'}
            </button>
          </div>
        </div>

        {!collapsed ? (
          <>
            {persons.length > 0 && (
              <input
                type="text"
                placeholder="Kişi ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            )}
            {filteredPersons.length ? (
              <div style={{ maxHeight: '50vh', overflowY: 'auto', display: 'grid', gap: '0.5rem' }}>
                {filteredPersons.map((person) => (
                  <div
                    key={person.id}
                    className={`person-card ${selectedId === person.id ? 'selected' : ''}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelect(person)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        onSelect(person);
                      }
                    }}
                  >
                    <div>
                      <div className="person-name">{person.name}</div>
                      <div className="person-meta">Oluşturma: {new Date(person.created_at).toLocaleDateString('tr-TR')}</div>
                      <div className="person-note">Bakiye durumu: {(person.balance ?? 0).toFixed(2)} TL</div>
                    </div>
                    <div className="person-right">
                      <div className="person-balance">{(person.balance ?? 0).toFixed(2)} TL</div>
                      {person.balance > 0 && <span className="chip chip-success">Bakiye var</span>}
                      {person.balance <= 0 && <span className="chip chip-muted">Bakiye yok</span>}
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (window.confirm(`${person.name} silinsin mi?`)) {
                            onDeletePerson(person.id);
                          }
                        }}
                      >
                        Sil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kayıtlı kişi yok.'}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
