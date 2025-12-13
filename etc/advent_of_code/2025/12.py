# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 12.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=True)


class part1:
    answer_md5 = ""
    should_log: bool
    txt: str

    @classmethod
    def run(cls):
        parts = cls.txt.split("\n\n")
        raw_shapes = [p.split("\n")[1:] for p in parts[:-1]]
        shapes = [
            (raw, len([c for line in raw for c in line if c == "#"]))
            for raw in raw_shapes
        ]
        return len(
            [None for line in parts[-1].split("\n") if cls.can_fit(line, shapes)]
        )

    @classmethod
    def can_fit(cls, line, shapes):
        parts = line.split(": ")
        size = [int(i) for i in parts[0].split("x")]
        counts = [int(i) for i in parts[1].split(" ")]
        needed = sum([counts[i] * shapes[i][1] for i in range(len(counts))])
        if size[0] * size[1] < needed:
            return False
        start = [[0 for _ in range(size[0])] for _ in range(size[1])]
        return cls.helper(start, counts, shapes)

    @classmethod
    def helper(cls, start, counts, shapes):
        return True

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
        return cls.txt.split("\n")

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
    def run_line(cls):
        return 0


EXAMPLE = """
0:
###
##.
##.

1:
###
##.
.##

2:
.##
###
##.

3:
##.
###
##.

4:
###
#..
###

5:
###
.#.
###

4x4: 0 0 0 0 2 0
12x5: 1 0 1 0 2 2
12x5: 1 0 1 0 3 2
"""


main()
