#!/bin/bash
set -e

APP_DIR="/home/ubuntu/gym_deploy"
DOMAIN="34.238.22.176"

echo "==== Configurando Backend ===="
cd $APP_DIR/backend

# Crear carpeta uploads y dar permisos
mkdir -p uploads
chmod 777 uploads

# Instalar y compilar (usar legacy-peer-deps para evitar conflictos de NestJS con class-validator)
npm install --legacy-peer-deps
npm run build

# Levantar con PM2 (Reiniciar limpiamente)
pm2 delete "gym-backend" || true
pm2 start dist/main.js --name "gym-backend"

echo "==== Configurando Frontend ===="
cd $APP_DIR/frontend

# Instalar y compilar
npm install --legacy-peer-deps
npm run build

# Levantar con PM2 (Next.js server SSR en puerto 3000)
pm2 delete "gym-frontend" || true
pm2 start npm --name "gym-frontend" -- start

# Guardar estado de pm2
pm2 save

echo "==== Configurando Nginx ===="
cat <<EOF | sudo tee /etc/nginx/sites-available/gymflow > /dev/null
server {
    listen 80;
    server_name $DOMAIN;

    # Frontend (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # API endpoints (Nest.js backend, los controllers traen prefijo 'api/')
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }

    # Static uploads folder (desde el backend)
    location /uploads/ {
        alias $APP_DIR/backend/uploads/;
        access_log off;
    }
}
EOF

# Activar el sitio
sudo ln -sf /etc/nginx/sites-available/gymflow /etc/nginx/sites-enabled/
# Desactivar default si existe
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Permisos para que nginx sirva staticos
sudo chmod -R 777 $APP_DIR/backend/uploads

echo "==== Despliegue Completado ===="
