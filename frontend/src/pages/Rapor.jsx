import { useAuth } from '../context/AuthContext.jsx';
import { exportReport } from '../api.js';

export default function Rapor({ report, date, type, onDateChange, onTypeChange, onFetchReport }) {
  const { token } = useAuth();
  return (
    <div className="space-y-6 rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-soft">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">{type === 'monthly' ? 'Aylık Rapor' : 'Günlük Rapor'}</h2>
          <p className="mt-1 text-sm text-slate-500">Rapor türünü seçip kayıtlara hızlıca ulaşabilirsiniz.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-[220px_180px_auto] w-full">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Rapor türü</label>
            <select
              value={type}
              onChange={(e) => onTypeChange(e.target.value)}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="daily">Günlük</option>
              <option value="monthly">Aylık</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">{type === 'monthly' ? 'Rapor ayı' : 'Rapor tarihi'}</label>
            <input
              type={type === 'monthly' ? 'month' : 'date'}
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-3xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <button
            type="button"
            onClick={onFetchReport}
            className="rounded-3xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Raporu Görüntüle
          </button>
          <button
            type="button"
            onClick={async () => {
              try {
                const blob = await exportReport(date, type, token);
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `rapor-${type}-${(type === 'monthly' ? date.slice(0,7) : date)}.csv`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);
              } catch (err) {
                alert(err?.error || 'Rapor dışa aktarılamadı');
              }
            }}
            className="rounded-3xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Excel'e Aktar
          </button>
        </div>
      </div>

      {!report ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">Rapor için tarih seçip düğmeye basın.</div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-[28px] bg-slate-950 px-6 py-6 text-white shadow-soft">
            <h3 className="text-xl font-semibold">{report.date} için genel özet</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-3xl bg-slate-800/95 px-4 py-5">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Toplam işlem</div>
                <div className="mt-3 text-3xl font-semibold">{report.totals.totalSales}</div>
              </div>
              <div className="rounded-3xl bg-slate-800/95 px-4 py-5">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Toplam ürün adedi</div>
                <div className="mt-3 text-3xl font-semibold">{report.totals.totalQuantity}</div>
              </div>
              <div className="rounded-3xl bg-slate-800/95 px-4 py-5">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Ödendi</div>
                <div className="mt-3 text-3xl font-semibold">{report.totals.paidCount}</div>
              </div>
              <div className="rounded-3xl bg-slate-800/95 px-4 py-5">
                <div className="text-sm uppercase tracking-[0.2em] text-slate-400">Ödenmedi</div>
                <div className="mt-3 text-3xl font-semibold">{report.totals.unpaidCount}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Kişi bazlı toplamlar</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Kişi</th>
                      <th className="px-4 py-3 text-left font-semibold">Toplam miktar</th>
                      <th className="px-4 py-3 text-left font-semibold">Ödendi</th>
                      <th className="px-4 py-3 text-left font-semibold">Ödenmedi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {report.byPerson.length ? (
                      report.byPerson.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">{item.name}</td>
                          <td className="px-4 py-3">{item.totalQuantity}</td>
                          <td className="px-4 py-3">{item.paidCount}</td>
                          <td className="px-4 py-3">{item.unpaidCount}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-5 text-center text-slate-500">Bu dönemde satış kaydı yok.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Satış detayları</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-700">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold">Kişi</th>
                      <th className="px-4 py-3 text-left font-semibold">Ürün</th>
                      <th className="px-4 py-3 text-left font-semibold">Adet</th>
                      <th className="px-4 py-3 text-left font-semibold">Ödeme</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {report.rows.length ? (
                      report.rows.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3">{item.person_name}</td>
                          <td className="px-4 py-3">{item.product}</td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3">
                            <span className={item.paid ? 'status-paid' : 'status-unpaid'}>
                              {item.paid ? 'Ödendi' : 'Ödenmedi'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-5 text-center text-slate-500">Kayıt yok.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
