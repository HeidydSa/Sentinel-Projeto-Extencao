#!/bin/bash
set -e  # para se qualquer comando falhar

VM_PATH="/home/ubuntu/dev/Sentinel-Projeto-Extencao"
APP_NAME="SENTINEL"

echo "🔨 Buildando..."
bun build ./src/app.js --minify --target=bun --outfile=./dist/app.js

scp ./dist/app.js oracle_vm:$VM_PATH/api/dist

echo "🔄 Reiniciando o app no PM2..."
ssh oracle_vm "pm2 restart $APP_NAME"

echo "✅ Deploy concluído!"