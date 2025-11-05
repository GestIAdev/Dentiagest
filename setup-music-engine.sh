#!/bin/bash

###############################################################################
# 🎸 MUSIC ENGINE PRO - SETUP AUTOMÁTICO
###############################################################################
# Crea toda la estructura de directorios y archivos skeleton
# Basado en: PLANO-MUSICA-PRO-PLAN.md
# Ejecutor: PunkGrok (Constructor)
# Fecha: 25 de Octubre, 2025
###############################################################################

set -e  # Exit on error

echo "🎸 =========================================="
echo "🎸 MUSIC ENGINE PRO - SETUP AUTOMÁTICO"
echo "🎸 =========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

###############################################################################
# 1. CREAR ESTRUCTURA DE DIRECTORIOS
###############################################################################

echo -e "${CYAN}📁 Creando estructura de directorios...${NC}"

# Directorio base
BASE_DIR="selene/src/engines/music"

# Crear directorios principales
mkdir -p "$BASE_DIR/core"
mkdir -p "$BASE_DIR/style/presets"
mkdir -p "$BASE_DIR/structure"
mkdir -p "$BASE_DIR/harmony/progressions"
mkdir -p "$BASE_DIR/melody"
mkdir -p "$BASE_DIR/vitals"
mkdir -p "$BASE_DIR/feedback"
mkdir -p "$BASE_DIR/orchestration"
mkdir -p "$BASE_DIR/render"
mkdir -p "$BASE_DIR/utils"

# Crear directorio de tests
mkdir -p "selene/tests/engines/music"

# Crear directorio de service
mkdir -p "selene/src/services"

echo -e "${GREEN}✅ Estructura de directorios creada${NC}"
echo ""

###############################################################################
# 2. CREAR ARCHIVOS SKELETON - CORE
###############################################################################

echo -e "${CYAN}🎵 Creando archivos CORE...${NC}"

# interfaces.ts
cat > "$BASE_DIR/core/interfaces.ts" << 'EOF'
/**
 * 🎸 MUSIC ENGINE PRO - INTERFACES PÚBLICAS
 * Todas las interfaces exportables de la API
 */

import { VitalSigns } from '../../vitals/VitalSigns'

/**
 * PARÁMETROS DE GENERACIÓN MUSICAL
 * API desacoplada de ConsensusResult
 */
export interface MusicGenerationParams {
    // Core
    seed: number
    beauty: number              // 0-1
    complexity: number          // 0-1
    
    // Control
    duration?: number           // segundos
    stylePreset?: string        // 'cyberpunk-ambient', 'indie-game-loop', etc.
    styleOverrides?: Partial<StylePreset>
    
    // Mode
    mode?: 'entropy' | 'risk' | 'punk'
    
    // Structure
    form?: string               // 'A-B-A', 'verse-chorus', etc.
    loopable?: boolean
    fadeIn?: boolean
    fadeOut?: boolean
    
    // Advanced
    advanced?: {
        rootPitch?: number
        modalScale?: ModalScale
        tempo?: number
        progression?: string
    }
    
    // Metadata
    metadata?: {
        title?: string
        tags?: string[]
        description?: string
    }
}

/**
 * OUTPUT DE GENERACIÓN MUSICAL
 */
export interface MusicEngineOutput {
    midi: {
        buffer: Buffer
        notes: MIDINote[]
        tracks: MIDITrack[]
    }
    poetry: {
        verses: string[]
        fullText: string
        theme: string
        mood: string
    }
    metadata: {
        duration: number
        tempo: number
        key: string
        mode: ModalScale
        structure: string
        stylePreset: string
        seed: number
        timestamp: number
    }
    analysis: {
        complexity: number
        intensity: number
        harmony: number
        motifDevelopment: string
        progressionUsed: string
    }
    nft?: {
        tokenId?: string
        signature?: string
        attributes: Record<string, any>
        rarity: number
    }
}

/**
 * NOTA MIDI
 */
export interface MIDINote {
    pitch: number           // 0-127
    velocity: number        // 0-127
    startTime: number       // segundos
    duration: number        // segundos
    channel?: number        // 0-15
}

/**
 * TRACK MIDI
 */
export interface MIDITrack {
    id: string
    name: string
    channel: number
    program?: number        // MIDI program (instrumento)
    notes: MIDINote[]
    volume: number          // 0-127
}

/**
 * ESCALA MODAL
 */
export type ModalScale = 
    | 'major' 
    | 'minor' 
    | 'dorian' 
    | 'phrygian' 
    | 'lydian' 
    | 'mixolydian' 
    | 'locrian'

