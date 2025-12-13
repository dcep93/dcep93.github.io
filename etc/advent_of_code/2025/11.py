# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 11.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "d14220ee66aeec73c49038385428ec4c"
    should_log: bool
    txt: str

    @classmethod
    def get_m(cls):
        m = {}
        for _, line in cls.get_lines():
            parts = line.split(": ")
            m[parts[0]] = parts[1].split(" ")
        return m

    @classmethod
    def run(cls):
        m = cls.get_m()
        return cls.helper1("you", "out", m, [])

    @classmethod
    def helper1(cls, start, dest, m, seen):
        memo = {}
        resp = cls.helper2(start, dest, m, seen, memo)
        c, mms = resp
        while mms:
            nextMms = []
            for mm in mms:
                cc, mmms = memo[mm]
                c += cc
                nextMms += mmms
            mms = nextMms
        return c

    @classmethod
    def helper2(cls, start, dest, m, seen, memo):
        o = m[start]
        if dest in o:
            return 1, []
        if "out" in o:
            return 0, []
        memoized = memo.get(start)
        if memoized is not None:
            return memoized
        memo[start] = (-1, [])
        nextSeen = seen + [start]
        c, mms = 0, []
        for cc, mmms in (
            cls.helper2(s, dest, m, nextSeen, memo) for s in o if s not in seen
        ):
            c += cc
            mms += mmms
        memo[start] = c, mms
        return c, mms

    @classmethod
    def main(cls, *, should_log, use_example):
        cls.should_log = should_log

        if use_example:
            cls.txt = EXAMPLE[1:-1]
        else:
            with open(f"./{pathlib.Path(__file__).stem}.txt") as fh:
                cls.txt = fh.read()

        rval = cls.run()
        rval_md5 = cls.md5(rval)
        assert use_example or cls.answer_md5 == "" or cls.answer_md5 == rval_md5
        cls.log(rval)
        if not use_example:
            cls.log(f"hash: {rval_md5}")

    @classmethod
    def get_lines(cls):
        for index, line in enumerate(cls.txt.split("\n")):
            yield index, line

    @classmethod
    def log(cls, str):
        if cls.should_log:
            print(str)

    @classmethod
    def md5(cls, value):
        num_str = str(value)
        num_bytes = num_str.encode("utf-8")
        m = hashlib.md5()
        m.update(num_bytes)
        return m.hexdigest()


class part2(part1):
    answer_md5 = ""

    @classmethod
    def run(cls):
        m = cls.get_m()
        svr_to_fft = cls.helper1("svr", "fft", m, ["dac"])
        fft_to_dac = cls.helper1("fft", "dac", m, [])
        dac_to_out = cls.helper1("dac", "out", m, [])

        svr_to_fft_to_dac_to_out = svr_to_fft * fft_to_dac * dac_to_out

        svr_to_dac = cls.helper1("svr", "dac", m, ["fft"])
        dac_to_fft = cls.helper1("dac", "fft", m, [])
        fft_to_out = cls.helper1("fft", "out", m, [])

        svr_to_dac_to_fft_to_out = svr_to_dac * dac_to_fft * fft_to_out

        return svr_to_fft_to_dac_to_out + svr_to_dac_to_fft_to_out


EXAMPLE = (
    """
aaa: you hhh
you: bbb ccc
bbb: ddd eee
ccc: ddd eee fff
ddd: ggg
eee: out
fff: out
ggg: out
hhh: ccc fff iii
iii: out
"""
    if False
    else """
svr: aaa bbb
aaa: fft
fft: ccc
bbb: tty
tty: ccc
ccc: ddd eee
ddd: hub
hub: fff
eee: dac
dac: fff
fff: ggg hhh
ggg: out
hhh: out
"""
)


main()
