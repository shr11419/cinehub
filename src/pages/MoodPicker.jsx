import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchMovies } from "../api/tmdb";

const moods = [
  { emoji: "😢", label: "Feeling Sad", prompt: "deeply emotional and healing movies that make you feel understood and hopeful" },
  { emoji: "😂", label: "Want to Laugh", prompt: "hilarious comedy movies that will make you laugh out loud" },
  { emoji: "😱", label: "Thrill Me", prompt: "edge-of-your-seat thriller and horror movies with great suspense" },
  { emoji: "🥰", label: "Romance", prompt: "beautiful romantic movies with great chemistry and love stories" },
  { emoji: "🤯", label: "Mind-Bending", prompt: "complex psychological and sci-fi movies that make you think deeply" },
  { emoji: "🚀", label: "Adventure", prompt: "epic adventure and action movies with stunning visuals" },
  { emoji: "😴", label: "Background Noise", prompt: "easy comfortable movies you can half-watch while relaxing" },
  { emoji: "👨‍👩‍👧", label: "Family Night", prompt: "wholesome family-friendly movies everyone will enjoy" },
];

export default function MoodPicker() {
    const [selectedMood, setSelectedMood ] = useState(null);
    const [movies, setMovies ] = useState([]);
    const [loading, setLoading] = useState(false);
    const [aiMessage, setAiMessage] = useState("");
    const navigate = useNavigate();

    async function handleMoodSelect(mood) {
        setSelectedMood(mood);
        setLoading(true);
        setMovies([]);
        setAiMessage("");

        try {
            //ask gemini to pick 5 movie title for that mood
            const res = await fetch( 
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_KEY}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json"}, 
                    body: JSON.stringify({ 
                        contents: [{
                            parts: [{
                                text: `You are a movie expert. 
The user is feeling: ${mood.label}
They want: ${mood.prompt}
Give exactly 5 movie recommendations. 
Respond ONLY with valid JSON, no markdown, no explanation:
{
  "message": "one warm sentence about why these movies fit their mood",
  "movies": ["Movie Title 1", "Movie Title 2", "Movie Title 3", "Movie Title 4", "Movie Title 5"]
}`
                            }]
                        }],
                        generationConfig: { maxOutputTokens: 300, temperature: 0.8 }
                    })
                }
            );

            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

            //parse json response to gemini
            const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
            setAiMessage(parsed.message);
            
            //search TMDB for each movie title
            const movieResults = await Promise.all( 
                parsed.movies.map(title => 
                    searchMovies(title, 1).then(r => r.data.results[0].catch(() => null)
                )
            ));
              setMovies(movieResults.filter(Boolean));  
            
        }  catch(err) {
            console.log("Mood picker error:", err);
            setAiMessage("Something went wrong. Try again!");
        }
        setLoading(false);
    }

    return ( 
        <div className="mood-page">
            <div className="mood-header">
                <h1 className="mood-title">What's your mood?</h1>
                <p className="mood-sub">Tell us how you feel and we'll find the perfect movie</p>
            </div>

            <div className="mood-grid">
                {moods.map(mood => ( 
                    <button key={mood.label} className={`mood-btn ${selectedMood?.label === mood.label ? "active" : ""}`}
                    onClick={() => handleMoodSelect(mood)}
                    >
                        <span className="mood-emoji">{mood.emoji}</span>
                        <span className="mood-label">{mood.label}</span>
                    </button>
                ))}
            </div>

            {loading && ( 
                <div className="mood-loading">
                    <div className="spinner" />
                    <p>Finding perfect movies for your mood...</p>
                </div>
            )}

            {aiMessage && !loading && (
                <div className="mood-ai-message">
                    <span>🤖</span>
                    <p>{aiMessage}</p>
                </div>

            )}

            {movies.length > 0 && !loading && (
                <div className="mood-results">
                    <div className="search-grid">
                        {movies.map(movie=> ( 
                            <div key={movie.id}
                            className="mood-movie-card"
                            onClick={() => navigate(`/movie/${movie.id}`)}
                            >
                                <img src={movie.poster_path
                      ? `${import.meta.env.VITE_IMG_BASE}/w342${movie.poster_path}`
                      : "https://via.placeholder.com/342x513?text=No+Image"
                  }
                  alt={movie.title}
                  className="mood-poster"
                  />
                  <div className="mood-card-info">
                    <p className="mood-card-title">{movie.title}</p>
                    <p className="mood-card-rating">⭐ {movie.vote_average?.toFixed(1)}</p>
                  </div>
                  </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    ) 
}