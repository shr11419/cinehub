import { useState, useEffect } from "react";
import { FiX, FiLoader } from "react-icons/fi";
import { findMovieOnArchive, getArchiveEmbedUrl } from "../api/archive";

export default function SmartPlayer({movie, videoKey,onClose }) {
    const [archiveId, setArchiveId ] = useState(null);
    const [checking, setChecking ] = useState(true);
    const [source, setSource ] = useState(null);

    useEffect(() => {
        async function findFreeMovie() {
            setChecking(true);

            const year = movie.release_date?.slice(0,4);
    const found = await findMovieOnArchive(movie.title, year);

    if(found) {
        setArchiveId(found.identifier);
        setSource("archive");
    } else if (videoKey) {
        setSource("youtube");
    } else {
        setSource("none");
    }

    setChecking(false);
}
findFreeMovie();
    }, [movie.title, movie.release_date, videoKey]);

    return ( 
      <div className="player-overlay" onClick={onClose}>
        <div className="player-wrapper" onClick={ e => e.stopPropagation()}>

            <div className="player=header">
                <div className="player-header-left">
                    <span className="player-movie-title">{movie.title}</span>
                    {source === "archive" && ( 
                        <span className="source-badge free">🎬 Full Movie — Free</span>
                    )}
                    {source === "youtube" && ( 
                        <span className="source-badge trailer">🎞️ Official Trailer</span>
                    )}
                </div>
                <button className="player-close-btn" onClick={onClose}>
                    <FiX size={22}/>
                </button>
            </div>

            <div className="player-screen">
                {checking && ( 
                    <div className="player-checking">
                        <div className="spinner" />
                        <p>Finding best source...</p>
                    </div>
                )}

                {!checking && source === "archive" && ( 
                    <iframe src={getArchiveEmbedUrl(archiveId)}
                    className="player-iframe"
                    frameBorder="0"
                    allowFullScreen
                    allow="fullscreen"
                    title={movie.title}
                />
                )}

                {!checking && source === "youtube" && ( 
                    <>
                    <div className="trailer-notice">
                        Full Movie not available for free
                    </div>
                    <iframe 
                    src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                    className="player-iframe"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen 
                    title="Trailer"
                    />
                    </>
                )}

                {!checking && source === 'none' && ( 
                    <div className="player-unavailable">
                        <p>Nothing available to play for this movie</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    )

} 

