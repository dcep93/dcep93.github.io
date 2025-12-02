# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && python3 02.py

import pathlib

use_example = False

with open(f"./{pathlib.Path(__file__).stem}.txt") as fh:
    txt = fh.read()


def get_lines():
    for index, line in enumerate(txt.split("\n")):
        yield index, line


def main():
    print(part1.run())
    print(part2.run())


class part1:
    @classmethod
    def run(cls):
        invalid = 0

        for r in txt.split(","):
            for digits_sum in cls.get_invalid_sums(*[int(x) for x in r.split("-")]):
                invalid += digits_sum
        return invalid

    @classmethod
    def get_invalid_sums(cls, lower, upper):
        while True:
            invalid_sum, next_lower = cls.helper(lower)
            if next_lower > upper:
                sub, _ = cls.helper(upper + 1)
                yield invalid_sum - sub
                break
            yield invalid_sum
            lower = next_lower

    @classmethod
    def helper(cls, lower):
        import math

        strlen = math.ceil(math.log10(lower + 1))
        next_lower = 10**strlen
        if strlen % 2 == 1:
            invalid_sum = 0
        else:
            first = lower // (10 ** (strlen / 2))
            second = lower % (10 ** (strlen / 2))
            digits = first if first >= second else first + 1
            bottom = digits * ((10 ** (strlen / 2)) + 1)
            top = next_lower - 1
            count = (top - bottom) / ((10 ** (strlen / 2)) + 1)
            invalid_sum = int(((count + 1) * (bottom + top)) // 2)
        return invalid_sum, next_lower


class part2(part1):
    pass


EXAMPLE = """
11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124
"""


if use_example:
    txt = EXAMPLE[1:-1]
main()
