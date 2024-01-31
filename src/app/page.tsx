'use client';

import axios from 'axios';
import {
    Box,
    Button,
    CircularProgress,
    Container,
    CssBaseline,
    Divider,
    LinearProgress,
    LinearProgressProps,
    Link,
    Stack,
    ThemeProvider,
    Typography,
    createTheme,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import PuzzleBoard from './board/puzzle/PuzzleBoard';

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
                {props.value}/{props.max}
            </Typography>
        </Stack>
    );
}

function Prechess() {
    const [requestStatus, setRequestStatus] = useState('NOT_SENT');
    const [pgns, setPgns] = useState<string[]>([]);
    const [index, setIndex] = useState(0);

    const onNextPuzzle = useCallback(() => {
        setIndex((v) => v + 1);
    }, [setIndex]);

    useEffect(() => {
        if (requestStatus === 'NOT_SENT') {
            setRequestStatus('LOADING');
            axios
                .get<string>('https://prechess-pgns.s3.amazonaws.com/prechess.pgn', {
                    headers: {
                        'Cache-Control': 'no-cache',
                    },
                })
                .then((resp) => {
                    console.log('resp: ', resp);
                    setPgns(resp.data.split('\n\n\n').filter((pgn) => pgn.trim() !== ''));
                    setRequestStatus('SUCCESS');
                })
                .catch((err) => {
                    console.error('got PGNs: ', err);
                    setRequestStatus('ERROR');
                });
        }
    }, [requestStatus, setRequestStatus, setPgns]);

    if (requestStatus === 'NOT_SENT' || requestStatus === 'LOADING') {
        return (
            <Container
                maxWidth={false}
                sx={{
                    py: 4,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <CircularProgress />
            </Container>
        );
    }

    if (requestStatus === 'ERROR') {
        return (
            <Container
                maxWidth={false}
                sx={{
                    py: 4,
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Typography>Failed to fetch PGNs</Typography>
            </Container>
        );
    }

    return (
        <Container
            maxWidth={false}
            sx={{
                pt: 1,
                pb: 1,
                px: '0 !important',
                '--gap': '16px',
                '--site-header-height': '20px',
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
                        xs: 'auto auto auto',
                    },
                    gridTemplateColumns: {
                        xs: '1fr',
                        md: 'auto var(--board-size) auto',
                    },
                    gridTemplateAreas: {
                        xs: '"subtitle" "pgn" "about"',
                        md: '". subtitle ." ". pgn ." ". about ."',
                    },
                }}
            >
                <Stack mt={1} gridArea='subtitle'>
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

                <Stack mt={5} gridArea='about' alignItems='center'>
                    <Typography variant='h4'>PreChess</Typography>
                    <Stack direction='row' spacing={1}>
                        <Link href='https://www.buymeacoffee.com/prechess'>about</Link>
                        <Divider orientation='vertical' />
                        <Link href='https://www.buymeacoffee.com/prechess'>support</Link>
                        <Divider orientation='vertical' />
                        <Link href='https://www.buymeacoffee.com/prechess'>contact</Link>
                    </Stack>
                </Stack>
            </Box>
        </Container>
    );
}
