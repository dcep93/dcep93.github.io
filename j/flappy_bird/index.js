var _0x587d5a = _0x2703;
(function (_0x471aa7, _0x139a24) {
    var _0x2b6706 = _0x2703, _0xdb4eba = _0x471aa7();
    while (!![]) {
        try {
            var _0x33f865 = -parseInt(_0x2b6706(0xd6)) / (-0x7b7 + 0x23df * -0x1 + 0x2b97) + parseInt(_0x2b6706(0xdd)) / (-0x1 * 0x265b + -0x14 * 0x134 + 0x3e6d) * (-parseInt(_0x2b6706(0x168)) / (-0xc57 + 0x577 * 0x3 + 0x17 * -0x2d)) + parseInt(_0x2b6706(0xfb)) / (-0x1975 + 0x21b2 + -0x839) + parseInt(_0x2b6706(0xf0)) / (-0x1 * -0x2209 + 0x1 * -0x817 + -0x19ed) * (parseInt(_0x2b6706(0x10b)) / (-0x32 * -0xa6 + -0x1a * -0x103 + 0x1 * -0x3ab4)) + parseInt(_0x2b6706(0x196)) / (-0x2633 + 0xe * 0x16 + 0x2506) + -parseInt(_0x2b6706(0x1a2)) / (-0x3 * 0xadb + -0x17 * -0xdd + 0x1 * 0xcbe) * (parseInt(_0x2b6706(0x16e)) / (0x217 + 0x19c3 + -0x1bd1 * 0x1)) + -parseInt(_0x2b6706(0x10e)) / (-0xbfb * 0x3 + -0xb * -0x31d + 0x2 * 0xde);
            if (_0x33f865 === _0x139a24)
                break;
            else
                _0xdb4eba['push'](_0xdb4eba['shift']());
        } catch (_0xcbc083) {
            _0xdb4eba['push'](_0xdb4eba['shift']());
        }
    }
}(_0x2174, -0x15f8a0 + -0x59 * -0x31ff + 0x11400f));
var config = {
        'gravity': 0x514,
        'power': 0x1f4,
        'pipeSpeed': 0x190,
        'pipeVerticalGapPx': 0x78,
        'birdSize': 0x28,
        'pipeReappearPx': 0x3e8,
        'pipeSpacingX': 0x320,
        'pipeSpacingXVariance': [
            -0x1dfc + 0xe12 * 0x1 + 0xfea + 0.7,
            -0xc7 * -0x5 + -0x897 * 0x1 + 0x4b4 + 0.9
        ],
        'pipeHeightYVariance': [
            -0x77d * 0x5 + -0x1a51 * -0x1 + -0x2c8 * -0x4 + 0.2,
            -0x1f84 + -0x954 * 0x1 + 0x146c * 0x2 + 0.7
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
    var _0x33243f = _0x2703, _0x3da4d3 = {
            'gymtF': _0x33243f(0x170) + _0x33243f(0x190),
            'puCxm': function (_0x1e0af1) {
                return _0x1e0af1();
            },
            'jDQzk': function (_0x507459) {
                return _0x507459();
            },
            'mhwFm': function (_0x3d194b, _0x58d730) {
                return _0x3d194b == _0x58d730;
            },
            'cHtEr': _0x33243f(0xd4),
            'CKofx': function (_0x48de85) {
                return _0x48de85();
            },
            'sGBxq': function (_0x369f4b, _0x1de328, _0x5c66b7) {
                return _0x369f4b(_0x1de328, _0x5c66b7);
            },
            'ehkqB': function (_0x33d275, _0x1a4fe2) {
                return _0x33d275 * _0x1a4fe2;
            }
        }, _0x9a78f0 = _0x3da4d3[_0x33243f(0x1b9)][_0x33243f(0x161)]('|'), _0x3c19a1 = 0x22e5 * -0x1 + 0x7 * -0x403 + 0x14fe * 0x3;
    while (!![]) {
        switch (_0x9a78f0[_0x3c19a1++]) {
        case '0':
            _0x3da4d3[_0x33243f(0x1af)](renderElements);
            continue;
        case '1':
            _0x3da4d3[_0x33243f(0x131)](draw);
            continue;
        case '2':
            document[_0x33243f(0xff)][_0x33243f(0x12a)] = () => startGame();
            continue;
        case '3':
            var _0x5d7807 = {
                'fIMMM': function (_0x204ef0, _0x1b546c) {
                    var _0x3df610 = _0x33243f;
                    return _0x3da4d3[_0x3df610(0x159)](_0x204ef0, _0x1b546c);
                },
                'yKpLk': function (_0x52e2e3, _0x1eb965) {
                    var _0xbb4f57 = _0x33243f;
                    return _0x3da4d3[_0xbb4f57(0x159)](_0x52e2e3, _0x1eb965);
                },
                'jgedt': _0x3da4d3[_0x33243f(0x18b)],
                'hQCcV': function (_0x143f01) {
                    var _0xdc72ee = _0x33243f;
                    return _0x3da4d3[_0xdc72ee(0x197)](_0x143f01);
                }
            };
            continue;
        case '4':
            _0x3da4d3[_0x33243f(0x180)](setInterval, () => tick(), _0x3da4d3[_0x33243f(0x162)](visualConfig[_0x33243f(0x16a)], -0x1349 * -0x1 + -0x427 * -0x9 + 0x698 * -0x8));
            continue;
        case '5':
            _0x3da4d3[_0x33243f(0x197)](startGame);
            continue;
        case '6':
            document[_0x33243f(0xff)][_0x33243f(0x16d)] = function (_0x43fca7) {
                var _0x2d7d2e = _0x33243f;
                if ((_0x5d7807[_0x2d7d2e(0x15d)](_0x43fca7[_0x2d7d2e(0x103)], '\x20') || _0x5d7807[_0x2d7d2e(0xbd)](_0x43fca7[_0x2d7d2e(0x129)], _0x5d7807[_0x2d7d2e(0x181)]) || _0x5d7807[_0x2d7d2e(0xbd)](_0x43fca7[_0x2d7d2e(0x14a)], -0x1d44 + -0x1 * 0x1877 + 0x35db)) && state[_0x2d7d2e(0x167) + _0x2d7d2e(0x18e)])
                    _0x5d7807[_0x2d7d2e(0x19d)](flap);
            };
            continue;
        }
        break;
    }
}
function tick() {
    var _0x1b7288 = _0x2703, _0x101885 = {
            'nilKA': _0x1b7288(0xf7) + _0x1b7288(0x155),
            'InWvj': function (_0x497b99) {
                return _0x497b99();
            },
            'eGIGq': function (_0x4802fe, _0x1b5d5a) {
                return _0x4802fe < _0x1b5d5a;
            },
            'pAdCI': function (_0x11086d) {
                return _0x11086d();
            },
            'yrXte': function (_0x7a6cca) {
                return _0x7a6cca();
            },
            'dKELx': function (_0x5c195e) {
                return _0x5c195e();
            },
            'cXXps': function (_0x123361, _0x5f011f) {
                return _0x123361 * _0x5f011f;
            }
        }, _0x3c46de = _0x101885[_0x1b7288(0xba)][_0x1b7288(0x161)]('|'), _0xb87318 = -0x3 * 0x682 + 0xdd1 + 0x5b5;
    while (!![]) {
        switch (_0x3c46de[_0xb87318++]) {
        case '0':
            _0x101885[_0x1b7288(0x117)](updatePipes);
            continue;
        case '1':
            if (_0x101885[_0x1b7288(0x116)](state[_0x1b7288(0x113)], 0x24d7 + 0x1 * 0x12fb + 0x1be9 * -0x2)) {
                _0x101885[_0x1b7288(0x117)](endGame);
                return;
            }
            continue;
        case '2':
            _0x101885[_0x1b7288(0x117)](maybeMakeNewPipe);
            continue;
        case '3':
            if (_0x101885[_0x1b7288(0x140)](isHittingAPipe)) {
                _0x101885[_0x1b7288(0x105)](endGame);
                return;
            }
            continue;
        case '4':
            _0x101885[_0x1b7288(0xd5)](draw);
            continue;
        case '5':
            if (!state[_0x1b7288(0x167) + _0x1b7288(0x18e)])
                return;
            continue;
        case '6':
            _0x101885[_0x1b7288(0x105)](updateBird);
            continue;
        case '7':
            state[_0x1b7288(0x114)] += _0x101885[_0x1b7288(0x153)](visualConfig[_0x1b7288(0x16a)], -0x3b1 + 0x3fa * -0x1 + -0x7b5 * -0x1);
            continue;
        }
        break;
    }
}
function startGame() {
    var _0x3af5db = _0x2703, _0x51d321 = {
            'PHXkC': _0x3af5db(0xc2) + '4',
            'OxZZS': function (_0x15f7b3) {
                return _0x15f7b3();
            },
            'amkdl': function (_0x3b81cf) {
                return _0x3b81cf();
            }
        }, _0x1317c0 = _0x51d321[_0x3af5db(0xf4)][_0x3af5db(0x161)]('|'), _0x315c00 = 0x17c7 + -0x19 * 0x163 + -0x22 * -0x52;
    while (!![]) {
        switch (_0x1317c0[_0x315c00++]) {
        case '0':
            _0x51d321[_0x3af5db(0x11a)](makeFirstPipe);
            continue;
        case '1':
            state[_0x3af5db(0x113)] = -0x25ea + -0xc * 0x3d + -0x1 * -0x28c6;
            continue;
        case '2':
            _0x51d321[_0x3af5db(0xfc)](flap);
            continue;
        case '3':
            state[_0x3af5db(0x114)] = -0x2a * -0xc3 + 0x18a2 + -0x38a0;
            continue;
        case '4':
            state[_0x3af5db(0x167) + _0x3af5db(0x18e)] = !![];
            continue;
        case '5':
            state[_0x3af5db(0x138)] = [];
            continue;
        }
        break;
    }
}
function _0x2703(_0x2b49c2, _0x142ca2) {
    var _0x23cc8a = _0x2174();
    return _0x2703 = function (_0x122b2b, _0x7e4721) {
        _0x122b2b = _0x122b2b - (-0x51a + 0x1fc3 + -0x19f3);
        var _0x300eec = _0x23cc8a[_0x122b2b];
        return _0x300eec;
    }, _0x2703(_0x2b49c2, _0x142ca2);
}
function drawBird() {
    var _0x3a855a = _0x2703, _0x431050 = {
            'dgqor': _0x3a855a(0x169),
            'SHBJD': _0x3a855a(0x123),
            'nXvxN': function (_0x3be4ea) {
                return _0x3be4ea();
            }
        };
    document[_0x3a855a(0x100) + _0x3a855a(0xc5)](_0x431050[_0x3a855a(0x187)])[_0x3a855a(0x13b)][_0x3a855a(0x1a6)] = state[_0x3a855a(0x113)], document[_0x3a855a(0x100) + _0x3a855a(0xc5)](_0x431050[_0x3a855a(0xcd)])[_0x3a855a(0x13b)][_0x3a855a(0x156)] = _0x3a855a(0x118) + _0x431050[_0x3a855a(0xd3)](getRotate) + _0x3a855a(0x179);
}
function drawScore() {
    var _0x5121a5 = _0x2703, _0x56c8e8 = { 'szjkh': _0x5121a5(0x114) }, _0x5896a4 = document[_0x5121a5(0x100) + _0x5121a5(0xc5)](_0x56c8e8[_0x5121a5(0x145)]);
    _0x5896a4[_0x5121a5(0x199)] = state[_0x5121a5(0x114)][_0x5121a5(0xfd)](0x20b4 + 0x7 * 0x443 + -0x3e87);
}
function drawPipes() {
    var _0x199587 = _0x2703, _0x2e003a = {
            'dSlrh': _0x199587(0x144),
            'YHaAw': function (_0x47c707, _0x4b99ae) {
                return _0x47c707(_0x4b99ae);
            }
        }, _0x17f000 = document[_0x199587(0x100) + _0x199587(0xc5)](_0x2e003a[_0x199587(0x192)]);
    _0x17f000[_0x199587(0x18a) + _0x199587(0x16f)]();
    for (var _0x40ab59 of state[_0x199587(0x138)]) {
        _0x2e003a[_0x199587(0x11b)](drawPipe, _0x40ab59);
    }
}
function draw() {
    var _0x1d4e31 = _0x2703, _0x46c9a2 = {
            'npMCB': function (_0x257d75) {
                return _0x257d75();
            }
        };
    _0x46c9a2[_0x1d4e31(0x14e)](drawBird), _0x46c9a2[_0x1d4e31(0x14e)](drawScore), _0x46c9a2[_0x1d4e31(0x14e)](drawPipes);
}
function endGame() {
    var _0x2113c4 = _0x2703;
    state[_0x2113c4(0x167) + _0x2113c4(0x18e)] = ![];
}
function updatePipes() {
    var _0x44f1eb = _0x2703, _0x62b197 = {
            'LiFWr': function (_0x50f766, _0x2afc16) {
                return _0x50f766 * _0x2afc16;
            }
        };
    for (var _0x28a067 of state[_0x44f1eb(0x138)]) {
        _0x28a067['x'] -= _0x62b197[_0x44f1eb(0x19c)](visualConfig[_0x44f1eb(0x16a)], config[_0x44f1eb(0xd1)]);
    }
}
function getRotate() {
    var _0x224515 = _0x2703, _0xc1e7f3 = {
            'efFSc': function (_0x4ffb43, _0x1bc82e) {
                return _0x4ffb43 / _0x1bc82e;
            },
            'ulHwW': function (_0x53a637, _0x3cd7d8) {
                return _0x53a637 * _0x3cd7d8;
            },
            'DFDPp': function (_0x47a404, _0x42d122) {
                return _0x47a404 / _0x42d122;
            }
        };
    return _0xc1e7f3[_0x224515(0x176)](_0xc1e7f3[_0x224515(0x18f)](-visualConfig[_0x224515(0xc3) + 'eg'], Math[_0x224515(0xdf)](_0xc1e7f3[_0x224515(0x176)](state[_0x224515(0x17d)], visualConfig[_0x224515(0xbe) + _0x224515(0x151)]))), _0xc1e7f3[_0x224515(0xd9)](Math['PI'], -0x3c * 0x92 + -0x19c8 + 0x3c02 * 0x1));
}
function makeFirstPipe() {
    var _0x16287e = _0x2703, _0x21cdf5 = {
            'SHyjl': function (_0x4746ad, _0x5d0a09) {
                return _0x4746ad(_0x5d0a09);
            },
            'oJsAh': function (_0x3dbc5e, _0x50e72c) {
                return _0x3dbc5e - _0x50e72c;
            },
            'cfHMl': function (_0xbdaf50, _0x1936ee) {
                return _0xbdaf50 * _0x1936ee;
            },
            'MXYIp': function (_0xcbc1e4, _0xbb7303) {
                return _0xcbc1e4 - _0xbb7303;
            },
            'eAkOE': function (_0x1544e3, _0x5b8b14) {
                return _0x1544e3 / _0x5b8b14;
            }
        };
    _0x21cdf5[_0x16287e(0x175)](makePipe, _0x21cdf5[_0x16287e(0x177)](_0x21cdf5[_0x16287e(0x139)](document[_0x16287e(0xff)][_0x16287e(0x12b) + 'h'], _0x21cdf5[_0x16287e(0x112)](-0x1 * -0x2045 + 0x1 * 0x1dd4 + -0x4 * 0xf86, _0x21cdf5[_0x16287e(0x1b0)](visualConfig[_0x16287e(0xd0) + _0x16287e(0x12d) + 't'], 0x1828 + -0x1927 * 0x1 + -0x47 * -0x5))), _0x21cdf5[_0x16287e(0x139)](-0xcd4 + -0xac * 0x2d + 0x34 * 0xd4 + 0.5, visualConfig[_0x16287e(0x146) + 'x'])));
}
function makePipe(_0x215b11) {
    var _0x1521ba = _0x2703, _0x4085a2 = {
            'NcbOo': function (_0x2b09b8, _0x3a99bc) {
                return _0x2b09b8 * _0x3a99bc;
            },
            'NjjIb': function (_0x1fa9d3, ..._0x3d0c11) {
                return _0x1fa9d3(..._0x3d0c11);
            }
        };
    state[_0x1521ba(0x138)][_0x1521ba(0x13c)]({
        'x': _0x215b11,
        'y': _0x4085a2[_0x1521ba(0x1ad)](document[_0x1521ba(0xff)][_0x1521ba(0x164) + 'ht'], _0x4085a2[_0x1521ba(0xe2)](randomBetween, ...config[_0x1521ba(0x10f) + _0x1521ba(0xc0)]))
    });
}
function isHittingAPipe() {
    var _0xb5f02f = _0x2703, _0x1f4080 = {
            'homIb': _0xb5f02f(0x169),
            'sEuuc': _0xb5f02f(0xfe),
            'armdH': function (_0x54dd54, _0x5a110d) {
                return _0x54dd54 <= _0x5a110d;
            }
        }, _0x2f068b = document[_0xb5f02f(0x100) + _0xb5f02f(0xc5)](_0x1f4080[_0xb5f02f(0x1b3)])[_0xb5f02f(0xf3) + _0xb5f02f(0x184) + 't'](), _0x2567ff = document[_0xb5f02f(0x100) + _0xb5f02f(0x1bb) + 'me'](_0x1f4080[_0xb5f02f(0xcb)]);
    for (var _0x4826b6 of _0x2567ff) {
        var _0x45ceba = _0x4826b6[_0xb5f02f(0xf3) + _0xb5f02f(0x184) + 't']();
        if (_0x1f4080[_0xb5f02f(0xb7)](_0x2f068b[_0xb5f02f(0x19f)], _0x45ceba[_0xb5f02f(0xde)]) && _0x1f4080[_0xb5f02f(0xb7)](_0x45ceba[_0xb5f02f(0x19f)], _0x2f068b[_0xb5f02f(0xde)]) && _0x1f4080[_0xb5f02f(0xb7)](_0x2f068b[_0xb5f02f(0xda)], _0x45ceba[_0xb5f02f(0x1a6)]) && _0x1f4080[_0xb5f02f(0xb7)](_0x45ceba[_0xb5f02f(0xda)], _0x2f068b[_0xb5f02f(0x1a6)]))
            return !![];
    }
    return ![];
}
function drawPipe(_0x53acc3) {
    var _0x38e6c3 = _0x2703, _0x30649e = {
            'XFoJE': _0x38e6c3(0xc9) + _0x38e6c3(0x194) + _0x38e6c3(0x1ae) + _0x38e6c3(0xee) + _0x38e6c3(0xeb) + _0x38e6c3(0xce) + _0x38e6c3(0x157) + _0x38e6c3(0x11d) + _0x38e6c3(0xdb) + _0x38e6c3(0x154) + _0x38e6c3(0x1b2) + '|0',
            'kkrbr': _0x38e6c3(0xfe),
            'NTMZu': _0x38e6c3(0xe5),
            'hceWW': _0x38e6c3(0xfa),
            'tAzLa': _0x38e6c3(0x137),
            'IvHZZ': _0x38e6c3(0x15b),
            'KplfW': _0x38e6c3(0x141) + _0x38e6c3(0xc4) + _0x38e6c3(0x128) + 'x)',
            'OSxNR': function (_0x5570f4, _0x226508) {
                return _0x5570f4 + _0x226508;
            },
            'RilVW': _0x38e6c3(0x141) + _0x38e6c3(0x1aa),
            'tdltL': _0x38e6c3(0x11f) + _0x38e6c3(0x18c),
            'HuPXj': _0x38e6c3(0xe6),
            'dtoma': _0x38e6c3(0x14d) + _0x38e6c3(0x166),
            'Dliyi': _0x38e6c3(0xd7) + _0x38e6c3(0xf8),
            'qqkAf': _0x38e6c3(0x19b),
            'vnTzt': _0x38e6c3(0x141) + _0x38e6c3(0x147),
            'sjARx': function (_0x2255e3, _0x5d6f6c) {
                return _0x2255e3 + _0x5d6f6c;
            },
            'WKHdY': _0x38e6c3(0x158),
            'HmYbX': _0x38e6c3(0xd7) + 'e',
            'SKUeg': _0x38e6c3(0x141) + _0x38e6c3(0x152) + _0x38e6c3(0x142),
            'EDPbK': _0x38e6c3(0x144),
            'lZbku': _0x38e6c3(0xd7) + _0x38e6c3(0xf2),
            'THvBS': _0x38e6c3(0x158) + _0x38e6c3(0x12e) + ')',
            'fJwLW': _0x38e6c3(0x102) + _0x38e6c3(0x107)
        }, _0x4b241a = _0x30649e[_0x38e6c3(0x109)][_0x38e6c3(0x161)]('|'), _0x5c9ed2 = -0x2 * -0x8f5 + 0x4 * 0x69a + -0x2c52;
    while (!![]) {
        switch (_0x4b241a[_0x5c9ed2++]) {
        case '0':
            _0x4f679f[_0x38e6c3(0x19a) + 'd'](_0x44d980);
            continue;
        case '1':
            _0xae2053[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0x10d)];
            continue;
        case '2':
            _0x446063[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0x133)];
            continue;
        case '3':
            var _0x446063 = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0x125)]);
            continue;
        case '4':
            Object[_0x38e6c3(0xd2)](_0x1c9764[_0x38e6c3(0x13b)], {
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'width': _0x30649e[_0x38e6c3(0x186)],
                'height': _0x30649e[_0x38e6c3(0x186)]
            });
            continue;
        case '5':
            _0x446063[_0x38e6c3(0x19a) + 'd'](_0x4f679f);
            continue;
        case '6':
            _0x1f7a99[_0x38e6c3(0x19a) + 'd'](_0x446063);
            continue;
        case '7':
            _0x4f679f[_0x38e6c3(0x19a) + 'd'](_0x100944);
            continue;
        case '8':
            Object[_0x38e6c3(0xd2)](_0xae2053[_0x38e6c3(0x13b)], {
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'width': visualConfig[_0x38e6c3(0x18d) + 'th'] || -0x124 + -0x31 * -0x61 + 0x1150 * -0x1,
                'left': visualConfig[_0x38e6c3(0xed) + 't'] || 0x12d1 + -0x8d3 + -0x9a9,
                'height': _0x30649e[_0x38e6c3(0x186)],
                'bottom': _0x53acc3['y'],
                'transform': _0x30649e[_0x38e6c3(0x11e)]
            });
            continue;
        case '9':
            Object[_0x38e6c3(0xd2)](_0x44d980[_0x38e6c3(0x13b)], {
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'width': visualConfig[_0x38e6c3(0x18d) + 'th'],
                'left': visualConfig[_0x38e6c3(0xed) + 't'],
                'height': _0x30649e[_0x38e6c3(0x186)],
                'bottom': _0x30649e[_0x38e6c3(0x188)](_0x53acc3['y'], config[_0x38e6c3(0x1ba) + _0x38e6c3(0x183)]),
                'transform': _0x30649e[_0x38e6c3(0x14f)]
            });
            continue;
        case '10':
            _0x21160e[_0x38e6c3(0x126)] = _0x30649e[_0x38e6c3(0x115)];
            continue;
        case '11':
            var _0xae2053 = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0x125)]);
            continue;
        case '12':
            var _0x629e0d = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0xdc)]);
            continue;
        case '13':
            Object[_0x38e6c3(0xd2)](_0x4f679f[_0x38e6c3(0x13b)], {
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'width': _0x30649e[_0x38e6c3(0x186)],
                'height': _0x30649e[_0x38e6c3(0x186)]
            });
            continue;
        case '14':
            _0x629e0d[_0x38e6c3(0x126)] = _0x30649e[_0x38e6c3(0x115)];
            continue;
        case '15':
            _0x4f679f[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0x198)];
            continue;
        case '16':
            _0x4f679f[_0x38e6c3(0x19a) + 'd'](_0x629e0d);
            continue;
        case '17':
            var _0x21160e = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0xdc)]);
            continue;
        case '18':
            _0x1c9764[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0xea)];
            continue;
        case '19':
            _0x100944[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0x185)];
            continue;
        case '20':
            _0x1c9764[_0x38e6c3(0x19a) + 'd'](_0xae2053);
            continue;
        case '21':
            _0x1c9764[_0x38e6c3(0x19a) + 'd'](_0x21160e);
            continue;
        case '22':
            _0x4ce37c[_0x38e6c3(0x126)] = _0x30649e[_0x38e6c3(0x115)];
            continue;
        case '23':
            var _0x44d980 = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0x125)]);
            continue;
        case '24':
            Object[_0x38e6c3(0xd2)](_0x4ce37c[_0x38e6c3(0x13b)], {
                'width': _0x30649e[_0x38e6c3(0x186)],
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'bottom': _0x53acc3['y'],
                'transform': _0x30649e[_0x38e6c3(0xf1)]
            });
            continue;
        case '25':
            _0x44d980[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0x10d)];
            continue;
        case '26':
            _0x446063[_0x38e6c3(0x19a) + 'd'](_0x1c9764);
            continue;
        case '27':
            var _0x4ce37c = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0xdc)]);
            continue;
        case '28':
            _0x1c9764[_0x38e6c3(0x19a) + 'd'](_0x4ce37c);
            continue;
        case '29':
            Object[_0x38e6c3(0xd2)](_0x629e0d[_0x38e6c3(0x13b)], {
                'width': _0x30649e[_0x38e6c3(0x186)],
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'bottom': _0x30649e[_0x38e6c3(0xcc)](_0x53acc3['y'], config[_0x38e6c3(0x1ba) + _0x38e6c3(0x183)]),
                'transform': _0x30649e[_0x38e6c3(0x189)],
                'zIndex': -(0x5 * -0x3b + -0x2 * 0x11c5 + 0x24b2),
                'height': _0x30649e[_0x38e6c3(0x186)]
            });
            continue;
        case '30':
            Object[_0x38e6c3(0xd2)](_0x446063[_0x38e6c3(0x13b)], {
                'left': _0x53acc3['x'],
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'height': _0x30649e[_0x38e6c3(0x186)],
                'width': visualConfig[_0x38e6c3(0x146) + 'x']
            });
            continue;
        case '31':
            _0x100944[_0x38e6c3(0x126)] = _0x30649e[_0x38e6c3(0x115)];
            continue;
        case '32':
            _0x4ce37c[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0x17c)];
            continue;
        case '33':
            Object[_0x38e6c3(0xd2)](_0x21160e[_0x38e6c3(0x13b)], {
                'width': _0x30649e[_0x38e6c3(0x186)],
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'bottom': _0x53acc3['y'],
                'transform': _0x30649e[_0x38e6c3(0x1bc)],
                'zIndex': -(0x1cc8 + 0x1334 + -0x2ffb),
                'height': _0x30649e[_0x38e6c3(0x186)]
            });
            continue;
        case '34':
            var _0x1f7a99 = document[_0x38e6c3(0x100) + _0x38e6c3(0xc5)](_0x30649e[_0x38e6c3(0xd8)]);
            continue;
        case '35':
            _0x21160e[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0x1b4)];
            continue;
        case '36':
            Object[_0x38e6c3(0xd2)](_0x100944[_0x38e6c3(0x13b)], {
                'width': _0x30649e[_0x38e6c3(0x186)],
                'position': _0x30649e[_0x38e6c3(0xe0)],
                'bottom': _0x30649e[_0x38e6c3(0x188)](_0x53acc3['y'], config[_0x38e6c3(0x1ba) + _0x38e6c3(0x183)]),
                'transform': _0x30649e[_0x38e6c3(0x191)]
            });
            continue;
        case '37':
            _0x629e0d[_0x38e6c3(0x178)] = _0x30649e[_0x38e6c3(0xec)];
            continue;
        case '38':
            var _0x1c9764 = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0x125)]);
            continue;
        case '39':
            var _0x100944 = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0xdc)]);
            continue;
        case '40':
            var _0x4f679f = document[_0x38e6c3(0x19e) + _0x38e6c3(0xe4)](_0x30649e[_0x38e6c3(0x125)]);
            continue;
        }
        break;
    }
}
function renderElements() {
    var _0x4d711f = _0x2703, _0x5e9a5b = {
            'PnSbb': _0x4d711f(0x124) + _0x4d711f(0x101) + _0x4d711f(0x10a) + _0x4d711f(0x135) + _0x4d711f(0x17b) + _0x4d711f(0xf6) + _0x4d711f(0x1a7) + _0x4d711f(0x14c) + _0x4d711f(0x13d) + _0x4d711f(0xc1),
            'DqHLz': _0x4d711f(0x123),
            'RAmQL': _0x4d711f(0xfa),
            'ZtzAI': _0x4d711f(0xbb) + _0x4d711f(0xe9) + _0x4d711f(0x173),
            'rDqSW': _0x4d711f(0x11c),
            'yoyxo': _0x4d711f(0x15b),
            'FbWnl': _0x4d711f(0x137),
            'oqZuy': _0x4d711f(0xe8),
            'sQgqS': _0x4d711f(0x174),
            'DeIAV': _0x4d711f(0x1a9),
            'Hgzux': _0x4d711f(0x104) + _0x4d711f(0x15f),
            'dfGGL': _0x4d711f(0x10c),
            'ipGVN': _0x4d711f(0x114),
            'RnlQL': _0x4d711f(0x169),
            'wFhvN': _0x4d711f(0xcf),
            'bBFLq': _0x4d711f(0x1a3) + _0x4d711f(0x108) + _0x4d711f(0x17f),
            'vcIqh': _0x4d711f(0x13a) + _0x4d711f(0x130),
            'tOBFt': _0x4d711f(0x16b),
            'bJgxq': _0x4d711f(0x1a8),
            'DFfbj': _0x4d711f(0x144),
            'QKmHO': _0x4d711f(0xb9) + _0x4d711f(0xe7) + _0x4d711f(0xb8),
            'adBcA': _0x4d711f(0x120),
            'bcPNR': _0x4d711f(0xe6),
            'iJtLr': function (_0x2f46a5, _0x16f84b) {
                return _0x2f46a5 * _0x16f84b;
            },
            'KToMM': function (_0x3d7526, _0x20425f) {
                return _0x3d7526 * _0x20425f;
            }
        }, _0x2b8f8f = _0x5e9a5b[_0x4d711f(0x165)][_0x4d711f(0x161)]('|'), _0x14612b = 0x811 + 0x7a * 0x3d + -0x2523;
    while (!![]) {
        switch (_0x2b8f8f[_0x14612b++]) {
        case '0':
            _0x2c5e1b['id'] = _0x5e9a5b[_0x4d711f(0x172)];
            continue;
        case '1':
            var _0x405e0a = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '2':
            var _0x529a30 = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '3':
            _0x288dbf[_0x4d711f(0x19a) + 'd'](_0x23b669);
            continue;
        case '4':
            Object[_0x4d711f(0xd2)](_0x529a30[_0x4d711f(0x13b)], {
                'background': _0x5e9a5b[_0x4d711f(0xc8)],
                'backgroundSize': _0x5e9a5b[_0x4d711f(0x171)],
                'width': _0x5e9a5b[_0x4d711f(0x1ac)],
                'height': _0x5e9a5b[_0x4d711f(0x1ac)],
                'position': _0x5e9a5b[_0x4d711f(0x15e)],
                'zIndex': -(0x32a * -0xc + -0x1a68 + 0x4061)
            });
            continue;
        case '5':
            var _0x2fa085 = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '6':
            var _0x288dbf = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '7':
            _0x529a30['id'] = 'bg';
            continue;
        case '8':
            Object[_0x4d711f(0xd2)](_0x288dbf[_0x4d711f(0x13b)], {
                'height': _0x5e9a5b[_0x4d711f(0x1ac)],
                'position': _0x5e9a5b[_0x4d711f(0x160)],
                'overflow': _0x5e9a5b[_0x4d711f(0xb6)],
                'userSelect': _0x5e9a5b[_0x4d711f(0x13f)]
            });
            continue;
        case '9':
            Object[_0x4d711f(0xd2)](_0x2fa085[_0x4d711f(0x13b)], {
                'position': _0x5e9a5b[_0x4d711f(0x15e)],
                'width': config[_0x4d711f(0x17e)],
                'height': config[_0x4d711f(0x17e)]
            });
            continue;
        case '10':
            _0x2c5e1b[_0x4d711f(0x126)] = _0x5e9a5b[_0x4d711f(0x132)];
            continue;
        case '11':
            _0x288dbf['id'] = _0x5e9a5b[_0x4d711f(0x121)];
            continue;
        case '12':
            _0x23b669['id'] = _0x5e9a5b[_0x4d711f(0x12c)];
            continue;
        case '13':
            _0x3f3376[_0x4d711f(0x19a) + 'd'](_0x432ad6);
            continue;
        case '14':
            _0x2fa085['id'] = _0x5e9a5b[_0x4d711f(0xbc)];
            continue;
        case '15':
            _0x2fa085[_0x4d711f(0x19a) + 'd'](_0x405e0a);
            continue;
        case '16':
            Object[_0x4d711f(0xd2)](_0x50be71[_0x4d711f(0x13b)], {
                'position': _0x5e9a5b[_0x4d711f(0x15e)],
                'fontSize': _0x5e9a5b[_0x4d711f(0x127)],
                'bottom': 0x0,
                'right': 0x0,
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x5e9a5b[_0x4d711f(0xe3)],
                'border': _0x5e9a5b[_0x4d711f(0x14b)],
                'borderRadius': _0x5e9a5b[_0x4d711f(0x12f)],
                'zIndex': 0x1
            });
            continue;
        case '17':
            _0x3f3376[_0x4d711f(0x19a) + 'd'](_0x2fa085);
            continue;
        case '18':
            Object[_0x4d711f(0xd2)](_0x23b669[_0x4d711f(0x13b)], {
                'position': _0x5e9a5b[_0x4d711f(0x15e)],
                'fontSize': _0x5e9a5b[_0x4d711f(0x127)],
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x5e9a5b[_0x4d711f(0xe3)],
                'border': _0x5e9a5b[_0x4d711f(0x14b)],
                'borderRadius': _0x5e9a5b[_0x4d711f(0x12f)],
                'zIndex': 0x1
            });
            continue;
        case '19':
            _0x405e0a[_0x4d711f(0x19a) + 'd'](_0x2c5e1b);
            continue;
        case '20':
            var _0x50be71 = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '21':
            _0x50be71['id'] = _0x5e9a5b[_0x4d711f(0x182)];
            continue;
        case '22':
            document[_0x4d711f(0xff)][_0x4d711f(0x19a) + 'd'](_0x288dbf);
            continue;
        case '23':
            _0x432ad6['id'] = _0x5e9a5b[_0x4d711f(0x148)];
            continue;
        case '24':
            Object[_0x4d711f(0xd2)](_0x432ad6[_0x4d711f(0x13b)], { 'height': _0x5e9a5b[_0x4d711f(0x1ac)] });
            continue;
        case '25':
            var _0x23b669 = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '26':
            _0x50be71[_0x4d711f(0x199)] = _0x5e9a5b[_0x4d711f(0x1a5)];
            continue;
        case '27':
            _0x3f3376['id'] = _0x5e9a5b[_0x4d711f(0xf5)];
            continue;
        case '28':
            Object[_0x4d711f(0xd2)](_0x3f3376[_0x4d711f(0x13b)], {
                'position': _0x5e9a5b[_0x4d711f(0x15e)],
                'height': _0x5e9a5b[_0x4d711f(0x1ac)],
                'width': _0x5e9a5b[_0x4d711f(0x1ac)],
                'transform': _0x4d711f(0xca) + visualConfig[_0x4d711f(0xd0) + _0x4d711f(0x12d) + 't'] + '%)'
            });
            continue;
        case '29':
            var _0x2c5e1b = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x110)]);
            continue;
        case '30':
            _0x288dbf[_0x4d711f(0x19a) + 'd'](_0x529a30);
            continue;
        case '31':
            _0x288dbf[_0x4d711f(0x19a) + 'd'](_0x50be71);
            continue;
        case '32':
            var _0x3f3376 = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '33':
            Object[_0x4d711f(0xd2)](_0x405e0a[_0x4d711f(0x13b)], {
                'position': _0x5e9a5b[_0x4d711f(0x15e)],
                'bottom': _0x5e9a5b[_0x4d711f(0x150)](-(-0x2f9 * -0x1 + -0x1dc0 + 0x1ac7 + 0.16), config[_0x4d711f(0x17e)]),
                'top': _0x5e9a5b[_0x4d711f(0x1a1)](-(-0x150e + 0x2089 * -0x1 + 0x33 * 0x10d + 0.25), config[_0x4d711f(0x17e)]),
                'right': _0x5e9a5b[_0x4d711f(0x1a1)](-(-0x10cd + -0x1c55 + 0x35 * 0xda + 0.25), config[_0x4d711f(0x17e)]),
                'left': _0x5e9a5b[_0x4d711f(0x1a1)](-(0x4a8 + -0x20b * -0xd + -0x1f37 + 0.25), config[_0x4d711f(0x17e)])
            });
            continue;
        case '34':
            Object[_0x4d711f(0xd2)](_0x2c5e1b[_0x4d711f(0x13b)], {
                'position': _0x5e9a5b[_0x4d711f(0x15e)],
                'height': _0x5e9a5b[_0x4d711f(0x1ac)],
                'width': _0x5e9a5b[_0x4d711f(0x1ac)]
            });
            continue;
        case '35':
            var _0x432ad6 = document[_0x4d711f(0x19e) + _0x4d711f(0xe4)](_0x5e9a5b[_0x4d711f(0x119)]);
            continue;
        case '36':
            _0x288dbf[_0x4d711f(0x19a) + 'd'](_0x3f3376);
            continue;
        }
        break;
    }
}
function _0x2174() {
    var _0x212017 = [
        'transform',
        '20|40|15|1',
        'scaleX(-1)',
        'mhwFm',
        'gravity',
        '100%',
        'max',
        'fIMMM',
        'FbWnl',
        'ird.png',
        'oqZuy',
        'split',
        'ehkqB',
        'random',
        'offsetHeig',
        'PnSbb',
        'rapper',
        'gameIsRunn',
        '6fcvOwO',
        'bird',
        'tick',
        '10px',
        'kcrgl',
        'onkeydown',
        '9bIhFAC',
        'ldren',
        '3|0|1|6|2|',
        'rDqSW',
        'DqHLz',
        'd.png)',
        'hidden',
        'SHyjl',
        'efFSc',
        'oJsAh',
        'className',
        'deg)',
        'DOMContent',
        '13|5|14|9|',
        'HmYbX',
        'speed',
        'birdSize',
        '0.8)',
        'sGBxq',
        'jgedt',
        'bJgxq',
        'alGapPx',
        'gClientRec',
        'qqkAf',
        'IvHZZ',
        'dgqor',
        'OSxNR',
        'WKHdY',
        'replaceChi',
        'cHtEr',
        'ipe.png',
        'pipeBoxWid',
        'ing',
        'ulHwW',
        '4|5',
        'THvBS',
        'dSlrh',
        'dAorF',
        '6|38|18|4|',
        'KdHqE',
        '7306250nAIYVI',
        'CKofx',
        'dtoma',
        'innerText',
        'appendChil',
        'top_pipe',
        'LiFWr',
        'hQCcV',
        'createElem',
        'left',
        'Loaded',
        'KToMM',
        '147320Diwwvo',
        'rgba(255,\x20',
        'IzvFN',
        'QKmHO',
        'bottom',
        '|29|0|10|3',
        'controls',
        'none',
        '(-2px)',
        'keys',
        'yoyxo',
        'NcbOo',
        '26|27|32|2',
        'puCxm',
        'eAkOE',
        'MyHMt',
        '16|23|25|9',
        'homIb',
        'lZbku',
        'zjIfv',
        'stener',
        'kvMcQ',
        'pipeSpacin',
        'gymtF',
        'pipeVertic',
        'sByClassNa',
        'SKUeg',
        'sQgqS',
        'armdH',
        'to\x20restart',
        'space\x20to\x20f',
        'nilKA',
        'url(assets',
        'RnlQL',
        'yKpLk',
        'rotateThre',
        'cXzHj',
        'YVariance',
        '1|26|16|31',
        '3|1|5|2|0|',
        'maxRotateD',
        '(100%)\x20tra',
        'ById',
        'KZOCY',
        'Kqzuz',
        'ZtzAI',
        '34|3|2|30|',
        'translate(',
        'sEuuc',
        'sjARx',
        'SHBJD',
        '21|11|1|8|',
        'xxx-large',
        'worldTrans',
        'pipeSpeed',
        'assign',
        'nXvxN',
        'Space',
        'dKELx',
        '552209XTVenS',
        'bottom_pip',
        'EDPbK',
        'DFDPp',
        'top',
        '31|36|7|12',
        'HuPXj',
        '372304xdJsSE',
        'right',
        'atan',
        'tAzLa',
        'NcXuq',
        'NjjIb',
        'bBFLq',
        'ent',
        'pipes_pair',
        'img',
        'lap\x0aclick\x20',
        'relative',
        '/backgroun',
        'Dliyi',
        '|35|10|33|',
        'fJwLW',
        'pipeBoxLef',
        '2|24|28|17',
        'gXVariance',
        '5IIBCql',
        'vnTzt',
        'e_flipped',
        'getBoundin',
        'PHXkC',
        'adBcA',
        '17|1|33|15',
        '5|7|6|0|2|',
        'e_wrapper',
        'addEventLi',
        'div',
        '3202444yoKjol',
        'amkdl',
        'toFixed',
        'pipe_box',
        'body',
        'getElement',
        '2|7|4|30|3',
        'top_pipe_f',
        'key',
        './assets/b',
        'yrXte',
        'AvYbE',
        'lipped',
        '255,\x20255,\x20',
        'XFoJE',
        '2|27|28|36',
        '5721036QrMPjK',
        'game',
        'kkrbr',
        '10252210aWAKKl',
        'pipeHeight',
        'bcPNR',
        'ZrYXR',
        'MXYIp',
        'altitude',
        'score',
        'tdltL',
        'eGIGq',
        'InWvj',
        'rotate(',
        'RAmQL',
        'OxZZS',
        'YHaAw',
        '100%\x20100%',
        '3|5|39|19|',
        'KplfW',
        './assets/p',
        'world',
        'dfGGL',
        'pipeReappe',
        'bird_img',
        '6|11|8|22|',
        'hceWW',
        'src',
        'wFhvN',
        'nslateY(2p',
        'code',
        'onclick',
        'offsetWidt',
        'ipGVN',
        'latePercen',
        '\x20scaleY(-1',
        'tOBFt',
        'black',
        'jDQzk',
        'Hgzux',
        'NTMZu',
        'ynVIX',
        '|35|23|24|',
        '1|0|2|5|4|',
        'absolute',
        'pipes',
        'cfHMl',
        '2px\x20solid\x20',
        'style',
        'push',
        '|18|3|20|2',
        'arPx',
        'DeIAV',
        'pAdCI',
        'translateY',
        'leY(-1)',
        'power',
        'all_pipes',
        'szjkh',
        'pipeWidthP',
        '(100%)',
        'DFfbj',
        'veDGS',
        'keyCode',
        'vcIqh',
        '4|19|25|12',
        'top_pipe_w',
        'npMCB',
        'RilVW',
        'iJtLr',
        'shold',
        '(100%)\x20sca',
        'cXXps',
        '|37|14|29|',
        '4|1|3'
    ];
    _0x2174 = function () {
        return _0x212017;
    };
    return _0x2174();
}
function flap() {
    var _0x1e0429 = _0x2703;
    state[_0x1e0429(0x17d)] = config[_0x1e0429(0x143)];
}
function updateBird() {
    var _0x1823c3 = _0x2703, _0x51d07a = {
            'zjIfv': function (_0x192c4c, _0x4ef0dc) {
                return _0x192c4c * _0x4ef0dc;
            },
            'NcXuq': function (_0x48d473, _0x595958) {
                return _0x48d473 + _0x595958;
            }
        };
    state[_0x1823c3(0x17d)] -= _0x51d07a[_0x1823c3(0x1b5)](config[_0x1823c3(0x15a)], visualConfig[_0x1823c3(0x16a)]), state[_0x1823c3(0x113)] = _0x51d07a[_0x1823c3(0xe1)](state[_0x1823c3(0x113)], _0x51d07a[_0x1823c3(0x1b5)](state[_0x1823c3(0x17d)], visualConfig[_0x1823c3(0x16a)]));
}
function randomBetween(_0x2bff25, _0x1ef24b) {
    var _0x458388 = _0x2703, _0x40fbee = {
            'cXzHj': function (_0x6834fb, _0x3dcb19) {
                return _0x6834fb + _0x3dcb19;
            },
            'kvMcQ': function (_0x43e117, _0x71c00c) {
                return _0x43e117 * _0x71c00c;
            },
            'IzvFN': function (_0x2db7d2, _0x5e8735) {
                return _0x2db7d2 - _0x5e8735;
            }
        };
    return _0x40fbee[_0x458388(0xbf)](_0x2bff25, _0x40fbee[_0x458388(0x1b7)](_0x40fbee[_0x458388(0x1a4)](_0x1ef24b, _0x2bff25), Math[_0x458388(0x163)]()));
}
function maybeMakeNewPipe() {
    var _0x5ac51a = _0x2703, _0x3d698a = {
            'AvYbE': _0x5ac51a(0x136) + '3',
            'KZOCY': function (_0x2cad51, _0x369620) {
                return _0x2cad51 * _0x369620;
            },
            'Kqzuz': function (_0x49f4c8, _0x26e8f3) {
                return _0x49f4c8 / _0x26e8f3;
            },
            'MyHMt': function (_0xbcd637, _0x27b24d) {
                return _0xbcd637 < _0x27b24d;
            },
            'ynVIX': function (_0x247e45, _0x341fc0) {
                return _0x247e45(_0x341fc0);
            },
            'kcrgl': function (_0x5981f5, _0x553add) {
                return _0x5981f5 + _0x553add;
            },
            'dAorF': function (_0x68a061, ..._0x2e87f1) {
                return _0x68a061(..._0x2e87f1);
            },
            'ZrYXR': function (_0x1cbb13, _0x1ed1e8) {
                return _0x1cbb13 > _0x1ed1e8;
            }
        }, _0x424474 = _0x3d698a[_0x5ac51a(0x106)][_0x5ac51a(0x161)]('|'), _0x342a12 = 0x16bd * -0x1 + -0xb8d + 0x224a;
    while (!![]) {
        switch (_0x424474[_0x342a12++]) {
        case '0':
            var _0x10cda4 = -0x45 * 0x4c + 0x4c7 * 0x6 + -0x2 * 0x417;
            continue;
        case '1':
            var _0x53c77b = [];
            continue;
        case '2':
            var _0x4e2782 = _0x3d698a[_0x5ac51a(0xc6)](_0x3d698a[_0x5ac51a(0xc6)](document[_0x5ac51a(0xff)][_0x5ac51a(0x12b) + 'h'], 0xd5f + -0xfd1 + 0x273 + 0.5), _0x3d698a[_0x5ac51a(0xc7)](visualConfig[_0x5ac51a(0xd0) + _0x5ac51a(0x12d) + 't'], 0x2019 + 0x1 * -0x186b + -0x74a));
            continue;
        case '3':
            _0x3d698a[_0x5ac51a(0x1b1)](_0x10cda4, config[_0x5ac51a(0x122) + _0x5ac51a(0x13e)]) && _0x3d698a[_0x5ac51a(0x134)](makePipe, _0x3d698a[_0x5ac51a(0x16c)](config[_0x5ac51a(0x122) + _0x5ac51a(0x13e)], _0x3d698a[_0x5ac51a(0xc6)](config[_0x5ac51a(0x1b8) + 'gX'], _0x3d698a[_0x5ac51a(0x193)](randomBetween, ...config[_0x5ac51a(0x1b8) + _0x5ac51a(0xef)]))));
            continue;
        case '4':
            state[_0x5ac51a(0x138)] = _0x53c77b;
            continue;
        case '5':
            for (var _0x382e74 of state[_0x5ac51a(0x138)]) {
                _0x10cda4 = Math[_0x5ac51a(0x15c)](_0x10cda4, _0x382e74['x']), _0x3d698a[_0x5ac51a(0x111)](_0x382e74['x'], -_0x4e2782) && _0x53c77b[_0x5ac51a(0x13c)](_0x382e74);
            }
            continue;
        }
        break;
    }
}
var functions = Object[_0x587d5a(0x1ab)]({
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
    var _0x3111dd = _0x587d5a, _0x5f2c7e = {
            'KdHqE': _0x3111dd(0x17a) + _0x3111dd(0x1a0),
            'veDGS': function (_0x1d84ef) {
                return _0x1d84ef();
            }
        };
    function _0x2ce217() {
        var _0x5e4e79 = _0x3111dd;
        document[_0x5e4e79(0xf9) + _0x5e4e79(0x1b6)](_0x5f2c7e[_0x5e4e79(0x195)], ready);
    }
    _0x5f2c7e[_0x3111dd(0x149)](_0x2ce217);
}());