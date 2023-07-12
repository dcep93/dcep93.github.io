var _0x5cd134 = _0x1b8b;
(function (_0x19b327, _0x1a72fe) {
    var _0x331f49 = _0x1b8b, _0x516475 = _0x19b327();
    while (!![]) {
        try {
            var _0xe6ea26 = parseInt(_0x331f49(0x10f)) / (-0x139d * -0x1 + 0x606 + -0x22 * 0xc1) * (-parseInt(_0x331f49(0x104)) / (0x15 * -0x1a6 + -0x4 * -0x699 + -0x20f * -0x4)) + -parseInt(_0x331f49(0x1ac)) / (-0xa1d * 0x1 + -0x11f9 + 0x1c19 * 0x1) * (parseInt(_0x331f49(0x14b)) / (0x733 * 0x2 + 0xb1 * -0x5 + -0x1 * 0xaed)) + -parseInt(_0x331f49(0x1d4)) / (-0xd * -0x29 + -0x19b9 + -0x7e3 * -0x3) + -parseInt(_0x331f49(0x1f9)) / (0x1a17 + -0x37 * -0x2 + -0x1a7f) * (parseInt(_0x331f49(0xf8)) / (-0x1bdd * -0x1 + 0x1e23 + -0x39f9)) + parseInt(_0x331f49(0x138)) / (0x3df * -0x1 + -0x233b + 0x2722) + -parseInt(_0x331f49(0xee)) / (0xa61 + 0x5c + -0xab4) * (parseInt(_0x331f49(0x199)) / (0x1f9d + -0x17e7 + 0x2 * -0x3d6)) + -parseInt(_0x331f49(0x127)) / (0x5 * 0x6e1 + -0x2e * 0x4 + -0x23 * 0xf6) * (-parseInt(_0x331f49(0x151)) / (-0xa * -0x371 + 0x35d + -0xd * 0x2e7));
            if (_0xe6ea26 === _0x1a72fe)
                break;
            else
                _0x516475['push'](_0x516475['shift']());
        } catch (_0x24647e) {
            _0x516475['push'](_0x516475['shift']());
        }
    }
}(_0x405e, -0xa303 * -0x2 + -0xbfe4e * -0x1 + 0x1 * -0x14e8f), console[_0x5cd134(0x167)](_0x5cd134(0x1c6) + '3'));
var config = {
        'gravity': 0x514,
        'power': 0x1f4,
        'pipeSpeed': 0x190,
        'pipeVerticalGapPx': 0x78,
        'birdSize': 0x28,
        'pipeReappearPx': 0x3e8,
        'pipeSpacingX': 0x320,
        'pipeSpacingXVariance': [
            -0x257e + -0x1 * -0x235b + -0x1 * -0x223 + 0.7,
            -0xc3e + 0x4 * 0x5b8 + -0x551 * 0x2 + 0.9
        ],
        'pipeHeightYVariance': [
            -0x1b74 + -0x1cfa + -0x386e * -0x1 + 0.2,
            -0x1dfc + 0x64 * 0x4c + -0x2 * -0x26 + 0.7
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
    var _0x11dde1 = _0x5cd134, _0xc1409 = {
            'uLYcQ': _0x11dde1(0xfa) + _0x11dde1(0x1e5),
            'dYWGS': function (_0x3dbc73) {
                return _0x3dbc73();
            },
            'zvjGi': function (_0x5a9abf, _0x554626, _0x4bdb3a) {
                return _0x5a9abf(_0x554626, _0x4bdb3a);
            },
            'aGTSK': function (_0x237744, _0x407696) {
                return _0x237744 * _0x407696;
            },
            'kVOjk': function (_0x23bd1c) {
                return _0x23bd1c();
            },
            'JoMhU': function (_0x5d7783) {
                return _0x5d7783();
            },
            'PCVzB': function (_0x22a75a, _0x149b62) {
                return _0x22a75a == _0x149b62;
            },
            'zujei': function (_0x22149b, _0x475e9f) {
                return _0x22149b == _0x475e9f;
            },
            'LtCdz': _0x11dde1(0x105)
        }, _0x1cab8d = _0xc1409[_0x11dde1(0x1b1)][_0x11dde1(0x112)]('|'), _0x563fab = 0x9b8 + 0x11fb + 0x7 * -0x3f5;
    while (!![]) {
        switch (_0x1cab8d[_0x563fab++]) {
        case '0':
            _0xc1409[_0x11dde1(0x16f)](renderElements);
            continue;
        case '1':
            _0xc1409[_0x11dde1(0x1f0)](setInterval, () => tick(), _0xc1409[_0x11dde1(0x130)](visualConfig[_0x11dde1(0x1bd)], 0x6ec * 0x1 + -0x9b4 + 0x10 * 0x6b));
            continue;
        case '2':
            document[_0x11dde1(0x15f)][_0x11dde1(0x155)] = () => startGame();
            continue;
        case '3':
            _0xc1409[_0x11dde1(0x16c)](draw);
            continue;
        case '4':
            _0xc1409[_0x11dde1(0x1de)](startGame);
            continue;
        case '5':
            var _0x5e2685 = {
                'EPVQl': function (_0x27154e, _0x2a7151) {
                    var _0xa5ec18 = _0x11dde1;
                    return _0xc1409[_0xa5ec18(0x153)](_0x27154e, _0x2a7151);
                },
                'ieANd': function (_0x235baa, _0x2ce9cb) {
                    var _0x1ee4fd = _0x11dde1;
                    return _0xc1409[_0x1ee4fd(0x1d0)](_0x235baa, _0x2ce9cb);
                },
                'dafiu': _0xc1409[_0x11dde1(0x1cb)],
                'ylOdM': function (_0xf0c057, _0x3e6575) {
                    var _0x19bf68 = _0x11dde1;
                    return _0xc1409[_0x19bf68(0x153)](_0xf0c057, _0x3e6575);
                },
                'jaUEv': function (_0x4c8167) {
                    var _0x5986c9 = _0x11dde1;
                    return _0xc1409[_0x5986c9(0x1de)](_0x4c8167);
                }
            };
            continue;
        case '6':
            document[_0x11dde1(0x15f)][_0x11dde1(0x1e9)] = function (_0xd2bcb4) {
                var _0x1899e7 = _0x11dde1;
                if ((_0x5e2685[_0x1899e7(0x135)](_0xd2bcb4[_0x1899e7(0xef)], '\x20') || _0x5e2685[_0x1899e7(0x1e2)](_0xd2bcb4[_0x1899e7(0x1f6)], _0x5e2685[_0x1899e7(0x158)]) || _0x5e2685[_0x1899e7(0x187)](_0xd2bcb4[_0x1899e7(0x19e)], 0x767 + 0x6 * -0x45b + 0x12db)) && state[_0x1899e7(0x143) + _0x1899e7(0xe9)])
                    _0x5e2685[_0x1899e7(0x198)](flap);
            };
            continue;
        }
        break;
    }
}
function tick() {
    var _0x5976f6 = _0x5cd134, _0x2d929c = {
            'sIyjV': _0x5976f6(0x16a) + _0x5976f6(0x1db),
            'lcIno': function (_0x495770, _0x254e8d) {
                return _0x495770 * _0x254e8d;
            },
            'iXxHn': function (_0x41c373, _0x8de8d) {
                return _0x41c373 < _0x8de8d;
            },
            'AqVVa': function (_0x413a50) {
                return _0x413a50();
            },
            'sSwhW': function (_0xe5c3f6) {
                return _0xe5c3f6();
            },
            'aQybr': function (_0x3e1065) {
                return _0x3e1065();
            },
            'TxjpN': function (_0x2a0dac) {
                return _0x2a0dac();
            },
            'GKyVC': function (_0x59bc22) {
                return _0x59bc22();
            }
        }, _0x2b796b = _0x2d929c[_0x5976f6(0x1d9)][_0x5976f6(0x112)]('|'), _0x396f1a = 0x23c1 * 0x1 + 0x16aa + -0x3a6b;
    while (!![]) {
        switch (_0x2b796b[_0x396f1a++]) {
        case '0':
            state[_0x5976f6(0x180)] += _0x2d929c[_0x5976f6(0x108)](visualConfig[_0x5976f6(0x1bd)], -0x1f49 + -0x1f85 + -0x7db * -0x8);
            continue;
        case '1':
            if (_0x2d929c[_0x5976f6(0x13e)](state[_0x5976f6(0x13b)], 0xb * -0x157 + 0x1803 * -0x1 + 0x26c0)) {
                _0x2d929c[_0x5976f6(0x1e8)](endGame);
                return;
            }
            continue;
        case '2':
            _0x2d929c[_0x5976f6(0x17e)](updatePipes);
            continue;
        case '3':
            if (_0x2d929c[_0x5976f6(0x1b8)](isHittingAPipe)) {
                _0x2d929c[_0x5976f6(0x17e)](endGame);
                return;
            }
            continue;
        case '4':
            if (!state[_0x5976f6(0x143) + _0x5976f6(0xe9)])
                return;
            continue;
        case '5':
            _0x2d929c[_0x5976f6(0xfd)](maybeMakeNewPipe);
            continue;
        case '6':
            _0x2d929c[_0x5976f6(0x18b)](draw);
            continue;
        case '7':
            _0x2d929c[_0x5976f6(0x18b)](updateBird);
            continue;
        }
        break;
    }
}
function startGame() {
    var _0x581063 = _0x5cd134, _0x7e0834 = {
            'UbImF': _0x581063(0x1cc) + '5',
            'wRItf': function (_0x427ca9) {
                return _0x427ca9();
            }
        }, _0x2b3be0 = _0x7e0834[_0x581063(0x16d)][_0x581063(0x112)]('|'), _0x398b2f = 0x35 * -0x60 + 0x3b * 0x62 + -0x2b6;
    while (!![]) {
        switch (_0x2b3be0[_0x398b2f++]) {
        case '0':
            _0x7e0834[_0x581063(0x1e6)](makeFirstPipe);
            continue;
        case '1':
            state[_0x581063(0x13b)] = 0x3 * -0x277 + -0x9 * -0x33f + 0x15 * -0x10a;
            continue;
        case '2':
            _0x7e0834[_0x581063(0x1e6)](flap);
            continue;
        case '3':
            state[_0x581063(0x1f5)] = [];
            continue;
        case '4':
            state[_0x581063(0x180)] = 0x178f + -0x1ed9 + 0x74a;
            continue;
        case '5':
            state[_0x581063(0x143) + _0x581063(0xe9)] = !![];
            continue;
        }
        break;
    }
}
function drawBird() {
    var _0x1422d1 = _0x5cd134, _0x56bb21 = {
            'RxeXi': _0x1422d1(0x1d1),
            'HkGQM': _0x1422d1(0x170),
            'cUHAR': function (_0x34da42) {
                return _0x34da42();
            }
        };
    document[_0x1422d1(0x1b0) + _0x1422d1(0x1c3)](_0x56bb21[_0x1422d1(0x18f)])[_0x1422d1(0x1f1)][_0x1422d1(0x154)] = state[_0x1422d1(0x13b)], document[_0x1422d1(0x1b0) + _0x1422d1(0x1c3)](_0x56bb21[_0x1422d1(0xf1)])[_0x1422d1(0x1f1)][_0x1422d1(0x182)] = _0x1422d1(0x1c4) + _0x56bb21[_0x1422d1(0x106)](getRotate) + _0x1422d1(0x1b2);
}
function _0x1b8b(_0x2fa9a7, _0x520e92) {
    var _0x1e41bd = _0x405e();
    return _0x1b8b = function (_0x526a38, _0x506ec5) {
        _0x526a38 = _0x526a38 - (-0x10 * -0x1e + 0x56 * 0x6 + -0x2fc);
        var _0x4705cd = _0x1e41bd[_0x526a38];
        return _0x4705cd;
    }, _0x1b8b(_0x2fa9a7, _0x520e92);
}
function drawScore() {
    var _0x58648e = _0x5cd134, _0x1ddf5c = { 'HhQOg': _0x58648e(0x180) }, _0x5f3754 = document[_0x58648e(0x1b0) + _0x58648e(0x1c3)](_0x1ddf5c[_0x58648e(0x160)]);
    _0x5f3754[_0x58648e(0x1c9)] = state[_0x58648e(0x180)][_0x58648e(0x1c2)](0x1ee3 * -0x1 + -0x3 * -0x63d + 0x2 * 0x617);
}
function drawPipes() {
    var _0x401def = _0x5cd134, _0x4cc5af = {
            'npVnV': _0x401def(0x1ed),
            'IuMrK': function (_0x2be0be, _0x3a15f9) {
                return _0x2be0be(_0x3a15f9);
            }
        }, _0x2d522d = document[_0x401def(0x1b0) + _0x401def(0x1c3)](_0x4cc5af[_0x401def(0x10d)]);
    _0x2d522d[_0x401def(0x107) + _0x401def(0x14d)]();
    for (var _0x342343 of state[_0x401def(0x1f5)]) {
        _0x4cc5af[_0x401def(0x12a)](drawPipe, _0x342343);
    }
}
function draw() {
    var _0x24562f = _0x5cd134, _0x36214f = {
            'YPCVn': function (_0x4c03d1) {
                return _0x4c03d1();
            },
            'dHndA': function (_0x195122) {
                return _0x195122();
            }
        };
    _0x36214f[_0x24562f(0x172)](drawBird), _0x36214f[_0x24562f(0x172)](drawScore), _0x36214f[_0x24562f(0x15a)](drawPipes);
}
function endGame() {
    var _0x5d4cfd = _0x5cd134;
    state[_0x5d4cfd(0x143) + _0x5d4cfd(0xe9)] = ![];
}
function updatePipes() {
    var _0x3c2d2a = _0x5cd134, _0x44c1f0 = {
            'ckpdg': function (_0x7c10d4, _0x5ea49f) {
                return _0x7c10d4 * _0x5ea49f;
            }
        };
    for (var _0x259e71 of state[_0x3c2d2a(0x1f5)]) {
        _0x259e71['x'] -= _0x44c1f0[_0x3c2d2a(0x1a8)](visualConfig[_0x3c2d2a(0x1bd)], config[_0x3c2d2a(0x18a)]);
    }
}
function getRotate() {
    var _0x1551ec = _0x5cd134, _0x47e6ce = {
            'mYZMg': function (_0x166f5b, _0x5dc115) {
                return _0x166f5b / _0x5dc115;
            },
            'ofGIZ': function (_0x4686a3, _0x4d0466) {
                return _0x4686a3 * _0x4d0466;
            },
            'BlgPg': function (_0xd91b87, _0x39f106) {
                return _0xd91b87 / _0x39f106;
            }
        };
    return _0x47e6ce[_0x1551ec(0x195)](_0x47e6ce[_0x1551ec(0x183)](-visualConfig[_0x1551ec(0x197) + 'eg'], Math[_0x1551ec(0x1c5)](_0x47e6ce[_0x1551ec(0x195)](state[_0x1551ec(0x1d8)], visualConfig[_0x1551ec(0x11b) + _0x1551ec(0x1bc)]))), _0x47e6ce[_0x1551ec(0x1f4)](Math['PI'], 0x2f3 * -0x7 + -0x4 * -0x9f + 0x1 * 0x122b));
}
function makeFirstPipe() {
    var _0x4b33a7 = _0x5cd134, _0x59416a = {
            'VWTqs': function (_0x53d7fc, _0x525847) {
                return _0x53d7fc(_0x525847);
            },
            'OEyWu': function (_0x444790, _0x554ca8) {
                return _0x444790 - _0x554ca8;
            },
            'Ivval': function (_0x34c651, _0x31bc04) {
                return _0x34c651 * _0x31bc04;
            },
            'TBVmW': function (_0x4cc255, _0x2fd75b) {
                return _0x4cc255 / _0x2fd75b;
            }
        };
    _0x59416a[_0x4b33a7(0xf3)](makePipe, _0x59416a[_0x4b33a7(0x1ab)](_0x59416a[_0x4b33a7(0x15b)](document[_0x4b33a7(0x15f)][_0x4b33a7(0x149) + 'h'], _0x59416a[_0x4b33a7(0x1ab)](0xa3b + -0x11a6 + -0x14 * -0x5f, _0x59416a[_0x4b33a7(0x1e1)](visualConfig[_0x4b33a7(0x1eb) + _0x4b33a7(0x1f7) + 't'], 0x1e5d * 0x1 + -0x1493 + -0x6 * 0x191))), _0x59416a[_0x4b33a7(0x15b)](-0x1 * -0x1d5d + 0xfe3 + 0x2 * -0x16a0 + 0.5, visualConfig[_0x4b33a7(0x1b4) + 'x'])));
}
function makePipe(_0x121304) {
    var _0x12b2d0 = _0x5cd134, _0x45393f = {
            'LjEYm': function (_0x451779, _0x41a8dd) {
                return _0x451779 * _0x41a8dd;
            },
            'QQLAZ': function (_0x3a9ddb, ..._0x2dd8ca) {
                return _0x3a9ddb(..._0x2dd8ca);
            }
        };
    state[_0x12b2d0(0x1f5)][_0x12b2d0(0x163)]({
        'x': _0x121304,
        'y': _0x45393f[_0x12b2d0(0x192)](document[_0x12b2d0(0x15f)][_0x12b2d0(0x1d7) + 'ht'], _0x45393f[_0x12b2d0(0x10e)](randomBetween, ...config[_0x12b2d0(0x1f8) + _0x12b2d0(0x13a)]))
    });
}
function isHittingAPipe() {
    var _0x276dac = _0x5cd134, _0x2bdbaa = {
            'cMTBI': _0x276dac(0x1d1),
            'cRicn': _0x276dac(0x129),
            'AOxsT': function (_0x565442, _0x45573e) {
                return _0x565442 <= _0x45573e;
            }
        }, _0x3e189d = document[_0x276dac(0x1b0) + _0x276dac(0x1c3)](_0x2bdbaa[_0x276dac(0x115)])[_0x276dac(0x17b) + _0x276dac(0x1ce) + 't'](), _0x4e508d = document[_0x276dac(0x1b0) + _0x276dac(0x116) + 'me'](_0x2bdbaa[_0x276dac(0x11c)]);
    for (var _0x33aab4 of _0x4e508d) {
        var _0xb3a021 = _0x33aab4[_0x276dac(0x17b) + _0x276dac(0x1ce) + 't']();
        if (_0x2bdbaa[_0x276dac(0x174)](_0x3e189d[_0x276dac(0x126)], _0xb3a021[_0x276dac(0x15c)]) && _0x2bdbaa[_0x276dac(0x174)](_0xb3a021[_0x276dac(0x126)], _0x3e189d[_0x276dac(0x15c)]) && _0x2bdbaa[_0x276dac(0x174)](_0x3e189d[_0x276dac(0x157)], _0xb3a021[_0x276dac(0x154)]) && _0x2bdbaa[_0x276dac(0x174)](_0xb3a021[_0x276dac(0x157)], _0x3e189d[_0x276dac(0x154)]))
            return !![];
    }
    return ![];
}
function drawPipe(_0x33786f) {
    var _0x1347df = _0x5cd134, _0x54ac56 = {
            'WgRrI': _0x1347df(0x133) + _0x1347df(0x176) + _0x1347df(0x1f2) + _0x1347df(0x1a5) + _0x1347df(0x19b) + _0x1347df(0x1a4) + _0x1347df(0xf0) + _0x1347df(0xfb) + _0x1347df(0x109) + _0x1347df(0x139) + _0x1347df(0x1a0) + '23',
            'vcuAd': _0x1347df(0x110),
            'eUycQ': _0x1347df(0x1b9),
            'ZvKPc': _0x1347df(0xf7) + _0x1347df(0x10a),
            'WwEYM': _0x1347df(0x1cf),
            'UwYJv': _0x1347df(0x19d),
            'dtxbo': _0x1347df(0x1e7) + _0x1347df(0x19f) + _0x1347df(0x14c),
            'bJmaP': _0x1347df(0x1e4) + _0x1347df(0x1aa),
            'ZKRhe': _0x1347df(0x1e4) + _0x1347df(0x11e),
            'EVhsU': _0x1347df(0x1dc) + _0x1347df(0x1dd),
            'kehIB': _0x1347df(0x11f) + _0x1347df(0x1ba),
            'otrjv': _0x1347df(0x1e7) + _0x1347df(0x125) + _0x1347df(0x175) + 'x)',
            'BldvL': function (_0x51539f, _0x28386a) {
                return _0x51539f + _0x28386a;
            },
            'ARzvE': _0x1347df(0x1e7) + _0x1347df(0x118),
            'oxVVD': _0x1347df(0x1e4) + 'e',
            'YgtkS': _0x1347df(0x1ed),
            'lOeYk': _0x1347df(0x148),
            'hnXLr': function (_0x3233af, _0x2fb296) {
                return _0x3233af + _0x2fb296;
            },
            'LUFVt': _0x1347df(0x1d6) + _0x1347df(0xf9) + ')',
            'LVLlf': _0x1347df(0x129),
            'pvxvQ': _0x1347df(0x1e7) + _0x1347df(0x128),
            'GxLAD': _0x1347df(0x159),
            'GtcTI': function (_0x51f16e, _0x39bdd6) {
                return _0x51f16e + _0x39bdd6;
            },
            'rrLmI': _0x1347df(0x1d6)
        }, _0x1e6a45 = _0x54ac56[_0x1347df(0x186)][_0x1347df(0x112)]('|'), _0x1c5b1a = 0x2 * 0x53 + -0x1222 + 0x117c;
    while (!![]) {
        switch (_0x1e6a45[_0x1c5b1a++]) {
        case '0':
            _0x1494b5[_0x1347df(0x191) + 'd'](_0x37cd24);
            continue;
        case '1':
            var _0x51b73a = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0x194)]);
            continue;
        case '2':
            var _0x37cd24 = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0xf6)]);
            continue;
        case '3':
            _0xbedc4d[_0x1347df(0x191) + 'd'](_0x51b73a);
            continue;
        case '4':
            var _0x4394ad = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0xf6)]);
            continue;
        case '5':
            _0x1494b5[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x1a3)];
            continue;
        case '6':
            _0x27c739[_0x1347df(0x191) + 'd'](_0x69dd6e);
            continue;
        case '7':
            var _0xbedc4d = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0x194)]);
            continue;
        case '8':
            Object[_0x1347df(0x147)](_0x1a9e00[_0x1347df(0x1f1)], {
                'width': _0x54ac56[_0x1347df(0x181)],
                'position': _0x54ac56[_0x1347df(0x13d)],
                'bottom': _0x33786f['y'],
                'transform': _0x54ac56[_0x1347df(0x1bf)],
                'zIndex': -(-0x95 + -0x30 * 0xa0 + 0x1e96),
                'height': _0x54ac56[_0x1347df(0x181)]
            });
            continue;
        case '9':
            _0x1a9e00[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x173)];
            continue;
        case '10':
            _0x1494b5[_0x1347df(0x191) + 'd'](_0x4394ad);
            continue;
        case '11':
            var _0x1a9e00 = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0xf6)]);
            continue;
        case '12':
            _0xbedc4d[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x18c)];
            continue;
        case '13':
            Object[_0x1347df(0x147)](_0x69dd6e[_0x1347df(0x1f1)], {
                'left': _0x33786f['x'],
                'position': _0x54ac56[_0x1347df(0x13d)],
                'height': _0x54ac56[_0x1347df(0x181)],
                'width': visualConfig[_0x1347df(0x1b4) + 'x']
            });
            continue;
        case '14':
            _0x69dd6e[_0x1347df(0x191) + 'd'](_0xbedc4d);
            continue;
        case '15':
            _0x4394ad[_0x1347df(0x1ee)] = _0x54ac56[_0x1347df(0x1a7)];
            continue;
        case '16':
            Object[_0x1347df(0x147)](_0xbedc4d[_0x1347df(0x1f1)], {
                'position': _0x54ac56[_0x1347df(0x13d)],
                'width': _0x54ac56[_0x1347df(0x181)],
                'height': _0x54ac56[_0x1347df(0x181)]
            });
            continue;
        case '17':
            _0x1a9e00[_0x1347df(0x1ee)] = _0x54ac56[_0x1347df(0x1a7)];
            continue;
        case '18':
            var _0x42c566 = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0x194)]);
            continue;
        case '19':
            _0x37cd24[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x131)];
            continue;
        case '20':
            Object[_0x1347df(0x147)](_0x51b73a[_0x1347df(0x1f1)], {
                'position': _0x54ac56[_0x1347df(0x13d)],
                'width': visualConfig[_0x1347df(0x1af) + 'th'] || 0xa2d + -0x16 * 0xda + 0x8ac,
                'left': visualConfig[_0x1347df(0x17f) + 't'] || -0xae3 * 0x2 + -0x80e + 0x7 * 0x44f,
                'height': _0x54ac56[_0x1347df(0x181)],
                'bottom': _0x33786f['y'],
                'transform': _0x54ac56[_0x1347df(0x1ef)]
            });
            continue;
        case '21':
            Object[_0x1347df(0x147)](_0x42c566[_0x1347df(0x1f1)], {
                'position': _0x54ac56[_0x1347df(0x13d)],
                'width': visualConfig[_0x1347df(0x1af) + 'th'],
                'left': visualConfig[_0x1347df(0x17f) + 't'],
                'height': _0x54ac56[_0x1347df(0x181)],
                'bottom': _0x54ac56[_0x1347df(0x18d)](_0x33786f['y'], config[_0x1347df(0x177) + _0x1347df(0xea)]),
                'transform': _0x54ac56[_0x1347df(0x12b)]
            });
            continue;
        case '22':
            _0x2553a7[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x1f3)];
            continue;
        case '23':
            _0x1494b5[_0x1347df(0x191) + 'd'](_0x42c566);
            continue;
        case '24':
            var _0x27c739 = document[_0x1347df(0x1b0) + _0x1347df(0x1c3)](_0x54ac56[_0x1347df(0x134)]);
            continue;
        case '25':
            var _0x2553a7 = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0xf6)]);
            continue;
        case '26':
            _0x4394ad[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x1b7)];
            continue;
        case '27':
            _0x69dd6e[_0x1347df(0x191) + 'd'](_0x1494b5);
            continue;
        case '28':
            Object[_0x1347df(0x147)](_0x4394ad[_0x1347df(0x1f1)], {
                'width': _0x54ac56[_0x1347df(0x181)],
                'position': _0x54ac56[_0x1347df(0x13d)],
                'bottom': _0x54ac56[_0x1347df(0x15d)](_0x33786f['y'], config[_0x1347df(0x177) + _0x1347df(0xea)]),
                'transform': _0x54ac56[_0x1347df(0x189)]
            });
            continue;
        case '29':
            var _0x1494b5 = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0x194)]);
            continue;
        case '30':
            _0x42c566[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x184)];
            continue;
        case '31':
            _0xbedc4d[_0x1347df(0x191) + 'd'](_0x1a9e00);
            continue;
        case '32':
            Object[_0x1347df(0x147)](_0x2553a7[_0x1347df(0x1f1)], {
                'width': _0x54ac56[_0x1347df(0x181)],
                'position': _0x54ac56[_0x1347df(0x13d)],
                'bottom': _0x33786f['y'],
                'transform': _0x54ac56[_0x1347df(0x1da)]
            });
            continue;
        case '33':
            _0x51b73a[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x184)];
            continue;
        case '34':
            var _0x69dd6e = document[_0x1347df(0x111) + _0x1347df(0x1b3)](_0x54ac56[_0x1347df(0x194)]);
            continue;
        case '35':
            Object[_0x1347df(0x147)](_0x1494b5[_0x1347df(0x1f1)], {
                'position': _0x54ac56[_0x1347df(0x13d)],
                'width': _0x54ac56[_0x1347df(0x181)],
                'height': _0x54ac56[_0x1347df(0x181)]
            });
            continue;
        case '36':
            _0x69dd6e[_0x1347df(0x17a)] = _0x54ac56[_0x1347df(0x196)];
            continue;
        case '37':
            _0xbedc4d[_0x1347df(0x191) + 'd'](_0x2553a7);
            continue;
        case '38':
            _0x2553a7[_0x1347df(0x1ee)] = _0x54ac56[_0x1347df(0x1a7)];
            continue;
        case '39':
            _0x37cd24[_0x1347df(0x1ee)] = _0x54ac56[_0x1347df(0x1a7)];
            continue;
        case '40':
            Object[_0x1347df(0x147)](_0x37cd24[_0x1347df(0x1f1)], {
                'width': _0x54ac56[_0x1347df(0x181)],
                'position': _0x54ac56[_0x1347df(0x13d)],
                'bottom': _0x54ac56[_0x1347df(0xf4)](_0x33786f['y'], config[_0x1347df(0x177) + _0x1347df(0xea)]),
                'transform': _0x54ac56[_0x1347df(0xff)],
                'zIndex': -(-0x138b * -0x1 + -0x1 * 0x1278 + -0x112),
                'height': _0x54ac56[_0x1347df(0x181)]
            });
            continue;
        }
        break;
    }
}
function renderElements() {
    var _0x1b5581 = _0x5cd134, _0x517834 = {
            'EsoEl': _0x1b5581(0x156) + _0x1b5581(0x11d) + _0x1b5581(0x150) + _0x1b5581(0x13c) + _0x1b5581(0x1be) + _0x1b5581(0x142) + _0x1b5581(0x101) + _0x1b5581(0x168) + _0x1b5581(0x162) + _0x1b5581(0xe8),
            'pYbYD': _0x1b5581(0x19d),
            'PCNjI': _0x1b5581(0x170),
            'dMCwQ': function (_0xe46070, _0x15e9ba) {
                return _0xe46070 * _0x15e9ba;
            },
            'bQlmK': function (_0x5af182, _0x1e55b7) {
                return _0x5af182 * _0x1e55b7;
            },
            'lRppu': function (_0x37fc40, _0x549f2b) {
                return _0x37fc40 * _0x549f2b;
            },
            'zkVHb': _0x1b5581(0x110),
            'OJWvD': _0x1b5581(0x12c),
            'pVnNG': _0x1b5581(0x124) + _0x1b5581(0xec) + _0x1b5581(0x165),
            'XmEdx': _0x1b5581(0x1cd) + _0x1b5581(0x113),
            'AqSTd': _0x1b5581(0x1d3),
            'fVNmd': _0x1b5581(0x1d1),
            'tWbZC': _0x1b5581(0x1cf),
            'hdVWE': _0x1b5581(0x141) + _0x1b5581(0x190),
            'KCXos': _0x1b5581(0x136) + _0x1b5581(0x193) + _0x1b5581(0x12d),
            'IOKCh': _0x1b5581(0x1ca),
            'lBFyv': _0x1b5581(0x1ed),
            'sDTKj': _0x1b5581(0x1b9),
            'MIPPf': _0x1b5581(0x171),
            'WhdVA': _0x1b5581(0x180),
            'mjXAm': _0x1b5581(0x1c0),
            'zIueG': _0x1b5581(0x1bb) + _0x1b5581(0x1ae) + _0x1b5581(0x19c),
            'zwvSV': _0x1b5581(0x14e),
            'tGQFV': _0x1b5581(0x114),
            'zcgKU': _0x1b5581(0x1e3),
            'PTGjM': _0x1b5581(0xeb)
        }, _0x20df0e = _0x517834[_0x1b5581(0x1ec)][_0x1b5581(0x112)]('|'), _0x40b535 = 0xd6c * 0x2 + -0x170b + -0x3cd;
    while (!![]) {
        switch (_0x20df0e[_0x40b535++]) {
        case '0':
            Object[_0x1b5581(0x147)](_0x4b1f5c[_0x1b5581(0x1f1)], {
                'position': _0x517834[_0x1b5581(0x123)],
                'width': config[_0x1b5581(0x145)],
                'height': config[_0x1b5581(0x145)]
            });
            continue;
        case '1':
            _0x452a63[_0x1b5581(0x191) + 'd'](_0x5d17c3);
            continue;
        case '2':
            _0x22b1b9['id'] = _0x517834[_0x1b5581(0x1e0)];
            continue;
        case '3':
            Object[_0x1b5581(0x147)](_0xfe6e6a[_0x1b5581(0x1f1)], {
                'position': _0x517834[_0x1b5581(0x123)],
                'bottom': _0x517834[_0x1b5581(0x102)](-(0x43 * 0x31 + -0x17fc + 0xb29 * 0x1 + 0.16), config[_0x1b5581(0x145)]),
                'top': _0x517834[_0x1b5581(0x144)](-(-0x2b * -0x95 + 0x3ad + -0x1cb4 + 0.25), config[_0x1b5581(0x145)]),
                'right': _0x517834[_0x1b5581(0x144)](-(0x21f5 * -0x1 + -0x56 * -0x1 + 0x219f + 0.25), config[_0x1b5581(0x145)]),
                'left': _0x517834[_0x1b5581(0x17c)](-(0x19b6 + -0xe63 + 0x1 * -0xb53 + 0.25), config[_0x1b5581(0x145)])
            });
            continue;
        case '4':
            var _0x131c03 = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '5':
            var _0x16f4a9 = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '6':
            var _0x340dc8 = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '7':
            _0x452a63[_0x1b5581(0x191) + 'd'](_0x16f4a9);
            continue;
        case '8':
            var _0x2e7e24 = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '9':
            var _0x452a63 = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '10':
            Object[_0x1b5581(0x147)](_0x131c03[_0x1b5581(0x1f1)], {
                'position': _0x517834[_0x1b5581(0x123)],
                'fontSize': _0x517834[_0x1b5581(0x164)],
                'bottom': 0x0,
                'right': 0x0,
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x517834[_0x1b5581(0x132)],
                'border': _0x517834[_0x1b5581(0x11a)],
                'borderRadius': _0x517834[_0x1b5581(0x178)],
                'zIndex': 0x1
            });
            continue;
        case '11':
            _0x16f4a9[_0x1b5581(0x191) + 'd'](_0x2e7e24);
            continue;
        case '12':
            _0x452a63[_0x1b5581(0x191) + 'd'](_0x340dc8);
            continue;
        case '13':
            _0x4b1f5c[_0x1b5581(0x191) + 'd'](_0xfe6e6a);
            continue;
        case '14':
            Object[_0x1b5581(0x147)](_0x5d17c3[_0x1b5581(0x1f1)], {
                'position': _0x517834[_0x1b5581(0x123)],
                'fontSize': _0x517834[_0x1b5581(0x164)],
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x517834[_0x1b5581(0x132)],
                'border': _0x517834[_0x1b5581(0x11a)],
                'borderRadius': _0x517834[_0x1b5581(0x178)],
                'zIndex': 0x1
            });
            continue;
        case '15':
            _0x340dc8['id'] = 'bg';
            continue;
        case '16':
            document[_0x1b5581(0x15f)][_0x1b5581(0x191) + 'd'](_0x452a63);
            continue;
        case '17':
            _0x4b1f5c['id'] = _0x517834[_0x1b5581(0x1b6)];
            continue;
        case '18':
            Object[_0x1b5581(0x147)](_0x16f4a9[_0x1b5581(0x1f1)], {
                'position': _0x517834[_0x1b5581(0x123)],
                'height': _0x517834[_0x1b5581(0x152)],
                'width': _0x517834[_0x1b5581(0x152)],
                'transform': _0x1b5581(0x1a9) + visualConfig[_0x1b5581(0x1eb) + _0x1b5581(0x1f7) + 't'] + '%)'
            });
            continue;
        case '19':
            _0xfe6e6a[_0x1b5581(0x191) + 'd'](_0x22b1b9);
            continue;
        case '20':
            var _0x5d17c3 = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '21':
            _0x452a63[_0x1b5581(0x191) + 'd'](_0x131c03);
            continue;
        case '22':
            _0x22b1b9[_0x1b5581(0x1ee)] = _0x517834[_0x1b5581(0x1df)];
            continue;
        case '23':
            _0x131c03[_0x1b5581(0x1c9)] = _0x517834[_0x1b5581(0xf2)];
            continue;
        case '24':
            _0x131c03['id'] = _0x517834[_0x1b5581(0x14f)];
            continue;
        case '25':
            Object[_0x1b5581(0x147)](_0x2e7e24[_0x1b5581(0x1f1)], { 'height': _0x517834[_0x1b5581(0x152)] });
            continue;
        case '26':
            Object[_0x1b5581(0x147)](_0x22b1b9[_0x1b5581(0x1f1)], {
                'position': _0x517834[_0x1b5581(0x123)],
                'height': _0x517834[_0x1b5581(0x152)],
                'width': _0x517834[_0x1b5581(0x152)]
            });
            continue;
        case '27':
            _0x2e7e24['id'] = _0x517834[_0x1b5581(0x13f)];
            continue;
        case '28':
            var _0xfe6e6a = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '29':
            var _0x4b1f5c = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0xed)]);
            continue;
        case '30':
            var _0x22b1b9 = document[_0x1b5581(0x111) + _0x1b5581(0x1b3)](_0x517834[_0x1b5581(0x169)]);
            continue;
        case '31':
            _0x452a63['id'] = _0x517834[_0x1b5581(0x16e)];
            continue;
        case '32':
            _0x5d17c3['id'] = _0x517834[_0x1b5581(0x146)];
            continue;
        case '33':
            _0x16f4a9['id'] = _0x517834[_0x1b5581(0x1c7)];
            continue;
        case '34':
            Object[_0x1b5581(0x147)](_0x340dc8[_0x1b5581(0x1f1)], {
                'background': _0x517834[_0x1b5581(0xfc)],
                'backgroundSize': _0x517834[_0x1b5581(0x121)],
                'width': _0x517834[_0x1b5581(0x152)],
                'height': _0x517834[_0x1b5581(0x152)],
                'position': _0x517834[_0x1b5581(0x123)],
                'zIndex': -(-0x1e08 + 0x6be * -0x1 + 0x24c7)
            });
            continue;
        case '35':
            Object[_0x1b5581(0x147)](_0x452a63[_0x1b5581(0x1f1)], {
                'height': _0x517834[_0x1b5581(0x152)],
                'position': _0x517834[_0x1b5581(0x188)],
                'overflow': _0x517834[_0x1b5581(0x137)],
                'userSelect': _0x517834[_0x1b5581(0x1b5)]
            });
            continue;
        case '36':
            _0x16f4a9[_0x1b5581(0x191) + 'd'](_0x4b1f5c);
            continue;
        }
        break;
    }
}
function flap() {
    var _0x5c6a2b = _0x5cd134;
    state[_0x5c6a2b(0x1d8)] = config[_0x5c6a2b(0x161)];
}
function updateBird() {
    var _0x292a69 = _0x5cd134, _0x3357e4 = {
            'VZEjS': function (_0x4829fe, _0x264cc3) {
                return _0x4829fe * _0x264cc3;
            },
            'zIXPJ': function (_0x3fc23a, _0x3814ee) {
                return _0x3fc23a + _0x3814ee;
            },
            'EPwSx': function (_0x5c5fa2, _0x4ae1d7) {
                return _0x5c5fa2 * _0x4ae1d7;
            }
        };
    state[_0x292a69(0x1d8)] -= _0x3357e4[_0x292a69(0x16b)](config[_0x292a69(0x1d2)], visualConfig[_0x292a69(0x1bd)]), state[_0x292a69(0x13b)] = _0x3357e4[_0x292a69(0x18e)](state[_0x292a69(0x13b)], _0x3357e4[_0x292a69(0xfe)](state[_0x292a69(0x1d8)], visualConfig[_0x292a69(0x1bd)]));
}
function randomBetween(_0x45d760, _0x3a2773) {
    var _0x571d88 = _0x5cd134, _0x17c404 = {
            'ZJhVD': function (_0xe018c7, _0x5bcfae) {
                return _0xe018c7 + _0x5bcfae;
            },
            'rWzcr': function (_0x319510, _0x535737) {
                return _0x319510 * _0x535737;
            },
            'LOTGZ': function (_0x1db330, _0x223ce5) {
                return _0x1db330 - _0x223ce5;
            }
        };
    return _0x17c404[_0x571d88(0x119)](_0x45d760, _0x17c404[_0x571d88(0x12e)](_0x17c404[_0x571d88(0x185)](_0x3a2773, _0x45d760), Math[_0x571d88(0x140)]()));
}
function maybeMakeNewPipe() {
    var _0x44c7a0 = _0x5cd134, _0x729d91 = {
            'bCvFp': _0x44c7a0(0x10c) + '4',
            'rRlhM': function (_0x22078c, _0x1f1f3b) {
                return _0x22078c * _0x1f1f3b;
            },
            'aEZBu': function (_0x396ac8, _0x33a805) {
                return _0x396ac8 * _0x33a805;
            },
            'QViht': function (_0x36569e, _0x11abea) {
                return _0x36569e / _0x11abea;
            },
            'NCMgQ': function (_0x25ba96, _0x4b9f4d) {
                return _0x25ba96 < _0x4b9f4d;
            },
            'ClaGU': function (_0x3a3a68, _0x10f03d) {
                return _0x3a3a68(_0x10f03d);
            },
            'DKAzI': function (_0x409f6d, _0x459fed) {
                return _0x409f6d + _0x459fed;
            },
            'tWGXk': function (_0x5eb0ca, _0x179634) {
                return _0x5eb0ca * _0x179634;
            },
            'hxuCC': function (_0x58113c, ..._0x4a725b) {
                return _0x58113c(..._0x4a725b);
            },
            'FzCfI': function (_0x2dedda, _0xe0d5de) {
                return _0x2dedda > _0xe0d5de;
            }
        }, _0x12544b = _0x729d91[_0x44c7a0(0x1d5)][_0x44c7a0(0x112)]('|'), _0x82ee70 = 0x37d + 0x259e + -0x291b;
    while (!![]) {
        switch (_0x12544b[_0x82ee70++]) {
        case '0':
            state[_0x44c7a0(0x1f5)] = _0x1e2cab;
            continue;
        case '1':
            var _0x19ff4f = -0x626 * 0x1 + -0x6a * -0x13 + 0x16 * -0x14;
            continue;
        case '2':
            var _0x3b79bf = _0x729d91[_0x44c7a0(0x12f)](_0x729d91[_0x44c7a0(0x17d)](document[_0x44c7a0(0x15f)][_0x44c7a0(0x149) + 'h'], -0x2225 * 0x1 + -0xa25 * -0x1 + 0x1801 + 0.5), _0x729d91[_0x44c7a0(0x120)](visualConfig[_0x44c7a0(0x1eb) + _0x44c7a0(0x1f7) + 't'], 0x76d + -0x25cd * 0x1 + 0x1 * 0x1ec4));
            continue;
        case '3':
            var _0x1e2cab = [];
            continue;
        case '4':
            _0x729d91[_0x44c7a0(0x19a)](_0x19ff4f, config[_0x44c7a0(0x166) + _0x44c7a0(0x179)]) && _0x729d91[_0x44c7a0(0x100)](makePipe, _0x729d91[_0x44c7a0(0x117)](config[_0x44c7a0(0x166) + _0x44c7a0(0x179)], _0x729d91[_0x44c7a0(0x1ad)](config[_0x44c7a0(0x10b) + 'gX'], _0x729d91[_0x44c7a0(0x14a)](randomBetween, ...config[_0x44c7a0(0x10b) + _0x44c7a0(0xf5)]))));
            continue;
        case '5':
            for (var _0x34b9ae of state[_0x44c7a0(0x1f5)]) {
                _0x19ff4f = Math[_0x44c7a0(0x1c1)](_0x19ff4f, _0x34b9ae['x']), _0x729d91[_0x44c7a0(0x1a2)](_0x34b9ae['x'], -_0x3b79bf) && _0x1e2cab[_0x44c7a0(0x163)](_0x34b9ae);
            }
            continue;
        }
        break;
    }
}
var vars = Object[_0x5cd134(0x1c8)]({
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
    var _0x1bc6b3 = _0x5cd134, _0x577c63 = {
            'zqhGv': _0x1bc6b3(0x1a1) + _0x1bc6b3(0x15e),
            'nZyKP': function (_0x3c33fa) {
                return _0x3c33fa();
            }
        };
    function _0x218688() {
        var _0x3f713a = _0x1bc6b3;
        document[_0x3f713a(0x103) + _0x3f713a(0x1a6)](_0x577c63[_0x3f713a(0x1ea)], ready);
    }
    _0x577c63[_0x1bc6b3(0x122)](_0x218688);
}());
function _0x405e() {
    var _0x4861c4 = [
        './assets/p',
        'ipe.png',
        'JoMhU',
        'hdVWE',
        'PCNjI',
        'TBVmW',
        'ieANd',
        'hidden',
        'bottom_pip',
        '1|4',
        'wRItf',
        'translateY',
        'AqVVa',
        'onkeydown',
        'zqhGv',
        'worldTrans',
        'EsoEl',
        'all_pipes',
        'src',
        'otrjv',
        'zvjGi',
        'style',
        '6|14|25|22',
        'oxVVD',
        'BlgPg',
        'pipes',
        'code',
        'latePercen',
        'pipeHeight',
        '673230HPSMDO',
        '4|23|10|21',
        'ing',
        'alGapPx',
        'none',
        '255,\x20255,\x20',
        'zkVHb',
        '7447878PAUhcP',
        'key',
        '|3|29|5|35',
        'HkGQM',
        'KCXos',
        'VWTqs',
        'GtcTI',
        'gXVariance',
        'eUycQ',
        'top_pipe_w',
        '42JXddMf',
        '\x20scaleY(-1',
        '5|0|3|6|2|',
        '|27|4|26|1',
        'zIueG',
        'TxjpN',
        'EPwSx',
        'rrLmI',
        'ClaGU',
        '3|30|2|22|',
        'dMCwQ',
        'addEventLi',
        '87962QxlTaD',
        'Space',
        'cUHAR',
        'replaceChi',
        'lcIno',
        '5|28|10|2|',
        'rapper',
        'pipeSpacin',
        '3|1|2|5|0|',
        'npVnV',
        'QQLAZ',
        '33mcwWDx',
        'div',
        'createElem',
        'split',
        'black',
        'relative',
        'cMTBI',
        'sByClassNa',
        'DKAzI',
        '(-2px)',
        'ZJhVD',
        'XmEdx',
        'rotateThre',
        'cRicn',
        '|6|15|34|1',
        'e_wrapper',
        'top_pipe_f',
        'QViht',
        'zwvSV',
        'nZyKP',
        'pYbYD',
        'rgba(255,\x20',
        '(100%)\x20tra',
        'left',
        '2134AfhpbJ',
        '(100%)',
        'pipe_box',
        'IuMrK',
        'ARzvE',
        'xxx-large',
        'to\x20restart',
        'rWzcr',
        'rRlhM',
        'aGTSK',
        'kehIB',
        'pVnNG',
        '24|34|36|1',
        'YgtkS',
        'EPVQl',
        'space\x20to\x20f',
        'zcgKU',
        '5265232dCHrwp',
        '19|39|40|0',
        'YVariance',
        'altitude',
        '7|8|27|25|',
        'UwYJv',
        'iXxHn',
        'lBFyv',
        'random',
        './assets/b',
        '|36|28|3|1',
        'gameIsRunn',
        'bQlmK',
        'birdSize',
        'WhdVA',
        'assign',
        'top_pipe',
        'offsetWidt',
        'hxuCC',
        '325828uhrAqE',
        'leY(-1)',
        'ldren',
        '100%\x20100%',
        'IOKCh',
        '2|5|33|18|',
        '250332svnYQc',
        'tWbZC',
        'PCVzB',
        'bottom',
        'onclick',
        '9|31|35|16',
        'top',
        'dafiu',
        'pipes_pair',
        'dHndA',
        'Ivval',
        'right',
        'hnXLr',
        'Loaded',
        'body',
        'HhQOg',
        'power',
        '2|14|1|4|2',
        'push',
        'OJWvD',
        '0.8)',
        'pipeReappe',
        'log',
        '26|19|20|3',
        'sDTKj',
        '4|0|7|2|5|',
        'VZEjS',
        'kVOjk',
        'UbImF',
        'MIPPf',
        'dYWGS',
        'bird_img',
        'game',
        'YPCVn',
        'bJmaP',
        'AOxsT',
        'nslateY(2p',
        '3|6|7|12|1',
        'pipeVertic',
        'AqSTd',
        'arPx',
        'className',
        'getBoundin',
        'lRppu',
        'aEZBu',
        'sSwhW',
        'pipeBoxLef',
        'score',
        'WwEYM',
        'transform',
        'ofGIZ',
        'LVLlf',
        'LOTGZ',
        'WgRrI',
        'ylOdM',
        'tGQFV',
        'LUFVt',
        'pipeSpeed',
        'GKyVC',
        'ZKRhe',
        'BldvL',
        'zIXPJ',
        'RxeXi',
        'ird.png',
        'appendChil',
        'LjEYm',
        'lap\x0aclick\x20',
        'vcuAd',
        'mYZMg',
        'GxLAD',
        'maxRotateD',
        'jaUEv',
        '10hoclKm',
        'NCMgQ',
        '11|9|17|8|',
        'd.png)',
        'absolute',
        'keyCode',
        '(100%)\x20sca',
        '|18|30|21|',
        'DOMContent',
        'FzCfI',
        'ZvKPc',
        '31|1|33|20',
        '|38|32|37|',
        'stener',
        'EVhsU',
        'ckpdg',
        'translate(',
        'e_flipped',
        'OEyWu',
        '9ysXJmx',
        'tWGXk',
        '/backgroun',
        'pipeBoxWid',
        'getElement',
        'uLYcQ',
        'deg)',
        'ent',
        'pipeWidthP',
        'PTGjM',
        'fVNmd',
        'lOeYk',
        'aQybr',
        'img',
        'lipped',
        'url(assets',
        'shold',
        'tick',
        '11|29|17|0',
        'dtxbo',
        'world',
        'max',
        'toFixed',
        'ById',
        'rotate(',
        'atan',
        'version\x201.',
        'mjXAm',
        'keys',
        'innerText',
        'controls',
        'LtCdz',
        '4|1|3|2|0|',
        '2px\x20solid\x20',
        'gClientRec',
        '100%',
        'zujei',
        'bird',
        'gravity',
        '10px',
        '3624295CyXDhe',
        'bCvFp',
        'scaleX(-1)',
        'offsetHeig',
        'speed',
        'sIyjV',
        'pvxvQ',
        '6|1|3'
    ];
    _0x405e = function () {
        return _0x4861c4;
    };
    return _0x405e();
}