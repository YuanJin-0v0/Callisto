import { useEffect, useState, useCallback, useRef } from "react";

interface Song {
  path: string;
  title: string;
  artist: string;
  duration: number;
}

export default function MusicPlayer() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [spectrum, setSpectrum] = useState<number[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const animRef = useRef<number>(0);
  const bufferRef = useRef<AudioBuffer | null>(null);
  const startTimeRef = useRef(0);

  const currentSong = currentIdx >= 0 ? songs[currentIdx] : null;

  const loadSong = useCallback(async (idx: number) => {
    if (idx < 0 || idx >= songs.length) return;
    const song = songs[idx];
    try {
      const { invoke } = await import("@tauri-apps/api/core");
      const data: number[] = await invoke("read_audio_file", { path: song.path });
      const array = new Uint8Array(data).buffer;

      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const audioBuffer = await ctx.decodeAudioData(array);
      bufferRef.current = audioBuffer;
      setDuration(audioBuffer.duration);
      setTime(0);
      setCurrentIdx(idx);
    } catch {
      /* error loading */
    }
  }, [songs]);

  const play = useCallback(() => {
    if (!audioCtxRef.current || !bufferRef.current) return;
    const ctx = audioCtxRef.current;

    if (sourceRef.current) sourceRef.current.stop();

    const source = ctx.createBufferSource();
    source.buffer = bufferRef.current;

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(analyser);
    analyser.connect(gain);
    gain.connect(ctx.destination);

    source.start(0);
    startTimeRef.current = ctx.currentTime;

    sourceRef.current = source;
    analyserRef.current = analyser;
    gainRef.current = gain;
    setPlaying(true);

    source.onended = () => {
      setPlaying(false);
      if (currentIdx < songs.length - 1) {
        loadSong(currentIdx + 1);
      }
    };

    const update = () => {
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      setSpectrum(Array.from(data.slice(0, 64)));
      if (sourceRef.current && startTimeRef.current) {
        setTime(ctx.currentTime - startTimeRef.current);
      }
      animRef.current = requestAnimationFrame(update);
    };
    cancelAnimationFrame(animRef.current);
    update();
  }, [volume, songs.length, currentIdx, loadSong]);

  const pause = useCallback(() => {
    if (audioCtxRef.current) {
      audioCtxRef.current.suspend();
      setPlaying(false);
    }
  }, []);

  const resume = useCallback(() => {
    if (audioCtxRef.current) {
      audioCtxRef.current.resume();
      setPlaying(true);
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (audioCtxRef.current?.state === "suspended") {
      resume();
    } else if (playing) {
      pause();
    } else {
      play();
    }
  }, [playing, play, pause, resume]);

  const handleImport = useCallback(async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const dir = await open({ directory: true });
      if (!dir) return;
      const { invoke } = await import("@tauri-apps/api/core");
      const list: Song[] = await invoke("scan_music_directory", { dir });
      setSongs(list);
    } catch {
      const dir = prompt("输入音乐文件夹路径：");
      if (!dir) return;
      try {
        const { invoke } = await import("@tauri-apps/api/core");
        const list: Song[] = await invoke("scan_music_directory", { dir });
        setSongs(list);
      } catch {
        /* not in Tauri */
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current);
      audioCtxRef.current?.close();
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "var(--gold)", fontSize: 16 }}>音乐</h2>
        <button className="pixel-btn primary" onClick={handleImport}>
          📂 导入文件夹
        </button>
      </div>

      <div className="pixel-card" style={{ marginBottom: 16, textAlign: "center", padding: 16 }}>
        <div style={{ fontSize: 14, fontWeight: "bold", color: "var(--text-primary)" }}>
          {currentSong?.title || "未选择歌曲"}
        </div>
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {currentSong?.artist || ""}
        </div>

        {spectrum.length > 0 && (
          <div style={{ display: "flex", gap: 2, justifyContent: "center", marginTop: 12, height: 60 }}>
            {spectrum.map((v, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: `${(v / 255) * 100}%`,
                  background: "var(--accent)",
                  alignSelf: "flex-end",
                  minHeight: 2,
                }}
              />
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>
          {formatTime(time)} / {formatTime(duration)}
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8 }}>
          <button
            className="pixel-btn"
            onClick={() => loadSong(currentIdx - 1)}
            disabled={currentIdx <= 0}
          >
            ⏮
          </button>
          <button className="pixel-btn primary" onClick={handlePlayPause} style={{ fontSize: 16, padding: "4px 20px" }}>
            {playing ? "⏸" : "▶"}
          </button>
          <button
            className="pixel-btn"
            onClick={() => loadSong(currentIdx + 1)}
            disabled={currentIdx >= songs.length - 1}
          >
            ⏭
          </button>
        </div>

        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>音量</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              setVolume(v);
              if (gainRef.current) gainRef.current.gain.value = v;
            }}
            style={{ width: 100 }}
          />
        </div>
      </div>

      <div style={{ flex: 1, overflow: "auto" }}>
        {songs.length === 0 ? (
          <p style={{ color: "var(--text-muted)" }}>导入音乐文件夹开始播放</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {songs.map((song, idx) => (
              <div
                key={song.path}
                className={`pixel-card${idx === currentIdx ? " primary" : ""}`}
                onClick={() => { currentIdx === idx ? handlePlayPause() : loadSong(idx); }}
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "6px 12px",
                  borderColor: idx === currentIdx ? "var(--accent)" : undefined,
                }}
              >
                <div>
                  <div style={{ fontSize: 13 }}>{song.title}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{song.artist}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
