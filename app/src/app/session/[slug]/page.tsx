'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Game, Session, SessionVote, GameResult, PlayerResult } from '@/types/database';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Grip icon for drag handle
function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5" cy="3" r="1.5" />
      <circle cx="11" cy="3" r="1.5" />
      <circle cx="5" cy="8" r="1.5" />
      <circle cx="11" cy="8" r="1.5" />
      <circle cx="5" cy="13" r="1.5" />
      <circle cx="11" cy="13" r="1.5" />
    </svg>
  );
}

// Close Icon
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'currentColor' }}>
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  );
}

// Extract YouTube video ID
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

        {/* Game Image */}
        {game.image_url && (
          <img
            src={game.image_url}
            alt={game.name}
            style={{
              width: '100%',
              maxHeight: '200px',
              objectFit: 'cover',
              borderRadius: '12px',
              marginBottom: '1rem'
            }}
          />
        )}

        {/* YouTube Tutorial Embed */}
        {videoId && (
          <div style={{
            position: 'relative',
            paddingBottom: '56.25%',
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

// Sortable game item component
function SortableGameItem({ game, rank, onViewDetails }: { game: Game; rank: number; onViewDetails: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: game.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`game-item sortable ${isDragging ? 'dragging' : ''}`}
    >
      <div className="drag-handle" {...attributes} {...listeners}>
        <GripIcon />
      </div>
      <div className="rank-badge">{rank}</div>
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, cursor: 'pointer' }}
        onClick={onViewDetails}
      >
        {game.image_url ? (
          <img
            src={game.image_url}
            alt={game.name}
            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '8px',
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
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{
            fontFamily: 'var(--serif)',
            fontSize: '0.95rem',
            color: 'var(--ink)',
            marginBottom: '0.1rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {game.name}
          </h3>
          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.7rem', color: 'var(--dust)' }}>
            {game.min_players}-{game.max_players} players
          </span>
        </div>
      </div>
    </div>
  );
}

type SessionWithGames = Session & {
  games: Game[];
};

interface PlayerInput {
  name: string;
  isWinner: boolean;
}

export default function SessionPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [session, setSession] = useState<SessionWithGames | null>(null);
  const [votes, setVotes] = useState<SessionVote[]>([]);
  const [gameResults, setGameResults] = useState<(GameResult & { players: PlayerResult[] })[]>([]);
  const [voterName, setVoterName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Host identification
  const [isHost, setIsHost] = useState(false);

  // Drag-and-drop ranking state
  const [rankedGames, setRankedGames] = useState<Game[]>([]);
  const [hasRankingChanges, setHasRankingChanges] = useState(false);
  const [savingRanking, setSavingRanking] = useState(false);

  // Game result form state
  const [selectedGameId, setSelectedGameId] = useState('');
  const [isCoop, setIsCoop] = useState(false);
  const [coopWon, setCoopWon] = useState<boolean | null>(null);
  const [players, setPlayers] = useState<PlayerInput[]>([{ name: '', isWinner: false }]);
  const [savingResult, setSavingResult] = useState(false);

  // Game details modal state
  const [viewingGame, setViewingGame] = useState<Game | null>(null);

  // Configure DnD sensors with more responsive settings
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch session data
  useEffect(() => {
    async function fetchSession() {
      if (!supabase || !slug) {
        setLoading(false);
        return;
      }

      // Fetch session by slug
      const { data: sessionData, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('slug', slug)
        .single() as { data: Session | null; error: Error | null };

      if (sessionError || !sessionData) {
        setError('Session not found');
        setLoading(false);
        return;
      }

      // Check if current user is the host
      const storedHost = localStorage.getItem(`hostToken_${slug}`);
      setIsHost(storedHost === sessionData.host_name);

      // Fetch games for this session
      const { data: sessionGames } = await supabase
        .from('session_games')
        .select('game_id')
        .eq('session_id', sessionData.id) as { data: { game_id: string }[] | null; error: Error | null };

      const gameIds = sessionGames?.map(sg => sg.game_id) || [];

      let games: Game[] = [];
      if (gameIds.length > 0) {
        const { data: gamesData } = await supabase
          .from('games')
          .select('*')
          .in('id', gameIds);
        games = gamesData || [];
      }

      setSession({ ...sessionData, games } as SessionWithGames);
      setRankedGames(games); // Initialize ranking with default order

      // Fetch votes for this session
      const { data: votesData } = await supabase
        .from('session_votes')
        .select('*')
        .eq('session_id', sessionData.id);
      setVotes((votesData || []) as SessionVote[]);

      // Fetch game results if session is playing or completed
      if (sessionData.status !== 'voting') {
        const { data: resultsData } = await supabase
          .from('game_results')
          .select('*')
          .eq('session_id', sessionData.id) as { data: GameResult[] | null; error: Error | null };

        if (resultsData && resultsData.length > 0) {
          const resultsWithPlayers = await Promise.all(
            resultsData.map(async (result) => {
              const { data: playersData } = await supabase!
                .from('player_results')
                .select('*')
                .eq('game_result_id', result.id) as { data: PlayerResult[] | null; error: Error | null };
              return { ...result, players: playersData || [] } as GameResult & { players: PlayerResult[] };
            })
          );
          setGameResults(resultsWithPlayers);
        }
      }

      setLoading(false);
    }

    fetchSession();
  }, [slug]);

  // Calculate vote counts per game
  const voteCounts = votes.reduce((acc, vote) => {
    acc[vote.game_id] = (acc[vote.game_id] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort games by votes for display
  const sortedGames = session?.games.slice().sort((a, b) =>
    (voteCounts[b.id] || 0) - (voteCounts[a.id] || 0)
  ) || [];

  // Get unique voter names from all votes (moved up so it can be used in submitGameResult)
  const uniqueVoters = [...new Set(votes.map((v) => v.voter_name))];

  // Handle drag end for ranking
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setRankedGames((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasRankingChanges(true);
    }
  }, []);

  // Save ranking to database
  const saveRanking = useCallback(async () => {
    if (!voterName.trim() || !supabase || !session) return;

    setSavingRanking(true);

    // Delete existing votes for this voter in this session
    await supabase
      .from('session_votes')
      .delete()
      .eq('session_id', session.id)
      .eq('voter_name', voterName.trim());

    // Insert new votes with rank
    const newVotes = rankedGames.map((game, index) => ({
      session_id: session.id,
      game_id: game.id,
      voter_name: voterName.trim(),
      rank: index + 1,
    }));

    const { data, error: insertError } = await supabase
      .from('session_votes')
      .insert(newVotes as any)
      .select();

    if (insertError) {
      console.error('Error saving ranking:', insertError);
      alert('Failed to save ranking. Please try again.');
    } else {
      // Update local votes state
      setVotes((prev) => {
        const filtered = prev.filter(
          (v) => v.voter_name.toLowerCase() !== voterName.trim().toLowerCase()
        );
        return [...filtered, ...(data as SessionVote[])];
      });
      setHasRankingChanges(false);
      alert('Your ranking has been saved!');
    }

    setSavingRanking(false);
  }, [voterName, rankedGames, session]);

  // Host controls: Start session
  const startSession = useCallback(async () => {
    if (!supabase || !session) return;

    const { error: updateError } = await (supabase as any)
      .from('sessions')
      .update({
        status: 'playing',
        started_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Error starting session:', updateError);
      alert('Failed to start session.');
      return;
    }

    setSession({ ...session, status: 'playing' });
  }, [session]);

  // Host controls: End session
  const endSession = useCallback(async () => {
    if (!supabase || !session) return;

    const { error: updateError } = await (supabase as any)
      .from('sessions')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', session.id);

    if (updateError) {
      console.error('Error ending session:', updateError);
      alert('Failed to end session.');
      return;
    }

    setSession({ ...session, status: 'completed' });
  }, [session]);

  // Game result form handlers
  const addPlayer = () => {
    setPlayers([...players, { name: '', isWinner: false }]);
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const updatePlayer = (index: number, updates: Partial<PlayerInput>) => {
    setPlayers(players.map((p, i) => (i === index ? { ...p, ...updates } : p)));
  };

  const submitGameResult = useCallback(async () => {
    if (!selectedGameId || !supabase || !session) return;

    setSavingResult(true);

    // Create game result
    const { data: result, error: resultError } = await supabase
      .from('game_results')
      .insert({
        session_id: session.id,
        game_id: selectedGameId,
        is_coop: isCoop,
        coop_won: isCoop ? coopWon : null,
      } as any)
      .select()
      .single();

    if (resultError || !result) {
      console.error('Error logging game:', resultError);
      alert('Failed to log game. Please try again.');
      setSavingResult(false);
      return;
    }

    // Create player results
    const validPlayers = players.filter((p) => p.name.trim());
    if (validPlayers.length > 0) {
      const playerInserts = validPlayers.map((p, i) => ({
        game_result_id: (result as GameResult).id,
        player_name: p.name.trim(),
        is_winner: p.isWinner,
        rank: p.isWinner ? 1 : i + 2,
      }));

      const { data: playerData, error: playerError } = await supabase
        .from('player_results')
        .insert(playerInserts as any)
        .select();

      if (playerError) {
        console.error('Error saving player results:', playerError);
      }

      // Update local state
      setGameResults((prev) => [
        ...prev,
        { ...(result as GameResult), players: (playerData || []) as PlayerResult[] },
      ]);
    } else {
      setGameResults((prev) => [...prev, { ...(result as GameResult), players: [] }]);
    }

    // Reset form - keep voter names as player suggestions
    setSelectedGameId('');
    setIsCoop(false);
    setCoopWon(null);
    setPlayers(uniqueVoters.length > 0
      ? uniqueVoters.map((name) => ({ name, isWinner: false }))
      : [{ name: '', isWinner: false }]
    );
    setSavingResult(false);
  }, [selectedGameId, isCoop, coopWon, players, session, uniqueVoters]);

  // Get voters who voted for a specific game
  const getVotersForGame = (gameId: string) => {
    return votes.filter((v) => v.game_id === gameId).map((v) => v.voter_name);
  };

  // Calculate aggregate ranking scores (lower is better - sum of ranks)
  const gameRankingScores = session?.games.reduce((acc, game) => {
    const gameVotes = votes.filter((v) => v.game_id === game.id);
    if (gameVotes.length > 0) {
      const totalRank = gameVotes.reduce((sum, v) => sum + (v.rank || 1), 0);
      const avgRank = totalRank / gameVotes.length;
      acc[game.id] = { totalRank, avgRank, voteCount: gameVotes.length };
    }
    return acc;
  }, {} as Record<string, { totalRank: number; avgRank: number; voteCount: number }>) || {};

  // Sort games by average rank (lower is better)
  const rankedByVotes = session?.games.slice().sort((a, b) => {
    const aScore = gameRankingScores[a.id];
    const bScore = gameRankingScores[b.id];
    if (!aScore && !bScore) return 0;
    if (!aScore) return 1;
    if (!bScore) return -1;
    return aScore.avgRank - bScore.avgRank;
  }) || [];

  // Initialize players with voter names when first entering playing phase
  const [playersInitialized, setPlayersInitialized] = useState(false);
  useEffect(() => {
    if (session?.status === 'playing' && uniqueVoters.length > 0 && !playersInitialized) {
      setPlayers(uniqueVoters.map((name) => ({ name, isWinner: false })));
      setPlayersInitialized(true);
    }
  }, [session?.status, uniqueVoters.length, playersInitialized]);

  if (loading) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="brand">
            <MoonLogo />
            <span className="brand-name">Day<em>Dreamers</em></span>
          </div>
        </header>
        <main className="app-content" style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <p style={{ color: 'var(--dust)' }}>Loading session...</p>
        </main>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="brand">
            <MoonLogo />
            <span className="brand-name">Day<em>Dreamers</em></span>
          </div>
        </header>
        <main className="app-content" style={{ textAlign: 'center', paddingTop: '3rem' }}>
          <p style={{ color: 'var(--dust)', fontSize: '1.1rem' }}>Session not found</p>
          <a href="/" style={{ color: 'var(--cobalt)', marginTop: '1rem', display: 'inline-block' }}>
            ← Back to home
          </a>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="brand">
          <MoonLogo />
          <span className="brand-name">Day<em>Dreamers</em></span>
        </div>
      </header>

      {/* Session Info */}
      <div style={{
        padding: '1rem',
        background: 'var(--cream)',
        borderBottom: '1px solid var(--rule)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.2rem', color: 'var(--ink)' }}>
              {session.name || `${session.host_name}'s Game Night`}
            </h2>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--dust)' }}>
              Hosted by {session.host_name}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {isHost && (
              <span style={{
                padding: '0.35rem 0.75rem',
                background: 'var(--ink)',
                color: '#fff',
                borderRadius: '20px',
                fontSize: '0.7rem',
                fontWeight: 600,
                textTransform: 'uppercase'
              }}>
                Host
              </span>
            )}
            <span style={{
              padding: '0.35rem 0.75rem',
              background: session.status === 'voting' ? 'var(--cobalt)' :
                         session.status === 'playing' ? 'var(--amber)' : 'var(--green)',
              color: '#fff',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase'
            }}>
              {session.status}
            </span>
          </div>
        </div>
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="host-controls">
          {session.status === 'voting' && (
            <button onClick={startSession} className="btn-primary">
              Start Game Night
            </button>
          )}
          {session.status === 'playing' && (
            <button onClick={endSession} className="btn-secondary">
              End Session
            </button>
          )}
          {session.status === 'completed' && (
            <span style={{ color: 'var(--dust)', fontFamily: 'var(--mono)', fontSize: '0.85rem' }}>
              Session completed
            </span>
          )}
        </div>
      )}

      <main className="app-content">
        {session.status === 'voting' && (
          <>
            {/* Voter Name Input */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              background: 'var(--cream)',
              borderRadius: '10px'
            }}>
              <input
                type="text"
                placeholder="Enter your name to rank games..."
                value={voterName}
                onChange={(e) => setVoterName(e.target.value)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1.5px solid var(--rule)',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--sans)',
                  background: 'var(--card)'
                }}
              />
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.85rem', color: 'var(--dust)', marginBottom: '0.75rem' }}>
                Drag games to rank them by preference. #1 is your top choice!
              </p>
            </div>

            {/* Draggable Games List */}
            {voterName.trim() ? (
              <>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={rankedGames.map((g) => g.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="games-list">
                      {rankedGames.map((game, index) => (
                        <SortableGameItem
                          key={game.id}
                          game={game}
                          rank={index + 1}
                          onViewDetails={() => setViewingGame(game)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {/* Save Ranking Button */}
                <button
                  onClick={saveRanking}
                  disabled={!hasRankingChanges || savingRanking}
                  style={{
                    width: '100%',
                    padding: '0.85rem',
                    marginTop: '1rem',
                    background: hasRankingChanges ? 'var(--cobalt)' : 'var(--dust)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '10px',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    cursor: hasRankingChanges ? 'pointer' : 'default',
                    opacity: hasRankingChanges ? 1 : 0.6,
                  }}
                >
                  {savingRanking ? 'Saving...' : hasRankingChanges ? 'Save My Ranking' : 'Ranking Saved'}
                </button>

                {/* Message for non-hosts after voting */}
                {!isHost && !hasRankingChanges && votes.some(v => v.voter_name.toLowerCase() === voterName.trim().toLowerCase()) && (
                  <div style={{
                    marginTop: '1.5rem',
                    padding: '1rem',
                    background: 'var(--green-dim)',
                    borderRadius: '10px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', marginBottom: '0.5rem' }}>
                      Your ranking has been saved!
                    </p>
                    <p style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--dust)' }}>
                      The host will reveal the group&apos;s rankings when voting ends.
                    </p>
                  </div>
                )}
              </>
            ) : (
              // Show non-draggable list when no name entered
              <div className="games-list">
                {sortedGames.map((game) => {
                  const voteCount = voteCounts[game.id] || 0;
                  const voters = getVotersForGame(game.id);

                  return (
                    <div
                      key={game.id}
                      className="game-item"
                      style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem', cursor: 'pointer' }}
                      onClick={() => setViewingGame(game)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {game.image_url ? (
                          <img src={game.image_url} alt={game.name} style={{ width: '56px', height: '56px', borderRadius: '10px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '56px', height: '56px', borderRadius: '10px', background: 'var(--cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dust)', fontSize: '0.65rem' }}>
                            No img
                          </div>
                        )}
                        <div style={{ flex: 1 }}>
                          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)', marginBottom: '0.15rem' }}>
                            {game.name}
                          </h3>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--dust)' }}>
                            {game.min_players}-{game.max_players} players · {game.play_time_minutes} min
                          </span>
                        </div>
                        {isHost && (
                          <span style={{
                            fontFamily: 'var(--mono)',
                            fontSize: '0.9rem',
                            fontWeight: 600,
                            color: voteCount > 0 ? 'var(--cobalt)' : 'var(--dust)'
                          }}>
                            {voteCount} vote{voteCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {isHost && voters.length > 0 && (
                        <div style={{ paddingLeft: '71px', fontSize: '0.75rem', color: 'var(--dust)' }}>
                          Votes: {voters.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vote Summary - always visible to host */}
            {isHost && uniqueVoters.length > 0 && (
              <div className="vote-summary" style={{ marginTop: '1.5rem' }}>
                <h3 style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.8rem',
                  color: 'var(--dust)',
                  marginBottom: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.02em'
                }}>
                  Current Rankings ({uniqueVoters.length} voter{uniqueVoters.length !== 1 ? 's' : ''})
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                  {uniqueVoters.map((voter) => (
                    <span key={voter} style={{
                      padding: '0.25rem 0.6rem',
                      background: 'var(--cream)',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      color: 'var(--ink)'
                    }}>
                      {voter}
                    </span>
                  ))}
                </div>
                <div className="games-list">
                  {rankedByVotes.map((game, index) => {
                    const scores = gameRankingScores[game.id];
                    if (!scores) return null;
                    const gameVotes = votes.filter(v => v.game_id === game.id);
                    return (
                      <div key={game.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        padding: '0.75rem',
                        background: index === 0 ? 'var(--amber-dim)' : 'var(--card)',
                        border: '1px solid var(--rule)',
                        borderRadius: '10px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{
                            width: '28px',
                            height: '28px',
                            background: index === 0 ? 'var(--amber)' : index === 1 ? 'var(--cobalt)' : 'var(--dust)',
                            color: '#fff',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.85rem',
                            fontWeight: 700
                          }}>
                            {index + 1}
                          </span>
                          <span style={{ flex: 1, fontFamily: 'var(--serif)', fontSize: '1rem', fontWeight: 500 }}>
                            {game.name}
                          </span>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{
                              fontFamily: 'var(--mono)',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              color: index === 0 ? 'var(--amber)' : 'var(--ink)'
                            }}>
                              Score: {scores.totalRank}
                            </div>
                            <div style={{
                              fontFamily: 'var(--mono)',
                              fontSize: '0.7rem',
                              color: 'var(--dust)'
                            }}>
                              avg #{scores.avgRank.toFixed(1)}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.4rem',
                          paddingLeft: '2.5rem'
                        }}>
                          {gameVotes.map((vote) => (
                            <span key={vote.voter_name} style={{
                              padding: '0.2rem 0.5rem',
                              background: vote.rank === 1 ? 'var(--green)' : 'var(--cream)',
                              color: vote.rank === 1 ? '#fff' : 'var(--ink)',
                              borderRadius: '10px',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--mono)'
                            }}>
                              {vote.voter_name}: #{vote.rank}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {session.status === 'playing' && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', color: 'var(--ink)', marginBottom: '1rem' }}>
              Game Night in <em style={{ color: 'var(--amber)' }}>Progress!</em>
            </h2>

            {/* Logged Games */}
            {gameResults.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--dust)', marginBottom: '0.75rem', textTransform: 'uppercase' }}>
                  Games Played
                </h3>
                <div className="games-list">
                  {gameResults.map((result) => {
                    const game = session.games.find((g) => g.id === result.game_id);
                    const winners = result.players.filter((p) => p.is_winner);
                    return (
                      <div key={result.id} className="game-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'var(--green-dim)',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            flexShrink: 0
                          }}>
                            🎲
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)' }}>
                              {game?.name || 'Unknown Game'}
                            </h3>
                            {result.is_coop ? (
                              <span style={{
                                fontFamily: 'var(--mono)',
                                fontSize: '0.8rem',
                                color: result.coop_won ? 'var(--green)' : 'var(--dust)',
                                fontWeight: 500
                              }}>
                                {result.coop_won ? 'Team Won!' : 'Team Lost'}
                              </span>
                            ) : winners.length > 0 ? (
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--amber)', fontWeight: 500 }}>
                                {winners.length === 1 ? `${winners[0].player_name} won!` : `${winners.map(w => w.player_name).join(' & ')} won!`}
                              </span>
                            ) : (
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--dust)' }}>
                                No winner recorded
                              </span>
                            )}
                          </div>
                        </div>
                        {result.players.length > 0 && (
                          <div style={{ paddingLeft: '60px', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                            {result.players.map((p) => (
                              <span key={p.id} style={{
                                padding: '0.2rem 0.5rem',
                                background: p.is_winner ? 'var(--amber-dim)' : 'var(--cream)',
                                color: p.is_winner ? 'var(--amber)' : 'var(--dust)',
                                borderRadius: '10px',
                                fontSize: '0.7rem',
                                fontFamily: 'var(--mono)',
                                fontWeight: p.is_winner ? 600 : 400
                              }}>
                                {p.player_name}{p.is_winner ? ' 🏆' : ''}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Game Result Form (Host Only) */}
            {isHost ? (
              <div className="game-result-form">
                <h3>Log a Game</h3>

                {/* Game Selector */}
                <select
                  value={selectedGameId}
                  onChange={(e) => setSelectedGameId(e.target.value)}
                >
                  <option value="">Select a game...</option>
                  {session.games.map((game) => (
                    <option key={game.id} value={game.id}>
                      {game.name}
                    </option>
                  ))}
                </select>

                {/* Co-op Toggle */}
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={isCoop}
                    onChange={(e) => {
                      setIsCoop(e.target.checked);
                      if (!e.target.checked) setCoopWon(null);
                    }}
                  />
                  <span>Co-op Game</span>
                </label>

                {/* Co-op Result */}
                {isCoop && (
                  <div className="coop-result">
                    <button
                      type="button"
                      className={coopWon === true ? 'selected' : ''}
                      onClick={() => setCoopWon(true)}
                    >
                      Team Won
                    </button>
                    <button
                      type="button"
                      className={coopWon === false ? 'selected' : ''}
                      onClick={() => setCoopWon(false)}
                    >
                      Team Lost
                    </button>
                  </div>
                )}

                {/* Competitive Players */}
                {!isCoop && (
                  <div className="players-list">
                    <h4>Players</h4>
                    {players.map((player, index) => (
                      <div key={index} className="player-row">
                        <input
                          type="text"
                          placeholder="Player name"
                          value={player.name}
                          onChange={(e) => updatePlayer(index, { name: e.target.value })}
                        />
                        <label>
                          <input
                            type="checkbox"
                            checked={player.isWinner}
                            onChange={(e) => updatePlayer(index, { isWinner: e.target.checked })}
                          />
                          Winner
                        </label>
                        {players.length > 1 && (
                          <button type="button" onClick={() => removePlayer(index)} className="remove-btn">
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addPlayer} className="add-player-btn">
                      + Add Player
                    </button>
                  </div>
                )}

                <button
                  onClick={submitGameResult}
                  disabled={savingResult || !selectedGameId}
                  className="btn-primary"
                  style={{ marginTop: '1rem' }}
                >
                  {savingResult ? 'Saving...' : 'Log Game'}
                </button>
              </div>
            ) : (
              <p style={{ color: 'var(--dust)', textAlign: 'center' }}>
                The host is logging games as they&apos;re played.
              </p>
            )}
          </div>
        )}

        {session.status === 'completed' && (
          <div style={{ paddingTop: '1rem' }}>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '1.3rem', color: 'var(--ink)', marginBottom: '1rem' }}>
              Session <em style={{ color: 'var(--green)' }}>Complete!</em>
            </h2>
            {gameResults.length === 0 ? (
              <p style={{ color: 'var(--dust)', textAlign: 'center' }}>No games were logged.</p>
            ) : (
              <div className="games-list">
                {gameResults.map((result) => {
                  const game = session.games.find((g) => g.id === result.game_id);
                  const winners = result.players.filter((p) => p.is_winner);
                  return (
                    <div key={result.id} className="game-item" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          background: 'var(--green-dim)',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.5rem',
                          flexShrink: 0
                        }}>
                          🎲
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <h3 style={{ fontFamily: 'var(--serif)', fontSize: '1rem', color: 'var(--ink)' }}>
                            {game?.name || 'Unknown Game'}
                          </h3>
                          {result.is_coop ? (
                            <span style={{
                              fontFamily: 'var(--mono)',
                              fontSize: '0.8rem',
                              color: result.coop_won ? 'var(--green)' : 'var(--dust)',
                              fontWeight: 500
                            }}>
                              {result.coop_won ? 'Team Won!' : 'Team Lost'}
                            </span>
                          ) : winners.length > 0 ? (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.8rem', color: 'var(--amber)', fontWeight: 500 }}>
                              {winners.length === 1 ? `${winners[0].player_name} won!` : `${winners.map(w => w.player_name).join(' & ')} won!`}
                            </span>
                          ) : (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '0.75rem', color: 'var(--dust)' }}>
                              No winner recorded
                            </span>
                          )}
                        </div>
                      </div>
                      {result.players.length > 0 && (
                        <div style={{ paddingLeft: '60px', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                          {result.players.map((p) => (
                            <span key={p.id} style={{
                              padding: '0.2rem 0.5rem',
                              background: p.is_winner ? 'var(--amber-dim)' : 'var(--cream)',
                              color: p.is_winner ? 'var(--amber)' : 'var(--dust)',
                              borderRadius: '10px',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--mono)',
                              fontWeight: p.is_winner ? 600 : 400
                            }}>
                              {p.player_name}{p.is_winner ? ' 🏆' : ''}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Game Details Modal */}
      {viewingGame && (
        <GameDetailsModal
          game={viewingGame}
          onClose={() => setViewingGame(null)}
        />
      )}
    </div>
  );
}
