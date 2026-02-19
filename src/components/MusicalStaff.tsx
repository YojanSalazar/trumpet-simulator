/**
 * Componente MusicalStaff
 * Renderiza un pentagrama musical con la nota actual usando SVG
 * Muestra la nota en su posición correcta según su altura musical
 */

import React from 'react';

interface MusicalStaffProps {
  note: string | null; // Formato: "Do4", "Re#5", etc.
  width?: number;
  height?: number;
}

const MusicalStaff: React.FC<MusicalStaffProps> = ({
  note,
  width = 400,
  height = 200
}) => {
  // Configuración del pentagrama
  const staffLineSpacing = 12; // Espacio entre líneas del pentagrama
  const staffTop = 60; // Posición Y de la línea superior del pentagrama
  const staffLeft = 80; // Margen izquierdo
  const staffRight = width - 40; // Margen derecho

  /**
   * Mapeo de notas a posiciones en el pentagrama
   * La posición es relativa a las líneas del pentagrama (0 = línea superior)
   * Números pares = en línea, números impares = en espacio
   */
  const notePositions: { [key: string]: number } = {
    // Octava 4 (grave - incluye notas debajo del pentagrama)
    'Do4': 10,   // Debajo del pentagrama (segunda línea adicional inferior)
    'Do#4': 10,
    'Re4': 9,    // Debajo del pentagrama (primera línea adicional inferior)
    'Re#4': 9,
    'Mi4': 8,    // Quinta línea (inferior del pentagrama)
    'Fa4': 7,    // Cuarto espacio
    'Fa#4': 7,
    'Sol4': 6,   // Cuarta línea
    'Sol#4': 6,
    'La4': 5,    // Tercer espacio
    'La#4': 5,
    'Si4': 4,    // Tercera línea (central)

    // Octava 5 (media - rango principal de la trompeta)
    'Do5': 3,    // Segundo espacio
    'Do#5': 3,
    'Re5': 2,    // Segunda línea
    'Re#5': 2,
    'Mi5': 1,    // Primer espacio
    'Fa5': 0,    // Primera línea (superior del pentagrama)
    'Fa#5': 0,
    'Sol5': -1,  // Encima del pentagrama
    'Sol#5': -1,
    'La5': -2,   // Primera línea adicional superior
    'La#5': -2,
    'Si5': -3,   // Encima del pentagrama (segunda línea adicional superior)
  };

  /**
   * Calcula la posición Y de una nota en el pentagrama
   */
  const getNoteY = (noteName: string): number => {
    const position = notePositions[noteName];
    if (position === undefined) return staffTop + staffLineSpacing * 4; // Default al medio
    return staffTop + position * (staffLineSpacing / 2);
  };

  /**
   * Verifica si una nota tiene sostenido
   */
  const hasSharp = (noteName: string): boolean => {
    return noteName.includes('#') || noteName.includes('♯');
  };

  /**
   * Renderiza las líneas adicionales (ledger lines) si son necesarias
   */
  const renderLedgerLines = (noteName: string): React.ReactElement[] => {
    const position = notePositions[noteName];
    const lines: React.ReactElement[] = [];
    const noteX = width / 2;
    const lineWidth = 30;

    // Líneas adicionales inferiores (debajo del pentagrama)
    if (position >= 9) {
      for (let i = 9; i <= position; i += 2) {
        const y = staffTop + i * (staffLineSpacing / 2);
        lines.push(
          <line
            key={`ledger-bottom-${i}`}
            x1={noteX - lineWidth / 2}
            y1={y}
            x2={noteX + lineWidth / 2}
            y2={y}
            stroke="#000"
            strokeWidth="1.5"
          />
        );
      }
    }

    // Líneas adicionales superiores (encima del pentagrama)
    if (position <= -1) {
      for (let i = -1; i >= position; i -= 2) {
        const y = staffTop + i * (staffLineSpacing / 2);
        lines.push(
          <line
            key={`ledger-top-${i}`}
            x1={noteX - lineWidth / 2}
            y1={y}
            x2={noteX + lineWidth / 2}
            y2={y}
            stroke="#000"
            strokeWidth="1.5"
          />
        );
      }
    }

    return lines;
  };

  return (
    <svg width={width} height={height} style={styles.svg}>
      {/* Clave de Sol */}
      <text
        x={staffLeft - 50}
        y={staffTop + staffLineSpacing * 2 + 5}
        fontSize="60"
        fontFamily="serif"
        fill="#000"
      >
        𝄞
      </text>

      {/* Las 5 líneas del pentagrama */}
      {[0, 1, 2, 3, 4].map((lineIndex) => (
        <line
          key={`staff-line-${lineIndex}`}
          x1={staffLeft}
          y1={staffTop + lineIndex * staffLineSpacing}
          x2={staffRight}
          y2={staffTop + lineIndex * staffLineSpacing}
          stroke="#000"
          strokeWidth="1.5"
        />
      ))}

      {/* Barra inicial del pentagrama */}
      <line
        x1={staffLeft}
        y1={staffTop}
        x2={staffLeft}
        y2={staffTop + staffLineSpacing * 4}
        stroke="#000"
        strokeWidth="2"
      />

      {/* Renderizar la nota si existe */}
      {note && notePositions[note] !== undefined && (
        <>
          {/* Líneas adicionales si son necesarias */}
          {renderLedgerLines(note)}

          {/* Sostenido si la nota lo tiene */}
          {hasSharp(note) && (
            <text
              x={width / 2 - 25}
              y={getNoteY(note) + 8}
              fontSize="32"
              fontFamily="serif"
              fill="#000"
            >
              ♯
            </text>
          )}

          {/* Cabeza de la nota (redonda) */}
          <ellipse
            cx={width / 2}
            cy={getNoteY(note)}
            rx="10"
            ry="8"
            fill="#2196F3"
            stroke="#1565C0"
            strokeWidth="2"
          />

          {/* Plica de la nota (hacia arriba o abajo según la posición) */}
          {(() => {
            const position = notePositions[note];
            const stemUp = position >= 4; // Plica hacia arriba si está en la mitad inferior
            const stemHeight = 35;
            const stemX = stemUp ? width / 2 + 9 : width / 2 - 9;
            const stemY1 = getNoteY(note);
            const stemY2 = stemUp ? stemY1 - stemHeight : stemY1 + stemHeight;

            return (
              <line
                x1={stemX}
                y1={stemY1}
                x2={stemX}
                y2={stemY2}
                stroke="#1565C0"
                strokeWidth="2"
              />
            );
          })()}
        </>
      )}

      {/* Mensaje si no hay nota */}
      {!note && (
        <text
          x={width / 2}
          y={staffTop + staffLineSpacing * 2}
          fontSize="16"
          fontFamily="Arial, sans-serif"
          fill="#999"
          textAnchor="middle"
        >
          Esperando nota...
        </text>
      )}
    </svg>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  svg: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    display: 'block',
    margin: '0 auto',
  },
};

export default MusicalStaff;
