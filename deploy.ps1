# deploy.ps1
# Script para empaquetar, subir código fuente limpio a AWS y construir en remoto con PM2 + Nginx.

Write-Host "Creando directorio de despliegue temporal..."
Remove-Item -Recurse -Force deploy -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path deploy\frontend | Out-Null
New-Item -ItemType Directory -Path deploy\backend | Out-Null

Write-Host "Copiando archivos fuente del Frontend..."
# Copiamos todo excepto node_modules y .next para construir allá
ROBOCOPY frontend deploy\frontend /E /XD node_modules .next /XF .env.local /NJH /NJS /NDL | Out-Null

Write-Host "Copiando archivos fuente del Backend..."
# Copiamos todo excepto node_modules y dist
ROBOCOPY backend deploy\backend /E /XD node_modules dist /NJH /NJS /NDL | Out-Null
# Excluir la carpeta de archivos subidos (no el módulo src/uploads)
Remove-Item -Recurse -Force deploy\backend\uploads -ErrorAction SilentlyContinue

Write-Host "Copiando script de configuración..."
Copy-Item setup-aws.sh deploy\

Write-Host "Comprimiendo código fuente..."
Remove-Item deploy.zip -ErrorAction SilentlyContinue
Compress-Archive -Path deploy\* -DestinationPath deploy.zip -Force

Write-Host "Transfiriendo al servidor AWS (requiere fabian-pc.pem en este directorio)..."
scp -i .\fabian-pc.pem -o StrictHostKeyChecking=no deploy.zip ubuntu@34.238.22.176:~

Write-Host "Ejecutando despliegue en remoto..."
# Eliminamos sudo al inicio para que el despligue lo maneje el usuario ubuntu (PM2, compilación, etc.)
ssh -i .\fabian-pc.pem -o StrictHostKeyChecking=no ubuntu@34.238.22.176 "unzip -qo deploy.zip -d gym_deploy && cd gym_deploy && bash setup-aws.sh"

Write-Host "Despliegue finalizado exitosamente."
