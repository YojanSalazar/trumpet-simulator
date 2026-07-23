/**
 * Componente ValveButtons
 * Renderiza N botones que representan las válvulas/rotores del instrumento activo
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
  onToggleHints,
  wrongValves,
  valveCount = 3,
  title = 'Válvulas de Trompeta',
  unitLabel = 'Válvula',
  keyBindings = [
    { main: '1', alt: '8' },
    { main: '2', alt: '9' },
    { main: '3', alt: '0' },
  ],
}) => {
  // Default wrongValves to all false if not provided
  const safeWrongValves = wrongValves || Array(valveCount).fill(false);

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
   * El keymap se construye dinámicamente a partir de keyBindings
   */
  React.useEffect(() => {
    // Build keyMap dynamically from keyBindings
    const keyMap: { [key: string]: number } = {};
    keyBindings.forEach((binding, index) => {
      keyMap[binding.main] = index;
      keyMap[binding.alt] = index;
    });

    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.repeat) return;

      // Tecla espacio para notas abiertas (resetea todas las válvulas)
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault(); // Evitar scroll
        if (onValveSet) {
          Array.from({ length: valveCount }).forEach((_, idx) => onValveSet(idx, 0));
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
  }, [disabled, valveCount, keyBindings]);

  // Generate keyboard hint text dynamically
  const altKeys = keyBindings.map(b => b.alt).join(', ');
  const hintText = `Usa ${altKeys} para ${unitLabel.toLowerCase()}s o espacio para notas abiertas`;

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>{title}</h3>
      <div style={styles.buttonsContainer}>
        {Array.from({ length: valveCount }).map((_, valveIndex) => (
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
              ...(safeWrongValves[valveIndex] ? styles.valveWrong : {}),
            }}
            aria-label={`${unitLabel} ${valveIndex + 1}`}
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
        {hintText}
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
          Mostrar pistas de {unitLabel.toLowerCase()}s
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
  valveWrong: {
    backgroundColor: '#F44336',
    borderColor: '#B71C1C',
    boxShadow: '0 0 14px rgba(244,67,54,0.8)',
    transform: 'translateY(4px) scale(0.97)',
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