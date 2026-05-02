import { createContext, useContext, useState, useEffect } from "react";
const StatsContext = createContext();

export default function StatsProvider({children}) {
    const [watched, setWatched ] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("cinehub_watched")) || [];
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem("cinehub_watched", JSON.stringify(watched));
    }, [watched]);
    
    //call this when user clicks to play on any movie
    function logWatch(movie) {
       setWatched(prev => {
        const exists = prev.find(m => m.id === movie.id);
        if (exists) return prev;
        return [...prev, {
            id: movie.id,
            title: movie.title,
            poster_path: movie.poster_path,
            genres: movie.genres || [],
            vote_average: movie.vote_average,
            runtime: movie.runtime || 0,
            watchedAt:new Date().toISOString(),
        }];
       });
    }

    function clearStats() {
        setWatched([]);
    }

    return (
  <StatsContext.Provider value={{ watched, logWatch, clearStats }}>
    {children}
  </StatsContext.Provider>
);
}

export function useStats() {
    return useContext(StatsContext);
}