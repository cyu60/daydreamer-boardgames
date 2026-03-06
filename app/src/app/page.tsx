'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';
import { supabase } from '@/lib/supabase';
import { Game, PlaySession, Vote, TonightsPick, Session, GameTask } from '@/types/database';

type Tab = 'collection' | 'session' | 'history';

// Moon Logo SVG Component
function MoonLogo() {
  return (
    <svg className="logo" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="moonGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" result="blur1"/>
          <feGaussianBlur stdDeviation="20" result="blur2"/>
          <feMerge>
            <feMergeNode in="blur2"/>
            <feMergeNode in="blur1"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path
        fill="none"
        stroke="white"
        strokeWidth="18"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#moonGlow)"
        d="M166 82c-8-4-17-6-27-6c-32 0-58 26-58 58s26 58 58 58c26 0 48-17 55-41c-7 4-16 6-25 6c-26 0-46-20-46-46c0-12 4-22 11-29c7-7 20-7 32 0z"
      />
    </svg>
  );
}

// Search Icon
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  );
}

// Check Icon
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );
}

// Plus Icon
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  );
}

// Close Icon
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px' }}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  );
}

// Camera Icon
function CameraIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: 'currentColor' }}>
      <path d="M12 15.2c1.77 0 3.2-1.43 3.2-3.2s-1.43-3.2-3.2-3.2-3.2 1.43-3.2 3.2 1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>
    </svg>
  );
}

// Upload Icon
function UploadIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: 'currentColor' }}>
      <path d="M9 16h6v-6h4l-7-7-7 7h4v6zm-4 2h14v2H5v-2z"/>
    </svg>
  );
}

// Spinner Icon
function SpinnerIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" strokeDasharray="31.4 31.4" strokeLinecap="round"/>
    </svg>
  );
}

// Game Item Component
function GameItem({
  game,
  isSelected,
  onToggle,
  onViewDetails
}: {
  game: Game;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}) {
  return (
    <div className="game-item">
      {game.image_url ? (
        <img
          src={game.image_url}
          alt={game.name}
          onClick={onViewDetails}
          style={{ cursor: 'pointer' }}
        />
      ) : (
        <div
          onClick={onViewDetails}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '10px',
            background: 'var(--cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--dust)',
            fontSize: '0.65rem',
            cursor: 'pointer',
            flexShrink: 0
          }}
        >
          No img
        </div>
      )}
      <div className="game-info" onClick={onViewDetails} style={{ cursor: 'pointer' }}>
        <h3>{game.name}</h3>
        <span className="game-meta">
          {game.min_players}-{game.max_players} players · {game.play_time_minutes} min
        </span>
      </div>
      <button
        onClick={onToggle}
        className={`add-btn ${isSelected ? 'added' : ''}`}
      >
        {isSelected ? <CheckIcon /> : <PlusIcon />}
      </button>
    </div>
  );
}

