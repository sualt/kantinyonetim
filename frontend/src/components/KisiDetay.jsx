export default function KisiDetay({ sales, onTogglePayment, onCancelSale }) {
  // Filter out cancelled sales by default, but you can show them with a flag
  const activeSales = sales.filter(s => !s.cancelled);
  const cancelledSales = sales.filter(s => s.cancelled);
  
  return (
    <div className="space-y-4">
      {sales.length ? (
        <div className="overflow-x-auto rounded-[28px] border border-slate-200 bg-white/90 shadow-soft">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm text-slate-700">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-900">Ürün</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Adet</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Ödeme</th>
                <th className="px-6 py-4 font-semibold text-slate-900">Durum</th>
                <th className="px-6 py-4 font-semibold text-slate-900"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {activeSales.map((sale) => (
                <tr key={sale.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">{sale.product}</td>
                  <td className="px-6 py-4">{sale.quantity}</td>
                  <td className="px-6 py-4">{sale.paid ? 'Ödendi' : 'Ödenmedi'}</td>
                  <td className="px-6 py-4">
                    <span className={sale.paid ? 'status-paid' : 'status-unpaid'}>
                      {sale.paid ? 'Ödeme tamamlandı' : 'Ödeme bekliyor'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex flex-col gap-2 sm:flex-row">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/70"
                      onClick={() => onTogglePayment(sale.id, !sale.paid)}
                    >
                      {sale.paid ? 'Ödemeyi iptal et' : 'Ödeme işaretle'}
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:border-red-400 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        if (window.confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) {
                          onCancelSale(sale.id);
                        }
                      }}
                      disabled={sale.cancelled}
                    >
                      Siparişi iptal et
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {cancelledSales.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-xs font-semibold text-slate-600 uppercase">İptal Edilen İşlemler ({cancelledSales.length})</p>
              <div className="space-y-2">
                {cancelledSales.map((sale) => (
                  <div key={sale.id} className="flex items-center justify-between rounded bg-white p-3 opacity-60">
                    <div>
                      <span className="text-sm text-slate-700">{sale.product}</span>
                      <span className="ml-2 text-xs text-slate-500">({sale.quantity}x)</span>
                    </div>
                    <span className="rounded bg-red-100 px-2 py-1 text-xs font-semibold text-red-700">İptal Edildi</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Bu kişi için henüz işlem kaydı yok.
        </div>
      )}
    </div>
  );
}
