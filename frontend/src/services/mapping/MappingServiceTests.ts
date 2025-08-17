/**
 * 💀 CENTRAL MAPPING SERVICE - TESTS
 * OPERACIÓN UNIFORM - Comprehensive testing suite
 * 
 * @author PunkClaude & The Anarchist
 * @date 17 Agosto 2025
 * @mission Test all mapping functionality like a beast
 */

import {
  centralMappingService,
  MappingValidators,
  performanceMonitor,
  ALL_UNIFIED_TYPES,
  ALL_LEGACY_TYPES,
  setupMappingService,
  OPERATION_UNIFORM
} from './index';

/**
 * 🚀 COMPREHENSIVE TEST SUITE
 */
export class MappingServiceTests {

  // ============================================================================
  // BASIC MAPPING TESTS
  // ============================================================================

  static async testBasicMapping(): Promise<boolean> {
    console.log('🎯 Testing Basic Mapping...');

    try {
      // Test unified to legacy mapping
      const result1 = centralMappingService.mapUnifiedToLegacy('RADIOGRAFIA');
      if (!result1.success || result1.result !== 'radiografia') {
        throw new Error(`Expected 'radiografia', got '${result1.result}'`);
      }

      // Test legacy to unified mapping
      const result2 = centralMappingService.mapLegacyToUnified('informe_medico');
      if (!result2.success || result2.result !== 'INFORME_MEDICO') {
        throw new Error(`Expected 'INFORME_MEDICO', got '${result2.result}'`);
      }

      // Test display names
      const displayName = centralMappingService.getDisplayName('CONSENTIMIENTO');
      if (!displayName || displayName === 'CONSENTIMIENTO') {
        throw new Error(`Expected localized display name, got '${displayName}'`);
      }

      console.log('✅ Basic Mapping Tests PASSED');
      return true;
    } catch (error) {
      console.error('❌ Basic Mapping Tests FAILED:', error);
      return false;
    }
  }

  // ============================================================================
  // VALIDATION TESTS
  // ============================================================================

  static async testValidation(): Promise<boolean> {
    console.log('🎯 Testing Validation...');

    try {
      // Test unified type validation
      const validResult = MappingValidators.validateUnifiedType('RADIOGRAFIA');
      if (!validResult.isValid) {
        throw new Error('Valid unified type marked as invalid');
      }

      const invalidResult = MappingValidators.validateUnifiedType('INVALID_TYPE');
      if (invalidResult.isValid) {
        throw new Error('Invalid unified type marked as valid');
      }

      // Test file validation
      const mockFile = {
        name: 'test.pdf',
        size: 1024 * 1024 // 1MB
      };

      const fileResult = MappingValidators.validateFile(mockFile, 'INFORME_MEDICO');
      if (!fileResult.isValid) {
        throw new Error('Valid PDF file marked as invalid for medical report');
      }

      // Test invalid file extension
      const invalidFile = {
        name: 'test.exe',
        size: 1024
      };

      const invalidFileResult = MappingValidators.validateFile(invalidFile, 'INFORME_MEDICO');
      if (invalidFileResult.isValid) {
        throw new Error('Invalid file extension marked as valid');
      }

      console.log('✅ Validation Tests PASSED');
      return true;
    } catch (error) {
      console.error('❌ Validation Tests FAILED:', error);
      return false;
    }
  }

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================

