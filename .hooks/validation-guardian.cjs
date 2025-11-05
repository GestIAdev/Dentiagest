// 🔍 GUARDIÁN DE VALIDACIÓN LOCAL - HOOK AUTOMÁTICO
// 🎯 Protege el AXIOMA ANTI-SIMULACIÓN en tiempo real
// 📋 Ejecuta validación constante en cada cambio de código

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class ValidationGuardian {
  constructor() {
    this.workspacePath = process.cwd();
    this.watchedExtensions = ['.ts', '.js', '.tsx', '.jsx'];
    this.lastValidation = 0;
    this.validationCooldown = 2000; // 2 segundos entre validaciones
  }

  /**
   * 🚀 INICIA EL GUARDIÁN DE VALIDACIÓN
   */
  start() {
    console.log('🔍 INICIANDO GUARDIÁN DE VALIDACIÓN...');
    console.log('🎯 AXIOMA ANTI-SIMULACIÓN: Protegiendo código REAL');
    console.log('📋 Vigilancia activa iniciada...\n');

    this.setupFileWatcher();
    this.initialValidation();
  }

  /**
   * 📁 CONFIGURA VIGILANCIA DE ARCHIVOS
   */
  setupFileWatcher() {
    console.log('👁️  Monitoreando cambios en archivos...\n');

    // Monitorea el directorio completo recursivamente
    this.watchDirectory(this.workspacePath);

    // También monitorea archivos específicos críticos
    this.watchCriticalFiles();
  }

  /**
   * 👁️  MONITOREA DIRECTORIO RECURSIVAMENTE
   */
  watchDirectory(dirPath) {
    try {
      const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
        if (filename && this.shouldValidateFile(filename)) {
          this.triggerValidation(filename, eventType);
        }
      });

      // Maneja errores del watcher
      watcher.on('error', (error) => {
        console.error('❌ Error en watcher:', error);
      });

    } catch (error) {
      console.error(`❌ Error configurando watcher para ${dirPath}:`, error);
    }
  }

  /**
   * 🎯 MONITOREA ARCHIVOS CRÍTICOS
   */
  watchCriticalFiles() {
    const criticalFiles = [
      'CyberpunkConsciousnessEngine.ts',
      'HarmonicConsensusEngine.ts',
      'QuantumPoetryEngine.ts',
      'EmergenceGenerator.ts'
    ];

    criticalFiles.forEach(file => {
      const filePath = path.join(this.workspacePath, 'apollo-nuclear', 'swarm', 'coordinator', file);
      if (fs.existsSync(filePath)) {
        console.log(`🎯 Vigilando archivo crítico: ${file}`);
      }
    });
  }

  /**
   * ❓ DETERMINA SI UN ARCHIVO DEBE SER VALIDADO
   */
  shouldValidateFile(filename) {
    const ext = path.extname(filename);
    return this.watchedExtensions.includes(ext) &&
           !filename.includes('node_modules') &&
           !filename.includes('.git') &&
           !filename.startsWith('.');
  }

  /**
   * ⚡ DISPARA VALIDACIÓN CON COOLDOWN
   */
  triggerValidation(filename, eventType) {
    const now = Date.now();

    if (now - this.lastValidation < this.validationCooldown) {
      return; // Cooldown activo
    }

    this.lastValidation = now;

    console.log(`\n📝 Cambio detectado: ${filename} (${eventType})`);
    console.log('🔍 Ejecutando validación automática...');

    this.runValidation();
  }

  /**
   * 🏃‍♂️ EJECUTA VALIDACIÓN
   */
  runValidation() {
    const validationProcess = exec('node validate-anti-simulation.cjs', {
      cwd: this.workspacePath,
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });

    let output = '';
    let errorOutput = '';

    validationProcess.stdout.on('data', (data) => {
      output += data;
    });

    validationProcess.stderr.on('data', (data) => {
      errorOutput += data;
    });

    validationProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Validación PASSED - Código cumple AXIOMA ANTI-SIMULACIÓN');
      } else {
        console.log('❌ Validación FAILED - VIOLACIONES DETECTADAS');
        console.log('🚨 REVISAR INMEDIATAMENTE');

        if (errorOutput) {
          console.log('\n📋 DETALLES DEL ERROR:');
          console.log(errorOutput);
        }
      }

      console.log('🔄 Vigilancia continua activa...\n');
    });

    validationProcess.on('error', (error) => {
      console.error('❌ Error ejecutando validación:', error);
    });
  }

  /**
   * 🎯 EJECUTA VALIDACIÓN INICIAL
   */
  initialValidation() {
    console.log('🎯 Ejecutando validación inicial...\n');
    setTimeout(() => {
      this.runValidation();
    }, 1000); // Pequeño delay para inicialización
  }

  /**
   * 🛑 DETIENE EL GUARDIÁN
   */
  stop() {
    console.log('\n🛑 Guardián de validación detenido');
    process.exit(0);
  }
}

// 🚀 EJECUCIÓN
const guardian = new ValidationGuardian();

// Maneja señales de terminación
process.on('SIGINT', () => guardian.stop());
process.on('SIGTERM', () => guardian.stop());

// Inicia el guardián
guardian.start();

// Mantén el proceso vivo
setInterval(() => {
  // Heartbeat cada 30 segundos
  console.log(`💓 Guardián activo - ${new Date().toLocaleTimeString()}`);
}, 30000);