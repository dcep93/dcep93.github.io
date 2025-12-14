# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 10.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "7fe1f8abaad094e0b5cb1b01d712f708"
    should_log: bool
    txt: str

    @classmethod
    def run_line(cls, index: int, line: str) -> int:
        parts = line.split(" ")
        indicator = tuple([1 if i == "#" else 0 for i in parts[0][1:-1]])
        buttons = [[int(i) for i in b[1:-1].split(",")] for b in parts[1:-1]]
        joltage = [int(i) for i in parts[-1][1:-1].split(",")]
        return cls.run_line_helper(indicator, buttons, joltage)

    @classmethod
    def run_line_helper(
        cls, indicator: tuple[int, ...], buttons: list[list[int]], joltage: list[int]
    ) -> int:
        seen = set()
        queue = [(indicator, 0)]
        while queue:
            i, count = queue.pop(0)
            if all(ii == 0 for ii in i):
                return count
            for b in buttons:
                j = tuple([1 - ii if index in b else ii for index, ii in enumerate(i)])
                if j in seen:
                    continue
                seen.add(j)
                queue.append((j, count + 1))
        assert None, (indicator, buttons)

    @classmethod
    def run(cls):
        total = 0
        for i, line in cls.get_lines():
            total += cls.run_line(i, line)
        return total

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
    def run_line_helper(
        cls, indicator: tuple[int, ...], buttons: list[list[int]], joltage: list[int]
    ) -> int:
        seen = set()
        queue = [(tuple(joltage), 0)]
        print(joltage, buttons)
        while queue:
            i, count = queue.pop(0)
            if all(ii == 0 for ii in i):
                return count
            biggest = sorted([(ii, index) for index, ii in enumerate(i)], reverse=True)[
                0
            ][1]
            print(joltage, i, biggest, buttons)
            for b in buttons:
                if biggest not in b:
                    continue
                j = tuple([ii - 1 if index in b else ii for index, ii in enumerate(i)])
                if any(jj < 0 for jj in j):
                    continue
                if j in seen:
                    continue
                seen.add(j)
                queue.append((j, count + 1))
        assert None, (joltage, buttons)


import numpy as np


EXAMPLE = """
[.##.] (3) (1,3) (2) (2,3) (0,2) (0,1) {3,5,4,7}
[...#.] (0,2,3,4) (2,3) (0,4) (0,1,2) (1,2,3,4) {7,5,12,7,2}
[.###.#] (0,1,2,3,4) (0,3,4) (0,1,2,4,5) (1,2) {10,11,11,5,10,5}
"""


main()
