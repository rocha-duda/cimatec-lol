import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ChampionDetails from './pages/ChampionDetails';
import './pages/Home.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/champion/:championName" element={<ChampionDetails />} />
      </Routes>
    </Router>
  );
}

export default App;