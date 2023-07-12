var _0x30193a = _0x43fa;
function _0x43fa(_0x5ece4c, _0x5c7e10) {
    var _0x15ad6f = _0x2b0f();
    return _0x43fa = function (_0x4ef7f5, _0x276b98) {
        _0x4ef7f5 = _0x4ef7f5 - (0xebb + -0x17cd * -0x1 + 0x4 * -0x932);
        var _0x39edc9 = _0x15ad6f[_0x4ef7f5];
        return _0x39edc9;
    }, _0x43fa(_0x5ece4c, _0x5c7e10);
}
(function (_0x224405, _0x31a735) {
    var _0x4c391c = _0x43fa, _0x252e58 = _0x224405();
    while (!![]) {
        try {
            var _0x59c732 = -parseInt(_0x4c391c(0x246)) / (-0x1 * 0x213a + -0x934 + 0x2a6f) + parseInt(_0x4c391c(0x241)) / (-0x1aa8 + -0x1 * -0x8b + 0x1a1f * 0x1) + -parseInt(_0x4c391c(0x29e)) / (-0x15 * -0x121 + 0x4 * 0x539 + -0x36e * 0xd) + -parseInt(_0x4c391c(0x2c8)) / (-0x199 * -0x12 + 0x2354 + -0x4012) + -parseInt(_0x4c391c(0x217)) / (-0x5e9 * -0x3 + 0x1fc1 * 0x1 + -0xc9 * 0x3f) * (-parseInt(_0x4c391c(0x299)) / (0x1 * -0x24be + -0x1c87 + -0x414b * -0x1)) + -parseInt(_0x4c391c(0x29c)) / (0x848 + 0x163d + -0x1e7e) * (-parseInt(_0x4c391c(0x1c8)) / (-0x1 * 0xda3 + -0x3b * -0x91 + -0x13c0)) + parseInt(_0x4c391c(0x1d1)) / (-0xaae + 0x2525 + 0x1a6e * -0x1) * (-parseInt(_0x4c391c(0x2ba)) / (-0x8f8 + 0x1 * -0x1937 + 0x2239));
            if (_0x59c732 === _0x31a735)
                break;
            else
                _0x252e58['push'](_0x252e58['shift']());
        } catch (_0x161fe9) {
            _0x252e58['push'](_0x252e58['shift']());
        }
    }
}(_0x2b0f, 0xc155 + -0x61af8 + 0xdb25b), console[_0x30193a(0x25b)](_0x30193a(0x1fd) + '3'));
var config = {
        'gravity': 0x514,
        'power': 0x1f4,
        'pipeSpeed': 0x190,
        'pipeVerticalGapPx': 0x78,
        'birdSize': 0x28,
        'pipeReappearPx': 0x3e8,
        'pipeSpacingX': 0x320,
        'pipeSpacingXVariance': [
            0x1bb * 0x13 + 0x24e1 + -0x45c2 + 0.7,
            -0x13e9 * 0x1 + -0x24f7 + -0x34 * -0x118 + 0.9
        ],
        'pipeHeightYVariance': [
            -0x2a4 + 0xd * -0xbf + -0x9 * -0x15f + 0.2,
            -0x23ba + 0xc * -0x10c + 0x304a * 0x1 + 0.7
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
    var _0x229944 = _0x30193a, _0x152d6d = {
            'QQuQQ': _0x229944(0x1d4) + _0x229944(0x29f),
            'KHlZS': function (_0x220ad7) {
                return _0x220ad7();
            },
            'sgXlL': function (_0x3ba5c1, _0x4ed284) {
                return _0x3ba5c1 == _0x4ed284;
            },
            'QBHBW': function (_0x4fb24d, _0x1554bb) {
                return _0x4fb24d == _0x1554bb;
            },
            'rGfOI': _0x229944(0x2bf),
            'ZIKtD': function (_0x4637c7) {
                return _0x4637c7();
            },
            'mPMFu': function (_0x263f52, _0x2f1868, _0x19fdf6) {
                return _0x263f52(_0x2f1868, _0x19fdf6);
            },
            'yWIhW': function (_0x3701e1, _0x4d0e41) {
                return _0x3701e1 * _0x4d0e41;
            }
        }, _0x1c9a69 = _0x152d6d[_0x229944(0x27f)][_0x229944(0x2a6)]('|'), _0x5973e7 = -0x19de + 0x2 * 0x293 + 0x14b8;
    while (!![]) {
        switch (_0x1c9a69[_0x5973e7++]) {
        case '0':
            _0x152d6d[_0x229944(0x274)](draw);
            continue;
        case '1':
            _0x152d6d[_0x229944(0x274)](startGame);
            continue;
        case '2':
            document[_0x229944(0x269)][_0x229944(0x267)] = function (_0x231bef) {
                var _0x28c85e = _0x229944;
                if ((_0x2e9c29[_0x28c85e(0x220)](_0x231bef[_0x28c85e(0x1eb)], '\x20') || _0x2e9c29[_0x28c85e(0x25e)](_0x231bef[_0x28c85e(0x204)], _0x2e9c29[_0x28c85e(0x2b5)]) || _0x2e9c29[_0x28c85e(0x25e)](_0x231bef[_0x28c85e(0x2bb)], -0xd * -0x7f + 0x1d03 + -0x2356)) && state[_0x28c85e(0x1fc) + _0x28c85e(0x1c6)])
                    _0x2e9c29[_0x28c85e(0x1df)](flap);
            };
            continue;
        case '3':
            _0x152d6d[_0x229944(0x274)](renderElements);
            continue;
        case '4':
            var _0x2e9c29 = {
                'ibnwJ': function (_0x4cf29d, _0x1fc848) {
                    var _0x3f7e78 = _0x229944;
                    return _0x152d6d[_0x3f7e78(0x297)](_0x4cf29d, _0x1fc848);
                },
                'GFcjV': function (_0x5f165c, _0x2f7ab1) {
                    var _0x7de9f6 = _0x229944;
                    return _0x152d6d[_0x7de9f6(0x256)](_0x5f165c, _0x2f7ab1);
                },
                'KVBlO': _0x152d6d[_0x229944(0x232)],
                'OLlBj': function (_0x4996ba) {
                    var _0x25a21e = _0x229944;
                    return _0x152d6d[_0x25a21e(0x23e)](_0x4996ba);
                }
            };
            continue;
        case '5':
            _0x152d6d[_0x229944(0x219)](setInterval, () => tick(), _0x152d6d[_0x229944(0x23c)](visualConfig[_0x229944(0x2c4)], -0x796 + -0x1789 * -0x1 + 0xc0b * -0x1));
            continue;
        case '6':
            document[_0x229944(0x269)][_0x229944(0x207)] = () => startGame();
            continue;
        }
        break;
    }
}
function tick() {
    var _0x55bf39 = _0x30193a, _0x6cc3d9 = {
            'WPQdi': _0x55bf39(0x2a7) + _0x55bf39(0x240),
            'kPVtv': function (_0x28b3bd) {
                return _0x28b3bd();
            },
            'VSizZ': function (_0x2557e0, _0x1d1205) {
                return _0x2557e0 * _0x1d1205;
            },
            'befIm': function (_0x4e4361) {
                return _0x4e4361();
            },
            'QIgvy': function (_0x448126, _0x5bd146) {
                return _0x448126 < _0x5bd146;
            },
            'Ovgrc': function (_0x4f1b13) {
                return _0x4f1b13();
            },
            'dzXAB': function (_0x512af9) {
                return _0x512af9();
            },
            'HXvaP': function (_0x68f654) {
                return _0x68f654();
            }
        }, _0x4b6e0f = _0x6cc3d9[_0x55bf39(0x24c)][_0x55bf39(0x2a6)]('|'), _0x1654b3 = -0x1 * -0x2363 + -0x458 + -0x3 * 0xa59;
    while (!![]) {
        switch (_0x4b6e0f[_0x1654b3++]) {
        case '0':
            _0x6cc3d9[_0x55bf39(0x223)](updateBird);
            continue;
        case '1':
            state[_0x55bf39(0x1f5)] += _0x6cc3d9[_0x55bf39(0x1e9)](visualConfig[_0x55bf39(0x2c4)], -0x5b7 + 0x270 * -0x9 + 0x1bb1);
            continue;
        case '2':
            _0x6cc3d9[_0x55bf39(0x1fa)](draw);
            continue;
        case '3':
            _0x6cc3d9[_0x55bf39(0x223)](updatePipes);
            continue;
        case '4':
            if (_0x6cc3d9[_0x55bf39(0x253)](state[_0x55bf39(0x23f)], -0xe6a + -0x1339 + 0x21a3)) {
                _0x6cc3d9[_0x55bf39(0x245)](endGame);
                return;
            }
            continue;
        case '5':
            if (!state[_0x55bf39(0x1fc) + _0x55bf39(0x1c6)])
                return;
            continue;
        case '6':
            if (_0x6cc3d9[_0x55bf39(0x26c)](isHittingAPipe)) {
                _0x6cc3d9[_0x55bf39(0x292)](endGame);
                return;
            }
            continue;
        case '7':
            _0x6cc3d9[_0x55bf39(0x1fa)](maybeMakeNewPipe);
            continue;
        }
        break;
    }
}
function startGame() {
    var _0x58e2c1 = _0x30193a, _0x439628 = {
            'FNpQC': _0x58e2c1(0x203) + '0',
            'OUxlu': function (_0x1c691c) {
                return _0x1c691c();
            },
            'mytiS': function (_0x2372ea) {
                return _0x2372ea();
            }
        }, _0x4b226a = _0x439628[_0x58e2c1(0x211)][_0x58e2c1(0x2a6)]('|'), _0x29ee12 = -0x1b39 + 0x1fbb + 0x1 * -0x482;
    while (!![]) {
        switch (_0x4b226a[_0x29ee12++]) {
        case '0':
            state[_0x58e2c1(0x1fc) + _0x58e2c1(0x1c6)] = !![];
            continue;
        case '1':
            state[_0x58e2c1(0x27e)] = [];
            continue;
        case '2':
            _0x439628[_0x58e2c1(0x1d8)](makeFirstPipe);
            continue;
        case '3':
            _0x439628[_0x58e2c1(0x1d7)](flap);
            continue;
        case '4':
            state[_0x58e2c1(0x1f5)] = 0x5 * 0x2f6 + -0x1 * -0xb4e + 0x2 * -0xd0e;
            continue;
        case '5':
            state[_0x58e2c1(0x23f)] = -0x1510 + 0xd88 + 0x8 * 0xf1;
            continue;
        }
        break;
    }
}
function drawBird() {
    var _0xdf19a1 = _0x30193a, _0x245cc6 = {
            'UtZka': _0xdf19a1(0x27a),
            'SmLBO': _0xdf19a1(0x265),
            'bAGVW': function (_0x58eda7) {
                return _0x58eda7();
            }
        };
    document[_0xdf19a1(0x2c7) + _0xdf19a1(0x1ff)](_0x245cc6[_0xdf19a1(0x2c1)])[_0xdf19a1(0x2c6)][_0xdf19a1(0x2be)] = state[_0xdf19a1(0x23f)], document[_0xdf19a1(0x2c7) + _0xdf19a1(0x1ff)](_0x245cc6[_0xdf19a1(0x231)])[_0xdf19a1(0x2c6)][_0xdf19a1(0x242)] = _0xdf19a1(0x2ae) + _0x245cc6[_0xdf19a1(0x1ea)](getRotate) + _0xdf19a1(0x2a8);
}
function drawScore() {
    var _0x38c473 = _0x30193a, _0x63da1c = { 'PJPMm': _0x38c473(0x1f5) }, _0x5b8a63 = document[_0x38c473(0x2c7) + _0x38c473(0x1ff)](_0x63da1c[_0x38c473(0x1f7)]);
    _0x5b8a63[_0x38c473(0x26b)] = state[_0x38c473(0x1f5)][_0x38c473(0x2ca)](0x86a + 0xb1d + -0x13 * 0x107);
}
function drawPipes() {
    var _0x25a6ad = _0x30193a, _0x56b362 = {
            'QQnOQ': _0x25a6ad(0x210),
            'npghz': function (_0x1f8096, _0x3989b8) {
                return _0x1f8096(_0x3989b8);
            }
        }, _0x4516c4 = document[_0x25a6ad(0x2c7) + _0x25a6ad(0x1ff)](_0x56b362[_0x25a6ad(0x22a)]);
    _0x4516c4[_0x25a6ad(0x263) + _0x25a6ad(0x2c5)]();
    for (var _0x355f17 of state[_0x25a6ad(0x27e)]) {
        _0x56b362[_0x25a6ad(0x1e1)](drawPipe, _0x355f17);
    }
}
function draw() {
    var _0x18e6fc = _0x30193a, _0xa660b8 = {
            'UgMVe': function (_0x2b91c1) {
                return _0x2b91c1();
            }
        };
    _0xa660b8[_0x18e6fc(0x2b2)](drawBird), _0xa660b8[_0x18e6fc(0x2b2)](drawScore), _0xa660b8[_0x18e6fc(0x2b2)](drawPipes);
}
function endGame() {
    var _0x18eec9 = _0x30193a;
    state[_0x18eec9(0x1fc) + _0x18eec9(0x1c6)] = ![];
}
function updatePipes() {
    var _0x22a28a = _0x30193a, _0x5ace40 = {
            'zuADn': function (_0x27f768, _0x53c637) {
                return _0x27f768 * _0x53c637;
            }
        };
    for (var _0x3ee612 of state[_0x22a28a(0x27e)]) {
        _0x3ee612['x'] -= _0x5ace40[_0x22a28a(0x1e5)](visualConfig[_0x22a28a(0x2c4)], config[_0x22a28a(0x27b)]);
    }
}
function getRotate() {
    var _0x5b3c3b = _0x30193a, _0x43a594 = {
            'fANye': function (_0x59e7f7, _0x4bfd18) {
                return _0x59e7f7 / _0x4bfd18;
            },
            'drZyA': function (_0x18fca3, _0x537250) {
                return _0x18fca3 * _0x537250;
            },
            'fmaBR': function (_0x978c03, _0x532e7e) {
                return _0x978c03 / _0x532e7e;
            }
        };
    return _0x43a594[_0x5b3c3b(0x218)](_0x43a594[_0x5b3c3b(0x229)](-visualConfig[_0x5b3c3b(0x24d) + 'eg'], Math[_0x5b3c3b(0x24b)](_0x43a594[_0x5b3c3b(0x1d5)](state[_0x5b3c3b(0x20a)], visualConfig[_0x5b3c3b(0x22c) + _0x5b3c3b(0x235)]))), _0x43a594[_0x5b3c3b(0x218)](Math['PI'], 0x13 * 0x1b3 + -0x58 * 0x3e + -0x1 * 0xaf7));
}
function makeFirstPipe() {
    var _0xb20a09 = _0x30193a, _0x511450 = {
            'Xutdw': function (_0x18333d, _0x39b1a1) {
                return _0x18333d(_0x39b1a1);
            },
            'NqGGD': function (_0x57d90d, _0x3917d3) {
                return _0x57d90d - _0x3917d3;
            },
            'FvRoD': function (_0x2c2c92, _0x5cb274) {
                return _0x2c2c92 * _0x5cb274;
            },
            'PnLaj': function (_0x4b0a03, _0xe09215) {
                return _0x4b0a03 / _0xe09215;
            },
            'ggAJg': function (_0x178cb7, _0x144937) {
                return _0x178cb7 * _0x144937;
            }
        };
    _0x511450[_0xb20a09(0x1c5)](makePipe, _0x511450[_0xb20a09(0x298)](_0x511450[_0xb20a09(0x1dc)](document[_0xb20a09(0x269)][_0xb20a09(0x22d) + 'h'], _0x511450[_0xb20a09(0x298)](0x13aa + -0x1 * -0x1352 + -0x26fb, _0x511450[_0xb20a09(0x25d)](visualConfig[_0xb20a09(0x1da) + _0xb20a09(0x24f) + 't'], -0x1f8e * 0x1 + -0x175 * -0x11 + 0x72d))), _0x511450[_0xb20a09(0x20e)](-0x14b5 + 0x1083 + 0x6 * 0xb3 + 0.5, visualConfig[_0xb20a09(0x28b) + 'x'])));
}
function makePipe(_0x5ea430) {
    var _0x2cdc74 = _0x30193a, _0x2e8899 = {
            'QCohj': function (_0x2360aa, _0x184622) {
                return _0x2360aa * _0x184622;
            },
            'dGGLC': function (_0x5120a0, ..._0x3e10f0) {
                return _0x5120a0(..._0x3e10f0);
            }
        };
    state[_0x2cdc74(0x27e)][_0x2cdc74(0x216)]({
        'x': _0x5ea430,
        'y': _0x2e8899[_0x2cdc74(0x26f)](document[_0x2cdc74(0x269)][_0x2cdc74(0x27d) + 'ht'], _0x2e8899[_0x2cdc74(0x1c0)](randomBetween, ...config[_0x2cdc74(0x293) + _0x2cdc74(0x1ef)]))
    });
}
function isHittingAPipe() {
    var _0x1d3f99 = _0x30193a, _0x3c14e9 = {
            'xXmWN': _0x1d3f99(0x27a),
            'rQQha': _0x1d3f99(0x1f6),
            'oykJP': function (_0x45a913, _0x1ad75a) {
                return _0x45a913 <= _0x1ad75a;
            },
            'wkQhb': function (_0x5f1e6b, _0x7776f1) {
                return _0x5f1e6b <= _0x7776f1;
            },
            'rhgTw': function (_0x3cbede, _0x4df883) {
                return _0x3cbede <= _0x4df883;
            }
        }, _0x19f8ea = document[_0x1d3f99(0x2c7) + _0x1d3f99(0x1ff)](_0x3c14e9[_0x1d3f99(0x286)])[_0x1d3f99(0x205) + _0x1d3f99(0x2a9) + 't'](), _0x286abb = document[_0x1d3f99(0x2c7) + _0x1d3f99(0x281) + 'me'](_0x3c14e9[_0x1d3f99(0x236)]);
    for (var _0x72e706 of _0x286abb) {
        var _0x35675f = _0x72e706[_0x1d3f99(0x205) + _0x1d3f99(0x2a9) + 't']();
        if (_0x3c14e9[_0x1d3f99(0x273)](_0x19f8ea[_0x1d3f99(0x1cc)], _0x35675f[_0x1d3f99(0x1db)]) && _0x3c14e9[_0x1d3f99(0x278)](_0x35675f[_0x1d3f99(0x1cc)], _0x19f8ea[_0x1d3f99(0x1db)]) && _0x3c14e9[_0x1d3f99(0x2c0)](_0x19f8ea[_0x1d3f99(0x28a)], _0x35675f[_0x1d3f99(0x2be)]) && _0x3c14e9[_0x1d3f99(0x278)](_0x35675f[_0x1d3f99(0x28a)], _0x19f8ea[_0x1d3f99(0x2be)]))
            return !![];
    }
    return ![];
}
function drawPipe(_0x1b44d6) {
    var _0x593932 = _0x30193a, _0x5348fb = {
            'HHOpe': _0x593932(0x1f3) + _0x593932(0x1ee) + _0x593932(0x28d) + _0x593932(0x21a) + _0x593932(0x28f) + _0x593932(0x25f) + _0x593932(0x287) + _0x593932(0x1f2) + _0x593932(0x24e) + _0x593932(0x2ac) + _0x593932(0x1e0) + '18',
            'dKKyX': _0x593932(0x272) + _0x593932(0x29a),
            'xeCEX': _0x593932(0x268),
            'BEHGc': _0x593932(0x249),
            'npXQg': _0x593932(0x277) + _0x593932(0x21d),
            'nsEcL': _0x593932(0x254),
            'mhvfM': _0x593932(0x237),
            'KoxLq': _0x593932(0x1c4),
            'ukwmb': _0x593932(0x277) + 'e',
            'HyXOQ': _0x593932(0x277) + _0x593932(0x270),
            'ovFmv': _0x593932(0x1cd) + _0x593932(0x21f),
            'fHjaP': function (_0xcf88e2, _0xcd0383) {
                return _0xcf88e2 + _0xcd0383;
            },
            'bMSIg': _0x593932(0x257) + _0x593932(0x1d2),
            'LmSqI': _0x593932(0x257) + _0x593932(0x2a2) + _0x593932(0x282),
            'MvLDN': _0x593932(0x257) + _0x593932(0x24a),
            'JizSq': _0x593932(0x201),
            'CNYBp': _0x593932(0x1f6),
            'WXfsV': _0x593932(0x257) + _0x593932(0x200) + _0x593932(0x227) + 'x)',
            'cNyPd': _0x593932(0x21e) + _0x593932(0x284),
            'cPraR': _0x593932(0x210),
            'zJOsV': function (_0x2031e3, _0x3052d4) {
                return _0x2031e3 + _0x3052d4;
            },
            'YFyrj': _0x593932(0x201) + _0x593932(0x20c) + ')',
            'GQzOR': _0x593932(0x212)
        }, _0x844058 = _0x5348fb[_0x593932(0x1c2)][_0x593932(0x2a6)]('|'), _0x5589e4 = 0x18cc + -0x2450 + 0x4 * 0x2e1;
    while (!![]) {
        switch (_0x844058[_0x5589e4++]) {
        case '0':
            _0x174782[_0x593932(0x215)] = _0x5348fb[_0x593932(0x291)];
            continue;
        case '1':
            Object[_0x593932(0x247)](_0x343ffe[_0x593932(0x2c6)], {
                'left': _0x1b44d6['x'],
                'position': _0x5348fb[_0x593932(0x294)],
                'height': _0x5348fb[_0x593932(0x29b)],
                'width': visualConfig[_0x593932(0x28b) + 'x']
            });
            continue;
        case '2':
            _0x4d5bc4[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x1cb)];
            continue;
        case '3':
            _0x343ffe[_0x593932(0x1f0) + 'd'](_0x5e390c);
            continue;
        case '4':
            var _0x1473b6 = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x1dd)]);
            continue;
        case '5':
            _0x27b495[_0x593932(0x215)] = _0x5348fb[_0x593932(0x291)];
            continue;
        case '6':
            _0x27b495[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x22e)];
            continue;
        case '7':
            _0x312508[_0x593932(0x1f0) + 'd'](_0x4d5bc4);
            continue;
        case '8':
            var _0x312508 = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x258)]);
            continue;
        case '9':
            _0x1473b6[_0x593932(0x215)] = _0x5348fb[_0x593932(0x291)];
            continue;
        case '10':
            _0x1473b6[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x285)];
            continue;
        case '11':
            var _0x4d5bc4 = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x1dd)]);
            continue;
        case '12':
            var _0x26ce8e = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x258)]);
            continue;
        case '13':
            _0x312508[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x238)];
            continue;
        case '14':
            _0x5e390c[_0x593932(0x1f0) + 'd'](_0x174782);
            continue;
        case '15':
            _0x5e390c[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x1de)];
            continue;
        case '16':
            var _0x27b495 = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x1dd)]);
            continue;
        case '17':
            Object[_0x593932(0x247)](_0x574e8c[_0x593932(0x2c6)], {
                'position': _0x5348fb[_0x593932(0x294)],
                'width': visualConfig[_0x593932(0x1f4) + 'th'],
                'left': visualConfig[_0x593932(0x2a3) + 't'],
                'height': _0x5348fb[_0x593932(0x29b)],
                'bottom': _0x5348fb[_0x593932(0x26e)](_0x1b44d6['y'], config[_0x593932(0x262) + _0x593932(0x2b9)]),
                'transform': _0x5348fb[_0x593932(0x280)]
            });
            continue;
        case '18':
            _0x5e390c[_0x593932(0x1f0) + 'd'](_0x574e8c);
            continue;
        case '19':
            var _0x343ffe = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x258)]);
            continue;
        case '20':
            Object[_0x593932(0x247)](_0x4d5bc4[_0x593932(0x2c6)], {
                'width': _0x5348fb[_0x593932(0x29b)],
                'position': _0x5348fb[_0x593932(0x294)],
                'bottom': _0x1b44d6['y'],
                'transform': _0x5348fb[_0x593932(0x2cb)],
                'zIndex': -(-0xc49 * 0x1 + -0xf08 + 0x1b52),
                'height': _0x5348fb[_0x593932(0x29b)]
            });
            continue;
        case '21':
            Object[_0x593932(0x247)](_0x1473b6[_0x593932(0x2c6)], {
                'width': _0x5348fb[_0x593932(0x29b)],
                'position': _0x5348fb[_0x593932(0x294)],
                'bottom': _0x1b44d6['y'],
                'transform': _0x5348fb[_0x593932(0x289)]
            });
            continue;
        case '22':
            Object[_0x593932(0x247)](_0x312508[_0x593932(0x2c6)], {
                'position': _0x5348fb[_0x593932(0x294)],
                'width': _0x5348fb[_0x593932(0x29b)],
                'height': _0x5348fb[_0x593932(0x29b)]
            });
            continue;
        case '23':
            _0x312508[_0x593932(0x1f0) + 'd'](_0x1473b6);
            continue;
        case '24':
            _0x352a8e[_0x593932(0x1f0) + 'd'](_0x343ffe);
            continue;
        case '25':
            _0x5e390c[_0x593932(0x1f0) + 'd'](_0x27b495);
            continue;
        case '26':
            _0x4d5bc4[_0x593932(0x215)] = _0x5348fb[_0x593932(0x291)];
            continue;
        case '27':
            _0x343ffe[_0x593932(0x1f0) + 'd'](_0x312508);
            continue;
        case '28':
            var _0x5e390c = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x258)]);
            continue;
        case '29':
            Object[_0x593932(0x247)](_0x174782[_0x593932(0x2c6)], {
                'width': _0x5348fb[_0x593932(0x29b)],
                'position': _0x5348fb[_0x593932(0x294)],
                'bottom': _0x5348fb[_0x593932(0x26e)](_0x1b44d6['y'], config[_0x593932(0x262) + _0x593932(0x2b9)]),
                'transform': _0x5348fb[_0x593932(0x2b0)],
                'zIndex': -(0x15a7 + -0x2116 + 0xb70),
                'height': _0x5348fb[_0x593932(0x29b)]
            });
            continue;
        case '30':
            var _0x174782 = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x1dd)]);
            continue;
        case '31':
            Object[_0x593932(0x247)](_0x5e390c[_0x593932(0x2c6)], {
                'position': _0x5348fb[_0x593932(0x294)],
                'width': _0x5348fb[_0x593932(0x29b)],
                'height': _0x5348fb[_0x593932(0x29b)]
            });
            continue;
        case '32':
            _0x26ce8e[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x2aa)];
            continue;
        case '33':
            Object[_0x593932(0x247)](_0x26ce8e[_0x593932(0x2c6)], {
                'position': _0x5348fb[_0x593932(0x294)],
                'width': visualConfig[_0x593932(0x1f4) + 'th'] || 0xf1 * 0x26 + -0x2644 + 0x1d * 0x17,
                'left': visualConfig[_0x593932(0x2a3) + 't'] || -0x79 * 0x34 + -0xdd9 + -0x1c3 * -0x16,
                'height': _0x5348fb[_0x593932(0x29b)],
                'bottom': _0x1b44d6['y'],
                'transform': _0x5348fb[_0x593932(0x276)]
            });
            continue;
        case '34':
            _0x174782[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x1ca)];
            continue;
        case '35':
            _0x574e8c[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x2aa)];
            continue;
        case '36':
            var _0x352a8e = document[_0x593932(0x2c7) + _0x593932(0x1ff)](_0x5348fb[_0x593932(0x248)]);
            continue;
        case '37':
            var _0x574e8c = document[_0x593932(0x2ad) + _0x593932(0x2a0)](_0x5348fb[_0x593932(0x258)]);
            continue;
        case '38':
            _0x312508[_0x593932(0x1f0) + 'd'](_0x26ce8e);
            continue;
        case '39':
            Object[_0x593932(0x247)](_0x27b495[_0x593932(0x2c6)], {
                'width': _0x5348fb[_0x593932(0x29b)],
                'position': _0x5348fb[_0x593932(0x294)],
                'bottom': _0x5348fb[_0x593932(0x2bc)](_0x1b44d6['y'], config[_0x593932(0x262) + _0x593932(0x2b9)]),
                'transform': _0x5348fb[_0x593932(0x1e3)]
            });
            continue;
        case '40':
            _0x343ffe[_0x593932(0x1d3)] = _0x5348fb[_0x593932(0x22f)];
            continue;
        }
        break;
    }
}
function renderElements() {
    var _0x4cb1bd = _0x30193a, _0x456c35 = {
            'tjvcd': _0x4cb1bd(0x225) + _0x4cb1bd(0x279) + _0x4cb1bd(0x20d) + _0x4cb1bd(0x1e8) + _0x4cb1bd(0x1ed) + _0x4cb1bd(0x239) + _0x4cb1bd(0x2b4) + _0x4cb1bd(0x251) + _0x4cb1bd(0x23a) + _0x4cb1bd(0x288),
            'VMzzQ': _0x4cb1bd(0x268),
            'GtFxp': _0x4cb1bd(0x260),
            'HsnXz': _0x4cb1bd(0x23b) + _0x4cb1bd(0x228) + _0x4cb1bd(0x1cf),
            'YhgkI': _0x4cb1bd(0x224) + _0x4cb1bd(0x233),
            'uSfaI': _0x4cb1bd(0x221),
            'hlMvc': _0x4cb1bd(0x249),
            'BuPOB': _0x4cb1bd(0x1c4),
            'gKAht': _0x4cb1bd(0x210),
            'WAJsw': _0x4cb1bd(0x214),
            'XlSbn': _0x4cb1bd(0x244) + _0x4cb1bd(0x1f1),
            'nlHzj': _0x4cb1bd(0x1f9) + _0x4cb1bd(0x2b8) + _0x4cb1bd(0x26d),
            'XZwQI': _0x4cb1bd(0x265),
            'YGrni': _0x4cb1bd(0x2a1),
            'MLQlx': _0x4cb1bd(0x27a),
            'dWFBh': _0x4cb1bd(0x254),
            'EVSVc': _0x4cb1bd(0x1c1),
            'wIdKm': _0x4cb1bd(0x209),
            'nTkjV': _0x4cb1bd(0x2b3),
            'VBAmz': function (_0x408242, _0x482c7e) {
                return _0x408242 * _0x482c7e;
            },
            'AWSdQ': function (_0x131839, _0x357f86) {
                return _0x131839 * _0x357f86;
            },
            'UyZNf': _0x4cb1bd(0x21c),
            'ZoIsW': _0x4cb1bd(0x2bd) + _0x4cb1bd(0x2af) + _0x4cb1bd(0x20b),
            'SdvoS': _0x4cb1bd(0x1e2),
            'Hounc': _0x4cb1bd(0x1f5)
        }, _0x2e1ddf = _0x456c35[_0x4cb1bd(0x23d)][_0x4cb1bd(0x2a6)]('|'), _0x3ac35a = 0x23f3 + -0x92c + -0x1ac7;
    while (!![]) {
        switch (_0x2e1ddf[_0x3ac35a++]) {
        case '0':
            Object[_0x4cb1bd(0x247)](_0x3d53e6[_0x4cb1bd(0x2c6)], {
                'position': _0x456c35[_0x4cb1bd(0x264)],
                'fontSize': _0x456c35[_0x4cb1bd(0x1ec)],
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x456c35[_0x4cb1bd(0x1c3)],
                'border': _0x456c35[_0x4cb1bd(0x25a)],
                'borderRadius': _0x456c35[_0x4cb1bd(0x1c9)],
                'zIndex': 0x1
            });
            continue;
        case '1':
            Object[_0x4cb1bd(0x247)](_0x322d03[_0x4cb1bd(0x2c6)], {
                'position': _0x456c35[_0x4cb1bd(0x264)],
                'height': _0x456c35[_0x4cb1bd(0x26a)],
                'width': _0x456c35[_0x4cb1bd(0x26a)],
                'transform': _0x4cb1bd(0x2c3) + visualConfig[_0x4cb1bd(0x1da) + _0x4cb1bd(0x24f) + 't'] + '%)'
            });
            continue;
        case '2':
            var _0xe0008e = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        case '3':
            _0x349577['id'] = _0x456c35[_0x4cb1bd(0x2b7)];
            continue;
        case '4':
            _0x322d03[_0x4cb1bd(0x1f0) + 'd'](_0x349577);
            continue;
        case '5':
            _0x125b74['id'] = _0x456c35[_0x4cb1bd(0x1fb)];
            continue;
        case '6':
            _0x5be135[_0x4cb1bd(0x1f0) + 'd'](_0xe0008e);
            continue;
        case '7':
            _0x322d03[_0x4cb1bd(0x1f0) + 'd'](_0x5be135);
            continue;
        case '8':
            _0xe0008e[_0x4cb1bd(0x1f0) + 'd'](_0x58f476);
            continue;
        case '9':
            _0x58f476[_0x4cb1bd(0x215)] = _0x456c35[_0x4cb1bd(0x259)];
            continue;
        case '10':
            _0x4217f2[_0x4cb1bd(0x1f0) + 'd'](_0x366032);
            continue;
        case '11':
            var _0x125b74 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        case '12':
            _0x125b74[_0x4cb1bd(0x26b)] = _0x456c35[_0x4cb1bd(0x230)];
            continue;
        case '13':
            _0x58f476['id'] = _0x456c35[_0x4cb1bd(0x226)];
            continue;
        case '14':
            _0x322d03['id'] = _0x456c35[_0x4cb1bd(0x283)];
            continue;
        case '15':
            _0x4217f2[_0x4cb1bd(0x1f0) + 'd'](_0x322d03);
            continue;
        case '16':
            _0x4217f2[_0x4cb1bd(0x1f0) + 'd'](_0x3d53e6);
            continue;
        case '17':
            _0x5be135['id'] = _0x456c35[_0x4cb1bd(0x275)];
            continue;
        case '18':
            var _0x58f476 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x255)]);
            continue;
        case '19':
            var _0x3d53e6 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        case '20':
            _0x366032['id'] = 'bg';
            continue;
        case '21':
            Object[_0x4cb1bd(0x247)](_0x4217f2[_0x4cb1bd(0x2c6)], {
                'height': _0x456c35[_0x4cb1bd(0x26a)],
                'position': _0x456c35[_0x4cb1bd(0x1fe)],
                'overflow': _0x456c35[_0x4cb1bd(0x266)],
                'userSelect': _0x456c35[_0x4cb1bd(0x2b1)]
            });
            continue;
        case '22':
            var _0x366032 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        case '23':
            Object[_0x4cb1bd(0x247)](_0xe0008e[_0x4cb1bd(0x2c6)], {
                'position': _0x456c35[_0x4cb1bd(0x264)],
                'bottom': _0x456c35[_0x4cb1bd(0x2a4)](-(0x1 * 0x1d3f + 0x9ff + -0x273e + 0.16), config[_0x4cb1bd(0x1d6)]),
                'top': _0x456c35[_0x4cb1bd(0x2a4)](-(-0x327 + -0x376 + -0x1 * -0x69d + 0.25), config[_0x4cb1bd(0x1d6)]),
                'right': _0x456c35[_0x4cb1bd(0x2a4)](-(0x2 * 0xb85 + 0x133d + 0x89 * -0x4f + 0.25), config[_0x4cb1bd(0x1d6)]),
                'left': _0x456c35[_0x4cb1bd(0x2b6)](-(-0xb40 + 0x1c6 * -0x3 + 0x1092 + 0.25), config[_0x4cb1bd(0x1d6)])
            });
            continue;
        case '24':
            Object[_0x4cb1bd(0x247)](_0x5be135[_0x4cb1bd(0x2c6)], {
                'position': _0x456c35[_0x4cb1bd(0x264)],
                'width': config[_0x4cb1bd(0x1d6)],
                'height': config[_0x4cb1bd(0x1d6)]
            });
            continue;
        case '25':
            Object[_0x4cb1bd(0x247)](_0x58f476[_0x4cb1bd(0x2c6)], {
                'position': _0x456c35[_0x4cb1bd(0x264)],
                'height': _0x456c35[_0x4cb1bd(0x26a)],
                'width': _0x456c35[_0x4cb1bd(0x26a)]
            });
            continue;
        case '26':
            Object[_0x4cb1bd(0x247)](_0x349577[_0x4cb1bd(0x2c6)], { 'height': _0x456c35[_0x4cb1bd(0x26a)] });
            continue;
        case '27':
            document[_0x4cb1bd(0x269)][_0x4cb1bd(0x1f0) + 'd'](_0x4217f2);
            continue;
        case '28':
            _0x4217f2['id'] = _0x456c35[_0x4cb1bd(0x222)];
            continue;
        case '29':
            var _0x349577 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        case '30':
            _0x4217f2[_0x4cb1bd(0x1f0) + 'd'](_0x125b74);
            continue;
        case '31':
            Object[_0x4cb1bd(0x247)](_0x366032[_0x4cb1bd(0x2c6)], {
                'background': _0x456c35[_0x4cb1bd(0x1e4)],
                'backgroundSize': _0x456c35[_0x4cb1bd(0x271)],
                'width': _0x456c35[_0x4cb1bd(0x26a)],
                'height': _0x456c35[_0x4cb1bd(0x26a)],
                'position': _0x456c35[_0x4cb1bd(0x264)],
                'zIndex': -(-0xb1e + -0x26fa + 0x3219)
            });
            continue;
        case '32':
            var _0x5be135 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        case '33':
            var _0x322d03 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        case '34':
            _0x3d53e6['id'] = _0x456c35[_0x4cb1bd(0x202)];
            continue;
        case '35':
            Object[_0x4cb1bd(0x247)](_0x125b74[_0x4cb1bd(0x2c6)], {
                'position': _0x456c35[_0x4cb1bd(0x264)],
                'fontSize': _0x456c35[_0x4cb1bd(0x1ec)],
                'bottom': 0x0,
                'right': 0x0,
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x456c35[_0x4cb1bd(0x1c3)],
                'border': _0x456c35[_0x4cb1bd(0x25a)],
                'borderRadius': _0x456c35[_0x4cb1bd(0x1c9)],
                'zIndex': 0x1
            });
            continue;
        case '36':
            var _0x4217f2 = document[_0x4cb1bd(0x2ad) + _0x4cb1bd(0x2a0)](_0x456c35[_0x4cb1bd(0x206)]);
            continue;
        }
        break;
    }
}
function flap() {
    var _0xc51af7 = _0x30193a;
    state[_0xc51af7(0x20a)] = config[_0xc51af7(0x250)];
}
function updateBird() {
    var _0x76c3ed = _0x30193a, _0x5c6164 = {
            'WZyWC': function (_0x12f71e, _0x167880) {
                return _0x12f71e * _0x167880;
            },
            'AvGka': function (_0x56f61d, _0xaf540) {
                return _0x56f61d + _0xaf540;
            }
        };
    state[_0x76c3ed(0x20a)] -= _0x5c6164[_0x76c3ed(0x2a5)](config[_0x76c3ed(0x22b)], visualConfig[_0x76c3ed(0x2c4)]), state[_0x76c3ed(0x23f)] = _0x5c6164[_0x76c3ed(0x21b)](state[_0x76c3ed(0x23f)], _0x5c6164[_0x76c3ed(0x2a5)](state[_0x76c3ed(0x20a)], visualConfig[_0x76c3ed(0x2c4)]));
}
function randomBetween(_0x1f4306, _0x41d032) {
    var _0x48127c = _0x30193a, _0x442e08 = {
            'yTbTW': function (_0x57ef9e, _0x4a2a96) {
                return _0x57ef9e + _0x4a2a96;
            },
            'CfXQw': function (_0x3a230a, _0x230999) {
                return _0x3a230a * _0x230999;
            },
            'FJdQE': function (_0x5c6607, _0x1f40c3) {
                return _0x5c6607 - _0x1f40c3;
            }
        };
    return _0x442e08[_0x48127c(0x1c7)](_0x1f4306, _0x442e08[_0x48127c(0x1d9)](_0x442e08[_0x48127c(0x25c)](_0x41d032, _0x1f4306), Math[_0x48127c(0x2ab)]()));
}
function maybeMakeNewPipe() {
    var _0x116c54 = _0x30193a, _0x3456bd = {
            'miBLY': _0x116c54(0x2c2) + '0',
            'QDIPP': function (_0x4a87fa, _0x570c7c) {
                return _0x4a87fa < _0x570c7c;
            },
            'neFfJ': function (_0x52732c, _0x33c20d) {
                return _0x52732c(_0x33c20d);
            },
            'brAeE': function (_0x29a8a5, _0x5dd55d) {
                return _0x29a8a5 + _0x5dd55d;
            },
            'mrIyn': function (_0x22f7d8, _0x3de951) {
                return _0x22f7d8 * _0x3de951;
            },
            'yBIau': function (_0x572d83, _0x4a6d3c) {
                return _0x572d83 > _0x4a6d3c;
            },
            'haYMU': function (_0x28c10f, _0xb94e24) {
                return _0x28c10f / _0xb94e24;
            }
        }, _0x768f9e = _0x3456bd[_0x116c54(0x296)][_0x116c54(0x2a6)]('|'), _0x2678ce = -0x235c + -0x1 * 0x14af + 0x1 * 0x380b;
    while (!![]) {
        switch (_0x768f9e[_0x2678ce++]) {
        case '0':
            _0x3456bd[_0x116c54(0x29d)](_0x3b5466, config[_0x116c54(0x261) + _0x116c54(0x208)]) && _0x3456bd[_0x116c54(0x234)](makePipe, _0x3456bd[_0x116c54(0x1e7)](config[_0x116c54(0x261) + _0x116c54(0x208)], _0x3456bd[_0x116c54(0x295)](config[_0x116c54(0x252) + 'gX'], _0x3456bd[_0x116c54(0x234)](randomBetween, ...config[_0x116c54(0x252) + _0x116c54(0x243)]))));
            continue;
        case '1':
            for (var _0xc805f7 of state[_0x116c54(0x27e)]) {
                _0x3b5466 = Math[_0x116c54(0x27c)](_0x3b5466, _0xc805f7['x']), _0x3456bd[_0x116c54(0x28e)](_0xc805f7['x'], -_0x3bbe2b) && _0x133b59[_0x116c54(0x216)](_0xc805f7);
            }
            continue;
        case '2':
            state[_0x116c54(0x27e)] = _0x133b59;
            continue;
        case '3':
            var _0x3bbe2b = _0x3456bd[_0x116c54(0x295)](_0x3456bd[_0x116c54(0x295)](document[_0x116c54(0x269)][_0x116c54(0x22d) + 'h'], 0x1ecb + 0x2ca * -0x4 + -0x13a2 + 0.5), _0x3456bd[_0x116c54(0x2c9)](visualConfig[_0x116c54(0x1da) + _0x116c54(0x24f) + 't'], 0x9f * -0x13 + 0x3f7 + 0x83a));
            continue;
        case '4':
            var _0x133b59 = [];
            continue;
        case '5':
            var _0x3b5466 = -0x4f * -0x6b + -0x1 * 0x207d + 0x4 * -0x22;
            continue;
        }
        break;
    }
}
function _0x2b0f() {
    var _0x1e8520 = [
        'dWFBh',
        'QBHBW',
        'translateY',
        'KoxLq',
        'XlSbn',
        'YhgkI',
        'log',
        'FJdQE',
        'PnLaj',
        'GFcjV',
        '|12|32|33|',
        'xxx-large',
        'pipeReappe',
        'pipeVertic',
        'replaceChi',
        'VMzzQ',
        'bird_img',
        'wIdKm',
        'onkeydown',
        'absolute',
        'body',
        'hlMvc',
        'innerText',
        'dzXAB',
        'to\x20restart',
        'fHjaP',
        'QCohj',
        'e_wrapper',
        'SdvoS',
        './assets/p',
        'oykJP',
        'KHlZS',
        'MLQlx',
        'WXfsV',
        'bottom_pip',
        'wkQhb',
        '7|22|20|31',
        'bird',
        'pipeSpeed',
        'max',
        'offsetHeig',
        'pipes',
        'QQuQQ',
        'bMSIg',
        'sByClassNa',
        'leY(-1)',
        'YGrni',
        'lipped',
        'ukwmb',
        'xXmWN',
        '38|28|15|3',
        '5|12|35|30',
        'MvLDN',
        'top',
        'pipeWidthP',
        'DOMContent',
        '2|27|4|10|',
        'yBIau',
        '|2|26|20|7',
        'addEventLi',
        'dKKyX',
        'HXvaP',
        'pipeHeight',
        'xeCEX',
        'mrIyn',
        'miBLY',
        'sgXlL',
        'NqGGD',
        '4399128BgOdVG',
        'ipe.png',
        'BEHGc',
        '679BkgXLq',
        'QDIPP',
        '313065qudymD',
        '5|1',
        'ent',
        'world',
        '(100%)\x20sca',
        'pipeBoxLef',
        'VBAmz',
        'WZyWC',
        'split',
        '5|1|0|3|7|',
        'deg)',
        'gClientRec',
        'CNYBp',
        'random',
        '34|0|29|14',
        'createElem',
        'rotate(',
        '/backgroun',
        'JizSq',
        'nTkjV',
        'UgMVe',
        'none',
        '|6|18|13|9',
        'KVBlO',
        'AWSdQ',
        'gKAht',
        'lap\x0aclick\x20',
        'alGapPx',
        '10vwWQiX',
        'keyCode',
        'zJOsV',
        'url(assets',
        'bottom',
        'Space',
        'rhgTw',
        'UtZka',
        '4|5|3|1|2|',
        'translate(',
        'tick',
        'ldren',
        'style',
        'getElement',
        '3167276JCRBiZ',
        'haYMU',
        'toFixed',
        'LmSqI',
        'dGGLC',
        'relative',
        'HHOpe',
        'HsnXz',
        'div',
        'Xutdw',
        'ing',
        'yTbTW',
        '62512WTAUBq',
        'uSfaI',
        'cNyPd',
        'npXQg',
        'left',
        'top_pipe_w',
        'rHtYE',
        '0.8)',
        'stener',
        '2532051mFAMjB',
        '(-2px)',
        'className',
        '4|3|0|2|6|',
        'fmaBR',
        'birdSize',
        'mytiS',
        'OUxlu',
        'CfXQw',
        'worldTrans',
        'right',
        'FvRoD',
        'nsEcL',
        'ovFmv',
        'OLlBj',
        '|37|35|17|',
        'npghz',
        '100%\x20100%',
        'YFyrj',
        'ZoIsW',
        'zuADn',
        '1.3',
        'brAeE',
        '1|15|29|3|',
        'VSizZ',
        'bAGVW',
        'key',
        'GtFxp',
        '26|4|32|17',
        '|24|8|13|2',
        'YVariance',
        'appendChil',
        'ird.png',
        '1|3|16|6|5',
        '36|19|40|1',
        'pipeBoxWid',
        'score',
        'pipe_box',
        'PJPMm',
        'keys',
        'space\x20to\x20f',
        'befIm',
        'WAJsw',
        'gameIsRunn',
        'version\x201.',
        'EVSVc',
        'ById',
        '(100%)\x20tra',
        'scaleX(-1)',
        'Hounc',
        '4|5|1|3|2|',
        'code',
        'getBoundin',
        'BuPOB',
        'onclick',
        'arPx',
        'hidden',
        'speed',
        'd.png)',
        '\x20scaleY(-1',
        '|10|33|14|',
        'ggAJg',
        'Loaded',
        'all_pipes',
        'FNpQC',
        'pipes_pair',
        'eKIoL',
        'controls',
        'src',
        'push',
        '5INgEMH',
        'fANye',
        'mPMFu',
        '9|21|23|11',
        'AvGka',
        'game',
        'e_flipped',
        'top_pipe_f',
        'rapper',
        'ibnwJ',
        '10px',
        'UyZNf',
        'kPVtv',
        '2px\x20solid\x20',
        '36|28|21|2',
        'XZwQI',
        'nslateY(2p',
        '255,\x20255,\x20',
        'drZyA',
        'QQnOQ',
        'gravity',
        'rotateThre',
        'offsetWidt',
        'mhvfM',
        'GQzOR',
        'nlHzj',
        'SmLBO',
        'rGfOI',
        'black',
        'neFfJ',
        'shold',
        'rQQha',
        'top_pipe',
        'HyXOQ',
        '|24|7|2|23',
        '4|0|16|11|',
        'rgba(255,\x20',
        'yWIhW',
        'tjvcd',
        'ZIKtD',
        'altitude',
        '2|4|6',
        '1404936vBnehJ',
        'transform',
        'gXVariance',
        './assets/b',
        'Ovgrc',
        '469101XDjNhR',
        'assign',
        'cPraR',
        '100%',
        '(100%)',
        'atan',
        'WPQdi',
        'maxRotateD',
        '|39|25|30|',
        'latePercen',
        'power',
        '|25|8|19|3',
        'pipeSpacin',
        'QIgvy',
        'img'
    ];
    _0x2b0f = function () {
        return _0x1e8520;
    };
    return _0x2b0f();
}
var vars = Object[_0x30193a(0x1f8)]({
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
    'maybeMakeNewPipe': maybeMakeNewPipe,
    'version': _0x30193a(0x1e6)
});
(function () {
    var _0x517590 = _0x30193a, _0x27300b = {
            'rHtYE': _0x517590(0x28c) + _0x517590(0x20f),
            'eKIoL': function (_0x4360fa) {
                return _0x4360fa();
            }
        };
    function _0x6db6bd() {
        var _0x323b17 = _0x517590;
        document[_0x323b17(0x290) + _0x323b17(0x1d0)](_0x27300b[_0x323b17(0x1ce)], ready);
    }
    _0x27300b[_0x517590(0x213)](_0x6db6bd);
}());