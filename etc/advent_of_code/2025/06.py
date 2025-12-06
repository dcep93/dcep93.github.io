# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 06.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "91414ef28494f46c1e1d2dfe33b736bd"
    should_log: bool
    txt: str

    @classmethod
    def run_line(cls, index: int, line: str) -> int:
        return 0

    @classmethod
    def run(cls):
        problems = []
        for i, line in cls.get_lines():
            index = 0
            digits = ""
            for char in line + " ":
                if char == " ":
                    if digits:
                        if i == 0:
                            problems.append([digits])
                        else:
                            problems[index].append(digits)
                        index += 1
                        digits = ""
                else:
                    digits += char
        return cls.add_problems(problems)

    @classmethod
    def add_problems(cls, problems):
        total = 0
        for p in problems:
            pp = p[:-1]
            o = p[-1]
            pval = None
            if o == "+":
                pval = 0
                for ppp in pp:
                    pval += int(ppp)
            elif o == "*":
                pval = 1
                for ppp in pp:
                    pval *= int(ppp)
            else:
                assert None, o
            total += pval

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
    def run(cls):
        grid = [line for _, line in cls.get_lines()]
        num_cols = max([len(line) for line in grid])
        for line in grid:
            assert num_cols == len(line)
        problems = []
        last = 0
        for col in range(num_cols + 1):
            if col < num_cols and any(line[col] != " " for line in grid):
                continue
            problems.append(
                [
                    "".join([line[i] for line in grid[:-1]]).strip()
                    for i in range(last, col)
                ]
                + [grid[-1][last]]
            )
            last = col + 1
        return cls.add_problems(problems)


EXAMPLE = """
123 328  51 64 
 45 64  387 23 
  6 98  215 314
*   +   *   +  
"""


main()
