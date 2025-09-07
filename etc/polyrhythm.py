#!/usr/bin/env python3
# Usage: python poly.py <period_secs> <count_c> <count_g>
import sys, time, math, numpy as np, simpleaudio as sa

SR, NOTE_LEN, GAIN, FADE_MS = 44100, 0.1, 0.7, 6


def tone(freq):
    n = int(SR * NOTE_LEN)
    t = np.arange(n) / SR
    f = max(1, int(SR * FADE_MS / 1000))
    env = np.ones(n)
    env[:f] = np.linspace(0, 1, f)
    env[-f:] = np.linspace(1, 0, f)
    return (np.sin(2 * math.pi * freq * t) * env * GAIN * (2**15 - 1)).astype(np.int16)


def play(buf):
    sa.play_buffer(buf, 1, 2, SR)


def main(P, NC, NG):
    C, G, E = tone(261.63), tone(392.00), tone(659.26)  # C4, G4, E5
    tc = [k * P / NC for k in range(NC)]
    tg = [k * P / NG for k in range(NG)]
    # Merge events after the boundary strike
    events = {}
    for x in tc[1:]:
        events.setdefault(x, [False, False])[0] = True
    for x in tg[1:]:
        events.setdefault(x, [False, False])[1] = True
    nb = time.monotonic()
    while True:
        play(C)
        play(G)
        play(E)  # boundary: all three
        for off in sorted(events):
            dt = nb + off - time.monotonic()
            if dt > 0:
                time.sleep(dt)
            if events[off][0]:
                play(C)
            if events[off][1]:
                play(G)
        nb += P
        dt = nb - time.monotonic()
        if dt > 0:
            time.sleep(dt)


if __name__ == "__main__":
    if len(sys.argv) != 4:
        sys.exit("Usage: python poly.py <period_secs> <count_c> <count_g>")
    main(float(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]))
