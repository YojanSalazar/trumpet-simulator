/**
 * Componente ValveButtons
 * Renderiza los tres botones que representan las válvulas de la trompeta
 * Cada botón puede ser presionado/despresionado y muestra su estado visual
 */

import React from 'react';
import { ValveButtonsProps } from '../types';

const ValveButtons: React.FC<ValveButtonsProps> = ({
  onValvePress,
  onValveSet,
  pressedValves,
  expectedFingering = null,
  showHints = true,
  disabled = false,
  onToggleHints
}) => {

  /**
   * Maneja el click en un botón de válvula
   * Toggle del estado de la válvula (presionada/no presionada)
   */
  const handleValveClick = (valveIndex: number) => {
    if (disabled) return;
    onValvePress(valveIndex);
  };

  /**
   * Maneja la tecla presionada para control por teclado
   * Mapeo: 1 -> válvula 0, 2 -> válvula 1, 3 -> válvula 2
   */
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      // Support both numeric row 1/2/3 and numpad-ish 8/9/0 per user request
      const keyMap: { [key: string]: number } = {
        '1': 0,
        '2': 1,
        '3': 2,
        '8': 0,
        '9': 1,
        '0': 2,
      };

      // Tecla espacio para notas abiertas (resetea todas las válvulas)
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault(); // Evitar scroll
        if (onValveSet) {
          [0, 1, 2].forEach(idx => onValveSet(idx, 0));
        }
        return;
      }

      // On keydown we set valve = 1 (pressed). On keyup we set valve = 0.
      if (keyMap.hasOwnProperty(e.key)) {
        const idx = keyMap[e.key];
        if (onValveSet) onValveSet(idx, 1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const keyMap: { [key: string]: number } = { '1': 0, '2': 1, '3': 2, '8': 0, '9': 1, '0': 2 };
      if (keyMap.hasOwnProperty(e.key)) {
        const idx = keyMap[e.key];
        if (onValveSet) onValveSet(idx, 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [disabled, pressedValves]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Válvulas de Trompeta</h3>
      <div style={styles.buttonsContainer}>
        {[0, 1, 2].map((valveIndex) => (
          <button
            key={valveIndex}
            onMouseDown={() => onValveSet ? onValveSet(valveIndex, 1) : handleValveClick(valveIndex)}
            onMouseUp={() => onValveSet ? onValveSet(valveIndex, 0) : undefined}
            onTouchStart={() => onValveSet ? onValveSet(valveIndex, 1) : handleValveClick(valveIndex)}
            onTouchEnd={() => onValveSet ? onValveSet(valveIndex, 0) : undefined}
            onClick={() => onValveSet ? undefined : handleValveClick(valveIndex)}
            disabled={disabled}
            style={{
              ...styles.valveButton,
              ...(pressedValves[valveIndex] === 1 ? styles.valvePressed : {}),
              ...(disabled ? styles.valveDisabled : {}),
              ...(showHints && expectedFingering && expectedFingering[valveIndex] === 1 ? styles.valveExpected : {}),
            }}
            aria-label={`Válvula ${valveIndex + 1}`}
            aria-pressed={pressedValves[valveIndex] === 1}
          >
            <div style={styles.valveNumber}>{valveIndex + 1}</div>
            <div style={styles.valveLabel}>
              {pressedValves[valveIndex] === 1 ? 'PRESIONADA' : 'LIBRE'}
            </div>
          </button>
        ))}
      </div>
      <p style={styles.hint}>
        Usa <kbd>8</kbd>, <kbd>9</kbd>, <kbd>0</kbd> para las válvulas o <kbd>espacio</kbd> para notas abiertas
      </p>
      {/* Control de pistas */}
      <div style={styles.hintsControl}>
        <label style={styles.hintsLabel}>
          <input
            type="checkbox"
            checked={showHints}
            onChange={(e) => onToggleHints?.(e.target.checked)}
            style={styles.checkbox}
          />
          Mostrar pistas de válvulas
        </label>
      </div>
    </div>
  );
};

// Estilos inline para el componente
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    borderRadius: '12px',
    margin: '0',
  },
  title: {
    margin: '0 0 10px 0',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '15px',
    marginBottom: '10px',
  },
  valveButton: {
    width: '60px',
    height: '100px',
    backgroundColor: '#e0e0e0',
    border: '3px solid #999',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
  },
  valvePressed: {
    backgroundColor: '#4CAF50',
    borderColor: '#2E7D32',
    transform: 'translateY(4px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  valveDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  valveExpected: {
    borderColor: '#1976D2',
    boxShadow: '0 0 10px rgba(25,118,210,0.5)',
  },
  valveNumber: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#fff',
    textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
    marginBottom: '5px',
  },
  valveLabel: {
    fontSize: '8px',
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  hint: {
    fontSize: '11px',
    color: '#666',
    margin: '5px 0',
  },
  hintsControl: {
    marginTop: '5px',
    padding: '6px',
    backgroundColor: '#fff',
    borderRadius: '6px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  hintsLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#333',
    cursor: 'pointer',
  },
  checkbox: {
    width: '14px',
    height: '14px',
    cursor: 'pointer',
  },
};

export default ValveButtons;