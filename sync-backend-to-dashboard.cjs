#!/usr/bin/env node
/**
 * 🔥 SYNC BACKEND TO DASHBOARD
 * Copia módulos compilados de selene/dist/ → dashboard-new/public/js/selene-core/
 * 
 * ARQUITECTURA CORRECTA:
 * - Backend TypeScript (selene/src/) es SOURCE OF TRUTH
 * - Dashboard consume módulos compilados (ES6)
 * - Este script mantiene sincronización después de `npm run build`
 * 
 * USO:
 *   node sync-backend-to-dashboard.js
 * 
 * O agregar a package.json:
 *   "build:sync": "cd selene && npm run build && cd .. && node sync-backend-to-dashboard.js"
 */

const fs = require('fs');
const path = require('path');

// Rutas
const SELENE_DIST = path.join(__dirname, 'selene', 'dist', 'src', 'engines', 'music');  // ← Directamente a /music
const DASHBOARD_TARGET = path.join(__dirname, 'dashboard-new', 'public', 'js', 'selene-core');

console.log('🔧 [SYNC] Starting backend → dashboard synchronization...');
console.log(`📂 Source: ${SELENE_DIST}`);
console.log(`📂 Target: ${DASHBOARD_TARGET}`);

// Crear directorio target si no existe
if (!fs.existsSync(DASHBOARD_TARGET)) {
    fs.mkdirSync(DASHBOARD_TARGET, { recursive: true });
    console.log(`✅ Created target directory: ${DASHBOARD_TARGET}`);
}

/**
 * 🔥 COPY DIRECTORY RECURSIVELY (mantener estructura)
 */
function copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    for (const file of files) {
        const sourcePath = path.join(source, file);
        const targetPath = path.join(target, file);
        const stats = fs.statSync(sourcePath);
        
        if (stats.isDirectory()) {
            // Recursivo para subdirectorios
            copyDirectory(sourcePath, targetPath);
        } else if (file.endsWith('.js')) {
            // Copiar solo archivos .js (no .d.ts, .map)
            fs.copyFileSync(sourcePath, targetPath);
        }
    }
}

// Copiar TODO el árbol /engines/music/ preservando estructura
console.log('🔧 [SYNC] Copying music engines tree...');
copyDirectory(SELENE_DIST, DASHBOARD_TARGET);

// Contar archivos .js copiados
function countJsFiles(dir) {
    let count = 0;
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.isDirectory()) {
            count += countJsFiles(filePath);
        } else if (file.endsWith('.js')) {
            count++;
        }
    }
    
    return count;
}

const totalFiles = countJsFiles(DASHBOARD_TARGET);
console.log(`✅ [SYNC] Copied ${totalFiles} JavaScript modules`);

// 🏛️ ARQUITECTURA: Ya NO copiamos a aura-forge/ (legacy eliminado)
// Frontend ahora importa directamente desde selene-core/ (DIRECTIVA 30B)

// Crear archivo de metadata (tracking de versión)
const metadata = {
    syncDate: new Date().toISOString(),
    seleneVersion: require('./selene/package.json').version,
    filesSync: totalFiles,
    sourceTree: 'selene/dist/src/engines/music/',
    targetTree: 'dashboard-new/public/js/selene-core/'
};

fs.writeFileSync(
    path.join(DASHBOARD_TARGET, 'sync-metadata.json'),
    JSON.stringify(metadata, null, 2)
);

console.log('\n📊 SYNC SUMMARY:');
console.log(`   ✅ Files synced: ${totalFiles} modules`);
console.log(`   📅 Date: ${metadata.syncDate}`);
console.log(`   🔢 Selene Version: ${metadata.seleneVersion}`);
console.log(`   🌳 Structure: Preserved (tree copy)`);

console.log('\n🎸 [SYNC] Backend synchronized successfully! Dashboard ready.');
process.exit(0);
