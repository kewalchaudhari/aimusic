import { useState, useEffect } from 'react';
import { generateSong } from '../api';

const GENRES = [
    'Pop',
    'Rock',
    'Hip Hop',
    'Electronic',
    'Classical',
    'Jazz',
    'Country',
    'R&B',
    'Reggae',
    'Blues',
    'Folk',
    'Metal',
    'Indie',
    'Latin',
    'K-Pop',
    'Bollywood',
    'Devotional',
    'Sufi'
];

const GenerationForm = ({ onStart, onSuccess, onError, isLoading, initialPrompt }) => {
    const [customMode, setCustomMode] = useState(false);
    const [instrumental, setInstrumental] = useState(false);
    const [formData, setFormData] = useState({
        prompt: '',
        style: '',
        title: '',
        genre: 'Pop'
    });

    // Pre-fill prompt from URL parameter
    useEffect(() => {
        if (initialPrompt) {
            setFormData(prev => ({ ...prev, prompt: initialPrompt }));
        }
    }, [initialPrompt]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        onStart();

        try {
            // detailed prompt construction
            let finalPrompt = formData.prompt;
            if (!customMode && formData.genre) {
                finalPrompt = `${formData.genre} song about: ${formData.prompt} `;
            }

            const payload = {
                customMode,
                instrumental,
                model: 'V5', // Always V5
                prompt: finalPrompt,
                style: customMode ? (formData.style || formData.genre) : undefined,
                title: activeFields.title ? formData.title : undefined,
            };

            if (!customMode) {
                payload.style = undefined;
                payload.title = undefined;
            }

            await generateSong(payload)
                .then(data => onSuccess(data))
                .catch(err => onError(err));

        } catch (err) {
            onError(err);
        }
    };

    const activeFields = {
        prompt: !customMode || (customMode && !instrumental),
        style: customMode,
        title: customMode,
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">

            <div className="space-y-3">
                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Prompt</label>
                <textarea
                    name="prompt"
                    value={formData.prompt}
                    onChange={handleChange}
                    maxLength={customMode ? 5000 : 500}
                    rows={4}
                    className="input-field w-full rounded-xl p-4 text-lg placeholder-white/15 resize-none transition-all h-40"
                    placeholder={customMode ? "Enter lyrics or description..." : "A futuristic synthwave track about neon cities..."}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Genre</label>
                    <div className="relative">
                        <select
                            name="genre"
                            value={formData.genre}
                            onChange={handleChange}
                            className="input-field w-full rounded-xl p-4 appearance-none cursor-pointer font-medium"
                        >
                            {GENRES.map(genre => (
                                <option key={genre} value={genre} className="bg-gray-900 text-white">
                                    {genre}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-white/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Mode</label>
                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={() => setCustomMode(!customMode)}
                            className={`flex-1 px-4 py-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium min-h-[56px] ${customMode ? 'bg-[image:var(--primary-gradient)] border-transparent text-white shadow-lg' : 'glass-btn border-white/10 text-white/60'}`}
                        >
                            <span className="whitespace-nowrap">{customMode ? 'Custom On' : 'Custom Off'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setInstrumental(!instrumental)}
                            className={`flex-1 px-4 py-3.5 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium min-h-[56px] ${instrumental ? 'bg-[image:var(--primary-gradient)] border-transparent text-white shadow-lg' : 'glass-btn border-white/10 text-white/60'}`}
                        >
                            <span className="whitespace-nowrap">{instrumental ? 'Instrumental' : 'Vocal'}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Title - Only in Custom Mode */}
            {activeFields.title && customMode && (
                <div className="animate-fade-in space-y-3">
                    <label className="block text-xs font-bold text-white/40 uppercase tracking-widest">Title</label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        maxLength={100}
                        className="input-field w-full rounded-xl p-4 placeholder-white/15"
                        placeholder="My Awesome Track"
                    />
                </div>
            )}

            {/* Style - Only in Custom Mode */}
            {activeFields.style && (
                <div className="animate-fade-in space-y-2">
                    <label className="block text-sm font-medium text-white/50 uppercase tracking-wide">Style</label>
                    <textarea
                        name="style"
                        value={formData.style}
                        onChange={handleChange}
                        maxLength={1000}
                        rows={2}
                        className="glass-input w-full rounded-xl p-3 placeholder-white/20 resize-none"
                        placeholder="Fast tempo, heavy bass..."
                    />
                </div>
            )}

            <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 rounded-xl text-lg font-bold mt-6 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-white/20 active:scale-[0.98] transition-all text-white"
                style={{ backgroundImage: 'var(--primary-gradient)' }}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Creating Magic...
                    </span>
                ) : 'Generate Track'}
            </button>
        </form>
    );
};

export default GenerationForm;
