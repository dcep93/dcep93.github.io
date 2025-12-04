# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 04.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "95d309f0b035d97f69902e7972c2b2e6"
    should_log: bool
    txt: str

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
        assert use_example or cls.answer_md5 == "" or cls.answer_md5 == rval_md5, (
            rval,
            rval_md5,
        )
        cls.log(rval)
        if not use_example:
            cls.log(f"hash: {rval_md5}")

    @classmethod
    def run(cls):
        lines = [line for _, line in cls.get_lines()]
        paper = set(
            (i, j)
            for i, line in enumerate(lines)
            for j, char in enumerate(line)
            if char == "@"
        )
        return cls.run_paper(paper, len(lines), len(lines[0]))

    @classmethod
    def run_paper(cls, paper, num_rows, num_cols):
        return len(cls.remove(paper, num_rows, num_cols))

    @classmethod
    def remove(cls, paper, num_rows, num_cols):
        d = {p: 0 for p in paper}
        for i, j in paper:
            for ii in range(max(0, i - 1), min(num_rows, i + 1 + 1)):
                for jj in range(max(0, j - 1), min(num_cols, j + 1 + 1)):
                    if ii == i and jj == j:
                        continue
                    if (ii, jj) in d:
                        d[(ii, jj)] += 1
        return [p for p, count in d.items() if count < 4]

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
    def run_paper(cls, paper, num_rows, num_cols):
        total = 0
        for _ in range(1000):
            removed = cls.remove(paper, num_rows, num_cols)
            cls.log(len(removed))
            if len(removed) == 0:
                return total
            total += len(removed)
            for i, j in removed:
                paper.remove((i, j))
        return -1


EXAMPLE = """
..@@.@@@@.
@@@.@.@.@@
@@@@@.@.@@
@.@@@@..@.
@@.@@@@.@@
.@@@@@@@.@
.@.@.@.@@@
@.@@@.@@@@
.@@@@@@@@.
@.@.@@@.@.
"""


main()
