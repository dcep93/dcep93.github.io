var _0x182020 = _0x39fd;
(function (_0x4789a3, _0x5bb9fa) {
    var _0xe802f5 = _0x39fd, _0x330283 = _0x4789a3();
    while (!![]) {
        try {
            var _0x127d9c = parseInt(_0xe802f5(0x14e)) / (0x3 * -0x292 + -0x125 * 0x2 + 0xa01) * (parseInt(_0xe802f5(0x150)) / (0x446 * -0x2 + -0x3 * -0x11 + -0x3 * -0x2c9)) + parseInt(_0xe802f5(0x1ad)) / (0x14ff + -0xb3d + -0x9bf) * (-parseInt(_0xe802f5(0x19a)) / (0x7a2 + -0x228a + 0xd76 * 0x2)) + -parseInt(_0xe802f5(0x16b)) / (-0x4a1 + 0x1712 + -0x126c) * (-parseInt(_0xe802f5(0x143)) / (0x7 * 0x4db + 0x7b8 * 0x1 + -0x29af)) + -parseInt(_0xe802f5(0x1c4)) / (0x2a * 0xd6 + 0x74 * 0xa + -0x279d) * (-parseInt(_0xe802f5(0x175)) / (-0x1 * -0x27 + -0x1174 * -0x1 + -0x1193 * 0x1)) + -parseInt(_0xe802f5(0xe8)) / (-0xb * -0xd + 0x4a5 * -0x8 + -0x24a2 * -0x1) * (parseInt(_0xe802f5(0x181)) / (-0x18e6 + -0xce9 * -0x2 + -0xe2 * 0x1)) + parseInt(_0xe802f5(0xf5)) / (-0xf86 + 0x1 * -0x17a1 + -0x2732 * -0x1) + -parseInt(_0xe802f5(0x1b6)) / (-0x6b * 0x3b + 0x1417 * -0x1 + 0x2ccc);
            if (_0x127d9c === _0x5bb9fa)
                break;
            else
                _0x330283['push'](_0x330283['shift']());
        } catch (_0x480d46) {
            _0x330283['push'](_0x330283['shift']());
        }
    }
}(_0x4e8d, 0x29 * -0x53 + 0xc0d8a + -0x3849f), console[_0x182020(0xc1)](_0x182020(0x1ba) + '0'));
var config = {
        'gravity': 0x514,
        'power': 0x1f4,
        'pipeSpeed': 0x190,
        'pipeVerticalGapPx': 0x78,
        'birdSize': 0x28,
        'pipeReappearPx': 0x3e8,
        'pipeSpacingX': 0x320,
        'pipeSpacingXVariance': [
            -0xa * 0x8b + 0x16af * -0x1 + 0x1c1d + 0.7,
            -0x35 * 0x89 + 0x1511 + 0x74c + 0.9
        ],
        'pipeHeightYVariance': [
            -0x19a + -0x1d11 * 0x1 + 0x1eab + 0.2,
            -0x1ea2 + 0x1eef + -0x4d + 0.7
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
    var _0x2ba80d = _0x182020, _0x5396ff = {
            'enHyO': _0x2ba80d(0x16e) + _0x2ba80d(0x191),
            'FdkFD': function (_0x11a3bc) {
                return _0x11a3bc();
            },
            'yqovg': function (_0x5da710, _0x3178cb, _0x4f1bd4) {
                return _0x5da710(_0x3178cb, _0x4f1bd4);
            },
            'WQEeR': function (_0x58a99a, _0x587f6c) {
                return _0x58a99a * _0x587f6c;
            },
            'LYObN': function (_0xae37d5, _0xec41de) {
                return _0xae37d5 == _0xec41de;
            },
            'YvyjJ': _0x2ba80d(0x17f),
            'LCFie': function (_0x36e646) {
                return _0x36e646();
            }
        }, _0x26dbd0 = _0x5396ff[_0x2ba80d(0xcb)][_0x2ba80d(0xeb)]('|'), _0x5701e4 = 0xf00 + -0x1a7a + 0xb7a;
    while (!![]) {
        switch (_0x26dbd0[_0x5701e4++]) {
        case '0':
            _0x5396ff[_0x2ba80d(0xb9)](renderElements);
            continue;
        case '1':
            _0x5396ff[_0x2ba80d(0xec)](setInterval, () => tick(), _0x5396ff[_0x2ba80d(0x1b2)](visualConfig[_0x2ba80d(0x183)], -0x1bf0 + -0x966 * 0x2 + 0x32a4));
            continue;
        case '2':
            document[_0x2ba80d(0xc4)][_0x2ba80d(0xdb)] = function (_0x3ba507) {
                var _0x4ccf08 = _0x2ba80d;
                if ((_0x2cea06[_0x4ccf08(0x1a5)](_0x3ba507[_0x4ccf08(0x16a)], '\x20') || _0x2cea06[_0x4ccf08(0x1a5)](_0x3ba507[_0x4ccf08(0xcf)], _0x2cea06[_0x4ccf08(0x157)]) || _0x2cea06[_0x4ccf08(0x1a5)](_0x3ba507[_0x4ccf08(0xe4)], 0x977 * -0x2 + -0x135e * 0x2 + 0x39ca)) && state[_0x4ccf08(0xe6) + _0x4ccf08(0x195)])
                    _0x2cea06[_0x4ccf08(0xd2)](flap);
            };
            continue;
        case '3':
            _0x5396ff[_0x2ba80d(0xb9)](startGame);
            continue;
        case '4':
            _0x5396ff[_0x2ba80d(0xb9)](draw);
            continue;
        case '5':
            document[_0x2ba80d(0xc4)][_0x2ba80d(0xea)] = () => startGame();
            continue;
        case '6':
            var _0x2cea06 = {
                'iFYya': function (_0x98d2e2, _0xc473eb) {
                    var _0x5a7f73 = _0x2ba80d;
                    return _0x5396ff[_0x5a7f73(0xf0)](_0x98d2e2, _0xc473eb);
                },
                'hoxUh': _0x5396ff[_0x2ba80d(0x12e)],
                'kZTpW': function (_0x19e2a4) {
                    var _0x182036 = _0x2ba80d;
                    return _0x5396ff[_0x182036(0x100)](_0x19e2a4);
                }
            };
            continue;
        }
        break;
    }
}
function tick() {
    var _0x506197 = _0x182020, _0x1f3265 = {
            'XtNHd': _0x506197(0x1aa) + _0x506197(0x121),
            'vfhWv': function (_0x171325) {
                return _0x171325();
            },
            'tJflm': function (_0x1cd45c) {
                return _0x1cd45c();
            },
            'prwSY': function (_0x5c92d4) {
                return _0x5c92d4();
            },
            'KQuux': function (_0x474a4b, _0x40c7ec) {
                return _0x474a4b < _0x40c7ec;
            },
            'rgbox': function (_0x298762, _0x34d81f) {
                return _0x298762 * _0x34d81f;
            },
            'ppCxh': function (_0x3df157) {
                return _0x3df157();
            }
        }, _0xfddf47 = _0x1f3265[_0x506197(0xcc)][_0x506197(0xeb)]('|'), _0x4331e8 = -0x15c5 + -0x1dee + -0x5 * -0xa57;
    while (!![]) {
        switch (_0xfddf47[_0x4331e8++]) {
        case '0':
            _0x1f3265[_0x506197(0x1a2)](draw);
            continue;
        case '1':
            _0x1f3265[_0x506197(0x1a2)](updatePipes);
            continue;
        case '2':
            if (_0x1f3265[_0x506197(0x15d)](isHittingAPipe)) {
                _0x1f3265[_0x506197(0xf8)](endGame);
                return;
            }
            continue;
        case '3':
            if (_0x1f3265[_0x506197(0xdf)](state[_0x506197(0x109)], 0xa * -0x279 + 0x257a + -0xcc0)) {
                _0x1f3265[_0x506197(0x15d)](endGame);
                return;
            }
            continue;
        case '4':
            _0x1f3265[_0x506197(0xf8)](maybeMakeNewPipe);
            continue;
        case '5':
            state[_0x506197(0x1a6)] += _0x1f3265[_0x506197(0x136)](visualConfig[_0x506197(0x183)], -0x200 * -0x1 + -0x18d3 + 0x16dd);
            continue;
        case '6':
            if (!state[_0x506197(0xe6) + _0x506197(0x195)])
                return;
            continue;
        case '7':
            _0x1f3265[_0x506197(0xc6)](updateBird);
            continue;
        }
        break;
    }
}
function startGame() {
    var _0x1716e0 = _0x182020, _0x10ec8b = {
            'UrJHv': _0x1716e0(0x1be) + '2',
            'iMWoL': function (_0x1be8e2) {
                return _0x1be8e2();
            }
        }, _0x300ee9 = _0x10ec8b[_0x1716e0(0x1a3)][_0x1716e0(0xeb)]('|'), _0x2fc051 = -0x1 * 0x1f67 + -0x1def + 0x3d56;
    while (!![]) {
        switch (_0x300ee9[_0x2fc051++]) {
        case '0':
            state[_0x1716e0(0xfb)] = [];
            continue;
        case '1':
            state[_0x1716e0(0x1a6)] = -0x184 * 0x6 + 0x9f * 0x16 + -0x492;
            continue;
        case '2':
            state[_0x1716e0(0xe6) + _0x1716e0(0x195)] = !![];
            continue;
        case '3':
            _0x10ec8b[_0x1716e0(0x1c8)](makeFirstPipe);
            continue;
        case '4':
            state[_0x1716e0(0x109)] = -0x9ff + 0x6 * 0x10e + 0x1 * 0x3ab;
            continue;
        case '5':
            _0x10ec8b[_0x1716e0(0x1c8)](flap);
            continue;
        }
        break;
    }
}
function drawBird() {
    var _0xd9b491 = _0x182020, _0x5cc3e7 = {
            'TtqWw': _0xd9b491(0x114),
            'DlSJy': _0xd9b491(0x176),
            'dEKQM': function (_0x7c671a) {
                return _0x7c671a();
            }
        };
    document[_0xd9b491(0x128) + _0xd9b491(0x19e)](_0x5cc3e7[_0xd9b491(0x11a)])[_0xd9b491(0x10a)][_0xd9b491(0xc8)] = state[_0xd9b491(0x109)], document[_0xd9b491(0x128) + _0xd9b491(0x19e)](_0x5cc3e7[_0xd9b491(0xc7)])[_0xd9b491(0x10a)][_0xd9b491(0xd4)] = _0xd9b491(0x172) + _0x5cc3e7[_0xd9b491(0x1b1)](getRotate) + _0xd9b491(0x1c7);
}
function drawScore() {
    var _0x400011 = _0x182020, _0x114883 = { 'OvkvH': _0x400011(0x1a6) }, _0x5ea68a = document[_0x400011(0x128) + _0x400011(0x19e)](_0x114883[_0x400011(0x1a4)]);
    _0x5ea68a[_0x400011(0x164)] = state[_0x400011(0x1a6)][_0x400011(0x14d)](0x1 * -0x4c7 + -0x1cf4 + -0xb3f * -0x3);
}
function drawPipes() {
    var _0x35b0d0 = _0x182020, _0x2b4129 = {
            'uHiCb': _0x35b0d0(0x154),
            'oeknk': function (_0x1d77ca, _0x295a78) {
                return _0x1d77ca(_0x295a78);
            }
        }, _0x3a422d = document[_0x35b0d0(0x128) + _0x35b0d0(0x19e)](_0x2b4129[_0x35b0d0(0x10f)]);
    _0x3a422d[_0x35b0d0(0x131) + _0x35b0d0(0x1bf)]();
    for (var _0x52096e of state[_0x35b0d0(0xfb)]) {
        _0x2b4129[_0x35b0d0(0x182)](drawPipe, _0x52096e);
    }
}
function draw() {
    var _0x10d65b = _0x182020, _0x551e8c = {
            'sAmfC': function (_0x2d2124) {
                return _0x2d2124();
            },
            'BIhxA': function (_0x1391bb) {
                return _0x1391bb();
            },
            'lefQA': function (_0x53f666) {
                return _0x53f666();
            }
        };
    _0x551e8c[_0x10d65b(0x170)](drawBird), _0x551e8c[_0x10d65b(0x166)](drawScore), _0x551e8c[_0x10d65b(0x123)](drawPipes);
}
function endGame() {
    var _0x5c3b27 = _0x182020;
    state[_0x5c3b27(0xe6) + _0x5c3b27(0x195)] = ![];
}
function updatePipes() {
    var _0x41a535 = _0x182020, _0x25c55f = {
            'zigiY': function (_0x112b4c, _0x53cc0f) {
                return _0x112b4c * _0x53cc0f;
            }
        };
    for (var _0x5bd0aa of state[_0x41a535(0xfb)]) {
        _0x5bd0aa['x'] -= _0x25c55f[_0x41a535(0x1ab)](visualConfig[_0x41a535(0x183)], config[_0x41a535(0x179)]);
    }
}
function getRotate() {
    var _0xc17eac = _0x182020, _0x4b6f01 = {
            'nuisT': function (_0xcefa28, _0x200a59) {
                return _0xcefa28 / _0x200a59;
            },
            'qhsmi': function (_0x1e4b07, _0x1822b5) {
                return _0x1e4b07 * _0x1822b5;
            },
            'WNxnu': function (_0x510b16, _0x2acb65) {
                return _0x510b16 / _0x2acb65;
            }
        };
    return _0x4b6f01[_0xc17eac(0x156)](_0x4b6f01[_0xc17eac(0x11c)](-visualConfig[_0xc17eac(0x140) + 'eg'], Math[_0xc17eac(0xf3)](_0x4b6f01[_0xc17eac(0x156)](state[_0xc17eac(0x177)], visualConfig[_0xc17eac(0x126) + _0xc17eac(0x108)]))), _0x4b6f01[_0xc17eac(0x14a)](Math['PI'], -0x1e49 + -0xe5a + 0x2ca5 * 0x1));
}
function _0x39fd(_0x1b47bb, _0x436db6) {
    var _0x1458de = _0x4e8d();
    return _0x39fd = function (_0x12c3c4, _0x2571e8) {
        _0x12c3c4 = _0x12c3c4 - (0x3 * 0x2d + -0x1f88 + 0x1 * 0x1fb9);
        var _0x3398e3 = _0x1458de[_0x12c3c4];
        return _0x3398e3;
    }, _0x39fd(_0x1b47bb, _0x436db6);
}
function _0x4e8d() {
    var _0x769a12 = [
        'pipes_pair',
        './assets/b',
        'Space',
        'ipe.png',
        '3169230RWfQyT',
        'oeknk',
        'tick',
        '23|6|15|0|',
        'NawHB',
        'none',
        'pipeSpacin',
        'world',
        'appendChil',
        'e_flipped',
        'HrpdK',
        'expLu',
        'tmXFA',
        './assets/p',
        'xifpF',
        'qVUEL',
        '1|3',
        'top',
        'dOOXr',
        'gotem',
        'ing',
        'ZKAAJ',
        'black',
        'max',
        'LMxhK',
        '1176392pOyJFL',
        'bottom_pip',
        'pOSef',
        'AbuvT',
        'ById',
        'MlKBY',
        '30|3|20|29',
        'pipeReappe',
        'vfhWv',
        'UrJHv',
        'OvkvH',
        'iFYya',
        'score',
        'oDjkc',
        'ysebU',
        'top_pipe_w',
        '6|5|7|1|4|',
        'zigiY',
        'OKEQE',
        '6Giezjl',
        'bQHGs',
        'forEach',
        'aECmu',
        'dEKQM',
        'WQEeR',
        'rgba(255,\x20',
        'EFbXi',
        'nmOhA',
        '7820724KinHUk',
        'gXVariance',
        'birdSize',
        'Bjjfh',
        'version\x201.',
        'yZwPw',
        '100%\x20100%',
        'relative',
        '1|4|0|5|3|',
        'ldren',
        '|0|24|30|2',
        '2px\x20solid\x20',
        '|22|9|3|23',
        'VYXAE',
        '679jNpsqq',
        'pipe_box',
        '(100%)',
        'deg)',
        'iMWoL',
        'ztTVY',
        'FdkFD',
        'top_pipe_f',
        'gClientRec',
        'lap\x0aclick\x20',
        'MzoVs',
        'worldTrans',
        'OTUdm',
        'translate(',
        'log',
        'alGapPx',
        'nslateY(2p',
        'body',
        'QsQBt',
        'ppCxh',
        'DlSJy',
        'bottom',
        'ent',
        'space\x20to\x20f',
        'enHyO',
        'XtNHd',
        'pipeVertic',
        'hEkEB',
        'code',
        '|11|32|10|',
        'hidden',
        'kZTpW',
        'push',
        'transform',
        'xxx-large',
        'leY(-1)',
        'pipeHeight',
        'UiFXS',
        'raPBJ',
        'left',
        'onkeydown',
        '9|9|33|31|',
        '(100%)\x20tra',
        '0|39|36|8|',
        'KQuux',
        'qSeva',
        'd.png)',
        'translateY',
        'EsmcH',
        'keyCode',
        'YqLkW',
        'gameIsRunn',
        'mZXkb',
        '18DMCTAi',
        'sByClassNa',
        'onclick',
        'split',
        'yqovg',
        'fWldN',
        '\x20scaleY(-1',
        'lipped',
        'LYObN',
        'top_pipe',
        '255,\x20255,\x20',
        'atan',
        'gwFxH',
        '903947lITgSN',
        'xMIPS',
        'IITPt',
        'prwSY',
        'YvOXH',
        'WdqKG',
        'pipes',
        'inyux',
        '/backgroun',
        'ziBWG',
        '(-2px)',
        'LCFie',
        '1|18|28|26',
        '0|5|6|21|8',
        'SYvjA',
        'e_wrapper',
        'xKCdF',
        'EgfQT',
        'controls',
        'shold',
        'altitude',
        'style',
        'className',
        'YVariance',
        'url(assets',
        'img',
        'uHiCb',
        'offsetWidt',
        'IexrE',
        'right',
        'fvuqi',
        'bird',
        'CGSKt',
        'to\x20restart',
        '(100%)\x20sca',
        'getBoundin',
        '0.8)',
        'TtqWw',
        'arPx',
        'qhsmi',
        'JwvzH',
        'ATNNE',
        'HGpVH',
        '3|5|4|2|0|',
        '0|3|2',
        'gravity',
        'lefQA',
        '29|26|10|1',
        'rapper',
        'rotateThre',
        '14|12|34|2',
        'getElement',
        'iYdhu',
        'offsetHeig',
        'NYzZO',
        'absolute',
        'LWZJP',
        'YvyjJ',
        'vWwXC',
        'agrne',
        'replaceChi',
        'power',
        'DOZdo',
        'HyPPe',
        'DOMContent',
        'rgbox',
        'iBKAo',
        'stener',
        'SIAoR',
        '100%',
        '|2|21|17|4',
        'CHCHS',
        'NvlXE',
        'div',
        'SxdDs',
        'maxRotateD',
        '22|7|16|37',
        'random',
        '3309864btrUsM',
        'createElem',
        'INGyC',
        'ydDed',
        'gPpPL',
        'ird.png',
        'vars',
        'WNxnu',
        '8|14|34|28',
        'pipeBoxLef',
        'toFixed',
        '6eomWos',
        'pipeWidthP',
        '95552cXvkTy',
        'addEventLi',
        'assign',
        'keys',
        'all_pipes',
        'UaXpf',
        'nuisT',
        'hoxUh',
        '4|4|5|13|1',
        '|1|11|15|2',
        '10px',
        '|27|35|38|',
        'CSGak',
        'tJflm',
        'rDARJ',
        '4|7|13|32|',
        'eNMnZ',
        'SSusJ',
        'src',
        'iDsvz',
        'innerText',
        'latePercen',
        'BIhxA',
        'Qeiaq',
        'game',
        'bziis',
        'key',
        '10rJCSfw',
        'scaleX(-1)',
        'yutBw',
        '6|0|4|2|5|',
        '|35|16|19|',
        'sAmfC',
        'cMIRV',
        'rotate(',
        '31|25|17|3',
        'pipeBoxWid',
        '78976UimJQr',
        'bird_img',
        'speed',
        '6|12|27|33',
        'pipeSpeed',
        'BJSVy',
        'LrjLG',
        'Loaded'
    ];
    _0x4e8d = function () {
        return _0x769a12;
    };
    return _0x4e8d();
}
function makeFirstPipe() {
    var _0x8d1afd = _0x182020, _0x58d50b = {
            'MzoVs': function (_0x15a6a7, _0x40af91) {
                return _0x15a6a7(_0x40af91);
            },
            'NYzZO': function (_0x143d3c, _0x4235d1) {
                return _0x143d3c - _0x4235d1;
            },
            'UiFXS': function (_0x39e72a, _0x395002) {
                return _0x39e72a * _0x395002;
            },
            'LWZJP': function (_0x263496, _0x144c5d) {
                return _0x263496 - _0x144c5d;
            },
            'bQHGs': function (_0x810f20, _0xacff7e) {
                return _0x810f20 / _0xacff7e;
            }
        };
    _0x58d50b[_0x8d1afd(0xbd)](makePipe, _0x58d50b[_0x8d1afd(0x12b)](_0x58d50b[_0x8d1afd(0xd8)](document[_0x8d1afd(0xc4)][_0x8d1afd(0x110) + 'h'], _0x58d50b[_0x8d1afd(0x12d)](0x186b + 0x1a00 + -0x12 * 0x2cd, _0x58d50b[_0x8d1afd(0x1ae)](visualConfig[_0x8d1afd(0xbe) + _0x8d1afd(0x165) + 't'], -0x4 * -0x7f6 + 0x2f * 0x8f + -0x4f * 0xbb))), _0x58d50b[_0x8d1afd(0xd8)](0x3 * 0x631 + 0x2 * 0x11f1 + -0x3675 + 0.5, visualConfig[_0x8d1afd(0x14f) + 'x'])));
}
function makePipe(_0x1fa74c) {
    var _0x18794b = _0x182020, _0x2050d7 = {
            'EgfQT': function (_0x4a981a, _0x59289b) {
                return _0x4a981a * _0x59289b;
            },
            'gwFxH': function (_0x238780, ..._0x4854f5) {
                return _0x238780(..._0x4854f5);
            }
        };
    state[_0x18794b(0xfb)][_0x18794b(0xd3)]({
        'x': _0x1fa74c,
        'y': _0x2050d7[_0x18794b(0x106)](document[_0x18794b(0xc4)][_0x18794b(0x12a) + 'ht'], _0x2050d7[_0x18794b(0xf4)](randomBetween, ...config[_0x18794b(0xd7) + _0x18794b(0x10c)]))
    });
}
function isHittingAPipe() {
    var _0xe79016 = _0x182020, _0xeae41f = {
            'ztTVY': _0xe79016(0x114),
            'WdqKG': _0xe79016(0x1c5),
            'Qeiaq': function (_0xdf92f8, _0x3d8e40) {
                return _0xdf92f8 <= _0x3d8e40;
            },
            'qVUEL': function (_0x38604d, _0x1effa6) {
                return _0x38604d <= _0x1effa6;
            },
            'rDARJ': function (_0x4b54a4, _0xab1a77) {
                return _0x4b54a4 <= _0xab1a77;
            }
        }, _0x347b7c = document[_0xe79016(0x128) + _0xe79016(0x19e)](_0xeae41f[_0xe79016(0xb8)])[_0xe79016(0x118) + _0xe79016(0xbb) + 't'](), _0x2dca33 = document[_0xe79016(0x128) + _0xe79016(0xe9) + 'me'](_0xeae41f[_0xe79016(0xfa)]);
    for (var _0x2e71cd of _0x2dca33) {
        var _0x5e5924 = _0x2e71cd[_0xe79016(0x118) + _0xe79016(0xbb) + 't']();
        if (_0xeae41f[_0xe79016(0x167)](_0x347b7c[_0xe79016(0xda)], _0x5e5924[_0xe79016(0x112)]) && _0xeae41f[_0xe79016(0x190)](_0x5e5924[_0xe79016(0xda)], _0x347b7c[_0xe79016(0x112)]) && _0xeae41f[_0xe79016(0x15e)](_0x347b7c[_0xe79016(0x192)], _0x5e5924[_0xe79016(0xc8)]) && _0xeae41f[_0xe79016(0x190)](_0x5e5924[_0xe79016(0x192)], _0x347b7c[_0xe79016(0xc8)]))
            return !![];
    }
    return ![];
}
function drawPipe(_0x1fd04a) {
    var _0x48614a = _0x182020, _0x3be555 = {
            'SYvjA': _0x48614a(0x1a0) + _0x48614a(0x15b) + _0x48614a(0x127) + _0x48614a(0x158) + _0x48614a(0xdc) + _0x48614a(0x141) + _0x48614a(0xd0) + _0x48614a(0x184) + _0x48614a(0x101) + _0x48614a(0x13b) + _0x48614a(0xde) + '25',
            'INGyC': _0x48614a(0xf1),
            'iBKAo': _0x48614a(0x18e) + _0x48614a(0x180),
            'AbuvT': _0x48614a(0xba) + _0x48614a(0xef),
            'HrpdK': _0x48614a(0x13e),
            'YqLkW': _0x48614a(0x13a),
            'ATNNE': _0x48614a(0x12c),
            'QsQBt': _0x48614a(0xe2) + _0x48614a(0x1c6),
            'YvOXH': function (_0x4eb6e5, _0x5cb153) {
                return _0x4eb6e5 + _0x5cb153;
            },
            'raPBJ': _0x48614a(0xe2) + _0x48614a(0xff),
            'iDsvz': _0x48614a(0x19b) + _0x48614a(0x18a),
            'hEkEB': _0x48614a(0x1a9) + _0x48614a(0x125),
            'BJSVy': _0x48614a(0x10e),
            'CHCHS': _0x48614a(0x1c5),
            'xKCdF': _0x48614a(0x16c),
            'HGpVH': function (_0x8bf6e0, _0x4e633c) {
                return _0x8bf6e0 + _0x4e633c;
            },
            'LrjLG': _0x48614a(0x16c) + _0x48614a(0xee) + ')',
            'OKEQE': _0x48614a(0x17d),
            'aECmu': _0x48614a(0x19b) + 'e',
            'UaXpf': _0x48614a(0x154),
            'NvlXE': _0x48614a(0xe2) + _0x48614a(0x117) + _0x48614a(0xd6),
            'VYXAE': _0x48614a(0xe2) + _0x48614a(0xdd) + _0x48614a(0xc3) + 'x)',
            'tmXFA': _0x48614a(0x19b) + _0x48614a(0x104)
        }, _0x34775a = _0x3be555[_0x48614a(0x103)][_0x48614a(0xeb)]('|'), _0x47a1a1 = -0xed * -0x18 + 0x4ea + -0xd91 * 0x2;
    while (!![]) {
        switch (_0x34775a[_0x47a1a1++]) {
        case '0':
            _0x3db027[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x145)];
            continue;
        case '1':
            _0x3db027[_0x48614a(0x162)] = _0x3be555[_0x48614a(0x137)];
            continue;
        case '2':
            _0x40325b[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x19d)];
            continue;
        case '3':
            var _0x53a214 = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x18b)]);
            continue;
        case '4':
            _0x30160a[_0x48614a(0x162)] = _0x3be555[_0x48614a(0x137)];
            continue;
        case '5':
            Object[_0x48614a(0x152)](_0x30160a[_0x48614a(0x10a)], {
                'width': _0x3be555[_0x48614a(0xe5)],
                'position': _0x3be555[_0x48614a(0x11e)],
                'bottom': _0x1fd04a['y'],
                'transform': _0x3be555[_0x48614a(0xc5)]
            });
            continue;
        case '6':
            _0x53a214[_0x48614a(0x189) + 'd'](_0x1f0492);
            continue;
        case '7':
            var _0x8257a0 = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x18b)]);
            continue;
        case '8':
            Object[_0x48614a(0x152)](_0xbd665[_0x48614a(0x10a)], {
                'position': _0x3be555[_0x48614a(0x11e)],
                'width': visualConfig[_0x48614a(0x174) + 'th'],
                'left': visualConfig[_0x48614a(0x14c) + 't'],
                'height': _0x3be555[_0x48614a(0xe5)],
                'bottom': _0x3be555[_0x48614a(0xf9)](_0x1fd04a['y'], config[_0x48614a(0xcd) + _0x48614a(0xc2)]),
                'transform': _0x3be555[_0x48614a(0xd9)]
            });
            continue;
        case '9':
            _0x4a0c57[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x163)];
            continue;
        case '10':
            _0x1f0492[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0xce)];
            continue;
        case '11':
            _0x4e62e1[_0x48614a(0x189) + 'd'](_0x8257a0);
            continue;
        case '12':
            _0x53a214[_0x48614a(0x189) + 'd'](_0x4e62e1);
            continue;
        case '13':
            _0x4e62e1[_0x48614a(0x189) + 'd'](_0x30160a);
            continue;
        case '14':
            Object[_0x48614a(0x152)](_0x4e62e1[_0x48614a(0x10a)], {
                'position': _0x3be555[_0x48614a(0x11e)],
                'width': _0x3be555[_0x48614a(0xe5)],
                'height': _0x3be555[_0x48614a(0xe5)]
            });
            continue;
        case '15':
            var _0x3db027 = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x17a)]);
            continue;
        case '16':
            _0x8257a0[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x13c)];
            continue;
        case '17':
            Object[_0x48614a(0x152)](_0x40325b[_0x48614a(0x10a)], {
                'width': _0x3be555[_0x48614a(0xe5)],
                'position': _0x3be555[_0x48614a(0x11e)],
                'bottom': _0x3be555[_0x48614a(0xf9)](_0x1fd04a['y'], config[_0x48614a(0xcd) + _0x48614a(0xc2)]),
                'transform': _0x3be555[_0x48614a(0x105)],
                'zIndex': -(0x1db3 * -0x1 + -0x1 * -0x1061 + 0xd53),
                'height': _0x3be555[_0x48614a(0xe5)]
            });
            continue;
        case '18':
            Object[_0x48614a(0x152)](_0x3db027[_0x48614a(0x10a)], {
                'width': _0x3be555[_0x48614a(0xe5)],
                'position': _0x3be555[_0x48614a(0x11e)],
                'bottom': _0x3be555[_0x48614a(0x11f)](_0x1fd04a['y'], config[_0x48614a(0xcd) + _0x48614a(0xc2)]),
                'transform': _0x3be555[_0x48614a(0x17b)]
            });
            continue;
        case '19':
            var _0x4a0c57 = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x17a)]);
            continue;
        case '20':
            _0x53a214[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x1ac)];
            continue;
        case '21':
            _0x40325b[_0x48614a(0x162)] = _0x3be555[_0x48614a(0x137)];
            continue;
        case '22':
            _0x4e62e1[_0x48614a(0x189) + 'd'](_0x4a0c57);
            continue;
        case '23':
            Object[_0x48614a(0x152)](_0x1f0492[_0x48614a(0x10a)], {
                'position': _0x3be555[_0x48614a(0x11e)],
                'width': _0x3be555[_0x48614a(0xe5)],
                'height': _0x3be555[_0x48614a(0xe5)]
            });
            continue;
        case '24':
            _0x30160a[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x1b0)];
            continue;
        case '25':
            _0x1f0492[_0x48614a(0x189) + 'd'](_0xbd665);
            continue;
        case '26':
            var _0x40325b = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x17a)]);
            continue;
        case '27':
            _0x498523[_0x48614a(0x189) + 'd'](_0x53a214);
            continue;
        case '28':
            _0x1f0492[_0x48614a(0x189) + 'd'](_0x3db027);
            continue;
        case '29':
            Object[_0x48614a(0x152)](_0x53a214[_0x48614a(0x10a)], {
                'left': _0x1fd04a['x'],
                'position': _0x3be555[_0x48614a(0x11e)],
                'height': _0x3be555[_0x48614a(0xe5)],
                'width': visualConfig[_0x48614a(0x14f) + 'x']
            });
            continue;
        case '30':
            var _0x498523 = document[_0x48614a(0x128) + _0x48614a(0x19e)](_0x3be555[_0x48614a(0x155)]);
            continue;
        case '31':
            Object[_0x48614a(0x152)](_0x4a0c57[_0x48614a(0x10a)], {
                'width': _0x3be555[_0x48614a(0xe5)],
                'position': _0x3be555[_0x48614a(0x11e)],
                'bottom': _0x1fd04a['y'],
                'transform': _0x3be555[_0x48614a(0x13d)],
                'zIndex': -(0x1b3 + -0x1edd + 0x1d2b),
                'height': _0x3be555[_0x48614a(0xe5)]
            });
            continue;
        case '32':
            var _0x1f0492 = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x18b)]);
            continue;
        case '33':
            _0x4a0c57[_0x48614a(0x162)] = _0x3be555[_0x48614a(0x137)];
            continue;
        case '34':
            var _0x30160a = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x17a)]);
            continue;
        case '35':
            var _0x4e62e1 = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x18b)]);
            continue;
        case '36':
            _0xbd665[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x13c)];
            continue;
        case '37':
            Object[_0x48614a(0x152)](_0x8257a0[_0x48614a(0x10a)], {
                'position': _0x3be555[_0x48614a(0x11e)],
                'width': visualConfig[_0x48614a(0x174) + 'th'] || -0x1d83 * -0x1 + 0x2323 + -0x4089,
                'left': visualConfig[_0x48614a(0x14c) + 't'] || 0xd * 0x19a + 0xa3a + 0x1 * -0x1eb7,
                'height': _0x3be555[_0x48614a(0xe5)],
                'bottom': _0x1fd04a['y'],
                'transform': _0x3be555[_0x48614a(0x1c3)]
            });
            continue;
        case '38':
            _0x4e62e1[_0x48614a(0x10b)] = _0x3be555[_0x48614a(0x18d)];
            continue;
        case '39':
            var _0xbd665 = document[_0x48614a(0x144) + _0x48614a(0xc9)](_0x3be555[_0x48614a(0x18b)]);
            continue;
        case '40':
            _0x1f0492[_0x48614a(0x189) + 'd'](_0x40325b);
            continue;
        }
        break;
    }
}
function renderElements() {
    var _0x5e2c8e = _0x182020, _0x429b01 = {
            'CSGak': _0x5e2c8e(0x15f) + _0x5e2c8e(0x173) + _0x5e2c8e(0x178) + _0x5e2c8e(0x1c2) + _0x5e2c8e(0x159) + _0x5e2c8e(0x102) + _0x5e2c8e(0x1c0) + _0x5e2c8e(0x16f) + _0x5e2c8e(0x124) + _0x5e2c8e(0x14b),
            'ZKAAJ': _0x5e2c8e(0x10e),
            'pOSef': _0x5e2c8e(0x12c),
            'yutBw': _0x5e2c8e(0x13a),
            'ziBWG': _0x5e2c8e(0x154),
            'JwvzH': _0x5e2c8e(0x13e),
            'CGSKt': _0x5e2c8e(0x168),
            'fWldN': _0x5e2c8e(0x1bd),
            'OTUdm': _0x5e2c8e(0xd1),
            'DOZdo': _0x5e2c8e(0x186),
            'Bjjfh': _0x5e2c8e(0xca) + _0x5e2c8e(0xbc) + _0x5e2c8e(0x116),
            'inyux': _0x5e2c8e(0x114),
            'xifpF': _0x5e2c8e(0x10d) + _0x5e2c8e(0xfd) + _0x5e2c8e(0xe1),
            'SxdDs': _0x5e2c8e(0x1bc),
            'gPpPL': _0x5e2c8e(0x107),
            'xMIPS': _0x5e2c8e(0x1a6),
            'bziis': function (_0x3ef813, _0x458735) {
                return _0x3ef813 * _0x458735;
            },
            'IITPt': function (_0x1454e3, _0x3e3deb) {
                return _0x1454e3 * _0x3e3deb;
            },
            'fvuqi': function (_0x50fd1f, _0x43a24c) {
                return _0x50fd1f * _0x43a24c;
            },
            'expLu': function (_0xd06110, _0x137834) {
                return _0xd06110 * _0x137834;
            },
            'dOOXr': _0x5e2c8e(0x176),
            'NawHB': _0x5e2c8e(0x188),
            'mZXkb': _0x5e2c8e(0xd5),
            'SSusJ': _0x5e2c8e(0x1b3) + _0x5e2c8e(0xf2) + _0x5e2c8e(0x119),
            'qSeva': _0x5e2c8e(0x1c1) + _0x5e2c8e(0x197),
            'eNMnZ': _0x5e2c8e(0x15a),
            'yZwPw': _0x5e2c8e(0x17e) + _0x5e2c8e(0x148)
        }, _0x24f6ce = _0x429b01[_0x5e2c8e(0x15c)][_0x5e2c8e(0xeb)]('|'), _0x2b1243 = 0xa6 * 0x13 + 0x44 * 0x7c + -0x2d42;
    while (!![]) {
        switch (_0x24f6ce[_0x2b1243++]) {
        case '0':
            var _0xb177e6 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x196)]);
            continue;
        case '1':
            _0x268ac7[_0x5e2c8e(0x189) + 'd'](_0x598f57);
            continue;
        case '2':
            Object[_0x5e2c8e(0x152)](_0xb177e6[_0x5e2c8e(0x10a)], {
                'position': _0x429b01[_0x5e2c8e(0x19c)],
                'height': _0x429b01[_0x5e2c8e(0x16d)],
                'width': _0x429b01[_0x5e2c8e(0x16d)]
            });
            continue;
        case '3':
            _0x598f57['id'] = _0x429b01[_0x5e2c8e(0xfe)];
            continue;
        case '4':
            var _0x4d5aa9 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '5':
            _0x268ac7[_0x5e2c8e(0x189) + 'd'](_0x1283a2);
            continue;
        case '6':
            var _0xaa44d1 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '7':
            _0x4d5aa9['id'] = _0x429b01[_0x5e2c8e(0x115)];
            continue;
        case '8':
            _0x1283a2[_0x5e2c8e(0x189) + 'd'](_0xaa44d1);
            continue;
        case '9':
            var _0x598f57 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '10':
            var _0x55e3d1 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '11':
            var _0x1283a2 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '12':
            var _0x268ac7 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '13':
            Object[_0x5e2c8e(0x152)](_0x4d5aa9[_0x5e2c8e(0x10a)], {
                'height': _0x429b01[_0x5e2c8e(0x16d)],
                'position': _0x429b01[_0x5e2c8e(0xed)],
                'overflow': _0x429b01[_0x5e2c8e(0xbf)],
                'userSelect': _0x429b01[_0x5e2c8e(0x133)]
            });
            continue;
        case '14':
            _0x55e3d1[_0x5e2c8e(0x164)] = _0x429b01[_0x5e2c8e(0x1b9)];
            continue;
        case '15':
            _0x1283a2['id'] = _0x429b01[_0x5e2c8e(0xfc)];
            continue;
        case '16':
            var _0x5212d8 = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '17':
            Object[_0x5e2c8e(0x152)](_0x2fdb3a[_0x5e2c8e(0x10a)], {
                'background': _0x429b01[_0x5e2c8e(0x18f)],
                'backgroundSize': _0x429b01[_0x5e2c8e(0x13f)],
                'width': _0x429b01[_0x5e2c8e(0x16d)],
                'height': _0x429b01[_0x5e2c8e(0x16d)],
                'position': _0x429b01[_0x5e2c8e(0x19c)],
                'zIndex': -(-0xb47 * -0x2 + 0x7ec + -0x1e79)
            });
            continue;
        case '18':
            _0x55e3d1['id'] = _0x429b01[_0x5e2c8e(0x147)];
            continue;
        case '19':
            _0x5212d8['id'] = _0x429b01[_0x5e2c8e(0xf6)];
            continue;
        case '20':
            Object[_0x5e2c8e(0x152)](_0x1283a2[_0x5e2c8e(0x10a)], {
                'position': _0x429b01[_0x5e2c8e(0x19c)],
                'width': config[_0x5e2c8e(0x1b8)],
                'height': config[_0x5e2c8e(0x1b8)]
            });
            continue;
        case '21':
            Object[_0x5e2c8e(0x152)](_0xaa44d1[_0x5e2c8e(0x10a)], {
                'position': _0x429b01[_0x5e2c8e(0x19c)],
                'bottom': _0x429b01[_0x5e2c8e(0x169)](-(-0x4d * 0xd + -0x65 * -0x2f + -0xea2 + 0.16), config[_0x5e2c8e(0x1b8)]),
                'top': _0x429b01[_0x5e2c8e(0xf7)](-(0x144a + 0x259 * 0xa + 0x1 * -0x2bc4 + 0.25), config[_0x5e2c8e(0x1b8)]),
                'right': _0x429b01[_0x5e2c8e(0x113)](-(-0x10 * -0x1d1 + -0x89 * 0x3f + 0x4a7 + 0.25), config[_0x5e2c8e(0x1b8)]),
                'left': _0x429b01[_0x5e2c8e(0x18c)](-(0x4a9 * 0x6 + -0x7 * -0x16f + -0x25ff + 0.25), config[_0x5e2c8e(0x1b8)])
            });
            continue;
        case '22':
            _0x4d5aa9[_0x5e2c8e(0x189) + 'd'](_0x268ac7);
            continue;
        case '23':
            Object[_0x5e2c8e(0x152)](_0x598f57[_0x5e2c8e(0x10a)], { 'height': _0x429b01[_0x5e2c8e(0x16d)] });
            continue;
        case '24':
            _0xb177e6['id'] = _0x429b01[_0x5e2c8e(0x193)];
            continue;
        case '25':
            _0x2fdb3a['id'] = 'bg';
            continue;
        case '26':
            _0x4d5aa9[_0x5e2c8e(0x189) + 'd'](_0x5212d8);
            continue;
        case '27':
            _0x268ac7['id'] = _0x429b01[_0x5e2c8e(0x185)];
            continue;
        case '28':
            _0x4d5aa9[_0x5e2c8e(0x189) + 'd'](_0x55e3d1);
            continue;
        case '29':
            Object[_0x5e2c8e(0x152)](_0x5212d8[_0x5e2c8e(0x10a)], {
                'position': _0x429b01[_0x5e2c8e(0x19c)],
                'fontSize': _0x429b01[_0x5e2c8e(0xe7)],
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x429b01[_0x5e2c8e(0x161)],
                'border': _0x429b01[_0x5e2c8e(0xe0)],
                'borderRadius': _0x429b01[_0x5e2c8e(0x160)],
                'zIndex': 0x1
            });
            continue;
        case '30':
            _0xb177e6[_0x5e2c8e(0x162)] = _0x429b01[_0x5e2c8e(0x1bb)];
            continue;
        case '31':
            var _0x2fdb3a = document[_0x5e2c8e(0x144) + _0x5e2c8e(0xc9)](_0x429b01[_0x5e2c8e(0x11d)]);
            continue;
        case '32':
            document[_0x5e2c8e(0xc4)][_0x5e2c8e(0x189) + 'd'](_0x4d5aa9);
            continue;
        case '33':
            Object[_0x5e2c8e(0x152)](_0x268ac7[_0x5e2c8e(0x10a)], {
                'position': _0x429b01[_0x5e2c8e(0x19c)],
                'height': _0x429b01[_0x5e2c8e(0x16d)],
                'width': _0x429b01[_0x5e2c8e(0x16d)],
                'transform': _0x5e2c8e(0xc0) + visualConfig[_0x5e2c8e(0xbe) + _0x5e2c8e(0x165) + 't'] + '%)'
            });
            continue;
        case '34':
            Object[_0x5e2c8e(0x152)](_0x55e3d1[_0x5e2c8e(0x10a)], {
                'position': _0x429b01[_0x5e2c8e(0x19c)],
                'fontSize': _0x429b01[_0x5e2c8e(0xe7)],
                'bottom': 0x0,
                'right': 0x0,
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x429b01[_0x5e2c8e(0x161)],
                'border': _0x429b01[_0x5e2c8e(0xe0)],
                'borderRadius': _0x429b01[_0x5e2c8e(0x160)],
                'zIndex': 0x1
            });
            continue;
        case '35':
            _0xaa44d1[_0x5e2c8e(0x189) + 'd'](_0xb177e6);
            continue;
        case '36':
            _0x4d5aa9[_0x5e2c8e(0x189) + 'd'](_0x2fdb3a);
            continue;
        }
        break;
    }
}
function flap() {
    var _0x34139b = _0x182020;
    state[_0x34139b(0x177)] = config[_0x34139b(0x132)];
}
function updateBird() {
    var _0x1f3f6a = _0x182020, _0x1914ff = {
            'EsmcH': function (_0x30a90c, _0x21384c) {
                return _0x30a90c * _0x21384c;
            },
            'LMxhK': function (_0x5f0a76, _0x2c1ef2) {
                return _0x5f0a76 + _0x2c1ef2;
            }
        };
    state[_0x1f3f6a(0x177)] -= _0x1914ff[_0x1f3f6a(0xe3)](config[_0x1f3f6a(0x122)], visualConfig[_0x1f3f6a(0x183)]), state[_0x1f3f6a(0x109)] = _0x1914ff[_0x1f3f6a(0x199)](state[_0x1f3f6a(0x109)], _0x1914ff[_0x1f3f6a(0xe3)](state[_0x1f3f6a(0x177)], visualConfig[_0x1f3f6a(0x183)]));
}
function randomBetween(_0x3c9e48, _0x197bb2) {
    var _0x2f9074 = _0x182020, _0x5ba194 = {
            'MlKBY': function (_0x31ef6d, _0x3ed07f) {
                return _0x31ef6d + _0x3ed07f;
            },
            'HyPPe': function (_0x2e5ec7, _0x328222) {
                return _0x2e5ec7 * _0x328222;
            },
            'vWwXC': function (_0x4f529d, _0x4856ae) {
                return _0x4f529d - _0x4856ae;
            }
        };
    return _0x5ba194[_0x2f9074(0x19f)](_0x3c9e48, _0x5ba194[_0x2f9074(0x134)](_0x5ba194[_0x2f9074(0x12f)](_0x197bb2, _0x3c9e48), Math[_0x2f9074(0x142)]()));
}
function maybeMakeNewPipe() {
    var _0x477845 = _0x182020, _0x1b7089 = {
            'iYdhu': _0x477845(0x120) + '1',
            'SIAoR': function (_0x36f509, _0x3f0d8a) {
                return _0x36f509 < _0x3f0d8a;
            },
            'nmOhA': function (_0x510068, _0x3063c1) {
                return _0x510068(_0x3063c1);
            },
            'cMIRV': function (_0x1281a0, _0x26f1f3) {
                return _0x1281a0 + _0x26f1f3;
            },
            'IexrE': function (_0x3a5558, _0x462f81) {
                return _0x3a5558 * _0x462f81;
            },
            'ysebU': function (_0x328c78, _0x103a97) {
                return _0x328c78 > _0x103a97;
            },
            'oDjkc': function (_0x554f7a, _0x486ebf) {
                return _0x554f7a * _0x486ebf;
            },
            'ydDed': function (_0x2f6a37, _0x5f2015) {
                return _0x2f6a37 / _0x5f2015;
            }
        }, _0x5567bb = _0x1b7089[_0x477845(0x129)][_0x477845(0xeb)]('|'), _0x489683 = 0x1ab9 + -0x1100 + -0x9b9;
    while (!![]) {
        switch (_0x5567bb[_0x489683++]) {
        case '0':
            state[_0x477845(0xfb)] = _0x4b94b9;
            continue;
        case '1':
            _0x1b7089[_0x477845(0x139)](_0x36eea4, config[_0x477845(0x1a1) + _0x477845(0x11b)]) && _0x1b7089[_0x477845(0x1b5)](makePipe, _0x1b7089[_0x477845(0x171)](config[_0x477845(0x1a1) + _0x477845(0x11b)], _0x1b7089[_0x477845(0x111)](config[_0x477845(0x187) + 'gX'], _0x1b7089[_0x477845(0x1b5)](randomBetween, ...config[_0x477845(0x187) + _0x477845(0x1b7)]))));
            continue;
        case '2':
            for (var _0x1ba05b of state[_0x477845(0xfb)]) {
                _0x36eea4 = Math[_0x477845(0x198)](_0x36eea4, _0x1ba05b['x']), _0x1b7089[_0x477845(0x1a8)](_0x1ba05b['x'], -_0x444e0e) && _0x4b94b9[_0x477845(0xd3)](_0x1ba05b);
            }
            continue;
        case '3':
            var _0x4b94b9 = [];
            continue;
        case '4':
            var _0x444e0e = _0x1b7089[_0x477845(0x111)](_0x1b7089[_0x477845(0x1a7)](document[_0x477845(0xc4)][_0x477845(0x110) + 'h'], -0x25 * 0xc + 0x889 * 0x1 + 0x1e * -0x3a + 0.5), _0x1b7089[_0x477845(0x146)](visualConfig[_0x477845(0xbe) + _0x477845(0x165) + 't'], -0x3 * -0x11 + -0xf16 + 0xf47));
            continue;
        case '5':
            var _0x36eea4 = 0x445 * 0x4 + -0x1e5d + 0xd49;
            continue;
        }
        break;
    }
}
var vars = {
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
};
window[_0x182020(0x149)] = Object[_0x182020(0x153)](vars), window[_0x182020(0x149)][_0x182020(0x1af)](function (_0xcf0782) {
    window[_0xcf0782] = vars[_0xcf0782];
}), console[_0x182020(0xc1)](_0x182020(0x194)), (function () {
    var _0x18da9b = _0x182020, _0x3f9fa0 = {
            'agrne': _0x18da9b(0x135) + _0x18da9b(0x17c),
            'EFbXi': function (_0x100812) {
                return _0x100812();
            }
        };
    function _0x2e03cf() {
        var _0x3bbf69 = _0x18da9b;
        document[_0x3bbf69(0x151) + _0x3bbf69(0x138)](_0x3f9fa0[_0x3bbf69(0x130)], ready);
    }
    _0x3f9fa0[_0x18da9b(0x1b4)](_0x2e03cf);
}());