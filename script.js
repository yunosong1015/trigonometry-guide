/* =========================================================
   삼각비 가이드 - 동작 스크립트
   외부 라이브러리 없음 (인터넷 없이도 동작합니다)
   ========================================================= */
(function () {
    'use strict';

    var SVG_NS = 'http://www.w3.org/2000/svg';
    var COLOR = { sin: '#2563eb', cos: '#d97706', tan: '#dc2626', ray: '#334155', axis: '#94a3b8', ink: '#0f172a' };

    /* 세 값의 표시 여부 — 사분원 그림과 오른쪽 값 패널이 함께 씁니다 */
    var reveal = { sin: false, cos: false, tan: false };

    function el(tag, attrs) {
        var n = document.createElementNS(SVG_NS, tag);
        for (var k in attrs) { if (attrs[k] !== null && attrs[k] !== undefined) n.setAttribute(k, attrs[k]); }
        return n;
    }
    function txt(s, attrs) { var n = el('text', attrs); n.textContent = s; return n; }

    document.addEventListener('DOMContentLoaded', function () {

        /* ===================================================
           0. 큰 글씨 모드
           =================================================== */
        var bigBtn = document.getElementById('big-mode-btn');
        if (bigBtn) {
            bigBtn.addEventListener('click', function () {
                var on = document.documentElement.classList.toggle('big-mode');
                bigBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
                bigBtn.innerHTML = on ? '가&nbsp;보통 글씨' : '가&nbsp;큰 글씨';
                drawUnitCircle();
            });
        }

        /* ===================================================
           1. 크기가 달라져도 비는 같을까요? (닮음 활동)
           =================================================== */
        var simSvg = document.getElementById('sim-svg');
        var simAngle = document.getElementById('sim-angle');
        var simSize = document.getElementById('sim-size');
        var simAngleOut = document.getElementById('sim-angle-out');
        var simSizeOut = document.getElementById('sim-size-out');
        var simBody = document.getElementById('sim-tbody');
        var simConc = document.getElementById('sim-conclusion');
        var simChips = document.querySelectorAll('#similar .sim-chip');

        var SIM = { S: 37, CMAX: 12, OX: 70, OY: 520, GHOST: [5, 10] };

        function drawSimilar() {
            if (!simSvg || !simAngle || !simSize) return;

            var deg = parseInt(simAngle.value, 10);
            var size = parseFloat(simSize.value);
            var rad = deg * Math.PI / 180;
            var sn = Math.sin(rad), cs = Math.cos(rad), tn = Math.tan(rad);

            var S = SIM.S, OX = SIM.OX, OY = SIM.OY, R = SIM.CMAX * S;

            simAngleOut.textContent = deg;
            simSizeOut.textContent = size.toFixed(1);
            while (simSvg.firstChild) simSvg.removeChild(simSvg.firstChild);

            /* 바닥선 + 반지름 12인 호 (꼭짓점 B가 지나는 자리) */
            simSvg.appendChild(el('line', { x1: OX - 25, y1: OY, x2: OX + R + 25, y2: OY, stroke: '#e2e8f0', 'stroke-width': 3 }));
            simSvg.appendChild(el('path', {
                d: 'M ' + (OX + R) + ' ' + OY + ' A ' + R + ' ' + R + ' 0 0 0 ' + OX + ' ' + (OY - R),
                fill: 'none', stroke: '#f1f5f9', 'stroke-width': 3
            }));

            /* --- 비교용(흐린) 삼각형 --- */
            SIM.GHOST.forEach(function (gc) {
                var bx = OX + gc * cs * S, by = OY - gc * sn * S;
                simSvg.appendChild(el('polygon', {
                    points: OX + ',' + OY + ' ' + bx + ',' + OY + ' ' + bx + ',' + by,
                    fill: 'rgba(148,163,184,0.07)', stroke: '#cbd5e1', 'stroke-width': 2.5, 'stroke-dasharray': '7 5'
                }));
                simSvg.appendChild(txt('c=' + gc, {
                    x: bx + 10, y: by + 6, 'font-size': 19, fill: '#94a3b8', 'font-weight': 'bold'
                }));
            });

            /* --- 지금 삼각형 --- */
            var CX = OX + size * cs * S;          /* 꼭짓점 C */
            var BY = OY - size * sn * S;          /* 꼭짓점 B의 높이 */
            simSvg.appendChild(el('polygon', {
                points: OX + ',' + OY + ' ' + CX + ',' + OY + ' ' + CX + ',' + BY,
                fill: 'rgba(37,99,235,0.06)', stroke: 'none'
            }));
            simSvg.appendChild(el('line', { x1: OX, y1: OY, x2: CX, y2: OY, stroke: COLOR.cos, 'stroke-width': 7, 'stroke-linecap': 'round' }));
            simSvg.appendChild(el('line', { x1: CX, y1: OY, x2: CX, y2: BY, stroke: COLOR.sin, 'stroke-width': 7, 'stroke-linecap': 'round' }));
            simSvg.appendChild(el('line', { x1: CX, y1: BY, x2: OX, y2: OY, stroke: COLOR.ray, 'stroke-width': 7, 'stroke-linecap': 'round' }));

            /* 직각 표시 */
            var m = 16;
            simSvg.appendChild(el('path', {
                d: 'M ' + (CX - m) + ' ' + OY + ' L ' + (CX - m) + ' ' + (OY - m) + ' L ' + CX + ' ' + (OY - m),
                fill: 'none', stroke: COLOR.ray, 'stroke-width': 2.5
            }));

            /* 각 A — 삼각형이 좁을 때는 각도 숫자를 생략합니다(조절판에 크게 나옵니다) */
            var basePx = size * cs * S;
            var ar = Math.max(24, Math.min(46, basePx * 0.45));
            simSvg.appendChild(el('path', {
                d: 'M ' + (OX + ar) + ' ' + OY + ' A ' + ar + ' ' + ar + ' 0 0 0 ' +
                   (OX + ar * cs) + ' ' + (OY - ar * sn),
                fill: 'none', stroke: COLOR.ink, 'stroke-width': 3
            }));
            if (basePx > 130) {
                simSvg.appendChild(txt(deg + '°', {
                    x: OX + (ar + 34) * Math.cos(rad / 2), y: OY - (ar + 34) * Math.sin(rad / 2) + 7,
                    'font-size': 22, 'font-weight': 'bold', fill: COLOR.ink, 'text-anchor': 'middle'
                }));
            }

            /* 꼭짓점 이름 */
            simSvg.appendChild(txt('A', { x: OX - 22, y: OY + 8, 'font-size': 22, 'font-weight': 'bold', fill: COLOR.ink }));
            simSvg.appendChild(txt('C', { x: CX + 6, y: OY + 28, 'font-size': 22, 'font-weight': 'bold', fill: COLOR.ink }));
            simSvg.appendChild(txt('B', { x: CX + 6, y: BY - 12, 'font-size': 22, 'font-weight': 'bold', fill: COLOR.ink }));
            simSvg.appendChild(el('circle', { cx: CX, cy: BY, r: 6, fill: COLOR.ray }));

            /* 변의 길이 */
            var a = size * sn, bb = size * cs;
            simSvg.appendChild(txt('b = ' + bb.toFixed(2), {
                x: Math.max((OX + CX) / 2, OX + 50), y: OY + 60, 'font-size': 21, 'font-weight': 'bold',
                fill: COLOR.cos, 'text-anchor': 'middle'
            }));
            simSvg.appendChild(txt('a = ' + a.toFixed(2), {
                x: CX + 34, y: (OY + BY) / 2 + 7, 'font-size': 21, 'font-weight': 'bold', fill: COLOR.sin
            }));
            /* 빗변 라벨은 빗변에 수직인 방향으로 살짝 띄웁니다 */
            var hx = (OX + CX) / 2 - 22 * sn, hy = (OY + BY) / 2 - 22 * cs;
            simSvg.appendChild(txt('c = ' + size.toFixed(2), {
                x: hx, y: hy, 'font-size': 21, 'font-weight': 'bold',
                fill: COLOR.ray, 'text-anchor': 'middle',
                transform: 'rotate(' + (-deg) + ', ' + hx + ', ' + hy + ')'
            }));

            /* --- 표 --- */
            var rowsDef = [
                { name: '작은 삼각형', c: SIM.GHOST[0], cur: false },
                { name: '지금 삼각형', c: size, cur: true },
                { name: '큰 삼각형', c: SIM.GHOST[1], cur: false }
            ];
            simBody.innerHTML = '';
            rowsDef.forEach(function (r) {
                var tr = document.createElement('tr');
                if (r.cur) tr.className = 'current';
                var th = document.createElement('th');
                th.scope = 'row';
                th.textContent = r.name;
                tr.appendChild(th);
                [ (r.c * sn).toFixed(2), (r.c * cs).toFixed(2), r.c.toFixed(2) ].forEach(function (v) {
                    var td = document.createElement('td'); td.textContent = v; tr.appendChild(td);
                });
                /* 비는 각 A만으로 정해지므로 세 줄이 모두 같은 값이 됩니다 */
                [['rsin', sn], ['rcos', cs], ['rtan', tn]].forEach(function (pair) {
                    var td = document.createElement('td');
                    td.className = 'ratio ' + pair[0];
                    td.textContent = pair[1].toFixed(4);
                    tr.appendChild(td);
                });
                simBody.appendChild(tr);
            });

            if (simConc) {
                simConc.innerHTML = '✅ 세 변의 길이는 모두 다르지만, 각 A = ' + deg + '°인 한 ' +
                    '<b>a÷c, b÷c, a÷b 의 값은 세 삼각형이 똑같습니다.</b>';
            }

            simChips.forEach(function (ch) {
                ch.classList.toggle('active', parseInt(ch.dataset.angle, 10) === deg);
            });
        }

        if (simAngle && simSize) {
            simAngle.addEventListener('input', drawSimilar);
            simSize.addEventListener('input', drawSimilar);
            simChips.forEach(function (ch) {
                ch.addEventListener('click', function () {
                    simAngle.value = ch.dataset.angle;
                    drawSimilar();
                });
            });
            drawSimilar();
        }

        /* ===================================================
           2. 특수각 표 — 눌러서 값 확인
           =================================================== */
        var specialCells = document.querySelectorAll('.special-table td');
        specialCells.forEach(function (cell) {
            function toggle() { cell.classList.toggle('show'); }
            cell.addEventListener('click', toggle);
            cell.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
            });
        });
        var revealAll = document.getElementById('reveal-all');
        var hideAll = document.getElementById('hide-all');
        if (revealAll) revealAll.addEventListener('click', function () {
            specialCells.forEach(function (c) { c.classList.add('show'); });
        });
        if (hideAll) hideAll.addEventListener('click', function () {
            specialCells.forEach(function (c) { c.classList.remove('show'); });
        });

        /* ===================================================
           3. 사분원 시각화
           =================================================== */
        var svg = document.getElementById('trig-svg');
        var range = document.getElementById('trend-range');
        var angleOut = document.getElementById('current-angle');
        var outSin = document.getElementById('trend-sin');
        var outCos = document.getElementById('trend-cos');
        var outTan = document.getElementById('trend-tan');
        var zoomNote = document.getElementById('zoom-note');
        var chips = document.querySelectorAll('#trends .chip[data-angle]');
        var trendItems = document.querySelectorAll('.trend-item');

        var U = 400;                                    /* 1에 해당하는 SVG 길이 */
        var PAD_L = 0.42, PAD_R = 1.85, PAD_B = 0.42, PAD_T = 0.30;
        var BASE_H = (1.5 + PAD_T + PAD_B) * U;         /* 기본 배율일 때의 높이 */

        /* 값 패널 ↔ 그림 라벨을 같은 상태로 묶습니다 */
        trendItems.forEach(function (item) {
            var key = item.classList.contains('t-sin') ? 'sin'
                    : item.classList.contains('t-cos') ? 'cos' : 'tan';
            function toggle() { reveal[key] = !reveal[key]; drawUnitCircle(); }
            item.addEventListener('click', toggle);
            item.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
            });
        });

        function pickYMax(t, deg) {
            if (deg >= 90) return 1.5;
            if (t <= 1.35) return 1.5;
            if (t <= 1.85) return 2;
            return 3;
        }

        function drawUnitCircle() {
            if (!svg || !range) return;

            var deg = parseInt(range.value, 10) || 0;
            var rad = deg * Math.PI / 180;
            var s = Math.sin(rad);
            var c = Math.cos(rad);
            var undefinedTan = (deg === 90);
            var t = undefinedTan ? Infinity : Math.tan(rad);

            /* --- 화면(뷰박스) 계산: tan이 커지면 자동으로 축소 --- */
            var yMax = pickYMax(t, deg);
            var yTop = yMax + PAD_T;
            var vbW = (PAD_L + PAD_R) * U;
            var vbH = (yTop + PAD_B) * U;
            var ox = PAD_L * U;
            var oy = yTop * U;
            var f = vbH / BASE_H;                        /* 글자가 화면에서 같은 크기로 보이도록 */
            var FS_TICK = Math.round(30 * f);
            var FS_LABEL = Math.round(40 * f);
            var overflow = !undefinedTan && t > yTop - 0.05;

            var X = function (v) { return ox + v * U; };
            var Y = function (v) { return oy - v * U; };

            svg.setAttribute('viewBox', '0 0 ' + vbW + ' ' + vbH);
            while (svg.firstChild) svg.removeChild(svg.firstChild);

            /* 화살표 촉 (tan이 화면을 넘어갈 때) */
            var defs = el('defs', {});
            var mk = el('marker', {
                id: 'arrow-tan', viewBox: '0 0 10 10', refX: '6', refY: '5',
                markerWidth: '5', markerHeight: '5', orient: 'auto-start-reverse'
            });
            mk.appendChild(el('path', { d: 'M 0 0 L 10 5 L 0 10 z', fill: COLOR.tan }));
            defs.appendChild(mk);
            svg.appendChild(defs);

            /* --- 좌표축 --- */
            svg.appendChild(el('line', { x1: X(-PAD_L + 0.06), y1: Y(0), x2: X(PAD_R - 0.02), y2: Y(0), stroke: COLOR.axis, 'stroke-width': 3 }));
            svg.appendChild(el('line', { x1: X(0), y1: Y(-PAD_B + 0.06), x2: X(0), y2: Y(yTop - 0.02), stroke: COLOR.axis, 'stroke-width': 3 }));

            /* 눈금 (가로) — 숫자는 축 아래에 */
            [0.5, 1, 1.5].forEach(function (v) {
                if (v > PAD_R - 0.1) return;
                svg.appendChild(el('line', { x1: X(v), y1: Y(0) - 8, x2: X(v), y2: Y(0) + 8, stroke: COLOR.axis, 'stroke-width': 2 }));
                svg.appendChild(txt(String(v), { x: X(v), y: Y(0) + 0.115 * U, 'font-size': FS_TICK, 'text-anchor': 'middle', fill: '#64748b' }));
            });
            svg.appendChild(txt('0', { x: X(0) - 0.055 * U, y: Y(0) + 0.115 * U, 'font-size': FS_TICK, 'text-anchor': 'middle', fill: '#64748b' }));

            /* 눈금 (세로) — 숫자는 축 왼쪽에 */
            for (var v = 0.5; v <= yMax + 0.001; v += 0.5) {
                var vv = Math.round(v * 10) / 10;
                svg.appendChild(el('line', { x1: X(0) - 8, y1: Y(vv), x2: X(0) + 8, y2: Y(vv), stroke: COLOR.axis, 'stroke-width': 2 }));
                svg.appendChild(txt(String(vv), { x: X(0) - 0.055 * U, y: Y(vv) + FS_TICK * 0.35, 'font-size': FS_TICK, 'text-anchor': 'end', fill: '#64748b' }));
            }

            /* 반지름 1인 사분원 */
            svg.appendChild(el('path', {
                d: 'M ' + X(1) + ' ' + Y(0) + ' A ' + U + ' ' + U + ' 0 0 0 ' + X(0) + ' ' + Y(1),
                fill: 'none', stroke: '#cbd5e1', 'stroke-width': 4
            }));

            /* x = 1 인 직선 (tan을 재는 자리) */
            svg.appendChild(el('line', {
                x1: X(1), y1: Y(0), x2: X(1), y2: Y(yTop - 0.02),
                stroke: '#fca5a5', 'stroke-width': 3, 'stroke-dasharray': '10 8'
            }));

            /* --- 빗변(반지름의 연장선) : 항상 화면 끝까지 그려 tan과 만나는 것을 보여줍니다 --- */
            var sX = c > 1e-9 ? (PAD_R - 0.05) / c : Infinity;
            var sY = s > 1e-9 ? (yTop - 0.03) / s : Infinity;
            var k = Math.min(sX, sY);
            if (!isFinite(k)) k = 1;
            svg.appendChild(el('line', {
                x1: X(0), y1: Y(0), x2: X(c * k), y2: Y(s * k),
                stroke: COLOR.ray, 'stroke-width': 5
            }));

            /* --- 세 선분 --- */
            svg.appendChild(el('line', { x1: X(0), y1: Y(0), x2: X(c), y2: Y(0), stroke: COLOR.cos, 'stroke-width': 15, 'stroke-linecap': 'butt' }));
            svg.appendChild(el('line', { x1: X(c), y1: Y(0), x2: X(c), y2: Y(s), stroke: COLOR.sin, 'stroke-width': 15, 'stroke-linecap': 'butt' }));
            if (!undefinedTan) {
                var tTop = Math.min(t, yTop - 0.03);
                var tanLine = el('line', { x1: X(1), y1: Y(0), x2: X(1), y2: Y(tTop), stroke: COLOR.tan, 'stroke-width': 15, 'stroke-linecap': 'butt' });
                if (overflow) tanLine.setAttribute('marker-end', 'url(#arrow-tan)');
                svg.appendChild(tanLine);
            }

            /* 빗변을 세 선분 위에 한 번 더 얇게 → 0°, 90°에서도 보이도록 */
            svg.appendChild(el('line', {
                x1: X(0), y1: Y(0), x2: X(c * k), y2: Y(s * k),
                stroke: COLOR.ray, 'stroke-width': 4
            }));

            /* 사분원 위의 점 */
            svg.appendChild(el('circle', { cx: X(c), cy: Y(s), r: 0.03 * U, fill: COLOR.ray }));

            /* --- 각 A --- */
            var arcR = 0.19;
            if (deg > 0) {
                svg.appendChild(el('path', {
                    d: 'M ' + X(arcR) + ' ' + Y(0) + ' A ' + (arcR * U) + ' ' + (arcR * U) + ' 0 0 0 ' +
                       X(arcR * c) + ' ' + Y(arcR * s),
                    fill: 'none', stroke: COLOR.ink, 'stroke-width': 3
                }));
            }
            var midR = rad / 2, lr = 0.30;
            svg.appendChild(txt('A', {
                x: X(lr * Math.cos(midR)), y: Y(Math.max(lr * Math.sin(midR), 0.08)) + FS_LABEL * 0.35,
                'font-size': FS_LABEL, 'font-weight': 'bold', fill: COLOR.ink, 'text-anchor': 'middle'
            }));

            /* --- 눌러서 확인하는 라벨 --- */
            function addLabel(key, label, x, y, anchor) {
                var node = txt(reveal[key] ? label : '?', {
                    x: x, y: y, 'font-size': FS_LABEL, 'font-weight': 'bold',
                    'text-anchor': anchor || 'start',
                    fill: reveal[key] ? COLOR[key] : '#94a3b8',
                    cursor: 'pointer'
                });
                node.addEventListener('click', function () { reveal[key] = !reveal[key]; drawUnitCircle(); });
                svg.appendChild(node);
            }

            /* cos : 가로축 아래쪽 (눈금 숫자보다 더 아래) */
            if (c > 0.05) addLabel('cos', 'cos A', X(Math.max(c / 2, 0.32)), Y(0) + 0.26 * U, 'middle');
            /* sin : 세로 선분 옆 (x=1 직선과 겹치지 않도록 좌우를 바꿔 놓습니다) */
            if (s > 0.05) {
                var sinLeft = c > 0.5;
                addLabel('sin', 'sin A',
                    X(c) + (sinLeft ? -0.05 : 0.06) * U,
                    Y(Math.max(s / 2, 0.16)) + FS_LABEL * 0.35,
                    sinLeft ? 'end' : 'start');
            }
            /* tan : x=1 직선 오른쪽 */
            if (!undefinedTan && t > 0.05) {
                var ty = overflow ? Y(yTop - 0.30) : Y(Math.max(Math.min(t, yTop) / 2, 0.16));
                addLabel('tan', 'tan A', X(1) + 0.07 * U, ty + FS_LABEL * 0.35, 'start');
            }

            /* 90°일 때 안내 */
            if (undefinedTan) {
                var warn = el('text', {
                    x: X(1) + 0.07 * U, y: Y(0.62), 'font-size': Math.round(FS_LABEL * 0.85),
                    'font-weight': 'bold', fill: COLOR.tan
                });
                var t1 = el('tspan', { x: X(1) + 0.07 * U, dy: '0' }); t1.textContent = 'tan 90°는';
                var t2 = el('tspan', { x: X(1) + 0.07 * U, dy: '1.25em' }); t2.textContent = '정할 수 없어요';
                warn.appendChild(t1); warn.appendChild(t2);
                svg.appendChild(warn);
            }

            /* --- 값 패널 --- */
            angleOut.textContent = deg;
            outSin.textContent = s.toFixed(4);
            outCos.textContent = Math.abs(c) < 1e-12 ? '0.0000' : c.toFixed(4);
            outTan.textContent = undefinedTan ? '정할 수 없다' : t.toFixed(4);

            trendItems.forEach(function (item) {
                var key = item.classList.contains('t-sin') ? 'sin'
                        : item.classList.contains('t-cos') ? 'cos' : 'tan';
                item.classList.toggle('show-val', reveal[key]);
            });

            /* --- 안내 문구 --- */
            if (zoomNote) {
                if (deg === 0) zoomNote.textContent = 'sin A와 tan A가 0이어서 선분이 보이지 않습니다.';
                else if (undefinedTan) zoomNote.textContent = 'cos A = 0, 그리고 빗변이 x = 1인 직선과 만나지 않습니다.';
                else if (overflow) zoomNote.textContent = 'tan A가 화면을 넘어설 만큼 커졌습니다.';
                else if (yMax > 1.5) zoomNote.textContent = 'tan A가 커져서 세로 눈금을 ' + yMax + '까지 넓혔습니다.';
                else zoomNote.textContent = '';
            }

            chips.forEach(function (ch) {
                ch.classList.toggle('active', parseInt(ch.dataset.angle, 10) === deg);
            });
        }

        if (range) {
            range.addEventListener('input', drawUnitCircle);
            chips.forEach(function (ch) {
                ch.addEventListener('click', function () {
                    range.value = ch.dataset.angle;
                    drawUnitCircle();
                });
            });
            drawUnitCircle();
            window.addEventListener('resize', drawUnitCircle);
        }

        /* ===================================================
           4. 삼각비의 표 (0°~90°) + 각도 찾기
           =================================================== */
        var tbody = document.getElementById('trig-table-body');
        var rows = {};
        if (tbody) {
            var frag = document.createDocumentFragment();
            for (var d = 0; d <= 90; d++) {
                var r = d * Math.PI / 180;
                var tr = document.createElement('tr');
                tr.dataset.deg = d;

                var tdA = document.createElement('td'); tdA.textContent = d + '°';
                var tdS = document.createElement('td'); tdS.textContent = Math.sin(r).toFixed(4);
                var tdC = document.createElement('td'); tdC.textContent = (d === 90 ? 0 : Math.cos(r)).toFixed(4);
                var tdT = document.createElement('td');
                if (d === 90) { tdT.textContent = '정할 수 없다'; tdT.className = 'undef'; }
                else { tdT.textContent = Math.tan(r).toFixed(4); }

                tr.appendChild(tdA); tr.appendChild(tdS); tr.appendChild(tdC); tr.appendChild(tdT);
                frag.appendChild(tr);
                rows[d] = tr;
            }
            tbody.appendChild(frag);
        }

        var angleInput = document.getElementById('angle');
        var calcBtn = document.getElementById('calc-btn');
        var errBox = document.getElementById('calc-err');
        var sinRes = document.getElementById('sin-res');
        var cosRes = document.getElementById('cos-res');
        var tanRes = document.getElementById('tan-res');
        var tableWrap = document.querySelector('.trig-table-wrapper');

        function showError(msg) {
            if (errBox) errBox.textContent = msg;
            if (sinRes) { sinRes.textContent = '–'; cosRes.textContent = '–'; tanRes.textContent = '–'; }
            document.querySelectorAll('.res-angle').forEach(function (e) { e.textContent = '–'; });
        }

        function lookup() {
            if (!angleInput) return;
            var raw = angleInput.value.trim();
            if (raw === '') { showError('각도를 입력해 주세요.'); return; }
            var deg = Number(raw);
            if (!isFinite(deg)) { showError('숫자만 입력할 수 있어요.'); return; }
            if (deg < 0 || deg > 90) { showError('0°부터 90°까지만 입력해 주세요.'); return; }

            deg = Math.round(deg);
            if (errBox) errBox.textContent = '';
            var r = deg * Math.PI / 180;

            sinRes.textContent = Math.sin(r).toFixed(4);
            cosRes.textContent = (deg === 90 ? 0 : Math.cos(r)).toFixed(4);
            tanRes.textContent = (deg === 90) ? '정할 수 없다' : Math.tan(r).toFixed(4);
            document.querySelectorAll('.res-angle').forEach(function (e) { e.textContent = deg; });

            Object.keys(rows).forEach(function (k) { rows[k].classList.remove('hit'); });
            var row = rows[deg];
            if (row && tableWrap) {
                row.classList.add('hit');
                tableWrap.scrollTop = row.offsetTop - tableWrap.clientHeight / 2 + row.clientHeight / 2;
            }
        }

        if (calcBtn) calcBtn.addEventListener('click', lookup);
        if (angleInput) angleInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); lookup(); }
        });

        /* ===================================================
           5. 실생활 문제 - 풀이 보기
           =================================================== */
        document.querySelectorAll('.sol-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var box = btn.parentElement.querySelector('.solution');
                if (!box) return;
                var open = box.classList.toggle('open');
                btn.textContent = open ? '풀이 접기' : '풀이 보기';
            });
        });
    });
})();