// TODO: Importar resto de interfaces desde otros archivos
export * from '../style/StylePreset'
export * from '../structure/SongStructure'
export * from '../harmony/ChordProgression'
export * from '../melody/MelodicMotif'
EOF

# types.ts
cat > "$BASE_DIR/core/types.ts" << 'EOF'
/**
 * 🎸 MUSIC ENGINE PRO - TIPOS COMPARTIDOS
 */

/**
 * MODO DE GENERACIÓN
 */
export type GenerationMode = 'entropy' | 'risk' | 'punk'

/**
 * CONFIGURACIÓN DE MODO
 */
export interface ModeConfig {
    entropyFactor: number       // 0-100
    riskThreshold: number       // 0-100
    punkProbability: number     // 0-100
}

/**
 * CALIDAD DE ACORDE
 */
export type ChordQuality = 
    | 'major' 
    | 'minor' 
    | 'diminished' 
    | 'augmented' 
    | 'dominant' 
    | 'half-diminished'
    | 'sus2'
    | 'sus4'
    | 'power'

/**
 * ARTICULACIÓN
 */
export type Articulation = 'staccato' | 'legato' | 'normal'

/**
 * TIPO DE SECCIÓN
 */
export type SectionType = 'intro' | 'verse' | 'chorus' | 'bridge' | 'outro' | 'interlude'

/**
 * CONTORNO MELÓDICO
 */
export type MelodicContour = 'ascending' | 'descending' | 'arched' | 'valley' | 'wave' | 'static'

/**
 * EMOTIONAL MOOD
 */
export type EmotionalMood = 
    | 'calm' 
    | 'energetic' 
    | 'tense' 
    | 'melancholic' 
    | 'euphoric' 
    | 'anxious' 
    | 'meditative' 
    | 'chaotic'
EOF

# MusicEnginePro.ts
cat > "$BASE_DIR/core/MusicEnginePro.ts" << 'EOF'
/**
 * 🎸 MUSIC ENGINE PRO - API PRINCIPAL
 * Punto de entrada para generación musical profesional
 */

import { MusicGenerationParams, MusicEngineOutput } from './interfaces'
import { VitalSigns } from '../../vitals/VitalSigns'
import { StyleEngine } from '../style/StyleEngine'
import { StructureEngine } from '../structure/StructureEngine'
import { HarmonyEngine } from '../harmony/HarmonyEngine'
import { MelodyEngine } from '../melody/MelodyEngine'
import { VitalsIntegrationEngine } from '../vitals/VitalsIntegrationEngine'
import { Orchestrator } from '../orchestration/Orchestrator'
import { MIDIRenderer } from '../render/MIDIRenderer'

/**
 * MUSIC ENGINE PRO
 * Orquesta todos los subsistemas
 */
export class MusicEnginePro {
    private styleEngine: StyleEngine
    private structureEngine: StructureEngine
    private harmonyEngine: HarmonyEngine
    private melodyEngine: MelodyEngine
    private vitalsEngine: VitalsIntegrationEngine
    private orchestrator: Orchestrator
    private renderer: MIDIRenderer
    
    constructor() {
        this.styleEngine = new StyleEngine()
        this.structureEngine = new StructureEngine()
        this.harmonyEngine = new HarmonyEngine()
        this.melodyEngine = new MelodyEngine()
        this.vitalsEngine = new VitalsIntegrationEngine()
        this.orchestrator = new Orchestrator()
        this.renderer = new MIDIRenderer()
    }
    
    /**
     * GENERAR MÚSICA
     * API principal desacoplada
     */
    async generate(
        params: MusicGenerationParams,
        vitals?: VitalSigns
    ): Promise<MusicEngineOutput> {
        // TODO: Implementar flujo completo
        // 1. Resolver estilo
        // 2. Generar estructura
        // 3. Generar armonía
        // 4. Generar melodía
        // 5. Orquestar capas
        // 6. Renderizar MIDI
        // 7. Generar poetry (integración)
        
        throw new Error('Not implemented yet')
    }
    
    /**
     * GENERAR DESDE CONSENSUS
     * Adapter para backwards compatibility
     */
    async generateFromConsensus(result: any): Promise<MusicEngineOutput> {
        const params = this.consensusToParams(result)
        return this.generate(params)
    }
    
