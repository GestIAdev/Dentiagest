#!/bin/bash
# PlatformGest Documentation Generator - Linux/Mac Script
# =====================================================
# Script wrapper para facilitar el uso del generador de documentación

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "========================================================"
echo "   PLATFORMGEST DOCUMENTATION GENERATOR"
echo "========================================================"
echo ""

# Verificar que Python esté instalado
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 no está instalado o no está en PATH${NC}"
    echo "Instala Python desde https://python.org"
    exit 1
fi

# Configurar paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DENTIAGEST_PATH="$(dirname "$SCRIPT_DIR")"
PLATFORMGEST_DOCS_PATH="$HOME/Desktop/Proyectos programacion/PlatformgestIA/core docs"

echo -e "${BLUE}🔍 Verificando paths...${NC}"
echo "   DentiaGest: $DENTIAGEST_PATH"
echo "   PlatformGest Docs: $PLATFORMGEST_DOCS_PATH"
echo ""

# Verificar que los directorios existan
if [ ! -d "$DENTIAGEST_PATH" ]; then
    echo -e "${RED}❌ DentiaGest path no encontrado: $DENTIAGEST_PATH${NC}"
    exit 1
fi

if [ ! -d "$PLATFORMGEST_DOCS_PATH" ]; then
    echo -e "${YELLOW}⚠️  PlatformGest docs path no encontrado, creando...${NC}"
    mkdir -p "$PLATFORMGEST_DOCS_PATH"
    mkdir -p "$PLATFORMGEST_DOCS_PATH/prompts"
    mkdir -p "$PLATFORMGEST_DOCS_PATH/reports"
fi

echo -e "${GREEN}✅ Paths verificados${NC}"
echo ""

# Función para mostrar menú
show_menu() {
    echo "¿Qué quieres hacer?"
    echo ""
    echo "[1] 🚀 Modo interactivo (recomendado)"
    echo "[2] 📁 Procesar directorio específico"
    echo "[3] 📄 Procesar archivo específico"
    echo "[4] 🔄 Procesar directorios principales (batch)"
    echo "[5] 📊 Ver ayuda"
    echo "[6] ❌ Salir"
    echo ""
}

# Función para modo interactivo
interactive_mode() {
    echo ""
    echo -e "${BLUE}🚀 Iniciando modo interactivo...${NC}"
    echo ""
    python3 "$SCRIPT_DIR/platformgest_doc_generator.py" \
        --dentiagest-path "$DENTIAGEST_PATH" \
        --docs-path "$PLATFORMGEST_DOCS_PATH" \
        --interactive
}

# Función para procesar directorio
process_directory() {
    echo ""
    echo -e "${BLUE}📁 PROCESAMIENTO DE DIRECTORIO${NC}"
    echo ""
    echo "Ejemplos de directorios:"
    echo "  - backend/app/api"
    echo "  - backend/app/core"
    echo "  - backend/app/models"
    echo "  - backend/app/schemas"
    echo ""
    
    read -p "Ingresa el directorio a procesar: " target_dir
    
    if [ -z "$target_dir" ]; then
        echo -e "${RED}❌ Directorio no especificado${NC}"
        return
    fi
    
    echo ""
    echo -e "${BLUE}🔄 Procesando directorio: $target_dir${NC}"
    echo ""
    
    python3 "$SCRIPT_DIR/platformgest_doc_generator.py" \
        --dentiagest-path "$DENTIAGEST_PATH" \
        --docs-path "$PLATFORMGEST_DOCS_PATH" \
        --directory "$target_dir"
}

# Función para procesar archivo
process_file() {
    echo ""
    echo -e "${BLUE}📄 PROCESAMIENTO DE ARCHIVO${NC}"
    echo ""
    echo "Ejemplos de archivos:"
    echo "  - backend/app/api/auth.py"
    echo "  - backend/app/models/user.py"
    echo "  - backend/app/core/security.py"
    echo ""
    
    read -p "Ingresa el archivo a procesar: " target_file
    
    if [ -z "$target_file" ]; then
        echo -e "${RED}❌ Archivo no especificado${NC}"
        return
    fi
    
    echo ""
    echo -e "${BLUE}🔄 Procesando archivo: $target_file${NC}"
    echo ""
    
    python3 "$SCRIPT_DIR/platformgest_doc_generator.py" \
        --dentiagest-path "$DENTIAGEST_PATH" \
        --docs-path "$PLATFORMGEST_DOCS_PATH" \
        --file "$target_file"
}

