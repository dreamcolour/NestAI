export default function initLanguageMode() {
    const languageForm = document.getElementById('languageForm');
    const textInput = document.getElementById('textInput');
    const languageSelect = document.getElementById('languageSelect');
    const generateGuideBtn = document.getElementById('generateGuideBtn');
    const studyGuideContainer = document.getElementById('studyGuideContainer');
    
    languageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        generateGuideBtn.disabled = true;
        generateGuideBtn.textContent = 'Analyzing...';
        
        try {
            const response = await fetch('/language-guide', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: textInput.value,
                    language: languageSelect.value 
                })
            });
            
            const guide = await response.json();
            renderStudyGuide(guide);
        } catch (error) {
            console.error('Error generating language guide:', error);
            studyGuideContainer.innerHTML = `
                <div class="error-message">
                    Failed to analyze text. Please try again.
                </div>
            `;
        } finally {
            generateGuideBtn.disabled = false;
            generateGuideBtn.textContent = 'Generate Study Guide';
        }
    });
    
    function renderStudyGuide(guide) {
        studyGuideContainer.innerHTML = `
            <div class="study-guide">
                <h3>Your Personalized Study Plan</h3>
                <ul class="study-steps">
                    ${guide.steps.map(step => `
                        <li class="study-step">
                            <div class="step-header">
                                <span class="step-icon">${getStepIcon(step.title)}</span>
                                <h4>${step.title}</h4>
                            </div>
                            <p>${step.description}</p>
                        </li>
                    `).join('')}
                </ul>
                <button id="startStudyBtn">Begin Study Session</button>
            </div>
        `;
        
        document.getElementById('startStudyBtn').addEventListener('click', () => {
            startStudySession(guide);
        });
    }
    
    function getStepIcon(stepTitle) {
        const icons = {
            'Vocabulary': '📖',
            'Grammar': '📝',
            'Translation': '🌐',
            'Practice': '🔁',
            'Memory': '🧠'
        };
        
        for (const [key, icon] of Object.entries(icons)) {
            if (stepTitle.includes(key)) return icon;
        }
        return '✨';
    }
    
    function startStudySession(guide) {
        // Implement study session flow
        console.log('Starting study session with:', guide);
        // This would track progress through each step
    }
}