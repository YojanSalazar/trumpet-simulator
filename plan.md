# Plan de Desarrollo — Trumpet Simulator

> Documento de trabajo para que una IA (o cualquier dev) implemente, en orden, las dos
> funcionalidades pedidas sobre el repo `YojanSalazar/trumpet-simulator`.

---

## 0. Resumen del análisis del repositorio

**Stack:** Vite + React 19 + TypeScript, empaquetado como app de escritorio con **Tauri 2**
(`src-tauri/`). No hay backend: todo el estado vive en `App.tsx` y los datos musicales son
archivos `.json` importados directamente (no se hace `fetch`).

**Estructura relevante:**

```
src/
  App.tsx                 <- componente raíz, TODO el estado global vive aquí
  types/index.ts          <- todas las interfaces/tipos compartidos
  data/
    fingering_map.json    <- digitación cromática de trompeta (Do4..Si5), {midi, valvulas:[n,n,n]}
    scales.json            <- escalas mayores de trompeta, agrupadas en "sostenidos" y "bemoles"
    song.json              <- canción de ejemplo
  components/
    ValveButtons.tsx       <- 3 botones de válvula, teclado (1/2/3 y 8/9/0), hints, wrongValves
    NoteDisplay.tsx        <- pentagrama + diagrama de digitación (YA es agnóstico al Nº de válvulas)
    MusicalStaff.tsx       <- dibuja el pentagrama según la nota
    ScoreBoard.tsx / StatsBar.tsx
    SheetMusic.tsx
  hooks/
    usePracticeMode.ts     <- máquina de estados de la práctica (nota actual, digitación esperada...)
    useAudioEngine.ts
  services/
    FingeringChecker.ts    <- compara digitación esperada vs presionada
    SongLoader.ts
```

**Hallazgo importante (léelo antes de empezar):** el **modo de escalas ya está parcialmente
implementado**. En `App.tsx` ya existen:

- `practiceMode: 'random' | 'scale'`
- `selectedScaleType: 'sostenidos' | 'bemoles'`
- `selectedScale`, `scalesData` (importado de `src/data/scales.json`)
- Un selector en la UI (tipo de escala + escala) y la lógica en `loadDefaultSong()` que arma
  los eventos de la canción **en orden** a partir de `scalesData[selectedScaleType][selectedScale].notas`.

Lo que **falta** en `scales.json` es completar el set de escalas (hoy solo hay 5 con
sostenidos y 5 con bemoles, ver punto 1.1) y pulir un par de detalles de UI/estado. Es decir:
la Tarea 1 no es "crear desde cero", es **auditar, completar y verificar** lo existente.

**Limitación estructural para la Tarea 2:** todo el código asume **exactamente 3 válvulas**:

- `type ValveCombination = [number, number, number]` (tupla fija) en `types/index.ts`.
- Literales `[0, 0, 0]` hardcodeados en `App.tsx` (líneas de inicialización y reset).
- `ValveButtons.tsx` itera `[0, 1, 2]` a mano y tiene el keymap de teclado fijo a 3 teclas.
- `FingeringChecker.ts` compara `expected[0] === input[0] && expected[1] === input[1] && expected[2] === input[2]` a mano.

`NoteDisplay.tsx` **sí** es agnóstico (usa `fingering.map(...)`), así que no necesita cambios.

Esto significa que para soportar la trompa (4 rotores) **hay que generalizar el modelo de
datos antes de poder añadir el segundo instrumento**, no basta con copiar el JSON.

---

## 1. Tarea 1 — Completar el sistema de escalas

### 1.1 Auditar `src/data/scales.json`

Estado actual:

```json
{
  "sostenidos": { "SolMayor": {...}, "ReMayor": {...}, "LaMayor": {...}, "MiMayor": {...}, "SiMayor": {...} },
  "bemoles":    { "FaMayor": {...}, "SibMayor": {...}, "MibMayor": {...}, "LabMayor": {...}, "RebMayor": {...} }
}
```

Cada escala tiene esta forma (ya correcta, mantenerla como estándar):

```json
"SolMayor": {
  "nombre": "Sol Mayor",
  "notas": {
    "Sol4": { "midi": 67, "valvulas": [0,0,0] },
    "La4":  { "midi": 69, "valvulas": [1,1,0] },
    "...":  { }
  }
}
```

