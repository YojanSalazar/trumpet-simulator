import { Song } from '../types';

/**
 * SongLoader
 * Funciones auxiliares para cargar canciones desde JSON o MusicXML.
 * Actualmente implementa carga desde JSON local (resolve import).
 */
export const SongLoader = {
  async loadFromJson(path: string): Promise<Song> {
    // path debe ser relativo a `src/` o un import path válido
    try {
      const mod = await import(/* @vite-ignore */ path);
      const data = mod.default ?? mod;
      return data as Song;
    } catch (err) {
      console.error('[SongLoader] Error cargando canción:', err);
      throw err;
    }
  },

  // Stub para futuro: parseo de MusicXML a Song
  async loadFromMusicXml(_xmlText: string): Promise<Song> {
    throw new Error('loadFromMusicXml no implementado');
  }
};

export default SongLoader;
