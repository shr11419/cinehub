import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FiSearch, FiBookmark, FiFilm } from "react-icons/fi";

export default function Navbar() {
    const [query, setQuery ] = useState("");
    const navigate = useNavigate();

    function handleSearch(e) {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
            setQuery("");
        }
    }

    return (
        <nav className="navbar">
            <Link to="/" className="nav-brand">
            <FiFilm size={22} />
            CineHub
            </Link>

            <form className="nav-search" onSubmit={handleSearch}>
                <FiSearch size={16} className="nav-search-icon" />
                <input type="text" 
                placeholder="Search movies.."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="nav-search-input"
                />
            </form>

            <div className="nav-links">
                <Link to="/watchlist" className="nav-link">
                <FiBookmark size={20} />
                <span>Watchlist</span>
                </Link>
            </div>
        </nav>
    )
}