/**
 * 🔥 NORMALIZE MULTISAMPLES - Script Punk de Renombrado SEGURO
 * 
 * OBJETIVO: Renombrar todos los multisamples al formato estándar: `nota-max.wav`
 * 
 * PATRONES A NORMALIZAR:
 * - synth-lead/shrill/90s_shrilllead-a1.wav → a1-max.wav
 * - synth-lead/pulse-buzz-lead/90s_pulsebuzzlead-c2.wav → c2-max.wav
 * - synth-lead/classic-moog-brass/moog-brass-a1.wav → a1-max.wav
 * - synth-lead/classic-sync/classic-sync-c3.wav → c3-max.wav
 * - synth-bass/Juno/juno-sub-a1.wav → a1-max.wav
 * - synth-bass/Growly/growly-sub-c2.wav → c2-max.wav
 * 
 * SAFETY:
 * - DRY RUN primero (solo log, no rename)
 * - Genera JSON log con TODOS los cambios
 * - Validación de nombres resultantes
 */

const fs = require('fs');
const path = require('path');

// Configuración
const BASE_PATH = path.join(__dirname, 'dashboard-new', 'public', 'samples', 'cyberpunkpreset');
const DRY_RUN = false; // 🔥 MODO REAL - EJECUTAR RENOMBRADOS
const LOG_FILE = path.join(__dirname, 'normalize-multisamples-log.json');

// Carpetas a procesar
const FOLDERS_TO_NORMALIZE = [
    'melody/synth-lead/classic-moog-brass',
    'melody/synth-lead/classic-sync',
    'melody/synth-lead/pulse-buzz-lead',
    'melody/synth-lead/sawtedlead',
    'melody/synth-lead/shrill',
    'melody/synth-lead/softsawz',
    'melody/synth-lead/wave-layer',
    'Bass/synth-bass/Growly',
    'Bass/synth-bass/Juno',
    'Bass/synth-bass/Quasmidi',
    'Bass/synth-bass/Solid',
    'Bass/synth-bass/Sub'
];

/**
 * Extrae la nota del nombre del archivo
 * Ejemplos:
 * - "90s_shrilllead-a1.wav" → "a1"
 * - "moog-brass-c#2.wav" → "c#2"
 * - "juno-sub-f#3.wav" → "f#3"
 */
function extractNote(filename) {
    const withoutExt = filename.replace('.wav', '');
    
    // Pattern 1: "prefix-nota.wav" (ej: "moog-brass-a1.wav")
    const match1 = withoutExt.match(/-([a-g]#?\d+)$/i);
    if (match1) return match1[1].toLowerCase();
    
    // Pattern 2: "prefix_nota.wav" (ej: "90s_shrilllead-a1.wav")
    const match2 = withoutExt.match(/_[^_]+-([a-g]#?\d+)$/i);
    if (match2) return match2[1].toLowerCase();
    
    return null;
}

/**
 * Procesa una carpeta y renombra sus archivos
 */
function processFolder(folderRelPath) {
    const folderPath = path.join(BASE_PATH, folderRelPath);
    
    if (!fs.existsSync(folderPath)) {
        console.warn(`⚠️ Carpeta no existe: ${folderRelPath}`);
        return [];
    }
    
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.wav'));
    const operations = [];
    
    console.log(`\n📂 Procesando: ${folderRelPath} (${files.length} archivos)`);
    
    for (const oldName of files) {
        const note = extractNote(oldName);
        
        if (!note) {
            console.warn(`  ⚠️ No se pudo extraer nota de: ${oldName}`);
            continue;
        }
        
        const newName = `${note}-max.wav`;
        
        // Ya está normalizado?
        if (oldName === newName) {
            console.log(`  ✅ Ya normalizado: ${oldName}`);
            continue;
        }
        
        const oldPath = path.join(folderPath, oldName);
        const newPath = path.join(folderPath, newName);
        
        // Verificar que el destino NO existe
        if (fs.existsSync(newPath)) {
            console.error(`  ❌ CONFLICTO: ${newName} ya existe!`);
            continue;
        }
        
        operations.push({
            folder: folderRelPath,
            oldName,
            newName,
            note,
            oldPath,
            newPath
        });
        
        console.log(`  🔄 ${oldName} → ${newName}`);
    }
    
    return operations;
}

/**
 * Ejecuta todas las operaciones
 */
function main() {
    console.log('🔥 NORMALIZE MULTISAMPLES - PUNK RENAMING SCRIPT');
    console.log(`📍 Base path: ${BASE_PATH}`);
    console.log(`🛡️ Dry run: ${DRY_RUN ? 'YES (seguro)' : 'NO (REAL)'}\n`);
    
    let allOperations = [];
    
    // Procesar todas las carpetas
    for (const folder of FOLDERS_TO_NORMALIZE) {
        const ops = processFolder(folder);
        allOperations = allOperations.concat(ops);
    }
    
    console.log(`\n📊 RESUMEN:`);
    console.log(`   Total operaciones: ${allOperations.length}`);
    
    if (allOperations.length === 0) {
        console.log('   ✅ Nada que hacer, todo normalizado!');
        return;
    }
    
    // Guardar log
    const logData = {
        timestamp: new Date().toISOString(),
        dryRun: DRY_RUN,
        totalOperations: allOperations.length,
        operations: allOperations
    };
    
    fs.writeFileSync(LOG_FILE, JSON.stringify(logData, null, 2));
    console.log(`\n📝 Log guardado: ${LOG_FILE}`);
    
    // Ejecutar renombrados
    if (!DRY_RUN) {
        console.log('\n🚀 EJECUTANDO RENOMBRADOS...');
        let success = 0;
        let errors = 0;
        
        for (const op of allOperations) {
            try {
                fs.renameSync(op.oldPath, op.newPath);
                success++;
                console.log(`  ✅ ${op.folder}/${op.oldName} → ${op.newName}`);
            } catch (err) {
                errors++;
                console.error(`  ❌ ERROR en ${op.oldName}:`, err.message);
            }
        }
        
        console.log(`\n🎉 COMPLETADO:`);
        console.log(`   ✅ Éxitos: ${success}`);
        console.log(`   ❌ Errores: ${errors}`);
    } else {
        console.log('\n🛡️ DRY RUN - No se realizaron cambios reales');
        console.log('   Para ejecutar: Cambiar DRY_RUN = false');
    }
}

// EJECUTAR
try {
    main();
} catch (error) {
    console.error('💀 ERROR FATAL:', error);
    process.exit(1);
}
