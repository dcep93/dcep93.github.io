# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 07.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "aff0a6a4521232970b2c1cf539ad0a19"
    should_log: bool
    txt: str

    @classmethod
    def run_line(cls, index: int, line: str) -> int:
        return 0

    @classmethod
    def run(cls):
        grid = [line for _, line in cls.get_lines()]
        beams = set([grid[0].find("S")])
        splits = 0
        for line in grid[1:]:
            next_beams = set()
            for beam in beams:
                if line[beam] == "^":
                    next_beams.add(beam - 1)
                    next_beams.add(beam + 1)
                    splits += 1
                else:
                    next_beams.add(beam)
            beams = next_beams
        return splits

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
        grid = [line for _, line in cls.get_lines()]

        cache = {}

        def count_possibilities(row, column):
            if row == len(grid):
                return 1
            if grid[row][column] == ".":
                return count_possibilities(row + 1, column)
            key = (row, column)
            if key in cache:
                return cache[key]
            rval = count_possibilities(row + 1, column - 1) + count_possibilities(
                row + 1, column + 1
            )
            cache[key] = rval
            return rval

        return count_possibilities(1, grid[0].find("S"))


EXAMPLE = """
.......S.......
...............
.......^.......
...............
......^.^......
...............
.....^.^.^.....
...............
....^.^...^....
...............
...^.^...^.^...
...............
..^...^.....^..
...............
.^.^.^.^.^...^.
...............
"""


main()
