/**
 * Componente ScoreBoard
 * Muestra las estadísticas del jugador en tiempo real
 * Incluye aciertos, fallos, precisión y tiempo de reacción promedio
 */

import React from 'react';
import { ScoreBoardProps } from '../types';

const ScoreBoard: React.FC<ScoreBoardProps> = ({ stats }) => {
  
  /**
   * Calcula el porcentaje de precisión
   */
  const calculateAccuracy = (): number => {
    if (stats.totalNotes === 0) return 0;
    return (stats.correctCount / stats.totalNotes) * 100;
  };

  /**
   * Obtiene el color según la precisión
   */
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy >= 90) return '#4CAF50'; // Verde - Excelente
    if (accuracy >= 75) return '#8BC34A'; // Verde claro - Bien
    if (accuracy >= 60) return '#FF9800'; // Naranja - Regular
    return '#F44336'; // Rojo - Necesita práctica
  };

  /**
   * Obtiene un mensaje motivacional según la precisión
   */
  const getAccuracyMessage = (accuracy: number): string => {
    if (accuracy >= 95) return '¡Perfecto! 🎺';
    if (accuracy >= 85) return '¡Excelente! 🎵';
    if (accuracy >= 75) return '¡Muy bien! 👍';
    if (accuracy >= 60) return '¡Sigue así! 💪';
    return '¡Sigue practicando! 📚';
  };

  const accuracy = calculateAccuracy();

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Estadísticas</h2>
      
      <div style={styles.statsGrid}>
        {/* Aciertos */}
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#4CAF50' }}>✓</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.correctCount}</div>
            <div style={styles.statLabel}>Aciertos</div>
          </div>
        </div>

        {/* Fallos */}
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#F44336' }}>✗</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.incorrectCount}</div>
            <div style={styles.statLabel}>Fallos</div>
          </div>
        </div>

        {/* Total */}
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#2196F3' }}>♪</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>{stats.totalNotes}</div>
            <div style={styles.statLabel}>Total Notas</div>
          </div>
        </div>

        {/* Tiempo de reacción */}
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#FF9800' }}>⏱</div>
          <div style={styles.statContent}>
            <div style={styles.statValue}>
              {stats.averageReactionTime > 0 
                ? `${(stats.averageReactionTime / 1000).toFixed(2)}s` 
                : '--'}
            </div>
            <div style={styles.statLabel}>T. Reacción</div>
          </div>
        </div>
      </div>

      {/* Barra de precisión */}
      <div style={styles.accuracySection}>
        <div style={styles.accuracyHeader}>
          <span style={styles.accuracyLabel}>Precisión</span>
          <span style={{ ...styles.accuracyValue, color: getAccuracyColor(accuracy) }}>
            {accuracy.toFixed(1)}%
          </span>
        </div>
        
        <div style={styles.accuracyBarContainer}>
          <div 
            style={{
              ...styles.accuracyBar,
              width: `${accuracy}%`,
              backgroundColor: getAccuracyColor(accuracy),
            }}
          />
        </div>

        <p style={styles.accuracyMessage}>
          {getAccuracyMessage(accuracy)}
        </p>
      </div>

      {/* Resumen rápido */}
      {stats.totalNotes > 0 && (
        <div style={styles.summarySection}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Racha actual:</span>
            <span style={styles.summaryValue}>
              {stats.correctCount} correctas consecutivas
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos inline para el componente
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '25px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    margin: '20px 0',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 20px 0',
    textAlign: 'center',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '15px',
    marginBottom: '25px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '15px',
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    transition: 'transform 0.2s ease',
  },
  statIcon: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    color: '#fff',
    flexShrink: 0,
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    lineHeight: 1,
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
    marginTop: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  accuracySection: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    marginBottom: '15px',
  },
  accuracyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  },
  accuracyLabel: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  accuracyValue: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  accuracyBarContainer: {
    width: '100%',
    height: '20px',
    backgroundColor: '#e0e0e0',
    borderRadius: '10px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  accuracyBar: {
    height: '100%',
    transition: 'all 0.5s ease',
    borderRadius: '10px',
  },
  accuracyMessage: {
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#666',
    margin: '10px 0 0 0',
  },
  summarySection: {
    padding: '15px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#666',
    fontWeight: 'bold',
  },
  summaryValue: {
    fontSize: '14px',
    color: '#1976D2',
    fontWeight: 'bold',
  },
};

export default ScoreBoard;  