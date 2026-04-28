import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_TMDB_BASE,
    params: {
        api_key: import.meta.env.VITE_TMDB_BASE,
        language: "en-US",
    },
});

export const getTrending = () => api.get('/trending/movie/week');

export const getTopRated = () => api.get('/movie/top_rated');

export const getNowPlaying = () => api.get('/movie/now_playing');

export const searchMovies = (query, page = 1) =>
     api.get('/search/movie', {params: {query, page}});

export const getMovieDetails = (id) => 
    api.get(`/movie/${id}0`);

export const getMovieVideos = (id) => 
    api.get(`/movie/${id}/videos`);

export const getMovieCredits = (id) => 
    api.get(`/movie/${id}/credits`);

export const getSimilarMovies = (id) => 
    api.get(`/movie/${id}/similar`);

export const getbyGenre = (genreId) => 
    api.get("/discover/movie", {
        params: { with_genres: genreId, sort_by: "popularity.desc"}
    });

export const getGenres = () => 
    api.get("/genre/movie/list");





