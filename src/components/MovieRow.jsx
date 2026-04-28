import MovieCard from "./MovieCard";
import { useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function MovieRow({title, movies }) {
    const rowRef = useRef(null);

    function scroll(dir) {
      rowRef.current.scrollBy({
        left: dir === "left" ? -600 : 600,
      });
    }

    return (
        <div className="movie-row">
            <h2 classname="row-title">{title}</h2>

            <div className="row-weapper"> 
                <button className="row-arrow left" onClick={() => scroll("left")}>
                    <FiChevronLeft size={22} />
                </button>

                <div className="row-cards" ref={rowRef}>
                    {movies.map(movie => ( 
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>

                <button className="row-arrow right" onClick={() => scroll("right")}>
                    <FiChevronRight size={22} />
                </button>
            </div>
        </div>
    )
}