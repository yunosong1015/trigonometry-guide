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
    const vizTriangle = document.getElementById('viz-triangle');
    const vizArc = document.getElementById('viz-arc');

    function updateTrend() {
        const deg = parseInt(trendRange.value);
        const rad = (deg * Math.PI) / 180;
        
        currentAngle.textContent = deg;
        
        const s = Math.sin(rad);
        const c = Math.cos(rad);
        const t = deg === 90 ? 999 : Math.tan(rad);

        trendSin.textContent = s.toFixed(4);
        trendCos.textContent = c.toFixed(4);
        trendTan.textContent = deg === 90 ? '∞' : t.toFixed(4);

        // Update progress bars
        barSin.style.width = (s * 100) + '%';
        barCos.style.width = (c * 100) + '%';
        barTan.style.width = Math.min(t * 20, 100) + '%'; // Tan grows fast, so scaled

        // Update SVG visualization
        const r = 80;
        const startX = 20;
        const startY = 100;
        const endX = startX + r * c;
        const endY = startY - r * s;

        vizTriangle.setAttribute('d', `M ${startX} ${startY} L ${endX} ${startY} L ${endX} ${endY} Z`);
        
        // Arc path
        const largeArcFlag = deg > 180 ? 1 : 0;
        vizArc.setAttribute('d', `M ${startX + r} ${startY} A ${r} ${r} 0 ${largeArcFlag} 0 ${endX} ${endY} L ${startX} ${startY} Z`);
    }

    trendRange.addEventListener('input', updateTrend);
    updateTrend(); // Initial call
});
