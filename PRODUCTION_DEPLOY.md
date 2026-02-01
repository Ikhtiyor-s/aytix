# Production Deployment Qo'llanma - AyTiX Marketplace

## ✅ Pre-Deployment Checklist

### Frontend Tayyor:
- [x] `.env.production` yaratildi
- [x] Build muvaffaqiyatli (xatoliklar yo'q)
- [x] API URL production serverga sozlangan
- [ ] Domain DNS sozlangan (aytix.uz)
- [ ] SSL sertifikat olish (Let's Encrypt)

### Backend Tayyor:
- [ ] `.env` faylda production sozlamalari
- [ ] SECRET_KEY yangilangan
- [ ] DATABASE_URL production DB ga ulangan
- [ ] DEBUG=false
- [ ] TELEGRAM_BOT_TOKEN sozlangan

## 🚀 Deployment Bosqichlari

### 1. Backend Deploy (Birinchi)

```bash
# Server ga kirish
ssh user@your-server-ip

# Backend papkasiga o'tish
cd /var/www/aytixmarketbackend

# Git dan yangi kodlarni olish
git pull origin main

# .env faylni tahrirlash
nano .env
```

`.env` faylda o'zgartirish kerak:
```bash
DATABASE_URL=postgresql://prod_user:STRONG_PASSWORD@localhost:5432/aytix_production
SECRET_KEY=<python -c "import secrets; print(secrets.token_urlsafe(64))" natijasi>
DEBUG=false
TELEGRAM_BOT_TOKEN=your_real_bot_token
HOST=0.0.0.0
PORT=8000
```

```bash
# Deploy script ishga tushirish
chmod +x deploy.sh
./deploy.sh

# PM2 bilan ishga tushirish
pm2 start "uvicorn app.main:app --host 0.0.0.0 --port 8000" --name aytix-backend
pm2 save
pm2 startup  # Avtomatik restart uchun

# Status tekshirish
pm2 status
pm2 logs aytix-backend

# API ishlayotganini tekshirish
curl http://localhost:8000/api/v1/health
```

### 2. Frontend Deploy

```bash
# Frontend papkasiga o'tish
cd /var/www/aytix_github

# Git dan yangi kodlarni olish
git pull origin main

# Dependencies o'rnatish
npm install

# Production build
npm run build

# PM2 bilan ishga tushirish
pm2 start npm --name "aytix-frontend" -- start
pm2 save

# Status tekshirish
pm2 status
pm2 logs aytix-frontend
```

### 3. Nginx Sozlash

**Backend (api.aytix.uz):**
```bash
sudo nano /etc/nginx/sites-available/api.aytix.uz
```

```nginx
server {
    listen 80;
    server_name api.aytix.uz;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.aytix.uz;

    ssl_certificate /etc/letsencrypt/live/api.aytix.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.aytix.uz/privkey.pem;

    client_max_body_size 50M;

    # Static files (uploads)
    location /uploads {
        alias /var/www/aytixmarketbackend/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # API proxy
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

**Frontend (aytix.uz):**
```bash
sudo nano /etc/nginx/sites-available/aytix.uz
```

```nginx
server {
    listen 80;
    server_name aytix.uz www.aytix.uz;

    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name aytix.uz www.aytix.uz;

    ssl_certificate /etc/letsencrypt/live/aytix.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/aytix.uz/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable sites
sudo ln -s /etc/nginx/sites-available/api.aytix.uz /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/aytix.uz /etc/nginx/sites-enabled/

# Test nginx config
sudo nginx -t

# Restart nginx
sudo systemctl restart nginx
```

### 4. SSL Sertifikat (Let's Encrypt)

```bash
# Certbot o'rnatish (agar yo'q bo'lsa)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL sertifikatlar olish
sudo certbot --nginx -d api.aytix.uz
sudo certbot --nginx -d aytix.uz -d www.aytix.uz

# Auto-renewal tekshirish
sudo certbot renew --dry-run
```

## 🔍 Testing

### Backend Test:
```bash
# Health check
curl https://api.aytix.uz/api/v1/health

# API docs
# Browser da: https://api.aytix.uz/docs

# Test request
curl https://api.aytix.uz/api/v1/categories/
```

### Frontend Test:
```bash
# Browser da ochish:
https://aytix.uz

# Test qilish:
1. Marketplace sahifasini ochish
2. Login/Register ishlashini tekshirish
3. Admin panel kirish (https://aytix.uz/admin)
4. Kontaktlar modalini ochish (API dan kelayotganini tekshirish)
```

## 📊 Monitoring

### PM2 Monitoring:
```bash
# Status ko'rish
pm2 status

# Logs ko'rish
pm2 logs aytix-backend
pm2 logs aytix-frontend

# Monitoring dashboard
pm2 monit

# Restart qilish (zarur bo'lsa)
pm2 restart aytix-backend
pm2 restart aytix-frontend
```

### Database Backup:
```bash
# Backup yaratish (har kuni)
pg_dump -U postgres aytix_production > backup_$(date +%Y%m%d).sql

# Cron job qo'shish (avtomatik backup)
crontab -e
# Quyidagini qo'shish:
0 2 * * * pg_dump -U postgres aytix_production > /var/backups/aytix_$(date +\%Y\%m\%d).sql
```

## 🔧 Troubleshooting

### Frontend API ga ulanmayapti:
1. `.env.production` tekshiring
2. CORS sozlamalarini tekshiring (backend `config.py`)
3. Nginx proxy sozlamalarini tekshiring
4. Browser console da xatolarni ko'ring

### Backend ishlamayapti:
1. PM2 logs tekshiring: `pm2 logs aytix-backend`
2. Database connection tekshiring
3. `.env` fayldagi sozlamalarni tekshiring
4. Port band emasligini tekshiring: `netstat -tlnp | grep 8000`

### 500 Internal Server Error:
1. Backend logs tekshiring
2. Database migratsiyalarni tekshiring
3. SECRET_KEY to'g'riligini tekshiring

## 📝 Yangilanishlar

### Yangi kod deploy qilish:

**Backend:**
```bash
cd /var/www/aytixmarketbackend
git pull origin main
./deploy.sh
pm2 restart aytix-backend
```

**Frontend:**
```bash
cd /var/www/aytix_github
git pull origin main
npm install
npm run build
pm2 restart aytix-frontend
```

## 🎯 Production Checklist

Deploy qilishdan oldin:
- [ ] Barcha .env fayllar to'g'ri
- [ ] SECRET_KEY xavfsiz (64+ characters)
- [ ] DEBUG=false
- [ ] Database backup olingan
- [ ] SSL sertifikatlar o'rnatilgan
- [ ] Firewall sozlangan (faqat 80, 443, 22 portlar)
- [ ] PM2 auto-restart sozlangan
- [ ] Nginx konfiguratsiya test qilingan
- [ ] CORS to'g'ri sozlangan
- [ ] Monitoring o'rnatilgan

## 📞 Qo'shimcha

Muammo yuzaga kelsa:
1. PM2 logs tekshiring
2. Nginx error logs: `/var/log/nginx/error.log`
3. System logs: `journalctl -xe`

---
**Yaratilgan:** 2025-02-01
**Oxirgi yangilanish:** 2025-02-01
