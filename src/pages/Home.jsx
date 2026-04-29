import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import {
    getTrending, 
    getTopRated,
    getNowPlaying, 
} from "../api/tmdb";

export default function Home() {
    const [trending, setTrending] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);

    //fetching all rows in parallel using promise.all
    useEffect(() => {
        Promise.all([
            getTrending(), 
            getTopRated(),
            getNowPlaying(), 
        ]).then(([t, tr, np]) => {
            setTrending(t.data.results);
            setTopRated(tr.data.results);
            setNowPlaying(np.data.results);
        });
    }, []);

    return( 
        <div className="home"> 
        <Hero/>
        <div className="rows-container"> 
        <MovieRow title="🔥 Trending This Week" movies={trending} />
        <MovieRow title="🎬 Now Playing" movies={nowPlaying} />
        <MovieRow title="⭐ Top Rated" movies={topRated} />
        </div>
        </div>
    );
}
