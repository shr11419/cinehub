import { Link } from "react-router-dom";
import { FiBookmark } from "react-icons/fi";
import { FaBookmark } from "react-icons/fa";
import { useWatchlist } from "../context/WatchlistContext";

const IMG = import.meta.env.VITE_IMG_BASE;

export default function MovieCard({movie}) {
    const { toggleWatchlist, isInWatchlist } = useWatchlist();
    const saved = isInWatchlist(movie.id);

    const poster = movie.poster_path ? 
    `${IMG}/w342${movie.poster_path}`
    : "https://via.placeholder.com/342x512?text=No+Image";

    const year = movie.release_date?.slice(0,4) || "N/A";
    const rating = movie.vote_average?.toFixed(1) || "N/A";

    return ( 
        <div className="movie-card">
        <button className="card-bookmark" onClick={(e) => {
            e.preventDefault();
            toggleWatchlist(movie);
        }}
        > 
        {saved ? <FaBookmark className="bookmark-filled" /> : <FiBookmark/> }
        </button>

        <Link to={`/movie/${movie.id}`}>
        <img src={poster} alt={movie.title}
        className="card-poster" 
        loading="lazy" />
        <div className="card-info">
        <p className="card-title">{movie.title}
        </p>
        <div className="card-meta"> 
        <span className="card-year">{year}</span>
        <span className="card-rating">⭐ {rating}</span>
        </div>
        </div>
        </Link>
        </div>
    )
}