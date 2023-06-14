import type { LobbyId } from '$/commonTypesWithClient/branded';
import type { BoardArray, Pos } from '$/repository/boardRepository';
import type { PlayerTurn, Score } from '$/repository/playerRepository';
import { lobbyIdParser } from '$/service/idParsers';
import { useAtom } from 'jotai';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { userAtom } from 'src/atoms/user';
import { Loading } from 'src/components/Loading/Loading';
import { BasicHeader } from 'src/pages/@components/BasicHeader/BasicHeader';
import { apiClient } from 'src/utils/apiClient';
import { returnNull } from 'src/utils/returnNull';
import Board from '../@components/Othello/Board/Board';
import Modal from '../@components/Othello/Modal/Modal';
import ScoreBorder from '../@components/Othello/ScoreBorder/ScoreBorder';
import styles from './index.module.css';

const Home = () => {
  // Function to handle disc placement
  const onClick = async (x: number, y: number) => {
    const isValid = validMoveList.some((move) => move.x === x && move.y === y);

    if (isValid) {
      await apiClient.board._lobbyId(lobbyIdRef.current).$put({ body: { x, y } });
      await fetchBoard();
    }
  };

  // State initialization
  const [user] = useAtom(userAtom);
  const [board, setBoard] = useState<BoardArray>();
  const [score, setScore] = useState<Score>({ blackScore: 0, whiteScore: 0 });
  const [latestMove, setLatestMove] = useState<Pos>();
  const [validMoveList, setValidMoveList] = useState<Pos[]>([]);
  const [currentTurnPlayerId, setCurrentTurnPlayerId] = useState<PlayerTurn>();
  const [isGameEnd, setIsGameEnd] = useState<boolean>(false);
  const [playerNum, setPlayerNum] = useState<number>(0);

  // Route handler data
  const router = useRouter();
  const { lobbyId } = router.query;

  // Update lobbyIdRef whenever lobbyId change
  const lobbyIdRef = useRef<LobbyId>(lobbyIdParser.parse(lobbyId ?? ''));
  useEffect(() => {
    lobbyIdRef.current = lobbyIdParser.parse(lobbyId ?? '');
  }, [lobbyId]);

  // GET board
  const fetchBoard = async () => {
    const board = await apiClient.board._lobbyId(lobbyIdRef.current).$get().catch(returnNull);

    if (board !== null) {
      setBoard(board.boardData);
      // Add a list of valid moves
      const validMoveList: Pos[] = await apiClient.board
        ._lobbyId(lobbyIdRef.current)
        .valid_move.$get();
      setValidMoveList(validMoveList);
      // Set latest move
      setLatestMove(board.latestMove);
      // Set game status
      setIsGameEnd(board.isGameEnd);
      // Get current turn user id
      setCurrentTurnPlayerId(board.currentTurnUserId);
    }
  };

  // GET score
  const fetchScore = async () => {
    const response = await apiClient.player._lobbyId(lobbyIdRef.current).$get();
    setPlayerNum(response.player.length);
    if (response.player.length === 2) {
      const blackScore =
        response.player[0].color === 1 ? response.player[0].score : response.player[1].score;
      const whiteScore =
        response.player[0].color === 2 ? response.player[0].score : response.player[1].score;
      setScore({ blackScore, whiteScore });
    }
  };

  // Fetch board every 0.5s
  useEffect(() => {
    const cancelId = setInterval(() => {
      fetchBoard();
      fetchScore();
    }, 500);
    return () => clearInterval(cancelId);
  }, []);

  if (!board || !user) return <Loading visible />;

  return (
    <>
      <BasicHeader user={user} />
      <div className={styles.container}>
        <div className={styles.row}>
          <ScoreBorder score={score} color={1} backgroundColor={'#000'} />

          <Board
            user={user}
            board={board}
            latestMovePos={latestMove}
            currentTurnPlayerId={currentTurnPlayerId}
            validMoveList={validMoveList}
            onClick={onClick}
          />
          <Modal
            // validMoveList={validMoveList}
            isGameEnd={isGameEnd}
            score={score}
            lobbyId={lobbyIdRef.current}
            playerNum={playerNum}
          />

          <ScoreBorder score={score} color={2} backgroundColor={'#fff'} />
        </div>
      </div>
    </>
  );
};

export default Home;