    /**
     * GENERACIÓN RÁPIDA
     * API simplificada
     */
    async quickGenerate(
        style: string,
        duration: number,
        seed: number
    ): Promise<MusicEngineOutput> {
        const params: MusicGenerationParams = {
            seed,
            beauty: 0.5,
            complexity: 0.5,
            duration,
            stylePreset: style
        }
        
        return this.generate(params)
    }
    
    /**
     * CONVERTIR CONSENSUS A PARAMS
     */
    private consensusToParams(result: any): MusicGenerationParams {
        // TODO: Implementar conversión
        throw new Error('Not implemented yet')
    }
}
EOF

echo -e "${GREEN}✅ Archivos CORE creados${NC}"
echo ""

###############################################################################
# 3. CREAR ARCHIVOS SKELETON - UTILS
###############################################################################

echo -e "${CYAN}🔧 Creando archivos UTILS...${NC}"

# SeededRandom.ts
cat > "$BASE_DIR/utils/SeededRandom.ts" << 'EOF'
/**
 * 🎸 SEEDED RANDOM - RNG DETERMINISTICO
 * 100% reproducible, 0% Math.random()
 */

export class SeededRandom {
    private seed: number
    
    constructor(seed: number) {
        this.seed = seed
    }
    
    /**
     * Generar siguiente número (0-1)
     * Algoritmo: Mulberry32
     */
    next(): number {
        let t = this.seed += 0x6D2B79F5
        t = Math.imul(t ^ t >>> 15, t | 1)
        t ^= t + Math.imul(t ^ t >>> 7, t | 61)
        return ((t ^ t >>> 14) >>> 0) / 4294967296
    }
    
    /**
     * Número entero en rango [min, max]
     */
    nextInt(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min
    }
    
    /**
     * Elemento aleatorio de array
     */
    choice<T>(array: T[]): T {
        return array[this.nextInt(0, array.length - 1)]
    }
    
    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffle<T>(array: T[]): T[] {
        const result = [...array]
        for (let i = result.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i)
            ;[result[i], result[j]] = [result[j], result[i]]
        }
        return result
    }
}
EOF

# MusicTheoryUtils.ts
cat > "$BASE_DIR/utils/MusicTheoryUtils.ts" << 'EOF'
/**
 * 🎸 MUSIC THEORY UTILS
 * Utilidades de teoría musical
 */

import { ChordQuality } from '../core/types'

/**
 * Construir acorde desde fundamental
 */
export function buildChord(root: number, quality: ChordQuality): number[] {
    const intervals: Record<ChordQuality, number[]> = {
        'major': [0, 4, 7],
        'minor': [0, 3, 7],
        'diminished': [0, 3, 6],
        'augmented': [0, 4, 8],
        'dominant': [0, 4, 7, 10],
        'half-diminished': [0, 3, 6, 10],
        'sus2': [0, 2, 7],
        'sus4': [0, 5, 7],
        'power': [0, 7]
    }
    
    return intervals[quality].map(interval => root + interval)
}

/**
 * Transponer nota
 */
export function transpose(pitch: number, semitones: number): number {
    return Math.max(0, Math.min(127, pitch + semitones))
}

/**
 * Calcular intervalo entre dos notas
 */
export function interval(pitch1: number, pitch2: number): number {
    return Math.abs(pitch2 - pitch1)
}
EOF

# ScaleUtils.ts
cat > "$BASE_DIR/utils/ScaleUtils.ts" << 'EOF'
/**
 * 🎸 SCALE UTILS
 * Escalas y modos musicales
 */

import { ModalScale } from '../core/interfaces'

/**
 * INTERVALOS DE ESCALAS (semitonos desde tónica)
 */
const SCALE_INTERVALS: Record<ModalScale, number[]> = {
    'major': [0, 2, 4, 5, 7, 9, 11],
    'minor': [0, 2, 3, 5, 7, 8, 10],
    'dorian': [0, 2, 3, 5, 7, 9, 10],
    'phrygian': [0, 1, 3, 5, 7, 8, 10],
    'lydian': [0, 2, 4, 6, 7, 9, 11],
    'mixolydian': [0, 2, 4, 5, 7, 9, 10],
    'locrian': [0, 1, 3, 5, 6, 8, 10]
}

/**
 * Obtener notas de escala
 */
export function getScaleNotes(root: number, scale: ModalScale): number[] {
    return SCALE_INTERVALS[scale].map(interval => root + interval)
}

/**
 * Obtener grado de escala
 */
export function getScaleDegree(root: number, scale: ModalScale, degree: number): number {
    const intervals = SCALE_INTERVALS[scale]
    const index = (degree - 1) % intervals.length
    const octaveShift = Math.floor((degree - 1) / intervals.length) * 12
    return root + intervals[index] + octaveShift
}

