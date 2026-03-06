'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Game, PlaySession, Player } from '@/types/database';

type Tab = 'collection' | 'session' | 'history';

// Moon Logo SVG Component
function MoonLogo() {
  return (
    <svg className="logo w-12 h-12" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
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
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[var(--dust)] shrink-0">
      <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
    </svg>
  );
}

// Check Icon
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
    </svg>
  );
}

// Plus Icon
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  );
}

// Close Icon
function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] fill-current">
      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    </svg>
  );
}

// Game Item Component
function GameItem({
  game,
  isSelected,
  onToggle
}: {
  game: Game;
  isSelected: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--card)] border-[1.5px] border-[var(--rule)] rounded-[14px] transition-all active:scale-[0.98]">
      {game.image_url ? (
        <img
          src={game.image_url}
          alt={game.name}
          className="w-14 h-14 rounded-[10px] object-cover shrink-0"
        />
      ) : (
        <div className="w-14 h-14 rounded-[10px] bg-[var(--cream)] shrink-0 flex items-center justify-center text-[var(--dust)] text-xs">
          No img
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-[var(--serif)] text-base font-normal text-[var(--ink)] mb-0.5 whitespace-nowrap overflow-hidden text-ellipsis" style={{ fontFamily: 'var(--serif)' }}>
          {game.name}
        </h3>
        <span className="text-xs text-[var(--dust)]" style={{ fontFamily: 'var(--mono)' }}>
          {game.min_players}-{game.max_players} players · {game.play_time_minutes} min
        </span>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-10 rounded-[10px] border-[1.5px] flex items-center justify-center shrink-0 transition-all cursor-pointer ${
          isSelected
            ? 'bg-[var(--green)] border-[var(--green)] text-white'
            : 'border-[var(--rule)] bg-[var(--paper)] text-[var(--dust)] hover:border-[var(--cobalt)] hover:text-[var(--cobalt)]'
        }`}
      >
        {isSelected ? <CheckIcon /> : <PlusIcon />}
      </button>
    </div>
  );
}

// Selected Game Component (for Tonight's view)
function SelectedGame({
  game,
  onRemove
}: {
  game: Game;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--cobalt-dim)] border-[1.5px] border-[rgba(28,63,220,0.2)] rounded-[14px]">
      {game.image_url ? (
        <img
          src={game.image_url}
          alt={game.name}
          className="w-[50px] h-[50px] rounded-[10px] object-cover"
        />
      ) : (
        <div className="w-[50px] h-[50px] rounded-[10px] bg-[var(--cream)] flex items-center justify-center text-[var(--dust)] text-xs">
          No img
        </div>
      )}
      <div className="flex-1">
        <h3 className="text-[0.95rem] font-normal text-[var(--ink)] mb-0.5" style={{ fontFamily: 'var(--serif)' }}>
          {game.name}
        </h3>
        <span className="text-[0.72rem] text-[var(--cobalt)]" style={{ fontFamily: 'var(--mono)' }}>
          {game.min_players}-{game.max_players} players
        </span>
      </div>
      <button
        onClick={onRemove}
        className="w-8 h-8 rounded-lg border-none bg-transparent text-[var(--dust)] cursor-pointer flex items-center justify-center transition-all hover:bg-[#fee2e2] hover:text-[#dc2626]"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// History Item Component
function HistoryItem({
  session,
  game,
  players,
  winner
}: {
  session: PlaySession;
  game?: Game;
  players: string[];
  winner?: string;
}) {
  const date = new Date(session.played_at);
  const day = date.getDate().toString().padStart(2, '0');
  const month = date.toLocaleString('en', { month: 'short' });

  return (
    <div className="flex items-center gap-3 p-3 bg-[var(--card)] border-[1.5px] border-[var(--rule)] rounded-[14px]">
      <div className="w-12 h-12 bg-[var(--cobalt-dim)] rounded-[10px] flex flex-col items-center justify-center shrink-0">
        <span className="text-[1.1rem] text-[var(--cobalt)] leading-none" style={{ fontFamily: 'var(--serif)' }}>{day}</span>
        <span className="text-[0.6rem] text-[var(--cobalt)] uppercase tracking-wider" style={{ fontFamily: 'var(--mono)' }}>{month}</span>
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-[0.95rem] font-normal text-[var(--ink)] mb-0.5" style={{ fontFamily: 'var(--serif)' }}>
          {game?.name || 'Unknown Game'}
        </h3>
        <span className="text-[0.72rem] text-[var(--dust)] whitespace-nowrap overflow-hidden text-ellipsis block">
          {players.join(', ')}
        </span>
      </div>
      {winner && (
        <span className="text-[0.7rem] text-[var(--amber)] font-medium whitespace-nowrap" style={{ fontFamily: 'var(--mono)' }}>
          {winner} won
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('collection');
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGameIds, setSelectedGameIds] = useState<Set<string>>(new Set());
  const [sessions, setSessions] = useState<PlaySession[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch games from Supabase
  useEffect(() => {
    async function fetchGames() {
      if (!supabase) {
        console.warn('Supabase not configured');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('games')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching games:', error);
      } else {
        setGames(data || []);
      }
      setLoading(false);
    }

    fetchGames();
  }, []);

  // Filter games by search query
  const filteredGames = games.filter(game =>
    game.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected games
  const selectedGames = games.filter(game => selectedGameIds.has(game.id));

  // Toggle game selection
  const toggleGameSelection = (gameId: string) => {
    setSelectedGameIds(prev => {
      const next = new Set(prev);
      if (next.has(gameId)) {
        next.delete(gameId);
      } else {
        next.add(gameId);
      }
      return next;
    });
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'collection', label: 'My Games' },
    { id: 'session', label: 'Tonight' },
    { id: 'history', label: 'History' },
  ];

  return (
    <div className="max-w-[480px] mx-auto min-h-screen flex flex-col bg-[var(--paper)] sm:max-w-[540px] sm:mt-8 sm:rounded-3xl sm:min-h-0 sm:h-[calc(100vh-4rem)] sm:shadow-[0_8px_32px_rgba(10,10,15,0.12),0_0_0_1px_var(--rule)] sm:overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-8 pb-5 text-center bg-[var(--ink)] relative overflow-hidden sm:rounded-t-3xl">
        <div className="header-glow absolute inset-0 pointer-events-none" />
        <div className="relative z-10 flex items-center justify-center gap-3">
          <MoonLogo />
          <span className="text-[1.35rem] text-white leading-tight" style={{ fontFamily: 'var(--serif)' }}>
            Day<em className="italic text-[var(--cobalt-lt)]">Dreamers</em> Board Games
          </span>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-2 px-4 py-3 bg-[var(--paper)]">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-2 border-none rounded-[10px] text-[0.85rem] font-medium cursor-pointer transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--cobalt)] text-white'
                : 'bg-transparent text-[var(--dust)] hover:text-[var(--ink)] hover:bg-[var(--cream)]'
            }`}
            style={{ fontFamily: 'var(--sans)' }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pb-8 pt-2 bg-[var(--paper)]">
        {/* Collection View */}
        {activeTab === 'collection' && (
          <section>
            {/* Search Bar */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--card)] border-[1.5px] border-[var(--rule)] rounded-[14px] mb-4 transition-all focus-within:border-[var(--cobalt-lt)] focus-within:shadow-[0_0_0_3px_rgba(28,63,220,0.1)]">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search games..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 border-none bg-transparent text-[0.9rem] text-[var(--ink)] outline-none placeholder:text-[var(--dust)]"
                style={{ fontFamily: 'var(--sans)' }}
              />
            </div>

            {/* Games List */}
            <div className="flex flex-col gap-2">
              {loading ? (
                <p className="text-center text-[var(--dust)] py-8">Loading games...</p>
              ) : filteredGames.length === 0 ? (
                <p className="text-center text-[var(--dust)] py-8">
                  {searchQuery ? 'No games found' : 'No games in collection'}
                </p>
              ) : (
                filteredGames.map(game => (
                  <GameItem
                    key={game.id}
                    game={game}
                    isSelected={selectedGameIds.has(game.id)}
                    onToggle={() => toggleGameSelection(game.id)}
                  />
                ))
              )}
            </div>
          </section>
        )}

        {/* Tonight's Session View */}
        {activeTab === 'session' && (
          <section>
            <div className="flex justify-between items-baseline mb-4">
              <h2 className="text-[1.35rem] font-normal text-[var(--ink)]" style={{ fontFamily: 'var(--serif)' }}>
                Tonight&apos;s <em className="italic text-[var(--cobalt)]">Games</em>
              </h2>
              <span className="text-[0.72rem] text-[var(--dust)]" style={{ fontFamily: 'var(--mono)' }}>
                {selectedGames.length} selected
              </span>
            </div>

            {selectedGames.length === 0 ? (
              <p className="text-center text-[var(--dust)] py-8">
                No games selected. Go to My Games to add some!
              </p>
            ) : (
              <>
                <div className="flex flex-col gap-2 mb-5">
                  {selectedGames.map(game => (
                    <SelectedGame
                      key={game.id}
                      game={game}
                      onRemove={() => toggleGameSelection(game.id)}
                    />
                  ))}
                </div>

                <div className="flex gap-2 mb-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-none bg-[var(--cobalt)] text-white text-[0.9rem] font-semibold cursor-pointer transition-all hover:bg-[var(--cobalt-lt)] active:scale-[0.98]" style={{ fontFamily: 'var(--sans)' }}>
                    <CheckIcon />
                    Start Session
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-[1.5px] border-[var(--rule)] bg-[var(--card)] text-[var(--ink)] text-[0.9rem] font-semibold cursor-pointer transition-all hover:border-[var(--cobalt)] hover:text-[var(--cobalt)]" style={{ fontFamily: 'var(--sans)' }}>
                    Share
                  </button>
                </div>

                <p className="text-center text-[0.78rem] text-[var(--dust)] py-3 bg-[var(--cream)] rounded-[10px]">
                  Friends with the link can see your picks!
                </p>
              </>
            )}
          </section>
        )}

        {/* History View */}
        {activeTab === 'history' && (
          <section>
            <div className="flex flex-col gap-2">
              {sessions.length === 0 ? (
                <p className="text-center text-[var(--dust)] py-8">
                  No play sessions logged yet.
                </p>
              ) : (
                sessions.map(session => (
                  <HistoryItem
                    key={session.id}
                    session={session}
                    game={games.find(g => g.id === session.game_id)}
                    players={[]}
                    winner={undefined}
                  />
                ))
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
