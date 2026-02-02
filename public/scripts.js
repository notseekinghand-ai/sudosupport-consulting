document.addEventListener('DOMContentLoaded', () => {
    const btnCalc = document.getElementById('btn-calc');
    const resultSavings = document.getElementById('result-savings');
    
    // Pricing data (ZAR per year)
    const pricing = {
        windows: 3500, // Win 11 Pro average license + overhead
        winServer: 15000, // Windows Server Standard + CALs
        m365: 2400, // R200/month average
        m365Premium: 3600, // R300/month average
        linuxSupport: 800 // Per seat annual managed support
    };

    btnCalc.addEventListener('click', () => {
        const workstations = parseInt(document.getElementById('input-workstations').value) || 0;
        const servers = parseInt(document.getElementById('input-servers').value) || 0;
        const office = document.getElementById('input-office').value;

        // Current Annual Costs
        let currentCost = (workstations * pricing.windows) + (servers * pricing.winServer);
        
        if (office === 'm365') {
            currentCost += (workstations * pricing.m365);
        } else if (office === 'm365-premium') {
            currentCost += (workstations * pricing.m365Premium);
        }

        // Linux Annual Costs (Just Support)
        const linuxCost = (workstations + servers) * pricing.linuxSupport;

        // Total Savings
        const annualSavings = currentCost - linuxCost;

        // Animated result update
        animateValue(resultSavings, 0, annualSavings, 1000);
    });

    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const value = Math.floor(progress * (end - start) + start);
            obj.innerHTML = value.toLocaleString();
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    }
});
