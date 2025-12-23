import { useState, useEffect, useRef } from 'react';
import { generateSong, pollTaskStatus } from './api';
import loadingTuneUrl from './assets/Tune.mp3';

//const API_BASE = 'https://my-suno-backend.onrender.com';
const API_BASE = 'https://ai-music-backend-g0d9.onrender.com';

function App() {
  // --- State ---
  const [words, setWords] = useState([]);
  const [rawWords, setRawWords] = useState([]);
  const [stats, setStats] = useState({ total: 0, unique: 0 });
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState("Initializing...");
  const [error, setError] = useState(null);
  const [generatedSongs, setGeneratedSongs] = useState([]); // List of songs
  const [showConfig, setShowConfig] = useState(false);

  // Config Inputs
  const [personName, setPersonName] = useState("Anish Bhai");
  const [occasion, setOccasion] = useState("Birthday Celebration");
  const [promptPreview, setPromptPreview] = useState("Waiting for words...");
  const [isManualPrompt, setIsManualPrompt] = useState(false);


  // Audio Playback
  const [currentAudio, setCurrentAudio] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(new Audio());
  const loadingAudioRef = useRef(new Audio(loadingTuneUrl));

  // Polling Refs
  const pollingIntervalRef = useRef(null);
  const wordsIntervalRef = useRef(null);

  // --- Effects ---

  // 1. Fetch Words (Poll every 2s)
  useEffect(() => {
    fetchWords();
    wordsIntervalRef.current = setInterval(fetchWords, 2000);
    return () => clearInterval(wordsIntervalRef.current);
  }, []);

  // 2. Update Prompt Preview when words or config change
  useEffect(() => {
    updatePromptPreview();
  }, [words, personName, occasion]);

  // 3. Audio Event Listeners
  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  // Configure Loading Audio
  useEffect(() => {
    loadingAudioRef.current.loop = true;
    loadingAudioRef.current.volume = 0.5; // Optional: set reasonable volume
  }, []);

  const stopLoadingTune = () => {
    loadingAudioRef.current.pause();
    loadingAudioRef.current.currentTime = 0;
  };

  // Format helper
  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    audioRef.current.currentTime = time;
    setCurrentTime(time);
  };

  // --- Logic Helpers ---

  const fetchWords = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/words`);
      const data = await response.json();
      const newWords = data.words || [];

      // Simple comparison to avoid unnecessary re-renders if deep comparison needed, 
      // but for now relying on length/content mismatch might be enough or just letting React handle it.
      // We'll mimic the html logic: compare JSON string
      if (JSON.stringify(newWords) !== JSON.stringify(rawWords)) {
        setRawWords(newWords);
        setWords([...newWords].reverse());
        calculateStats(newWords);
      }
    } catch (err) {
      console.error("Error fetching words:", err);
    }
  };

  const calculateStats = (wordList) => {
    if (wordList.length === 0) {
      setStats({ total: 0, unique: 0 });
      return;
    }
    const freq = {};
    wordList.forEach(w => {
      const key = w.trim().toLowerCase();
      if (key) freq[key] = (freq[key] || 0) + 1;
    });
    setStats({ total: wordList.length, unique: Object.keys(freq).length });
  };

  const generatePromptText = () => {
    if (words.length === 0) return null;

    const freq = {};
    words.forEach(w => {
      const key = w.toLowerCase();
      freq[key] = (freq[key] || 0) + 1;
    });

    const sortedUnique = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

    const topWords = sortedUnique.slice(0, 10).join(', ');

    const nameToUse = personName || "Anish Bhai";
    const occasionToUse = occasion || "Birthday";

    // New Bollywood-style prompt + Fixed Title instruction
    const text = `Create a happy and energetic hindi song in male voice for ${nameToUse}'s ${occasionToUse}. His qualities are: ${topWords}. Title of the song should be "${nameToUse} ki shaaan"`;
    return text;
  };

  const updatePromptPreview = () => {
    if (isManualPrompt) return; // Don't overwrite manual edits
    const text = generatePromptText();
    setPromptPreview(text || "Waiting for words...");
  };

  // --- Handlers ---

  const handleGenerate = async () => {
    // Use the current prompt state, allowing manual edits
    let prompt = promptPreview;

    // Fallback if prompt is empty or just placeholder
    if (!prompt || prompt === "Waiting for words...") {
      prompt = generatePromptText();
    }

    if (!prompt) {
      alert("No words collected yet!");
      return;
    }

    setLoading(true);
    setLoadingStatus("Initializing...");
    setError(null);

    // Start Loading Tune
    try {
      loadingAudioRef.current.play().catch(e => console.error("Error playing loading tune:", e));
    } catch (e) {
      console.error("Audio play error:", e);
    }

    try {
      // Use logic similar to final.html robust handling
      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customMode: false,
          instrumental: false,
          model: 'V5',
          prompt: prompt
        })
      });

      const data = await response.json();

      if (!response.ok || data.error || data.detail || (data.status === 'error')) {
        throw new Error(data.detail || data.message || data.error || 'Generation failed');
      }

      // Robust Task ID extraction
      const taskId = data.data?.data?.taskId || data.data?.taskId || data.taskId || data.id || null;

      if (taskId) {
        setLoadingStatus("Generating your track...");
        startPolling(taskId);
      } else {
        // Specific error check
        if (data.data?.code === 429 || data.data?.msg?.toLowerCase().includes('insufficient')) {
          throw new Error(data.data?.msg || "Insufficient credits. Please top up.");
        }
        const specificError = data.data?.msg || data.data?.message;
        if (specificError && (specificError.toLowerCase().includes('insufficient') || specificError.toLowerCase().includes('credit'))) {
          throw new Error(specificError);
        }
        throw new Error("Unable to start generation. Please try again.");
      }

    } catch (err) {
      console.error(err);
      setError(err.message);
      setLoading(false);
      stopLoadingTune();
    }
  };

  const startPolling = (taskId) => {
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/status/${taskId}`);
        const data = await res.json();

        // 1. Log Response for Debugging
        console.log("Polling API Response:", data);

        if (data.status === 'success' && data.data) {
          const task = data.data;
          const currentStatus = (task.status || 'PROCESSING').toUpperCase();

          // 2. Update Loading Status Text (if not done)
          if (!['SUCCESS', 'FAILED', 'COMPLETED', 'COMPLETE'].includes(currentStatus)) {
            setLoadingStatus((task.status || 'Processing').replace(/_/g, ' '));
          }

          // 3. Find Global Songs Array from ANY possible location
          //    We saw 'clips' in some responses, 'sunoData' in others.
          // 3. Find Global Songs Array from ANY possible location
          // Based on your JSON: task.data.response.sunoData is where the songs are.
          // In our code 'task' is already data.data => so we have task.data.response.sunoData

          let songs = [];

          // Direct check for the structure you pasted
          if (task.data && task.data.response && Array.isArray(task.data.response.sunoData)) {
            songs = task.data.response.sunoData;
          }
          // Fallbacks
          else {
            songs = task.sunoData
              || task.response?.sunoData
              || task.clips
              || task.response?.clips
              || (Array.isArray(task.response) ? task.response : [])
              || [];
          }

          console.log("Extracted songs:", songs);

          // 4. Check if we have anything playable
          const hasPlayable = songs.some(s => s.audio_url || s.audioUrl);
          const isTaskDone = ['SUCCESS', 'FIRST_SUCCESS', 'COMPLETED', 'COMPLETE'].includes(currentStatus);

          // 5. Success Logic
          if (isTaskDone || hasPlayable || songs.length > 0) {

            // Filter for valid songs - adjusted for your specific JSON structure
            // STRICTLY require an audio URL. If it only has an ID, it's not ready to play/show yet.
            const validSongs = songs.filter(s => {
              const url = s.audioUrl || s.audio_url || s.sourceAudioUrl;
              return url && typeof url === 'string' && url.trim() !== "";
            });

            if (validSongs.length > 0) {
              console.log("Valid Songs Found:", validSongs);
              // Normalize Data
              const normalizedSongs = validSongs.map(s => ({
                id: s.id || Math.random().toString(36),
                title: s.title || "Generated Song",
                tags: s.tags || "AI Music",
                // Prioritize large image, then standard, then camelCase
                image_url: s.image_large_url || s.image_url || s.imageUrl || s.sourceImageUrl || "",
                // Prioritize finding ANY valid audio URL
                audio_url: s.audio_url || s.audioUrl || s.sourceAudioUrl || "",
                status: s.status || "complete",
                duration: s.duration || 0,
                created_at: s.created_at || new Date().toISOString()
              })).filter(song => song.audio_url); // Filter out any that still missed audio


              clearInterval(pollingIntervalRef.current);
              setGeneratedSongs(prev => {
                // Create a map of new songs by ID for easy lookup
                const newSongsMap = new Map(normalizedSongs.map(s => [s.id, s]));

                // 1. Update existing songs with new data if available
                const updatedPrev = prev.map(existing => {
                  if (newSongsMap.has(existing.id)) {
                    return { ...existing, ...newSongsMap.get(existing.id) };
                  }
                  return existing;
                });

                // 2. Add truly new songs that weren't in prev
                const existingIds = new Set(prev.map(p => p.id));
                const trulyNew = normalizedSongs.filter(n => !existingIds.has(n.id));

                return [...trulyNew, ...updatedPrev];
              });
              setLoading(false);
              stopLoadingTune();

            } else if (isTaskDone) {
              // Task is marked DONE, but validSongs is empty.
              // This means generation finished but returned no valid audio clips.
              // We MUST stop loading loop.
              console.warn("Task Success but No Songs Found:", task);
              clearInterval(pollingIntervalRef.current);
              setLoading(false);
              stopLoadingTune();
              setError("Generation completed but no audio was returned. Please try again.");
            }
          }
          // 6. Failure Logic
          else if (currentStatus === 'FAILED') {
            clearInterval(pollingIntervalRef.current);
            setLoading(false);
            stopLoadingTune();
            setError(task.errorMessage || task.error_message || "Generation failed.");
          }
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000);
  };

  const handleClearWords = async () => {
    if (!confirm('Clear all words?')) return;
    try {
      await fetch(`${API_BASE}/api/words`, { method: 'DELETE' });
      setWords([]);
      setRawWords([]);
      setStats({ total: 0, unique: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlay = async (url) => {
    console.log("togglePlay called with:", url);

    if (!url || typeof url !== 'string' || url.trim() === "") {
      alert("Playback Failed: No valid audio URL found for this song.\nPlease try regenerating.");
      return;
    }

    const audio = audioRef.current;

    if (!audio) {
      console.error("Audio ref is missing!");
      return;
    }

    if (currentAudio === url) {
      // Toggle Pause/Play
      if (audio.paused) {
        console.log("Resuming audio...");
        try {
          await audio.play();
        } catch (e) { console.error("Resume error:", e); }
      } else {
        console.log("Pausing audio...");
        audio.pause();
        // Don't set currentAudio to null if just pausing, technically, 
        // but for this UI, we treat 'pause' as stopping active playback visual
        //setCurrentAudio(null);
      }
    } else {
      // New Song
      console.log("Playing new song:", url);
      audio.src = url;
      audio.load();
      try {
        await audio.play();
        setCurrentAudio(url);
      } catch (e) {
        console.error("Playback failed for:", url, e);
        // Show the actual error to the user
        // Show the actual error to the user
        if (confirm(`Playback failed: ${e.message}\n\nURL: ${url}\n\nClick OK to open the song in a new tab (it might download or play there).`)) {
          window.open(url, '_blank');
        }
      }
    }
  };

  const handleDownload = async (url, title) => {
    if (!url) return;
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
      // Fallback
      window.open(url, '_blank');
    }
  };

  // --- Word Cloud Helper ---
  const getWordCloudWords = () => {
    if (words.length === 0) return [];

    // Frequency
    const freq = {};
    words.forEach(w => {
      const k = w.trim().toLowerCase();
      if (k) freq[k] = (freq[k] || 0) + 1;
    });

    // Sort by frequency descending
    const uniqueWords = Object.keys(freq).sort((a, b) => freq[b] - freq[a]);

    // Take Top 10
    const topWords = uniqueWords.slice(0, 12);

    let maxFreq = 0;
    let minFreq = Infinity;
    topWords.forEach(w => {
      if (freq[w] > maxFreq) maxFreq = freq[w];
      if (freq[w] < minFreq) minFreq = freq[w];
    });

    const bubbleStyles = [
      "text-4xl font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20",
      "text-2xl font-medium text-purple-300 bg-purple-500/10 border border-purple-500/20",
      "text-3xl font-semibold text-white bg-white/5 border border-white/10",
      "text-xl text-indigo-200 bg-indigo-500/5 border border-indigo-500/10",
      "text-4xl font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20",
      "text-2xl font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20",
      "text-xl text-white/70 bg-white/5",
      "text-3xl font-semibold text-white bg-white/5 border border-white/10"
    ];

    return topWords.map((key, i) => {
      const count = freq[key];
      const minSize = 2.0;
      const maxSize = 2.0;
      let size = minSize;
      if (maxFreq > minFreq) {
        size = minSize + ((count - minFreq) / (maxFreq - minFreq)) * (maxSize - minSize);
      } else {
        size = (minSize + maxSize) / 2;
      }

      return {
        text: key.charAt(0).toUpperCase() + key.slice(1),
        size: `${size.toFixed(2)}rem`,
        className: bubbleStyles[i % bubbleStyles.length]
      };
    });
  };

  const cloudItems = getWordCloudWords();

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e1b4b] via-black to-black text-white font-['Outfit'] selection:bg-indigo-500/30">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/40 rounded-full blur-[120px] animate-blob mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/40 rounded-full blur-[120px] animate-blob animation-delay-2000 mix-blend-screen"></div>
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] bg-fuchsia-600/20 rounded-full blur-[150px] animate-blob animation-delay-4000 mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-125 contrast-150"></div>
      </div>

      <div className="relative z-10 w-full mx-auto p-4 md:p-6 lg:p-8 min-h-screen flex flex-col">

        {/* Header */}
        {/* Header - Aligned with Middle Column */}
        <header className="flex w-full gap-6 mb-8 flex-shrink-0">

          {/* Spacer Left (Matches Grid 3fr) */}
          <div className="hidden lg:block flex-[3]"></div>

          {/* Title Section (Matches Grid 5.5fr) */}
          <div className="flex-[5.5] flex flex-col md:flex-row items-center justify-center gap-5 cursor-default select-none">
            {/* Icon */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-[0_0_30px_-5px_rgba(124,58,237,0.4)] border border-white/10 group overflow-hidden relative">
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <svg className="w-8 h-8 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>

            {/* Text */}
            <div className="flex flex-col">
              <h1 className="text-5xl font-extrabold tracking-tight text-white mb-1 font-['Outfit']">
                JioAI Music
              </h1>
              <p className="text-xl text-white/50 font-medium tracking-wide">
              </p>
            </div>
          </div>

          {/* Spacer Right (Matches Grid 3.5fr) */}
          <div className="hidden lg:block flex-[3.5]"></div>
        </header>

        {/* Main Grid */}
        <main className="grid grid-cols-1 lg:grid-cols-[3fr_5.5fr_3.5fr] gap-6 items-stretch flex-1">

          {/* Left: QR & Stats */}
          <section className="col-span-1 flex flex-col h-full">
            <div className="glass-panel p-8 rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md flex flex-col h-full relative overflow-hidden">
              <div className="text-center mb-8">
                <h2 className="text-4xl font-bold text-white mb-2">Scan & Submit</h2>
                <p className="text-lg text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">Describe Anish Bhai in your words</p>
              </div>

              <div className="flex-1 flex items-center justify-center mb-8 relative">
                {/* Glowing Border Wrapper */}
                <div className="relative p-1 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-[0_0_40px_rgba(79,70,229,0.3)]">
                  <div className="bg-white p-2 rounded-xl">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://jioaimusicbond.netlify.app/word-submit.html&color=4f46e5" alt="QR Code" className="w-full h-auto block rounded-lg" />
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/10 flex items-center justify-between px-2">
                <div className="text-center">
                  <p className="text-5xl font-bold text-indigo-400 font-mono">{stats.total}</p>
                  <p className="text-xs text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] font-bold uppercase tracking-widest mt-1">RESPONSES</p>
                </div>
                <div className="h-10 w-px bg-white/10"></div>
                <div className="text-center">
                  <p className="text-5xl font-bold text-purple-400 font-mono">{stats.unique}</p>
                  <p className="text-xs text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)] font-bold uppercase tracking-widest mt-1">UNIQUE WORDS</p>
                </div>
              </div>
            </div>
          </section>

          {/* Center: Word Cloud */}
          <section className="col-span-1 flex flex-col h-full">
            <div className="glass-panel rounded-3xl p-8 flex flex-col h-full border border-white/10 bg-black/40 backdrop-blur-md relative overflow-hidden">

              <div className="text-center mb-6">
                <h2 className="text-4xl font-bold mb-2 text-white">Anish Bhai's Superpowers</h2>
                <p className="text-lg text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">Words from leaders</p>
              </div>

              {/* Cloud */}
              <div className="flex-1 flex flex-wrap items-center justify-center content-center gap-4 overflow-hidden relative min-h-[300px] py-4">
                {words.length === 0 ? (
                  <span className="text-white/30 text-xl font-light italic">Waiting for submissions...</span>
                ) : (
                  cloudItems.map((item, i) => (
                    <span key={i} className={`inline-block px-5 py-2.5 rounded-full backdrop-blur-md transition-all duration-500 hover:scale-110 cursor-default shadow-lg border ${item.className}`} style={{ fontSize: item.size }}>
                      {item.text}
                    </span>
                  ))
                )}
              </div>

              {/* Actions */}
              <div className="mt-auto pt-8 flex gap-3 w-full">
                <button onClick={handleGenerate} className="flex-[3] bg-white hover:bg-gray-200 text-black py-3 px-6 rounded-xl font-bold text-2xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 group">
                  <span className="group-hover:scale-110 transition-transform text-lg">🎵</span>
                  Generate
                </button>
                <button onClick={() => setShowConfig(!showConfig)} className="flex-1 bg-white/5 text-white/70 py-3 px-4 rounded-xl font-bold hover:bg-white/10 transition-colors border border-white/10 flex items-center justify-center gap-2 text-sm">
                  <span>⚙️</span> Advance <span className={`transition-transform duration-300 ${showConfig ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>
            </div>
          </section>

          {/* Right: Song Generator */}
          <section className="col-span-1 flex flex-col">
            <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col relative border border-white/10 bg-black/40 backdrop-blur-md">

              {/* Header */}
              <div className="text-center mb-4 flex-shrink-0">
                <h2 className="text-4xl font-bold mb-2 text-white">Anish Bhai's Song</h2>
                <p className="text-lg text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">Powered by your words</p>
              </div>

              {/* Loading Overlay */}
              {loading && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 rounded-2xl flex flex-col items-center justify-center">
                  <div className="music-loader mb-6">
                    <div className="music-bar"></div>
                    <div className="music-bar"></div>
                    <div className="music-bar"></div>
                    <div className="music-bar"></div>
                    <div className="music-bar"></div>
                  </div>
                  <p className="text-white font-bold animate-pulse text-lg">Creating Magic...</p>
                  <p className="text-white/60 text-sm mt-2 font-mono">{loadingStatus}</p>
                </div>
              )}

              {/* Error Overlay */}
              {error && (
                <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 rounded-2xl flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4 border border-red-500/20">
                    <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Oops!</h3>
                  <p className="text-white/70 mb-6">{error}</p>
                  <button onClick={() => setError(null)} className="px-6 py-2 bg-white text-black rounded-lg font-bold hover:bg-gray-200 transition-colors">Try Again</button>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 flex flex-col relative overflow-hidden rounded-xl p-4">
                {generatedSongs.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center">
                    <div className="relative mb-6 group">
                      <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden shadow-2xl relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="w-full h-full flex items-center justify-center relative z-10">
                          <svg className="w-20 h-20 text-white/90 drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                        </div>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 mt-4 text-center">Your Song Awaits</h3>
                      <p className="text-white/50 text-sm max-w-[200px] text-center mx-auto">Click Generate to create a masterpiece.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Now Playing Feature */}
                    {(() => {
                      const activeSong = generatedSongs.find(s => s.audio_url === currentAudio) || generatedSongs[0];
                      return (
                        <div className="flex flex-col items-center text-center mb-6 relative z-10">
                          {/* Art */}
                          <div className="w-40 h-40 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-2xl mb-4 relative group overflow-hidden border border-white/10">
                            {activeSong.image_url ?
                              <img src={activeSong.image_url} className="w-full h-full object-cover" />
                              :
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-16 h-16 text-white drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
                              </div>
                            }
                          </div>

                          {/* Meta */}
                          <h3 className="text-2xl font-bold text-white mb-1">"{activeSong.title || "Brilliant & Kind"}"</h3>
                          <p className="text-sm text-white/50 mb-6">A song for Anish Shah</p>

                          {/* Progress Bar (Interactive) */}
                          {/* Progress Bar (Interactive) */}
                          <div className="w-full max-w-xs flex items-center gap-3">
                            {/* Main Play/Pause Button */}
                            <button
                              onClick={() => togglePlay(activeSong.audio_url)}
                              className="w-10 h-10 mb-2 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:scale-110 transition-transform flex-shrink-0 shadow-lg shadow-indigo-500/30 border border-white/10"
                            >
                              {isPlaying && currentAudio === activeSong.audio_url ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                              ) : (
                                <svg className="w-4 h-4 translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3l14 9-14 9V3z" /></svg>
                              )}
                            </button>

                            <div className="flex-1 space-y-2">
                              <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleSeek}
                                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                style={{
                                  background: `linear-gradient(to right, #6366f1 ${(currentTime / duration) * 100}%, rgba(255,255,255,0.1) ${(currentTime / duration) * 100}%)`
                                }}
                              />
                              <div className="flex justify-between text-[10px] text-white/40 font-mono">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(activeSong.duration || duration)}</span>
                              </div>
                            </div>


                          </div>
                        </div>
                      );
                    })()}

                    {/* Up Next List */}
                    <div className="flex flex-col relative mt-2">
                      <h4 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-3 pl-2">UP NEXT</h4>
                      <div className="h-40 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {generatedSongs.map((song, i) => (
                          <div key={i}
                            onClick={() => togglePlay(song.audio_url)}
                            className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer group ${currentAudio === song.audio_url ? 'bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30' : 'hover:bg-white/5 border border-transparent'}`}>

                            {/* List Art */}
                            <div className={`w-12 h-12 rounded-lg ${currentAudio === song.audio_url ? 'bg-indigo-500' : 'bg-white/10'} flex items-center justify-center text-white relative overflow-hidden flex-shrink-0`}>
                              {song.image_url ? <img src={song.image_url} className="w-full h-full object-cover" /> : <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>}
                            </div>

                            <div className="flex-1 min-w-0 text-left">
                              <h5 className={`font-bold text-sm truncate ${currentAudio === song.audio_url ? 'text-white' : 'text-white/80'}`}>{song.title || "Generated Song"}</h5>
                              <p className="text-xs text-white/40 truncate font-mono">
                                {song.duration ? `${Math.floor(song.duration / 60)}:${String(Math.floor(song.duration % 60)).padStart(2, '0')}` : '2:38'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 mr-2">
                              {currentAudio === song.audio_url && audioRef.current && !audioRef.current.paused ? (
                                <svg className="w-8 h-8 text-indigo-400 drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                              ) : (
                                <svg className="w-8 h-8 text-white/40 hover:text-white transition-colors duration-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                              )}



                              {/*Download button logic */}

                              {/* <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDownload(song.audio_url, song.title || "suno-track");
                                }}
                                className="p-1.5 rounded-full bg-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                                title="Download"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                              </button> */}
                            </div>


                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </section>

        </main>

        {/* Config Modal (Overlay) */}
        {showConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-black/90 border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><span>⚙️</span> Create Personalized Song</h2>
                <div className="flex items-center gap-3">
                  <button onClick={handleClearWords} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-bold uppercase tracking-wider rounded-lg border border-red-500/20 transition-all flex items-center gap-2">
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowConfig(false)}
                    className="p-2 text-white/40 hover:text-white transition-colors bg-white/5 rounded-lg hover:bg-white/10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Person Name</label>
                    <input type="text" value={personName} autoFocus={true} onChange={e => setPersonName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-medium" placeholder="e.g. Anish Bhai" />
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Occasion</label>
                    <input type="text" value={occasion} onChange={e => setOccasion(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-medium" placeholder="e.g. Birthday Celebration" />
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-6 border-t border-white/10">
                <label className="block text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Prompt Preview (Editable)</label>
                <textarea
                  value={promptPreview}
                  onChange={(e) => {
                    setPromptPreview(e.target.value);
                    setIsManualPrompt(true);
                  }}
                  className="w-full bg-black/20 rounded-xl p-4 text-white/80 font-mono text-sm leading-relaxed border border-white/5 min-h-[80px] focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Persistent Audio Element */}
        <audio
          ref={audioRef}
          onEnded={() => { console.log("Audio ended"); setCurrentAudio(null); }}
          onError={(e) => console.error("Audio tag physical error:", e.target.error)}
          hidden
        />
      </div>
    </div>
  );
}

export default App;
