'use client';

import { useState, useEffect, useCallback } from 'react';

interface Stats {
  games: number;
  sessions: {
    total: number;
    voting: number;
    playing: number;
    completed: number;
  };
  votes: number;
  gamesPlayed: number;
  gameTasks: {
    total: number;
    pending: number;
    complete: number;
    error: number;
  };
}

interface Session {
  id: string;
  name: string;
  slug: string;
  host_name: string;
  status: string;
  created_at: string;
  vote_count: number;
  games_played: number;
}

interface Game {
  id: string;
  name: string;
  min_players: number;
  max_players: number;
  image_url: string | null;
  created_at: string;
}

type Tab = 'dashboard' | 'sessions' | 'games';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('');

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [stats, setStats] = useState<Stats | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Check for existing token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('adminToken');
    if (storedToken) {
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // Verify existing token
  const verifyToken = async (tokenToVerify: string) => {
    try {
      const res = await fetch('/api/admin/auth', {
        headers: { 'Authorization': `Bearer ${tokenToVerify}` }
      });
      if (res.ok) {
        setToken(tokenToVerify);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('adminToken');
      }
    } catch {
      localStorage.removeItem('adminToken');
    }
    setLoading(false);
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setActionLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch {
      setError('Login failed');
    }
    setActionLoading(false);
  };

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setToken('');
    setIsAuthenticated(false);
    setStats(null);
    setSessions([]);
    setGames([]);
  };

  // Fetch stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [token]);

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/sessions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    }
  }, [token]);

  // Fetch games
  const fetchGames = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/games', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setGames(data.games);
      }
    } catch (err) {
      console.error('Failed to fetch games:', err);
    }
  }, [token]);

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      fetchStats();
      fetchSessions();
      fetchGames();
    }
  }, [isAuthenticated, token, fetchStats, fetchSessions, fetchGames]);

  // Delete session
  const deleteSession = async (sessionId: string) => {
    if (!confirm('Delete this session and all its data?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/sessions?id=${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
    setActionLoading(false);
  };

  // Delete all sessions
  const deleteAllSessions = async () => {
    if (!confirm('DELETE ALL SESSIONS? This cannot be undone!')) return;
    if (!confirm('Are you absolutely sure?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/admin/sessions?all=true', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSessions();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete sessions:', err);
    }
    setActionLoading(false);
  };

  // Delete game
  const deleteGame = async (gameId: string) => {
    if (!confirm('Delete this game and all related data?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/games?id=${gameId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchGames();
        fetchStats();
      }
    } catch (err) {
      console.error('Failed to delete game:', err);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Admin Portal</h1>
          <p style={styles.subtitle}>DayDreamers Board Games</p>

          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              autoFocus
            />
            {error && <p style={styles.error}>{error}</p>}
            <button type="submit" style={styles.button} disabled={actionLoading}>
              {actionLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <a href="/" style={styles.backLink}>Back to app</a>
        </div>
      </div>
    );
  }

  // Admin dashboard
  return (
    <div style={styles.adminContainer}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>Admin Portal</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
      </header>

      {/* Tabs */}
      <nav style={styles.tabs}>
        {(['dashboard', 'sessions', 'games'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {})
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={styles.content}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && stats && (
          <div>
            <h2 style={styles.sectionTitle}>Overview</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{stats.games}</span>
                <span style={styles.statLabel}>Games</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{stats.sessions.total}</span>
                <span style={styles.statLabel}>Sessions</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{stats.votes}</span>
                <span style={styles.statLabel}>Total Votes</span>
              </div>
              <div style={styles.statCard}>
                <span style={styles.statValue}>{stats.gamesPlayed}</span>
                <span style={styles.statLabel}>Games Played</span>
              </div>
            </div>

            <h3 style={styles.subTitle}>Session Status</h3>
            <div style={styles.statsRow}>
              <span style={{ ...styles.badge, background: '#4A7CFF' }}>
                Voting: {stats.sessions.voting}
              </span>
              <span style={{ ...styles.badge, background: '#F5A623' }}>
                Playing: {stats.sessions.playing}
              </span>
              <span style={{ ...styles.badge, background: '#4CAF50' }}>
                Completed: {stats.sessions.completed}
              </span>
            </div>

            <h3 style={styles.subTitle}>Photo-to-Game Tasks</h3>
            <div style={styles.statsRow}>
              <span style={{ ...styles.badge, background: '#888' }}>
                Total: {stats.gameTasks.total}
              </span>
              <span style={{ ...styles.badge, background: '#4CAF50' }}>
                Complete: {stats.gameTasks.complete}
              </span>
              <span style={{ ...styles.badge, background: '#f44336' }}>
                Errors: {stats.gameTasks.error}
              </span>
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div>
            <div style={styles.sectionHeader}>
              <h2 style={styles.sectionTitle}>Sessions ({sessions.length})</h2>
              <button
                onClick={deleteAllSessions}
                style={styles.dangerBtn}
                disabled={actionLoading || sessions.length === 0}
              >
                Delete All
              </button>
            </div>

            {sessions.length === 0 ? (
              <p style={styles.emptyText}>No sessions found</p>
            ) : (
              <div style={styles.list}>
                {sessions.map((session) => (
                  <div key={session.id} style={styles.listItem}>
                    <div style={styles.listItemMain}>
                      <strong>{session.name || `${session.host_name}'s Game Night`}</strong>
                      <span style={styles.listItemMeta}>
                        Host: {session.host_name} | Slug: {session.slug}
                      </span>
                      <span style={styles.listItemMeta}>
                        Votes: {session.vote_count} | Games: {session.games_played}
                      </span>
                    </div>
                    <div style={styles.listItemActions}>
                      <span style={{
                        ...styles.badge,
                        background: session.status === 'voting' ? '#4A7CFF' :
                                   session.status === 'playing' ? '#F5A623' : '#4CAF50'
                      }}>
                        {session.status}
                      </span>
                      <button
                        onClick={() => deleteSession(session.id)}
                        style={styles.deleteBtn}
                        disabled={actionLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Games Tab */}
        {activeTab === 'games' && (
          <div>
            <h2 style={styles.sectionTitle}>Games ({games.length})</h2>

            {games.length === 0 ? (
              <p style={styles.emptyText}>No games found</p>
            ) : (
              <div style={styles.list}>
                {games.map((game) => (
                  <div key={game.id} style={styles.listItem}>
                    <div style={styles.listItemMain}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {game.image_url ? (
                          <img
                            src={game.image_url}
                            alt={game.name}
                            style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }}
                          />
                        ) : (
                          <div style={{
                            width: 40, height: 40, borderRadius: 6,
                            background: '#eee', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.6rem', color: '#888'
                          }}>
                            No img
                          </div>
                        )}
                        <div>
                          <strong>{game.name}</strong>
                          <span style={styles.listItemMeta}>
                            {game.min_players}-{game.max_players} players
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteGame(game.id)}
                      style={styles.deleteBtn}
                      disabled={actionLoading}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '1rem'
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: 700,
    marginBottom: '0.25rem',
    color: '#1a1a2e'
  },
  subtitle: {
    fontSize: '0.85rem',
    color: '#888',
    marginBottom: '1.5rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  input: {
    padding: '0.75rem 1rem',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s'
  },
  button: {
    padding: '0.75rem',
    background: '#4A7CFF',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  error: {
    color: '#f44336',
    fontSize: '0.85rem',
    margin: 0
  },
  backLink: {
    display: 'inline-block',
    marginTop: '1.5rem',
    color: '#4A7CFF',
    fontSize: '0.85rem',
    textDecoration: 'none'
  },
  adminContainer: {
    minHeight: '100vh',
    background: '#f5f5f5'
  },
  header: {
    background: '#1a1a2e',
    color: '#fff',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    background: 'rgba(255,255,255,0.1)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  tabs: {
    display: 'flex',
    background: '#fff',
    borderBottom: '1px solid #e0e0e0'
  },
  tab: {
    flex: 1,
    padding: '1rem',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#888',
    cursor: 'pointer'
  },
  tabActive: {
    color: '#4A7CFF',
    borderBottomColor: '#4A7CFF'
  },
  content: {
    padding: '1.5rem',
    maxWidth: '800px',
    margin: '0 auto'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: '#1a1a2e'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem'
  },
  subTitle: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#666',
    marginTop: '1.5rem',
    marginBottom: '0.75rem'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
    gap: '1rem'
  },
  statCard: {
    background: '#fff',
    borderRadius: '10px',
    padding: '1.25rem',
    textAlign: 'center' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  statValue: {
    display: 'block',
    fontSize: '2rem',
    fontWeight: 700,
    color: '#4A7CFF'
  },
  statLabel: {
    fontSize: '0.8rem',
    color: '#888',
    textTransform: 'uppercase' as const
  },
  statsRow: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap' as const
  },
  badge: {
    padding: '0.35rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: 600,
    color: '#fff'
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem'
  },
  listItem: {
    background: '#fff',
    borderRadius: '10px',
    padding: '1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  listItemMain: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  listItemMeta: {
    fontSize: '0.75rem',
    color: '#888'
  },
  listItemActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem'
  },
  deleteBtn: {
    padding: '0.4rem 0.75rem',
    background: '#fff',
    color: '#f44336',
    border: '1px solid #f44336',
    borderRadius: '6px',
    fontSize: '0.8rem',
    cursor: 'pointer'
  },
  dangerBtn: {
    padding: '0.5rem 1rem',
    background: '#f44336',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer'
  },
  emptyText: {
    color: '#888',
    textAlign: 'center' as const,
    padding: '2rem'
  }
};