// Helper to extract YouTube video ID
function getYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Game Details Modal
function GameDetailsModal({
  game,
  onClose
}: {
  game: Game;
  onClose: () => void;
}) {
  const videoId = game.tutorial_url ? getYouTubeVideoId(game.tutorial_url) : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(10, 10, 15, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          borderRadius: '20px',
          maxWidth: '480px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '1.5rem'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.5rem', color: 'var(--ink)' }}>
            {game.name}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: 'var(--dust)'
            }}
          >
            <CloseIcon />
          </button>
        </div>

        {/* YouTube Tutorial Embed */}
        {videoId && (
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            height: 0,
            marginBottom: '1rem',
            borderRadius: '12px',
            overflow: 'hidden'
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={`${game.name} Tutorial`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ padding: '0.5rem 0.75rem', background: 'var(--cobalt-dim)', borderRadius: '8px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--cobalt)' }}>
              {game.min_players}-{game.max_players} players
            </span>
          </div>
          <div style={{ padding: '0.5rem 0.75rem', background: 'var(--cobalt-dim)', borderRadius: '8px' }}>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--cobalt)' }}>
              {game.play_time_minutes} min
            </span>
          </div>
          {game.rating && (
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--amber-dim)', borderRadius: '8px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--amber)' }}>
                ★ {game.rating}
              </span>
            </div>
          )}
          {game.year_published && (
            <div style={{ padding: '0.5rem 0.75rem', background: 'var(--cream)', borderRadius: '8px' }}>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--dust)' }}>
                {game.year_published}
              </span>
            </div>
          )}
        </div>

        {game.description && (
          <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: 'var(--ink)', marginBottom: '1rem' }}>
            {game.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Selected Game for Tonight
function SelectedGame({
  game,
  votes,
  onRemove
}: {
  game: Game;
  votes: number;
  onRemove: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      padding: '0.85rem',
      background: 'var(--cobalt-dim)',
      border: '1.5px solid rgba(28, 63, 220, 0.2)',
      borderRadius: '14px'
    }}>
      {game.image_url ? (
        <img
          src={game.image_url}
          alt={game.name}
          style={{ width: '50px', height: '50px', borderRadius: '10px', objectFit: 'cover' }}
        />
      ) : (
        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '10px',
          background: 'var(--cream)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--dust)',
          fontSize: '0.6rem'
        }}>
          No img
        </div>
      )}
      <div style={{ flex: 1 }}>
        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '0.95rem', color: 'var(--ink)', marginBottom: '0.1rem' }}>
          {game.name}
        </h3>
        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--cobalt)' }}>
          {votes} vote{votes !== 1 ? 's' : ''}
        </span>
      </div>
      <button
        onClick={onRemove}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '8px',
          border: 'none',
          background: 'transparent',
          color: 'var(--dust)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <CloseIcon />
      </button>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('collection');
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(new Set());
  const [gameVotes, setGameVotes] = useState<Record<string, number>>({});
  const [allVotes, setAllVotes] = useState<Vote[]>([]);
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [gameSessions, setGameSessions] = useState<Session[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingGame, setViewingGame] = useState<Game | null>(null);
  const [voterName, setVoterName] = useState('');
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [hostName, setHostName] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [creating, setCreating] = useState(false);

  // Add Game modal state
  const [showAddGame, setShowAddGame] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentTask, setCurrentTask] = useState<GameTask | null>(null);
  const [taskPollingId, setTaskPollingId] = useState<string | null>(null);

  // Fetch games, votes, and tonight's picks from Supabase
  useEffect(() => {
    async function fetchData() {
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }

      // Fetch games
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select('*')
        .order('name');

      if (gamesError) {
        console.error('Error fetching games:', gamesError);
      } else {
        setGames(gamesData || []);
      }

      // Fetch tonight's picks
      const { data: picksData, error: picksError } = await supabase
        .from('tonights_picks')
        .select('*') as { data: TonightsPick[] | null; error: Error | null };

      if (picksError) {
        console.error('Error fetching picks:', picksError);
      } else if (picksData) {
        const pickIds = new Set(picksData.map((p: TonightsPick) => p.game_id));
        setSelectedGameIds(pickIds);
      }

      // Fetch votes (today's votes)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')
        .gte('created_at', today.toISOString()) as { data: Vote[] | null; error: Error | null };

      if (votesError) {
        console.error('Error fetching votes:', votesError);
      } else if (votesData) {
        setAllVotes(votesData);
        // Aggregate votes by game
        const voteCounts: Record<string, number> = {};
        votesData.forEach((vote: Vote) => {
          voteCounts[vote.game_id] = (voteCounts[vote.game_id] || 0) + 1;
        });
        setGameVotes(voteCounts);
      }

      // Fetch play sessions for history
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('play_sessions')
        .select('*')
        .order('played_at', { ascending: false });

      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError);
      } else {
        setSessions(sessionsData || []);
      }

      // Fetch game sessions
      const { data: gameSessionsData, error: gameSessionsError } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false });

      if (gameSessionsError) {
        console.error('Error fetching game sessions:', gameSessionsError);
      } else {
        setGameSessions((gameSessionsData || []) as Session[]);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Filter games by search query
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected games sorted by votes
  const selectedGames = games
    .filter(game => selectedGameIds.has(game.id))
    .sort((a, b) => (gameVotes[b.id] || 0) - (gameVotes[a.id] || 0));

  // Toggle game selection (persists to tonights_picks)
  const toggleGameSelection = useCallback(async (gameId: string) => {
    if (!supabase) return;

    const isCurrentlySelected = selectedGameIds.has(gameId);

    if (isCurrentlySelected) {
      // Remove from tonight's picks
      const { error } = await supabase
        .from('tonights_picks')
        .delete()
        .eq('game_id', gameId);

      if (error) {
        console.error('Error removing pick:', error);
        return;
      }

      setSelectedGameIds(prev => {
        const next = new Set(prev);
        next.delete(gameId);
        return next;
      });
    } else {
      // Add to tonight's picks
      const { error } = await supabase
        .from('tonights_picks')
        .insert({ game_id: gameId } as any);

      if (error) {
        console.error('Error adding pick:', error);
        return;
      }

      setSelectedGameIds(prev => {
        const next = new Set(prev);
        next.add(gameId);
        return next;
      });
    }
  }, [selectedGameIds]);

  // Vote for a game (persists to Supabase)
  const voteForGame = useCallback(async (gameId: string) => {
    if (!voterName.trim()) {
      alert('Please enter your name to vote!');
      return;
    }

    if (!supabase) return;

    // Check if this person already voted for this game today
    const alreadyVoted = allVotes.some(
      v => v.game_id === gameId && v.voter_name.toLowerCase() === voterName.trim().toLowerCase()
    );

    if (alreadyVoted) {
      alert('You already voted for this game!');
      return;
    }

    // Insert vote into Supabase
    const { data, error } = await supabase
      .from('votes')
      .insert({ game_id: gameId, voter_name: voterName.trim() } as any)
      .select()
      .single();

    if (error) {
      console.error('Error voting:', error);
      alert('Failed to vote. Please try again.');
      return;
    }

    // Update local state
    setAllVotes(prev => [...prev, data]);
    setGameVotes(prev => ({
      ...prev,
      [gameId]: (prev[gameId] || 0) + 1
    }));
  }, [voterName, allVotes]);

  // Create a new session
  const createSession = useCallback(async () => {
    if (!hostName.trim()) {
      alert('Please enter your name!');
      return;
    }

    if (selectedGameIds.size === 0) {
      alert('Please select at least one game first!');
      return;
    }

    if (!supabase) return;

    setCreating(true);

    try {
      // Generate unique slug
      const slug = nanoid(8);

      // Create session
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .insert({
          slug,
          name: sessionName.trim() || null,
          host_name: hostName.trim(),
          status: 'voting'
        } as any)
        .select()
        .single() as { data: Session | null; error: Error | null };

      if (sessionError || !sessionData) {
        console.error('Error creating session:', sessionError);
        alert('Failed to create session. Please try again.');
        setCreating(false);
        return;
      }

      // Add games to session
      const gameInserts = Array.from(selectedGameIds).map(gameId => ({
        session_id: sessionData.id,
        game_id: gameId
      }));

      const { error: gamesError } = await supabase
        .from('session_games')
        .insert(gameInserts as any);

      if (gamesError) {
        console.error('Error adding games to session:', gamesError);
      }

      // Store host token for host identification
      localStorage.setItem(`hostToken_${slug}`, hostName.trim());

      // Redirect to session page
      router.push(`/session/${slug}`);
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong. Please try again.');
      setCreating(false);
    }
  }, [hostName, sessionName, selectedGameIds, router]);

  // Handle image upload for game identification
  const handleImageUpload = useCallback(async (file: File) => {
    if (!supabase) return;

    setUploadingImage(true);
    setShowAddGame(false);

    try {
      // Generate unique filename
      const ext = file.name.split('.').pop() || 'jpg';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `uploads/${filename}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('game-photos')
        .upload(filePath, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        alert('Failed to upload image. Please try again.');
        setUploadingImage(false);
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('game-photos')
        .getPublicUrl(filePath);

      const imageUrl = urlData.publicUrl;

      // Create game task record
      const { data: taskData, error: taskError } = await supabase
        .from('game_tasks')
        .insert({
          image_url: imageUrl,
          status: 'pending'
        } as any)
        .select()
        .single() as { data: GameTask | null; error: Error | null };

      if (taskError || !taskData) {
        console.error('Task creation error:', taskError);
        alert('Failed to create task. Please try again.');
        setUploadingImage(false);
        return;
      }

      setCurrentTask(taskData);
      setTaskPollingId(taskData.id);

      // Trigger the identification API
      fetch('/api/identify-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: taskData.id })
      }).catch(err => console.error('API trigger error:', err));

      setUploadingImage(false);
    } catch (err) {
      console.error('Error:', err);
      alert('Something went wrong. Please try again.');
      setUploadingImage(false);
    }
  }, []);

  // Poll for task status updates
  useEffect(() => {
    if (!taskPollingId || !supabase) return;

    const pollSupabase = supabase; // Capture for closure

    const interval = setInterval(async () => {
      const { data, error } = await pollSupabase
        .from('game_tasks')
        .select('*')
        .eq('id', taskPollingId)
        .single() as { data: GameTask | null; error: Error | null };

      if (error || !data) {
        console.error('Polling error:', error);
        return;
      }

      setCurrentTask(data);

      // Stop polling when task is complete or errored
      if (data.status === 'complete' || data.status === 'error') {
        setTaskPollingId(null);

        // If complete, refresh games list
        if (data.status === 'complete' && data.game_id) {
          const { data: gamesData } = await pollSupabase
            .from('games')
            .select('*')
            .order('name');
          if (gamesData) {
            setGames(gamesData);
          }
        }
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [taskPollingId]);

  // Handle file input change
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  }, [handleImageUpload]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'collection', label: 'My Games' },
    { id: 'session', label: 'Tonight' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <MoonLogo />
          <span className="brand-name">
            Day<em>Dreamers</em> Board Games
          </span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="app-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="app-content">
        {/* Collection View */}
        {activeTab === 'collection' && (
          <section>
            {/* Search Bar + Add Button */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <div className="search-bar" style={{ flex: 1, marginBottom: 0 }}>
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Search games..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                onClick={() => setShowAddGame(true)}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  border: 'none',
                  background: 'var(--cobalt)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                title="Add game from photo"
              >
                <CameraIcon />
              </button>
            </div>

            {/* Games List */}
            <div className="games-list">
              {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--dust)', padding: '2rem 0' }}>Loading games...</p>
              ) : filteredGames.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--dust)', padding: '2rem 0' }}>
                  {searchQuery ? 'No games found' : 'No games in collection'}
                </p>
              ) : (
                filteredGames.map(game => (
                  <GameItem
                    key={game.id}
                    game={game}
                    isSelected={selectedGameIds.has(game.id)}
                    onToggle={() => toggleGameSelection(game.id)}
                    onViewDetails={() => setViewingGame(game)}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* Tonight's Session View */}
        {activeTab === 'session' && (
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '1rem' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.35rem', color: 'var(--ink)' }}>
                Tonight&apos;s <em style={{ fontStyle: 'italic', color: 'var(--cobalt)' }}>Games</em>
              </h2>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.72rem', color: 'var(--dust)' }}>
                {selectedGames.length} selected
              </span>
            </div>

            {selectedGames.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--dust)', padding: '2rem 0' }}>
                No games selected. Go to My Games to add some!
              </p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.25rem' }}>
                  {selectedGames.map(game => (
                    <SelectedGame
                      key={game.id}
                      game={game}
                      votes={gameVotes[game.id] || 0}
                      onRemove={() => toggleGameSelection(game.id)}
                    />
                  ))}
                </div>

                {/* Create Session Button */}
                <button
                  onClick={() => setShowCreateSession(true)}
                  style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'var(--cobalt)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <svg viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'currentColor' }}>
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                  </svg>
                  Create Shareable Session
                </button>

                <p style={{
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--dust)',
                  padding: '0.75rem',
                  background: 'var(--cream)',
                  borderRadius: '10px'
                }}>
                  Create a session and share the link with friends to vote!
                </p>
              </>
            )}

            {/* Recent Sessions */}
            {gameSessions.length > 0 && (
              <div style={{ marginTop: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--ink)', marginBottom: '0.75rem' }}>
                  Recent Sessions
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {gameSessions.slice(0, 5).map(session => (
                    <a
                      key={session.id}
                      href={`/session/${session.slug}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem',
                        background: 'var(--card)',
                        border: '1px solid var(--rule)',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        color: 'inherit'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                          {session.name || `${session.host_name}'s Session`}
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--dust)' }}>
                          {new Date(session.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        background: session.status === 'voting' ? 'var(--cobalt-dim)' :
                                   session.status === 'playing' ? 'var(--amber-dim)' : 'var(--green-dim)',
                        color: session.status === 'voting' ? 'var(--cobalt)' :
                               session.status === 'playing' ? 'var(--amber)' : 'var(--green)',
                        borderRadius: '12px',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        textTransform: 'capitalize'
                      }}>
                        {session.status}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <section>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {sessions.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--dust)', padding: '2rem 0' }}>
                  No play sessions logged yet.
                </p>
              ) : (
                sessions.map(session => {
                  const game = games.find(g => g.id === session.game_id);
                  const date = new Date(session.played_at);
                  return (
                    <div key={session.id} className="game-item">
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--cobalt-dim)',
                        borderRadius: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: '1.1rem', color: 'var(--cobalt)' }}>
                          {date.getDate().toString().padStart(2, '0')}
                        </span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '0.6rem', color: 'var(--cobalt)', textTransform: 'uppercase' }}>
                          {date.toLocaleString('en', { month: 'short' })}
                        </span>
                      </div>
                      <div className="game-info">
                        <h3>{game?.name || 'Unknown Game'}</h3>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        )}
      </main>

      {/* Game Details Modal */}
      {viewingGame && (
        <GameDetailsModal
          game={viewingGame}
          onClose={() => setViewingGame(null)}
        />
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 10, 15, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
          onClick={() => setShowCreateSession(false)}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '20px',
              maxWidth: '400px',
              width: '100%',
              padding: '1.5rem'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', color: 'var(--ink)' }}>
                Create <em style={{ fontStyle: 'italic', color: 'var(--cobalt)' }}>Session</em>
              </h2>
              <button
                onClick={() => setShowCreateSession(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: 'var(--dust)'
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--ink)' }}>
                Your Name *
              </label>
              <input
                type="text"
                placeholder="Enter your name..."
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid var(--rule)',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--sans)',
                  background: 'var(--paper)'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--ink)' }}>
                Session Name (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Friday Game Night"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1.5px solid var(--rule)',
                  borderRadius: '10px',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--sans)',
                  background: 'var(--paper)'
                }}
              />
            </div>

            <div style={{
              padding: '0.75rem',
              background: 'var(--cream)',
              borderRadius: '10px',
              marginBottom: '1.25rem'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--dust)', marginBottom: '0.25rem' }}>
                Games in this session:
              </div>
              <div style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--ink)' }}>
                {selectedGames.map(g => g.name).join(', ')}
              </div>
            </div>

            <button
              onClick={createSession}
              disabled={creating || !hostName.trim()}
              style={{
                width: '100%',
                padding: '1rem',
                background: creating || !hostName.trim() ? 'var(--dust)' : 'var(--cobalt)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: creating || !hostName.trim() ? 'default' : 'pointer'
              }}
            >
              {creating ? 'Creating...' : 'Create & Share Link'}
            </button>
          </div>
        </div>
      )}

      {/* Add Game Modal */}
      {showAddGame && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 10, 15, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem'
          }}
          onClick={() => setShowAddGame(false)}
        >
          <div
            style={{
              background: 'var(--card)',
              borderRadius: '20px',
              maxWidth: '400px',
              width: '100%',
              padding: '1.5rem'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', color: 'var(--ink)' }}>
                Add <em style={{ fontStyle: 'italic', color: 'var(--cobalt)' }}>Game</em>
              </h2>
              <button
                onClick={() => setShowAddGame(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  color: 'var(--dust)'
                }}
              >
                <CloseIcon />
              </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--dust)', marginBottom: '1.25rem' }}>
              Take a photo of a board game box and we&apos;ll identify it and add it to your collection!
            </p>

            {/* Camera/Upload Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {/* Camera Button (mobile) */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--cobalt)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}>
                <CameraIcon />
                Take Photo
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>

              {/* File Upload Button */}
              <label style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '1rem',
                background: 'var(--cream)',
                color: 'var(--ink)',
                border: '1.5px solid var(--rule)',
                borderRadius: '12px',
                fontWeight: 600,
                fontSize: '0.95rem',
                cursor: 'pointer'
              }}>
                <UploadIcon />
                Upload Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Task Progress Indicator */}
      {(uploadingImage || currentTask) && (
        <div style={{
          position: 'fixed',
          bottom: '1.5rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--card)',
          borderRadius: '16px',
          padding: '1rem 1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          zIndex: 101,
          maxWidth: 'calc(100% - 2rem)'
        }}>
          {uploadingImage ? (
            <>
              <SpinnerIcon />
              <span style={{ fontSize: '0.9rem', color: 'var(--ink)' }}>Uploading image...</span>
            </>
          ) : currentTask && (
            <>
              {currentTask.status === 'error' ? (
                <>
                  <span style={{ color: 'var(--red)', fontSize: '1.25rem' }}>✕</span>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 500 }}>
                      Identification Failed
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--dust)' }}>
                      {currentTask.error_message || 'Unknown error'}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTask(null)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--cream)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Dismiss
                  </button>
                </>
              ) : currentTask.status === 'complete' ? (
                <>
                  <span style={{ color: 'var(--green)', fontSize: '1.25rem' }}>✓</span>
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 500 }}>
                      Game Added!
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cobalt)' }}>
                      {currentTask.identified_name}
                    </div>
                  </div>
                  <button
                    onClick={() => setCurrentTask(null)}
                    style={{
                      padding: '0.5rem 1rem',
                      background: 'var(--cobalt)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Done
                  </button>
                </>
              ) : (
                <>
                  <SpinnerIcon />
                  <div>
                    <div style={{ fontSize: '0.9rem', color: 'var(--ink)', fontWeight: 500 }}>
                      {currentTask.status === 'identifying' && 'Identifying game...'}
                      {currentTask.status === 'scraping' && 'Fetching game details...'}
                      {currentTask.status === 'pending' && 'Processing...'}
                    </div>
                    {currentTask.identified_name && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--cobalt)' }}>
                        Found: {currentTask.identified_name}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      )}

      {/* Spinner animation */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
