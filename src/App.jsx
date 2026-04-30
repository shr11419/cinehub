import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";
import FreeMovies from "./pages/FreeMovies";
import MoodPicker from "./pages/MoodPicker";
import Stats from "./pages/Stats";
import WatchTogether from "./pages/WatchTogether";


export default function App() {
  return (
    <div className="app">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/free" element={<FreeMovies />} />
        <Route path="/mood" element={<MoodPicker />} />
        <Route path="/stats" element={<Stats />} />
        <Route path="/watch/:roomCode" element={<WatchTogether />} />
      </Routes>
    </div>
  )
}