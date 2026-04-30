import { useState } from "react";
import { FiX } from "react-icons/fi";
import { joinRoom } from "../api/watchTogether";
import { useNavigate } from "react-router-dom";

export default function JoinRoomModal({onClose}) {
    const [code, setCode ] = useState("");
    const [name,setName] = useState(
        localStorage.getItem("cinehub_username") || ""
    );
    const [error, setError ] = useState("");
    const [loading, setLoading ] = useState(false);
    const navigate = useNavigate();

    async function handleJoin(e) {
        e.preventDefault();
        if (!code.trim() || !name.trim()) return;

        setLoading(true);
        setError("");

        localStorage.setItem("cinehub_username", name.trim());

        const result = await joinRoom(code.trim().toUpperCase(), name.trim());

        if (result.success) {
            onClose();
            navigate(`/watch/${code.trim().toUpperCase()}?name=${encodeURIComponent(name.trim())}`);
        } else {
            setError(result.error);
        }
        setLoading(false);
    }

    return ( 
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-card" onClick={e => e.stopPropagation()}>
               <div className="modal-header">
                <h3>Join a Watch Party</h3>
                <button className="modal-close" onClick={onClose}>
                    <FiX size={20}/>
                </button>
               </div>

               <form className="modal-form" onSubmit={handleJoin}>
                <div className="modal-field">
                    <label>Your Name</label>
                    <input 
                    className="modal-input" 
                    placeholder="e.g. Shritha"
                    value={name}
                    onChange={ e => setName(e.target.value)}
                    required
                    />
                </div>

                <div className="modal-field">
                    <label>Room Code</label>
                    <input 
                    className="modal-input code-input"
                    placeholder="e.g. CINE-4829"
                    value={code}
                    onChange={e => setCode(e.target.value.toUpperCase())}
                    maxLength={9}
                    required
                    />
                </div>

                {error && <p className="modal-error">{error}</p>}

                <button type="submit" className="modal-btn" disabled={loading}
                >
                    {loading ? "Joining..." : "Join Watch Party"}
                </button>
               </form>
            </div>
        </div>
    )
}