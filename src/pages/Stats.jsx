import { useState } from "react";
import {useStats} from "../context/StatsContext";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis} from "recharts";
import { Link } from "react-router-dom";

const IMG = import.meta.env.VITE_IMG_BASE;

const COLORS = ["#e50914", "#f5c518", "#00d2ff", "#7fff00", "#ff69b4", "#ffa500", "#9370db", "#20b2aa"];

export default function Stats() {
    const { watched, clearStats } = useStats();
    const [aiProfile, setAiProfile ] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(false);

    if (watched.length === 0) {
        return (
            <div className="stats-empty">
                <p className="empty-emoji">📊</p>
                <h2>No watch history yet</h2>
                <p>Start watching movies to see your stats!</p>
                <Link to="/" className="browse-btn">Browse Movies</Link>
            </div>
        );
    }

    const genreCounts = {};
    watched.forEach(movie => {
        movie.genres?.forEach(g => {
            genreCounts[g.name] = (genreCounts[g.name] || 0) + 1;
        });
    });

    const genreData = Object.entries(genreCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a,b) => b.value - a.value)
    .slice(0,6);

    //movies per day of week 
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayCounts = Array(7).fill(0);
    watched.forEach(m => {
        const day = new Date(m.watchedAt).getDay();
        dayCounts[day]++;
    });
    const dayData = dayNames.map((name, i) => ({ name, movies: dayCounts[i]}));

    const totalMinutes = watched.reduce((sum, m) => sum + (m.runtime || 0), 0);
    const totalHours = Math.floor(totalMinutes / 60);

    const avgRating = ( 
        watched.reduce((sum, m)=> sum + (m.vote_average || 0), 0) / watched.length
    ).toFixed(1);

    async function generateProfile() {
        setLoadingProfile(true);
        const topGenres = genreData.slice(0,3).map(g => g.name).join(",");
        const titles = watched.slice(-5).map(m => m.title).join(",");

        try {
           const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Based on this person's movie watching data:
- Total movies watched: ${watched.length}
- Top genres: ${topGenres}
- Recent movies: ${titles}
- Average movie rating they watch: ${avgRating}/10
- Total hours watched: ${totalHours}

Write a fun, insightful 3-sentence "Movie Personality Profile" for them.
Be creative and specific. Reference their actual genre preferences.
End with a fun movie lover title like "The Psychological Thriller Connoisseur".`
              }]
            }],
            generationConfig: { maxOutputTokens: 150, temperature: 0.9 }
          }) 
        }
           );
           const data = await res.json();
           const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
           setAiProfile(text);

        } catch {
            setAiProfile("Couldn't generate profile right now. Try again later.");
        }

        setLoadingProfile(false);
    }

    return ( 
        <div className="stats-page">
            <h1 className="stats-title"> Your Watch Stats </h1>

            <div className="stats-cards">
                <div className="stat-card">
                    <p className="stat-number">{watched.length}</p>
                    <p className="stat-label">Movies Watched</p>
                </div>
                <div className="stat-card">
                    <p className="stat-number">{totalHours}h</p>
                    <p className="stat-label">Total Watch Time</p>
                </div>
                <div className="stat-card">
                    <p className="stat-number"> {avgRating}</p>
                    <p className="stat-label">Avg Rating</p>
                </div>
                <div className="stat-card">
                    <p className="stat-number">{genreData[0]?.name || "-"}</p>
                    <p className="stat-label">Top Genre</p>
                </div>
            </div>

            <div className="stats-charts">
                <div className="chart-box">
                    <h3 className="chart-title">Genre Breakdown</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie 
                            data={genreData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={3}
                            dataKey="value"
                        >
                            {genreData.map((_, i) => (
                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                        contentStyle={{background:  "#1f1f1f", border: "none", color: "white" }}
                        />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="chart-legend">
                        {genreData.map((g, i) => (
                            <div key={g.name} className="lengend-item">
                                <div className="legend-dot" style={{background: COLORS[i]}} />
                                <span>{g.name} ({g.value})</span>
                                </div>
                        ))}
                    </div>
                </div>

                <div className="chart-box">
                    <h3 className="chart-title">Movies by Day</h3>
                    <ResponsiveContainer width="100%" height= {220}>
                       <BarChart data={dayData}>
                        <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                        <YAxis stroke="#aaa" fontSize={12} allowDecimals={false} />
                        <Tooltip 
                        contentStyle={{background: "#1f1f1f", border: "none", color: "white"}}
                        />
                        <Bar dataKey="movies" fill="#e50914" radius={[4, 4, 0, 0]} />
                       </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="profile-box">
                <h3 className="chart-title"> Your Movie Personality</h3>
                {aiProfile ? ( 
                    <p className="ai-profile-text">{aiProfile}</p>
                ) : ( 
                    <button 
                    className="generate-profile-btn"
                    onClick={generateProfile}
                    disabled={loadingProfile}
                >
                    {loadingProfile ? "Generating..." : "Genrate My Movie Personality"}
                </button>
                )}
            </div>

            <div className="recent-watched">
                <h3 className="chart-title">Recently Watched</h3>
                <div className="recent-grid">
                    {watched.slice().reverse().slice(0, 8).map(movie => ( 
                        <Link key={movie.id} to={`/movie/${movie.id}`} className="recent-card">
                            <img src={ 
                                movie.poster_path ?
                                `${IMG}/w185${movie.poster_path}` :
                                "https://via.placeholder.com/185x278?text=?"
                            }
                            alt={movie.title}
                            className="recent-poster"
                            />
                            <p className="recent-title">{movie.title}</p>
                        </Link>
                    ))}
                </div>
            </div>

            <button className="clear-stats-btn" onClick={clearStats}>
                Clear Watch History
            </button>
        </div>
    );
}