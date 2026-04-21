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
});
