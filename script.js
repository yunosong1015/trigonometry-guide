document.addEventListener('DOMContentLoaded', () => {
    const angleInput = document.getElementById('angle');
    const calcBtn = document.getElementById('calc-btn');
    const sinRes = document.getElementById('sin-res');
    const cosRes = document.getElementById('cos-res');
    const tanRes = document.getElementById('tan-res');

    calcBtn.addEventListener('click', () => {
        const degrees = parseFloat(angleInput.value);

        if (isNaN(degrees)) {
            alert('올바른 각도를 입력해주세요.');
            return;
        }

        const radians = (degrees * Math.PI) / 180;

        const sinVal = Math.sin(radians).toFixed(4);
        const cosVal = Math.cos(radians).toFixed(4);
        
        // Handle tangent infinity case
        let tanVal;
        if (Math.abs(degrees % 180) === 90) {
            tanVal = '∞';
        } else {
            tanVal = Math.tan(radians).toFixed(4);
        }

        sinRes.textContent = sinVal;
        cosRes.textContent = cosVal;
        tanRes.textContent = tanVal;
    });

    // Table click interaction
    const cells = document.querySelectorAll('section#values td');
    cells.forEach(cell => {
        cell.addEventListener('click', () => {
            cell.classList.toggle('show');
        });
    });

    // Trend Section Value Click (New)
    const trendItems = document.querySelectorAll('.trend-item');
    trendItems.forEach(item => {
        item.style.cursor = 'pointer';
        item.classList.add('hide-val'); // CSS will handle hiding
        item.addEventListener('click', () => {
            item.classList.toggle('show-val');
        });
    });

    // Trend Slider interaction
    const trendRange = document.getElementById('trend-range');
    const currentAngle = document.getElementById('current-angle');
    const trendSin = document.getElementById('trend-sin');
    const trendCos = document.getElementById('trend-cos');
    const trendTan = document.getElementById('trend-tan');
    const trigSvg = document.getElementById('trig-svg');

    // Constants for SVG
    const originX = 100;
    const originY = 850;
    const unitSize = 640;
    const svgNS = "http://www.w3.org/2000/svg";

    // Track SVG Label Visibility
    const labelStates = { sin: false, cos: false, tan: false };

    function createSvgElement(tag, attrs) {
        const el = document.createElementNS(svgNS, tag);
        for (let k in attrs) el.setAttribute(k, attrs[k]);
        return el;
    }

    function initSvg() {
        trigSvg.innerHTML = '';
        trigSvg.setAttribute('viewBox', '0 0 1300 1100');

        // Axes
        trigSvg.appendChild(createSvgElement('line', { x1: 20, y1: originY, x2: 1250, y2: originY, stroke: '#888', 'stroke-width': 3 }));
        trigSvg.appendChild(createSvgElement('line', { x1: originX, y1: 1050, x2: originX, y2: 20, stroke: '#888', 'stroke-width': 3 }));

        // Ticks X
        for (let i = 0; i <= 1.5; i += 0.5) {
            const x = originX + i * unitSize;
            if (x > 1280) break;
            trigSvg.appendChild(createSvgElement('line', { x1: x, y1: originY - 10, x2: x, y2: originY + 10, stroke: '#888', 'stroke-width': 2 }));
            let labelX = x;
            if (i === 0 || i === 1) labelX -= 25;
            const txt = createSvgElement('text', { x: labelX, y: originY + 100, 'font-size': '48', 'text-anchor': 'middle', 'font-weight': 'bold' });
            txt.textContent = i;
            trigSvg.appendChild(txt);
        }

        // Ticks Y
        for (let i = 0.5; i <= 1.5; i += 0.5) {
            const y = originY - i * unitSize;
            if (y < 20) break;
            trigSvg.appendChild(createSvgElement('line', { x1: originX - 10, y1: y, x2: originX + 10, y2: y, stroke: '#888', 'stroke-width': 2 }));
            const txt = createSvgElement('text', { x: originX - 25, y: y + 15, 'font-size': '48', 'text-anchor': 'end', 'font-weight': 'bold' });
            txt.textContent = i;
            trigSvg.appendChild(txt);
        }

        // Unit Circle Arc
        trigSvg.appendChild(createSvgElement('path', { 
            d: `M ${originX + unitSize} ${originY} A ${unitSize} ${unitSize} 0 0 0 ${originX} ${originY - unitSize}`, 
            fill: 'none', stroke: '#444', 'stroke-width': 4 
        }));

        // Tan limit line
        trigSvg.appendChild(createSvgElement('line', { x1: originX + unitSize, y1: 950, x2: originX + unitSize, y2: 20, stroke: '#444', 'stroke-width': 3 }));

        // Dynamic Elements
        trigSvg.appendChild(createSvgElement('line', { id: 'line-radius', x1: originX, y1: originY, x2: 0, y2: 0, stroke: '#444', 'stroke-width': 3 }));
        trigSvg.appendChild(createSvgElement('line', { id: 'line-cos', x1: originX, y1: originY, x2: 0, y2: originY, stroke: '#f39c12', 'stroke-width': 12 }));
        trigSvg.appendChild(createSvgElement('line', { id: 'line-sin', x1: 0, y1: originY, x2: 0, y2: 0, stroke: '#3498db', 'stroke-width': 12 }));
        trigSvg.appendChild(createSvgElement('line', { id: 'line-tan', x1: originX + unitSize, y1: originY, x2: originX + unitSize, y2: 0, stroke: '#e74c3c', 'stroke-width': 12 }));
        
        trigSvg.appendChild(createSvgElement('path', { id: 'angle-arc', fill: 'none', stroke: '#444', 'stroke-width': 2 }));
        const angleLabel = createSvgElement('text', { id: 'angle-label', 'font-size': '48', 'font-weight': 'bold' });
        angleLabel.textContent = 'A';
        trigSvg.appendChild(angleLabel);

        // Labels with Click Interaction
        const labelSin = createSvgElement('text', { id: 'label-sin', 'font-size': '56', 'font-weight': 'bold', cursor: 'pointer' });
        const labelCos = createSvgElement('text', { id: 'label-cos', 'font-size': '56', 'font-weight': 'bold', 'text-anchor': 'middle', cursor: 'pointer' });
        const labelTan = createSvgElement('text', { id: 'label-tan', 'font-size': '56', 'font-weight': 'bold', cursor: 'pointer' });

        labelSin.addEventListener('click', () => { labelStates.sin = !labelStates.sin; updateTrend(); });
        labelCos.addEventListener('click', () => { labelStates.cos = !labelStates.cos; updateTrend(); });
        labelTan.addEventListener('click', () => { labelStates.tan = !labelStates.tan; updateTrend(); });

        trigSvg.appendChild(labelSin);
        trigSvg.appendChild(labelCos);
        trigSvg.appendChild(labelTan);
    }

    function updateTrend() {
        const deg = parseInt(trendRange.value);
        const rad = (deg * Math.PI) / 180;
        currentAngle.textContent = deg;
        
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = Math.tan(rad);

        trendSin.textContent = s.toFixed(4);
        trendCos.textContent = c.toFixed(4);
        trendTan.textContent = deg === 90 ? '∞' : t.toFixed(4);

        const circleX = originX + unitSize * c;
        const circleY = originY - unitSize * s;

        const rLine = document.getElementById('line-radius');
        const tanX = originX + unitSize;
        const tanY = originY - unitSize * t;
        
        if (deg < 60) {
            rLine.setAttribute('x2', tanX);
            rLine.setAttribute('y2', tanY);
        } else {
            rLine.setAttribute('x2', circleX + (circleX - originX) * 2);
            rLine.setAttribute('y2', circleY + (circleY - originY) * 2);
        }

        document.getElementById('line-cos').setAttribute('x2', circleX);
        const sLine = document.getElementById('line-sin');
        sLine.setAttribute('x1', circleX); sLine.setAttribute('y1', originY);
        sLine.setAttribute('x2', circleX); sLine.setAttribute('y2', circleY);

        const tLine = document.getElementById('line-tan');
        if (deg < 90) {
            tLine.setAttribute('y2', Math.max(tanY, 20));
            tLine.style.display = 'block';
        } else {
            tLine.style.display = 'none';
        }

        // SVG Label Content and Style Update
        const lSin = document.getElementById('label-sin');
        lSin.textContent = labelStates.sin ? 'sin A' : '?';
        lSin.setAttribute('fill', labelStates.sin ? '#3498db' : '#999');
        lSin.setAttribute('x', circleX - (labelStates.sin ? 180 : 60));
        lSin.setAttribute('y', circleY + (originY - circleY) / 2 + 15);

        const lCos = document.getElementById('label-cos');
        lCos.textContent = labelStates.cos ? 'cos A' : '?';
        lCos.setAttribute('fill', labelStates.cos ? '#f39c12' : '#999');
        lCos.setAttribute('x', originX + (circleX - originX) / 2);
        lCos.setAttribute('y', originY + 80);

        const lTan = document.getElementById('label-tan');
        lTan.textContent = labelStates.tan ? 'tan A' : '?';
        lTan.setAttribute('fill', labelStates.tan ? '#e74c3c' : '#999');
        lTan.setAttribute('x', tanX + 30);
        lTan.setAttribute('y', tanY + (originY - tanY) / 2 + 15);
        lTan.style.display = deg < 65 ? 'block' : 'none';

        // Arc & Label
        const arcR = 80;
        const aArc = document.getElementById('angle-arc');
        if (deg > 0) {
            const arcEndX = originX + arcR * Math.cos(rad);
            const arcEndY = originY - arcR * Math.sin(rad);
            aArc.setAttribute('d', `M ${originX + arcR} ${originY} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`);
            aArc.style.display = 'block';
        } else {
            aArc.style.display = 'none';
        }
        const aLabel = document.getElementById('angle-label');
        const midRad = rad / 2;
        aLabel.setAttribute('x', originX + (arcR + 45) * Math.cos(midRad));
        aLabel.setAttribute('y', originY - (arcR + 45) * Math.sin(midRad) + 15);
    }

    initSvg();
    trendRange.addEventListener('input', updateTrend);
    updateTrend();
});
