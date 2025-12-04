# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 12.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 != ""
    part1.main(should_log=log_part_1, use_example=True)
    if not log_part_1:
        part2.main(should_log=True, use_example=True)


class part1:
    answer_md5 = ""
    should_log: bool
    txt: str

    @classmethod
    def run_line(cls, index: int, line: str) -> int:
        return 0

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
    def run_line(cls):
        return 0


EXAMPLE = """

"""


main()
