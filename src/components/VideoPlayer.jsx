import { FiX } from "react-icons/fi";

export default function VideoPlayer({videoKey, onClose}) {

    return ( 
        <div className="player-overlay" onClick={onClose}>
        <div className="player-container" onClick={e => e.stopPropagation()}>
        <button className="player-close" onClick={onClose}> 
           <FiX size={24} />
        </button>
        <iframe className="player-iframe" src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
        title="Movie Trailer" 
        frameBorder="0"
        allow="accelerometer; autoplay; clipoard-write;
               encrypted-media; gyroscope; picture-in-picture"
               allowFullScreen
               />
        </div>
        </div>
    )
}