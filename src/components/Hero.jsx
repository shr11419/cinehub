import {useState, useEffect } from "react";
import { useNavigate} from "react-router-dom";
import { FiPlay, FiInfo } from "react-icons/fi";
import { getTrending } from "../api/tmdb";

const IMG = import.meta.env.VITE_IMG_BASE;

export default function Hero() {
    const [movie, setMovie ] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getTrending().then(res => {
            const results = res.data.results;
            const random = results[Math.floor(Math.random() * 10)];
            setMovie(random);
        });
    }, []);

    if (!movie) return <div className="hero-skeleton"/>

    const backdrop = `${IMG}/original${movie.backdrop_path}`;
    const year = movie.release_date?.slice(0,4);
    const rating = movie.vote_average?.toFixed(1);

    return (
        <div className="hero" 
        style={{backgroundImage: `url(${backdrop})`}}
    >

        <div className="hero-overlay"/>
        <div className="hero-content">
    <div className="hero-badges">
        <span className="hero-badge"> {rating}</span>
        <span className="hero-badge">{year}</span>
    </div>
    <h1 className="hero-title">{movie.title}</h1>
    <p className="hero-overview">{movie.overview?.slice(0,180)}...</p>
    <div className="hero-actions">   {/* Bug 6 — was hero-action not hero-actions */}
        <button className="hero-play-btn" onClick={() => navigate(`/movie/${movie.id}`)}>
            <FiPlay fill="white" size={18} /> Play Trailer
        </button>
        <button className="hero-info-btn" onClick={() => navigate(`/movie/${movie.id}`)}>
            <FiInfo size={18} /> More Info
        </button>
    </div>
</div>
</div>
    )
}