Faltan, para completar el círculo de quintas con las 12 tonalidades cromáticas usadas
habitualmente en método de trompeta:

- **Sostenidos**: falta `Fa#Mayor` (7 sostenidos) y `Do#Mayor` (7 sostenidos, enarmónico de Reb).
- **Bemoles**: falta `SolbMayor` (enarmónico de Fa#) y considerar si se agrega `DoMayor` (0
  alteraciones) como categoría neutra o dentro de uno de los dos grupos (recomendación:
  agregar una tercera clave `"naturales": { "DoMayor": {...} }` en el JSON para no forzar
  Do Mayor dentro de "sostenidos" o "bemoles").

Para cada escala nueva, generar las notas **en orden ascendente (8 notas, tónica a tónica)**
usando el mismo criterio que ya usan las existentes, y sacar `midi` y `valvulas` directamente
de `src/data/fingering_map.json` (ya contiene enarmónicos, p. ej. `Fa#4`/`Solb4` con el mismo
midi/valvulas) para garantizar consistencia entre archivos.

### 1.2 Ajustes menores de código detectados durante la auditoría

- En `App.tsx`, dentro del bloque de UI de "Notas" (`<input type="number" id="noteCount" ... max={newLocal} .../>`)
  hay una variable `newLocal` que **no está definida en ningún lado del componente** (bug
  preexistente, probablemente un residuo de un refactor). Reemplazar por el límite real
  (parece que el límite deseado es `50`, según el `Math.min(50, ...)` de la misma función).
- Verificar que al cambiar `selectedScaleType` en el `<select>`, si el nuevo tipo tiene 0
  escalas (no debería pasar tras 1.1, pero cuidar el caso) no rompa `Object.keys(scalesData[newType])[0]`.
- El texto fijo `(8 notas)` que se muestra cuando `practiceMode === 'scale'` debe seguir
  siendo dinámico si en el futuro alguna escala no tuviera 8 notas — hoy es correcto porque
  todas las escalas mayores tienen 8, pero usar `Object.keys(scaleData.notas).length` en vez
  de hardcodear `8` es más robusto.

### 1.3 (Opcional, evaluar con el usuario) Escalas menores

El pedido original solo habla de "escalas" con sostenidos/bemoles, que es exactamente el
patrón de las escalas mayores ya implementadas. **No agregar escalas menores** salvo que se
pida explícitamente; si se pidiera, se replicaría la misma estructura con una clave superior
`"menores": { "sostenidos": {...}, "bemoles": {...} }` para no romper el esquema actual.

### 1.4 Checklist de la Tarea 1

- [ ] `scales.json` contiene las 7 tonalidades con sostenidos + 7 con bemoles (o el criterio
      que se defina en 1.1), todas con 8 notas en orden y midi/valvulas correctos.
- [ ] El selector de "Tipo de escala" y "Escala" en `App.tsx` lista todas las nuevas escalas
      sin tocar el resto de la UI.
- [ ] Corregido el bug de `newLocal`.
- [ ] Probado manualmente: elegir cada escala nueva y confirmar que las notas suenan/se
      muestran en el orden correcto (tónica → tónica).

---

## 2. Tarea 2 — Soporte para Corno Francés (Trompa)

La trompa **no es un simulador aparte**: debe vivir en la misma app, con un selector de
instrumento, reutilizando toda la lógica de práctica/puntaje/escalas ya existente. El punto
clave es que la trompa usa **4 rotores** en vez de 3 pistones, así que primero hay que
**generalizar el modelo de datos a "N palancas"** y luego construir el segundo set de datos.

Por pedido explícito del usuario: **solo dejar preparada la estructura y el sistema**; los
valores reales de digitación de la trompa (qué rotores corresponden a cada nota) los rellena
el usuario después. Es decir, el JSON de digitación de trompa se entrega con la lista de
notas y `"valvulas": [0,0,0,0]` (o `null`) como placeholder, no con datos inventados.

### 2.1 Generalizar el modelo de tipos (`src/types/index.ts`)

Cambiar la tupla fija por un array de longitud variable, y agregar un tipo de instrumento:

```ts
// Antes: export type ValveCombination = [number, number, number];
export type ValveCombination = number[]; // longitud = nº de válvulas/rotores del instrumento

export type InstrumentId = 'trompeta' | 'trompa';

export interface InstrumentConfig {
  id: InstrumentId;
  nombre: string;          // "Trompeta" | "Corno Francés (Trompa)"
  valveCount: number;      // 3 | 4
  unitLabel: string;       // "Válvula" | "Rotor"
  fingeringMapFile: FingeringMap;  // import correspondiente
  scalesFile: any;                 // import correspondiente
  keyBindings: { main: string; alt: string }[]; // una entrada por válvula/rotor
}
```

`FingeringInfo`, `FingeringMap`, `PracticeState`, `PlayerStats`, `FingeringCheckResult`,
`ValveButtonsProps`, `NoteDisplayProps` no necesitan cambios de forma (ya usan
`ValveCombination`, que ahora es más flexible). Solo hay que revisar que ningún sitio siga
asumiendo longitud 3 por costumbre (ver 2.6).

### 2.2 Nuevo archivo `src/data/horn_fingering_map.json` (estructura, sin datos reales)

Mismo esquema que `fingering_map.json`, pero con arrays de **4** posiciones de rotor. Dejar
todas las notas del rango típico de trompa (más grave que la trompeta) con placeholder
`[0,0,0,0]` para que el usuario los reemplace:

```json
{
  "Fa2": { "midi": 41, "valvulas": [0, 0, 0, 0] },
  "Fa#2": { "midi": 42, "valvulas": [0, 0, 0, 0] },
  "Solb2": { "midi": 42, "valvulas": [0, 0, 0, 0] },
  "...": "... continuar cromáticamente hasta cubrir el rango deseado (p. ej. Fa2 a Fa5) ..."
}
```

Notas de implementación:
- Mantener la misma convención de nombres en español y enarmónicos duplicados (sostenido +
  bemol apuntando al mismo `midi`) que ya usa `fingering_map.json`, para que
  `noteNameToSpanish()` en `NoteDisplay.tsx` siga funcionando sin cambios.
- Generar el archivo con un pequeño script (o a mano) que recorra el rango cromático deseado
  y solo complete `midi` (calculable) dejando `valvulas` en placeholder — así el usuario solo
  tiene que rellenar los arrays de rotores, no reescribir el archivo entero.
- Documentar en un comentario (o en este plan) qué significa cada posición del array de 4,
  ya que en trompa **el orden y el efecto de cada rotor lo define el usuario** (p. ej. rotor 4
  = cambio Fa/Sib en trompas dobles); dejarlo abierto y no asumido en el código.

### 2.3 Nuevo archivo `src/data/horn_scales.json` (estructura, sin datos reales)

Mismo esquema que `scales.json` (mismas claves `sostenidos`/`bemoles`, mismos nombres de
tonalidad para reusar el selector de escalas tal cual), pero como placeholder-esqueleto:

```json
{
  "sostenidos": {
    "SolMayor": { "nombre": "Sol Mayor", "notas": {} },
    "ReMayor":  { "nombre": "Re Mayor",  "notas": {} }
  },
  "bemoles": {
    "FaMayor": { "nombre": "Fa Mayor", "notas": {} }
  }
}
```

El usuario rellenará `"notas"` con las mismas notas/orden que en `scales.json` de trompeta
pero apuntando a las digitaciones de `horn_fingering_map.json`. Se puede dejar un script de
utilidad (ver 2.7) para que, una vez completado `horn_fingering_map.json`, se auto-generen los
`"notas"` de cada escala a partir de los nombres de nota (mismo criterio que 1.1).

### 2.4 Generalizar `ValveButtons.tsx` para soportar N botones

En vez de hardcodear `[0, 1, 2]`, título y keymap:

- Nuevos props: `valveCount: number`, `title: string` (ya no fijo "Válvulas de Trompeta"),
  `unitLabel: string` (para el texto `"Válvula ${i+1}"` / `"Rotor ${i+1}"`), y
  `keyBindings: { main: string; alt: string }[]`.
