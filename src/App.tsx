/**
 * Componente principal de la aplicación
 * Integra todos los componentes y gestiona el estado global del simulador
 */

import React, { useState, useEffect, useCallback } from 'react';
import ValveButtons from './components/ValveButtons';
import NoteDisplay from './components/NoteDisplay';
import StatsBar from './components/StatsBar';
import {
    ValveCombination,
    PlayerStats,
    PracticeState,
    Song,
    FingeringMap
} from './types';

const App: React.FC = () => {
    // ===== ESTADO PRINCIPAL =====
    const [pressedValves, setPressedValves] = useState<ValveCombination>([0, 0, 0]);
    const [stats, setStats] = useState<PlayerStats>({
        correctCount: 0,
        incorrectCount: 0,
        averageReactionTime: 0,
        totalNotes: 0,
    });

    const [practiceState, setPracticeState] = useState<PracticeState>({
        currentEventIndex: -1,
        currentNote: null,
        expectedFingering: null,
        isPlaying: false,
        startTime: null,
    });

    const [timeRemaining, setTimeRemaining] = useState<number>(3000);
    const [noteDurationMs, setNoteDurationMs] = useState<number>(3500);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [fingeringMap, setFingeringMap] = useState<FingeringMap | null>(null);
    const [noteCount, setNoteCount] = useState<number>(5);
    const [showHints, setShowHints] = useState<boolean>(true);
    const [practiceMode, setPracticeMode] = useState<'random' | 'scale'>('random');
    const [scalesData, setScalesData] = useState<any>(null);
    const [selectedScaleType, setSelectedScaleType] = useState<'sostenidos' | 'bemoles'>('sostenidos');
    const [selectedScale, setSelectedScale] = useState<string>('SolMayor');

    // ===== CARGA INICIAL DE DATOS =====
    useEffect(() => {
        loadFingeringMap();
        loadScales();
        loadDefaultSong();
    }, [noteCount, noteDurationMs, practiceMode, selectedScale, selectedScaleType]);

    /**
     * Carga el mapa de digitaciones desde JSON
     */
    const loadFingeringMap = async () => {
        try {
            const response = await fetch('/src/data/fingering_map.json');
            const data = await response.json();
            setFingeringMap(data);
            console.log('[App] Mapa de digitaciones cargado');
        } catch (error) {
            console.error('[App] Error al cargar mapa de digitaciones:', error);
        }
    };

    /**
     * Carga las escalas mayores desde JSON
     */
    const loadScales = async () => {
        try {
            const response = await fetch('/src/data/scales.json');
            const data = await response.json();
            setScalesData(data);
            console.log('[App] Escalas cargadas');
        } catch (error) {
            console.error('[App] Error al cargar escalas:', error);
        }
    };

    /**
     * Carga una canción de ejemplo
     */
    const loadDefaultSong = async () => {
        try {
            let events: Array<{ start_ms: number; pitch: string; dur_ms: number }>;
            let title: string;

            if (practiceMode === 'scale' && scalesData) {
                // Modo escalas: usar todas las notas de la escala EN ORDEN
                const scaleData = scalesData[selectedScaleType][selectedScale];
                if (scaleData && scaleData.notas) {
                    const scaleNotes = Object.keys(scaleData.notas);
                    // Crear eventos con las notas en orden (todas las notas de la escala)
                    events = scaleNotes.map((note, index) => ({
                        start_ms: index * noteDurationMs,
                        pitch: note,
                        dur_ms: noteDurationMs
                    }));
                    title = `Escala de ${scaleData.nombre}`;
                } else {
                    console.error('[App] Escala no encontrada');
                    return;
                }
            } else {
                // Modo aleatorio: usar todas las notas disponibles
                const availableNotes = [
                    "Do4", "Do#4", "Re4", "Re#4", "Mi4", "Fa4", "Fa#4", "Sol4", "Sol#4", "La4", "La#4", "Si4",
                    "Do5", "Do#5", "Re5", "Re#5", "Mi5", "Fa5", "Fa#5", "Sol5", "Sol#5", "La5", "La#5", "Si5"
                ];
                title = `Práctica de ${noteCount} notas`;

                // Crear eventos de forma aleatoria
                events = Array(noteCount).fill(null).map((_, index) => {
                    const randomNote = availableNotes[Math.floor(Math.random() * availableNotes.length)];
                    return {
                        start_ms: index * noteDurationMs,
                        pitch: randomNote,
                        dur_ms: noteDurationMs
                    };
                });
            }



            const mockSong: Song = {
                title: title,
                tempo: 120,
                events: events,
            };

            setCurrentSong(mockSong);
            console.log('[App] Canción cargada:', mockSong.title);
        } catch (error) {
            console.error('[App] Error al cargar canción:', error);
        }
    };

    // ===== CONTROL DE VÁLVULAS =====
    const handleValvePress = useCallback((valveIndex: number) => {
        setPressedValves(prev => {
            const newValves: ValveCombination = [...prev] as ValveCombination;
            newValves[valveIndex] = newValves[valveIndex] === 1 ? 0 : 1;
            return newValves;
        });
    }, []);

    // ===== AUDIO =====
    const playTone = useCallback((pitch: string) => {
        if (!fingeringMap || !fingeringMap[pitch]) return;

        const midi = fingeringMap[pitch].midi;
        const frequency = 440 * Math.pow(2, (midi - 69) / 12);

        try {
            const audioContext = new AudioContext();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);

            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.2, audioContext.currentTime + 0.15);
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime + 0.4);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.6);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.6);

            console.log(`[Audio] Reproduciendo ${pitch} (${frequency.toFixed(2)} Hz)`);
        } catch (error) {
            console.error('[Audio] Error al reproducir tono:', error);
        }
    }, [fingeringMap]);

    const handleValveSet = useCallback((valveIndex: number, value: 0 | 1) => {
        if (!practiceState.isPlaying) return setPressedValves(prev => {
            const newValves = [...prev] as ValveCombination;
            newValves[valveIndex] = value;
            return newValves;
        });

        setPressedValves(prev => {
            const newValves = [...prev] as ValveCombination;
            newValves[valveIndex] = value;

            if (practiceState.expectedFingering && practiceState.currentNote && fingeringMap) {
                const correctFingering = fingeringMap[practiceState.currentNote].valvulas;
                const isOpenNote = correctFingering.every(v => v === 0);

                let isCorrect = isOpenNote ?
                    newValves.every(v => v === 0) :
                    JSON.stringify(newValves) === JSON.stringify(correctFingering);

                const shouldCheck = isOpenNote ?
                    (newValves.every(v => v === 0) || correctFingering.every(v => v === 0)) :
                    newValves.some((v, i) => v === 1 && correctFingering[i] === 1);

                if (!shouldCheck) {
                    return newValves;
                }

                if (isCorrect) {
                    const reactionTime = practiceState.startTime
                        ? Date.now() - practiceState.startTime
                        : 0;

                    updateScore(true, reactionTime);
                    playTone(practiceState.currentNote);

                    setTimeout(() => {
                        if (!currentSong || !fingeringMap) return;

                        const nextIndex = practiceState.currentEventIndex + 1;
                        if (nextIndex >= currentSong.events.length) {
                            setPracticeState({
                                currentEventIndex: -1,
                                currentNote: null,
                                expectedFingering: null,
                                isPlaying: false,
                                startTime: null,
                            });
                            return;
                        }

                        const nextEvent = currentSong.events[nextIndex];
                        setPracticeState({
                            currentEventIndex: nextIndex,
                            currentNote: nextEvent.pitch,
                            expectedFingering: fingeringMap[nextEvent.pitch]?.valvulas || null,
                            isPlaying: true,
                            startTime: Date.now(),
                        });

                        setTimeRemaining(nextEvent.dur_ms);
                        setPressedValves([0, 0, 0]);
                    }, 500);
                }
            }

            return newValves;
        });
    }, [practiceState, currentSong, fingeringMap, playTone]);

    const resetValves = useCallback(() => {
        setPressedValves([0, 0, 0]);
    }, []);

    const checkFingering = useCallback(() => {
        if (!practiceState.expectedFingering) return;

        const isOpenNote = practiceState.expectedFingering.every(v => v === 0);
        const isCorrect = isOpenNote ?
            pressedValves.every(v => v === 0) :
            pressedValves.every((v, i) => v === practiceState.expectedFingering![i]);

        const reactionTime = practiceState.startTime
            ? Date.now() - practiceState.startTime
            : 0;

        updateScore(isCorrect, reactionTime);

        if (isCorrect && practiceState.currentNote) {
            playTone(practiceState.currentNote);
        }

        setTimeout(() => {
            nextNote();
        }, isCorrect ? 500 : 1000);
    }, [pressedValves, practiceState]);

    const updateScore = (isCorrect: boolean, reactionTime: number) => {
        setStats(prev => {
            const newTotal = prev.totalNotes + 1;
            const newCorrect = prev.correctCount + (isCorrect ? 1 : 0);
            const newIncorrect = prev.incorrectCount + (isCorrect ? 0 : 1);

            const totalReactionTime = prev.averageReactionTime * prev.totalNotes;
            const newAverage = (totalReactionTime + reactionTime) / newTotal;

            return {
                correctCount: newCorrect,
                incorrectCount: newIncorrect,
                averageReactionTime: newAverage,
                totalNotes: newTotal,
            };
        });
    };

    const startPractice = useCallback(() => {
        if (!currentSong || !fingeringMap) {
            alert('No hay canción o mapa de digitaciones cargado');
            return;
        }

        setPracticeState({
            currentEventIndex: 0,
            currentNote: currentSong.events[0].pitch,
            expectedFingering: fingeringMap[currentSong.events[0].pitch]?.valvulas || null,
            isPlaying: true,
            startTime: Date.now(),
        });

        setTimeRemaining(currentSong.events[0].dur_ms);
        resetValves();

        console.log('[App] Práctica iniciada');
    }, [currentSong, fingeringMap, resetValves]);

    const nextNote = useCallback(() => {
        if (!currentSong || !fingeringMap) return;

        const nextIndex = practiceState.currentEventIndex + 1;

        if (nextIndex >= currentSong.events.length) {
            setPracticeState({
                currentEventIndex: -1,
                currentNote: null,
                expectedFingering: null,
                isPlaying: false,
                startTime: null,
            });
            resetValves();
            return;
        }

        const nextEvent = currentSong.events[nextIndex];

        setPracticeState({
            currentEventIndex: nextIndex,
            currentNote: nextEvent.pitch,
            expectedFingering: fingeringMap[nextEvent.pitch]?.valvulas || null,
            isPlaying: true,
            startTime: Date.now(),
        });

        setTimeRemaining(nextEvent.dur_ms);
        resetValves();
    }, [currentSong, fingeringMap, practiceState.currentEventIndex, resetValves]);

    const endPractice = useCallback(() => {
        setPracticeState({
            currentEventIndex: -1,
            currentNote: null,
            expectedFingering: null,
            isPlaying: false,
            startTime: null,
        });
        resetValves();
        console.log('[App] Práctica finalizada');
    }, []);

    useEffect(() => {
        if (!practiceState.isPlaying || !practiceState.startTime) return;

        const interval = setInterval(() => {
            const elapsed = Date.now() - practiceState.startTime!;
            const currentEvent = currentSong?.events[practiceState.currentEventIndex];

            if (!currentEvent) return;

            const remaining = currentEvent.dur_ms - elapsed;

            if (remaining <= 0) {
                updateScore(false, currentEvent.dur_ms);
                nextNote();
            } else {
                setTimeRemaining(remaining);
            }
        }, 50);

        return () => clearInterval(interval);
    }, [practiceState, currentSong, nextNote]);

    return (
        <div style={styles.app}>
            <header style={styles.header}>
                <h1 style={styles.title}>🎺 Simulador de Trompeta</h1>
                <p style={styles.subtitle}>Practica tu digitación de forma interactiva</p>
            </header>

            <main style={styles.main}>
                <div style={styles.leftColumn}>
                    <div style={styles.gameContainer}>
                        <NoteDisplay
                            currentNote={practiceState.currentNote}
                            expectedFingering={practiceState.expectedFingering}
                            timeRemaining={timeRemaining}
                            noteDurationMs={noteDurationMs}
                            showHints={showHints}
                        />

                        <ValveButtons
                            onValvePress={handleValvePress}
                            onValveSet={handleValveSet}
                            pressedValves={pressedValves}
                            disabled={!practiceState.isPlaying}
                            showHints={showHints}
                            expectedFingering={showHints ? practiceState.expectedFingering : null}
                            onToggleHints={setShowHints}
                        />
                    </div>

                    <div style={styles.actionsContainer}>
                        {!practiceState.isPlaying ? (
                            <button
                                style={styles.primaryButton}
                                onClick={() => {
                                    loadDefaultSong();
                                    startPractice();
                                }}
                            >
                                ▶️ Iniciar Práctica
                            </button>
                        ) : (
                            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                                <button
                                    style={{ ...styles.successButton, flex: 1 }}
                                    onClick={checkFingering}
                                >
                                    ✓ Verificar
                                </button>
                                <button
                                    style={{ ...styles.dangerButton, flex: 1 }}
                                    onClick={endPractice}
                                >
                                    ⏹ Detener
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div style={styles.rightColumn}>
                    <StatsBar stats={stats} />

                    <div style={styles.controlPanel}>
                        <div style={styles.modeSelector}>
                            <label style={styles.selectorLabel}>Modo de práctica:</label>
                            <div style={styles.radioGroup}>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        value="random"
                                        checked={practiceMode === 'random'}
                                        onChange={(e) => setPracticeMode(e.target.value as 'random' | 'scale')}
                                        style={styles.radioInput}
                                    />
                                    Notas aleatorias
                                </label>
                                <label style={styles.radioLabel}>
                                    <input
                                        type="radio"
                                        value="scale"
                                        checked={practiceMode === 'scale'}
                                        onChange={(e) => setPracticeMode(e.target.value as 'random' | 'scale')}
                                        style={styles.radioInput}
                                    />
                                    Escalas mayores
                                </label>
                            </div>
                        </div>

                        {practiceMode === 'scale' && scalesData && (
                            <div style={styles.scaleSelector}>
                                <div style={styles.selectGroup}>
                                    <label htmlFor="scaleType" style={styles.selectLabel}>Tipo de escala:</label>
                                    <select
                                        id="scaleType"
                                        value={selectedScaleType}
                                        onChange={(e) => {
                                            const newType = e.target.value as 'sostenidos' | 'bemoles';
                                            setSelectedScaleType(newType);
                                            // Seleccionar la primera escala del nuevo tipo
                                            const firstScale = Object.keys(scalesData[newType])[0];
                                            setSelectedScale(firstScale);
                                        }}
                                        style={styles.select}
                                    >
                                        <option value="sostenidos">Sostenidos (#)</option>
                                        <option value="bemoles">Bemoles (♭)</option>
                                    </select>
                                </div>

                                <div style={styles.selectGroup}>
                                    <label htmlFor="scale" style={styles.selectLabel}>Escala:</label>
                                    <select
                                        id="scale"
                                        value={selectedScale}
                                        onChange={(e) => setSelectedScale(e.target.value)}
                                        style={styles.select}
                                    >
                                        {scalesData && scalesData[selectedScaleType] &&
                                            Object.entries(scalesData[selectedScaleType]).map(([key, value]: [string, any]) => (
                                                <option key={key} value={key}>
                                                    {value.nombre}
                                                </option>
                                            ))
                                        }
                                    </select>
                                </div>
                            </div>
                        )}

                        <div style={styles.noteSelector}>
                            <label htmlFor="noteCount">Notas: </label>
                            <input
                                type="number"
                                id="noteCount"
                                min="1"
                                max="20"
                                value={noteCount}
                                onChange={(e) => {
                                    const value = Math.max(1, Math.min(20, parseInt(e.target.value)));
                                    setNoteCount(value);
                                    loadDefaultSong();
                                }}
                                style={styles.numberInput}
                                disabled={practiceMode === 'scale'}
                            />
                            {practiceMode === 'scale' && (
                                <span style={{ fontSize: '10px', color: '#999', marginLeft: '5px' }}>
                                    (8 notas)
                                </span>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                        <label style={{ display: 'block', marginBottom: 4, fontSize: '13px' }}>Duración (ms):</label>
                        <input
                            type="range"
                            min={1000}
                            max={8000}
                            value={noteDurationMs}
                            onChange={(e) => setNoteDurationMs(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                        <div style={{ marginTop: 4, fontSize: 12, textAlign: 'center' }}>{noteDurationMs} ms</div>
                    </div>

                    {currentSong && practiceState.isPlaying && (
                        <div style={styles.songInfo}>
                            <h3 style={styles.songTitle}>Actual</h3>
                            <p style={styles.songDetails}>{currentSong.title}</p>
                            <p style={styles.songDetails}>Progreso: {practiceState.currentEventIndex + 1}/{currentSong.events.length}</p>
                        </div>
                    )}
                </div>
            </main>

            <footer style={styles.footer}>
                <p style={styles.footerText}>
                    Desarrollado con Tauri + React + TypeScript
                </p>
            </footer>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    app: {
        minHeight: '100vh',
        backgroundColor: '#f0f2f5',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    header: {
        backgroundColor: '#1976D2',
        color: '#fff',
        padding: '15px 20px',
        textAlign: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    title: {
        margin: '0 0 5px 0',
        fontSize: '28px',
        fontWeight: 'bold',
    },
    subtitle: {
        margin: 0,
        fontSize: '14px',
        opacity: 0.9,
    },
    main: {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '10px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: '15px',
        position: 'relative',
    },
    leftColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
    },
    rightColumn: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'sticky',
        top: '10px',
        alignSelf: 'start',
    },
    gameContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: '15px',
        alignItems: 'stretch',
        width: '100%',
        marginBottom: '15px',
    },
    actionsContainer: {
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
        padding: '0 20px',
    },
    controlPanel: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    primaryButton: {
        padding: '14px 40px',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#4CAF50',
        color: '#fff',
        border: 'none',
        borderRadius: '30px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
        width: '100%',
        maxWidth: '400px',
    },
    successButton: {
        padding: '16px 24px',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#8BC34A',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    dangerButton: {
        padding: '16px 24px',
        fontSize: '18px',
        fontWeight: 'bold',
        backgroundColor: '#F44336',
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
    },
    songInfo: {
        padding: '12px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    noteSelector: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '5px',
    },
    numberInput: {
        padding: '8px',
        fontSize: '16px',
        width: '80px',
        border: '1px solid #ccc',
        borderRadius: '4px',
    },
    modeSelector: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '10px',
        paddingBottom: '10px',
        borderBottom: '1px solid #e0e0e0',
    },
    selectorLabel: {
        fontSize: '15px',
        fontWeight: 'bold',
        color: '#333',
        marginBottom: '6px',
    },
    radioGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    radioLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#555',
        cursor: 'pointer',
    },
    radioInput: {
        cursor: 'pointer',
        width: '18px',
        height: '18px',
    },
    scaleSelector: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginBottom: '10px',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
    },
    selectGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
    },
    selectLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#333',
    },
    select: {
        padding: '10px',
        fontSize: '15px',
        border: '1px solid #ccc',
        borderRadius: '6px',
        backgroundColor: '#fff',
        cursor: 'pointer',
        transition: 'border-color 0.2s ease',
    },
    songTitle: {
        fontSize: '16px',
        fontWeight: 'bold',
        color: '#333',
        margin: '0 0 8px 0',
    },
    songDetails: {
        fontSize: '13px',
        color: '#666',
        margin: '4px 0',
    },
    footer: {
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#fff',
        borderTop: '1px solid #e0e0e0',
        marginTop: '40px',
    },
    footerText: {
        margin: 0,
        fontSize: '14px',
        color: '#666',
    },
};

export default App;