/**
 * Verificar si nota pertenece a escala
 */
export function isInScale(pitch: number, root: number, scale: ModalScale): boolean {
    const notes = getScaleNotes(root, scale)
    const pitchClass = pitch % 12
    const rootClass = root % 12
    return notes.some(note => (note % 12) === pitchClass)
}
EOF

echo -e "${GREEN}✅ Archivos UTILS creados${NC}"
echo ""

###############################################################################
# 4. CREAR ARCHIVOS SKELETON - STYLE
###############################################################################

echo -e "${CYAN}🎨 Creando archivos STYLE...${NC}"

# StylePreset.ts
cat > "$BASE_DIR/style/StylePreset.ts" << 'EOF'
/**
 * 🎸 STYLE PRESET - INTERFACE
 */

import { ModalScale } from '../core/interfaces'
import { Articulation } from '../core/types'

export interface StylePreset {
    id: string
    name: string
    description: string
    
    musical: MusicalParameters
    layers: LayerConfiguration
    texture: TextureProfile
    temporal: TemporalBehavior
}

export interface MusicalParameters {
    mode: ModalScale
    tempo: number
    timeSignature: [number, number]
    
    harmonic: HarmonicStyle
    melodic: MelodicStyle
    rhythmic: RhythmicStyle
}

export interface HarmonicStyle {
    progressionType: 'tonal' | 'modal' | 'chromatic'
    chordComplexity: 'triads' | 'seventh' | 'extended'
    dissonanceLevel: number     // 0-1
    voiceLeading: 'smooth' | 'contrary' | 'parallel'
}

export interface MelodicStyle {
    range: [number, number]     // MIDI range
    motifLength: [number, number]
    contourPreference: string[]
    ornamentation: 'none' | 'minimal' | 'moderate' | 'heavy'
}

export interface RhythmicStyle {
    complexity: 'simple' | 'moderate' | 'complex'
    syncopation: number         // 0-1
    swing: number               // 0-1 (0.5 = swing, 0 = straight)
}

export interface LayerConfiguration {
    melody: LayerConfig
    harmony: LayerConfig | false
    bass: LayerConfig | false
    rhythm: LayerConfig | false
    pad?: LayerConfig | false
}

export interface LayerConfig {
    enabled: boolean
    channel: number
    program?: number            // MIDI program
    octave: number
    velocity: number            // 0-127 base
    velocityVariation: number   // 0-1
    noteDuration: number        // 0-2 (1 = full, <1 = staccato, >1 = overlap)
    articulation: Articulation
    mixWeight: number           // 0-1 (mixing level)
}

export interface TextureProfile {
    density: 'sparse' | 'moderate' | 'dense'
    layering: number            // 1-6 layers
    spaceUsage: number          // 0-1 (silence vs fill)
}

export interface TemporalBehavior {
    evolution: 'static' | 'gradual' | 'dynamic'
    tension: 'constant' | 'building' | 'releasing'
}
EOF

# StyleEngine.ts
cat > "$BASE_DIR/style/StyleEngine.ts" << 'EOF'
/**
 * 🎸 STYLE ENGINE
 * Resuelve y aplica estilos musicales
 */

import { StylePreset } from './StylePreset'
import { PRESET_CATALOG } from './presets'
import { MusicGenerationParams } from '../core/interfaces'

export class StyleEngine {
    /**
     * Resolver estilo desde parámetros
     */
    resolveStyle(params: MusicGenerationParams): StylePreset {
        // TODO: Implementar
        // 1. Cargar preset base
        // 2. Aplicar overrides
        // 3. Aplicar influencia de vitals (si disponible)
        throw new Error('Not implemented yet')
    }
}
EOF

# presets/index.ts
cat > "$BASE_DIR/style/presets/index.ts" << 'EOF'
/**
 * 🎸 PRESET CATALOG
 * Catálogo de todos los presets disponibles
 */

import { StylePreset } from '../StylePreset'

// TODO: Importar presets
// import { CYBERPUNK_AMBIENT } from './cyberpunk'
// import { INDIE_GAME_LOOP } from './indie'
// etc...

export const PRESET_CATALOG: Record<string, StylePreset> = {
    // TODO: Poblar catálogo
}
EOF

# presets/cyberpunk.ts
cat > "$BASE_DIR/style/presets/cyberpunk.ts" << 'EOF'
/**
 * 🎸 PRESET: CYBERPUNK AMBIENT
 * Atmósfera oscura, drones largos, phrygian
 */

