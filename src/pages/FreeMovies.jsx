import { useState, useEffect } from "react";
import { getFreeMovies, getArchiveThumbnail, getArchiveEmbedUrl } from "../api/archive";
import { FiPlay } from "react-icons/fi";

export default function FreeMovies() {
    const [movies, setMovies] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(null);

    useEffect(() => {
    async function fetchMovies() {
        setLoading(true);

        const { movies: m } = await getFreeMovies(page);

        if (page === 1) setMovies(m);
        else setMovies(prev => [...prev, ...m]);

        setLoading(false);
    }

    fetchMovies();
}, [page]);

    return (
        <div className="free-page">
            <div className="free-page-header">
                <h1 className="free-page-title"> Free Movies</h1>
                <p className="free-page-sub">
                    Full movies, completely free and legal — public domain classics
                </p>
            </div>

            {loading && page === 1 ? (
                <div className="free-loading">
                    <div className="spinner" />
                </div>
            ) : (
                <>
                    <div className="free-grid">
                        {movies.map(movie => (
                            <div key={movie.identifier} className="free-card">
                                <div className="free-card-thumb">
                                    <img
                                        src={getArchiveThumbnail(movie.identifier)}
                                        alt={movie.title}
                                        onError={e => {
                                            e.target.src = "https://via.placeholder.com/300x200?text=No+Image";
                                        }}
                                    />
                                    <button
                                        className="free-play-overlay"
                                        onClick={() => setPlaying(movie)}
                                    >
                                        <FiPlay fill="white" size={32} />
                                    </button>
                                </div>
                                <div className="free-card-info">
                                    <p className="free-card-title">{movie.title}</p>
                                    <p className="free-card-year">{movie.year}</p>
                                    <span className="free-badge">FREE</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        className="load-more-btn"
                        onClick={() => setPage(p => p + 1)}
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Load More Free Movies"}
                    </button>
                </>
            )}

            {playing && (
                <div className="player-overlay" onClick={() => setPlaying(null)}>
                    <div className="player-wrapper" onClick={e => e.stopPropagation()}>
                        <div className="player-header">
                            <div className="player-header-left">
                                <span className="player-movie-title">{playing.title}</span>
                                <span className="source-badge free"> Full Movie — Free</span>
                            </div>
                            <button className="player-close-btn" onClick={() => setPlaying(null)}>
                                ✕
                            </button>
                        </div>
                        <div className="player-screen">
                            <iframe
                                src={getArchiveEmbedUrl(playing.identifier)}
                                className="player-iframe"
                                frameBorder="0"
                                allowFullScreen
                                title={playing.title}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}