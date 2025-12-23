import { useState, useRef } from 'react';

const SongResult = ({ song }) => {
    const audioRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    // Graceful fallback if song is just an ID or incomplete
    if (!song) return null;

    // Handle if song is just a raw string (sometimes just ID returned)
    if (typeof song === 'string') {
        return (
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center justify-between">
                <div>
                    <div className="font-mono text-sm text-gray-400">ID: {song}</div>
                    <div className="text-xs text-yellow-500 mt-1">Pending... check back later</div>
                </div>
            </div>
        );
    }

    // Map Suno API fields to our display
    const audioUrl = song.audioUrl || song.audio_url;
    const imageUrl = song.imageUrl || song.image_url;
    const title = song.title || "Untitled Track";
    const tags = song.tags || song.style;
    const status = song.status;

    const formatTime = (time) => {
        if (isNaN(time)) return '0:00';
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            // Check if duration is valid number (infinity sometimes happens with streams)
            const d = audioRef.current.duration;
            if (!isNaN(d) && d !== Infinity) {
                setDuration(d);
            } else if (song.metadata?.duration) {
                setDuration(song.metadata.duration);
            }
        }
    };

    const togglePlay = (e) => {
        e.stopPropagation();
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            // Pause all other audios (optional, but good UX)
            document.querySelectorAll('audio').forEach(el => {
                if (el !== audioRef.current) {
                    el.pause();
                }
            });
            audioRef.current.play().catch(err => {
                console.error("Playback failed:", err);
                setIsPlaying(false);
            });
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="bg-white/5 border border-white/5 p-3 rounded-xl flex items-center gap-4 transition-all hover:bg-white/10 group cursor-pointer relative overflow-hidden" onClick={togglePlay}>

            {/* Glowing Overlay on Hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-white/5 to-transparent pointer-events-none`}></div>

            {/* Artwork */}
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 relative shadow-lg">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ backgroundImage: 'var(--primary-gradient)' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
                <h3 className="font-bold text-sm text-white truncate leading-tight">{title}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-white/40 text-xs truncate font-mono">
                        {audioUrl ? `${formatTime(currentTime)} / ${formatTime(duration || song.metadata?.duration || 0)}` : (song.metadata?.type || 'Generated Track')}
                    </span>

                    {status && status !== 'complete' && (
                        <span className={`text-[9px] font-bold px-1.5 py-px rounded uppercase tracking-wide ${status === 'streaming' ? 'bg-green-500/20 text-green-400' :
                            (status === 'error' || status === 'failed') ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                            }`}>
                            {status === 'streaming' ? 'LIVE' : status}
                        </span>
                    )}
                </div>
            </div>

            {/* Action */}
            <div className="flex-shrink-0">
                {audioUrl ? (
                    <>
                        <audio
                            ref={audioRef}
                            src={audioUrl}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onEnded={() => setIsPlaying(false)}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            className="hidden"
                        />
                        <button
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current" viewBox="0 0 24 24">
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 fill-current ml-0.5" viewBox="0 0 24 24">
                                    <path d="M3 22v-20l18 10-18 10z" />
                                </svg>
                            )}
                        </button>
                    </>
                ) : (
                    <div className="w-8 h-8 flex items-center justify-center">
                        {(status === 'error' || status === 'failed') ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <span className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SongResult;
