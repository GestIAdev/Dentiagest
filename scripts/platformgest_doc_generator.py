#!/usr/bin/env python3
"""
PlatformGest Documentation Automation Script
============================================

Este script automatiza el proceso de extracción de patrones universales
desde DentiaGest hacia la documentación de PlatformGest.

Funcionalidades:
- Analiza archivos de código fuente
- Identifica patrones universales vs específicos
- Genera prompts automáticos para Gemini
- Crea documentación estructurada
- Mantiene tracking de progreso

Autor: DentiaGest Development Team
"""

import os
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import shutil

class PlatformGestDocGenerator:
    """
    Generador automático de documentación para PlatformGest.
    
    Extrae patrones universales del código de DentiaGest y genera
    documentación estructurada para otros verticales.
    """
    
    def __init__(self, dentiagest_path: str, platformgest_docs_path: str):
        self.dentiagest_path = Path(dentiagest_path)
        self.docs_path = Path(platformgest_docs_path)
        self.analysis_results = {}
        self.universal_patterns = []
        self.specific_patterns = []
        
        # Patrones para identificar código universal vs específico
        self.universal_markers = [
            "PLATFORM_EXTRACTABLE",
            "PLATFORM_CORE", 
            "UNIVERSAL",
            "# Universal",
            "# PLATFORM"
        ]
        
        self.specific_markers = [
            "DENTAL_SPECIFIC",
            "# DENTAL",
            "dental",
            "patient",
            "tooth",
            "clinic"
        ]
    
    def analyze_file(self, file_path: Path) -> Dict:
        """
        Analiza un archivo y extrae patrones universales vs específicos.
        
        Returns:
            Dict con análisis del archivo
        """
        print(f"🔍 Analizando: {file_path.name}")
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except Exception as e:
            print(f"❌ Error leyendo {file_path}: {e}")
            return {}
        
        analysis = {
            "file_name": file_path.name,
            "file_path": str(file_path.relative_to(self.dentiagest_path)),
            "total_lines": len(content.splitlines()),
            "universal_sections": [],
            "specific_sections": [],
            "universal_percentage": 0,
            "extractable_functions": [],
            "specific_functions": [],
            "imports": [],
            "classes": [],
            "endpoints": []
        }
        
        lines = content.splitlines()
        current_section = None
        section_type = None
        
        for i, line in enumerate(lines, 1):
            # Detectar imports
            if line.strip().startswith(('from ', 'import ')):
                analysis["imports"].append(line.strip())
            
            # Detectar clases
            if line.strip().startswith('class '):
                class_name = re.search(r'class\s+(\w+)', line)
                if class_name:
                    analysis["classes"].append({
                        "name": class_name.group(1),
                        "line": i,
                        "type": self._detect_pattern_type(line)
                    })
            
            # Detectar endpoints FastAPI
            if '@router.' in line or '@app.' in line:
                endpoint_match = re.search(r'@\w+\.(get|post|put|delete|patch)\("([^"]+)"', line)
                if endpoint_match:
                    analysis["endpoints"].append({
                        "method": endpoint_match.group(1).upper(),
                        "path": endpoint_match.group(2),
                        "line": i,
                        "type": self._detect_pattern_type(line)
                    })
            
            # Detectar funciones
            if line.strip().startswith('def ') or line.strip().startswith('async def '):
                func_match = re.search(r'def\s+(\w+)', line)
                if func_match:
                    func_info = {
                        "name": func_match.group(1),
                        "line": i,
                        "type": self._detect_pattern_type(line)
                    }
                    
                    if func_info["type"] == "universal":
                        analysis["extractable_functions"].append(func_info)
                    else:
                        analysis["specific_functions"].append(func_info)
            
            # Detectar secciones por comentarios
            pattern_type = self._detect_pattern_type(line)
            if pattern_type:
                if current_section and section_type != pattern_type:
                    # Cambio de tipo de sección
                    self._save_section(analysis, current_section, section_type)
                    current_section = []
                
                if not current_section:
                    current_section = []
                
                section_type = pattern_type
                current_section.append({"line": i, "content": line})
            elif current_section:
                current_section.append({"line": i, "content": line})
        
        # Guardar última sección
        if current_section:
            self._save_section(analysis, current_section, section_type)
        
        # Calcular porcentaje universal
        total_universal_lines = sum(len(section["lines"]) for section in analysis["universal_sections"])
        analysis["universal_percentage"] = (total_universal_lines / analysis["total_lines"]) * 100 if analysis["total_lines"] > 0 else 0
        
        return analysis
    
    def _detect_pattern_type(self, line: str) -> Optional[str]:
        """Detecta si una línea indica patrón universal o específico."""
        line_lower = line.lower()
        
        for marker in self.universal_markers:
            if marker.lower() in line_lower:
                return "universal"
        
        for marker in self.specific_markers:
            if marker.lower() in line_lower:
                return "specific"
        
        return None
    
    def _save_section(self, analysis: Dict, section: List, section_type: str):
        """Guarda una sección analizada."""
        if not section:
            return
        
        section_data = {
            "start_line": section[0]["line"],
            "end_line": section[-1]["line"],
            "lines": [item["content"] for item in section],
            "description": self._extract_description(section)
        }
        
        if section_type == "universal":
            analysis["universal_sections"].append(section_data)
        else:
            analysis["specific_sections"].append(section_data)
    
    def _extract_description(self, section: List) -> str:
        """Extrae descripción de una sección."""
        for item in section[:3]:  # Primeras 3 líneas
            line = item["content"].strip()
            if line.startswith('#') or line.startswith('"""') or line.startswith("'''"):
                return line.replace('#', '').replace('"""', '').replace("'''", '').strip()
        return "Sin descripción"
    
    def generate_gemini_prompt(self, analysis: Dict) -> str:
        """
        Genera un prompt optimizado para Gemini basado en el análisis.
        """
        file_name = analysis["file_name"]
        universal_pct = analysis["universal_percentage"]
        
        prompt = f"""
# ANÁLISIS DE EXTRACTABILIDAD PLATFORMGEST

## ARCHIVO: {file_name}

### MÉTRICAS:
- **Extractabilidad Universal**: {universal_pct:.1f}%
- **Total líneas**: {analysis["total_lines"]}
- **Funciones universales**: {len(analysis["extractable_functions"])}
- **Funciones específicas**: {len(analysis["specific_functions"])}
- **Endpoints**: {len(analysis["endpoints"])}

### CÓDIGO UNIVERSAL (100% extractable):
"""
        
        # Agregar secciones universales
        for section in analysis["universal_sections"]:
            prompt += f"\n#### SECCIÓN: {section['description']}\n"
            prompt += "```python\n"
            for line in section["lines"][:10]:  # Primeras 10 líneas
                prompt += f"{line}\n"
            if len(section["lines"]) > 10:
                prompt += "# ... (más código universal)\n"
            prompt += "```\n"
        
        prompt += f"""
### CÓDIGO ESPECÍFICO (0% extractable):
"""
        
        # Agregar secciones específicas
        for section in analysis["specific_sections"][:2]:  # Solo primeras 2 secciones
            prompt += f"\n#### SECCIÓN: {section['description']}\n"
            prompt += "```python\n"
            for line in section["lines"][:5]:  # Primeras 5 líneas
                prompt += f"{line}\n"
            prompt += "```\n"
        
        prompt += f"""

### TASK PARA GEMINI:

Analiza este código de DentiaGest y genera documentación técnica para PlatformGest que incluya:

1. **PATRONES UNIVERSALES**: Identifica qué componentes son 100% reutilizables
2. **ADAPTACIÓN POR VERTICAL**: Explica cómo adaptar partes específicas
3. **ARQUITECTURA**: Documenta la estructura extraíble
4. **CASOS DE USO**: Ejemplos para VetGest, MechaGest, RestaurantGest
5. **IMPLEMENTACIÓN**: Guía paso a paso para nuevos verticales

**FORMATO REQUERIDO**: Markdown técnico con ejemplos de código y diagramas ASCII.

**ENFOQUE**: Documentación para desarrolladores que implementarán nuevos verticales del ecosistema PlatformGest.
"""
        
        return prompt
    
    def save_gemini_prompt(self, analysis: Dict, output_dir: Path) -> Path:
        """Guarda el prompt generado para usar con Gemini."""
        file_name = analysis["file_name"].replace('.py', '')
        prompt_file = output_dir / f"gemini_prompt_{file_name}.md"
        
        prompt = self.generate_gemini_prompt(analysis)
        
        with open(prompt_file, 'w', encoding='utf-8') as f:
            f.write(prompt)
        
        print(f"💾 Prompt guardado: {prompt_file}")
        return prompt_file
    
    def process_directory(self, target_dir: str) -> Dict:
        """
        Procesa todo un directorio de código fuente.
        
        Args:
            target_dir: Directorio relativo dentro de DentiaGest (ej: 'backend/app/api')
            
        Returns:
            Dict con resultados del análisis
        """
        full_path = self.dentiagest_path / target_dir
        
        if not full_path.exists():
            print(f"❌ Directorio no encontrado: {full_path}")
            return {}
        
        print(f"🚀 Procesando directorio: {target_dir}")
        
        results = {
            "directory": target_dir,
            "files_analyzed": [],
            "total_files": 0,
            "universal_percentage_avg": 0,
            "summary": {
                "highly_extractable": [],  # >80% universal
                "moderately_extractable": [],  # 40-80% universal  
                "specific_files": []  # <40% universal
            }
        }
        
        # Buscar archivos Python
        python_files = list(full_path.glob("**/*.py"))
        results["total_files"] = len(python_files)
        
        total_universal_pct = 0
        
        for py_file in python_files:
            if py_file.name == "__init__.py" and py_file.stat().st_size < 100:
                continue  # Skip archivos __init__.py pequeños
            
            analysis = self.analyze_file(py_file)
            if analysis:
                results["files_analyzed"].append(analysis)
                total_universal_pct += analysis["universal_percentage"]
                
                # Categorizar archivo
                pct = analysis["universal_percentage"]
                if pct >= 80:
                    results["summary"]["highly_extractable"].append(analysis["file_name"])
                elif pct >= 40:
                    results["summary"]["moderately_extractable"].append(analysis["file_name"])
                else:
                    results["summary"]["specific_files"].append(analysis["file_name"])
        
        # Calcular promedio
        if results["files_analyzed"]:
            results["universal_percentage_avg"] = total_universal_pct / len(results["files_analyzed"])
        
        return results
    
    def generate_batch_prompt(self, directory_results: Dict) -> str:
        """Genera un prompt para analizar todo un directorio."""
        
        dir_name = directory_results["directory"]
        avg_pct = directory_results["universal_percentage_avg"]
        
        prompt = f"""
# ANÁLISIS BATCH PLATFORMGEST - DIRECTORIO: {dir_name}

## RESUMEN EJECUTIVO:
- **Directorio**: {dir_name}
- **Archivos analizados**: {len(directory_results["files_analyzed"])}
- **Extractabilidad promedio**: {avg_pct:.1f}%

## CATEGORIZACIÓN DE ARCHIVOS:

### 🟢 ALTAMENTE EXTRACTABLES (80%+ universal):
{chr(10).join(f"- {file}" for file in directory_results["summary"]["highly_extractable"])}

### 🟡 MODERADAMENTE EXTRACTABLES (40-80% universal):
{chr(10).join(f"- {file}" for file in directory_results["summary"]["moderately_extractable"])}

### 🔴 ESPECÍFICOS (<40% universal):
{chr(10).join(f"- {file}" for file in directory_results["summary"]["specific_files"])}

## ANÁLISIS DETALLADO POR ARCHIVO:
"""
        
        for analysis in directory_results["files_analyzed"]:
            prompt += f"""
### {analysis["file_name"]} ({analysis["universal_percentage"]:.1f}% universal)

**Funciones universales**: {len(analysis["extractable_functions"])}
**Endpoints**: {len(analysis["endpoints"])}
**Clases**: {len(analysis["classes"])}

**Patrones identificados**:
"""
            
            # Mostrar algunas funciones universales
            for func in analysis["extractable_functions"][:3]:
                prompt += f"- `{func['name']}()` (línea {func['line']})\n"
        
        prompt += f"""

## TASK PARA GEMINI:

Genera documentación COMPLETA para el módulo **{dir_name}** de PlatformGest que incluya:

1. **ARQUITECTURA DEL MÓDULO**: Cómo estructurar este componente para ser universal
2. **PATRONES DE IMPLEMENTACIÓN**: Guías para cada tipo de archivo
3. **CASOS DE USO POR VERTICAL**: Ejemplos específicos para 4 verticales
4. **GUÍA DE MIGRACIÓN**: Pasos para extraer este patrón a nuevos verticales
5. **TESTING STRATEGY**: Cómo probar la universalidad

**DELIVERABLE**: Documento markdown técnico completo para desarrolladores.
"""
        
        return prompt
    
    def run_interactive_mode(self):
        """Modo interactivo para seleccionar qué procesar."""
        print("🎯 PLATFORMGEST DOC GENERATOR")
        print("=" * 50)
        
        while True:
            print("\n¿Qué quieres procesar?")
            print("1. 📁 Directorio completo (ej: backend/app/api)")
            print("2. 📄 Archivo individual")
            print("3. 🚀 Batch de directorios principales")
            print("4. 📊 Generar reporte completo")
            print("5. ❌ Salir")
            
            choice = input("\nElige una opción (1-5): ").strip()
            
            if choice == "1":
                self._process_directory_interactive()
            elif choice == "2":
                self._process_file_interactive()
            elif choice == "3":
                self._process_main_directories()
            elif choice == "4":
                self._generate_full_report()
            elif choice == "5":
                print("👋 ¡Hasta luego!")
                break
            else:
                print("❌ Opción inválida")
    
    def _process_directory_interactive(self):
        """Procesa un directorio en modo interactivo."""
        print("\n📁 PROCESAMIENTO DE DIRECTORIO")
        
        print("Directorios disponibles:")
        print("- backend/app/api (APIs)")
        print("- backend/app/core (Core system)")  
        print("- backend/app/models (Data models)")
        print("- backend/app/schemas (Pydantic schemas)")
        
        dir_path = input("Ingresa el path del directorio: ").strip()
        
        results = self.process_directory(dir_path)
        
        if results:
            # Guardar prompt para Gemini
            output_dir = self.docs_path / "prompts"
            output_dir.mkdir(exist_ok=True)
            
            batch_prompt = self.generate_batch_prompt(results)
            prompt_file = output_dir / f"batch_prompt_{dir_path.replace('/', '_')}.md"
            
            with open(prompt_file, 'w', encoding='utf-8') as f:
                f.write(batch_prompt)
            
            print(f"✅ Análisis completado!")
            print(f"📄 Prompt guardado en: {prompt_file}")
            print(f"📊 Extractabilidad promedio: {results['universal_percentage_avg']:.1f}%")
    
    def _process_file_interactive(self):
        """Procesa un archivo individual."""
        print("\n📄 PROCESAMIENTO DE ARCHIVO")
        
        file_path = input("Ingresa el path del archivo (relativo a DentiaGest): ").strip()
        full_path = self.dentiagest_path / file_path
        
        if not full_path.exists():
            print(f"❌ Archivo no encontrado: {full_path}")
            return
        
        analysis = self.analyze_file(full_path)
        
        if analysis:
            # Guardar prompt individual
            output_dir = self.docs_path / "prompts"
            output_dir.mkdir(exist_ok=True)
            
            prompt_file = self.save_gemini_prompt(analysis, output_dir)
            
            print(f"✅ Análisis completado!")
            print(f"📊 Extractabilidad: {analysis['universal_percentage']:.1f}%")
            print(f"📄 Prompt guardado en: {prompt_file}")
    
    def _process_main_directories(self):
        """Procesa los directorios principales del proyecto."""
        print("\n🚀 PROCESAMIENTO BATCH - DIRECTORIOS PRINCIPALES")
        
        main_dirs = [
            "backend/app/api",
            "backend/app/core", 
            "backend/app/models",
            "backend/app/schemas"
        ]
        
        all_results = {}
        
        for dir_path in main_dirs:
            print(f"\n🔄 Procesando {dir_path}...")
            results = self.process_directory(dir_path)
            if results:
                all_results[dir_path] = results
        
        # Generar reporte consolidado
        self._save_consolidated_report(all_results)
    
    def _save_consolidated_report(self, all_results: Dict):
        """Guarda un reporte consolidado."""
        output_dir = self.docs_path / "reports"
        output_dir.mkdir(exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = output_dir / f"extractability_report_{timestamp}.md"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write("# REPORTE DE EXTRACTABILIDAD PLATFORMGEST\n\n")
            f.write(f"**Generado**: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            for dir_path, results in all_results.items():
                f.write(f"## {dir_path}\n\n")
                f.write(f"- **Extractabilidad promedio**: {results['universal_percentage_avg']:.1f}%\n")
                f.write(f"- **Archivos analizados**: {len(results['files_analyzed'])}\n")
                f.write(f"- **Altamente extractables**: {len(results['summary']['highly_extractable'])}\n")
                f.write(f"- **Específicos**: {len(results['summary']['specific_files'])}\n\n")
        
        print(f"📊 Reporte consolidado guardado en: {report_file}")

def main():
    """Función principal del script."""
    parser = argparse.ArgumentParser(description="PlatformGest Documentation Generator")
    parser.add_argument("--dentiagest-path", required=True, help="Path al proyecto DentiaGest")
    parser.add_argument("--docs-path", required=True, help="Path a PlatformGest docs")
    parser.add_argument("--directory", help="Directorio específico a procesar")
    parser.add_argument("--file", help="Archivo específico a procesar")
    parser.add_argument("--interactive", action="store_true", help="Modo interactivo")
    
    args = parser.parse_args()
    
    generator = PlatformGestDocGenerator(args.dentiagest_path, args.docs_path)
    
    if args.interactive:
        generator.run_interactive_mode()
    elif args.directory:
        results = generator.process_directory(args.directory)
        print(f"✅ Procesado {args.directory} - Extractabilidad: {results.get('universal_percentage_avg', 0):.1f}%")
    elif args.file:
        file_path = Path(args.dentiagest_path) / args.file
        analysis = generator.analyze_file(file_path)
        if analysis:
            # Guardar prompt automáticamente
            output_dir = Path(args.docs_path) / "prompts"
            output_dir.mkdir(exist_ok=True)
            prompt_file = generator.save_gemini_prompt(analysis, output_dir)
            print(f"✅ Procesado {args.file} - Extractabilidad: {analysis.get('universal_percentage', 0):.1f}%")
            print(f"📄 Prompt guardado en: {prompt_file}")
        else:
            print(f"❌ Error procesando {args.file}")
    else:
        print("❌ Especifica --interactive, --directory o --file")

if __name__ == "__main__":
    main()
