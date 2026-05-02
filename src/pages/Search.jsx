import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchMovies } from "../api/tmdb";
import MovieCard from "../components/MovieCard";

export default function Search() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    
    const [results, setResults ]  = useState([]);
    const [page, setPage ] = useState(1);
    const [totalPages, setTotalPages ] = useState(1);
    const [loading, setLoading ] = useState(false);

    useEffect(() => {
    if (!query) return;

    async function fetchResults() {
        setLoading(true);

        const res = await searchMovies(query, 1);

        setResults(res.data.results);
        setTotalPages(res.data.total_pages);
        setPage(1);

        setLoading(false);
    }

    fetchResults();

}, [query]);

    function loadMore() {
    const next = page + 1;

    searchMovies(query, next).then(res => {
        setResults(prev => [...prev, ...res.data.results]);
        setPage(next);
    });
}

    return (
        <div className="search-page">
            <h2 className="search-heading">
                {loading 
                ? "Searching..." 
            : `Results for "${query}" - ${results.length} movies`}
            </h2>

            <div className="search-grid">
                {results.map(movie => ( 
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            {results.length === 0 && !loading && ( 
                <div className="empty-state"> 
                <p>No movies found for "{query}"</p>
                </div>
            )}

               {page < totalPages && (
        <button className="load-more-btn" onClick={loadMore}>
          Load More
        </button>
      )}
        </div>
    );
}