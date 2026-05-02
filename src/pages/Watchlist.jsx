import { useWatchlist } from "../context/WatchlistContext";
import MovieCard from "../components/MovieCard";
import { Link } from "react-router-dom";

export default function Watchlist() {
    const { watchlist } = useWatchlist();

    if (watchlist.length === 0) {
        return ( 
            <div className="empty-watchlist">
                <p className="empty-emoji">🎬</p>
                <h2>Your watchlist is empty</h2>
                <p>Save movies to watch them later</p>
                <Link to="/" className="browse-btn">Browse Movies</Link>
            </div>
        );
    }

    return ( 
        <div className="watchlist-page">
            <h1 className="page-heading">My Watchlist ({watchlist.length})</h1>
            <div className="search-grid">
                {watchlist.map(movie => ( 
                    <MovieCard key={movie.id} movie={movie}/>
                ))}
            </div>
        </div>
    )
}