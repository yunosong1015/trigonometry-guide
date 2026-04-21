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

    // Trend Slider interaction
    const trendRange = document.getElementById('trend-range');
    const currentAngle = document.getElementById('current-angle');
    const trendSin = document.getElementById('trend-sin');
    const trendCos = document.getElementById('trend-cos');
    const trendTan = document.getElementById('trend-tan');
    const barSin = document.getElementById('bar-sin');
    const barCos = document.getElementById('bar-cos');
    const barTan = document.getElementById('bar-tan');
    const lineSin = document.getElementById('line-sin');
    const lineCos = document.getElementById('line-cos');
    const lineTan = document.getElementById('line-tan');
    const lineRadius = document.getElementById('line-radius');
    const labelSin = document.getElementById('label-sin');
    const labelCos = document.getElementById('label-cos');
    const labelTan = document.getElementById('label-tan');
    const angleArc = document.getElementById('angle-arc');
    const angleTheta = document.getElementById('angle-theta');

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

        // Update progress bars (Same scale: 1.0 = 100%)
        barSin.style.width = Math.min(s * 100, 100) + '%';
        barCos.style.width = Math.min(c * 100, 100) + '%';
        barTan.style.width = Math.min(t * 100, 100) + '%';

        // SVG Visualization logic (Unit circle R=100)
        const R = 100;
        const originX = 20;
        const originY = 130;

        // Radius end point on circle
        const circleX = originX + R * c;
        const circleY = originY - R * s;

        // Radius line
        lineRadius.setAttribute('x2', circleX);
        lineRadius.setAttribute('y2', circleY);

        // Angle Arc and Theta Label
        const arcR = 25; // Small radius for angle arc
        const arcEndX = originX + arcR * c;
        const arcEndY = originY - arcR * s;
        
        if (deg > 0) {
            angleArc.setAttribute('d', `M ${originX + arcR} ${originY} A ${arcR} ${arcR} 0 0 0 ${arcEndX} ${arcEndY}`);
            angleArc.style.display = 'block';
        } else {
            angleArc.style.display = 'none';
        }

        // Place theta in the middle of the angle, slightly outside the arc
        const midRad = rad / 2;
        const thetaDist = arcR + 9;
        const thetaX = originX + thetaDist * Math.cos(midRad);
        const thetaY = originY - thetaDist * Math.sin(midRad);
        angleTheta.setAttribute('x', thetaX);
        angleTheta.setAttribute('y', thetaY);

        // Cosine line (Horizontal from origin to circleX)
        lineCos.setAttribute('x2', circleX);
        labelCos.setAttribute('x', originX + (R * c) / 2 - 10);
        labelCos.setAttribute('y', originY + 12);

        // Sine line (Vertical from circleX to circleY)
        lineSin.setAttribute('x1', circleX);
        lineSin.setAttribute('y1', originY);
        lineSin.setAttribute('x2', circleX);
        lineSin.setAttribute('y2', circleY);
        labelSin.setAttribute('x', circleX + 5);
        labelSin.setAttribute('y', originY - (R * s) / 2);

        // Tangent line (Vertical from (originX + R) up to intersection)
        const tanX = originX + R;
        const tanY = originY - R * t;
        
        if (deg < 90) {
            lineTan.setAttribute('x1', tanX);
            lineTan.setAttribute('y1', originY);
            lineTan.setAttribute('x2', tanX);
            lineTan.setAttribute('y2', Math.max(tanY, 10)); // Limit visual height
            lineTan.style.display = 'block';
            labelTan.setAttribute('x', tanX + 5);
            labelTan.setAttribute('y', Math.max(tanY + (originY - tanY) / 2, 20));
            labelTan.style.display = 'block';
        } else {
            lineTan.style.display = 'none';
            labelTan.style.display = 'none';
        }
    }

    trendRange.addEventListener('input', updateTrend);
    updateTrend(); // Initial call
});
