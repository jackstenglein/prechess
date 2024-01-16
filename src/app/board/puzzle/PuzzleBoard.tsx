import { createContext, useCallback, useContext, useState } from 'react';
import { Box, SxProps, Theme } from '@mui/material';
import { Chess, Move } from '@jackstenglein/chess';

import Board, {
    BoardApi,
    PrimitiveMove,
    reconcile,
    toColor,
    toDests,
    toShapes,
} from '../Board';

interface ChessConfig {
    allowMoveDeletion?: boolean;
}

type ChessContextType = {
    chess?: Chess;
    board?: BoardApi;
    config?: ChessConfig;
};

export const ChessContext = createContext<ChessContextType>(null!);

export function useChess() {
    return useContext(ChessContext);
}

export enum Status {
    WaitingForMove,
    IncorrectMove,
    CorrectMove,
    Complete,
}

interface PuzzleBoardProps {
    pgn: string;
    sx?: SxProps<Theme>;
    onNextPuzzle: () => void;
}

const PuzzleBoard: React.FC<PuzzleBoardProps> = ({ pgn, sx, onNextPuzzle }) => {
    const [board, setBoard] = useState<BoardApi>();
    const [chess, setChess] = useState<Chess>();
    const [status, setStatus] = useState(Status.WaitingForMove);
    const [move, setMove] = useState<Move | null>(null);
    const [lastCorrectMove, setLastCorrectMove] = useState<Move | null>(null);

    const onRestart = (board: BoardApi, chess: Chess) => {
        console.log('on restart with pgn: ', pgn);

        chess.loadPgn(pgn);
        chess.seek(null);
        board.set({
            fen: chess.fen(),
            turnColor: toColor(chess),
            lastMove: [],
            movable: {
                color: toColor(chess),
                dests: toDests(chess),
                free: false,
            },
            premovable: {
                enabled: false,
            },
            drawable: {
                enabled: false,
                shapes: toShapes(chess),
            },
        });
        setBoard(board);
        setChess(chess);
        setStatus(Status.WaitingForMove);
        setMove(null);
        setLastCorrectMove(null);
    };

    const onComplete = useCallback(
        (board: BoardApi, chess: Chess) => {
            board.set({
                fen: chess.fen(),
                movable: {
                    color: toColor(chess),
                    dests: toDests(chess),
                },
                drawable: {
                    shapes: toShapes(chess),
                },
            });
            setStatus(Status.Complete);
            setMove(chess.currentMove());
            onNextPuzzle();
        },
        [onNextPuzzle, setStatus, setMove]
    );

    const onRetry = useCallback(
        (board: BoardApi, chess: Chess) => {
            chess.seek(lastCorrectMove);
            board.set({
                fen: chess.fen(),
                turnColor: toColor(chess),
                lastMove: lastCorrectMove
                    ? [lastCorrectMove.from, lastCorrectMove.to]
                    : [],
                movable: {
                    color: toColor(chess),
                    dests: toDests(chess),
                },
                drawable: {
                    shapes: toShapes(chess),
                },
            });
            setStatus(Status.WaitingForMove);
            setMove(lastCorrectMove);
        },
        [setStatus, setMove]
    );

    const onMove = useCallback(
        (board: BoardApi, chess: Chess, primMove: PrimitiveMove) => {
            const move = {
                from: primMove.orig,
                to: primMove.dest,
                promotion: primMove.promotion,
            };

            if (status === Status.Complete) {
                chess.move(move);
                reconcile(chess, board);
                setMove(chess.currentMove());
                return;
            }

            const isCorrect = chess.isMainline(move);
            if (isCorrect) {
                chess.seek(chess.nextMove());
                if (
                    chess.lastMove() === chess.currentMove() ||
                    chess.hasNagInRange(10, 140)
                ) {
                    return onComplete(board, chess);
                }
                setStatus(Status.CorrectMove);
                setLastCorrectMove(chess.currentMove());
            } else {
                chess.move(move);
                setStatus(Status.IncorrectMove);
                setTimeout(() => onRetry(board, chess), 500);
            }

            board.set({
                fen: chess.fen(),
                turnColor: toColor(chess),
                movable: {
                    color: undefined,
                    dests: undefined,
                },
                drawable: {
                    shapes: toShapes(chess),
                },
            });

            setMove(chess.currentMove());
        },
        [onComplete, status, setStatus, setMove, setLastCorrectMove, onRetry]
    );

    return (
        <Box
            sx={
                sx || {
                    gridArea: 'pgn',
                    display: 'grid',
                    width: 1,
                    alignItems: 'end',
                    gridTemplateRows: {
                        xs: 'auto',
                        md: 'calc(var(--board-size))',
                    },
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'var(--board-size)',
                    },
                    gridTemplateAreas: {
                        xs: '"board"',
                        md: '"board"',
                    },
                }
            }
        >
            <Box
                gridArea='board'
                sx={{
                    aspectRatio: 1,
                    width: 1,
                }}
            >
                <Board onInitialize={onRestart} onMove={onMove} />
            </Box>
        </Box>
    );
};

export default PuzzleBoard;
