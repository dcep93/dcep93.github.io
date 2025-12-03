# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && python3 03.py

import pathlib

use_example = False

with open(f"./{pathlib.Path(__file__).stem}.txt") as fh:
    txt = fh.read()


def get_lines():
    for index, line in enumerate(txt.split("\n")):
        yield index, line


def main():
    # print(part1.run(True))
    assert use_example or part1.run() == 17766
    print(part2.run())


class part1:
    should_log = False

    @classmethod
    def log(cls, str):
        if cls.should_log:
            print(str)

    @classmethod
    def run(cls):
        return cls.run_size(2)

    @classmethod
    def run_size(cls, size):
        total = 0
        for _, line in get_lines():
            besties = [int(b) for b in line[-size:]]
            for c in reversed(line[:-size]):
                v = int(c)
                for i, b in enumerate(besties):
                    if v < b:
                        break
                    if v > b:
                        besties[i] = v
                        v = b
            vv = sum([10**i * b for i, b in enumerate(besties[::-1])])
            total += vv
        return total

    @classmethod
    def old(cls, line):
        best = int(line[-2])
        next_best = int(line[-1])
        for c in reversed(line[:-2]):
            v = int(c)
            if v >= best:
                next_best = max(best, next_best)
                best = v
        return 10 * best + next_best


class part2(part1):
    should_log = True

    @classmethod
    def run(cls):
        return cls.run_size(12)


EXAMPLE = """
987654321111111
811111111111119
234234234234278
818181911112111
"""


if use_example:
    txt = EXAMPLE[1:-1]
main()
