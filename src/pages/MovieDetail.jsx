import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiPlay, FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";

import {
    getMovieDetails, 
    getMovieVideos, 
    getMovieCredits, 
    getSimilarMovies,
} from "../api/tmdb";
import { useWatchlist } from "../context/WatchlistContext";
import VideoPlayer from "../components/VideoPlayer";
import MovieRow from "../components/MovieRow";
import MovieCompanion from "../components/MovieCompanion";


const IMG = import.meta.env.VITE_IMG_BASE;

export default function MovieDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleWatchlist, isInWatchlist } = useWatchlist();

    const [movie, setMovie] = useState(null);
    const [videoKey, setVideoKey] = useState(null);
    const [cast, setCast] = useState([]);
    const [similar, setSimilar] = useState([]);
    const [showPlayer, setShowPlayer] = useState(false);
    const [loading, setLoading] = useState(true);

   useEffect(() => {
    window.scrollTo(0, 0);

    async function fetchMovie() {
        setLoading(true);

        const [details, videos, credits, sim] = await Promise.all([
            getMovieDetails(id),
            getMovieVideos(id),
            getMovieCredits(id),
            getSimilarMovies(id),
        ]);

        setMovie(details.data);

        const trailer = videos.data.results.find(
            v => v.type === "Trailer" && v.site === "YouTube"
        );

        setVideoKey(trailer?.key || null);
        setCast(credits.data.cast.slice(0, 10));
        setSimilar(sim.data.results);

        setLoading(false);
    }

    fetchMovie();

}, [id]);
    if (loading) {
        return (
            <div className="detail-loading">
                <div className="spinner" />
            </div>
        );
    }

    if (!movie) return null;

    const backdrop = movie.backdrop_path ?
    `${IMG}/original${movie.backdrop_path}`
    : null;

    const poster = movie.poster_path 
    ? `${IMG}/w342${movie.poster_path}`
    : null;

    const saved = isInWatchlist(movie.id);
    const hours = Math.floor(movie.runtime / 60);
    const mins = movie.runtime % 60;

    return ( 
        <div className="detail-page">
            {backdrop && ( 
                <div className="detail-backdrop" 
                style={{ backgroundImage: `url(${backdrop})`}}
            >
                <div className="detail-backdrop-overlay" />
                </div>
            )}

            <div className="detail-content">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <FiArrowLeft size={20} /> Back
                </button>
            
            <div className="detail-main">
                {poster && ( 
                    <img src={poster} alt={movie.title} className="detail-poster" />
                )}

            <div className="detail-info">
                <h1 className="detail-title">{movie.title}</h1>
                <div className="detail-meta">
                    <span>⭐ {movie.vote_average?.toFixed(1)}</span>
                    <span>{movie.release_date?.slice(0, 4)}</span>
              {movie.runtime > 0 && <span>{hours}h {mins}m</span>}
                </div>
                <div className="detail-genres">
                    {movie.genres?.map(g => ( 
                        <span key={g.id} className="genre-chip">{g.name}</span>
                    ))}
                </div>

                <p className="detail-overview">{movie.overview}</p>

                <div className="detail-actions"> 
                    {videoKey ? (
                    <button className="play-btn" onClick={() => setShowPlayer(true)}
                >  <FiPlay fill="white" size={18} /> Play Trailer
                </button> 
                ) : ( 
                   <span className="no-trailer">No trailer available</span>
                )}

                <button className={`watchlist-btn ${saved ? "saved" : ""}`}
                onClick={() => toggleWatchlist(movie)}
                > 
                {saved 
                ? <><FaBookmark size={16}/> Saved </>
                : <><FiBookmark size={16}/> Watchlist</> }

                </button>
                </div>

                {cast.length > 0 && (
                    <div className="detail-cast"> 
                    <h3>Cast</h3>
                    <div className="cast-list">
                        {cast.map(member => ( 
                            <div key={member.id} className="cast-member">
                                <img
                              src={
                             member.profile_path
                              ? `${IMG}/w92${member.profile_path}`
                                : "https://via.placeholder.com/92x138?text=?"
                               }
                                alt={member.name} 
                                className="cast-photo"
                                />
                                <p className="cast-name">{member.name}</p>
                                <p className="cast-character">{member.character}</p>
                                </div>
                        ))}
            </div>
            </div>
                )}
            </div>
        </div>
    
    {similar.length > 0 && ( 
        <div className="similar-section"> 
        <MovieRow title="Similar Movies" movies={similar} />
        </div>
    )}
    {movie && <MovieCompanion movie={movie} />}
    </div>

    {showPlayer && videoKey && ( 
        <VideoPlayer 
        videoKey={videoKey} 
        onClose={() => setShowPlayer(false)}
        />
    )}
    </div>);
}