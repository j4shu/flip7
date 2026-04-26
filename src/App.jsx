import { useMemo } from 'react';
import { Client } from 'boardgame.io/react';
import { Flip7 } from './game/Game.js';
import { Board } from './board/Board.jsx';

function App() {
  const Flip7Client = useMemo(
    () => Client({ game: Flip7, board: Board, numPlayers: 2, debug: false }),
    []
  );
  return <Flip7Client />;
}

export default App;
