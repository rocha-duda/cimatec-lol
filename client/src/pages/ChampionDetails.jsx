import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ChampionDetails.css';

const ChampionDetails = () => {
  const { championName } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChampionDetails = async () => {
      const summonerName = sessionStorage.getItem('lastSummonerName');
      const summonerTag = sessionStorage.getItem('lastSummonerTag');

      if (!summonerName || !summonerTag) {
        setError('Nenhum invocador encontrado na sessão');
        setIsLoading(false);
        return;
      }

      try {
        // 1. Get PUUID
        const puuidRes = await axios.get(`/api/puuid?nome=${encodeURIComponent(summonerName)}&tag=${encodeURIComponent(summonerTag)}`);
        const puuid = puuidRes.data.puuid;

        // 2. Get champion ID
        const championsRes = await axios.get('https://ddragon.leagueoflegends.com/cdn/14.8.1/data/pt_BR/champion.json');
        const champion = Object.values(championsRes.data.data).find(
          c => c.name === decodeURIComponent(championName)
        );

        if (!champion) {
          throw new Error('Campeão não encontrado');
        }

        // 3. Get match stats
        const statsRes = await axios.get(`/api/detalhes?puuid=${puuid}&champion=${champion.key}`);
        setStats(statsRes.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Erro ao buscar detalhes do campeão');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChampionDetails();
  }, [championName]);

  if (isLoading) {
    return (
      <div className="champion-details-container">
        <div className="loading-message">
          <div className="loading"></div> Carregando detalhes do campeão...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="champion-details-container">
        <div className="error-message">{error}</div>
        <button className="back-button" onClick={() => navigate('/')}>
          Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="champion-details-container">
      <div className="champion-header">
        <img
          className="champion-image"
          src={`https://ddragon.leagueoflegends.com/cdn/14.8.1/img/champion/${championName.replace(/[\s.'"]/g, '').normalize("NFD").replace(/[\u0300-\u036f]/g, '')}.png`}
          alt={championName}
        />
        <div className="champion-info">
          <h1>{championName}</h1>
        </div>
      </div>

      <div className="champion-stats">
        <div className="stat-card">
          <h3>WinRate Recente</h3>
          <p id="winrate-stat">
            {stats && stats.total > 0
              ? `${((stats.vitorias / stats.total) * 100).toFixed(2)}%`
              : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>Partidas</h3>
          <p id="matches-stat">
            {stats ? `${stats.vitorias}V ${stats.total - stats.vitorias}D` : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>K/D/A Geral</h3>
          <p id="kda-stat">
            {stats && stats.total > 0
              ? `${(stats.totalKills / stats.total).toFixed(1)} / ${(stats.totalDeaths / stats.total).toFixed(1)} / ${(stats.totalAssists / stats.total).toFixed(1)}`
              : 'N/A'}
          </p>
        </div>
        <div className="stat-card">
          <h3>CS por Minuto</h3>
          <p id="cspm-stat">
            {stats && stats.totalGameDuration > 0
              ? `${(stats.totalCS / stats.totalGameDuration).toFixed(1)}`
              : 'N/A'}
          </p>
        </div>
      </div>

      <div className="recent-games">
        <h2>Últimas Partidas</h2>
        <div id="matches-list" className="matches-list">
          {stats?.matches.length > 0 ? (
            stats.matches.map((match, index) => (
              <div
                key={index}
                className={`match-card ${match.win ? 'victory' : 'defeat'}`}
              >
                <div className="match-result">
                  {match.win ? 'Vitória' : 'Derrota'}
                </div>
                <div className="match-stats">
                  <div className="match-kda">
                    {match.kills}/{match.deaths}/{match.assists}
                    <small>
                      {(
                        (match.kills + match.assists) /
                        Math.max(match.deaths, 1)
                      ).toFixed(2)}
                      :1 KDA
                    </small>
                  </div>
                  <div className="match-cs">
                    {match.totalCS} CS ({Math.round(
                      match.totalCS / (match.gameDuration / 60)
                    )}/min)
                  </div>
                </div>
                <div className="match-duration">
                  {Math.floor(match.gameDuration / 60)}:
                  {(match.gameDuration % 60).toString().padStart(2, '0')}
                </div>
              </div>
            ))
          ) : (
            <div className="no-matches">Nenhuma partida recente encontrada</div>
          )}
        </div>
      </div>

      <button className="back-button" onClick={() => navigate('/')}>
        Voltar
      </button>
    </div>
  );
};

export default ChampionDetails;