- Reemplazar `[0, 1, 2].map(...)` por `Array.from({ length: valveCount })`.
- El `keyMap` del listener de teclado se construye dinámicamente a partir de `keyBindings`
  en vez de estar hardcodeado a `1/2/3/8/9/0`.
- Mantener el comportamiento actual de trompeta pasando como default:
  `keyBindings = [{main:'1',alt:'8'}, {main:'2',alt:'9'}, {main:'3',alt:'0'}]`.
- Para trompa (4 rotores), propuesta de mapeo por defecto (ajustable):
  `[{main:'1',alt:'q'}, {main:'2',alt:'w'}, {main:'3',alt:'e'}, {main:'4',alt:'r'}]`.
- El texto de ayuda (`"Usa 8, 9, 0 para las válvulas..."`) debe generarse dinámicamente a
  partir de `keyBindings`, no quedar fijo en el JSX.

> Nota: no hace falta renombrar el archivo/componente. Puede seguir llamándose
> `ValveButtons.tsx` y usarse para ambos instrumentos, ya que a nivel de código es "N botones
> de digitación", solo cambia la etiqueta visual.

### 2.5 Generalizar `FingeringChecker.ts`

Reemplazar la comparación manual `expected[0]===input[0] && ...` por una comparación de
arrays por longitud (`expected.length === input.length && expected.every((v,i) => v === input[i])`),
para que funcione igual con 3 o con 4 posiciones.

### 2.6 Cambios en `App.tsx`

- Nuevo estado: `const [instrument, setInstrument] = useState<InstrumentId>('trompeta');`
- Un selector de instrumento en la UI (radio buttons o `<select>`), similar al de "Modo de
  práctica", ubicado arriba de todo el panel de control.
- Reemplazar los imports estáticos únicos por un mapa de configuración (usar el
  `InstrumentConfig` de 2.1):

  ```ts
  import fingeringMapData from './data/fingering_map.json';
  import scalesDataImport from './data/scales.json';
  import hornFingeringMapData from './data/horn_fingering_map.json';
  import hornScalesData from './data/horn_scales.json';

  const INSTRUMENTS: Record<InstrumentId, InstrumentConfig> = {
    trompeta: { id: 'trompeta', nombre: 'Trompeta', valveCount: 3, unitLabel: 'Válvula',
                fingeringMapFile: fingeringMapData, scalesFile: scalesDataImport,
                keyBindings: [...] },
    trompa:   { id: 'trompa', nombre: 'Corno Francés (Trompa)', valveCount: 4, unitLabel: 'Rotor',
                fingeringMapFile: hornFingeringMapData, scalesFile: hornScalesData,
                keyBindings: [...] },
  };
  ```

- `loadFingeringMap()` y `loadScales()` deben leer de `INSTRUMENTS[instrument]` en vez de la
  constante fija.
- Todos los `useState<ValveCombination>([0, 0, 0])` y los `setPressedValves([0, 0, 0])`
  (reset de válvulas) deben pasar a `Array(INSTRUMENTS[instrument].valveCount).fill(0)`.
- El `useEffect` de carga inicial debe re-disparar `loadFingeringMap`/`loadScales`/
  `loadDefaultSong` también cuando cambie `instrument` (agregarlo al array de dependencias),
  y al cambiar de instrumento resetear `pressedValves`, `wrongValves`, `practiceState` y
  `selectedScale`/`selectedScaleType` a un valor válido para el nuevo instrumento (evitar
  quedar con una escala seleccionada que no existe en `horn_scales.json` todavía vacío).
- Pasar `valveCount`, `title`, `unitLabel` y `keyBindings` a `<ValveButtons />` según el
  instrumento activo.
- El array `availableNotes` usado en el modo aleatorio (hoy hardcodeado a las notas de
  trompeta, línea ~111 de `App.tsx`) debe pasar a `Object.keys(INSTRUMENTS[instrument].fingeringMapFile)`
  para que el modo aleatorio también funcione con la trompa en cuanto el usuario cargue datos.
- `playTone()` ya usa `fingeringMap[pitch].midi` para calcular la frecuencia — no necesita
  cambios, solo asegurarse de que lea del `fingeringMap` del instrumento activo (que ya se
  resuelve solo si se aplican los cambios anteriores).

