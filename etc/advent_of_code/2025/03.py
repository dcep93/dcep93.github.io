# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && python3 03.py

import pathlib

use_example = False

with open(f"./{pathlib.Path(__file__).stem}.txt") as fh:
    txt = fh.read()


def get_lines():
    for index, line in enumerate(txt.split("\n")):
        yield index, line


def main():
    print(part1.run())
    # print(part2.run())


class part1:
    @classmethod
    def run(cls):
        return 0


class part2(part1):
    pass


EXAMPLE = """

"""


if use_example:
    txt = EXAMPLE[1:-1]
main()
