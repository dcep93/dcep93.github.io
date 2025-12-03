# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && python3 03.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 != ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5: str = "a530271b32d4cca7b2817af7bc0de0db"
    should_log: bool
    txt: str

    @classmethod
    def run_line(cls, index: int, line: str) -> int:
        return cls.run_size(2, line)

    @classmethod
    def run_size(cls, size, line):
        besties = [int(b) for b in line[-size:]]
        for c in reversed(line[:-size]):
            v = int(c)
            for i, b in enumerate(besties):
                if v < b:
                    break
                if v > b:
                    besties[i] = v
                    v = b
        return sum([10**i * b for i, b in enumerate(besties[::-1])])

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
        assert use_example or cls.answer_md5 is None or cls.answer_md5 == rval_md5
        cls.log(rval)
        cls.log(f"hash: {rval_md5}")

    @classmethod
    def run(cls):
        total = 0
        for i, line in cls.get_lines():
            total += cls.run_line(i, line)
        return total

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
    def run_line(cls, index: int, line: str) -> int:
        return cls.run_size(12, line)


EXAMPLE = """
987654321111111
811111111111119
234234234234278
818181911112111
"""


main()
