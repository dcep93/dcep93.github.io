# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && python3 01.py

use_example = False

with open("./01.txt") as fh:
    txt = fh.read()


def get_lines():
    for index, line in enumerate(txt.split("\n")):
        yield index, line


def main():
    print(part1())
    print(part2())


start = 50
size = 100

#


def part1():
    position = start
    count = 0
    for index, line in get_lines():
        diff = (-1 if line[0] == "L" else 1) * int(line[1:])
        position += diff
        if position % size == 0:
            count += 1
    return count


def part2():
    position = start
    count = 0
    for index, line in get_lines():
        diff = (-1 if line[0] == "L" else 1) * int(line[1:])
        direction = -1 if diff < 0 else 1
        count += (abs(diff) + (position * direction) % size) // size
        position += diff
    return count


def part2_too_low_a():
    position = start
    count = 0
    for index, line in get_lines():
        diff = (-1 if line[0] == "L" else 1) * int(line[1:])
        count += abs((diff + (position % size)) // size)
        position += diff
    return count


EXAMPLE = """
L68
L30
R48
L5
R60
L55
L1
L99
R14
L82
"""


if use_example:
    txt = EXAMPLE[1:-1]
main()
