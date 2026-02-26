/**
 * Tipos principales para el simulador de trompeta
 * Este archivo centraliza todas las interfaces y tipos utilizados en la aplicación
 */

/**
 * Representación de una combinación de válvulas
 * [0,0,0] = ninguna válvula presionada
 * [1,0,0] = primera válvula presionada
 * [1,1,0] = primera y segunda válvulas presionadas
 */
export type ValveCombination = [number, number, number];

/**
 * Información completa de digitación para una nota específica
 */
export interface FingeringInfo {
  midi: number;
  valvulas: ValveCombination;
}

/**
 * Mapa completo de digitaciones (nota -> digitación)
 * Ejemplo: { "C4": { midi: 60, valvulas: [0,0,0] } }
 */
export interface FingeringMap {
  [note: string]: FingeringInfo;
}

/**
 * Evento musical individual en una canción
 */
export interface MusicEvent {
  start_ms: number;    // Tiempo de inicio en milisegundos
  pitch: string;        // Nota musical (ej: "C4", "D#5")
  dur_ms: number;       // Duración de la nota en milisegondos
}

/**
 * Estructura completa de una canción
 */
export interface Song {
  title: string;
  tempo: number;        // BPM (beats per minute)
  events: MusicEvent[];
}

/**
 * Estado actual de la práctica
 */
export interface PracticeState {
  currentEventIndex: number;
  currentNote: string | null;
  expectedFingering: ValveCombination | null;
  isPlaying: boolean;
  startTime: number | null;
}

/**
 * Estadísticas del jugador
 */
export interface PlayerStats {
  correctCount: number;
  incorrectCount: number;
  averageReactionTime: number;
  totalNotes: number;
}

/**
 * Resultado de una verificación de digitación
 */
export interface FingeringCheckResult {
  isCorrect: boolean;
  expectedFingering: ValveCombination;
  inputFingering: ValveCombination;
  reactionTime: number;
}

/**
 * Configuración de audio para el motor de sonido
 */
export interface AudioConfig {
  masterVolume: number;  // 0.0 a 1.0
  waveform: OscillatorType; // 'sine', 'square', 'sawtooth', 'triangle'
  attackTime: number;    // Tiempo de ataque en segundos
  releaseTime: number;   // Tiempo de liberación en segundos
}

/**
 * Props para el componente de botones de válvulas
 */
export interface ValveButtonsProps {
  /**
   * onValvePress: toggle (legacy) handler invoked on click
   * onValveSet: optional handler to explicitly set valve state (0 or 1) for press/release
   */
  onValvePress: (valveIndex: number) => void;
  onValveSet?: (valveIndex: number, value: 0 | 1) => void;
  pressedValves: ValveCombination;
  expectedFingering?: ValveCombination | null;
  showHints?: boolean;
  disabled?: boolean;
  onToggleHints?: (show: boolean) => void;
  /** Índices de las válvulas presionadas incorrectamente — se muestran en rojo */
  wrongValves?: boolean[];
}

/**
 * Props para el componente de visualización de notas
 */
export interface NoteDisplayProps {
  currentNote: string | null;
  expectedFingering: ValveCombination | null;
  timeRemaining: number;
  /** Duración máxima de la nota (ms) usada para la barra de progreso y cálculo visual */
  noteDurationMs?: number;
  /** Indica si se deben mostrar las pistas visuales */
  showHints?: boolean;
  /** Indica si se debe mostrar el nombre de la nota debajo del pentagrama */
  showNoteName?: boolean;
}

/**
 * Props para el componente de marcador
 */
export interface ScoreBoardProps {
  stats: PlayerStats;
}

/**
 * Props para el componente de partitura
 */
export interface SheetMusicProps {
  musicXmlUrl?: string;
  currentNoteIndex: number;
}

/**
 * Opciones para cargar una canción
 */
export interface SongLoadOptions {
  source: 'json' | 'musicxml';
  path: string;
}

/**
 * Estado del temporizador de nota
 */
export interface NoteTimer {
  startTime: number;
  duration: number;
  elapsed: number;
}