import { StylePreset } from '../StylePreset'

export const CYBERPUNK_AMBIENT: StylePreset = {
    id: 'cyberpunk-ambient',
    name: 'Cyberpunk Ambient',
    description: 'Dark atmospheric soundscapes with long drones',
    
    musical: {
        mode: 'phrygian',
        tempo: 70,
        timeSignature: [4, 4],
        
        harmonic: {
            progressionType: 'modal',
            chordComplexity: 'extended',
            dissonanceLevel: 0.7,
            voiceLeading: 'smooth'
        },
        
        melodic: {
            range: [48, 72],
            motifLength: [4, 8],
            contourPreference: ['descending', 'static'],
            ornamentation: 'minimal'
        },
        
        rhythmic: {
            complexity: 'simple',
            syncopation: 0.3,
            swing: 0
        }
    },
    
    layers: {
        melody: {
            enabled: true,
            channel: 0,
            program: 81,        // Pad synth
            octave: 5,
            velocity: 70,
            velocityVariation: 0.2,
            noteDuration: 1.5,
            articulation: 'legato',
            mixWeight: 0.8
        },
        
        harmony: {
            enabled: true,
            channel: 1,
            program: 89,        // Pad warm
            octave: 4,
            velocity: 50,
            velocityVariation: 0.1,
            noteDuration: 2.0,
            articulation: 'legato',
            mixWeight: 0.5
        },
        
        bass: {
            enabled: true,
            channel: 2,
            program: 38,        // Synth bass
            octave: 2,
            velocity: 60,
            velocityVariation: 0.15,
            noteDuration: 0.8,
            articulation: 'normal',
            mixWeight: 0.6
        },
        
        rhythm: false,
        pad: false
    },
    
    texture: {
        density: 'sparse',
        layering: 3,
        spaceUsage: 0.4
    },
    
    temporal: {
        evolution: 'gradual',
        tension: 'constant'
    }
}
EOF

echo -e "${GREEN}✅ Archivos STYLE creados (1 preset ejemplo)${NC}"
echo ""

###############################################################################
# 5. CREAR ARCHIVOS SKELETON - STRUCTURE
###############################################################################

echo -e "${CYAN}🎼 Creando archivos STRUCTURE...${NC}"

# SongStructure.ts
cat > "$BASE_DIR/structure/SongStructure.ts" << 'EOF'
/**
 * 🎸 SONG STRUCTURE - INTERFACES
 */

import { SectionType } from '../core/types'

export interface SongStructure {
    sections: Section[]
    totalDuration: number
    globalTempo: number
    timeSignature: [number, number]
    form: string                // 'A-B-A', 'verse-chorus-verse', etc.
}

export interface Section {
    type: SectionType
    profile: SectionProfile
    startTime: number
    duration: number
    index: number
}

export interface SectionProfile {
    intensity: number           // 0-1
    complexity: number          // 0-1
    rhythmicDensity: number     // 0-1
    melodicActivity: number     // 0-1
    harmonicMovement: number    // 0-1
    modulation?: Modulation
}

export interface Modulation {
    toKey: number
    type: 'direct' | 'pivot' | 'chromatic'
}
EOF

# StructureEngine.ts
cat > "$BASE_DIR/structure/StructureEngine.ts" << 'EOF'
/**
 * 🎸 STRUCTURE ENGINE
 * Genera estructura de canción
 */

import { SongStructure } from './SongStructure'
import { StylePreset } from '../style/StylePreset'
import { SeededRandom } from '../utils/SeededRandom'

export class StructureEngine {
    /**
     * Generar estructura
     */
    generateStructure(
        targetDuration: number,
        style: StylePreset,
        seed: number
    ): SongStructure {
        // TODO: Implementar
        // 1. Seleccionar forma según duración
        // 2. Calcular duraciones con Fibonacci
        // 3. Asignar perfiles por sección
        // 4. Generar transiciones
        throw new Error('Not implemented yet')
    }
}
EOF

echo -e "${GREEN}✅ Archivos STRUCTURE creados${NC}"
echo ""

###############################################################################
# 6. CREAR ARCHIVOS SKELETON - HARMONY
###############################################################################

echo -e "${CYAN}🎹 Creando archivos HARMONY...${NC}"

# ChordProgression.ts
cat > "$BASE_DIR/harmony/ChordProgression.ts" << 'EOF'
/**
 * 🎸 CHORD PROGRESSION - INTERFACES
 */

import { ChordQuality } from '../core/types'

