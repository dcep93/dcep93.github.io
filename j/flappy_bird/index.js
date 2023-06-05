var _0x4b05c7 = _0x4b57;
(function (_0x544063, _0x22a0c4) {
    var _0x23b6af = _0x4b57, _0x16eba7 = _0x544063();
    while (!![]) {
        try {
            var _0x5c2d68 = -parseInt(_0x23b6af(0x16f)) / (-0x1e8 * 0x6 + 0x1b98 + 0x5 * -0x33b) * (parseInt(_0x23b6af(0x1be)) / (-0x1682 * -0x1 + 0x1ae1 + -0x3161 * 0x1)) + -parseInt(_0x23b6af(0x205)) / (-0x2262 + 0x86 * 0x2b + 0xbe3) * (-parseInt(_0x23b6af(0x20b)) / (0x4bd * 0x5 + 0x8c * 0x15 + 0x2329 * -0x1)) + -parseInt(_0x23b6af(0x151)) / (0xfd9 + -0x1be4 + 0xc10) * (-parseInt(_0x23b6af(0x1a4)) / (-0x15cf + 0x9fa + 0xbdb)) + parseInt(_0x23b6af(0x144)) / (0x23ed * 0x1 + -0xdf7 + -0x1 * 0x15ef) * (-parseInt(_0x23b6af(0x212)) / (-0x6 * -0x3b9 + -0x1ff2 + 0x9a4)) + parseInt(_0x23b6af(0x21e)) / (-0x1be8 + -0x3 * 0x20b + 0x2212 * 0x1) + parseInt(_0x23b6af(0x1c7)) / (-0x6ae + -0x2b * -0x5b + -0x891) * (-parseInt(_0x23b6af(0x13e)) / (-0x97d + 0x9 * 0x31a + 0xd * -0x16a)) + -parseInt(_0x23b6af(0x1eb)) / (0x75a + 0x2c4 * 0x1 + -0xa12 * 0x1) * (-parseInt(_0x23b6af(0x189)) / (0x2057 * 0x1 + -0x988 + -0x16c2));
            if (_0x5c2d68 === _0x22a0c4)
                break;
            else
                _0x16eba7['push'](_0x16eba7['shift']());
        } catch (_0x8d787e) {
            _0x16eba7['push'](_0x16eba7['shift']());
        }
    }
}(_0xe2bc, -0x16a802 + 0x905 * 0x224 + 0x1218a4));
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
        0x56 * -0x54 + -0xd2d + 0x1 * 0x2965 + 0.7,
        -0x209b + -0x15ec + -0x205 * -0x1b + 0.9
    ],
    'pipeHeightYVariance': [
        -0x2 * -0xc11 + 0x11 * 0x1a2 + -0x453 * 0xc + 0.2,
        -0x3b8 + -0x92 * 0x3 + 0x56e + 0.7
    ],
    'birdHeightPx': 0x10b,
    'birdWidthPx': 0x1bc,
    'birdImgAspectRatio': (0xef3 * -0x2 + -0x65 * -0x5a + -0x344) / (-0x15f8 + -0xf88 + 0x26cd),
    'birdImgHeightPercentage': 0x7c,
    'birdImgOffsetBottomPx': 0x15,
    'birdImgOffsetRightPx': 0x41,
    'maxRotateDeg': 0x78,
    'rotateThreshold': 0xb4
};
function ready() {
    var _0x4a4268 = _0x4b57, _0x448d5f = {
            'ZELQZ': function (_0x316b8b, _0x1a19ea) {
                return _0x316b8b == _0x1a19ea;
            },
            'GflVl': function (_0x13797c, _0x10b757) {
                return _0x13797c == _0x10b757;
            },
            'MHYAw': _0x4a4268(0x223),
            'txhFC': function (_0x4b8459, _0x36b177) {
                return _0x4b8459 == _0x36b177;
            },
            'LlDpd': function (_0x26de42) {
                return _0x26de42();
            },
            'nThPb': function (_0x469145) {
                return _0x469145();
            },
            'tqKRD': function (_0x5f0bfc, _0x3e84cd, _0xd357cf) {
                return _0x5f0bfc(_0x3e84cd, _0xd357cf);
            }
        };
    _0x448d5f[_0x4a4268(0x17c)](renderElements), document[_0x4a4268(0x1bb)][_0x4a4268(0x1f3)] = function (_0x1c3001) {
        var _0x3f9bb4 = _0x4a4268;
        if (_0x448d5f[_0x3f9bb4(0x15c)](_0x1c3001[_0x3f9bb4(0x19f)], '\x20') || _0x448d5f[_0x3f9bb4(0x1f6)](_0x1c3001[_0x3f9bb4(0x14b)], _0x448d5f[_0x3f9bb4(0x16c)]) || _0x448d5f[_0x3f9bb4(0x182)](_0x1c3001[_0x3f9bb4(0x1ef)], 0x56 * -0x20 + -0x1 * 0xcd6 + 0x17b6))
            _0x448d5f[_0x3f9bb4(0x1d5)](flap);
    }, _0x448d5f[_0x4a4268(0x22e)](setInterval, () => tick(), vars[_0x4a4268(0x1f5)]);
}
function renderElements() {
    var _0x1d8956 = _0x4b57, _0x39d86f = {
            'mMaiD': _0x1d8956(0x167) + _0x1d8956(0x173) + _0x1d8956(0x170) + _0x1d8956(0x1b5) + _0x1d8956(0x162) + _0x1d8956(0x1df) + _0x1d8956(0x1cd) + _0x1d8956(0x152),
            'dQCtD': _0x1d8956(0x166),
            'LNjgZ': _0x1d8956(0x208),
            'wzqlE': _0x1d8956(0x190) + _0x1d8956(0x224) + _0x1d8956(0x22f),
            'DtRrB': _0x1d8956(0x146),
            'jyYbe': _0x1d8956(0x1ab),
            'WXGEB': _0x1d8956(0x1b9),
            'YmJLm': _0x1d8956(0x202),
            'pKigE': _0x1d8956(0x17f),
            'DLSPZ': _0x1d8956(0x1f4),
            'uPwYE': _0x1d8956(0x19b) + _0x1d8956(0x203),
            'oUsGC': function (_0x2b08f5) {
                return _0x2b08f5();
            },
            'dfOKy': _0x1d8956(0x197),
            'gFkNr': function (_0x5e988b, _0x46b198) {
                return _0x5e988b * _0x46b198;
            },
            'RZQxC': _0x1d8956(0x15e),
            'hunwY': _0x1d8956(0x1e0) + _0x1d8956(0x187) + _0x1d8956(0x225),
            'ozXly': _0x1d8956(0x1c8) + _0x1d8956(0x1d0),
            'FgiDy': _0x1d8956(0x1ae),
            'CTjYp': _0x1d8956(0x1aa),
            'VvLgF': _0x1d8956(0x164),
            'AjMej': _0x1d8956(0x1fc),
            'iLvAK': _0x1d8956(0x18e),
            'bKoJm': _0x1d8956(0x20f)
        }, _0x3d0d99 = _0x39d86f[_0x1d8956(0x191)][_0x1d8956(0x14f)]('|'), _0x352031 = 0x2521 + -0x9a * 0x33 + -0xd * 0x7f;
    while (!![]) {
        switch (_0x3d0d99[_0x352031++]) {
        case '0':
            var _0x27bc1d = document[_0x1d8956(0x218) + _0x1d8956(0x181)](_0x39d86f[_0x1d8956(0x1ba)]);
            continue;
        case '1':
            _0x32cf86['id'] = _0x39d86f[_0x1d8956(0x1c5)];
            continue;
        case '2':
            Object[_0x1d8956(0x1f8)](_0x38156f[_0x1d8956(0x17b)], {
                'background': _0x39d86f[_0x1d8956(0x147)],
                'backgroundSize': _0x39d86f[_0x1d8956(0x217)],
                'width': _0x39d86f[_0x1d8956(0x179)],
                'height': _0x39d86f[_0x1d8956(0x179)],
                'position': _0x39d86f[_0x1d8956(0x184)],
                'zIndex': -(0x2055 + 0x362 * 0x2 + 0x342 * -0xc)
            });
            continue;
        case '3':
            _0x592c95['id'] = _0x39d86f[_0x1d8956(0x210)];
            continue;
        case '4':
            var _0x592c95 = document[_0x1d8956(0x218) + _0x1d8956(0x181)](_0x39d86f[_0x1d8956(0x1ba)]);
            continue;
        case '5':
            _0x27bc1d['id'] = _0x39d86f[_0x1d8956(0x1a9)];
            continue;
        case '6':
            Object[_0x1d8956(0x1f8)](_0x27bc1d[_0x1d8956(0x17b)], { 'height': _0x39d86f[_0x1d8956(0x179)] });
            continue;
        case '7':
            _0x592c95[_0x1d8956(0x14e) + 'd'](_0x32cf86);
            continue;
        case '8':
            _0x2a56f1[_0x1d8956(0x14e) + 'd'](_0x592c95);
            continue;
        case '9':
            _0x2a56f1[_0x1d8956(0x14e) + 'd'](_0x501154);
            continue;
        case '10':
            _0x32cf86[_0x1d8956(0x14e) + 'd'](_0x585348);
            continue;
        case '11':
            var _0x585348 = document[_0x1d8956(0x218) + _0x1d8956(0x181)](_0x39d86f[_0x1d8956(0x1e9)]);
            continue;
        case '12':
            _0x585348[_0x1d8956(0x185)] = _0x39d86f[_0x1d8956(0x1a3)];
            continue;
        case '13':
            _0x39d86f[_0x1d8956(0x1e1)](draw);
            continue;
        case '14':
            _0x501154['id'] = _0x39d86f[_0x1d8956(0x19e)];
            continue;
        case '15':
            var _0x32cf86 = document[_0x1d8956(0x218) + _0x1d8956(0x181)](_0x39d86f[_0x1d8956(0x1ba)]);
            continue;
        case '16':
            Object[_0x1d8956(0x1f8)](_0x585348[_0x1d8956(0x17b)], {
                'position': _0x39d86f[_0x1d8956(0x184)],
                'height': vars[_0x1d8956(0x1bd) + _0x1d8956(0x22c) + _0x1d8956(0x1fb)] + '%',
                'aspectRatio': vars[_0x1d8956(0x1c3) + _0x1d8956(0x174)],
                'bottom': _0x39d86f[_0x1d8956(0x161)](-vars[_0x1d8956(0x209) + _0x1d8956(0x1c2) + 'x'], vars[_0x1d8956(0x1f0)]),
                'right': _0x39d86f[_0x1d8956(0x161)](-vars[_0x1d8956(0x209) + _0x1d8956(0x1c6)], vars[_0x1d8956(0x1f0)])
            });
            continue;
        case '17':
            Object[_0x1d8956(0x1f8)](_0x501154[_0x1d8956(0x17b)], {
                'position': _0x39d86f[_0x1d8956(0x184)],
                'fontSize': _0x39d86f[_0x1d8956(0x157)],
                'margin': 0xa,
                'padding': 0xa,
                'background': _0x39d86f[_0x1d8956(0x19d)],
                'border': _0x39d86f[_0x1d8956(0x16b)],
                'borderRadius': _0x39d86f[_0x1d8956(0x186)],
                'zIndex': 0x1
            });
            continue;
        case '18':
            _0x585348['id'] = _0x39d86f[_0x1d8956(0x1fe)];
            continue;
        case '19':
            var _0x2a56f1 = document[_0x1d8956(0x218) + _0x1d8956(0x181)](_0x39d86f[_0x1d8956(0x1ba)]);
            continue;
        case '20':
            _0x2a56f1[_0x1d8956(0x14e) + 'd'](_0x38156f);
            continue;
        case '21':
            _0x592c95[_0x1d8956(0x14e) + 'd'](_0x27bc1d);
            continue;
        case '22':
            Object[_0x1d8956(0x1f8)](_0x2a56f1[_0x1d8956(0x17b)], {
                'height': _0x39d86f[_0x1d8956(0x179)],
                'position': _0x39d86f[_0x1d8956(0x1e6)],
                'overflow': _0x39d86f[_0x1d8956(0x196)],
                'userSelect': _0x39d86f[_0x1d8956(0x204)]
            });
            continue;
        case '23':
            Object[_0x1d8956(0x1f8)](_0x592c95[_0x1d8956(0x17b)], {
                'position': _0x39d86f[_0x1d8956(0x184)],
                'height': _0x39d86f[_0x1d8956(0x179)],
                'width': _0x39d86f[_0x1d8956(0x179)],
                'transform': _0x1d8956(0x1f9) + vars[_0x1d8956(0x1af) + _0x1d8956(0x214) + 't'] + '%)'
            });
            continue;
        case '24':
            _0x2a56f1['id'] = _0x39d86f[_0x1d8956(0x160)];
            continue;
        case '25':
            var _0x501154 = document[_0x1d8956(0x218) + _0x1d8956(0x181)](_0x39d86f[_0x1d8956(0x1ba)]);
            continue;
        case '26':
            document[_0x1d8956(0x1bb)][_0x1d8956(0x14e) + 'd'](_0x2a56f1);
            continue;
        case '27':
            _0x38156f['id'] = 'bg';
            continue;
        case '28':
            var _0x38156f = document[_0x1d8956(0x218) + _0x1d8956(0x181)](_0x39d86f[_0x1d8956(0x1ba)]);
            continue;
        case '29':
            Object[_0x1d8956(0x1f8)](_0x32cf86[_0x1d8956(0x17b)], {
                'position': _0x39d86f[_0x1d8956(0x184)],
                'width': _0x39d86f[_0x1d8956(0x161)](vars[_0x1d8956(0x172) + 'x'], vars[_0x1d8956(0x1f0)]),
                'height': _0x39d86f[_0x1d8956(0x161)](vars[_0x1d8956(0x17e) + 'Px'], vars[_0x1d8956(0x1f0)])
            });
            continue;
        }
        break;
    }
}
function flap() {
    var _0x2829b0 = _0x4b57, _0x1b6fb8 = {
            'zsIZw': function (_0x2e8ea6) {
                return _0x2e8ea6();
            }
        };
    !vars[_0x2829b0(0x178)] && _0x1b6fb8[_0x2829b0(0x21f)](startGame), vars[_0x2829b0(0x21c)] = vars[_0x2829b0(0x183)];
}
function _0x4b57(_0x566e1d, _0x45e081) {
    var _0x58a92f = _0xe2bc();
    return _0x4b57 = function (_0x24a488, _0x589f4d) {
        _0x24a488 = _0x24a488 - (-0x22de + -0x1 * -0xde7 + 0x1634);
        var _0x9be1c1 = _0x58a92f[_0x24a488];
        return _0x9be1c1;
    }, _0x4b57(_0x566e1d, _0x45e081);
}
function tick() {
    var _0x2de928 = _0x4b57, _0x52b45b = {
            'sWDGO': _0x2de928(0x168) + _0x2de928(0x155),
            'dHiyb': function (_0x2732a0, _0x588cb5) {
                return _0x2732a0 / _0x588cb5;
            },
            'lPAsQ': function (_0x1f3e72, _0x8488bc) {
                return _0x1f3e72 * _0x8488bc;
            },
            'GtCfa': function (_0x36a3ba, _0x4e4ec4) {
                return _0x36a3ba + _0x4e4ec4;
            },
            'OwAtR': function (_0x391ece, _0x4edbdd) {
                return _0x391ece * _0x4edbdd;
            },
            'QYKcC': function (_0x19dfd9) {
                return _0x19dfd9();
            },
            'FeEoQ': function (_0x3c54f9) {
                return _0x3c54f9();
            },
            'fryuf': function (_0x2843f8) {
                return _0x2843f8();
            },
            'PLXRx': function (_0x1ecdac, _0x24b9b5) {
                return _0x1ecdac < _0x24b9b5;
            },
            'TdpfG': function (_0x3386f3) {
                return _0x3386f3();
            }
        }, _0x1d141a = _0x52b45b[_0x2de928(0x1c0)][_0x2de928(0x14f)]('|'), _0x56ccd0 = 0x58 * 0x25 + 0x175c + -0x1 * 0x2414;
    while (!![]) {
        switch (_0x1d141a[_0x56ccd0++]) {
        case '0':
            vars[_0x2de928(0x21c)] -= _0x52b45b[_0x2de928(0x169)](_0x52b45b[_0x2de928(0x140)](vars[_0x2de928(0x18a)], vars[_0x2de928(0x1f5)]), -0xf * 0x89 + 0x1 * -0x963 + 0x1552);
            continue;
        case '1':
            vars[_0x2de928(0x18d)] = _0x52b45b[_0x2de928(0x175)](vars[_0x2de928(0x18d)], _0x52b45b[_0x2de928(0x169)](_0x52b45b[_0x2de928(0x18c)](vars[_0x2de928(0x21c)], vars[_0x2de928(0x1f5)]), -0x21e1 + 0x17e8 + 0x13 * 0xbb));
            continue;
        case '2':
            _0x52b45b[_0x2de928(0x153)](draw);
            continue;
        case '3':
            _0x52b45b[_0x2de928(0x153)](updatePipes);
            continue;
        case '4':
            vars[_0x2de928(0x197)] += _0x52b45b[_0x2de928(0x169)](vars[_0x2de928(0x1f5)], 0x48b * -0x8 + -0x8e * -0x1c + 0xec * 0x17);
            continue;
        case '5':
            if (_0x52b45b[_0x2de928(0x227)](isHittingAPipe)) {
                _0x52b45b[_0x2de928(0x1c9)](endGame);
                return;
            }
            continue;
        case '6':
            if (_0x52b45b[_0x2de928(0x222)](vars[_0x2de928(0x18d)], 0x24f5 + -0x726 + -0x1dcf)) {
                _0x52b45b[_0x2de928(0x1d2)](endGame);
                return;
            }
            continue;
        case '7':
            if (!vars[_0x2de928(0x178)])
                return;
            continue;
        }
        break;
    }
}
function _0xe2bc() {
    var _0x13c019 = [
        'innerText',
        '611NkcXOM',
        'gravity',
        'unOmA',
        'OwAtR',
        'altitude',
        'none',
        '\x20scaleY(-1',
        'url(assets',
        'mMaiD',
        'yaxoy',
        'NRnDI',
        'atan',
        'e_wrapper',
        'AjMej',
        'score',
        'IRbaQ',
        'iMkvH',
        'bottom_pip',
        './assets/b',
        'nUXHg',
        'hunwY',
        'dfOKy',
        'key',
        './assets/p',
        'dNLlB',
        'stener',
        'uPwYE',
        '6rwinUo',
        'pipeGapPx',
        'vOFFj',
        'WeddN',
        'top_pipe',
        'pKigE',
        'bird_img',
        '100%',
        'cTPDp',
        'iuXzo',
        '10px',
        'worldTrans',
        'gXVariance',
        'ffGda',
        'uTRyu',
        '21|0|10|27',
        'NCUnm',
        '8|0|5|6|21',
        '|1|15|11|3',
        '6|25|20|13',
        'rotate(',
        'absolute',
        'dQCtD',
        'body',
        'offsetWidt',
        'birdImgHei',
        '330sPWCml',
        'pipeBuffer',
        'sWDGO',
        'tkOsR',
        'setBottomP',
        'birdImgAsp',
        'hqgyE',
        'LNjgZ',
        'setRightPx',
        '28870GWlUry',
        '2px\x20solid\x20',
        'fryuf',
        '(100%)',
        'YVariance',
        'offsetHeig',
        '16|10|25|1',
        'SypTL',
        'pipes',
        'black',
        'arPx',
        'TdpfG',
        'FIjTy',
        'leY(-1)',
        'LlDpd',
        'pipeWidthP',
        'jNUWL',
        '1|23|16|29',
        'top_pipe_w',
        'DSRQh',
        'maxRotateD',
        'JaiVM',
        'translateY',
        'nmnyF',
        '|11|18|12|',
        'rgba(255,\x20',
        'oUsGC',
        'qdAsN',
        'iflEi',
        'egURg',
        'pipeHeight',
        'VvLgF',
        'deg)',
        'QnNCl',
        'DLSPZ',
        'XYgqh',
        '366384JVwmbw',
        'VNoVP',
        '6|5|1|0|2|',
        'KSOHL',
        'keyCode',
        'birdScale',
        'OwhxT',
        'PqSEE',
        'onkeydown',
        'img',
        'tick',
        'GflVl',
        'scnEF',
        'assign',
        'translate(',
        '2|3|0|4|1|',
        'age',
        'hidden',
        'HpqcH',
        'CTjYp',
        '|8|5|9|6|2',
        'yIYzw',
        'hHSNM',
        'world',
        'ird.png',
        'iLvAK',
        '3291HTPnXB',
        'lnDcq',
        '17|28|12|4',
        'bird',
        'birdImgOff',
        'getElement',
        '3172xdFPuO',
        'bottom',
        'random',
        'qCSwo',
        'game',
        'YmJLm',
        'lipped',
        '24ADHoaK',
        'ldren',
        'latePercen',
        'aoxgJ',
        'shold',
        'DtRrB',
        'createElem',
        'toFixed',
        'addEventLi',
        'OIKAK',
        'speed',
        'pipeReappe',
        '2965572UlnumU',
        'zsIZw',
        'Lzmlr',
        'transform',
        'PLXRx',
        'Space',
        '/backgroun',
        '0.8)',
        'gNDEt',
        'FeEoQ',
        'bmkRI',
        'pipeSpacin',
        'kXQuA',
        'qiCfI',
        'ghtPercent',
        'XPx',
        'tqKRD',
        'd.png)',
        'lastX',
        'e_flipped',
        '693cSyIxi',
        'rapper',
        'lPAsQ',
        '(100%)\x20sca',
        'className',
        'vTiPm',
        '4320526ptgLSP',
        'wrMFX',
        '100%\x20100%',
        'wzqlE',
        'ById',
        '3|24|7|30|',
        'scaleX(-1)',
        'code',
        'ipe.png',
        'max',
        'appendChil',
        'split',
        'DOMContent',
        '2340265tFYyYX',
        '4|17|9|13',
        'QYKcC',
        'tmzIY',
        '2|6|5',
        'Loaded',
        'RZQxC',
        'rotateThre',
        'top_pipe_f',
        'keys',
        'push',
        'ZELQZ',
        'QORbF',
        'xxx-large',
        '|18|22|19|',
        'bKoJm',
        'gFkNr',
        '|15|1|29|7',
        'suKzO',
        'relative',
        '3|4|7',
        'div',
        '19|24|22|2',
        '7|4|0|1|3|',
        'dHiyb',
        'gHLBn',
        'ozXly',
        'MHYAw',
        'BmmZP',
        'NTicF',
        '621roKemY',
        '20|4|3|23|',
        'erfsY',
        'birdWidthP',
        '6|28|27|2|',
        'ectRatio',
        'GtCfa',
        'pipeSpeed',
        'zdFuK',
        'running',
        'jyYbe',
        '|14|2',
        'style',
        'nThPb',
        'replaceChi',
        'birdHeight',
        'all_pipes',
        'UJGsf',
        'ent',
        'txhFC',
        'power',
        'WXGEB',
        'src',
        'FgiDy',
        '255,\x20255,\x20'
    ];
    _0xe2bc = function () {
        return _0x13c019;
    };
    return _0xe2bc();
}
function randomBetween(_0x31c248, _0x476ff1) {
    var _0x1b8698 = _0x4b57, _0x51d3d2 = {
            'qCSwo': function (_0x405740, _0x55f511) {
                return _0x405740 + _0x55f511;
            },
            'erfsY': function (_0x4e3324, _0x2c88c5) {
                return _0x4e3324 * _0x2c88c5;
            },
            'lnDcq': function (_0x18d889, _0x554e99) {
                return _0x18d889 - _0x554e99;
            }
        };
    return _0x51d3d2[_0x1b8698(0x20e)](_0x31c248, _0x51d3d2[_0x1b8698(0x171)](_0x51d3d2[_0x1b8698(0x206)](_0x476ff1, _0x31c248), Math[_0x1b8698(0x20d)]()));
}
function updatePipes() {
    var _0x53f4ad = _0x4b57, _0x3c1545 = {
            'NRnDI': _0x53f4ad(0x1fa) + '5',
            'nUXHg': function (_0x1d6f87, _0x476389) {
                return _0x1d6f87 / _0x476389;
            },
            'PqSEE': function (_0x248be4, _0x1c5c5d) {
                return _0x248be4 * _0x1c5c5d;
            },
            'zdFuK': function (_0x3d021c, _0x282e07) {
                return _0x3d021c * _0x282e07;
            },
            'unOmA': function (_0x77892d, _0x5757cb) {
                return _0x77892d > _0x5757cb;
            },
            'hqgyE': function (_0x2173f3, _0x35482c) {
                return _0x2173f3 < _0x35482c;
            },
            'FIjTy': function (_0x5ad4ed, _0x40fa8e) {
                return _0x5ad4ed + _0x40fa8e;
            },
            'SypTL': function (_0x8276e, _0x1bd27f) {
                return _0x8276e * _0x1bd27f;
            },
            'NTicF': function (_0x10cde7, ..._0xcbe748) {
                return _0x10cde7(..._0xcbe748);
            },
            'UJGsf': function (_0x257725, _0x161aa5) {
                return _0x257725 * _0x161aa5;
            },
            'egURg': function (_0x290ec7, ..._0x4c0124) {
                return _0x290ec7(..._0x4c0124);
            }
        }, _0x578a82 = _0x3c1545[_0x53f4ad(0x193)][_0x53f4ad(0x14f)]('|'), _0x25c67e = 0x35 * 0x7f + -0x1 * 0x1142 + -0x909;
    while (!![]) {
        switch (_0x578a82[_0x25c67e++]) {
        case '0':
            var _0x288346 = _0x3c1545[_0x53f4ad(0x19c)](_0x3c1545[_0x53f4ad(0x1f2)](_0x3c1545[_0x53f4ad(0x177)](0x2537 + -0x2 * 0x5b + 0x40 * -0x92 + 0.5, document[_0x53f4ad(0x1bb)][_0x53f4ad(0x1bc) + 'h']), vars[_0x53f4ad(0x1af) + _0x53f4ad(0x214) + 't']), -0x19 * -0x7f + 0xf6f + -0x1b72);
            continue;
        case '1':
            vars[_0x53f4ad(0x1cf)] = _0x4e802f;
            continue;
        case '2':
            var _0x4e802f = [];
            continue;
        case '3':
            var _0xff6a7d = 0x1430 + 0x17b1 + -0x2f * 0xef;
            continue;
        case '4':
            for (var _0x5d79ee of vars[_0x53f4ad(0x1cf)]) {
                _0x5d79ee[_0x53f4ad(0x230)] = _0x5d79ee['x'], _0x5d79ee['x'] -= _0x3c1545[_0x53f4ad(0x177)](vars[_0x53f4ad(0x1f5)], vars[_0x53f4ad(0x176)]), _0xff6a7d = Math[_0x53f4ad(0x14d)](_0xff6a7d, _0x5d79ee['x']), _0x3c1545[_0x53f4ad(0x18b)](_0x5d79ee['x'], -_0x288346) && _0x4e802f[_0x53f4ad(0x15b)](_0x5d79ee);
            }
            continue;
        case '5':
            if (_0x3c1545[_0x53f4ad(0x1c4)](_0xff6a7d, vars[_0x53f4ad(0x21d) + _0x53f4ad(0x1d1)])) {
                var _0x522f81 = _0x3c1545[_0x53f4ad(0x1d3)](vars[_0x53f4ad(0x21d) + _0x53f4ad(0x1d1)], _0x3c1545[_0x53f4ad(0x1ce)](vars[_0x53f4ad(0x229) + 'gX'], _0x3c1545[_0x53f4ad(0x16e)](randomBetween, ...vars[_0x53f4ad(0x229) + _0x53f4ad(0x1b0)]))), _0x40fcc3 = _0x3c1545[_0x53f4ad(0x180)](document[_0x53f4ad(0x1bb)][_0x53f4ad(0x1cc) + 'ht'], _0x3c1545[_0x53f4ad(0x1e4)](randomBetween, ...vars[_0x53f4ad(0x1e5) + _0x53f4ad(0x1cb)]));
                vars[_0x53f4ad(0x1cf)][_0x53f4ad(0x15b)]({
                    'x': _0x522f81,
                    'y': _0x40fcc3
                });
            }
            continue;
        }
        break;
    }
}
function isHittingAPipe() {
    var _0x1ba72d = _0x4b57, _0x4e2c0b = {
            'kXQuA': function (_0x1c9feb, _0x2889ec) {
                return _0x1c9feb > _0x2889ec;
            },
            'VNoVP': function (_0x4eb1a4, _0x327152) {
                return _0x4eb1a4 < _0x327152;
            },
            'OIKAK': function (_0x330f6f, _0x10df95) {
                return _0x330f6f > _0x10df95;
            },
            'vOFFj': function (_0x1fa9c7, _0x162063) {
                return _0x1fa9c7 + _0x162063;
            },
            'gHLBn': function (_0x58310c, _0x5584d6) {
                return _0x58310c * _0x5584d6;
            },
            'ffGda': function (_0x406981, _0x205dd4) {
                return _0x406981 + _0x205dd4;
            }
        };
    for (var _0x4c05f7 of vars[_0x1ba72d(0x1cf)]) {
        if (_0x4e2c0b[_0x1ba72d(0x22a)](_0x4c05f7[_0x1ba72d(0x230)], -0x246a + -0x57b + 0x29e5) && _0x4e2c0b[_0x1ba72d(0x1ec)](_0x4c05f7['x'], -0xb7 * 0x2e + 0x422 * -0x1 + 0x1 * 0x2504)) {
            if (_0x4e2c0b[_0x1ba72d(0x1ec)](vars[_0x1ba72d(0x18d)], _0x4c05f7['y']))
                return !![];
            if (_0x4e2c0b[_0x1ba72d(0x21b)](_0x4e2c0b[_0x1ba72d(0x1a6)](vars[_0x1ba72d(0x18d)], _0x4e2c0b[_0x1ba72d(0x16a)](vars[_0x1ba72d(0x17e) + 'Px'], vars[_0x1ba72d(0x1f0)])), _0x4e2c0b[_0x1ba72d(0x1b1)](_0x4c05f7['y'], vars[_0x1ba72d(0x1a5)])))
                return !![];
        }
    }
    return ![];
}
function startGame() {
    var _0x1a3f4c = _0x4b57, _0x501d8c = {
            'KSOHL': function (_0x47654a, _0x946032) {
                return _0x47654a * _0x946032;
            },
            'nmnyF': function (_0x2cd481, _0x572cfe) {
                return _0x2cd481 - _0x572cfe;
            },
            'tmzIY': function (_0xf7e5b, _0x29260a) {
                return _0xf7e5b / _0x29260a;
            },
            'qdAsN': function (_0xa3577c, _0x34347) {
                return _0xa3577c * _0x34347;
            },
            'iMkvH': function (_0x165923, ..._0x540d41) {
                return _0x165923(..._0x540d41);
            }
        };
    vars[_0x1a3f4c(0x178)] = !![], vars[_0x1a3f4c(0x197)] = 0x888 + 0x928 + 0x1 * -0x11b0, vars[_0x1a3f4c(0x18d)] = 0x90a + 0x2a7 + -0xbb1, vars[_0x1a3f4c(0x1cf)] = [{
            'x': _0x501d8c[_0x1a3f4c(0x1ee)](document[_0x1a3f4c(0x1bb)][_0x1a3f4c(0x1bc) + 'h'], _0x501d8c[_0x1a3f4c(0x1de)](0x165 * 0x15 + 0x2 * -0x28f + -0x182a, _0x501d8c[_0x1a3f4c(0x154)](vars[_0x1a3f4c(0x1af) + _0x1a3f4c(0x214) + 't'], 0x2 * -0xd3f + 0x35 * -0x47 + 0x1 * 0x2995))),
            'y': _0x501d8c[_0x1a3f4c(0x1e2)](document[_0x1a3f4c(0x1bb)][_0x1a3f4c(0x1cc) + 'ht'], _0x501d8c[_0x1a3f4c(0x199)](randomBetween, ...vars[_0x1a3f4c(0x1e5) + _0x1a3f4c(0x1cb)]))
        }];
}
function draw() {
    var _0x2c2215 = _0x4b57, _0xc992a6 = {
            'NCUnm': _0x2c2215(0x1ed) + _0x2c2215(0x165),
            'iflEi': _0x2c2215(0x197),
            'gNDEt': function (_0x4e001e) {
                return _0x4e001e();
            },
            'scnEF': _0x2c2215(0x17f),
            'IRbaQ': _0x2c2215(0x208),
            'BmmZP': _0x2c2215(0x207) + _0x2c2215(0x15f) + _0x2c2215(0x149) + _0x2c2215(0x1b3) + _0x2c2215(0x1b6) + _0x2c2215(0x1d8) + _0x2c2215(0x1ff) + _0x2c2215(0x1b7) + _0x2c2215(0x17a),
            'aoxgJ': _0x2c2215(0x1a0) + _0x2c2215(0x14c),
            'tkOsR': _0x2c2215(0x1a8),
            'qiCfI': _0x2c2215(0x1ab),
            'cTPDp': _0x2c2215(0x1b9),
            'Lzmlr': function (_0x2281cd, _0x2cfe58) {
                return _0x2281cd + _0x2cfe58;
            },
            'OwhxT': _0x2c2215(0x14a) + _0x2c2215(0x18f) + ')',
            'uTRyu': _0x2c2215(0x19a) + 'e',
            'jNUWL': _0x2c2215(0x1f4),
            'hHSNM': function (_0x4790d4, _0x1047a6) {
                return _0x4790d4 - _0x1047a6;
            },
            'wrMFX': function (_0x171599, _0x24d1c2) {
                return _0x171599 + _0x24d1c2;
            },
            'HpqcH': _0x2c2215(0x14a),
            'QORbF': _0x2c2215(0x1dd) + _0x2c2215(0x141) + _0x2c2215(0x1d4),
            'dNLlB': _0x2c2215(0x166),
            'DSRQh': _0x2c2215(0x159) + _0x2c2215(0x211),
            'vTiPm': _0x2c2215(0x1dd) + _0x2c2215(0x1ca),
            'WeddN': _0x2c2215(0x19a) + _0x2c2215(0x195),
            'suKzO': _0x2c2215(0x1d9) + _0x2c2215(0x13f),
            'yaxoy': _0x2c2215(0x19a) + _0x2c2215(0x13d),
            'bmkRI': _0x2c2215(0x1cf)
        }, _0x3ee1a7 = _0xc992a6[_0x2c2215(0x1b4)][_0x2c2215(0x14f)]('|'), _0x2dd106 = 0x7 * 0x24d + -0x5 * -0x1eb + -0x19b2;
    while (!![]) {
        switch (_0x3ee1a7[_0x2dd106++]) {
        case '0':
            var _0x4503df = document[_0x2c2215(0x20a) + _0x2c2215(0x148)](_0xc992a6[_0x2c2215(0x1e3)]);
            continue;
        case '1':
            _0x7d5e3b[_0x2c2215(0x17b)][_0x2c2215(0x221)] = _0x2c2215(0x1b8) + _0xc992a6[_0x2c2215(0x226)](getRotate) + _0x2c2215(0x1e7);
            continue;
        case '2':
            _0x4503df[_0x2c2215(0x188)] = vars[_0x2c2215(0x197)][_0x2c2215(0x219)](-0x23be + 0xa40 + 0x1980);
            continue;
        case '3':
            var _0x112919 = document[_0x2c2215(0x20a) + _0x2c2215(0x148)](_0xc992a6[_0x2c2215(0x1f7)]);
            continue;
        case '4':
            _0x112919[_0x2c2215(0x17d) + _0x2c2215(0x213)]();
            continue;
        case '5':
            _0x7d5e3b[_0x2c2215(0x17b)][_0x2c2215(0x20c)] = vars[_0x2c2215(0x18d)];
            continue;
        case '6':
            var _0x7d5e3b = document[_0x2c2215(0x20a) + _0x2c2215(0x148)](_0xc992a6[_0x2c2215(0x198)]);
            continue;
        case '7':
            for (var _0x5113b6 of vars[_0x2c2215(0x1cf)]) {
                var _0x4e42e3 = _0xc992a6[_0x2c2215(0x16d)][_0x2c2215(0x14f)]('|'), _0x795c7c = -0x3af + 0xe6 * -0x2b + 0x2a51;
                while (!![]) {
                    switch (_0x4e42e3[_0x795c7c++]) {
                    case '0':
                        _0x11d4cf[_0x2c2215(0x14e) + 'd'](_0xf2fa32);
                        continue;
                    case '1':
                        _0x1a6b3e[_0x2c2215(0x185)] = _0xc992a6[_0x2c2215(0x215)];
                        continue;
                    case '2':
                        _0x531343[_0x2c2215(0x14e) + 'd'](_0x1e0bfe);
                        continue;
                    case '3':
                        _0x683f6a[_0x2c2215(0x14e) + 'd'](_0x11d4cf);
                        continue;
                    case '4':
                        _0x112919[_0x2c2215(0x14e) + 'd'](_0x683f6a);
                        continue;
                    case '5':
                        _0x566a9d[_0x2c2215(0x142)] = _0xc992a6[_0x2c2215(0x1c1)];
                        continue;
                    case '6':
                        Object[_0x2c2215(0x1f8)](_0x566a9d[_0x2c2215(0x17b)], {
                            'width': _0xc992a6[_0x2c2215(0x22b)],
                            'position': _0xc992a6[_0x2c2215(0x1ac)],
                            'bottom': _0xc992a6[_0x2c2215(0x220)](_0x5113b6['y'], vars[_0x2c2215(0x1a5)]),
                            'transform': _0xc992a6[_0x2c2215(0x1f1)]
                        });
                        continue;
                    case '7':
                        _0xf2fa32[_0x2c2215(0x142)] = _0xc992a6[_0x2c2215(0x1b2)];
                        continue;
                    case '8':
                        var _0x566a9d = document[_0x2c2215(0x218) + _0x2c2215(0x181)](_0xc992a6[_0x2c2215(0x1d7)]);
                        continue;
                    case '9':
                        _0x566a9d[_0x2c2215(0x185)] = _0xc992a6[_0x2c2215(0x215)];
                        continue;
                    case '10':
                        var _0x1a6b3e = document[_0x2c2215(0x218) + _0x2c2215(0x181)](_0xc992a6[_0x2c2215(0x1d7)]);
                        continue;
                    case '11':
                        _0x11d4cf[_0x2c2215(0x14e) + 'd'](_0x1a6b3e);
                        continue;
                    case '12':
                        Object[_0x2c2215(0x1f8)](_0x683f6a[_0x2c2215(0x17b)], {
                            'left': _0xc992a6[_0x2c2215(0x201)](_0x5113b6['x'], vars[_0x2c2215(0x1bf) + _0x2c2215(0x22d)]),
                            'position': _0xc992a6[_0x2c2215(0x1ac)],
                            'height': _0xc992a6[_0x2c2215(0x22b)],
                            'width': vars[_0x2c2215(0x1d6) + 'x']
                        });
                        continue;
                    case '13':
                        _0x1e0bfe[_0x2c2215(0x185)] = _0xc992a6[_0x2c2215(0x215)];
                        continue;
                    case '14':
                        Object[_0x2c2215(0x1f8)](_0x1e0bfe[_0x2c2215(0x17b)], {
                            'width': _0xc992a6[_0x2c2215(0x22b)],
                            'position': _0xc992a6[_0x2c2215(0x1ac)],
                            'bottom': _0xc992a6[_0x2c2215(0x145)](_0x5113b6['y'], vars[_0x2c2215(0x1a5)]),
                            'transform': _0xc992a6[_0x2c2215(0x1fd)],
                            'zIndex': -(0xa62 + 0x3 * 0x90f + -0x258e),
                            'height': _0xc992a6[_0x2c2215(0x22b)]
                        });
                        continue;
                    case '15':
                        Object[_0x2c2215(0x1f8)](_0x1a6b3e[_0x2c2215(0x17b)], {
                            'width': _0xc992a6[_0x2c2215(0x22b)],
                            'position': _0xc992a6[_0x2c2215(0x1ac)],
                            'bottom': _0x5113b6['y'],
                            'transform': _0xc992a6[_0x2c2215(0x15d)],
                            'zIndex': -(-0x22c + -0x22f * -0x7 + 0x2 * -0x68e),
                            'height': _0xc992a6[_0x2c2215(0x22b)]
                        });
                        continue;
                    case '16':
                        Object[_0x2c2215(0x1f8)](_0x531343[_0x2c2215(0x17b)], {
                            'position': _0xc992a6[_0x2c2215(0x1ac)],
                            'width': _0xc992a6[_0x2c2215(0x22b)],
                            'height': _0xc992a6[_0x2c2215(0x22b)]
                        });
                        continue;
                    case '17':
                        var _0x683f6a = document[_0x2c2215(0x218) + _0x2c2215(0x181)](_0xc992a6[_0x2c2215(0x1a1)]);
                        continue;
                    case '18':
                        var _0x11d4cf = document[_0x2c2215(0x218) + _0x2c2215(0x181)](_0xc992a6[_0x2c2215(0x1a1)]);
                        continue;
                    case '19':
                        Object[_0x2c2215(0x1f8)](_0x11d4cf[_0x2c2215(0x17b)], {
                            'position': _0xc992a6[_0x2c2215(0x1ac)],
                            'width': _0xc992a6[_0x2c2215(0x22b)],
                            'height': _0xc992a6[_0x2c2215(0x22b)]
                        });
                        continue;
                    case '20':
                        _0x1e0bfe[_0x2c2215(0x142)] = _0xc992a6[_0x2c2215(0x1da)];
                        continue;
                    case '21':
                        Object[_0x2c2215(0x1f8)](_0xf2fa32[_0x2c2215(0x17b)], {
                            'width': _0xc992a6[_0x2c2215(0x22b)],
                            'position': _0xc992a6[_0x2c2215(0x1ac)],
                            'bottom': _0x5113b6['y'],
                            'transform': _0xc992a6[_0x2c2215(0x143)]
                        });
                        continue;
                    case '22':
                        _0x11d4cf[_0x2c2215(0x142)] = _0xc992a6[_0x2c2215(0x1a7)];
                        continue;
                    case '23':
                        _0x531343[_0x2c2215(0x142)] = _0xc992a6[_0x2c2215(0x163)];
                        continue;
                    case '24':
                        var _0xf2fa32 = document[_0x2c2215(0x218) + _0x2c2215(0x181)](_0xc992a6[_0x2c2215(0x1d7)]);
                        continue;
                    case '25':
                        var _0x1e0bfe = document[_0x2c2215(0x218) + _0x2c2215(0x181)](_0xc992a6[_0x2c2215(0x1d7)]);
                        continue;
                    case '26':
                        _0x531343[_0x2c2215(0x14e) + 'd'](_0x566a9d);
                        continue;
                    case '27':
                        _0x1a6b3e[_0x2c2215(0x142)] = _0xc992a6[_0x2c2215(0x192)];
                        continue;
                    case '28':
                        _0x683f6a[_0x2c2215(0x142)] = _0xc992a6[_0x2c2215(0x228)];
                        continue;
                    case '29':
                        _0x683f6a[_0x2c2215(0x14e) + 'd'](_0x531343);
                        continue;
                    case '30':
                        _0xf2fa32[_0x2c2215(0x185)] = _0xc992a6[_0x2c2215(0x215)];
                        continue;
                    case '31':
                        var _0x531343 = document[_0x2c2215(0x218) + _0x2c2215(0x181)](_0xc992a6[_0x2c2215(0x1a1)]);
                        continue;
                    }
                    break;
                }
            }
            continue;
        }
        break;
    }
}
function endGame() {
    var _0x5430f9 = _0x4b57;
    vars[_0x5430f9(0x178)] = ![];
}
function getRotate() {
    var _0x883887 = _0x4b57, _0x25425a = {
            'yIYzw': function (_0x11f176, _0x5383d5) {
                return _0x11f176 / _0x5383d5;
            },
            'JaiVM': function (_0x23ffd3, _0x5ed025) {
                return _0x23ffd3 * _0x5ed025;
            },
            'XYgqh': function (_0x2a2e0a, _0x2031c3) {
                return _0x2a2e0a / _0x2031c3;
            }
        };
    return _0x25425a[_0x883887(0x200)](_0x25425a[_0x883887(0x1dc)](-vars[_0x883887(0x1db) + 'eg'], Math[_0x883887(0x194)](_0x25425a[_0x883887(0x200)](vars[_0x883887(0x21c)], vars[_0x883887(0x158) + _0x883887(0x216)]))), _0x25425a[_0x883887(0x1ea)](Math['PI'], 0x1fdf + -0x977 + -0x1666));
}
var functions = Object[_0x4b05c7(0x15a)]({
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
    var _0x3aed8d = _0x4b05c7, _0x16faf9 = {
            'iuXzo': _0x3aed8d(0x150) + _0x3aed8d(0x156),
            'QnNCl': function (_0x4959ce) {
                return _0x4959ce();
            }
        };
    function _0x5bd484() {
        var _0x748408 = _0x3aed8d;
        document[_0x748408(0x21a) + _0x748408(0x1a2)](_0x16faf9[_0x748408(0x1ad)], ready);
    }
    _0x16faf9[_0x3aed8d(0x1e8)](_0x5bd484);
}());