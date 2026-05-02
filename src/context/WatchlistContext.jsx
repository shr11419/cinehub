import { createContext, useContext, useState, useEffect } from "react";

const WatchlistContext = createContext();

export default function WatchlistProvider({children}) {
    const [watchlist, setWatchlist] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("cinehub_watchlist")) || [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem("cinehub_watchlist", JSON.stringify(watchlist));
    }, [watchlist]);

    function toggleWatchlist(movie) {
        setWatchlist(prev => {
            const exists = prev.find(m => m.id === movie.id);
            if(exists) return prev.filter(m => m.id !== movie.id);
            return [...prev, movie];
        });
    }

    function isInWatchlist(id) {
        return watchlist.some(m => m.id === id);
    }

    return (
        <WatchlistContext.Provider value={{watchlist, toggleWatchlist, isInWatchlist}}>
            {children}
        </WatchlistContext.Provider>
    );
}

export function useWatchlist() {
    return useContext(WatchlistContext);
}