### 2.7 (Opcional, utilidad para cuando el usuario cargue los datos reales)

Dejar documentado (no necesariamente implementado) un pequeño script de Node/Python que:
1. Lea `horn_fingering_map.json` ya completado por el usuario.
2. Tome la lista de notas de cada escala definida en `scales.json` (trompeta) como plantilla
   de nombres/orden.
3. Genere automáticamente el bloque `"notas"` de `horn_scales.json` mapeando cada nombre de
   nota a su entrada en `horn_fingering_map.json`.

Esto evita que el usuario tenga que escribir 8 notas × 12 escalas a mano para la trompa.

### 2.8 Fuera de alcance explícito (no tocar ahora)

- Afinación real transportada de la trompa (en trompa real, la partitura suena una quinta
  más grave que lo escrito). Para este simulador, igual que se hizo con la trompeta, se
  trabaja en **tono real/concierto** — mantener esa misma convención para no complicar
  `MusicalStaff.tsx`. Dejarlo anotado como decisión de diseño, no como bug.
- Sonido/timbre distinto para la trompa en `useAudioEngine.ts` — se puede reusar el mismo
  motor (oscilador) por ahora; si se quiere un timbre distinto es una mejora aparte.

### 2.9 Checklist de la Tarea 2

- [ ] `ValveCombination` generalizado a `number[]`, sin romper la compilación de TypeScript
      en ningún archivo existente.
- [ ] `src/data/horn_fingering_map.json` creado con el rango de notas de trompa y
      `valvulas` en placeholder (4 posiciones), sin inventar digitaciones reales.
- [ ] `src/data/horn_scales.json` creado con el mismo esquema de `scales.json`, vacío/placeholder.
- [ ] `ValveButtons.tsx` acepta `valveCount`, `title`, `unitLabel`, `keyBindings` como props,
      y la trompeta sigue funcionando exactamente igual que antes (props por defecto).
- [ ] `FingeringChecker.ts` compara arrays de cualquier longitud.
- [ ] `App.tsx` tiene selector de instrumento, carga los JSON correctos según el instrumento
      activo, y resetea el estado de práctica al cambiar de instrumento.
- [ ] Probado manualmente: cambiar a "Trompa", ver 4 botones de rotor, teclado 1/2/3/4
      (o el mapeo definido) responde, y no revienta aunque los datos aún sean placeholders.
- [ ] Volver a "Trompeta" y confirmar que el comportamiento no cambió respecto al estado
      original del repo.

---

## 3. Orden sugerido de implementación

1. **Tarea 1 completa primero** (es aislada, no toca tipos ni componentes compartidos, bajo
   riesgo de romper algo).
2. Generalizar tipos (`2.1`) y servicios (`2.5`) — cambios pequeños y mecánicos.
3. Generalizar `ValveButtons.tsx` (`2.4`) verificando que la trompeta siga idéntica con los
   props por defecto.
4. Crear los JSON placeholder de trompa (`2.2`, `2.3`).
5. Cablear todo en `App.tsx` (`2.6`): selector de instrumento, mapa `INSTRUMENTS`, reemplazo
   de literales `[0,0,0]`, reset de estado al cambiar instrumento.
6. Probar ambos instrumentos, ambos modos (aleatorio/escalas), y las escalas nuevas de la
   Tarea 1.
7. (Opcional) dejar el script de generación de `horn_scales.json` documentado en `2.7` para
   cuando el usuario complete `horn_fingering_map.json`.

## 4. Riesgos / cosas a confirmar con el usuario antes de tocar código

- ¿El rango de notas de la trompa a cubrir en `horn_fingering_map.json` (sugerido Fa2–Fa5,
  ajustar según lo que el usuario quiera practicar)?
- ¿Nombre visible del instrumento: "Corno Francés" o "Trompa"? (el plan usa ambos como
  sinónimo, definir uno para la UI).
- ¿Se agrega una categoría `"naturales"` en `scales.json`/`horn_scales.json` para Do Mayor, o
  se mete dentro de "sostenidos" con 0 alteraciones? (recomendado: categoría aparte).
- Mapeo de teclas definitivo para los 4 rotores de trompa (propuesta en `2.4`, pero es libre).
