import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MovieDetail from "./pages/MovieDetail";
import Search from "./pages/Search";
import Watchlist from "./pages/Watchlist";

export default function App() {
  return (
    <div classname="app">
      <Navbar/>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watchlist" element={<Watchlist />} />
      </Routes>
    </div>
  )
}