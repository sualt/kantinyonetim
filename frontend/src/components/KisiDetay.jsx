export default function KisiDetay({ sales, onTogglePayment }) {
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
                <th className="px-6 py-4 font-semibold text-slate-900"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {sales.map((sale) => (
                <tr key={sale.id} className="transition hover:bg-slate-50">
                  <td className="px-6 py-4">{sale.product}</td>
                  <td className="px-6 py-4">{sale.quantity}</td>
                  <td className="px-6 py-4">
                    <span className={sale.paid ? 'status-paid' : 'status-unpaid'}>
                      {sale.paid ? 'Ödendi' : 'Ödenmedi'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      type="button"
                      className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50/70"
                      onClick={() => onTogglePayment(sale.id, !sale.paid)}
                    >
                      {sale.paid ? 'Ödemeyi iptal et' : 'Ödeme işaretle'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
          Bu kişi için henüz işlem kaydı yok.
        </div>
      )}
    </div>
  );
}
