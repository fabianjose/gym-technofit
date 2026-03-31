#!/bin/bash
set -e

echo "Configurando Swap de 4GB..."
if [ ! -f /swapfile ]; then
    sudo fallocate -l 4G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
else
    echo "El archivo /swapfile ya existe."
fi

echo "Actualizando paquetes..."
sudo apt-get update -y

echo "Instalando Node.js v20..."
if ! command -v node > /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "Node.js ya está instalado."
fi

echo "Instalando Nginx..."
if ! command -v nginx > /dev/null; then
    sudo apt-get install -y nginx
else
    echo "Nginx ya está instalado."
fi

echo "Instalando PM2..."
if ! command -v pm2 > /dev/null; then
    sudo npm install -g pm2
else
    echo "PM2 ya está instalado."
fi

echo "Creando directorios base..."
mkdir -p /home/ubuntu/gymflow/backend
mkdir -p /home/ubuntu/gymflow/frontend

echo "Configuracion de infraestructura base terminada."
