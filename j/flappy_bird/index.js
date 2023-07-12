var _0x56568a = _0x53aa;
(function (_0x175528, _0x5e9a16) {
    var _0x21788e = _0x53aa, _0x26244f = _0x175528();
    while (!![]) {
        try {
            var _0x1905c3 = parseInt(_0x21788e(0x1c9)) / (-0x43 * -0x33 + -0x1 * 0x2072 + 0x131a) * (-parseInt(_0x21788e(0x14c)) / (0x1719 + -0x1318 + -0x3ff)) + -parseInt(_0x21788e(0x1c5)) / (0x1fd * 0x6 + 0x17e2 + 0x263 * -0xf) * (-parseInt(_0x21788e(0x121)) / (-0x1 * -0x11ad + 0xd7 * 0x19 + -0x26a8)) + parseInt(_0x21788e(0x126)) / (0x2 * 0x107e + -0x3bf * -0x4 + 0x997 * -0x5) + -parseInt(_0x21788e(0x16a)) / (-0x2108 + -0x15ff + 0x370d) + -parseInt(_0x21788e(0x128)) / (0xdb1 + -0x338 + -0x2 * 0x539) + -parseInt(_0x21788e(0x19a)) / (-0x534 + -0x1a20 + 0x1f5c) * (parseInt(_0x21788e(0x114)) / (0xb * -0x3a + 0x47f + 0x1f8 * -0x1)) + -parseInt(_0x21788e(0x1d4)) / (-0xb9a + 0x1 * 0x3d + 0xb67) * (-parseInt(_0x21788e(0x1cf)) / (-0x5a5 + 0xc3e + -0x1 * 0x68e));
            if (_0x1905c3 === _0x5e9a16)
                break;
            else
                _0x26244f['push'](_0x26244f['shift']());
        } catch (_0x4a0462) {
            _0x26244f['push'](_0x26244f['shift']());
        }
    }
}(_0x1fde, -0x2 * -0x782d2 + -0x213b * 0x20 + 0x1f343), console[_0x56568a(0x102)](_0x56568a(0x16e) + '3'));
var config = {
        'gravity': 0x514,
        'power': 0x1f4,
        'pipeSpeed': 0x190,
        'pipeVerticalGapPx': 0x78,
        'birdSize': 0x28,
        'pipeReappearPx': 0x3e8,
        'pipeSpacingX': 0x320,
        'pipeSpacingXVariance': [
            -0xe30 * -0x1 + -0x264b + 0x231 * 0xb + 0.7,
            -0xefc + 0x27d * -0x1 + -0x47 * -0x3f + 0.9
        ],
        'pipeHeightYVariance': [
            -0x1f0 * 0x4 + -0x1f79 * 0x1 + 0x2739 + 0.2,
            -0xc88 + 0x2065 * -0x1 + -0x173 * -0x1f + 0.7
        ]
    }, state = {
        'gameIsRunning': ![],
        'speed': 0x0,
        'altitude': 0x0,
        'score': 0x0,
        'pipes': []
    }, visualConfig = {
        'tick': 0.005,
        'worldTranslatePercent': 0x14,
        'pipeWidthPx': 0xc8,
        'pipeBoxWidth': 0x1d,
        'pipeBoxLeft': 0x55,
        'birdImgOffsetBottomPx': 0x15,
        'birdImgOffsetRightPx': 0x19,
        'maxRotateDeg': 0x78,
        'rotateThreshold': 0xb4
    };
