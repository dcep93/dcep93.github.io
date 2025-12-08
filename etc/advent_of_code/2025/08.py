# cdr && cd dcep93.github.io/etc/advent_of_code/2025 && echo && python3 08.py

import hashlib
import pathlib


def main():
    log_part_1 = part1.answer_md5 == ""
    part1.main(should_log=log_part_1, use_example=False)
    if not log_part_1:
        part2.main(should_log=True, use_example=False)


class part1:
    answer_md5 = "b1f9aab7542147f95155c5da6aa6934b"
    should_log: bool
    txt: str

    @classmethod
    def run(cls, use_example):
        size = 3
        num_to_connect = 10 if use_example else 1000
        boxes = [[int(i) for i in line.split(",")] for _, line in cls.get_lines()]
        distances = [(float("inf"), -1, -1) for _ in range(num_to_connect)]
        # i > j
        for i in range(len(boxes)):
            for j in range(i):
                distance = cls.get_distance(boxes[i], boxes[j])
                if distance < distances[-1][0]:
                    for k, d in enumerate(distances):
                        if distance < d[0]:
                            distances = (
                                distances[:k] + [(distance, i, j)] + distances[k:-1]
                            )
                            break
        connections = {}
        for distance, i, j in distances:
            ic = connections.get(i)
            jc = connections.get(j)
            if ic and jc:
                if ic != jc:
                    c = ic.union(jc)
                    for cc in c:
                        connections[cc] = c
            elif ic:
                ic.add(j)
                connections[j] = ic
            elif jc:
                jc.add(i)
                connections[i] = jc
            else:
                ijc = set([i, j])
                connections[i] = connections[j] = ijc
        frozens = set([frozenset(c) for c in connections.values()])
        lens = sorted([len(c) for c in frozens], reverse=True)
        rval = 1
        for l in lens[:size]:
            rval *= l
        return rval

    @classmethod
    def get_distance(cls, a, b):
        assert len(a) == len(b)
        return sum([(a[i] - b[i]) ** 2 for i in range(len(a))]) ** 0.5

    @classmethod
    def main(cls, *, should_log, use_example):
        cls.should_log = should_log

        if use_example:
            cls.txt = EXAMPLE[1:-1]
        else:
            with open(f"./{pathlib.Path(__file__).stem}.txt") as fh:
                cls.txt = fh.read()

        rval = cls.run(use_example)
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
    def run(cls, _use_example):
        boxes = [[int(i) for i in line.split(",")] for _, line in cls.get_lines()]
        distances = sorted(
            [
                (cls.get_distance(boxes[i], boxes[j]), i, j)
                for i in range(len(boxes))
                for j in range(i)
            ]
        )
        remaining = set(range(len(boxes)))
        for _, i, j in distances:
            for x in [i, j]:
                remaining.difference_update(set([x]))
            if len(remaining) == 0:
                return boxes[i][0] * boxes[j][0]


EXAMPLE = """
162,817,812
57,618,57
906,360,560
592,479,940
352,342,300
466,668,158
542,29,236
431,825,988
739,650,466
52,470,668
216,146,977
819,987,18
117,168,530
805,96,715
346,949,466
970,615,88
941,993,340
862,61,35
984,92,344
425,690,689
"""


main()
