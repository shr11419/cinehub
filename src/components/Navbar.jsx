import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiShoppingBag, FiHeart, FiMenu, FiSearch,
         FiBookmark, FiBarChart2, FiSmile, FiUsers } from "react-icons/fi";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import JoinRoomModal from "./JoinRoomModal";

export default function Navbar({ theme, setTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [query, setQuery] = useState("");

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setQuery("");
    }
  }

  const links = [
    { to: "/free",      label: "Free Movies", icon: <FiBookmark size={15} /> },
    { to: "/mood",      label: "Mood Pick",   icon: <FiSmile size={15} /> },
    { to: "/stats",     label: "Stats",       icon: <FiBarChart2 size={15} /> },
    { to: "/watchlist", label: "Watchlist",   icon: <FiHeart size={15} /> },
  ];

  return (
    <>
      <nav className="navbar">
        {/* LOGO */}
        <Link to="/" className="nav-brand">
          <img src="/cine.svg" alt="CineHub" className="nav-logo-icon" />
          <span className="nav-logo-text">
            Cine<span>Hub</span>
          </span>
        </Link>

        {/* SEARCH — desktop */}
        {!isMobile && (
          <form className="nav-search" onSubmit={handleSearch}>
            <FiSearch size={15} className="nav-search-icon" />
            <input
              className="nav-search-input"
              placeholder="Search films..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </form>
        )}

        {/* LINKS — desktop */}
        {!isMobile && (
          <div className="nav-links">
            {links.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={`nav-link ${location.pathname === l.to ? "active-link" : ""}`}
              >
                {l.icon}
                {l.label}
              </Link>
            ))}
            <button className="nav-join-btn" onClick={() => setShowJoin(true)}>
              <FiUsers size={14} />
              Join Room
            </button>
          </div>
        )}

        {/* HAMBURGER — mobile */}
        {isMobile && (
          <button className="hamburger" onClick={() => setSidebarOpen(true)}>
            <FiMenu size={18} />
          </button>
        )}
      </nav>

      {/* MOBILE SIDEBAR */}
      {isMobile && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
          <div className="sidebar" onClick={e => e.stopPropagation()}>
            <div className="sidebar-brand">
              Cine<span>Hub</span>
            </div>

            <input
              placeholder="Search films..."
              className="sidebar-search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter" && query.trim()) {
                  navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                  setQuery("");
                  setSidebarOpen(false);
                }
              }}
            />

            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setSidebarOpen(false)}>
                {l.icon} {l.label}
              </Link>
            ))}

            <button
              className="sidebar-nav-btn"
              onClick={() => { setSidebarOpen(false); setShowJoin(true); }}
            >
              <FiUsers size={15} /> Join Room
            </button>

            <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {showJoin && <JoinRoomModal onClose={() => setShowJoin(false)} />}
    </>
  );
}