export interface ChordProgression {
    id: string
    name: string
    chords: ChordDegree[]
    type: 'tonal' | 'modal' | 'chromatic'
    voiceLeading: 'smooth' | 'contrary' | 'parallel'
    cyclic: boolean
}

export interface ChordDegree {
    degree: number              // 0-6 (I-VII)
    quality: ChordQuality
    extensions?: number[]       // [7, 9, 11, 13]
    alterations?: number[]      // [♭9, #11, etc.]
    duration: number            // beats
    inversion?: number          // 0-3
}

export interface ResolvedChord {
    root: number                // MIDI pitch
    notes: number[]             // MIDI pitches
    duration: number            // seconds
    startTime: number           // seconds
}
EOF

# HarmonyEngine.ts
cat > "$BASE_DIR/harmony/HarmonyEngine.ts" << 'EOF'
/**
 * 🎸 HARMONY ENGINE
 * Genera progresiones armónicas
 */

import { ChordProgression, ResolvedChord } from './ChordProgression'
import { Section } from '../structure/SongStructure'
import { StylePreset } from '../style/StylePreset'
import { SeededRandom } from '../utils/SeededRandom'

export class HarmonyEngine {
    /**
     * Generar secuencia de acordes para sección
     */
    generateChordSequence(
        section: Section,
        style: StylePreset,
        rootPitch: number,
        seed: number
    ): ResolvedChord[] {
        // TODO: Implementar
        // 1. Seleccionar progresión
        // 2. Resolver acordes
        // 3. Aplicar voice leading
        throw new Error('Not implemented yet')
    }
}
EOF

# progressions/index.ts
cat > "$BASE_DIR/harmony/progressions/index.ts" << 'EOF'
/**
 * 🎸 PROGRESSIONS CATALOG
 */

import { ChordProgression } from '../ChordProgression'

// TODO: Importar progresiones
// import { POP_PROGRESSIONS } from './pop'
// etc...

export const PROGRESSIONS_CATALOG: ChordProgression[] = [
    // TODO: Poblar catálogo
]
EOF

echo -e "${GREEN}✅ Archivos HARMONY creados${NC}"
echo ""

###############################################################################
# 7. CREAR ARCHIVOS SKELETON - MELODY
###############################################################################

echo -e "${CYAN}🎶 Creando archivos MELODY...${NC}"

# MelodicMotif.ts
cat > "$BASE_DIR/melody/MelodicMotif.ts" << 'EOF'
/**
 * 🎸 MELODIC MOTIF - INTERFACE
 */

import { MelodicContour, Articulation } from '../core/types'

export interface MelodicMotif {
    intervals: number[]         // Intervalos (semitonos)
    rhythm: number[]            // Duraciones relativas
    articulation: Articulation[]
    contour: MelodicContour
    length: number
    range: [number, number]
}
EOF

# MelodyEngine.ts
cat > "$BASE_DIR/melody/MelodyEngine.ts" << 'EOF'
/**
 * 🎸 MELODY ENGINE
 * Genera melodías con motivos
 */

import { MelodicMotif } from './MelodicMotif'
import { MIDINote } from '../core/interfaces'
import { Section } from '../structure/SongStructure'
import { StylePreset } from '../style/StylePreset'
import { SeededRandom } from '../utils/SeededRandom'

export class MelodyEngine {
    /**
     * Generar melodía para sección
     */
    generateMelody(
        section: Section,
        style: StylePreset,
        rootPitch: number,
        seed: number
    ): MIDINote[] {
        // TODO: Implementar
        // 1. Generar motivo base
        // 2. Aplicar transformaciones
        // 3. Renderizar a notas MIDI
        throw new Error('Not implemented yet')
    }
}
EOF

echo -e "${GREEN}✅ Archivos MELODY creados${NC}"
echo ""

###############################################################################
# 8. CREAR ARCHIVOS SKELETON - VITALS
###############################################################################

echo -e "${CYAN}💓 Creando archivos VITALS...${NC}"

# VitalsIntegrationEngine.ts
cat > "$BASE_DIR/vitals/VitalsIntegrationEngine.ts" << 'EOF'
/**
 * 🎸 VITALS INTEGRATION ENGINE
 * Mapea SystemVitals a parámetros musicales
 */

import { VitalSigns } from '../../vitals/VitalSigns'
import { StylePreset } from '../style/StylePreset'
import { EmotionalMood } from '../core/types'