  static async testPerformance(): Promise<boolean> {
    console.log('🎯 Testing Performance...');

    try {
      // Reset metrics first
      performanceMonitor.resetMetrics();

      // Perform multiple operations
      const operations = 100;
      const startTime = performance.now();

      for (let i = 0; i < operations; i++) {
        const operationId = performanceMonitor.startOperation('TEST_MAPPING', 'RADIOGRAFIA');
        
        // Simulate mapping operation
        const result = centralMappingService.mapUnifiedToLegacy('RADIOGRAFIA');
        
        performanceMonitor.endOperation(operationId, result.success, Math.random() > 0.3); // 70% cache hit rate
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Check performance metrics
      const metrics = performanceMonitor.getMetrics();
      
      if (metrics.totalOperations !== operations) {
        throw new Error(`Expected ${operations} operations, got ${metrics.totalOperations}`);
      }

      if (totalTime > 1000) { // Should complete 100 operations in under 1 second
        throw new Error(`Performance too slow: ${totalTime}ms for ${operations} operations`);
      }

      console.log(`✅ Performance Tests PASSED (${totalTime.toFixed(2)}ms for ${operations} operations)`);
      return true;
    } catch (error) {
      console.error('❌ Performance Tests FAILED:', error);
      return false;
    }
  }

  // ============================================================================
  // EDGE CASE TESTS
  // ============================================================================

  static async testEdgeCases(): Promise<boolean> {
    console.log('🎯 Testing Edge Cases...');

    try {
      // Test null/undefined inputs
      const nullResult = centralMappingService.mapUnifiedToLegacy('');
      if (nullResult.success) {
        throw new Error('Empty string should fail mapping');
      }

      // Test case sensitivity
      const lowerResult = centralMappingService.mapUnifiedToLegacy('radiografia');
      if (lowerResult.success) {
        throw new Error('Lowercase unified type should be normalized or fail');
      }

      // Test very large file
      const hugeFile = {
        name: 'huge.pdf',
        size: 100 * 1024 * 1024 // 100MB
      };

      const hugeFileResult = MappingValidators.validateFile(hugeFile, 'INFORME_MEDICO');
      if (hugeFileResult.isValid) {
        throw new Error('Huge file should fail validation');
      }

      // Test batch validation
      const files = [
        { file: { name: 'test1.pdf', size: 1024 }, documentType: 'INFORME_MEDICO' as const },
        { file: { name: 'test2.jpg', size: 2048 }, documentType: 'RADIOGRAFIA' as const },
        { file: { name: 'test3.exe', size: 512 }, documentType: 'CONSENTIMIENTO' as const }
      ];

      const batchResult = MappingValidators.validateFilesBatch(files);
      if (batchResult.length !== 3) {
        throw new Error('Batch validation should return 3 results');
      }

      // Should have at least one failure (the .exe file)
      const failures = batchResult.filter(r => !r.validation.isValid);
      if (failures.length === 0) {
        throw new Error('Batch validation should have at least one failure');
      }

      console.log('✅ Edge Case Tests PASSED');
      return true;
    } catch (error) {
      console.error('❌ Edge Case Tests FAILED:', error);
      return false;
    }
  }

  // ============================================================================
  // COVERAGE TESTS
  // ============================================================================

  static async testCoverage(): Promise<boolean> {
    console.log('🎯 Testing Coverage...');

    try {
      // Test all unified types can be mapped
      let mappedCount = 0;
      for (const unifiedType of ALL_UNIFIED_TYPES) {
        const result = centralMappingService.mapUnifiedToLegacy(unifiedType);
        if (result.success) {
          mappedCount++;
        }
      }

      if (mappedCount !== ALL_UNIFIED_TYPES.length) {
        throw new Error(`Only ${mappedCount}/${ALL_UNIFIED_TYPES.length} unified types can be mapped`);
      }

      // Test all legacy types can be mapped back
      let reverseMappedCount = 0;
      for (const legacyType of ALL_LEGACY_TYPES) {
        const result = centralMappingService.mapLegacyToUnified(legacyType);
        if (result.success) {
          reverseMappedCount++;
        }
      }

      if (reverseMappedCount !== ALL_LEGACY_TYPES.length) {
        throw new Error(`Only ${reverseMappedCount}/${ALL_LEGACY_TYPES.length} legacy types can be reverse-mapped`);
      }

      console.log(`✅ Coverage Tests PASSED (${mappedCount} unified + ${reverseMappedCount} legacy types)`);
      return true;
    } catch (error) {
      console.error('❌ Coverage Tests FAILED:', error);
      return false;
    }
  }

  // ============================================================================
  // INTEGRATION TESTS
  // ============================================================================

  static async testIntegration(): Promise<boolean> {
    console.log('🎯 Testing Integration...');

    try {
      // Test complete setup
      const setupResult = setupMappingService();
      if (!setupResult.service || !setupResult.validators || !setupResult.monitor) {
        throw new Error('Setup service incomplete');
      }

      // Test service health
      const healthStatus = centralMappingService.getHealthStatus();
      if (!healthStatus.isHealthy) {
        throw new Error(`Service not healthy: isHealthy=${healthStatus.isHealthy}`);
      }

      // Test performance summary
      const summary = performanceMonitor.getPerformanceSummary();
      if (!summary || typeof summary.overall !== 'string') {
        throw new Error('Performance summary invalid');
      }

      // Test OPERATION_UNIFORM metadata
      if (!OPERATION_UNIFORM.targetComponents || OPERATION_UNIFORM.targetComponents.length === 0) {
        throw new Error('OPERATION_UNIFORM metadata incomplete');
      }

      console.log('✅ Integration Tests PASSED');
      return true;
    } catch (error) {
      console.error('❌ Integration Tests FAILED:', error);
      return false;
    }
  }

  // ============================================================================
  // MASTER TEST RUNNER
  // ============================================================================

  static async runAllTests(): Promise<boolean> {
    console.log(`
    🎸 OPERACIÓN UNIFORM - TEST SUITE
    ================================
    Running comprehensive tests for Central Mapping Service...
    `);

    const results = await Promise.all([
      this.testBasicMapping(),
      this.testValidation(),
      this.testPerformance(),
      this.testEdgeCases(),
      this.testCoverage(),
      this.testIntegration()
    ]);

    const passed = results.filter(r => r).length;
    const total = results.length;

    console.log(`
    🚀 TEST RESULTS:
    ===============
    ✅ Passed: ${passed}/${total}
    ${passed === total ? '🎸 ALL TESTS PASSED! PUNK MAPPING REVOLUTION READY!' : '❌ Some tests failed - fix before deployment'}
    `);

    return passed === total;
  }

  // ============================================================================
  // QUICK DEMO
  // ============================================================================

  static runQuickDemo(): void {
    console.log(`
    💀 CENTRAL MAPPING SERVICE - QUICK DEMO
    =======================================
    `);

    // Setup
    setupMappingService();

    // Basic mappings
    console.log('📋 Basic Mappings:');
    console.log(`RADIOGRAFIA → ${centralMappingService.mapUnifiedToLegacy('RADIOGRAFIA').result}`);
    console.log(`informe_medico → ${centralMappingService.mapLegacyToUnified('informe_medico').result}`);
    console.log(`Display: ${centralMappingService.getDisplayName('CONSENTIMIENTO')}`);

    // Validation
    console.log('\n🔍 Validation:');
    const validResult = MappingValidators.validateUnifiedType('INFORME_MEDICO');
    console.log(`INFORME_MEDICO valid: ${validResult.isValid}`);

    const fileResult = MappingValidators.validateFile(
      { name: 'test.pdf', size: 1024 * 1024 },
      'RADIOGRAFIA'
    );
    console.log(`PDF file valid for RADIOGRAFIA: ${fileResult.isValid}`);

    // Performance
    console.log('\n📊 Performance:');
    const metrics = performanceMonitor.getMetrics();
    console.log(`Operations: ${metrics.totalOperations}`);
    console.log(`Success rate: ${((metrics.successfulOperations / metrics.totalOperations) * 100 || 0).toFixed(1)}%`);

    console.log('\n🎸 Demo complete! Ready to rock!');
  }
}

// ============================================================================
// EXPORT FOR EXTERNAL USE
// ============================================================================

export default MappingServiceTests;

// Auto-run demo if this file is imported directly
if (typeof window !== 'undefined') {
  console.log('🎸 CENTRAL MAPPING SERVICE LOADED - Run MappingServiceTests.runQuickDemo() or MappingServiceTests.runAllTests()');
}

/**
 * 🎸 TESTING PRINCIPLES:
 * 
 * ✅ COMPREHENSIVE: Tests all functionality
 * ✅ PERFORMANCE: Validates speed requirements
 * ✅ EDGE CASES: Handles invalid inputs gracefully
 * ✅ COVERAGE: Tests all types and mappings
 * ✅ INTEGRATION: Validates complete workflow
 * ✅ REAL-WORLD: Uses realistic file scenarios
 * 
 * "Test like your mapping revolution depends on it!" 🎸⚡💀
 */