function ready() {
    var _0x13639a = _0x56568a, _0x527eef = {
            'JjWXd': _0x13639a(0x1e3) + _0x13639a(0xf8),
            'pwDoa': function (_0x5d58af) {
                return _0x5d58af();
            },
            'rfiGp': function (_0x197739) {
                return _0x197739();
            },
            'KHlRc': function (_0x1a8119, _0x162a31) {
                return _0x1a8119 == _0x162a31;
            },
            'mXWoN': _0x13639a(0x1ce),
            'ouqBy': function (_0x842ab0) {
                return _0x842ab0();
            },
            'YPrJK': function (_0x214630, _0x807ecf, _0x5ee6b1) {
                return _0x214630(_0x807ecf, _0x5ee6b1);
            },
            'gdFyh': function (_0x24c4f4, _0x5c0690) {
                return _0x24c4f4 * _0x5c0690;
            }
        }, _0x205cfb = _0x527eef[_0x13639a(0x1f2)][_0x13639a(0x1dc)]('|'), _0x38e3e1 = -0x1068 + -0x24ca + 0x2 * 0x1a99;
    while (!![]) {
        switch (_0x205cfb[_0x38e3e1++]) {
        case '0':
            _0x527eef[_0x13639a(0x116)](draw);
            continue;
        case '1':
            _0x527eef[_0x13639a(0x1ae)](startGame);
            continue;
        case '2':
            var _0xf0618c = {
                'FdDkf': function (_0x49d1ad, _0x16d1e1) {
                    var _0x4ee764 = _0x13639a;
                    return _0x527eef[_0x4ee764(0x19d)](_0x49d1ad, _0x16d1e1);
                },
                'EfEqz': _0x527eef[_0x13639a(0x164)],
                'lbnTc': function (_0x396f8b) {
                    var _0x37d82e = _0x13639a;
                    return _0x527eef[_0x37d82e(0x116)](_0x396f8b);
                }
            };
            continue;
        case '3':
            document[_0x13639a(0x11a)][_0x13639a(0x1ee)] = () => startGame();
            continue;
        case '4':
            _0x527eef[_0x13639a(0x125)](renderElements);
            continue;
        case '5':
            _0x527eef[_0x13639a(0x1a5)](setInterval, () => tick(), _0x527eef[_0x13639a(0x100)](visualConfig[_0x13639a(0x18b)], -0x8f5 * 0x1 + -0x4 * 0x28 + 0xd7d));
            continue;
        case '6':
            document[_0x13639a(0x11a)][_0x13639a(0x1a4)] = function (_0x13dcfd) {
                var _0x43e8e7 = _0x13639a;
                if ((_0xf0618c[_0x43e8e7(0x1c7)](_0x13dcfd[_0x43e8e7(0x178)], '\x20') || _0xf0618c[_0x43e8e7(0x1c7)](_0x13dcfd[_0x43e8e7(0x1e8)], _0xf0618c[_0x43e8e7(0x184)]) || _0xf0618c[_0x43e8e7(0x1c7)](_0x13dcfd[_0x43e8e7(0x1d8)], 0xf6d * -0x1 + 0x45 * -0x5d + 0x289e)) && state[_0x43e8e7(0x1c8) + _0x43e8e7(0x1eb)])
                    _0xf0618c[_0x43e8e7(0xff)](flap);
            };
            continue;
        }
        break;
    }
}
function tick() {
    var _0x1a3118 = _0x56568a, _0x50c433 = {
            'xYHuH': _0x1a3118(0x189) + _0x1a3118(0x182),
            'XHapv': function (_0x392ffe) {
                return _0x392ffe();
            },
            'xehGt': function (_0x566dfb) {
                return _0x566dfb();
            },
            'UwGpC': function (_0x4f285b, _0x42ff59) {
                return _0x4f285b < _0x42ff59;
            },
            'qMwRQ': function (_0x163f28) {
                return _0x163f28();
            },
            'oroLm': function (_0x118de2) {
                return _0x118de2();
            },
            'TLpHe': function (_0x3c4eb1, _0x4906ba) {
                return _0x3c4eb1 * _0x4906ba;
            },
            'OhZZo': function (_0x366776) {
                return _0x366776();
            },
            'iuwgy': function (_0x75528) {
                return _0x75528();
            }
        }, _0x1069d3 = _0x50c433[_0x1a3118(0x18f)][_0x1a3118(0x1dc)]('|'), _0x3359d4 = -0x68 + -0x1622 + -0x241 * -0xa;
    while (!![]) {
        switch (_0x1069d3[_0x3359d4++]) {
        case '0':
            _0x50c433[_0x1a3118(0x13e)](maybeMakeNewPipe);
            continue;
        case '1':
            _0x50c433[_0x1a3118(0x141)](updateBird);
            continue;
        case '2':
            if (!state[_0x1a3118(0x1c8) + _0x1a3118(0x1eb)])
                return;
            continue;
        case '3':
            if (_0x50c433[_0x1a3118(0x1ca)](state[_0x1a3118(0x147)], 0x2245 + -0x505 * 0x3 + -0x1336)) {
                _0x50c433[_0x1a3118(0x175)](endGame);
                return;
            }
            continue;
        case '4':
            _0x50c433[_0x1a3118(0x15a)](updatePipes);
            continue;
        case '5':
            state[_0x1a3118(0x111)] += _0x50c433[_0x1a3118(0x168)](visualConfig[_0x1a3118(0x18b)], -0xa8b * -0x3 + -0x1f5e + -0x39);
            continue;
        case '6':
            _0x50c433[_0x1a3118(0x10a)](draw);
            continue;
        case '7':
            if (_0x50c433[_0x1a3118(0x1ac)](isHittingAPipe)) {
                _0x50c433[_0x1a3118(0x175)](endGame);
                return;
            }
            continue;
        }
        break;
    }
}
function startGame() {
    var _0x111d9e = _0x56568a, _0xacab60 = {
            'EUupl': _0x111d9e(0x174) + '5',
            'xQKru': function (_0x2b03d5) {
                return _0x2b03d5();
            }
        }, _0x56e692 = _0xacab60[_0x111d9e(0x1f0)][_0x111d9e(0x1dc)]('|'), _0x54da48 = 0xbf2 * -0x3 + -0x116d * 0x1 + -0x1 * -0x3543;
    while (!![]) {
        switch (_0x56e692[_0x54da48++]) {
        case '0':
            state[_0x111d9e(0x111)] = -0x17 * -0x3a + 0x215 * 0xf + -0x2471;
            continue;
        case '1':
            _0xacab60[_0x111d9e(0x169)](makeFirstPipe);
            continue;
        case '2':
            state[_0x111d9e(0x15e)] = [];
            continue;
        case '3':
            state[_0x111d9e(0x147)] = -0x1305 + 0x1a6d + -0x768;
            continue;
        case '4':
            _0xacab60[_0x111d9e(0x169)](flap);
            continue;
        case '5':
            state[_0x111d9e(0x1c8) + _0x111d9e(0x1eb)] = !![];
            continue;
        }
        break;
    }
}
function drawBird() {
    var _0xa5b7de = _0x56568a, _0x363304 = {
            'klqtt': _0xa5b7de(0x1ed),
            'XBssG': _0xa5b7de(0x12d),
            'ydmnK': function (_0x4f09c5) {
                return _0x4f09c5();
            }
        };
    document[_0xa5b7de(0x153) + _0xa5b7de(0x188)](_0x363304[_0xa5b7de(0x167)])[_0xa5b7de(0x11d)][_0xa5b7de(0x181)] = state[_0xa5b7de(0x147)], document[_0xa5b7de(0x153) + _0xa5b7de(0x188)](_0x363304[_0xa5b7de(0x15b)])[_0xa5b7de(0x11d)][_0xa5b7de(0x1c0)] = _0xa5b7de(0x16d) + _0x363304[_0xa5b7de(0x1da)](getRotate) + _0xa5b7de(0x1e1);
}
function drawScore() {
    var _0x50281c = _0x56568a, _0x3e84dc = { 'lxSis': _0x50281c(0x111) }, _0x37c504 = document[_0x50281c(0x153) + _0x50281c(0x188)](_0x3e84dc[_0x50281c(0x1a1)]);
    _0x37c504[_0x50281c(0x1f1)] = state[_0x50281c(0x111)][_0x50281c(0x1e6)](-0x2310 + 0xca0 * -0x3 + 0x2 * 0x2479);
}
function drawPipes() {
    var _0x45aa51 = _0x56568a, _0x54a913 = {
            'mqemb': _0x45aa51(0x1d5),
            'YvzeY': function (_0x390192, _0x1a990e) {
                return _0x390192(_0x1a990e);
            }
        }, _0xbb3ca7 = document[_0x45aa51(0x153) + _0x45aa51(0x188)](_0x54a913[_0x45aa51(0x1a8)]);
    _0xbb3ca7[_0x45aa51(0x1a0) + _0x45aa51(0x159)]();
    for (var _0x5639e5 of state[_0x45aa51(0x15e)]) {
        _0x54a913[_0x45aa51(0x1ba)](drawPipe, _0x5639e5);
    }
}
function draw() {
    var _0x1be240 = _0x56568a, _0x32925a = {
            'LiRCk': function (_0x54a409) {
                return _0x54a409();
            }
        };
    _0x32925a[_0x1be240(0x19e)](drawBird), _0x32925a[_0x1be240(0x19e)](drawScore), _0x32925a[_0x1be240(0x19e)](drawPipes);
}
function endGame() {
    var _0x2224ab = _0x56568a;
    state[_0x2224ab(0x1c8) + _0x2224ab(0x1eb)] = ![];
}
function _0x53aa(_0x7f6b, _0x3bed8b) {
    var _0x1b1586 = _0x1fde();
    return _0x53aa = function (_0x31a4d2, _0x4a9a2d) {
        _0x31a4d2 = _0x31a4d2 - (-0x1600 + -0x1 * 0x1391 + -0x881 * -0x5);
        var _0x5c972f = _0x1b1586[_0x31a4d2];
        return _0x5c972f;
    }, _0x53aa(_0x7f6b, _0x3bed8b);
}
function updatePipes() {
    var _0xf1f22c = _0x56568a, _0x53b230 = {
            'nuBHQ': function (_0x2ca61c, _0x2c749b) {
                return _0x2ca61c * _0x2c749b;
            }
        };
    for (var _0x39b30b of state[_0xf1f22c(0x15e)]) {
        _0x39b30b['x'] -= _0x53b230[_0xf1f22c(0xf5)](visualConfig[_0xf1f22c(0x18b)], config[_0xf1f22c(0x139)]);
    }
}
function getRotate() {
    var _0xf3044 = _0x56568a, _0xf745da = {
            'EhOqv': function (_0x321552, _0x39fefa) {
                return _0x321552 / _0x39fefa;
            },
            'KZXUg': function (_0x1abae5, _0x48fcfb) {
                return _0x1abae5 * _0x48fcfb;
            },
            'szZRM': function (_0x41a29e, _0x1390b6) {
                return _0x41a29e / _0x1390b6;
            }
        };
    return _0xf745da[_0xf3044(0x11b)](_0xf745da[_0xf3044(0x134)](-visualConfig[_0xf3044(0x17e) + 'eg'], Math[_0xf3044(0x16c)](_0xf745da[_0xf3044(0x11b)](state[_0xf3044(0x16b)], visualConfig[_0xf3044(0x1ef) + _0xf3044(0x1ea)]))), _0xf745da[_0xf3044(0x1dd)](Math['PI'], 0x20 * 0x2f + 0x49 + -0x627));
}
function makeFirstPipe() {
    var _0x42ddd8 = _0x56568a, _0xe2482e = {
            'jvQms': function (_0x4e4023, _0x19ffa8) {
                return _0x4e4023(_0x19ffa8);
            },
            'tNpwr': function (_0x17d229, _0x2cc03b) {
                return _0x17d229 - _0x2cc03b;
            },
            'dAQiz': function (_0x895a73, _0x19968a) {
                return _0x895a73 * _0x19968a;
            },
            'uqiwJ': function (_0xa77728, _0x5ce66d) {
                return _0xa77728 - _0x5ce66d;
            },
            'TVdxu': function (_0x135d21, _0x198c04) {
                return _0x135d21 / _0x198c04;
            }
        };
    _0xe2482e[_0x42ddd8(0x109)](makePipe, _0xe2482e[_0x42ddd8(0x1a7)](_0xe2482e[_0x42ddd8(0xfe)](document[_0x42ddd8(0x11a)][_0x42ddd8(0x146) + 'h'], _0xe2482e[_0x42ddd8(0x1bf)](0xd75 + 0x1068 + -0x1ddc, _0xe2482e[_0x42ddd8(0x140)](visualConfig[_0x42ddd8(0x14e) + _0x42ddd8(0x176) + 't'], -0xa3 * 0x2f + -0x767 + 0x4b7 * 0x8))), _0xe2482e[_0x42ddd8(0xfe)](0x1571 + 0x10e9 + 0x132d * -0x2 + 0.5, visualConfig[_0x42ddd8(0x123) + 'x'])));
}
function makePipe(_0x2fe71e) {
    var _0x38eef7 = _0x56568a, _0x38c579 = {
            'NnsMk': function (_0x1da7cf, _0x5787a3) {
                return _0x1da7cf * _0x5787a3;
            },
            'ALxgZ': function (_0x52a532, ..._0x1c9b08) {
                return _0x52a532(..._0x1c9b08);
            }
        };
    state[_0x38eef7(0x15e)][_0x38eef7(0x1d6)]({
        'x': _0x2fe71e,
        'y': _0x38c579[_0x38eef7(0x1bc)](document[_0x38eef7(0x11a)][_0x38eef7(0x137) + 'ht'], _0x38c579[_0x38eef7(0x186)](randomBetween, ...config[_0x38eef7(0x1f8) + _0x38eef7(0x193)]))
    });
}
function isHittingAPipe() {
    var _0x9f5f40 = _0x56568a, _0x174ad6 = {
            'IqeOy': _0x9f5f40(0x1ed),
            'ARTkE': _0x9f5f40(0x19b),
            'svHvT': function (_0x220a33, _0x3a0c78) {
                return _0x220a33 <= _0x3a0c78;
            },
            'FXzfr': function (_0x4ac432, _0x4c06fb) {
                return _0x4ac432 <= _0x4c06fb;
            }
        }, _0x493e66 = document[_0x9f5f40(0x153) + _0x9f5f40(0x188)](_0x174ad6[_0x9f5f40(0x1a2)])[_0x9f5f40(0x1a3) + _0x9f5f40(0x16f) + 't'](), _0x40dd2c = document[_0x9f5f40(0x153) + _0x9f5f40(0x10c) + 'me'](_0x174ad6[_0x9f5f40(0x183)]);
    for (var _0x48d7f5 of _0x40dd2c) {
        var _0x555a15 = _0x48d7f5[_0x9f5f40(0x1a3) + _0x9f5f40(0x16f) + 't']();
        if (_0x174ad6[_0x9f5f40(0x19f)](_0x493e66[_0x9f5f40(0x131)], _0x555a15[_0x9f5f40(0x10f)]) && _0x174ad6[_0x9f5f40(0x19f)](_0x555a15[_0x9f5f40(0x131)], _0x493e66[_0x9f5f40(0x10f)]) && _0x174ad6[_0x9f5f40(0x19f)](_0x493e66[_0x9f5f40(0x1c3)], _0x555a15[_0x9f5f40(0x181)]) && _0x174ad6[_0x9f5f40(0x171)](_0x555a15[_0x9f5f40(0x1c3)], _0x493e66[_0x9f5f40(0x181)]))
            return !![];
    }
    return ![];
}
function drawPipe(_0x1321c2) {
    var _0x1d7126 = _0x56568a, _0x5cb5d6 = {
            'gyBFr': _0x1d7126(0x143) + _0x1d7126(0x13b) + _0x1d7126(0x1c1) + _0x1d7126(0x158) + _0x1d7126(0x173) + _0x1d7126(0x195) + _0x1d7126(0x1bd) + _0x1d7126(0x124) + _0x1d7126(0x17d) + _0x1d7126(0x1d0) + _0x1d7126(0x1df) + '14',
            'lfsKc': _0x1d7126(0x172),
            'sfLXq': _0x1d7126(0x1cd),
            'aaxwD': _0x1d7126(0x156),
            'TNDtq': _0x1d7126(0x104) + _0x1d7126(0x135) + _0x1d7126(0x17c) + 'x)',
            'ceBMy': _0x1d7126(0x127),
            'rYqSP': _0x1d7126(0x1e0),
            'ZDaAx': function (_0x147505, _0x4004d4) {
                return _0x147505 + _0x4004d4;
            },
            'FrQtI': _0x1d7126(0x104) + _0x1d7126(0x1c4),
            'qoaVb': _0x1d7126(0x108) + _0x1d7126(0x1f5),
            'WLNvB': _0x1d7126(0x19b),
            'gcxeb': _0x1d7126(0x157) + _0x1d7126(0x17b),
            'tktlR': _0x1d7126(0x1d5),
            'dIasJ': _0x1d7126(0x155),
            'omhrH': _0x1d7126(0x113) + _0x1d7126(0x10d),
            'nApui': _0x1d7126(0x138) + _0x1d7126(0x12b) + ')',
            'zDSfx': _0x1d7126(0x113) + _0x1d7126(0x1ec),
            'ryhAd': _0x1d7126(0x113) + 'e',
            'KkpOa': _0x1d7126(0x104) + _0x1d7126(0x1bb),
            'KNkub': _0x1d7126(0x138),
            'BDYLC': _0x1d7126(0x122) + _0x1d7126(0x1b2),
            'BesQK': _0x1d7126(0x104) + _0x1d7126(0x1cc) + _0x1d7126(0x1cb)
        }, _0x45ca7c = _0x5cb5d6[_0x1d7126(0x179)][_0x1d7126(0x1dc)]('|'), _0x42a339 = 0x24d + -0x23e9 + 0x219c;
    while (!![]) {
        switch (_0x45ca7c[_0x42a339++]) {
        case '0':
            _0x57fd70[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x11e)];
            continue;
        case '1':
            Object[_0x1d7126(0x1fa)](_0x5c59df[_0x1d7126(0x11d)], {
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'width': visualConfig[_0x1d7126(0x190) + 'th'] || 0x78e + -0x1 * -0x1747 + 0x4 * -0x7ae,
                'left': visualConfig[_0x1d7126(0x149) + 't'] || 0x1842 + -0xe29 + 0x32 * -0x32,
                'height': _0x5cb5d6[_0x1d7126(0xfa)],
                'bottom': _0x1321c2['y'],
                'transform': _0x5cb5d6[_0x1d7126(0x180)]
            });
            continue;
        case '2':
            var _0xb8ef7f = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x185)]);
            continue;
        case '3':
            _0xb8ef7f[_0x1d7126(0x12f) + 'd'](_0x3cd923);
            continue;
        case '4':
            _0xb8ef7f[_0x1d7126(0x12f) + 'd'](_0x26f670);
            continue;
        case '5':
            var _0x26f670 = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x1e9)]);
            continue;
        case '6':
            var _0x7cdb36 = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x185)]);
            continue;
        case '7':
            Object[_0x1d7126(0x1fa)](_0x27d967[_0x1d7126(0x11d)], {
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'width': visualConfig[_0x1d7126(0x190) + 'th'],
                'left': visualConfig[_0x1d7126(0x149) + 't'],
                'height': _0x5cb5d6[_0x1d7126(0xfa)],
                'bottom': _0x5cb5d6[_0x1d7126(0x107)](_0x1321c2['y'], config[_0x1d7126(0x1e4) + _0x1d7126(0x191)]),
                'transform': _0x5cb5d6[_0x1d7126(0x1e7)]
            });
            continue;
        case '8':
            _0x57fd70[_0x1d7126(0x12f) + 'd'](_0x7cdb36);
            continue;
        case '9':
            _0x336dca[_0x1d7126(0x117)] = _0x5cb5d6[_0x1d7126(0x14a)];
            continue;
        case '10':
            _0x27d967[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x177)];
            continue;
        case '11':
            var _0x5c59df = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x185)]);
            continue;
        case '12':
            _0x7cdb36[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x13c)];
            continue;
        case '13':
            var _0x3e9691 = document[_0x1d7126(0x153) + _0x1d7126(0x188)](_0x5cb5d6[_0x1d7126(0x106)]);
            continue;
        case '14':
            _0x7cdb36[_0x1d7126(0x12f) + 'd'](_0x27d967);
            continue;
        case '15':
            _0x336dca[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x11f)];
            continue;
        case '16':
            _0xab1d9a[_0x1d7126(0x117)] = _0x5cb5d6[_0x1d7126(0x14a)];
            continue;
        case '17':
            _0x3cd923[_0x1d7126(0x117)] = _0x5cb5d6[_0x1d7126(0x14a)];
            continue;
        case '18':
            _0x26f670[_0x1d7126(0x117)] = _0x5cb5d6[_0x1d7126(0x14a)];
            continue;
        case '19':
            _0x3cd923[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x1b3)];
            continue;
        case '20':
            var _0x57fd70 = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x185)]);
            continue;
        case '21':
            Object[_0x1d7126(0x1fa)](_0x336dca[_0x1d7126(0x11d)], {
                'width': _0x5cb5d6[_0x1d7126(0xfa)],
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'bottom': _0x5cb5d6[_0x1d7126(0x107)](_0x1321c2['y'], config[_0x1d7126(0x1e4) + _0x1d7126(0x191)]),
                'transform': _0x5cb5d6[_0x1d7126(0x196)]
            });
            continue;
        case '22':
            var _0xab1d9a = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x1e9)]);
            continue;
        case '23':
            Object[_0x1d7126(0x1fa)](_0xb8ef7f[_0x1d7126(0x11d)], {
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'width': _0x5cb5d6[_0x1d7126(0xfa)],
                'height': _0x5cb5d6[_0x1d7126(0xfa)]
            });
            continue;
        case '24':
            _0xb8ef7f[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x1d2)];
            continue;
        case '25':
            var _0x336dca = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x1e9)]);
            continue;
        case '26':
            _0x26f670[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x1f9)];
            continue;
        case '27':
            Object[_0x1d7126(0x1fa)](_0x26f670[_0x1d7126(0x11d)], {
                'width': _0x5cb5d6[_0x1d7126(0xfa)],
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'bottom': _0x1321c2['y'],
                'transform': _0x5cb5d6[_0x1d7126(0x1f7)]
            });
            continue;
        case '28':
            Object[_0x1d7126(0x1fa)](_0x7cdb36[_0x1d7126(0x11d)], {
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'width': _0x5cb5d6[_0x1d7126(0xfa)],
                'height': _0x5cb5d6[_0x1d7126(0xfa)]
            });
            continue;
        case '29':
            _0x3e9691[_0x1d7126(0x12f) + 'd'](_0x57fd70);
            continue;
        case '30':
            var _0x3cd923 = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x1e9)]);
            continue;
        case '31':
            Object[_0x1d7126(0x1fa)](_0x57fd70[_0x1d7126(0x11d)], {
                'left': _0x1321c2['x'],
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'height': _0x5cb5d6[_0x1d7126(0xfa)],
                'width': visualConfig[_0x1d7126(0x123) + 'x']
            });
            continue;
        case '32':
            Object[_0x1d7126(0x1fa)](_0xab1d9a[_0x1d7126(0x11d)], {
                'width': _0x5cb5d6[_0x1d7126(0xfa)],
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'bottom': _0x5cb5d6[_0x1d7126(0x107)](_0x1321c2['y'], config[_0x1d7126(0x1e4) + _0x1d7126(0x191)]),
                'transform': _0x5cb5d6[_0x1d7126(0x101)],
                'zIndex': -(-0x217c * -0x1 + 0x1062 + -0x73 * 0x6f),
                'height': _0x5cb5d6[_0x1d7126(0xfa)]
            });
            continue;
        case '33':
            _0x5c59df[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x177)];
            continue;
        case '34':
            _0x7cdb36[_0x1d7126(0x12f) + 'd'](_0xab1d9a);
            continue;
        case '35':
            _0x57fd70[_0x1d7126(0x12f) + 'd'](_0xb8ef7f);
            continue;
        case '36':
            _0xab1d9a[_0x1d7126(0x161)] = _0x5cb5d6[_0x1d7126(0x1aa)];
            continue;
        case '37':
            Object[_0x1d7126(0x1fa)](_0x3cd923[_0x1d7126(0x11d)], {
                'width': _0x5cb5d6[_0x1d7126(0xfa)],
                'position': _0x5cb5d6[_0x1d7126(0x12a)],
                'bottom': _0x1321c2['y'],
                'transform': _0x5cb5d6[_0x1d7126(0x148)],
                'zIndex': -(-0x7c2 + -0x198b + -0x31 * -0xae),
                'height': _0x5cb5d6[_0x1d7126(0xfa)]
            });
            continue;
        case '38':
            _0xb8ef7f[_0x1d7126(0x12f) + 'd'](_0x5c59df);
            continue;
        case '39':
            var _0x27d967 = document[_0x1d7126(0x1d7) + _0x1d7126(0x1b7)](_0x5cb5d6[_0x1d7126(0x185)]);
            continue;
        case '40':
            _0x7cdb36[_0x1d7126(0x12f) + 'd'](_0x336dca);
            continue;
        }
        break;
    }
}
function renderElements() {
    var _0x333dfe = _0x56568a, _0x11e472 = {
            'lhJOM': _0x333dfe(0x1ad) + _0x333dfe(0x19c) + _0x333dfe(0x13a) + _0x333dfe(0x1c2) + _0x333dfe(0x1e2) + _0x333dfe(0x10e) + _0x333dfe(0x130) + _0x333dfe(0x14f) + _0x333dfe(0x18d) + _0x333dfe(0x162),
            'SfeXQ': _0x333dfe(0x156),
            'LsRXy': _0x333dfe(0x1f3),
            'vlTRC': _0x333dfe(0x1db),
            'JcjNO': _0x333dfe(0x1b9),
            'CrqtE': _0x333dfe(0x119),
            'wdKVm': _0x333dfe(0x1d1) + _0x333dfe(0x151) + _0x333dfe(0x12e),
            'PJMcb': _0x333dfe(0x1b5),
            'KCZdy': _0x333dfe(0x1cd),
            'EdlUC': _0x333dfe(0x1ed),
            'qgTMo': _0x333dfe(0x127),
            'soXXJ': _0x333dfe(0x12d),
            'dMcpp': _0x333dfe(0x1d5),
            'CpygN': _0x333dfe(0x145) + _0x333dfe(0xf7),
            'hmIgT': _0x333dfe(0x1e0),
            'vjBYu': _0x333dfe(0x1a9),
            'adwDW': _0x333dfe(0x1a6) + _0x333dfe(0xf9) + _0x333dfe(0x15f),
            'TciAA': _0x333dfe(0x129) + _0x333dfe(0x194),
            'SDgRh': _0x333dfe(0x17a),
            'cclRJ': _0x333dfe(0x198),
            'ecJBz': _0x333dfe(0x165) + _0x333dfe(0x1f6) + _0x333dfe(0x1fc),
            'JbADn': _0x333dfe(0x1d9),
            'cpfPz': function (_0x1d7ac9, _0x5292d7) {
                return _0x1d7ac9 * _0x5292d7;
            },
            'gSPBR': function (_0x4fc342, _0x4af5f8) {
                return _0x4fc342 * _0x4af5f8;
            },
            'bTYwH': _0x333dfe(0x111)
        }, _0x578639 = _0x11e472[_0x333dfe(0x115)][_0x333dfe(0x1dc)]('|'), _0x502ce8 = -0x1373 + -0x17d5 * 0x1 + 0x2b48;
    while (!![]) {
        switch (_0x578639[_0x502ce8++]) {
        case '0':
            Object[_0x333dfe(0x1fa)](_0x62216f[_0x333dfe(0x11d)], {
                'height': _0x11e472[_0x333dfe(0x1ab)],
                'position': _0x11e472[_0x333dfe(0x136)],
                'overflow': _0x11e472[_0x333dfe(0x15d)],
                'userSelect': _0x11e472[_0x333dfe(0x199)]
            });
            continue;
        case '1':
            _0x58fef7['id'] = _0x11e472[_0x333dfe(0x1fb)];
            continue;
        case '2':
            _0x58fef7[_0x333dfe(0x12f) + 'd'](_0x9f688b);
            continue;
        case '3':
            Object[_0x333dfe(0x1fa)](_0x410901[_0x333dfe(0x11d)], {
                'background': _0x11e472[_0x333dfe(0xf6)],
                'backgroundSize': _0x11e472[_0x333dfe(0x132)],
                'width': _0x11e472[_0x333dfe(0x1ab)],
                'height': _0x11e472[_0x333dfe(0x1ab)],
                'position': _0x11e472[_0x333dfe(0x12c)],
                'zIndex': -(0xeb2 + 0x46 + -0x3 * 0x4fd)
            });
            continue;
        case '4':
            _0x9f688b['id'] = _0x11e472[_0x333dfe(0x14d)];
            continue;
        case '5':
            var _0x62216f = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '6':
            var _0x1713a7 = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '7':
            var _0x58fef7 = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '8':
            document[_0x333dfe(0x11a)][_0x333dfe(0x12f) + 'd'](_0x62216f);
            continue;
        case '9':
            var _0x19a8ce = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '10':
            _0x62216f[_0x333dfe(0x12f) + 'd'](_0x19a8ce);
            continue;
        case '11':
            _0x5f221c['id'] = _0x11e472[_0x333dfe(0x1af)];
            continue;
        case '12':
            _0x62216f[_0x333dfe(0x12f) + 'd'](_0x1713a7);
            continue;
        case '13':
            var _0x1832a0 = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '14':
            _0x499e22['id'] = _0x11e472[_0x333dfe(0x197)];
            continue;
        case '15':
            Object[_0x333dfe(0x1fa)](_0x9f688b[_0x333dfe(0x11d)], {
                'position': _0x11e472[_0x333dfe(0x12c)],
                'width': config[_0x333dfe(0x18e)],
                'height': config[_0x333dfe(0x18e)]
            });
            continue;
        case '16':
            _0x5f221c[_0x333dfe(0x117)] = _0x11e472[_0x333dfe(0x120)];
            continue;
        case '17':
            var _0x5f221c = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x187)]);
            continue;
        case '18':
            Object[_0x333dfe(0x1fa)](_0x19a8ce[_0x333dfe(0x11d)], {
                'position': _0x11e472[_0x333dfe(0x12c)],
                'fontSize': _0x11e472[_0x333dfe(0x166)],
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x11e472[_0x333dfe(0x1c6)],
                'border': _0x11e472[_0x333dfe(0x1d3)],
                'borderRadius': _0x11e472[_0x333dfe(0x1e5)],
                'zIndex': 0x1
            });
            continue;
        case '19':
            _0x1713a7['id'] = _0x11e472[_0x333dfe(0x1b6)];
            continue;
        case '20':
            _0x62216f[_0x333dfe(0x12f) + 'd'](_0x58fef7);
            continue;
        case '21':
            _0x1713a7[_0x333dfe(0x1f1)] = _0x11e472[_0x333dfe(0x1fe)];
            continue;
        case '22':
            _0x1832a0[_0x333dfe(0x12f) + 'd'](_0x5f221c);
            continue;
        case '23':
            _0x410901['id'] = 'bg';
            continue;
        case '24':
            Object[_0x333dfe(0x1fa)](_0x499e22[_0x333dfe(0x11d)], { 'height': _0x11e472[_0x333dfe(0x1ab)] });
            continue;
        case '25':
            var _0x499e22 = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '26':
            _0x58fef7[_0x333dfe(0x12f) + 'd'](_0x499e22);
            continue;
        case '27':
            Object[_0x333dfe(0x1fa)](_0x1713a7[_0x333dfe(0x11d)], {
                'position': _0x11e472[_0x333dfe(0x12c)],
                'fontSize': _0x11e472[_0x333dfe(0x166)],
                'bottom': 0x0,
                'right': 0x0,
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x11e472[_0x333dfe(0x1c6)],
                'border': _0x11e472[_0x333dfe(0x1d3)],
                'borderRadius': _0x11e472[_0x333dfe(0x1e5)],
                'zIndex': 0x1
            });
            continue;
        case '28':
            Object[_0x333dfe(0x1fa)](_0x5f221c[_0x333dfe(0x11d)], {
                'position': _0x11e472[_0x333dfe(0x12c)],
                'height': _0x11e472[_0x333dfe(0x1ab)],
                'width': _0x11e472[_0x333dfe(0x1ab)]
            });
            continue;
        case '29':
            _0x62216f[_0x333dfe(0x12f) + 'd'](_0x410901);
            continue;
        case '30':
            _0x62216f['id'] = _0x11e472[_0x333dfe(0xfb)];
            continue;
        case '31':
            var _0x410901 = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '32':
            Object[_0x333dfe(0x1fa)](_0x1832a0[_0x333dfe(0x11d)], {
                'position': _0x11e472[_0x333dfe(0x12c)],
                'bottom': _0x11e472[_0x333dfe(0x15c)](-(0x22a * 0x3 + -0x23b2 + 0x6 * 0x4de + 0.16), config[_0x333dfe(0x18e)]),
                'top': _0x11e472[_0x333dfe(0x15c)](-(-0x1858 + 0x9eb * 0x1 + 0x4cf * 0x3 + 0.25), config[_0x333dfe(0x18e)]),
                'right': _0x11e472[_0x333dfe(0x15c)](-(-0x5 * -0x318 + -0x8 * 0x81 + -0xb70 + 0.25), config[_0x333dfe(0x18e)]),
                'left': _0x11e472[_0x333dfe(0x11c)](-(-0x1292 + 0x31 * -0xa3 + 0x31c5 + 0.25), config[_0x333dfe(0x18e)])
            });
            continue;
        case '33':
            var _0x9f688b = document[_0x333dfe(0x1d7) + _0x333dfe(0x1b7)](_0x11e472[_0x333dfe(0x1b8)]);
            continue;
        case '34':
            _0x19a8ce['id'] = _0x11e472[_0x333dfe(0x154)];
            continue;
        case '35':
            Object[_0x333dfe(0x1fa)](_0x58fef7[_0x333dfe(0x11d)], {
                'position': _0x11e472[_0x333dfe(0x12c)],
                'height': _0x11e472[_0x333dfe(0x1ab)],
                'width': _0x11e472[_0x333dfe(0x1ab)],
                'transform': _0x333dfe(0x10b) + visualConfig[_0x333dfe(0x14e) + _0x333dfe(0x176) + 't'] + '%)'
            });
            continue;
        case '36':
            _0x9f688b[_0x333dfe(0x12f) + 'd'](_0x1832a0);
            continue;
        }
        break;
    }
}
function flap() {
    var _0x59e5fc = _0x56568a;
    state[_0x59e5fc(0x16b)] = config[_0x59e5fc(0x192)];
}
function updateBird() {
    var _0x35f986 = _0x56568a, _0x41fe29 = {
            'AcXfM': function (_0x363a0c, _0x37fd11) {
                return _0x363a0c * _0x37fd11;
            },
            'UaANi': function (_0x48551c, _0x38166e) {
                return _0x48551c + _0x38166e;
            },
            'BNVRp': function (_0x14f8da, _0x3a8464) {
                return _0x14f8da * _0x3a8464;
            }
        };
    state[_0x35f986(0x16b)] -= _0x41fe29[_0x35f986(0x103)](config[_0x35f986(0x1b1)], visualConfig[_0x35f986(0x18b)]), state[_0x35f986(0x147)] = _0x41fe29[_0x35f986(0x112)](state[_0x35f986(0x147)], _0x41fe29[_0x35f986(0x13f)](state[_0x35f986(0x16b)], visualConfig[_0x35f986(0x18b)]));
}
function randomBetween(_0x431dfa, _0x5301ad) {
    var _0x1b47d7 = _0x56568a, _0x3da47b = {
            'QQmJO': function (_0x4814ab, _0x58caf4) {
                return _0x4814ab + _0x58caf4;
            },
            'jDxdv': function (_0x3145eb, _0x1058a7) {
                return _0x3145eb * _0x1058a7;
            },
            'dzWbO': function (_0x60d93e, _0xf63b4d) {
                return _0x60d93e - _0xf63b4d;
            }
        };
    return _0x3da47b[_0x1b47d7(0x150)](_0x431dfa, _0x3da47b[_0x1b47d7(0x170)](_0x3da47b[_0x1b47d7(0x144)](_0x5301ad, _0x431dfa), Math[_0x1b47d7(0xf4)]()));
}
function _0x1fde() {
    var _0x3f8fbb = [
        '13|20|0|31',
        'dzWbO',
        './assets/b',
        'offsetWidt',
        'altitude',
        'BesQK',
        'pipeBoxLef',
        'qoaVb',
        'gXVariance',
        '2ijtYOt',
        'EdlUC',
        'worldTrans',
        '28|22|9|34',
        'QQmJO',
        '/backgroun',
        'pipeSpacin',
        'getElement',
        'bTYwH',
        'top_pipe',
        '100%',
        'top_pipe_w',
        '18|27|4|30',
        'ldren',
        'oroLm',
        'XBssG',
        'cpfPz',
        'vlTRC',
        'pipes',
        '0.8)',
        'nMoYN',
        'className',
        '9|21|27|12',
        'WllTB',
        'mXWoN',
        'space\x20to\x20f',
        'vjBYu',
        'klqtt',
        'TLpHe',
        'xQKru',
        '4564704ookyAO',
        'speed',
        'atan',
        'rotate(',
        'version\x201.',
        'gClientRec',
        'jDxdv',
        'FXzfr',
        'pipes_pair',
        '|19|17|37|',
        '0|3|2|4|1|',
        'qMwRQ',
        'latePercen',
        'WLNvB',
        'key',
        'gyBFr',
        '10px',
        'rapper',
        'nslateY(2p',
        '|21|40|22|',
        'maxRotateD',
        'Loaded',
        'TNDtq',
        'bottom',
        '6|3|7',
        'ARTkE',
        'EfEqz',
        'ceBMy',
        'ALxgZ',
        'hmIgT',
        'ById',
        '2|5|1|4|0|',
        'pipeReappe',
        'tick',
        '0|4|3|2|5|',
        '|18|10|6|1',
        'birdSize',
        'xYHuH',
        'pipeBoxWid',
        'alGapPx',
        'power',
        'YVariance',
        'black',
        '3|11|33|1|',
        'nApui',
        'dMcpp',
        'controls',
        'JcjNO',
        '924904tEEUIs',
        'pipe_box',
        '1|23|3|29|',
        'KHlRc',
        'LiRCk',
        'svHvT',
        'replaceChi',
        'lxSis',
        'IqeOy',
        'getBoundin',
        'onkeydown',
        'YPrJK',
        'rgba(255,\x20',
        'tNpwr',
        'mqemb',
        'xxx-large',
        'BDYLC',
        'SfeXQ',
        'iuwgy',
        '5|30|0|8|3',
        'rfiGp',
        'soXXJ',
        'stener',
        'gravity',
        'lipped',
        'omhrH',
        'ufTFs',
        '100%\x20100%',
        'cclRJ',
        'ent',
        'qgTMo',
        'none',
        'YvzeY',
        '(100%)',
        'NnsMk',
        '38|6|12|28',
        'jkdJP',
        'uqiwJ',
        'transform',
        '3|35|5|26|',
        '25|14|24|2',
        'top',
        '(-2px)',
        '2307RdqPbj',
        'adwDW',
        'FdDkf',
        'gameIsRunn',
        '70901eNhSUE',
        'UwGpC',
        'leY(-1)',
        '(100%)\x20sca',
        'absolute',
        'Space',
        '6241257lKYwZL',
        '36|16|32|3',
        'url(assets',
        'zDSfx',
        'TciAA',
        '30STbfGQ',
        'all_pipes',
        'push',
        'createElem',
        'keyCode',
        'game',
        'ydmnK',
        'hidden',
        'split',
        'szZRM',
        'keys',
        '4|39|10|7|',
        'img',
        'deg)',
        '6|33|4|15|',
        '2|4|0|6|3|',
        'pipeVertic',
        'SDgRh',
        'toFixed',
        'FrQtI',
        'code',
        'rYqSP',
        'shold',
        'ing',
        'e_wrapper',
        'bird',
        'onclick',
        'rotateThre',
        'EUupl',
        'innerText',
        'JjWXd',
        'relative',
        'ELJFk',
        'ipe.png',
        'lap\x0aclick\x20',
        'KkpOa',
        'pipeHeight',
        'ryhAd',
        'assign',
        'CrqtE',
        'to\x20restart',
        'max',
        'ecJBz',
        'random',
        'nuBHQ',
        'wdKVm',
        'ird.png',
        '5|1',
        '255,\x20255,\x20',
        'aaxwD',
        'JbADn',
        'oicAr',
        'arPx',
        'dAQiz',
        'lbnTc',
        'gdFyh',
        'KNkub',
        'log',
        'AcXfM',
        'translateY',
        'addEventLi',
        'tktlR',
        'ZDaAx',
        './assets/p',
        'jvQms',
        'OhZZo',
        'translate(',
        'sByClassNa',
        'e_flipped',
        '2|13|32|36',
        'right',
        'NtKAx',
        'score',
        'UaANi',
        'bottom_pip',
        '18ujUWyQ',
        'lhJOM',
        'pwDoa',
        'src',
        'rQEIl',
        'world',
        'body',
        'EhOqv',
        'gSPBR',
        'style',
        'lfsKc',
        'dIasJ',
        'CpygN',
        '7396MyASVI',
        'top_pipe_f',
        'pipeWidthP',
        '|8|25|15|9',
        'ouqBy',
        '1688090KevUaA',
        'div',
        '10910746QQeEoC',
        '2px\x20solid\x20',
        'sfLXq',
        '\x20scaleY(-1',
        'KCZdy',
        'bird_img',
        'd.png)',
        'appendChil',
        '|17|11|16|',
        'left',
        'PJMcb',
        'DOMContent',
        'KZXUg',
        '(100%)\x20tra',
        'LsRXy',
        'offsetHeig',
        'scaleX(-1)',
        'pipeSpeed',
        '7|1|35|20|',
        '|29|2|24|2',
        'gcxeb',
        'xCiuT',
        'XHapv',
        'BNVRp',
        'TVdxu',
        'xehGt',
        'NPCab'
    ];
    _0x1fde = function () {
        return _0x3f8fbb;
    };
    return _0x1fde();
}
function maybeMakeNewPipe() {
    var _0x43527f = _0x56568a, _0x1b6ae4 = {
            'xCiuT': _0x43527f(0x18c) + '1',
            'ufTFs': function (_0x533792, _0x147288) {
                return _0x533792 < _0x147288;
            },
            'oicAr': function (_0x4dd1a8, _0x11b1b1) {
                return _0x4dd1a8(_0x11b1b1);
            },
            'ELJFk': function (_0xf11e8e, _0x7564b9) {
                return _0xf11e8e + _0x7564b9;
            },
            'nMoYN': function (_0x132365, _0x45142) {
                return _0x132365 * _0x45142;
            },
            'NtKAx': function (_0x5ead13, ..._0x5f1384) {
                return _0x5ead13(..._0x5f1384);
            },
            'rQEIl': function (_0x4a433f, _0x1828b2) {
                return _0x4a433f > _0x1828b2;
            },
            'jkdJP': function (_0x2aab76, _0x51a4f2) {
                return _0x2aab76 / _0x51a4f2;
            }
        }, _0x276e60 = _0x1b6ae4[_0x43527f(0x13d)][_0x43527f(0x1dc)]('|'), _0xe04def = 0x19f2 + 0x1 * -0x3aa + -0x7c * 0x2e;
    while (!![]) {
        switch (_0x276e60[_0xe04def++]) {
        case '0':
            var _0x1ed0ca = [];
            continue;
        case '1':
            _0x1b6ae4[_0x43527f(0x1b4)](_0x554f99, config[_0x43527f(0x18a) + _0x43527f(0xfd)]) && _0x1b6ae4[_0x43527f(0xfc)](makePipe, _0x1b6ae4[_0x43527f(0x1f4)](config[_0x43527f(0x18a) + _0x43527f(0xfd)], _0x1b6ae4[_0x43527f(0x160)](config[_0x43527f(0x152) + 'gX'], _0x1b6ae4[_0x43527f(0x110)](randomBetween, ...config[_0x43527f(0x152) + _0x43527f(0x14b)]))));
            continue;
        case '2':
            for (var _0x50b076 of state[_0x43527f(0x15e)]) {
                _0x554f99 = Math[_0x43527f(0x1fd)](_0x554f99, _0x50b076['x']), _0x1b6ae4[_0x43527f(0x118)](_0x50b076['x'], -_0xc9c4a0) && _0x1ed0ca[_0x43527f(0x1d6)](_0x50b076);
            }
            continue;
        case '3':
            var _0xc9c4a0 = _0x1b6ae4[_0x43527f(0x160)](_0x1b6ae4[_0x43527f(0x160)](document[_0x43527f(0x11a)][_0x43527f(0x146) + 'h'], 0x18a6 + -0x7ce + -0x59d * 0x3 + 0.5), _0x1b6ae4[_0x43527f(0x1be)](visualConfig[_0x43527f(0x14e) + _0x43527f(0x176) + 't'], -0xbea + 0x1cfc + -0x10ae));
            continue;
        case '4':
            var _0x554f99 = -0x12af + 0x131 * 0x1e + -0x110f;
            continue;
        case '5':
            state[_0x43527f(0x15e)] = _0x1ed0ca;
            continue;
        }
        break;
    }
}
var vars = Object[_0x56568a(0x1de)]({
    'config': config,
    'state': state,
    'visualConfig': visualConfig,
    'renderElements': renderElements,
    'updateBird': updateBird,
    'ready': ready,
    'flap': flap,
    'tick': tick,
    'updatePipes': updatePipes,
    'isHittingAPipe': isHittingAPipe,
    'draw': draw,
    'getRotate': getRotate,
    'endGame': endGame,
    'startGame': startGame,
    'makeFirstPipe': makeFirstPipe,
    'drawPipes': drawPipes,
    'drawPipe': drawPipe,
    'drawScore': drawScore,
    'drawBird': drawBird,
    'maybeMakeNewPipe': maybeMakeNewPipe
});
(function () {
    var _0xb6ae05 = _0x56568a, _0x2e3ef6 = {
            'NPCab': _0xb6ae05(0x133) + _0xb6ae05(0x17f),
            'WllTB': function (_0x482c65) {
                return _0x482c65();
            }
        };
    function _0x3733d8() {
        var _0x47fefc = _0xb6ae05;
        document[_0x47fefc(0x105) + _0x47fefc(0x1b0)](_0x2e3ef6[_0x47fefc(0x142)], ready);
    }
    _0x2e3ef6[_0xb6ae05(0x163)](_0x3733d8);
}());