# Función para procesamiento batch
batch_process() {
    echo ""
    echo -e "${BLUE}🔄 PROCESAMIENTO BATCH - DIRECTORIOS PRINCIPALES${NC}"
    echo ""
    echo "Procesando:"
    echo "  - backend/app/api"
    echo "  - backend/app/core"
    echo "  - backend/app/models"
    echo "  - backend/app/schemas"
    echo ""
    echo -e "${YELLOW}⚠️  Esto puede tomar varios minutos...${NC}"
    echo ""
    
    read -p "¿Continuar? (s/n): " confirm
    if [[ ! $confirm =~ ^[Ss]$ ]]; then
        return
    fi
    
    directories=("backend/app/api" "backend/app/core" "backend/app/models" "backend/app/schemas")
    
    for dir in "${directories[@]}"; do
        echo -e "${BLUE}🔄 Procesando $dir...${NC}"
        python3 "$SCRIPT_DIR/platformgest_doc_generator.py" \
            --dentiagest-path "$DENTIAGEST_PATH" \
            --docs-path "$PLATFORMGEST_DOCS_PATH" \
            --directory "$dir"
        echo ""
    done
    
    echo -e "${GREEN}✅ Procesamiento batch completado${NC}"
}

# Función para mostrar ayuda
show_help() {
    echo ""
    echo -e "${BLUE}📚 AYUDA - PLATFORMGEST DOCUMENTATION GENERATOR${NC}"
    echo "================================================"
    echo ""
    echo "Este script automatiza la extracción de patrones universales"
    echo "desde DentiaGest hacia la documentación de PlatformGest."
    echo ""
    echo -e "${GREEN}FUNCIONES PRINCIPALES:${NC}"
    echo ""
    echo -e "${YELLOW}🔍 ANÁLISIS DE CÓDIGO:${NC}"
    echo "   - Identifica patrones universales vs específicos"
    echo "   - Calcula porcentaje de extractabilidad"
    echo "   - Detecta funciones, clases y endpoints"
    echo ""
    echo -e "${YELLOW}📝 GENERACIÓN DE PROMPTS:${NC}"
    echo "   - Crea prompts optimizados para Gemini"
    echo "   - Incluye contexto y ejemplos de código"
    echo "   - Formatea para máxima comprensión de IA"
    echo ""
    echo -e "${YELLOW}📊 REPORTES:${NC}"
    echo "   - Análisis de extractabilidad por archivo"
    echo "   - Reportes consolidados por directorio"
    echo "   - Tracking de progreso de documentación"
    echo ""
    echo -e "${GREEN}ARCHIVOS GENERADOS:${NC}"
    echo "   - prompts/: Prompts listos para Gemini"
    echo "   - reports/: Reportes de análisis"
    echo ""
    echo -e "${GREEN}WORKFLOW RECOMENDADO:${NC}"
    echo "   1. Ejecutar análisis batch (opción 4)"
    echo "   2. Revisar reportes generados"
    echo "   3. Usar prompts individuales con Gemini"
    echo "   4. Copiar respuestas de Gemini a documentación"
    echo ""
    
    read -p "Presiona Enter para continuar..."
}

# Bucle principal
while true; do
    show_menu
    read -p "Elige una opción (1-6): " choice
    
    case $choice in
        1)
            interactive_mode
            ;;
        2)
            process_directory
            ;;
        3)
            process_file
            ;;
        4)
            batch_process
            ;;
        5)
            show_help
            ;;
        6)
            echo ""
            echo -e "${GREEN}👋 ¡Gracias por usar PlatformGest Doc Generator!${NC}"
            echo ""
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opción inválida${NC}"
            ;;
    esac
    
    echo ""
    echo -e "${BLUE}📁 Archivos generados en: $PLATFORMGEST_DOCS_PATH${NC}"
    echo ""
    
    read -p "¿Quieres abrir la carpeta de documentación? (s/n): " open_folder
    if [[ $open_folder =~ ^[Ss]$ ]]; then
        if command -v open &> /dev/null; then
            open "$PLATFORMGEST_DOCS_PATH"  # macOS
        elif command -v xdg-open &> /dev/null; then
            xdg-open "$PLATFORMGEST_DOCS_PATH"  # Linux
        else
            echo "Abre manualmente: $PLATFORMGEST_DOCS_PATH"
        fi
    fi
    
    echo ""
    read -p "¿Continuar con otra operación? (s/n): " continue_op
    if [[ ! $continue_op =~ ^[Ss]$ ]]; then
        echo ""
        echo -e "${GREEN}👋 ¡Gracias por usar PlatformGest Doc Generator!${NC}"
        echo ""
        break
    fi
done
