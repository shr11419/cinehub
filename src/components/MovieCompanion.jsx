import { useState, useRef, useEffect } from "react";
import {FiMessageCircle, FiX, FiSend } from "react-icons/fi";

const API_BASE = import.meta.env.VITE_API_BASE || "";

export default function MovieCompanion({movie}) {
    const [open, setOpen ] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            content: `Hi! I'm your movie companion for **${movie.title}** 🎬 Ask me anything — cast, director, plot, trivia, similar movies, or awards!`
        }
    ]);
    const [input, setInput ] = useState("");
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth"});
    }, [messages]);

    async function send() {
        if (!input.trim() || loading) return;

        const userText = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userText}]);
        setInput("");
        setLoading(true);

        try {
        const res = await fetch(`${API_BASE}/api/chat`, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({
  messages: [...messages, { role: "user", content: userText }],
  movieContext: {
    title: movie.title,
    year: movie.release_date?.slice(0, 4),
    rating: movie.vote_average,
    overview: movie.overview,
    genres: movie.genres?.map(g => g.name).join(", ")
  }
})
     });

            const data = await res.json();
            const reply = data.reply; 

            setMessages(prev => [...prev, {role: "assistant", content: reply }]);
        } catch {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Something went wrong. Try again!"
            }]);
        }
        setLoading(false);
    }

    function handleKey(e) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    }

    return ( 
        <>
        { open && ( 
            <div className="companion-window">
                <div className="companion-header">
                    <div className="companion-header-info">
                        <span className="companion-avatar">🎬</span>
                        <div>
                            <p className="companion-name">Movie Companion</p>
                            <p className="companion-movie">{movie.title}</p>
                        </div>
                    </div>
                    <button className="companion-close" onClick={() => setOpen(false)}>
                        <FiX size={18} />
                    </button>
                </div>

                <div className="companion-messages">
                    {messages.map((msg, i) => (
                        <div key={i}
                        className={`companion-bubble ${msg.role === "user" ? "user" : "bot"}`}
                        >
                            {msg.content}
                        </div>
                    ))}
                    {loading && ( 
                        <div className="companion-bubble bot">
                            <div className="chatbot-typing">
                                <span /> <span /> <span />
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>

                <div className="companion-input-row">
                    <input 
                    className="companion-input"
                    placeholder="Ask about this movie..."
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKey}
                />
                <button className="companion-send"
                onClick={send}
                disabled={!input.trim() || loading}
                >
                    <FiSend size={16} />
                </button>
                </div>
            </div>
        )}

        <button className="companion-fab" onClick={() => setOpen(p => !p)}>
            {open ? <FiX size={20} /> : <FiMessageCircle size={20} />} 
            {!open && <span>Ask AI</span>}
        
        </button>
        </>
    )
}