export class VitalsIntegrationEngine {
    /**
     * Aplicar influencia de vitals a estilo
     */
    applyVitalsToStyle(style: StylePreset, vitals: VitalSigns): StylePreset {
        // TODO: Implementar
        // 1. Detectar emotional state
        // 2. Aplicar mapeo stress
        // 3. Aplicar mapeo harmony
        // 4. Aplicar mapeo creativity
        throw new Error('Not implemented yet')
    }
    
    /**
     * Detectar emotional state
     */
    detectEmotionalState(vitals: VitalSigns): EmotionalMood {
        // TODO: Implementar lógica de detección
        return 'calm'
    }
}
EOF

echo -e "${GREEN}✅ Archivos VITALS creados${NC}"
echo ""

###############################################################################
# 9. CREAR ARCHIVOS SKELETON - FEEDBACK
###############################################################################

echo -e "${CYAN}🧠 Creando archivos FEEDBACK...${NC}"

# FeedbackEngine.ts
cat > "$BASE_DIR/feedback/FeedbackEngine.ts" << 'EOF'
/**
 * 🎸 FEEDBACK ENGINE
 * Procesa feedback y evoluciona learning weights
 */

export class FeedbackEngine {
    /**
     * Procesar feedback de usuario
     */
    async processFeedback(feedback: any): Promise<void> {
        // TODO: Implementar
        // 1. Categorizar tags
        // 2. Derivar ajustes
        // 3. Actualizar learning weights
        // 4. Persistir en Redis
        throw new Error('Not implemented yet')
    }
}
EOF

echo -e "${GREEN}✅ Archivos FEEDBACK creados${NC}"
echo ""

###############################################################################
# 10. CREAR ARCHIVOS SKELETON - ORCHESTRATION
###############################################################################

echo -e "${CYAN}🎚️ Creando archivos ORCHESTRATION...${NC}"

# Orchestrator.ts
cat > "$BASE_DIR/orchestration/Orchestrator.ts" << 'EOF'
/**
 * 🎸 ORCHESTRATOR
 * Genera capas adicionales y aplica mixing
 */

import { MIDINote } from '../core/interfaces'
import { Section } from '../structure/SongStructure'
import { StylePreset } from '../style/StylePreset'

export class Orchestrator {
    /**
     * Generar capas adicionales
     */
    generateLayers(
        section: Section,
        chords: any[],
        melody: MIDINote[],
        style: StylePreset,
        seed: number
    ): any {
        // TODO: Implementar
        // 1. Generar harmony layer
        // 2. Generar bass layer
        // 3. Generar rhythm layer
        // 4. Generar pad layer (opcional)
        throw new Error('Not implemented yet')
    }
}
EOF

echo -e "${GREEN}✅ Archivos ORCHESTRATION creados${NC}"
echo ""

###############################################################################
# 11. CREAR ARCHIVOS SKELETON - RENDER
###############################################################################

echo -e "${CYAN}🎼 Creando archivos RENDER...${NC}"

# MIDIRenderer.ts
cat > "$BASE_DIR/render/MIDIRenderer.ts" << 'EOF'
/**
 * 🎸 MIDI RENDERER
 * Convierte notas a buffer MIDI binario
 */

import { MIDINote } from '../core/interfaces'
import { SongStructure } from '../structure/SongStructure'

export class MIDIRenderer {
    /**
     * Renderizar notas a buffer MIDI
     */
    render(notes: MIDINote[], structure: SongStructure): Buffer {
        // TODO: Implementar
        // 1. Crear estructura MIDI
        // 2. Convertir notas a eventos
        // 3. Encodear a binario
        throw new Error('Not implemented yet')
    }
    
    /**
     * Renderizar multi-track
     */
    renderMultiTrack(
        tracks: Map<string, MIDINote[]>,
        structure: SongStructure,
        style: any
    ): Buffer {
        // TODO: Implementar multi-track
        throw new Error('Not implemented yet')
    }
}
EOF

echo -e "${GREEN}✅ Archivos RENDER creados${NC}"
echo ""

###############################################################################
# 12. CREAR ARCHIVOS DE TEST
###############################################################################

echo -e "${CYAN}🧪 Creando archivos de TEST...${NC}"

# Test SeededRandom
cat > "selene/tests/engines/music/SeededRandom.test.ts" << 'EOF'
/**
 * 🎸 TEST: SEEDED RANDOM
 */

import { SeededRandom } from '../../../src/engines/music/utils/SeededRandom'

