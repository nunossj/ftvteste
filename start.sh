#!/bin/bash

echo "=========================================="
echo "  FEDERAÇÃO DE FUTEBOL VIRTUAL"
echo "=========================================="
echo ""
echo "🔧 Verificando instalação do Node.js..."

if ! command -v node &> /dev/null
then
    echo "❌ Node.js não encontrado!"
    echo "📥 Por favor, instale o Node.js em: https://nodejs.org"
    exit 1
fi

echo "✅ Node.js instalado: $(node --version)"
echo "✅ NPM instalado: $(npm --version)"
echo ""

if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

echo "🚀 Iniciando servidor..."
echo "📍 O sistema estará disponível em: http://localhost:3000"
echo ""
echo "⚠️  Pressione Ctrl+C para parar o servidor"
echo "=========================================="
echo ""

npm start
