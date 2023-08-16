var _0x5965f5 = _0x29b9;
(function (_0x5d73dc, _0x34f9ef) {
    var _0xe26654 = _0x29b9, _0x3944a2 = _0x5d73dc();
    while (!![]) {
        try {
            var _0x2861a6 = -parseInt(_0xe26654(0x1d4)) / (-0x7 * 0xca + 0x1b24 + -0x159d) + parseInt(_0xe26654(0x12b)) / (-0x266 + 0x1590 + 0x2 * -0x994) + -parseInt(_0xe26654(0x190)) / (0x29b + -0xe6f + -0x1b1 * -0x7) * (-parseInt(_0xe26654(0x19a)) / (0x2 * 0x117e + 0x1597 + -0x388f)) + -parseInt(_0xe26654(0x134)) / (-0x1 * -0x7f + 0x546 + -0x5c0) * (parseInt(_0xe26654(0x166)) / (0x191b + -0x1 * 0x25b8 + 0xca3)) + parseInt(_0xe26654(0x12d)) / (0x6b6 * 0x3 + -0x21b0 * -0x1 + -0x35cb) * (parseInt(_0xe26654(0x17f)) / (0x5db * 0x2 + 0xe * -0xde + 0x76)) + parseInt(_0xe26654(0x1d2)) / (-0x101 * 0xd + -0x24f1 * -0x1 + -0x1f * 0xc5) * (-parseInt(_0xe26654(0x1cd)) / (0x1b97 * -0x1 + 0xd * -0x4b + 0x1f70)) + parseInt(_0xe26654(0x112)) / (0x19b7 * -0x1 + -0x1d8d + 0x374f);
            if (_0x2861a6 === _0x34f9ef)
                break;
            else
                _0x3944a2['push'](_0x3944a2['shift']());
        } catch (_0x30cbd9) {
            _0x3944a2['push'](_0x3944a2['shift']());
        }
    }
}(_0x4cd2, 0x6e436 + 0x80dfc + -0xa2dea), console[_0x5965f5(0x135)](_0x5965f5(0x175) + '4'));
var config = {
        'gravity': 0x514,
        'power': 0x1f4,
        'pipeSpeed': 0x190,
        'pipeVerticalGapPx': 0x78,
        'birdSize': 0x28,
        'pipeReappearPx': 0x3e8,
        'pipeSpacingX': 0x320,
        'pipeSpacingXVariance': [
            0x5b3 + -0x1 * 0x168d + -0x1 * -0x10da + 0.7,
            0x1bf + 0x771 + 0x24c * -0x4 + 0.9
        ],
        'pipeHeightYVariance': [
            -0xdb7 + 0x309 * -0x7 + 0x22f6 + 0.2,
            0x1 * 0x1213 + -0x642 + -0xbd1 + 0.7
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
}
function tick() {
    var _0x163add = _0x5965f5, _0x5afd5e = {
            'zakPd': _0x163add(0xf1) + _0x163add(0x103),
            'aDTdW': function (_0x401369) {
                return _0x401369();
            },
            'SNIYP': function (_0x41d016, _0x2bcb7e) {
                return _0x41d016 * _0x2bcb7e;
            },
            'rEzRM': function (_0x950d59) {
                return _0x950d59();
            },
            'KbYrX': function (_0x3ce7f7) {
                return _0x3ce7f7();
            },
            'JWHXR': function (_0x7825fa, _0x2df405) {
                return _0x7825fa < _0x2df405;
            },
            'HwVfR': function (_0x31361f) {
                return _0x31361f();
            }
        }, _0x3f44cf = _0x5afd5e[_0x163add(0x1c5)][_0x163add(0x120)]('|'), _0x28b6fc = -0x4 * 0x65d + 0xcc1 + -0x1 * -0xcb3;
    while (!![]) {
        switch (_0x3f44cf[_0x28b6fc++]) {
        case '0':
            _0x5afd5e[_0x163add(0x171)](updatePipes);
            continue;
        case '1':
            state[_0x163add(0x12a)] += _0x5afd5e[_0x163add(0x106)](visualConfig[_0x163add(0x187)], -0x8cd * -0x3 + -0x1c5c + 0x1ff);
            continue;
        case '2':
            _0x5afd5e[_0x163add(0x132)](draw);
            continue;
        case '3':
            if (_0x5afd5e[_0x163add(0x171)](isHittingAPipe)) {
                _0x5afd5e[_0x163add(0x1be)](endGame);
                return;
            }
            continue;
        case '4':
            _0x5afd5e[_0x163add(0x1be)](updateBird);
            continue;
        case '5':
            if (_0x5afd5e[_0x163add(0x14d)](state[_0x163add(0x1b7)], 0x6b6 + -0x498 * 0x7 + 0xcb9 * 0x2)) {
                _0x5afd5e[_0x163add(0x1be)](endGame);
                return;
            }
            continue;
        case '6':
            _0x5afd5e[_0x163add(0x1d5)](maybeMakeNewPipe);
            continue;
        case '7':
            if (!state[_0x163add(0x1ba) + _0x163add(0x145)])
                return;
            continue;
        }
        break;
    }
}
function startGame() {
    var _0x109576 = _0x5965f5, _0x167d6d = {
            'AfrCn': _0x109576(0x14e) + '0',
            'nVSXQ': function (_0x37bbc3) {
                return _0x37bbc3();
            }
        }, _0x2f172d = _0x167d6d[_0x109576(0x1c8)][_0x109576(0x120)]('|'), _0x46bc3b = -0x5 * -0x679 + 0x1e * -0x23 + 0x1 * -0x1c43;
    while (!![]) {
        switch (_0x2f172d[_0x46bc3b++]) {
        case '0':
            state[_0x109576(0x1ba) + _0x109576(0x145)] = !![];
            continue;
        case '1':
            state[_0x109576(0x183)] = [];
            continue;
        case '2':
            state[_0x109576(0x1b7)] = 0xea5 * -0x1 + -0x826 + -0x16cb * -0x1;
            continue;
        case '3':
            _0x167d6d[_0x109576(0x1b0)](flap);
            continue;
        case '4':
            _0x167d6d[_0x109576(0x1b0)](makeFirstPipe);
            continue;
        case '5':
            state[_0x109576(0x12a)] = 0x6 * -0x38b + -0x26a7 + -0x7 * -0x88f;
            continue;
        }
        break;
    }
}
function drawBird() {
    var _0x2bbe8d = _0x5965f5, _0x50b40c = {
            'OoVcG': _0x2bbe8d(0xf0),
            'pqjQp': _0x2bbe8d(0x18d),
            'rgmzs': function (_0x35cd0f) {
                return _0x35cd0f();
            }
        };
    document[_0x2bbe8d(0x1db) + _0x2bbe8d(0x17b)](_0x50b40c[_0x2bbe8d(0xf3)])[_0x2bbe8d(0x15a)][_0x2bbe8d(0x19f)] = state[_0x2bbe8d(0x1b7)], document[_0x2bbe8d(0x1db) + _0x2bbe8d(0x17b)](_0x50b40c[_0x2bbe8d(0x14b)])[_0x2bbe8d(0x15a)][_0x2bbe8d(0x16e)] = _0x2bbe8d(0x17e) + _0x50b40c[_0x2bbe8d(0x193)](getRotate) + _0x2bbe8d(0x196);
}
function _0x29b9(_0xa387c6, _0x2a2069) {
    var _0x3d02e7 = _0x4cd2();
    return _0x29b9 = function (_0x22ddc5, _0x57aceb) {
        _0x22ddc5 = _0x22ddc5 - (-0x1 * -0x6cd + 0xd0c + -0x12f2);
        var _0x384d0c = _0x3d02e7[_0x22ddc5];
        return _0x384d0c;
    }, _0x29b9(_0xa387c6, _0x2a2069);
}
function drawScore() {
    var _0x49b666 = _0x5965f5, _0x4fe00c = { 'yYdJQ': _0x49b666(0x12a) }, _0x520e65 = document[_0x49b666(0x1db) + _0x49b666(0x17b)](_0x4fe00c[_0x49b666(0x142)]);
    _0x520e65[_0x49b666(0x10a)] = state[_0x49b666(0x12a)][_0x49b666(0x117)](-0x26b1 + 0x8f8 + 0x1dbb);
}
function drawPipes() {
    var _0x39c82f = _0x5965f5, _0x1110b4 = {
            'UIKLQ': _0x39c82f(0x11a),
            'WvgTb': function (_0x8ee9e0, _0x372882) {
                return _0x8ee9e0(_0x372882);
            }
        }, _0x592dff = document[_0x39c82f(0x1db) + _0x39c82f(0x17b)](_0x1110b4[_0x39c82f(0x11f)]);
    _0x592dff[_0x39c82f(0x192) + _0x39c82f(0x100)]();
    for (var _0x676c5c of state[_0x39c82f(0x183)]) {
        _0x1110b4[_0x39c82f(0x122)](drawPipe, _0x676c5c);
    }
}
function draw() {
    var _0x1d531d = _0x5965f5, _0x4d81d3 = {
            'LHiIx': function (_0x4d27f4) {
                return _0x4d27f4();
            },
            'Gafec': function (_0x9ebf62) {
                return _0x9ebf62();
            }
        };
    _0x4d81d3[_0x1d531d(0x1c1)](drawBird), _0x4d81d3[_0x1d531d(0x1b5)](drawScore), _0x4d81d3[_0x1d531d(0x1c1)](drawPipes);
}
function endGame() {
    var _0x43437b = _0x5965f5;
    state[_0x43437b(0x1ba) + _0x43437b(0x145)] = ![];
}
function updatePipes() {
    var _0x5b83ec = _0x5965f5, _0x2f5e2a = {
            'oMJgg': function (_0x390c99, _0x28c45a) {
                return _0x390c99 * _0x28c45a;
            }
        };
    for (var _0x38c867 of state[_0x5b83ec(0x183)]) {
        _0x38c867['x'] -= _0x2f5e2a[_0x5b83ec(0x15d)](visualConfig[_0x5b83ec(0x187)], config[_0x5b83ec(0x1ae)]);
    }
}
function getRotate() {
    var _0x544c61 = _0x5965f5, _0x1030ee = {
            'dHlXp': function (_0x43e148, _0x44357f) {
                return _0x43e148 / _0x44357f;
            },
            'QFnin': function (_0x23d16d, _0x4d1225) {
                return _0x23d16d * _0x4d1225;
            },
            'XZFgb': function (_0x10d210, _0x32866d) {
                return _0x10d210 / _0x32866d;
            },
            'ptXIo': function (_0x2e1bb5, _0x494485) {
                return _0x2e1bb5 / _0x494485;
            }
        };
    return _0x1030ee[_0x544c61(0x155)](_0x1030ee[_0x544c61(0x154)](-visualConfig[_0x544c61(0x1c4) + 'eg'], Math[_0x544c61(0xfb)](_0x1030ee[_0x544c61(0x156)](state[_0x544c61(0x1bc)], visualConfig[_0x544c61(0x139) + _0x544c61(0x138)]))), _0x1030ee[_0x544c61(0xff)](Math['PI'], -0x7 * -0x557 + 0xb79 + -0x6 * 0x824));
}
function makeFirstPipe() {
    var _0x1dde35 = _0x5965f5, _0x306330 = {
            'MwGwr': function (_0x3603d1, _0xb3135) {
                return _0x3603d1(_0xb3135);
            },
            'dPoZa': function (_0x3661cc, _0x1f46f8) {
                return _0x3661cc - _0x1f46f8;
            },
            'AzypS': function (_0xa40027, _0x167b37) {
                return _0xa40027 * _0x167b37;
            },
            'XLTVR': function (_0x4f9c3e, _0x5c87aa) {
                return _0x4f9c3e / _0x5c87aa;
            }
        };
    _0x306330[_0x1dde35(0x169)](makePipe, _0x306330[_0x1dde35(0x110)](_0x306330[_0x1dde35(0x1a4)](document[_0x1dde35(0x18c)][_0x1dde35(0x170) + 'h'], _0x306330[_0x1dde35(0x110)](-0x1 * -0x1a0f + 0x1 * -0xad6 + -0xf38, _0x306330[_0x1dde35(0x147)](visualConfig[_0x1dde35(0x1b8) + _0x1dde35(0x181) + 't'], 0x2 * 0x330 + 0x261f * -0x1 + 0x2023))), _0x306330[_0x1dde35(0x1a4)](0x1b1c + 0x11 * -0x4d + 0x755 * -0x3 + 0.5, visualConfig[_0x1dde35(0x113) + 'x'])));
}
function makePipe(_0x2b15d3) {
    var _0x276e9a = _0x5965f5, _0x3d7f9a = {
            'ggdUG': function (_0x3473bb, _0x576e7e) {
                return _0x3473bb * _0x576e7e;
            },
            'ftyhZ': function (_0x55b3dc, ..._0x4371ce) {
                return _0x55b3dc(..._0x4371ce);
            }
        };
    state[_0x276e9a(0x183)][_0x276e9a(0x14a)]({
        'x': _0x2b15d3,
        'y': _0x3d7f9a[_0x276e9a(0x15b)](document[_0x276e9a(0x18c)][_0x276e9a(0x168) + 'ht'], _0x3d7f9a[_0x276e9a(0x13b)](randomBetween, ...config[_0x276e9a(0x1b1) + _0x276e9a(0x161)]))
    });
}
function _0x4cd2() {
    var _0x41d4f6 = [
        '4|1|3|0|2|',
        'AzypS',
        'pipe_box',
        'IocOM',
        '6|27|13|31',
        'ArlUo',
        'oeVJq',
        'gMHml',
        'absolute',
        '/backgroun',
        '6|4|31|34|',
        'pipeSpeed',
        'Jtboq',
        'nVSXQ',
        'pipeHeight',
        'translate(',
        '(100%)',
        'ent',
        'Gafec',
        'CPOMt',
        'altitude',
        'worldTrans',
        '14|24|32|3',
        'gameIsRunn',
        '|0|38|21|7',
        'speed',
        'pipeBoxLef',
        'KbYrX',
        'to\x20restart',
        'div',
        'LHiIx',
        'OlwYZ',
        'RhpPT',
        'maxRotateD',
        'zakPd',
        'getBoundin',
        './assets/b',
        'AfrCn',
        '30|26|22|1',
        'SwjAH',
        'TVkOC',
        'JGPUZ',
        '10rIawmM',
        '4|29|5|3|3',
        'keys',
        'vksZq',
        'zYJbk',
        '894762IcejgC',
        'ofszM',
        '579790VZduVE',
        'HwVfR',
        'alGapPx',
        'SBFJW',
        '11|8|27|29',
        'FYlXt',
        'assign',
        'getElement',
        'kLpXd',
        '|16|2|20|2',
        'Loaded',
        'AeywM',
        'rgba(255,\x20',
        'gClientRec',
        'lap\x0aclick\x20',
        '(-2px)',
        'uRxdm',
        'pipes_pair',
        'HsUix',
        'bird',
        '7|1|4|0|6|',
        'XKVmE',
        'OoVcG',
        'nslateY(2p',
        'ipe.png',
        '2px\x20solid\x20',
        'bottom_pip',
        'pipeVertic',
        'top_pipe_w',
        'Vszok',
        'atan',
        'e_flipped',
        'random',
        '10px',
        'ptXIo',
        'ldren',
        'uXNCu',
        'black',
        '2|5|3',
        'rbTkg',
        'vrVbw',
        'SNIYP',
        '|15|12|1|2',
        'QExvj',
        'yYIbL',
        'innerText',
        'url(assets',
        'top_pipe_f',
        '|9|26|4|11',
        'leY(-1)',
        'HuSJN',
        'dPoZa',
        'className',
        '5862769FEBUlv',
        'pipeWidthP',
        'wumwo',
        'ymxpq',
        'pipeReappe',
        'toFixed',
        'SCjzf',
        '|18|32|40|',
        'all_pipes',
        'birdSize',
        'PzorW',
        '10|21|9|1|',
        '0|6|13|2|1',
        'UIKLQ',
        'split',
        'DibqU',
        'WvgTb',
        'slxsR',
        'game',
        '100%\x20100%',
        'rapper',
        'src',
        'gravity',
        'nhiTU',
        'score',
        '359592ceIUyY',
        '3|25|17|33',
        '1142183LsJTlF',
        'bjtua',
        'YzzlQ',
        'translateY',
        './assets/p',
        'rEzRM',
        '100%',
        '68215sZKWNy',
        'log',
        'pbRhN',
        '(100%)\x20sca',
        'shold',
        'rotateThre',
        'dezZE',
        'ftyhZ',
        'pipeBoxWid',
        'TlbUq',
        'qfDHz',
        'zTdIV',
        'pipeSpacin',
        'HQeaI',
        'yYdJQ',
        'yqrPE',
        'wMlOk',
        'ing',
        '\x20scaleY(-1',
        'XLTVR',
        'img',
        '5|12|7|23|',
        'push',
        'pqjQp',
        'relative',
        'JWHXR',
        '5|2|1|3|4|',
        'yVYEJ',
        'BlxYD',
        'd.png)',
        '|30|19|22|',
        'top_pipe',
        'QFnin',
        'dHlXp',
        'XZFgb',
        'zdwTd',
        'controls',
        'none',
        'style',
        'ggdUG',
        'stener',
        'oMJgg',
        '|25|33|18|',
        'DqxdC',
        'arPx',
        'YVariance',
        'left',
        'addEventLi',
        '7|28|14|35',
        'space\x20to\x20f',
        '162LGgDoH',
        '7|15|35|19',
        'offsetHeig',
        'MwGwr',
        'bPzAr',
        'dReBn',
        '(100%)\x20tra',
        '255,\x20255,\x20',
        'transform',
        '8|39|10|34',
        'offsetWidt',
        'aDTdW',
        'xxx-large',
        '0.8)',
        'sByClassNa',
        'version\x201.',
        'SonzO',
        'ird.png',
        'e_wrapper',
        'MASvj',
        'hidden',
        'ById',
        'right',
        'VYKCy',
        'rotate(',
        '8CXZmsq',
        'DOMContent',
        'latePercen',
        'yMpqu',
        'pipes',
        'UtQKp',
        'scaleX(-1)',
        'createElem',
        'tick',
        'appendChil',
        'IMVYs',
        'LRuND',
        'lipped',
        'body',
        'bird_img',
        'voZqa',
        'ZESFl',
        '3LomDlX',
        'AFGsr',
        'replaceChi',
        'rgmzs',
        'DnBfF',
        'world',
        'deg)',
        'famSl',
        'ADnSA',
        'power',
        '1936068AJRXAy',
        'xTEGQ',
        '|20|36|28|',
        'top',
        'max',
        'bottom',
        'QUqSc',
        'XrEqq',
        'gXVariance'
    ];
    _0x4cd2 = function () {
        return _0x41d4f6;
    };
    return _0x4cd2();
}
function isHittingAPipe() {
    var _0x48f723 = _0x5965f5, _0x82628a = {
            'ArlUo': _0x48f723(0xf0),
            'zdwTd': _0x48f723(0x1a5),
            'wMlOk': function (_0x543275, _0x1602f6) {
                return _0x543275 <= _0x1602f6;
            },
            'famSl': function (_0x30ec5e, _0x208179) {
                return _0x30ec5e <= _0x208179;
            },
            'MASvj': function (_0x635467, _0x482bf0) {
                return _0x635467 <= _0x482bf0;
            }
        }, _0x45aa7a = document[_0x48f723(0x1db) + _0x48f723(0x17b)](_0x82628a[_0x48f723(0x1a8)])[_0x48f723(0x1c6) + _0x48f723(0xea) + 't'](), _0x491622 = document[_0x48f723(0x1db) + _0x48f723(0x174) + 'me'](_0x82628a[_0x48f723(0x157)]);
    for (var _0x5c1f98 of _0x491622) {
        var _0x572a7e = _0x5c1f98[_0x48f723(0x1c6) + _0x48f723(0xea) + 't']();
        if (_0x82628a[_0x48f723(0x144)](_0x45aa7a[_0x48f723(0x162)], _0x572a7e[_0x48f723(0x17c)]) && _0x82628a[_0x48f723(0x197)](_0x572a7e[_0x48f723(0x162)], _0x45aa7a[_0x48f723(0x17c)]) && _0x82628a[_0x48f723(0x179)](_0x45aa7a[_0x48f723(0x19d)], _0x572a7e[_0x48f723(0x19f)]) && _0x82628a[_0x48f723(0x197)](_0x572a7e[_0x48f723(0x19d)], _0x45aa7a[_0x48f723(0x19f)]))
            return !![];
    }
    return ![];
}
function drawPipe(_0x3396b5) {
    var _0x38a126 = _0x5965f5, _0x415d01 = {
            'SwjAH': _0x38a126(0x1a7) + _0x38a126(0x107) + _0x38a126(0x12c) + _0x38a126(0x119) + _0x38a126(0x16f) + _0x38a126(0x10d) + _0x38a126(0x1dd) + _0x38a126(0x1ce) + _0x38a126(0x164) + _0x38a126(0x1bb) + _0x38a126(0x152) + '36',
            'gMHml': _0x38a126(0x10c) + _0x38a126(0x18b),
            'TlbUq': _0x38a126(0xf7) + _0x38a126(0x178),
            'oeVJq': _0x38a126(0x1c0),
            'QExvj': _0x38a126(0x153),
            'BlxYD': _0x38a126(0x1a5),
            'JGPUZ': _0x38a126(0x148),
            'HsUix': _0x38a126(0x11a),
            'DqxdC': _0x38a126(0x131) + _0x38a126(0xf5),
            'HuSJN': _0x38a126(0x1ab),
            'AFGsr': _0x38a126(0x133),
            'SonzO': _0x38a126(0x130) + _0x38a126(0x16c) + _0x38a126(0xf4) + 'x)',
            'slxsR': _0x38a126(0xee),
            'vksZq': _0x38a126(0xf9) + _0x38a126(0x126),
            'ofszM': function (_0x5301ce, _0x58dc73) {
                return _0x5301ce + _0x58dc73;
            },
            'VYKCy': _0x38a126(0x185),
            'wumwo': _0x38a126(0x130) + _0x38a126(0xec),
            'bjtua': _0x38a126(0x185) + _0x38a126(0x146) + ')',
            'TVkOC': _0x38a126(0x130) + _0x38a126(0x1b3),
            'zYJbk': _0x38a126(0xf7) + 'e',
            'IMVYs': _0x38a126(0x130) + _0x38a126(0x137) + _0x38a126(0x10e),
            'dReBn': _0x38a126(0xf7) + _0x38a126(0xfc)
        }, _0x2070d4 = _0x415d01[_0x38a126(0x1ca)][_0x38a126(0x120)]('|'), _0x22af44 = -0x1 * 0x19d6 + 0x169e + 0x338;
    while (!![]) {
        switch (_0x2070d4[_0x22af44++]) {
        case '0':
            _0xda4350[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x1aa)];
            continue;
        case '1':
            _0x378b92[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x13d)];
            continue;
        case '2':
            var _0x23da65 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1a9)]);
            continue;
        case '3':
            _0x12183a[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x108)];
            continue;
        case '4':
            _0x54b131[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x150)];
            continue;
        case '5':
            var _0x12183a = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1cc)]);
            continue;
        case '6':
            var _0x559594 = document[_0x38a126(0x1db) + _0x38a126(0x17b)](_0x415d01[_0x38a126(0xef)]);
            continue;
        case '7':
            _0x23da65[_0x38a126(0x188) + 'd'](_0xda4350);
            continue;
        case '8':
            var _0x485d08 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1cc)]);
            continue;
        case '9':
            _0x378b92[_0x38a126(0x188) + 'd'](_0x485d08);
            continue;
        case '10':
            _0x485d08[_0x38a126(0x127)] = _0x415d01[_0x38a126(0x15f)];
            continue;
        case '11':
            Object[_0x38a126(0x1da)](_0x54b131[_0x38a126(0x15a)], {
                'position': _0x415d01[_0x38a126(0x10f)],
                'width': visualConfig[_0x38a126(0x13c) + 'th'] || -0xa9e + -0xbf + 0xb7a,
                'left': visualConfig[_0x38a126(0x1bd) + 't'] || -0x3be + 0x6b * 0x2f + 0x7c9 * -0x2,
                'height': _0x415d01[_0x38a126(0x191)],
                'bottom': _0x3396b5['y'],
                'transform': _0x415d01[_0x38a126(0x176)]
            });
            continue;
        case '12':
            var _0x378b92 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1a9)]);
            continue;
        case '13':
            _0x2d84b5[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x123)];
            continue;
        case '14':
            _0x23da65[_0x38a126(0x188) + 'd'](_0x12183a);
            continue;
        case '15':
            _0x559594[_0x38a126(0x188) + 'd'](_0x2d84b5);
            continue;
        case '16':
            _0x378b92[_0x38a126(0x188) + 'd'](_0x54b131);
            continue;
        case '17':
            var _0x262e33 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1cc)]);
            continue;
        case '18':
            _0x262e33[_0x38a126(0x127)] = _0x415d01[_0x38a126(0x15f)];
            continue;
        case '19':
            _0x19ab99[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x150)];
            continue;
        case '20':
            _0x23da65[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x1d0)];
            continue;
        case '21':
            Object[_0x38a126(0x1da)](_0xda4350[_0x38a126(0x15a)], {
                'width': _0x415d01[_0x38a126(0x191)],
                'position': _0x415d01[_0x38a126(0x10f)],
                'bottom': _0x415d01[_0x38a126(0x1d3)](_0x3396b5['y'], config[_0x38a126(0xf8) + _0x38a126(0x1d6)]),
                'transform': _0x415d01[_0x38a126(0x17d)],
                'zIndex': -(-0x3 * 0x26 + -0x14f * -0x7 + -0x8b6),
                'height': _0x415d01[_0x38a126(0x191)]
            });
            continue;
        case '22':
            Object[_0x38a126(0x1da)](_0x19ab99[_0x38a126(0x15a)], {
                'position': _0x415d01[_0x38a126(0x10f)],
                'width': visualConfig[_0x38a126(0x13c) + 'th'],
                'left': visualConfig[_0x38a126(0x1bd) + 't'],
                'height': _0x415d01[_0x38a126(0x191)],
                'bottom': _0x415d01[_0x38a126(0x1d3)](_0x3396b5['y'], config[_0x38a126(0xf8) + _0x38a126(0x1d6)]),
                'transform': _0x415d01[_0x38a126(0x114)]
            });
            continue;
        case '23':
            Object[_0x38a126(0x1da)](_0x378b92[_0x38a126(0x15a)], {
                'position': _0x415d01[_0x38a126(0x10f)],
                'width': _0x415d01[_0x38a126(0x191)],
                'height': _0x415d01[_0x38a126(0x191)]
            });
            continue;
        case '24':
            Object[_0x38a126(0x1da)](_0x23da65[_0x38a126(0x15a)], {
                'position': _0x415d01[_0x38a126(0x10f)],
                'width': _0x415d01[_0x38a126(0x191)],
                'height': _0x415d01[_0x38a126(0x191)]
            });
            continue;
        case '25':
            _0x2d84b5[_0x38a126(0x188) + 'd'](_0x378b92);
            continue;
        case '26':
            var _0x54b131 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1a9)]);
            continue;
        case '27':
            var _0x2d84b5 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1a9)]);
            continue;
        case '28':
            Object[_0x38a126(0x1da)](_0x12183a[_0x38a126(0x15a)], {
                'width': _0x415d01[_0x38a126(0x191)],
                'position': _0x415d01[_0x38a126(0x10f)],
                'bottom': _0x415d01[_0x38a126(0x1d3)](_0x3396b5['y'], config[_0x38a126(0xf8) + _0x38a126(0x1d6)]),
                'transform': _0x415d01[_0x38a126(0x12e)]
            });
            continue;
        case '29':
            _0x2d84b5[_0x38a126(0x188) + 'd'](_0x23da65);
            continue;
        case '30':
            var _0x19ab99 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1a9)]);
            continue;
        case '31':
            Object[_0x38a126(0x1da)](_0x2d84b5[_0x38a126(0x15a)], {
                'left': _0x3396b5['x'],
                'position': _0x415d01[_0x38a126(0x10f)],
                'height': _0x415d01[_0x38a126(0x191)],
                'width': visualConfig[_0x38a126(0x113) + 'x']
            });
            continue;
        case '32':
            Object[_0x38a126(0x1da)](_0x262e33[_0x38a126(0x15a)], {
                'width': _0x415d01[_0x38a126(0x191)],
                'position': _0x415d01[_0x38a126(0x10f)],
                'bottom': _0x3396b5['y'],
                'transform': _0x415d01[_0x38a126(0x1cb)]
            });
            continue;
        case '33':
            _0x262e33[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x1d1)];
            continue;
        case '34':
            Object[_0x38a126(0x1da)](_0x485d08[_0x38a126(0x15a)], {
                'width': _0x415d01[_0x38a126(0x191)],
                'position': _0x415d01[_0x38a126(0x10f)],
                'bottom': _0x3396b5['y'],
                'transform': _0x415d01[_0x38a126(0x189)],
                'zIndex': -(-0x53d * -0x4 + -0x8f5 * -0x3 + -0x2fd2),
                'height': _0x415d01[_0x38a126(0x191)]
            });
            continue;
        case '35':
            var _0xda4350 = document[_0x38a126(0x186) + _0x38a126(0x1b4)](_0x415d01[_0x38a126(0x1cc)]);
            continue;
        case '36':
            _0x23da65[_0x38a126(0x188) + 'd'](_0x19ab99);
            continue;
        case '37':
            _0x12183a[_0x38a126(0x127)] = _0x415d01[_0x38a126(0x15f)];
            continue;
        case '38':
            _0xda4350[_0x38a126(0x127)] = _0x415d01[_0x38a126(0x15f)];
            continue;
        case '39':
            _0x485d08[_0x38a126(0x111)] = _0x415d01[_0x38a126(0x16b)];
            continue;
        case '40':
            _0x378b92[_0x38a126(0x188) + 'd'](_0x262e33);
            continue;
        }
        break;
    }
}
function renderElements() {
    var _0x27118f = _0x5965f5, _0x1fdbb0 = {
            'bPzAr': _0x27118f(0x1c9) + _0x27118f(0x1ad) + _0x27118f(0x11d) + _0x27118f(0x11e) + _0x27118f(0x167) + _0x27118f(0x19c) + _0x27118f(0x1d8) + _0x27118f(0x15e) + _0x27118f(0x149) + _0x27118f(0x1b9),
            'IocOM': _0x27118f(0x1ab),
            'uRxdm': _0x27118f(0x133),
            'xTEGQ': _0x27118f(0x1c0),
            'UtQKp': _0x27118f(0x12a),
            'uXNCu': _0x27118f(0x148),
            'AeywM': _0x27118f(0x195),
            'PzorW': _0x27118f(0x172),
            'FYlXt': _0x27118f(0xe9) + _0x27118f(0x16d) + _0x27118f(0x173),
            'dezZE': _0x27118f(0xf6) + _0x27118f(0x102),
            'XKVmE': _0x27118f(0xfe),
            'yqrPE': _0x27118f(0x11a),
            'voZqa': _0x27118f(0x158),
            'LRuND': _0x27118f(0x14c),
            'zTdIV': _0x27118f(0x17a),
            'ADnSA': _0x27118f(0x159),
            'yVYEJ': _0x27118f(0x165) + _0x27118f(0xeb) + _0x27118f(0x1bf),
            'pbRhN': _0x27118f(0x124),
            'ymxpq': _0x27118f(0x18d),
            'CPOMt': function (_0x1cc827, _0x78f2ae) {
                return _0x1cc827 * _0x78f2ae;
            },
            'HQeaI': function (_0x307c8c, _0x204242) {
                return _0x307c8c * _0x204242;
            },
            'RhpPT': function (_0x27a9ed, _0x465535) {
                return _0x27a9ed * _0x465535;
            },
            'Vszok': _0x27118f(0x1c7) + _0x27118f(0x177),
            'ZESFl': _0x27118f(0x10b) + _0x27118f(0x1ac) + _0x27118f(0x151),
            'rbTkg': _0x27118f(0x125),
            'QUqSc': _0x27118f(0xf0)
        }, _0x3dd0b1 = _0x1fdbb0[_0x27118f(0x16a)][_0x27118f(0x120)]('|'), _0x31bd53 = -0x2398 + -0x8ef + 0x2c87 * 0x1;
    while (!![]) {
        switch (_0x3dd0b1[_0x31bd53++]) {
        case '0':
            _0x2f50db[_0x27118f(0x188) + 'd'](_0x4b977d);
            continue;
        case '1':
            Object[_0x27118f(0x1da)](_0x4b977d[_0x27118f(0x15a)], {
                'position': _0x1fdbb0[_0x27118f(0x1a6)],
                'height': _0x1fdbb0[_0x27118f(0xed)],
                'width': _0x1fdbb0[_0x27118f(0xed)],
                'transform': _0x27118f(0x1b2) + visualConfig[_0x27118f(0x1b8) + _0x27118f(0x181) + 't'] + '%)'
            });
            continue;
        case '2':
            Object[_0x27118f(0x1da)](_0x24e768[_0x27118f(0x15a)], { 'height': _0x1fdbb0[_0x27118f(0xed)] });
            continue;
        case '3':
            _0x2f50db[_0x27118f(0x188) + 'd'](_0x73b183);
            continue;
        case '4':
            var _0x34a995 = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        case '5':
            _0x1cb493['id'] = _0x1fdbb0[_0x27118f(0x184)];
            continue;
        case '6':
            var _0x24e768 = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        case '7':
            _0x2f50db[_0x27118f(0x188) + 'd'](_0x1cb493);
            continue;
        case '8':
            var _0x1f573d = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x101)]);
            continue;
        case '9':
            _0x4b977d['id'] = _0x1fdbb0[_0x27118f(0xe8)];
            continue;
        case '10':
            _0x2f50db[_0x27118f(0x188) + 'd'](_0x34a995);
            continue;
        case '11':
            _0x23d257[_0x27118f(0x188) + 'd'](_0x58e0f9);
            continue;
        case '12':
            Object[_0x27118f(0x1da)](_0x1cb493[_0x27118f(0x15a)], {
                'position': _0x1fdbb0[_0x27118f(0x1a6)],
                'fontSize': _0x1fdbb0[_0x27118f(0x11c)],
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x1fdbb0[_0x27118f(0x1d9)],
                'border': _0x1fdbb0[_0x27118f(0x13a)],
                'borderRadius': _0x1fdbb0[_0x27118f(0xf2)],
                'zIndex': 0x1
            });
            continue;
        case '13':
            _0x24e768['id'] = _0x1fdbb0[_0x27118f(0x143)];
            continue;
        case '14':
            _0x73b183['id'] = _0x1fdbb0[_0x27118f(0x18e)];
            continue;
        case '15':
            var _0x23d257 = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        case '16':
            document[_0x27118f(0x18c)][_0x27118f(0x188) + 'd'](_0x2f50db);
            continue;
        case '17':
            _0x4b977d[_0x27118f(0x188) + 'd'](_0x24e768);
            continue;
        case '18':
            var _0x1cb493 = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        case '19':
            Object[_0x27118f(0x1da)](_0x23d257[_0x27118f(0x15a)], {
                'position': _0x1fdbb0[_0x27118f(0x1a6)],
                'width': config[_0x27118f(0x11b)],
                'height': config[_0x27118f(0x11b)]
            });
            continue;
        case '20':
            _0x4b977d[_0x27118f(0x188) + 'd'](_0x23d257);
            continue;
        case '21':
            var _0x4b977d = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        case '22':
            Object[_0x27118f(0x1da)](_0x2f50db[_0x27118f(0x15a)], {
                'height': _0x1fdbb0[_0x27118f(0xed)],
                'position': _0x1fdbb0[_0x27118f(0x18a)],
                'overflow': _0x1fdbb0[_0x27118f(0x13f)],
                'userSelect': _0x1fdbb0[_0x27118f(0x198)]
            });
            continue;
        case '23':
            var _0x73b183 = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        case '24':
            _0x73b183[_0x27118f(0x10a)] = _0x1fdbb0[_0x27118f(0x14f)];
            continue;
        case '25':
            Object[_0x27118f(0x1da)](_0x1f573d[_0x27118f(0x15a)], {
                'position': _0x1fdbb0[_0x27118f(0x1a6)],
                'height': _0x1fdbb0[_0x27118f(0xed)],
                'width': _0x1fdbb0[_0x27118f(0xed)]
            });
            continue;
        case '26':
            _0x2f50db['id'] = _0x1fdbb0[_0x27118f(0x136)];
            continue;
        case '27':
            _0x1f573d['id'] = _0x1fdbb0[_0x27118f(0x115)];
            continue;
        case '28':
            Object[_0x27118f(0x1da)](_0x58e0f9[_0x27118f(0x15a)], {
                'position': _0x1fdbb0[_0x27118f(0x1a6)],
                'bottom': _0x1fdbb0[_0x27118f(0x1b6)](-(0xaa8 + 0x3 * -0x9dd + -0x1 * -0x12ef + 0.16), config[_0x27118f(0x11b)]),
                'top': _0x1fdbb0[_0x27118f(0x1b6)](-(-0xa75 * -0x1 + 0xd6a + -0x3f * 0x61 + 0.25), config[_0x27118f(0x11b)]),
                'right': _0x1fdbb0[_0x27118f(0x141)](-(-0x1 * -0x1289 + -0x1acf * -0x1 + -0x8 * 0x5ab + 0.25), config[_0x27118f(0x11b)]),
                'left': _0x1fdbb0[_0x27118f(0x1c3)](-(0x16a7 + 0x9 * -0x16d + -0x1 * 0x9d2 + 0.25), config[_0x27118f(0x11b)])
            });
            continue;
        case '29':
            _0x1f573d[_0x27118f(0x127)] = _0x1fdbb0[_0x27118f(0xfa)];
            continue;
        case '30':
            var _0x2f50db = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        case '31':
            _0x34a995['id'] = 'bg';
            continue;
        case '32':
            Object[_0x27118f(0x1da)](_0x73b183[_0x27118f(0x15a)], {
                'position': _0x1fdbb0[_0x27118f(0x1a6)],
                'fontSize': _0x1fdbb0[_0x27118f(0x11c)],
                'bottom': 0x0,
                'right': 0x0,
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x1fdbb0[_0x27118f(0x1d9)],
                'border': _0x1fdbb0[_0x27118f(0x13a)],
                'borderRadius': _0x1fdbb0[_0x27118f(0xf2)],
                'zIndex': 0x1
            });
            continue;
        case '33':
            _0x58e0f9[_0x27118f(0x188) + 'd'](_0x1f573d);
            continue;
        case '34':
            Object[_0x27118f(0x1da)](_0x34a995[_0x27118f(0x15a)], {
                'background': _0x1fdbb0[_0x27118f(0x18f)],
                'backgroundSize': _0x1fdbb0[_0x27118f(0x104)],
                'width': _0x1fdbb0[_0x27118f(0xed)],
                'height': _0x1fdbb0[_0x27118f(0xed)],
                'position': _0x1fdbb0[_0x27118f(0x1a6)],
                'zIndex': -(-0x1f5e + -0x2572 + 0x44d1)
            });
            continue;
        case '35':
            _0x23d257['id'] = _0x1fdbb0[_0x27118f(0x1a0)];
            continue;
        case '36':
            var _0x58e0f9 = document[_0x27118f(0x186) + _0x27118f(0x1b4)](_0x1fdbb0[_0x27118f(0x19b)]);
            continue;
        }
        break;
    }
}
function flap() {
    var _0x2af74a = _0x5965f5;
    state[_0x2af74a(0x1bc)] = config[_0x2af74a(0x199)];
}
function updateBird() {
    var _0x35b72b = _0x5965f5, _0x4c76a8 = {
            'YzzlQ': function (_0x1a2b9a, _0x15614d) {
                return _0x1a2b9a * _0x15614d;
            },
            'DibqU': function (_0x47d956, _0x25ff24) {
                return _0x47d956 + _0x25ff24;
            }
        };
    state[_0x35b72b(0x1bc)] -= _0x4c76a8[_0x35b72b(0x12f)](config[_0x35b72b(0x128)], visualConfig[_0x35b72b(0x187)]), state[_0x35b72b(0x1b7)] = _0x4c76a8[_0x35b72b(0x121)](state[_0x35b72b(0x1b7)], _0x4c76a8[_0x35b72b(0x12f)](state[_0x35b72b(0x1bc)], visualConfig[_0x35b72b(0x187)]));
}
function randomBetween(_0x1d5205, _0x42dbf9) {
    var _0x491d2d = _0x5965f5, _0x4190e4 = {
            'OlwYZ': function (_0x5b0d92, _0x54c8cc) {
                return _0x5b0d92 + _0x54c8cc;
            },
            'kLpXd': function (_0x1bbb3a, _0x303f95) {
                return _0x1bbb3a * _0x303f95;
            },
            'XrEqq': function (_0x4044cb, _0x5e86b6) {
                return _0x4044cb - _0x5e86b6;
            }
        };
    return _0x4190e4[_0x491d2d(0x1c2)](_0x1d5205, _0x4190e4[_0x491d2d(0x1dc)](_0x4190e4[_0x491d2d(0x1a1)](_0x42dbf9, _0x1d5205), Math[_0x491d2d(0xfd)]()));
}
function maybeMakeNewPipe() {
    var _0x5dc20e = _0x5965f5, _0x29a46a = {
            'Jtboq': _0x5dc20e(0x1a3) + '5',
            'nhiTU': function (_0x1cf3d7, _0x221fca) {
                return _0x1cf3d7 > _0x221fca;
            },
            'DnBfF': function (_0x3e1718, _0x4fb61d) {
                return _0x3e1718 * _0x4fb61d;
            },
            'vrVbw': function (_0x455dad, _0x19ae29) {
                return _0x455dad / _0x19ae29;
            },
            'yYIbL': function (_0xe62988, _0x33c8a5) {
                return _0xe62988 < _0x33c8a5;
            },
            'SBFJW': function (_0x36333e, _0x31f5be) {
                return _0x36333e(_0x31f5be);
            },
            'qfDHz': function (_0x4b8609, _0x35a34e) {
                return _0x4b8609 + _0x35a34e;
            }
        }, _0x290ef3 = _0x29a46a[_0x5dc20e(0x1af)][_0x5dc20e(0x120)]('|'), _0x28f6dc = 0x1d78 + 0xd6a + -0x2ae2;
    while (!![]) {
        switch (_0x290ef3[_0x28f6dc++]) {
        case '0':
            for (var _0x2925d4 of state[_0x5dc20e(0x183)]) {
                _0x1a80e3 = Math[_0x5dc20e(0x19e)](_0x1a80e3, _0x2925d4['x']), _0x29a46a[_0x5dc20e(0x129)](_0x2925d4['x'], -_0x548153) && _0x5f1b46[_0x5dc20e(0x14a)](_0x2925d4);
            }
            continue;
        case '1':
            var _0x1a80e3 = 0x1 * -0xef2 + 0x2017 + -0x1125;
            continue;
        case '2':
            state[_0x5dc20e(0x183)] = _0x5f1b46;
            continue;
        case '3':
            var _0x548153 = _0x29a46a[_0x5dc20e(0x194)](_0x29a46a[_0x5dc20e(0x194)](document[_0x5dc20e(0x18c)][_0x5dc20e(0x170) + 'h'], 0x144b + -0x1 * -0x207d + -0x34c7 + 0.5), _0x29a46a[_0x5dc20e(0x105)](visualConfig[_0x5dc20e(0x1b8) + _0x5dc20e(0x181) + 't'], 0x7f * -0x5 + 0x3 * -0x574 + 0x133b));
            continue;
        case '4':
            var _0x5f1b46 = [];
            continue;
        case '5':
            _0x29a46a[_0x5dc20e(0x109)](_0x1a80e3, config[_0x5dc20e(0x116) + _0x5dc20e(0x160)]) && _0x29a46a[_0x5dc20e(0x1d7)](makePipe, _0x29a46a[_0x5dc20e(0x13e)](config[_0x5dc20e(0x116) + _0x5dc20e(0x160)], _0x29a46a[_0x5dc20e(0x194)](config[_0x5dc20e(0x140) + 'gX'], _0x29a46a[_0x5dc20e(0x1d7)](randomBetween, ...config[_0x5dc20e(0x140) + _0x5dc20e(0x1a2)]))));
            continue;
        }
        break;
    }
}
var vars = Object[_0x5965f5(0x1cf)]({
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
    var _0x331426 = _0x5965f5, _0x551847 = {
            'SCjzf': _0x331426(0x180) + _0x331426(0xe7),
            'yMpqu': function (_0x3c25e6) {
                return _0x3c25e6();
            }
        };
    function _0x23feb4() {
        var _0x61206b = _0x331426;
        document[_0x61206b(0x163) + _0x61206b(0x15c)](_0x551847[_0x61206b(0x118)], () => ready());
    }
    _0x551847[_0x331426(0x182)](_0x23feb4);
}());