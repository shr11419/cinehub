import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import MovieRow from "../components/MovieRow";
import {
    getTrending, 
    getTopRated,
    getNowPlaying, 
    getPopular,
} from "../api/tmdb";

export default function Home() {
    const [trending, setTrending] = useState([]);
    const [topRated, setTopRated] = useState([]);
    const [nowPlaying, setNowPlaying] = useState([]);
    const [popular, setPopular] = useState([]);

    //fetching all rows in parallel using promise.all
    useEffect(() => {
        Promise.all([
            getTrending(), 
            getTopRated(),
            getNowPlaying(), 
            getPopular(),
        ]).then(([t, tr, np, p]) => {
            setTrending(t.data.results);
            setTopRated(tr.data.results);
            setNowPlaying(np.data.results);
            setPopular(p.data.results);
        });
    }, []);

    return( 
        <div className="home"> 
        <Hero/>
        <div className="rows-container"> 
        <MovieRow title="🔥 Trending This Week" movies={trending} />
        <MovieRow title="🎬 Now Playing" movies={nowPlaying} />
        <MovieRow title="⭐ Top Rated" movies={topRated} />
        <MovieRow title="🍿 Popular" movies={popular} />
        </div>
        </div>
    );
}
