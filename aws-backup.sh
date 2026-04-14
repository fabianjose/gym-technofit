#!/bin/bash
# aws-backup.sh
# Script para realizar el backup de la base de datos de GymFlow en producción
# Se recomienda ejecutarlo mediante cron diariamente.

BACKUP_DIR="/home/ubuntu/gym-technofit/backups"
mkdir -p "$BACKUP_DIR"

DATE=$(date +"%Y-%m-%d_%H-%M-%S")
FILE_NAME="gymflow_backup_$DATE.sql"

echo "Generando backup de la base de datos MySQL (GymFlow)..."
docker exec gym_db mysqldump --no-tablespaces -u gymuser -pgympassword gymflow > "$BACKUP_DIR/$FILE_NAME"
echo "Backup guardado exitosamente en: $BACKUP_DIR/$FILE_NAME"

echo "Limpiando backups anteriores a 7 días para ahorrar espacio en el servidor..."
find "$BACKUP_DIR" -type f -name "gymflow_backup_*.sql" -mtime +7 -exec rm {} \;
echo "Proceso de backup completado al 100%."
