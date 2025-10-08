// Constants
    const MU_0 = 4 * Math.PI * 1e-7; // H/m

    // Theme toggle functionality
    function toggleTheme() {
      const html = document.documentElement;
      const themeIcon = document.getElementById('theme-icon');
      const currentTheme = html.getAttribute('data-theme');
      
      if (currentTheme === 'light') {
        html.setAttribute('data-theme', 'dark');
        themeIcon.className = 'fas fa-sun';
      } else {
        html.setAttribute('data-theme', 'light');
        themeIcon.className = 'fas fa-moon';
      }
    }

    function showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        errorDiv.remove();
      }, 5000);
    }

    function calculate() {
      const resultsContainer = document.getElementById('results');
      
      // Show loading state
      resultsContainer.innerHTML = '<div class="calculating">Calculating core parameters...</div>';
      
      setTimeout(() => {
        try {
          // Read inputs
          const IDmm = parseFloat(document.getElementById("id").value);
          const ODmm = parseFloat(document.getElementById("od").value);
          const hmm = parseFloat(document.getElementById("h").value);
          const ur = parseFloat(document.getElementById("ur").value);
          const N = parseFloat(document.getElementById("n").value);
          const lgmm = parseFloat(document.getElementById("lg").value);

          // Input validation
          if ([IDmm, ODmm, hmm, ur, N].some(v => isNaN(v) || v <= 0) || isNaN(lgmm) || lgmm < 0) {
            showError('All values must be positive numbers (gap can be 0)');
            resultsContainer.innerHTML = '<div class="placeholder-state">Invalid input parameters</div>';
            return;
          }

          if (ODmm <= IDmm) {
            showError('Outer diameter must be greater than inner diameter');
            resultsContainer.innerHTML = '<div class="placeholder-state">Invalid geometry constraints</div>';
            return;
          }

          // Convert mm → m
          const ID = IDmm / 1000;
          const OD = ODmm / 1000;
          const h = hmm / 1000;
          const lg = lgmm / 1000; // gap length in meters

          // Effective area and length (m², m)
          const Ae_m2 = ((OD - ID) * h) / 2;
          const Le_m = Math.PI * (OD - ID) / Math.log(OD / ID);

          // Volumes for display (mm², mm, mm³)
          const Ae_mm2 = Ae_m2 * 1e6;
          const Le_mm = Le_m * 1000;
          const Ve_mm3 = Ae_m2 * Le_m * 1e9;

          // AL (no gap) in nH/N² = μ0*μr*(Ae/Le)*1e9
          const AL_noGap_nH = (MU_0 * ur * Ae_m2 / Le_m) * 1e9;

          // Inductance (no gap) in µH: = (AL_nH * N²) / 1000
          const L_noGap_uH = (AL_noGap_nH * N * N) / 1000;

          // AL (with gap) in nH/N²: = [μ0*Ae / (Le/ur + lg)] *1e9
          const AL_withGap_nH = (MU_0 * Ae_m2 / (Le_m / ur + lg)) * 1e9;

          // Inductance (with gap) in µH
          const L_withGap_uH = (AL_withGap_nH * N * N) / 1000;

          // Display results
          let html = `
            <div class="result-display">
              <div class="result-title">
                <i class="fas fa-check-circle"></i>
                Core Design Results
              </div>
              <div class="result-grid">
          `;

          const results = [
            { label: 'Effective Length (Lₑ)', value: `${Le_mm.toFixed(3)} mm` },
            { label: 'Effective Area (Aₑ)', value: `${Ae_mm2.toFixed(3)} mm²` },
            { label: 'Effective Volume (Vₑ)', value: `${Ve_mm3.toFixed(3)} mm³` },
            { label: 'AL Factor (No Gap)', value: `${AL_noGap_nH.toFixed(2)} nH/N²` },
            { label: 'Inductance (No Gap)', value: `${L_noGap_uH.toFixed(2)} μH` },
            { label: 'AL Factor (With Gap)', value: `${AL_withGap_nH.toFixed(2)} nH/N²` },
            { label: 'Inductance (With Gap)', value: `${L_withGap_uH.toFixed(2)} μH` }
          ];

          results.forEach(result => {
            html += `
              <div class="result-item">
                <div class="result-label">${result.label}</div>
                <div class="result-value updated">${result.value}</div>
              </div>
            `;
          });

          html += `
              </div>
            </div>
          `;

          resultsContainer.innerHTML = html;
          resultsContainer.className = 'animate-in';
          
          // Re-render MathJax if needed
          if (window.MathJax) {
            MathJax.typeset();
          }
        } catch (error) {
          showError(`Calculation error: ${error.message}`);
          resultsContainer.innerHTML = '<div class="placeholder-state">Calculation failed. Please check your input values.</div>';
        }
      }, 600);
    }

    // Initialize with default calculation
    document.addEventListener('DOMContentLoaded', function() {
      calculate();
    });