describe('SeededRandom', () => {
    it('debe generar misma secuencia con mismo seed', () => {
        const rng1 = new SeededRandom(12345)
        const rng2 = new SeededRandom(12345)
        
        expect(rng1.next()).toBe(rng2.next())
        expect(rng1.next()).toBe(rng2.next())
        expect(rng1.next()).toBe(rng2.next())
    })
    
    it('debe generar diferentes secuencias con diferentes seeds', () => {
        const rng1 = new SeededRandom(12345)
        const rng2 = new SeededRandom(54321)
        
        expect(rng1.next()).not.toBe(rng2.next())
    })
})
EOF

# Test ScaleUtils
cat > "selene/tests/engines/music/ScaleUtils.test.ts" << 'EOF'
/**
 * 🎸 TEST: SCALE UTILS
 */

import { getScaleNotes, getScaleDegree } from '../../../src/engines/music/utils/ScaleUtils'

describe('ScaleUtils', () => {
    it('debe generar escala major correcta', () => {
        const notes = getScaleNotes(60, 'major')  // C major
        expect(notes).toEqual([60, 62, 64, 65, 67, 69, 71])
    })
    
    it('debe generar escala dorian correcta', () => {
        const notes = getScaleNotes(60, 'dorian')  // C dorian
        expect(notes).toEqual([60, 62, 63, 65, 67, 69, 70])
    })
    
    it('debe obtener grado de escala correcto', () => {
        const degree1 = getScaleDegree(60, 'major', 1)  // Tónica
        const degree5 = getScaleDegree(60, 'major', 5)  // Dominante
        
        expect(degree1).toBe(60)
        expect(degree5).toBe(67)
    })
})
EOF

echo -e "${GREEN}✅ Archivos de TEST creados${NC}"
echo ""

###############################################################################
# 13. CREAR ARCHIVO DE SERVICE
###############################################################################

echo -e "${CYAN}🔌 Creando archivo SERVICE...${NC}"

# music-service.ts
cat > "selene/src/services/music-service.ts" << 'EOF'
/**
 * 🎸 MUSIC SERVICE
 * Service layer para Music Engine Pro
 */

import { MusicEnginePro } from '../engines/music/core/MusicEnginePro'
import { MusicGenerationParams, MusicEngineOutput } from '../engines/music/core/interfaces'

export class MusicService {
    private engine: MusicEnginePro
    
    constructor() {
        this.engine = new MusicEnginePro()
    }
    
    /**
     * Generar música desde parámetros
     */
    async generate(params: MusicGenerationParams): Promise<MusicEngineOutput> {
        // TODO: Añadir validación, logging, etc.
        return this.engine.generate(params)
    }
    
    /**
     * Generar música rápida
     */
    async quickGenerate(style: string, duration: number, seed: number): Promise<MusicEngineOutput> {
        return this.engine.quickGenerate(style, duration, seed)
    }
}
EOF

echo -e "${GREEN}✅ Archivo SERVICE creado${NC}"
echo ""

###############################################################################
# 14. RESUMEN FINAL
###############################################################################

echo ""
echo -e "${MAGENTA}🎸 =========================================="
echo -e "🎸 SETUP COMPLETO"
echo -e "🎸 ==========================================${NC}"
echo ""
echo -e "${GREEN}✅ Estructura de directorios creada${NC}"
echo -e "${GREEN}✅ Archivos skeleton generados${NC}"
echo -e "${GREEN}✅ Tests básicos creados${NC}"
echo -e "${GREEN}✅ Service layer preparado${NC}"
echo ""
echo -e "${CYAN}📊 ESTADÍSTICAS:${NC}"
echo -e "  - Directorios: 11"
echo -e "  - Archivos Core: 3"
echo -e "  - Archivos Utils: 3"
echo -e "  - Archivos Style: 3 + 1 preset"
echo -e "  - Archivos Structure: 2"
echo -e "  - Archivos Harmony: 2 + catalogs"
echo -e "  - Archivos Melody: 2"
echo -e "  - Archivos Vitals: 1"
echo -e "  - Archivos Feedback: 1"
echo -e "  - Archivos Orchestration: 1"
echo -e "  - Archivos Render: 1"
echo -e "  - Tests: 2"
echo -e "  - Service: 1"
echo ""
echo -e "${YELLOW}🚀 PRÓXIMO PASO:${NC}"
echo -e "   PunkGrok puede empezar ${CYAN}FASE 1: FUNDACIONES${NC}"
echo -e "   Implementar lógica en archivos skeleton"
echo ""
echo -e "${MAGENTA}🎸 MÚSICA = CÓDIGO = ARTE = BELLEZA${NC}"
echo ""
EOF
