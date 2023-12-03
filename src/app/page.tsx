'use client';

import {
    Box,
    Button,
    Container,
    CssBaseline,
    LinearProgress,
    LinearProgressProps,
    Stack,
    ThemeProvider,
    Typography,
    createTheme,
} from '@mui/material';
import { useCallback, useState } from 'react';

import PuzzleBoard from './board/puzzle/PuzzleBoard';
import { pgns } from './pgns';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
    },
});

export default function App() {
    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
            <Prechess />
        </ThemeProvider>
    );
}

const normalise = (value: number, max: number) => (value * 100) / max;

function LinearProgressWithLabel(
    props: LinearProgressProps & { value: number; max: number }
) {
    return (
        <Stack direction='row' sx={{ alignItems: 'center', mb: 1 }}>
            <Box sx={{ flexGrow: 1, mr: 1 }}>
                <LinearProgress
                    variant='determinate'
                    {...props}
                    value={normalise(props.value, props.max)}
                />
            </Box>
            <Typography variant='body2' color='text.secondary'>
                {props.value}/{props.max} Exercises
            </Typography>
        </Stack>
    );
}

function Prechess() {
    const [index, setIndex] = useState(0);

    const onNextPuzzle = useCallback(() => {
        setIndex((v) => v + 1);
    }, [setIndex]);

    return (
        <Container
            maxWidth={false}
            sx={{
                pt: 4,
                pb: 4,
                px: '0 !important',
                '--gap': '16px',
                '--site-header-height': '80px',
                '--site-header-margin': '150px',
                '--player-header-height': '0px',
                '--toc-width': '21vw',
                '--underboard-width': '400px',
                '--coach-width': '400px',
                '--tools-height': '0px',
                '--board-width':
                    'calc(100vw - var(--coach-width) - 60px - var(--toc-width))',
                '--board-height':
                    'calc(100vh - var(--site-header-height) - var(--site-header-margin) - var(--tools-height) - 2 * var(--player-header-height))',
                '--board-size': 'calc(min(var(--board-width), var(--board-height)))',
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    rowGap: '0px',
                    gridTemplateRows: {
                        xs: 'auto auto',
                    },
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'auto var(--board-size) auto',
                    },
                    gridTemplateAreas: {
                        xs: '"subtitle" "pgn"',
                        md: '". subtitle ." ". pgn ."',
                    },
                }}
            >
                <Stack mt={3} gridArea='subtitle'>
                    {index < pgns.length ? (
                        <LinearProgressWithLabel value={index} max={pgns.length} />
                    ) : (
                        <Stack alignItems='center' spacing={1}>
                            <Typography>Great job completing the puzzles!</Typography>
                            <Button variant='contained' onClick={() => setIndex(0)}>
                                Restart
                            </Button>
                        </Stack>
                    )}
                </Stack>

                {index < pgns.length && (
                    <PuzzleBoard
                        key={pgns[index]}
                        pgn={pgns[index]}
                        onNextPuzzle={onNextPuzzle}
                    />
                )}
            </Box>
        </Container>
    );
}
