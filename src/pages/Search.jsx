import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies } from "../api/tmdb";
import MovieCard from "../components/MovieCard";

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);


  const [freeResults, setFreeResults] = useState([]);
  const [freeLoading, setFreeLoading] = useState(false);


  const [activeTab, setActiveTab] = useState("tmdb"); 

  useEffect(() => {
    if (!query) return;

    async function fetchResults() {
      setLoading(true);
      setResults([]);
      setPage(1);

      try {
        const res = await searchMovies(query, 1);
        setResults(res.data.results);         
        setTotalPages(res.data.total_pages);  
      } catch (err) {
        console.error("Search error:", err);
      }

      setLoading(false);
    }

    fetchResults();
  }, [query]);


  useEffect(() => {
    if (!query) return;

    async function fetchFree() {
      setFreeLoading(true);
      setFreeResults([]);

      try {
        const encoded = encodeURIComponent(query);
        const url =
          `https://archive.org/advancedsearch.php` +
          `?q=title:(${encoded})+AND+mediatype:movies` +
          `&fl=identifier,title,year,description` +
          `&output=json&rows=20`;

        const res = await fetch(url);
        const data = await res.json();
        setFreeResults(data.response?.docs || []);
      } catch (err) {
        console.error("Archive search error:", err);
      }

      setFreeLoading(false);
    }

    fetchFree();
  }, [query]);

  function loadMore() {
    const next = page + 1;
    searchMovies(query, next).then(res => {
      setResults(prev => [...prev, ...res.data.results]); // ✅ fixed
      setPage(next);
    });
  }

  const isLoading = activeTab === "tmdb" ? loading : freeLoading;
  const isEmpty = activeTab === "tmdb"
    ? results.length === 0 && !loading
    : freeResults.length === 0 && !freeLoading;

  return (
    <div className="search-page">

      <h2 className="search-heading">
        {isLoading
          ? "Searching..."
          : `Results for "${query}"`}
      </h2>

      {query && (
        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === "tmdb" ? "active" : ""}`}
            onClick={() => setActiveTab("tmdb")}
          >
            🎬 All Movies
            {results.length > 0 && (
              <span className="tab-count">{results.length}</span>
            )}
          </button>
          <button
            className={`search-tab ${activeTab === "free" ? "active" : ""}`}
            onClick={() => setActiveTab("free")}
          >
            🆓 Free Movies
            {freeResults.length > 0 && (
              <span className="tab-count">{freeResults.length}</span>
            )}
          </button>
        </div>
      )}

      {activeTab === "tmdb" && (
        <>
          {loading ? (
            <div className="search-loading">
              <div className="spinner" />
            </div>
          ) : (
            <div className="search-grid">
              {results.map(movie => ( // ✅ fixed markdown link
                <MovieCard key={movie.id} movie={movie} /> // ✅ fixed
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="empty-state">
              <p>😕 No movies found for "{query}"</p>
            </div>
          )}

          {page < totalPages && !loading && (
            <button className="load-more-btn" onClick={loadMore}>
              Load More
            </button>
          )}
        </>
      )}

      {activeTab === "free" && (
        <>
          {freeLoading ? (
            <div className="search-loading">
              <div className="spinner" />
            </div>
          ) : (
            <div className="free-grid">
              {freeResults.map(movie => (
                <FreeSearchCard key={movie.identifier} movie={movie} />
              ))}
            </div>
          )}

          {isEmpty && (
            <div className="empty-state">
              <p>😕 No free movies found for "{query}"</p>
              <p style={{ fontSize: 13, marginTop: 8, color: 'var(--text-3)' }}>
                Try searching on the Free Movies page instead
              </p>
            </div>
          )}
        </>
      )}

    </div>
  );
}

function FreeSearchCard({ movie }) {
  const thumb = `https://archive.org/services/img/${movie.identifier}`;
  const watchUrl = `https://archive.org/details/${movie.identifier}`;

  return (
    <a
      href={watchUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="free-search-card"
    >
      <div className="free-search-thumb">
        <img
          src={thumb}
          alt={movie.title}
          onError={e => {
            e.target.src =
              "https://via.placeholder.com/300x200?text=No+Image";
          }}
        />
        <div className="free-search-overlay">
          <span>▶ Watch Free</span>
        </div>
      </div>
      <div className="free-search-info">
        <p className="free-search-title">{movie.title}</p>
        {movie.year && (
          <p className="free-search-year">{movie.year}</p>
        )}
        <span className="free-badge">FREE</span>
      </div>
    </a>
  );
}