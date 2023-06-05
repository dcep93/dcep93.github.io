var _0x53a463 = _0x10cc;
(function (_0x31f12f, _0x412909) {
    var _0x5b8eef = _0x10cc, _0x237298 = _0x31f12f();
    while (!![]) {
        try {
            var _0x234b7f = -parseInt(_0x5b8eef(0xc3)) / (-0x7f * -0x29 + 0x133c + -0x2792) * (parseInt(_0x5b8eef(0xcf)) / (-0x23f8 + -0xc18 + 0x3012)) + parseInt(_0x5b8eef(0xeb)) / (-0x890 * 0x4 + -0xd26 + 0x2f69) * (parseInt(_0x5b8eef(0x140)) / (-0x219b + -0x117e * -0x1 + 0x1021)) + -parseInt(_0x5b8eef(0xf0)) / (0x9 * 0x87 + -0x3c5 * 0x5 + 0xe1f) + -parseInt(_0x5b8eef(0x142)) / (0x1d * -0xad + -0x147 * -0x2 + 0x11 * 0x101) + -parseInt(_0x5b8eef(0x102)) / (0x1bd2 + -0x1 * -0x246d + 0x1568 * -0x3) + -parseInt(_0x5b8eef(0x17d)) / (0x215b + 0x4 * 0x47 + -0x226f) * (-parseInt(_0x5b8eef(0x11a)) / (-0x1 * -0xfbd + -0xdff * -0x1 + -0x1db3)) + parseInt(_0x5b8eef(0x12c)) / (-0xf * 0xc3 + -0x3 * -0xc37 + 0xc97 * -0x2) * (parseInt(_0x5b8eef(0x163)) / (0x19b6 + 0x23a2 + -0x146f * 0x3));
            if (_0x234b7f === _0x412909)
                break;
            else
                _0x237298['push'](_0x237298['shift']());
        } catch (_0x505b2e) {
            _0x237298['push'](_0x237298['shift']());
        }
    }
}(_0x28ef, -0x2f8e7 * 0x1 + 0x2 * -0x20ffd + 0xb1151 * 0x1));
var vars = {
    'gravity': 0x4b0,
    'power': 0x190,
    'tick': 0xa,
    'pipeSpeed': 0.35,
    'pipeGapPx': 0x7d,
    'birdScale': 0.15,
    'running': ![],
    'speed': 0x0,
    'altitude': 0x0,
    'score': 0x0,
    'pipes': [],
    'worldTranslatePercent': 0x14,
    'pipeBufferXPx': 0x19,
    'pipeWidthPx': 0xc8,
    'pipeReappearPx': 0x3e8,
    'pipeSpacingX': 0x320,
    'pipeSpacingXVariance': [
        -0x1558 * -0x1 + 0x2 * -0xecb + 0x83e + 0.7,
        0x983 + -0x13e3 + 0x14c * 0x8 + 0.9
    ],
    'pipeHeightYVariance': [
        0x26e * 0xb + 0x25fc + -0x40b6 + 0.2,
        -0x1bf9 + 0x4 * 0x7cd + -0x33b + 0.7
    ],
    'birdHeightPx': 0x10b,
    'birdWidthPx': 0x1bc,
    'birdImgAspectRatio': (-0xc8 * 0x2f + 0x8d8 + 0x1e38) / (-0x7 * -0x1e3 + -0x1409 + -0x1 * -0x821),
    'birdImgHeightPercentage': 0x7c,
    'birdImgOffsetBottomPx': 0x15,
    'birdImgOffsetRightPx': 0x41,
    'maxRotateDeg': 0x78,
    'rotateThreshold': 0xb4
};
function _0x10cc(_0xd641bd, _0x329fad) {
    var _0x1e50eb = _0x28ef();
    return _0x10cc = function (_0x5af399, _0x580dfb) {
        _0x5af399 = _0x5af399 - (-0x11da + -0x342 + 0x15ca);
        var _0x1e9f9d = _0x1e50eb[_0x5af399];
        return _0x1e9f9d;
    }, _0x10cc(_0xd641bd, _0x329fad);
}
function ready() {
    var _0x3baeb6 = _0x10cc, _0x128112 = {
            'AnOyu': function (_0x51931d, _0x4b7b5e) {
                return _0x51931d == _0x4b7b5e;
            },
            'rMDnq': function (_0x1141a3, _0x3565bb) {
                return _0x1141a3 == _0x3565bb;
            },
            'MmbHn': _0x3baeb6(0x169),
            'EkYBc': function (_0x1d5a48) {
                return _0x1d5a48();
            },
            'yAMkn': function (_0x555c42) {
                return _0x555c42();
            },
            'RICPG': function (_0x3e824f, _0x34504a, _0x21c51a) {
                return _0x3e824f(_0x34504a, _0x21c51a);
            }
        };
    _0x128112[_0x3baeb6(0xf1)](renderElements), document[_0x3baeb6(0x177)][_0x3baeb6(0x153)] = function (_0x493356) {
        var _0x9d78dd = _0x3baeb6;
        if (_0x128112[_0x9d78dd(0xd0)](_0x493356[_0x9d78dd(0x100)], '\x20') || _0x128112[_0x9d78dd(0x174)](_0x493356[_0x9d78dd(0x17f)], _0x128112[_0x9d78dd(0x14e)]) || _0x128112[_0x9d78dd(0x174)](_0x493356[_0x9d78dd(0x108)], -0x4f8 + 0x337 * 0x7 + -0x1 * 0x1169))
            _0x128112[_0x9d78dd(0x127)](flap);
    }, _0x128112[_0x3baeb6(0x13e)](setInterval, () => tick(), vars[_0x3baeb6(0xef)]);
}
function renderElements() {
    var _0x4d0fdd = _0x10cc, _0x241494 = {
            'qefjC': _0x4d0fdd(0xe4) + _0x4d0fdd(0xc9) + _0x4d0fdd(0xf5) + _0x4d0fdd(0x11b) + _0x4d0fdd(0x148) + _0x4d0fdd(0x14b) + _0x4d0fdd(0x16d) + _0x4d0fdd(0xd4),
            'pbvdj': _0x4d0fdd(0x143),
            'fpjKN': _0x4d0fdd(0x106),
            'EJnlb': _0x4d0fdd(0xb0),
            'EiyhX': _0x4d0fdd(0x125) + _0x4d0fdd(0xd9) + _0x4d0fdd(0xdd),
            'uXnNy': _0x4d0fdd(0xe8),
            'HpDTw': _0x4d0fdd(0x137),
            'xAOjd': _0x4d0fdd(0x17e),
            'PrVIK': _0x4d0fdd(0xd6),
            'bwafV': _0x4d0fdd(0xd2),
            'ViCmN': function (_0x2a2a36) {
                return _0x2a2a36();
            },
            'uLFud': _0x4d0fdd(0x14a),
            'MsWha': _0x4d0fdd(0x135) + _0x4d0fdd(0x151),
            'PiSZj': _0x4d0fdd(0xea),
            'UkGdl': _0x4d0fdd(0xc1),
            'xIaiM': function (_0x37f330, _0x42f278) {
                return _0x37f330 * _0x42f278;
            },
            'hTvqC': _0x4d0fdd(0x146),
            'icqOA': _0x4d0fdd(0x144),
            'TGxVP': _0x4d0fdd(0x123),
            'YmfoD': _0x4d0fdd(0xbb)
        }, _0x4521fc = _0x241494[_0x4d0fdd(0xf3)][_0x4d0fdd(0xfa)]('|'), _0x4a6ac3 = -0x17 * 0x165 + 0xbe4 + -0x142f * -0x1;
    while (!![]) {
        switch (_0x4521fc[_0x4a6ac3++]) {
        case '0':
            _0x3daf70[_0x4d0fdd(0x165) + 'd'](_0x42a9da);
            continue;
        case '1':
            _0x39a943[_0x4d0fdd(0x165) + 'd'](_0x2fa69a);
            continue;
        case '2':
            _0x3daf70['id'] = _0x241494[_0x4d0fdd(0xe7)];
            continue;
        case '3':
            var _0x57e341 = document[_0x4d0fdd(0xf7) + _0x4d0fdd(0xed)](_0x241494[_0x4d0fdd(0xc0)]);
            continue;
        case '4':
            _0x2fa69a['id'] = _0x241494[_0x4d0fdd(0xbf)];
            continue;
        case '5':
            Object[_0x4d0fdd(0x114)](_0x42a9da[_0x4d0fdd(0x12b)], {
                'background': _0x241494[_0x4d0fdd(0x166)],
                'backgroundSize': _0x241494[_0x4d0fdd(0x149)],
                'width': _0x241494[_0x4d0fdd(0x179)],
                'height': _0x241494[_0x4d0fdd(0x179)],
                'position': _0x241494[_0x4d0fdd(0x113)],
                'zIndex': -(0x680 + -0x81e * -0x4 + -0x26f7)
            });
            continue;
        case '6':
            document[_0x4d0fdd(0x177)][_0x4d0fdd(0x165) + 'd'](_0x3daf70);
            continue;
        case '7':
            var _0x18a138 = document[_0x4d0fdd(0xf7) + _0x4d0fdd(0xed)](_0x241494[_0x4d0fdd(0x13c)]);
            continue;
        case '8':
            _0x3daf70[_0x4d0fdd(0x165) + 'd'](_0x18a138);
            continue;
        case '9':
            _0x18a138['id'] = _0x241494[_0x4d0fdd(0xce)];
            continue;
        case '10':
            _0x241494[_0x4d0fdd(0x10b)](draw);
            continue;
        case '11':
            _0x57e341['id'] = _0x241494[_0x4d0fdd(0xc7)];
            continue;
        case '12':
            var _0x3daf70 = document[_0x4d0fdd(0xf7) + _0x4d0fdd(0xed)](_0x241494[_0x4d0fdd(0x13c)]);
            continue;
        case '13':
            _0x57e341[_0x4d0fdd(0x158)] = _0x241494[_0x4d0fdd(0x132)];
            continue;
        case '14':
            Object[_0x4d0fdd(0x114)](_0x2fa69a[_0x4d0fdd(0x12b)], { 'height': _0x241494[_0x4d0fdd(0x179)] });
            continue;
        case '15':
            _0x1b0abf['id'] = _0x241494[_0x4d0fdd(0x12f)];
            continue;
        case '16':
            _0x39a943['id'] = _0x241494[_0x4d0fdd(0x17c)];
            continue;
        case '17':
            var _0x2fa69a = document[_0x4d0fdd(0xf7) + _0x4d0fdd(0xed)](_0x241494[_0x4d0fdd(0x13c)]);
            continue;
        case '18':
            Object[_0x4d0fdd(0x114)](_0x57e341[_0x4d0fdd(0x12b)], {
                'position': _0x241494[_0x4d0fdd(0x113)],
                'height': vars[_0x4d0fdd(0x10e) + _0x4d0fdd(0x11c) + _0x4d0fdd(0x150)] + '%',
                'aspectRatio': vars[_0x4d0fdd(0x172) + _0x4d0fdd(0x139)],
                'bottom': _0x241494[_0x4d0fdd(0x14d)](-vars[_0x4d0fdd(0x164) + _0x4d0fdd(0x16b) + 'x'], vars[_0x4d0fdd(0x16f)]),
                'right': _0x241494[_0x4d0fdd(0x14d)](-vars[_0x4d0fdd(0x164) + _0x4d0fdd(0x14c)], vars[_0x4d0fdd(0x16f)])
            });
            continue;
        case '19':
            var _0x39a943 = document[_0x4d0fdd(0xf7) + _0x4d0fdd(0xed)](_0x241494[_0x4d0fdd(0x13c)]);
            continue;
        case '20':
            _0x1b0abf[_0x4d0fdd(0x165) + 'd'](_0x57e341);
            continue;
        case '21':
            var _0x1b0abf = document[_0x4d0fdd(0xf7) + _0x4d0fdd(0xed)](_0x241494[_0x4d0fdd(0x13c)]);
            continue;
        case '22':
            Object[_0x4d0fdd(0x114)](_0x18a138[_0x4d0fdd(0x12b)], {
                'position': _0x241494[_0x4d0fdd(0x113)],
                'fontSize': _0x241494[_0x4d0fdd(0xfc)],
                'padding': 0xa
            });
            continue;
        case '23':
            _0x42a9da['id'] = 'bg';
            continue;
        case '24':
            _0x3daf70[_0x4d0fdd(0x165) + 'd'](_0x39a943);
            continue;
        case '25':
            Object[_0x4d0fdd(0x114)](_0x39a943[_0x4d0fdd(0x12b)], {
                'position': _0x241494[_0x4d0fdd(0x113)],
                'height': _0x241494[_0x4d0fdd(0x179)],
                'width': _0x241494[_0x4d0fdd(0x179)],
                'transform': _0x4d0fdd(0xf2) + vars[_0x4d0fdd(0xf4) + _0x4d0fdd(0x101) + 't'] + '%)'
            });
            continue;
        case '26':
            _0x39a943[_0x4d0fdd(0x165) + 'd'](_0x1b0abf);
            continue;
        case '27':
            var _0x42a9da = document[_0x4d0fdd(0xf7) + _0x4d0fdd(0xed)](_0x241494[_0x4d0fdd(0x13c)]);
            continue;
        case '28':
            Object[_0x4d0fdd(0x114)](_0x3daf70[_0x4d0fdd(0x12b)], {
                'height': _0x241494[_0x4d0fdd(0x179)],
                'position': _0x241494[_0x4d0fdd(0x147)],
                'overflow': _0x241494[_0x4d0fdd(0xc4)],
                'userSelect': _0x241494[_0x4d0fdd(0x162)]
            });
            continue;
        case '29':
            Object[_0x4d0fdd(0x114)](_0x1b0abf[_0x4d0fdd(0x12b)], {
                'position': _0x241494[_0x4d0fdd(0x113)],
                'width': _0x241494[_0x4d0fdd(0x14d)](vars[_0x4d0fdd(0xe9) + 'x'], vars[_0x4d0fdd(0x16f)]),
                'height': _0x241494[_0x4d0fdd(0x14d)](vars[_0x4d0fdd(0x138) + 'Px'], vars[_0x4d0fdd(0x16f)])
            });
            continue;
        }
        break;
    }
}
function flap() {
    var _0x15b42e = _0x10cc, _0x20a989 = {
            'TTrkv': function (_0x842a3c) {
                return _0x842a3c();
            }
        };
    !vars[_0x15b42e(0x161)] && _0x20a989[_0x15b42e(0x15b)](startGame), vars[_0x15b42e(0xb5)] = vars[_0x15b42e(0x12d)];
}
function tick() {
    var _0x47c96a = _0x10cc, _0x2c3d46 = {
            'VBEOt': _0x47c96a(0xe2) + _0x47c96a(0xf9),
            'PnCLh': function (_0x318134, _0x3b0b22) {
                return _0x318134 < _0x3b0b22;
            },
            'oYlXq': function (_0x42cb4e) {
                return _0x42cb4e();
            },
            'ybUzE': function (_0x5e9719) {
                return _0x5e9719();
            },
            'FGqCo': function (_0x116f0b, _0x20e22e) {
                return _0x116f0b / _0x20e22e;
            },
            'DjTGQ': function (_0x1e4185, _0x39a80c) {
                return _0x1e4185 * _0x39a80c;
            },
            'VCWLI': function (_0x2a4867, _0xf89821) {
                return _0x2a4867 + _0xf89821;
            },
            'qtBYv': function (_0x1fdb74, _0x447ecf) {
                return _0x1fdb74 / _0x447ecf;
            },
            'VLwKb': function (_0x5c2bfa, _0x2ac1db) {
                return _0x5c2bfa / _0x2ac1db;
            }
        }, _0x593797 = _0x2c3d46[_0x47c96a(0x124)][_0x47c96a(0xfa)]('|'), _0x3b8deb = -0x1693 + 0x931 + 0xd62;
    while (!![]) {
        switch (_0x593797[_0x3b8deb++]) {
        case '0':
            if (_0x2c3d46[_0x47c96a(0x129)](vars[_0x47c96a(0x133)], -0x4 * -0x413 + 0xe24 + 0x1e7 * -0x10)) {
                _0x2c3d46[_0x47c96a(0xe1)](endGame);
                return;
            }
            continue;
        case '1':
            _0x2c3d46[_0x47c96a(0xe1)](draw);
            continue;
        case '2':
            if (!vars[_0x47c96a(0x161)])
                return;
            continue;
        case '3':
            _0x2c3d46[_0x47c96a(0xc6)](updatePipes);
            continue;
        case '4':
            vars[_0x47c96a(0xb5)] -= _0x2c3d46[_0x47c96a(0x16a)](_0x2c3d46[_0x47c96a(0x157)](vars[_0x47c96a(0xe0)], vars[_0x47c96a(0xef)]), -0x30e * 0x3 + -0x1 * 0x17ba + 0x24cc);
            continue;
        case '5':
            if (_0x2c3d46[_0x47c96a(0xc6)](isHittingAPipe)) {
                _0x2c3d46[_0x47c96a(0xe1)](endGame);
                return;
            }
            continue;
        case '6':
            vars[_0x47c96a(0x133)] = _0x2c3d46[_0x47c96a(0x154)](vars[_0x47c96a(0x133)], _0x2c3d46[_0x47c96a(0x181)](_0x2c3d46[_0x47c96a(0x157)](vars[_0x47c96a(0xb5)], vars[_0x47c96a(0xef)]), 0x3 * -0xa38 + -0x97b * -0x3 + 0x61f * 0x1));
            continue;
        case '7':
            vars[_0x47c96a(0xd2)] += _0x2c3d46[_0x47c96a(0x15a)](vars[_0x47c96a(0xef)], -0x1 * -0x1e15 + 0x161b + 0x6 * -0x8a2);
            continue;
        }
        break;
    }
}
function randomBetween(_0x187078, _0x2343a3) {
    var _0x355bc9 = _0x10cc, _0x42718a = {
            'DveBr': function (_0x5398c4, _0x3f622a) {
                return _0x5398c4 + _0x3f622a;
            },
            'HAhfg': function (_0x3cc4a7, _0xd74acc) {
                return _0x3cc4a7 * _0xd74acc;
            },
            'fqyHx': function (_0x5dc191, _0xbd0224) {
                return _0x5dc191 - _0xbd0224;
            }
        };
    return _0x42718a[_0x355bc9(0xcc)](_0x187078, _0x42718a[_0x355bc9(0x10d)](_0x42718a[_0x355bc9(0xb7)](_0x2343a3, _0x187078), Math[_0x355bc9(0x134)]()));
}
function updatePipes() {
    var _0x5236e8 = _0x10cc, _0x119fa1 = {
            'DsvIr': _0x5236e8(0x10a) + '2',
            'qNlGu': function (_0x41a295, _0x24904a) {
                return _0x41a295 < _0x24904a;
            },
            'uwXXl': function (_0x1997e0, _0x43d238) {
                return _0x1997e0 + _0x43d238;
            },
            'AOcND': function (_0x570c3a, _0x27bb10) {
                return _0x570c3a * _0x27bb10;
            },
            'Boasx': function (_0x4e3285, ..._0x1ea98d) {
                return _0x4e3285(..._0x1ea98d);
            },
            'IPzQf': function (_0x453c75, _0x465018) {
                return _0x453c75 * _0x465018;
            },
            'xGBoJ': function (_0x573c91, _0x339864) {
                return _0x573c91 / _0x339864;
            },
            'PuSeQ': function (_0x2fb760, _0x390a88) {
                return _0x2fb760 * _0x390a88;
            },
            'oGynT': function (_0x334ebb, _0x6e3ade) {
                return _0x334ebb * _0x6e3ade;
            },
            'pEmsz': function (_0x10f533, _0xac58c4) {
                return _0x10f533 > _0xac58c4;
            }
        }, _0xbafa9 = _0x119fa1[_0x5236e8(0xb4)][_0x5236e8(0xfa)]('|'), _0x3a388c = -0x1 * -0x1a41 + 0x224 * 0x12 + -0x40c9 * 0x1;
    while (!![]) {
        switch (_0xbafa9[_0x3a388c++]) {
        case '0':
            var _0x2fd2d3 = -0x2 * 0x1c1 + -0x16e8 + 0x467 * 0x6;
            continue;
        case '1':
            vars[_0x5236e8(0x12a)] = _0x55b782;
            continue;
        case '2':
            if (_0x119fa1[_0x5236e8(0xb1)](_0x2fd2d3, vars[_0x5236e8(0x131) + _0x5236e8(0x120)])) {
                var _0xcea0 = _0x119fa1[_0x5236e8(0xb6)](vars[_0x5236e8(0x131) + _0x5236e8(0x120)], _0x119fa1[_0x5236e8(0x121)](vars[_0x5236e8(0xc2) + 'gX'], _0x119fa1[_0x5236e8(0xbe)](randomBetween, ...vars[_0x5236e8(0xc2) + _0x5236e8(0x13b)]))), _0x14af0e = _0x119fa1[_0x5236e8(0x126)](document[_0x5236e8(0x177)][_0x5236e8(0xe3) + 'ht'], _0x119fa1[_0x5236e8(0xbe)](randomBetween, ...vars[_0x5236e8(0xfb) + _0x5236e8(0x180)]));
                vars[_0x5236e8(0x12a)][_0x5236e8(0xb3)]({
                    'x': _0xcea0,
                    'y': _0x14af0e
                });
            }
            continue;
        case '3':
            var _0x4ad2db = _0x119fa1[_0x5236e8(0x128)](_0x119fa1[_0x5236e8(0x121)](_0x119fa1[_0x5236e8(0x17b)](0x3 * 0x7 + 0x1 * 0x4d + -0x61 + 0.5, document[_0x5236e8(0x177)][_0x5236e8(0x167) + 'h']), vars[_0x5236e8(0xf4) + _0x5236e8(0x101) + 't']), 0x144b + -0x13b7 + -0x30);
            continue;
        case '4':
            var _0x55b782 = [];
            continue;
        case '5':
            for (var _0x3eca6d of vars[_0x5236e8(0x12a)]) {
                _0x3eca6d[_0x5236e8(0x130)] = _0x3eca6d['x'], _0x3eca6d['x'] -= _0x119fa1[_0x5236e8(0xf8)](vars[_0x5236e8(0xef)], vars[_0x5236e8(0x11f)]), _0x2fd2d3 = Math[_0x5236e8(0xff)](_0x2fd2d3, _0x3eca6d['x']), _0x119fa1[_0x5236e8(0x145)](_0x3eca6d['x'], -_0x4ad2db) && _0x55b782[_0x5236e8(0xb3)](_0x3eca6d);
            }
            continue;
        }
        break;
    }
}
function _0x28ef() {
    var _0x1974ad = [
        'assign',
        'iFVNI',
        'LxSGQ',
        'ZEwVl',
        'replaceChi',
        'ykyjn',
        '3175299uWpKMl',
        '4|17|4|14|',
        'ghtPercent',
        '0|5|2',
        'scaleY(-1)',
        'pipeSpeed',
        'arPx',
        'AOcND',
        '|9|4|8|21|',
        'hidden',
        'VBEOt',
        'url(assets',
        'IPzQf',
        'EkYBc',
        'xGBoJ',
        'PnCLh',
        'pipes',
        'style',
        '10hNwkZl',
        'power',
        'BRofL',
        'PiSZj',
        'lastX',
        'pipeReappe',
        'MsWha',
        'altitude',
        'random',
        './assets/b',
        'hWZcK',
        '100%',
        'birdHeight',
        'ectRatio',
        'className',
        'gXVariance',
        'PrVIK',
        'stener',
        'RICPG',
        'transform',
        '676bIAdPX',
        'NctGF',
        '2546136diGiCf',
        'game',
        'relative',
        'pEmsz',
        'xxx-large',
        'icqOA',
        '1|21|15|29',
        'uXnNy',
        'bird_img',
        '|26|3|11|1',
        'setRightPx',
        'xIaiM',
        'MmbHn',
        '16|19',
        'age',
        'ird.png',
        'DOMContent',
        'onkeydown',
        'VCWLI',
        'slFxv',
        'UvoDP',
        'DjTGQ',
        'src',
        './assets/p',
        'VLwKb',
        'TTrkv',
        'btdxC',
        'nJqLe',
        'pipeBuffer',
        'qsiVq',
        'bottom_pip',
        'running',
        'YmfoD',
        '6738094ZUhIwS',
        'birdImgOff',
        'appendChil',
        'EiyhX',
        'offsetWidt',
        'AOFXA',
        'Space',
        'FGqCo',
        'setBottomP',
        'faepw',
        '3|18|20|7|',
        'XPx',
        'birdScale',
        'JpmQF',
        'OpCFS',
        'birdImgAsp',
        'deg)',
        'rMDnq',
        'WvQKN',
        'feMwf',
        'body',
        'keys',
        'HpDTw',
        'xZyCB',
        'PuSeQ',
        'UkGdl',
        '8AOgoKG',
        'absolute',
        'code',
        'YVariance',
        'qtBYv',
        'innerText',
        '|18|3|12|1',
        'all_pipes',
        'qNlGu',
        'wJdcO',
        'push',
        'DsvIr',
        'speed',
        'uwXXl',
        'fqyHx',
        'shold',
        'DfGzN',
        '3|4|7|6|1|',
        'none',
        'ldren',
        'mMzoB',
        'Boasx',
        'EJnlb',
        'fpjKN',
        'world',
        'pipeSpacin',
        '91593XBAYjm',
        'TGxVP',
        'ITAMH',
        'ybUzE',
        'uLFud',
        'iHGsf',
        '27|23|5|0|',
        'maxRotateD',
        'bottom',
        'DveBr',
        'kLtZD',
        'bwafV',
        '10NYIzuz',
        'AnOyu',
        'Jhllm',
        'score',
        'stTgp',
        '9|22|8|10',
        '11|20|13|1',
        'div',
        'pipeGapPx',
        'addEventLi',
        '/backgroun',
        'scaleX(-1)',
        '|6|2|10|17',
        'pipe_wrapp',
        'd.png)',
        'PlxqF',
        'ltDZF',
        'gravity',
        'oYlXq',
        '2|7|4|6|3|',
        'offsetHeig',
        '12|2|28|6|',
        'pipeWidthP',
        'gNDWw',
        'pbvdj',
        '100%\x20100%',
        'birdWidthP',
        'bird',
        '4017zhwpZx',
        'getElement',
        'ent',
        'UWjtZ',
        'tick',
        '11825Jrhgmf',
        'yAMkn',
        'translate(',
        'qefjC',
        'worldTrans',
        '19|16|25|2',
        'ipe.png',
        'createElem',
        'oGynT',
        '1|0|5',
        'split',
        'pipeHeight',
        'hTvqC',
        'top_pipe',
        'toFixed',
        'max',
        'key',
        'latePercen',
        '327334DfYioe',
        'rotate(',
        'ById',
        'rotateThre',
        'img',
        'LrVpA',
        'keyCode',
        'Loaded',
        '4|0|3|5|1|',
        'ViCmN',
        'RiqBH',
        'HAhfg',
        'birdImgHei',
        '5|14|7|5|0',
        'atan',
        'DILWQ',
        'XJiyV',
        'xAOjd'
    ];
    _0x28ef = function () {
        return _0x1974ad;
    };
    return _0x28ef();
}
function isHittingAPipe() {
    var _0x33017a = _0x10cc, _0x3d41bb = {
            'hWZcK': function (_0x206d81, _0x129b72) {
                return _0x206d81 > _0x129b72;
            },
            'JpmQF': function (_0x547e94, _0x570d66) {
                return _0x547e94 < _0x570d66;
            },
            'LrVpA': function (_0x22fd13, _0x34ac) {
                return _0x22fd13 > _0x34ac;
            },
            'DfGzN': function (_0x128973, _0x40dd03) {
                return _0x128973 + _0x40dd03;
            },
            'ZEwVl': function (_0x20bd21, _0x12cc7c) {
                return _0x20bd21 * _0x12cc7c;
            },
            'iHGsf': function (_0x1a3df5, _0x134187) {
                return _0x1a3df5 + _0x134187;
            }
        };
    for (var _0x3660fb of vars[_0x33017a(0x12a)]) {
        if (_0x3d41bb[_0x33017a(0x136)](_0x3660fb[_0x33017a(0x130)], -0x1 * -0x1b41 + -0x26eb + -0x1 * -0xbaa) && _0x3d41bb[_0x33017a(0x170)](_0x3660fb['x'], 0x23c4 + -0x21aa + 0x10d * -0x2)) {
            if (_0x3d41bb[_0x33017a(0x170)](vars[_0x33017a(0x133)], _0x3660fb['y']))
                return !![];
            if (_0x3d41bb[_0x33017a(0x107)](_0x3d41bb[_0x33017a(0xb9)](vars[_0x33017a(0x133)], _0x3d41bb[_0x33017a(0x117)](vars[_0x33017a(0x138) + 'Px'], vars[_0x33017a(0x16f)])), _0x3d41bb[_0x33017a(0xc8)](_0x3660fb['y'], vars[_0x33017a(0xd7)])))
                return !![];
        }
    }
    return ![];
}
function startGame() {
    var _0x48056f = _0x10cc, _0x3c7a47 = {
            'LxSGQ': function (_0x3dcf11, _0x115319) {
                return _0x3dcf11 * _0x115319;
            },
            'feMwf': function (_0x1237e7, _0x1f25a6) {
                return _0x1237e7 - _0x1f25a6;
            },
            'ltDZF': function (_0x297886, _0x4f83e5) {
                return _0x297886 / _0x4f83e5;
            },
            'mMzoB': function (_0x5b5cb9, _0x20b0fd) {
                return _0x5b5cb9 * _0x20b0fd;
            },
            'qsiVq': function (_0x303bfe, ..._0x2b3eb6) {
                return _0x303bfe(..._0x2b3eb6);
            }
        };
    vars[_0x48056f(0x161)] = !![], vars[_0x48056f(0xd2)] = 0x118e + -0x13f9 + 0x26b, vars[_0x48056f(0x133)] = 0x1ff0 + 0xeca + -0x2eba, vars[_0x48056f(0x12a)] = [{
            'x': _0x3c7a47[_0x48056f(0x116)](document[_0x48056f(0x177)][_0x48056f(0x167) + 'h'], _0x3c7a47[_0x48056f(0x176)](0xa7 * -0x13 + 0x63 * -0x55 + 0x3 * 0xf17, _0x3c7a47[_0x48056f(0xdf)](vars[_0x48056f(0xf4) + _0x48056f(0x101) + 't'], -0x946 + 0x9b7 + 0xd * -0x1))),
            'y': _0x3c7a47[_0x48056f(0xbd)](document[_0x48056f(0x177)][_0x48056f(0xe3) + 'ht'], _0x3c7a47[_0x48056f(0x15f)](randomBetween, ...vars[_0x48056f(0xfb) + _0x48056f(0x180)]))
        }];
}
function draw() {
    var _0x2d413f = _0x10cc, _0xfff567 = {
            'xZyCB': _0x2d413f(0xba) + _0x2d413f(0x11d),
            'NctGF': _0x2d413f(0xb0),
            'stTgp': _0x2d413f(0xd5) + _0x2d413f(0xaf) + _0x2d413f(0x10f) + _0x2d413f(0xdb) + _0x2d413f(0x122) + _0x2d413f(0x14f),
            'iFVNI': _0x2d413f(0x137),
            'ITAMH': _0x2d413f(0xd6),
            'gNDWw': _0x2d413f(0xdc) + 'er',
            'DILWQ': _0x2d413f(0x106),
            'kLtZD': _0x2d413f(0x159) + _0x2d413f(0xf6),
            'UvoDP': _0x2d413f(0x160) + 'e',
            'UWjtZ': _0x2d413f(0xfd),
            'WvQKN': _0x2d413f(0x17e),
            'RiqBH': function (_0x52ed16, _0x580210) {
                return _0x52ed16 - _0x580210;
            },
            'BRofL': function (_0x4fc146, _0x480ee5) {
                return _0x4fc146 + _0x480ee5;
            },
            'PlxqF': _0x2d413f(0xda),
            'OpCFS': _0x2d413f(0x11e),
            'btdxC': _0x2d413f(0x12a),
            'nJqLe': _0x2d413f(0xea),
            'wJdcO': _0x2d413f(0xd2),
            'slFxv': function (_0x2b7635) {
                return _0x2b7635();
            }
        }, _0x5c864d = _0xfff567[_0x2d413f(0x17a)][_0x2d413f(0xfa)]('|'), _0x32bb15 = 0x15 * -0x5f + -0x140 * -0xa + 0xf1 * -0x5;
    while (!![]) {
        switch (_0x5c864d[_0x32bb15++]) {
        case '0':
            var _0x19ea03 = document[_0x2d413f(0xec) + _0x2d413f(0x104)](_0xfff567[_0x2d413f(0x141)]);
            continue;
        case '1':
            _0x37d94d[_0x2d413f(0xae)] = vars[_0x2d413f(0xd2)][_0x2d413f(0xfe)](0x1 * -0x21f + 0x1b79 * -0x1 + 0x1d9a * 0x1);
            continue;
        case '2':
            for (var _0x4df0db of vars[_0x2d413f(0x12a)]) {
                var _0x425d8a = _0xfff567[_0x2d413f(0xd3)][_0x2d413f(0xfa)]('|'), _0x439ff8 = 0x12c8 + -0x10b + -0x11bd;
                while (!![]) {
                    switch (_0x425d8a[_0x439ff8++]) {
                    case '0':
                        Object[_0x2d413f(0x114)](_0x138973[_0x2d413f(0x12b)], { 'width': _0xfff567[_0x2d413f(0x115)] });
                        continue;
                    case '1':
                        _0x19ea03[_0x2d413f(0x165) + 'd'](_0x2c19ea);
                        continue;
                    case '2':
                        var _0xab4d2e = document[_0x2d413f(0xf7) + _0x2d413f(0xed)](_0xfff567[_0x2d413f(0xc5)]);
                        continue;
                    case '3':
                        _0x41f998[_0x2d413f(0x13a)] = _0xfff567[_0x2d413f(0xe6)];
                        continue;
                    case '4':
                        var _0x5a85ba = document[_0x2d413f(0xf7) + _0x2d413f(0xed)](_0xfff567[_0x2d413f(0x111)]);
                        continue;
                    case '5':
                        _0x138973[_0x2d413f(0x158)] = _0xfff567[_0x2d413f(0xcd)];
                        continue;
                    case '6':
                        _0x41f998[_0x2d413f(0x165) + 'd'](_0x138973);
                        continue;
                    case '7':
                        _0x138973[_0x2d413f(0x13a)] = _0xfff567[_0x2d413f(0x156)];
                        continue;
                    case '8':
                        _0x5a85ba[_0x2d413f(0x13a)] = _0xfff567[_0x2d413f(0xee)];
                        continue;
                    case '9':
                        _0x2c19ea[_0x2d413f(0x165) + 'd'](_0xab4d2e);
                        continue;
                    case '10':
                        _0xab4d2e[_0x2d413f(0x13a)] = _0xfff567[_0x2d413f(0xe6)];
                        continue;
                    case '11':
                        var _0x2c19ea = document[_0x2d413f(0xf7) + _0x2d413f(0xed)](_0xfff567[_0x2d413f(0xc5)]);
                        continue;
                    case '12':
                        Object[_0x2d413f(0x114)](_0x41f998[_0x2d413f(0x12b)], {
                            'position': _0xfff567[_0x2d413f(0x175)],
                            'width': _0xfff567[_0x2d413f(0x115)],
                            'height': _0xfff567[_0x2d413f(0x115)],
                            'height': _0x4df0db['y'],
                            'bottom': 0x0
                        });
                        continue;
                    case '13':
                        Object[_0x2d413f(0x114)](_0x2c19ea[_0x2d413f(0x12b)], {
                            'left': _0xfff567[_0x2d413f(0x10c)](_0x4df0db['x'], vars[_0x2d413f(0x15e) + _0x2d413f(0x16e)]),
                            'position': _0xfff567[_0x2d413f(0x175)],
                            'height': _0xfff567[_0x2d413f(0x115)],
                            'width': vars[_0x2d413f(0xe5) + 'x']
                        });
                        continue;
                    case '14':
                        var _0x138973 = document[_0x2d413f(0xf7) + _0x2d413f(0xed)](_0xfff567[_0x2d413f(0x111)]);
                        continue;
                    case '15':
                        _0x2c19ea[_0x2d413f(0x165) + 'd'](_0x41f998);
                        continue;
                    case '16':
                        Object[_0x2d413f(0x114)](_0x5a85ba[_0x2d413f(0x12b)], { 'width': _0xfff567[_0x2d413f(0x115)] });
                        continue;
                    case '17':
                        Object[_0x2d413f(0x114)](_0xab4d2e[_0x2d413f(0x12b)], {
                            'position': _0xfff567[_0x2d413f(0x175)],
                            'width': _0xfff567[_0x2d413f(0x115)],
                            'height': _0xfff567[_0x2d413f(0x115)],
                            'bottom': _0xfff567[_0x2d413f(0x12e)](_0x4df0db['y'], vars[_0x2d413f(0xd7)]),
                            'transform': _0xfff567[_0x2d413f(0xde)],
                            'transform': _0xfff567[_0x2d413f(0x171)]
                        });
                        continue;
                    case '18':
                        var _0x41f998 = document[_0x2d413f(0xf7) + _0x2d413f(0xed)](_0xfff567[_0x2d413f(0xc5)]);
                        continue;
                    case '19':
                        _0xab4d2e[_0x2d413f(0x165) + 'd'](_0x5a85ba);
                        continue;
                    case '20':
                        _0x2c19ea[_0x2d413f(0x13a)] = _0xfff567[_0x2d413f(0x15c)];
                        continue;
                    case '21':
                        _0x5a85ba[_0x2d413f(0x158)] = _0xfff567[_0x2d413f(0xcd)];
                        continue;
                    }
                    break;
                }
            }
            continue;
        case '3':
            var _0x52a953 = document[_0x2d413f(0xec) + _0x2d413f(0x104)](_0xfff567[_0x2d413f(0x15d)]);
            continue;
        case '4':
            _0x52a953[_0x2d413f(0x12b)][_0x2d413f(0xcb)] = vars[_0x2d413f(0x133)];
            continue;
        case '5':
            _0x19ea03[_0x2d413f(0x118) + _0x2d413f(0xbc)]();
            continue;
        case '6':
            var _0x37d94d = document[_0x2d413f(0xec) + _0x2d413f(0x104)](_0xfff567[_0x2d413f(0xb2)]);
            continue;
        case '7':
            _0x52a953[_0x2d413f(0x12b)][_0x2d413f(0x13f)] = _0x2d413f(0x103) + _0xfff567[_0x2d413f(0x155)](getRotate) + _0x2d413f(0x173);
            continue;
        }
        break;
    }
}
function endGame() {
    var _0x452164 = _0x10cc;
    vars[_0x452164(0x161)] = ![];
}
function getRotate() {
    var _0x202133 = _0x10cc, _0x390fa6 = {
            'Jhllm': function (_0x4c6fd6, _0x440810) {
                return _0x4c6fd6 / _0x440810;
            },
            'ykyjn': function (_0x31c0ac, _0x5d59d0) {
                return _0x31c0ac * _0x5d59d0;
            },
            'XJiyV': function (_0x5b2136, _0x35f098) {
                return _0x5b2136 / _0x35f098;
            }
        };
    return _0x390fa6[_0x202133(0xd1)](_0x390fa6[_0x202133(0x119)](-vars[_0x202133(0xca) + 'eg'], Math[_0x202133(0x110)](_0x390fa6[_0x202133(0xd1)](vars[_0x202133(0xb5)], vars[_0x202133(0x105) + _0x202133(0xb8)]))), _0x390fa6[_0x202133(0x112)](Math['PI'], -0x3 * -0xa43 + -0x1 * 0xa04 + 0x427 * -0x5));
}
var functions = Object[_0x53a463(0x178)]({
    'vars': vars,
    'renderElements': renderElements,
    'ready': ready,
    'flap': flap,
    'tick': tick,
    'updatePipes': updatePipes,
    'isHittingAPipe': isHittingAPipe,
    'draw': draw,
    'getRotate': getRotate,
    'endGame': endGame,
    'startGame': startGame
});
(function () {
    var _0x1c4143 = _0x53a463, _0x2989c3 = {
            'faepw': _0x1c4143(0x152) + _0x1c4143(0x109),
            'AOFXA': function (_0x3ea402) {
                return _0x3ea402();
            }
        };
    function _0x5396ed() {
        var _0x3bbb0b = _0x1c4143;
        document[_0x3bbb0b(0xd8) + _0x3bbb0b(0x13d)](_0x2989c3[_0x3bbb0b(0x16c)], ready);
    }
    _0x2989c3[_0x1c4143(0x168)](_0x5396ed);
}());