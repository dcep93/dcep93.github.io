# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 05.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "6cd67d9b6f0150c77bda2eda01ae484c"
    should_log: bool
    txt: str

    @classmethod
    def run_line(cls, index: int, line: str) -> int:
        return 0

    @classmethod
    def run(cls):
        raw_ranges, ingredients = cls.txt.split("\n\n")
        ranges = [[int(i) for i in r.split("-")] for r in raw_ranges.split("\n")]
        count = 0
        for raw_ingredient in ingredients.split("\n"):
            ingredient = int(raw_ingredient)
            spoiled = True
            for low, high in ranges:
                if ingredient >= low and ingredient <= high:
                    spoiled = False
                    break
            if not spoiled:
                count += 1
        return count

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
        cls.log(rval)
        assert use_example or cls.answer_md5 == "" or cls.answer_md5 == rval_md5
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
    answer_md5 = "a1774d0c1872466b38be8bb15cac5b53"

    @classmethod
    def run(cls):
        raw_ranges, _ingredients = cls.txt.split("\n\n")
        ranges = sorted(
            [[int(i) for i in r.split("-")] for r in raw_ranges.split("\n")]
        )
        distinct_ranges = []
        for low, high in ranges:
            cls.log(low, high)
            for _, rhigh in distinct_ranges:
                low = max(low, rhigh + 1)
            if high >= low:
                distinct_ranges.append((low, high))
        [cls.log(r) for r in distinct_ranges]
        return sum([1 + b - a for a, b in distinct_ranges])


EXAMPLE = """
3-5
10-14
16-20
12-18

1
5
8
11
17
32
"""


main()
