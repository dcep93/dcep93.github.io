# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 09.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "dd60f2b49913140b064db7d73c27f021"
    should_log: bool
    txt: str

    @classmethod
    def run(cls):
        reds = [[int(i) for i in line.split(",")] for _, line in cls.get_lines()]
        cls.init(reds)
        size = 0
        for i in range(len(reds)):
            ix, iy = reds[i]
            for j in range(i):
                jx, jy = reds[j]
                ijsize = cls.get_size(ix, iy, jx, jy)
                size = max(size, ijsize)
        return size

    @classmethod
    def init(cls, _reds):
        pass

    @classmethod
    def get_size(cls, ix, iy, jx, jy):
        return (1 + abs(ix - jx)) * (1 + abs(iy - jy))

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
    holes: set[tuple[int, int, int]] = set()
    parity = 0

    @classmethod
    def init(cls, reds):
        parity = 1
        prev = (0, 0)
        corner = tuple(min(reds))
        for i in range(len(reds)):
            ix, iy = reds[i]
            jx, jy = reds[i - 1]
            kx, ky = reds[i - 2]
            if jx != ix and jx != kx:
                continue
            if jy != iy and jy != ky:
                continue
            jjx = ix if ix != jx else kx
            jjy = iy if iy != jy else ky
            hhx = 1 if jjx > jx else -1
            hhy = 1 if jjy > jy else -1
            if (hhx - prev[0]) * (hhy - prev[1]) != 0:
                parity *= -1
            if (jx, jy) == corner:
                cls.parity = parity
            prev = (hhx, hhy)
            cls.holes.add((hhx + jx, hhy + jy, parity))

    @classmethod
    def get_size(cls, ix, iy, jx, jy):
        for hx, hy, parity in cls.holes:
            if parity != cls.parity:
                if (hx - ix) * (hx - jx) <= 0 and (hy - iy) * (hy - jy) <= 0:
                    return -1
        return super().get_size(ix, iy, jx, jy)

    # 4599890450 too high


EXAMPLE = """
7,1
11,1
11,7
9,7
9,5
2,5
2,3
7,3
"""


main()
