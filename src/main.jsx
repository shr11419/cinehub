import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import WatchlistProvider from "./context/WatchlistContext.jsx";
import App from './App.jsx'
import "./App.css";

createRoot(document.getElementById('root')).render(
  <BrowserRouter> 
  <WatchlistProvider>
    <App />
  </WatchlistProvider>
  </BrowserRouter>
    
 
);
