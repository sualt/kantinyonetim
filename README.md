# Kantin

Bu proje, Node.js / Express backend ve Vite / React frontend içeren tam bir kantin takip uygulamasıdır.

## Hazırlık

1. `backend` ve `frontend` dizinlerinde bağımlılıkları yükleyin:

   ```powershell
   cd backend
   npm install
   cd ../frontend
   npm install
   ```

2. Gerekli ortam değişkenlerini ayarlayın.
   - `backend/.env.example` dosyasını kopyalayarak `backend/.env` oluşturun.
   - `frontend/.env.example` dosyasını kopyalayarak `frontend/.env` oluşturun.

3. Frontend üretim dosyalarını oluşturun:

   ```powershell
   cd frontend
   npm run build
   ```

4. Backend çalıştırın:

   ```powershell
   cd ../backend
   npm start
   ```

5. Tarayıcıda açın:

   ```text
   http://localhost:4000
   ```

## Geliştirme modu

Backend için:

```powershell
cd backend
npm run dev
```

Frontend için:

```powershell
cd frontend
npm run dev
```

> Eğer frontend ayrı bir Vite sunucusunda çalışıyorsa `frontend/.env` içinde `VITE_API_BASE=http://localhost:4000` olarak ayarlayın.
> Eğer frontend, backend tarafından aynı origin üzerinde servis edilecekse `VITE_API_BASE` boş bırakılabilir.

## Deploy için önemli notlar

- Backend `backend/server.js`, üretimde `frontend/dist` klasörünü hizmete sunacak şekilde yapılandırıldı.
- Bu yüzden prod ortamında önce `frontend` dizininde `npm run build` çalıştırılmalı.
- `backend/.env.example` ve `frontend/.env.example` dosyalarını kullanarak `JWT_SECRET`, `PORT` ve `VITE_API_BASE` değişkenlerini ayarlayın.

## Testler ve Doğrulama

Projede temel işlevleri kontrol etmek için aşağıdaki test komutları mevcuttur:

```powershell
cd backend
node test-refund.js
node test-export.js
node test-stock.js
```

- `test-refund.js`: ödeme yapıldıktan sonra bakiye düşme ve ödeme iptali sonrası bakiye geri gelme senaryosunu test eder.
- `test-export.js`: rapor dışa aktarma CSV işlevini doğrular.
- `test-stock.js`: tüm ürünlerin stok değerlerinin sıfır olmadığını kontrol eder.

Yeni eklenen `Siparişi iptal et` özelliği, satış kaydını iptal ederken stok ve ödenmiş bakiyeyi doğru şekilde geri yükler.

## Vercel demo deploy

Bu repo için `frontend` tarafını Vercel üzerinde statik site olarak deploy etmek mümkündür. Backend ise `better-sqlite3` kullandığı için Vercel serverless ortamında doğrudan çalışmayabilir. Bu nedenle Vercel deployu sadece frontend için düşünülmelidir.

1. Vercel projesini oluşturun veya GitHub entegrasyonu kullanın.
2. `frontend` dizini deploy edilsin.
3. Vercel ayarlarında `VITE_API_BASE` ortam değişkenini backend URL'inize ayarlayın. Örnek:

   ```text
   VITE_API_BASE=https://your-backend.example.com
   ```

4. Backend’i kendinizin barındırdığı bir sunucuda çalıştırın veya yerelde kullanın.

> Not: Eğer frontend ile backend aynı origin üzerinde hizmet verilecekse, `VITE_API_BASE` boş bırakabilirsiniz.

## Varsayılan giriş

- Kullanıcı: `admin`
- Parola: `kantin123`

## Düzeltmeler

- `backend/routes/islemler.js` artık ürün fiyatlarını veritabanından alır; sabit veri listesinden değil.
- `frontend/src/api.js` üretimde aynı kaynaktan çağrı yapacak şekilde güncellendi.
- `backend/server.js` üretimde `frontend/dist` klasörünü statik olarak servis ediyor.
