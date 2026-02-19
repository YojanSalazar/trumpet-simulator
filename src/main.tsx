/**
 * Punto de entrada principal de la aplicación React
 * Inicializa React y monta el componente App en el DOM
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './App.css'; // Estilos globales

/**
 * Estilos globales base para resetear y configurar la aplicación
 * Este contenido debería estar en index.css
 */
const globalStyles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: #f0f2f5;
  }

  code {
    font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
      monospace;
  }

  button {
    font-family: inherit;
  }

  button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  button:active:not(:disabled) {
    transform: translateY(0);
  }

  button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  kbd {
    padding: 2px 6px;
    background-color: #f5f5f5;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-family: monospace;
    font-size: 0.9em;
  }

  /* Animación de spinner para loading states */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Prevenir selección de texto en elementos de UI */
  button,
  .no-select {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
`;

/**
 * Inyecta los estilos globales en el documento
 * Esto es una alternativa temporal hasta crear el archivo index.css
 */
const injectGlobalStyles = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
};

/**
 * Configuración inicial de la aplicación
 */
const initializeApp = () => {
  // Inyectar estilos globales
  injectGlobalStyles();

  // Prevenir el menú contextual en producción (opcional)
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault();
    });
  }

  // Log de inicialización
  console.log('[Main] Aplicación inicializada');
  console.log('[Main] Modo:', import.meta.env.MODE);
  console.log('[Main] Base URL:', import.meta.env.BASE_URL);

  // Verificar si estamos en Tauri (safe check para evitar errores de tipado)
  const isTauri = typeof window !== 'undefined' && (window as any).__TAURI__;
  if (isTauri) {
    console.log('[Main] Ejecutándose en Tauri');
  } else {
    console.log('[Main] Ejecutándose en navegador web');
  }
};

/**
 * Manejo de errores no capturados
 */
window.addEventListener('error', (event) => {
  console.error('[Main] Error no capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('[Main] Promesa rechazada no manejada:', event.reason);
});

/**
 * Montaje de la aplicación React
 */
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'No se encontró el elemento root. Asegúrate de que index.html contiene <div id="root"></div>'
  );
}

// Inicializar configuración
initializeApp();

// Crear root de React 18
const root = ReactDOM.createRoot(rootElement);

// Renderizar la aplicación
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * Hot Module Replacement (HMR) para desarrollo
 * Permite actualizar módulos sin recargar toda la página
 */
if (import.meta.hot) {
  import.meta.hot.accept();
  console.log('[Main] HMR habilitado');
}

/**
 * Cleanup cuando la aplicación se desmonta
 */
window.addEventListener('beforeunload', () => {
  console.log('[Main] Aplicación cerrándose');
});