/**
 * Componente SheetMusic
 * Renderiza partituras musicales usando OpenSheetMusicDisplay
 * Muestra la partitura completa y resalta la nota actual
 */

import React, { useEffect, useRef, useState } from 'react';
import { SheetMusicProps } from '../types';

// Importación de OpenSheetMusicDisplay (OSMD)
// En un proyecto real, se instalaría con: npm install opensheetmusicdisplay
// import { OpenSheetMusicDisplay } from 'opensheetmusicdisplay';

const SheetMusic: React.FC<SheetMusicProps> = ({ 
  musicXmlUrl, 
  currentNoteIndex 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const osmdRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Inicializa OSMD cuando se monta el componente o cambia la URL
   */
  useEffect(() => {
  // If there's no container yet we can't initialize OSMD.
  if (!containerRef.current) return;

  // If no musicXmlUrl provided we don't try to load OSMD, but we still keep the container
  if (!musicXmlUrl) return;

    const loadSheet = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // TODO: Descomentar cuando OSMD esté instalado
        /*
        // Limpiar instancia anterior si existe
        if (osmdRef.current) {
          osmdRef.current.clear();
        }

        // Crear nueva instancia de OSMD
        osmdRef.current = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          backend: 'svg',
          drawTitle: true,
          drawComposer: true,
          drawCredits: false,
          defaultColorMusic: '#000000',
        });

        // Cargar el archivo MusicXML
        await osmdRef.current.load(musicXmlUrl);
        
        // Renderizar la partitura
        await osmdRef.current.render();
        */

  // Si OSMD no está instalado, simplemente dejamos el placeholder y logueamos.
  // Cuando se instale `opensheetmusicdisplay` descomenta la lógica arriba.
  console.log(`[SheetMusic] Cargando partitura: ${musicXmlUrl}`);

  setIsLoading(false);
      } catch (err) {
        console.error('[SheetMusic] Error al cargar partitura:', err);
        setError('No se pudo cargar la partitura');
        setIsLoading(false);
      }
    };

    loadSheet();

    // Cleanup al desmontar
    return () => {
      if (osmdRef.current) {
        // osmdRef.current.clear();
        osmdRef.current = null;
      }
    };
  }, [musicXmlUrl]);

  /**
   * Resalta la nota actual en la partitura
   */
  useEffect(() => {
  // Si no hay instancia de OSMD no intentamos resaltar.
  if (!osmdRef.current) return;

  if (currentNoteIndex == null || currentNoteIndex < 0) return;

    try {
      // TODO: Implementar resaltado con OSMD
      /*
      // Obtener el cursor de OSMD
      const cursor = osmdRef.current.cursor;
      
      // Mover el cursor a la nota actual
      cursor.reset();
      for (let i = 0; i < currentNoteIndex; i++) {
        cursor.next();
      }
      
      // Resaltar la nota
      cursor.show();
      */

      console.log(`[SheetMusic] Resaltando nota índice: ${currentNoteIndex}`);
    } catch (err) {
      console.error('[SheetMusic] Error al resaltar nota:', err);
    }
  }, [currentNoteIndex]);

  /**
   * Renderiza placeholder cuando OSMD no está disponible
   */
  const renderPlaceholder = () => (
    <div style={styles.placeholder}>
      <div style={styles.placeholderIcon}>🎼</div>
      <h3 style={styles.placeholderTitle}>Partitura Musical</h3>
      <p style={styles.placeholderText}>
        {musicXmlUrl
          ? 'La partitura se mostrará aquí cuando OpenSheetMusicDisplay esté instalado.'
          : 'No hay partitura cargada.'}
      </p>
      {musicXmlUrl && (
        <div style={styles.urlInfo}>
          <p style={styles.urlLabel}>Archivo:</p>
          <code style={styles.urlValue}>{musicXmlUrl}</code>
        </div>
      )}
      <div style={styles.installInfo}>
        <p style={styles.installText}>Para instalar OpenSheetMusicDisplay:</p>
        <code style={styles.installCommand}>npm install opensheetmusicdisplay</code>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Partitura</h2>
        {currentNoteIndex >= 0 && (
          <div style={styles.currentNoteBadge}>
            Nota #{currentNoteIndex + 1}
          </div>
        )}
      </div>

      {error && (
        <div style={styles.errorMessage}>
          <span style={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {isLoading && (
        <div style={styles.loadingMessage}>
          <div style={styles.spinner}></div>
          Cargando partitura...
        </div>
      )}

      {/* Contenedor para OSMD (si está presente) o placeholder */}
      <div ref={containerRef} style={styles.sheetContainer}>
        {/* Siempre mostramos el placeholder cuando no hay OSMD o no hay musicXmlUrl */}
        {(!musicXmlUrl || !osmdRef.current) && renderPlaceholder()}
      </div>

      {/* Controles adicionales (para futuras extensiones) */}
      <div style={styles.controls}>
        <button style={styles.controlButton} disabled>
          ⏮ Anterior
        </button>
        <button style={styles.controlButton} disabled>
          ⏭ Siguiente
        </button>
        <button style={styles.controlButton} disabled>
          🔍 Zoom +
        </button>
        <button style={styles.controlButton} disabled>
          🔍 Zoom -
        </button>
      </div>
    </div>
  );
};

//
// Estilos inline para el componente SheetMusic
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: '18px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    minHeight: '220px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12px',
  },
  title: { margin: 0, fontSize: '16px', color: '#333' },
  currentNoteBadge: {
    backgroundColor: '#1976D2',
    color: '#fff',
    padding: '6px 10px',
    borderRadius: '8px',
    fontSize: '13px',
  },
  errorMessage: {
    backgroundColor: '#FFF3CD',
    color: '#856404',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '10px',
  },
  errorIcon: { marginRight: '8px' },
  loadingMessage: { color: '#666', marginBottom: '10px' },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid #ccc',
    borderTop: '2px solid #1976D2',
    borderRadius: '50%',
    marginRight: '8px',
  },
  sheetContainer: {
    minHeight: '140px',
    border: '1px dashed #e0e0e0',
    borderRadius: '8px',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fafafa',
  },
  controls: { display: 'flex', gap: '8px', marginTop: '12px' },
  controlButton: {
    padding: '8px 12px',
    backgroundColor: '#eee',
    border: 'none',
    borderRadius: '6px',
    cursor: 'not-allowed',
  },
  placeholder: { textAlign: 'center', color: '#666' },
  placeholderIcon: { fontSize: '28px', marginBottom: '8px' },
  placeholderTitle: { margin: '4px 0', fontSize: '16px' },
  placeholderText: { margin: '6px 0 8px 0', fontSize: '13px' },
  urlInfo: { marginTop: '8px' },
  urlLabel: { fontSize: '12px', color: '#444', margin: 0 },
  urlValue: { display: 'block', fontSize: '12px', color: '#0b5fff' },
  installInfo: { marginTop: '10px', fontSize: '12px' },
  installText: { margin: 0 },
  installCommand: {
    display: 'inline-block',
    marginTop: '6px',
    padding: '6px 8px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    fontSize: '12px',
  },
};

export default SheetMusic;