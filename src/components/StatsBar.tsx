import React from 'react';
import { PlayerStats } from '../types';

interface StatsBarProps {
  stats: PlayerStats;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats }) => {
  const totalAttempts = stats.correctCount + stats.incorrectCount;
  const accuracy = totalAttempts > 0 
    ? Math.round((stats.correctCount / totalAttempts) * 100) 
    : 0;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Estadísticas</h3>
      
      {/* Progress Ring */}
      <div style={styles.ringContainer}>
        <div style={styles.accuracyRing}>
          <div style={styles.accuracyText}>
            <span style={styles.percentage}>{accuracy}%</span>
            <span style={styles.label}>Precisión</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{stats.correctCount}</span>
          <span style={styles.statLabel}>Correctas</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{stats.incorrectCount}</span>
          <span style={styles.statLabel}>Incorrectas</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>{totalAttempts}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={styles.statItem}>
          <span style={styles.statValue}>
            {Math.round(stats.averageReactionTime)}ms
          </span>
          <span style={styles.statLabel}>Tiempo Promedio</span>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '16px',
    width: '220px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#333',
    margin: '0 0 16px 0',
    textAlign: 'center',
  },
  ringContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  accuracyRing: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    border: '8px solid #e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  accuracyText: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  percentage: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#2196F3',
  },
  label: {
    fontSize: '12px',
    color: '#666',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  statValue: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: '11px',
    color: '#666',
    marginTop: '4px',
  },
};

export default StatsBar;