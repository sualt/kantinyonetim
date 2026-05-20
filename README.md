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

2. Frontend üretim dosyalarını oluşturun:

   ```powershell
   cd frontend
   npm run build
   ```

3. Backend çalıştırın:

   ```powershell
   cd ../backend
   npm start
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

> Frontend ayrı çalışıyorsa `frontend/.env` içinde `VITE_API_BASE=http://localhost:4000` olarak ayarlayın.

## Deploy için önemli notlar

- Backend `backend/server.js`, üretimde `frontend/dist` klasörünü hizmete sunacak şekilde yapılandırıldı.
- Bu yüzden prod ortamında önce `frontend` dizininde `npm run build` çalıştırılmalı.
- `backend/.env.example` ve `frontend/.env.example` dosyalarını kullanarak `JWT_SECRET`, `PORT` ve `VITE_API_BASE` değişkenlerini ayarlayın.

## Windows `.exe` oluşturma

Backend için derlenmiş bir Windows çalıştırılabilir dosya oluşturmak üzere aşağıdakileri çalıştırın:

```powershell
cd backend
npm install
npm run build:exe
```

Bu komut `dist/kantin.exe` dosyasını oluşturur ve aynı zamanda `dist/frontend/dist` altına frontend üretim dosyalarını, `dist/kantin.db` dosyasını da kopyalar.

`dist` klasöründeki yapılandırma şu şekilde olmalıdır:

- `dist/kantin.exe`
- `dist/kantin.db`
- `dist/frontend/dist/...`

`dist/kantin.exe` dosyasını çalıştırdığınızda backend otomatik olarak `http://localhost:4000` adresini açar.

## Vercel demo deploy

Bu repo için Vercel demo deploy ayarı `vercel.json` ile hazırlandı. Ancak Vercel üzerinden tam işlevsel bir demo çalıştırmak için backend servisinizin herkese açık bir URL'de olması gerekir.

1. Vercel projesini oluşturun veya GitHub entegrasyonu kullanın.
2. `VITE_API_BASE` ortam değişkenini Vercel ayarlarında backend URL'inize ayarlayın. Örnek:

   ```text
   VITE_API_BASE=https://your-backend.example.com
   ```

3. Vercel, `frontend` klasörünü build ederek otomatik olarak deploy edecektir.

> Eğer backend Vercel üzerinde çalıştırılmayacaksa, frontend deploy sırasında `VITE_API_BASE` değerinin dışarıdaki backend adresini işaret ettiğinden emin olun.

## Varsayılan giriş

- Kullanıcı: `admin`
- Parola: `kantin123`

## Düzeltmeler

- `backend/routes/islemler.js` artık ürün fiyatlarını veritabanından alır; sabit veri listesinden değil.
- `frontend/src/api.js` üretimde aynı kaynaktan çağrı yapacak şekilde güncellendi.
- `backend/server.js` üretimde `frontend/dist` klasörünü statik olarak servis ediyor.
