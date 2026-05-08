import KisiListesi from '../components/KisiListesi.jsx';
import KisiDetay from '../components/KisiDetay.jsx';
import UrunForm from '../components/UrunForm.jsx';
import ProductPrices from '../components/ProductPrices.jsx';

export default function Ana({ persons, selectedPerson, sales, products, onSelectPerson, onAddPerson, onAddSale, onTogglePayment, onUpdateBalance, onCreateProduct, onUpdateProduct, onDeleteProduct }) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <div className="rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur-xl">
          <KisiListesi
            persons={persons}
            selectedId={selectedPerson?.id}
            onSelect={onSelectPerson}
            onAddPerson={onAddPerson}
            onUpdateBalance={onUpdateBalance}
          />
        </div>
        <div className="space-y-6">
          <div className="rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur-xl">
            <UrunForm
              persons={persons}
              selectedPerson={selectedPerson}
              onAddSale={onAddSale}
              products={products}
            />
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur-xl">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">{selectedPerson ? `${selectedPerson.name} için işlemler` : 'Kişi seçin'}</h2>
            <KisiDetay sales={sales} onTogglePayment={onTogglePayment} />
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white/85 p-6 shadow-soft backdrop-blur-xl">
        <ProductPrices
          products={products}
          onCreateProduct={onCreateProduct}
          onUpdateProduct={onUpdateProduct}
          onDeleteProduct={onDeleteProduct}
        />
      </div>
    </div>
  );
}
