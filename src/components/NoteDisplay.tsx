/**
 * Componente NoteDisplay
 * Muestra la nota actual que el usuario debe tocar
 * Incluye el pentagrama musical, la digitación esperada y el tiempo restante
 */

import React from 'react';
import { NoteDisplayProps, ValveCombination } from '../types';
import MusicalStaff from './MusicalStaff';

const NoteDisplay: React.FC<NoteDisplayProps> = ({
  currentNote,
  expectedFingering,
  timeRemaining,
  noteDurationMs,
  showHints = true,
}) => {

  /**
   * Calcula el porcentaje de tiempo restante para la barra de progreso
   * Asume que el tiempo inicial es el máximo para la nota actual
   */
  const getProgressPercentage = (): number => {
    if (timeRemaining <= 0) return 0;
    const maxTime = noteDurationMs ?? 3500; // por defecto 3.5s para un poco más largo
    return Math.max(0, Math.min(100, (timeRemaining / maxTime) * 100));
  };

  /**
   * Renderiza la visualización de una combinación de válvulas
   */
  const renderFingeringDiagram = (fingering: ValveCombination) => {
    return (
      <div style={styles.fingeringContainer}>
        {fingering.map((valve, index) => (
          <div
            key={index}
            style={{
              ...styles.fingeringCircle,
              ...(valve === 1 ? styles.fingeringActive : styles.fingeringInactive),
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>
    );
  };

  const noteNameToSpanish = (note: string) => {
    // nota esperada en formato like C4, D#4, Bb4
    const letter = note.replace(/[0-9]/g, '').toUpperCase();
    const map: Record<string, string> = {
      'C': 'Do',
      'C#': 'Do♯',
      'DB': 'Re♭',
      'D': 'Re',
      'D#': 'Re♯',
      'EB': 'Mi♭',
      'E': 'Mi',
      'F': 'Fa',
      'F#': 'Fa♯',
      'GB': 'Sol♭',
      'G': 'Sol',
      'G#': 'Sol♯',
      'AB': 'La♭',
      'A': 'La',
      'A#': 'La♯',
      'BB': 'Si♭',
      'B': 'Si'
    };

    // Normalize sharp/flat suffixes
    const normalized = letter.replace('#', '#').replace('♭', 'B');
    return map[normalized] ?? note;
  };

  /**
   * Obtiene el color de la barra según el tiempo restante
   */
  const getProgressColor = (): string => {
    const percentage = getProgressPercentage();
    if (percentage > 60) return '#4CAF50'; // Verde
    if (percentage > 30) return '#FF9800'; // Naranja
    return '#F44336'; // Rojo
  };

  // Si no hay nota actual, mostrar mensaje de espera
  if (!currentNote) {
    return (
      <div style={styles.container}>
        <div style={styles.waitingMessage}>
          <h2 style={styles.waitingText}>Esperando...</h2>
          <p style={styles.waitingSubtext}>Presiona "Iniciar" para comenzar</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Nota actual en pentagrama */}
      <div style={styles.noteSection}>
        <h2 style={styles.label}>Nota Actual</h2>

        {/* Pentagrama musical */}
        <MusicalStaff note={currentNote} width={300} height={150} />

        {/* Nombre de la nota como referencia */}
        <div style={styles.noteNameReference}>
          {noteNameToSpanish(currentNote)}
        </div>
      </div>

      {/* Digitación esperada - solo se muestra si showHints está activo */}
      {showHints && expectedFingering && (
        <div style={styles.fingeringSection}>
          <h3 style={styles.fingeringLabel}>Digitación Esperada</h3>
          {renderFingeringDiagram(expectedFingering)}
          <p style={styles.fingeringText}>
            Válvulas: {expectedFingering.map((v, i) => v === 1 ? i + 1 : '').filter(x => x).join(', ') || 'Ninguna'}
          </p>
        </div>
      )}

      {/* Barra de tiempo */}
      <div style={styles.timerSection}>
        <h3 style={styles.timerLabel}>Tiempo Restante</h3>
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${getProgressPercentage()}%`,
              backgroundColor: getProgressColor(),
            }}
          />
        </div>
        <p style={styles.timerText}>
          {(timeRemaining / 1000).toFixed(2)}s
        </p>
      </div>
    </div>
  );
};

// Estilos inline para el componente
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '10px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    margin: '0',
    minHeight: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  waitingMessage: {
    textAlign: 'center',
  },
  waitingText: {
    fontSize: '24px',
    color: '#666',
    margin: '0 0 5px 0',
  },
  waitingSubtext: {
    fontSize: '14px',
    color: '#999',
  },
  noteSection: {
    textAlign: 'center',
    marginBottom: '10px',
    width: '100%',
  },
  label: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 5px 0',
    fontWeight: 'normal',
  },
  noteNameReference: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#2196F3',
    marginTop: '5px',
    fontFamily: 'Georgia, serif',
  },
  fingeringSection: {
    textAlign: 'center',
    marginBottom: '15px',
  },
  fingeringLabel: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0- 10px 0',
    fontWeight: 'normal',
  },
  fingeringContainer: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
    marginBottom: '5px',
  },
  fingeringCircle: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    border: '2px solid',
  },
  fingeringActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
    color: '#fff',
  },
  fingeringInactive: {
    backgroundColor: '#f5f5f5',
    borderColor: '#ccc',
    color: '#999',
  },
  fingeringText: {
    fontSize: '12px',
    color: '#666',
    margin: '5px 0 0 0',
  },
  timerSection: {
    width: '100%',
    maxWidth: '300px',
    textAlign: 'center',
  },
  timerLabel: {
    fontSize: '13px',
    color: '#666',
    margin: '0 0 5px 0',
    fontWeight: 'normal',
  },
  progressBarContainer: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '5px',
  },
  progressBar: {
    height: '100%',
    transition: 'all 0.3s ease',
    borderRadius: '10px',
  },
  timerText: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
    margin: '2px 0 0 0',
  },
};

export default NoteDisplay;