# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && python3 02.py

import pathlib

use_example = True

with open(f"./{pathlib.Path(__file__).stem}.txt") as fh:
    txt = fh.read()


def get_lines():
    for index, line in enumerate(txt.split("\n")):
        yield index, line


def main():
    assert use_example or part1.run() == 22062284697
    print(part2.run())


class part1:
    @classmethod
    def run(cls):
        invalid = 0

        for r in txt.split(","):
            for digits_sum in cls.p1_get_invalid_sums(*[int(x) for x in r.split("-")]):
                invalid += digits_sum
        return invalid

    @classmethod
    def p1_get_invalid_sums(cls, lower, upper):
        while True:
            invalid_sum, next_lower = cls.p1_helper(lower)
            if next_lower > upper:
                sub, _ = cls.p1_helper(upper + 1)
                yield invalid_sum - sub
                break
            yield invalid_sum
            lower = next_lower

    @classmethod
    def p1_helper(cls, lower):
        strlen = cls.p1_get_strlen(lower)
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

    @classmethod
    def p1_get_strlen(cls, value):
        import math

        return math.ceil(math.log10(value + 1))


class part2(part1):

    @classmethod
    def p1_helper(cls, lower):
        strlen = cls.p1_get_strlen(lower)
        if cls.p1_get_strlen(lower + 1) > strlen:
            invalid = lower
        else:
            invalid = float("inf")
            distance = float("inf")
            for s in range(1, strlen + 1):
                if (strlen / s) % 1 == 0:
                    s_invalid = cls.p2_get_invalid(lower, s, strlen)
                    s_distance = lower - s_invalid
                    if s_distance < distance:
                        distance = s_distance
                        invalid = s_invalid
        return invalid, invalid + 1

    @classmethod
    def p2_get_invalid(cls, lower, s, strlen):
        size = 10**s
        first = cls.p2_get_digits(lower, 0, s, strlen, size)
        for i in range(1, strlen // s):
            digits = cls.p2_get_digits(lower, i, s, strlen, size)
            if digits > first:
                first = first + 1
                break
        for _ in range(1, strlen // s):
            first = first * (size + 1)
        return first

    @classmethod
    def p2_get_digits(cls, value, i, s, strlen, size):
        for _ in range(1, (strlen // s) - i):
            value = value // size
        value = value % (10**s)
        return value


EXAMPLE = """
11-22,95-115,998-1012,1188511880-1188511890,222220-222224,1698522-1698528,446443-446449,38593856-38593862,565653-565659,824824821-824824827,2121212118-2121212124
"""


if use_example:
    txt = EXAMPLE[1:-1]
main()
