export default function initFlashcards() {
    const flashcardForm = document.getElementById('flashcardForm');
    const topicInput = document.getElementById('topicInput');
    const flashcardsContainer = document.getElementById('flashcardsContainer');
    const generateBtn = document.getElementById('generateBtn');
    const editBtn = document.getElementById('editBtn');
    const shuffleBtn = document.getElementById('shuffleBtn');
    
    let currentFlashcards = [];
    let currentIndex = 0;
    
    flashcardForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
        
        try {
            const response = await fetch('/flashcards', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: topicInput.value })
            });
            
            const data = await response.json();
            currentFlashcards = data.flashcards;
            renderFlashcard(currentIndex);
            toggleEditUI(true);
        } catch (error) {
            console.error('Error generating flashcards:', error);
            flashcardsContainer.innerHTML = `
                <div class="error-message">
                    Failed to generate flashcards. Please try again.
                </div>
            `;
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate';
        }
    });
    
    function renderFlashcard(index) {
        if (!currentFlashcards.length) return;
        
        const card = currentFlashcards[index];
        flashcardsContainer.innerHTML = `
            <div class="flashcard">
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <h3>${card.front}</h3>
                        <p>Click to flip</p>
                    </div>
                    <div class="flashcard-back">
                        <p>${card.back}</p>
                    </div>
                </div>
                <div class="flashcard-nav">
                    <span>${index + 1}/${currentFlashcards.length}</span>
                </div>
            </div>
        `;
        
        // Add flip interaction
        const flashcard = document.querySelector('.flashcard');
        flashcard.addEventListener('click', () => {
            flashcard.classList.toggle('flipped');
        });
    }
    
    // Navigation controls
    document.addEventListener('keydown', (e) => {
        if (!currentFlashcards.length) return;
        
        if (e.key === 'ArrowRight') {
            currentIndex = (currentIndex + 1) % currentFlashcards.length;
            renderFlashcard(currentIndex);
        } else if (e.key === 'ArrowLeft') {
            currentIndex = (currentIndex - 1 + currentFlashcards.length) % currentFlashcards.length;
            renderFlashcard(currentIndex);
        }
    });
    
    // Edit functionality
    editBtn.addEventListener('click', () => {
        const editModal = document.createElement('div');
        editModal.className = 'edit-modal';
        editModal.innerHTML = `
            <div class="edit-modal-content">
                <h3>Edit Flashcards</h3>
                <div class="flashcard-list">
                    ${currentFlashcards.map((card, i) => `
                        <div class="editable-card" data-index="${i}">
                            <input type="text" value="${card.front}" class="front-edit">
                            <input type="text" value="${card.back}" class="back-edit">
                        </div>
                    `).join('')}
                </div>
                <button id="saveEdits">Save Changes</button>
            </div>
        `;
        
        document.body.appendChild(editModal);
        
        document.getElementById('saveEdits').addEventListener('click', () => {
            document.querySelectorAll('.editable-card').forEach((cardEl, i) => {
                currentFlashcards[i].front = cardEl.querySelector('.front-edit').value;
                currentFlashcards[i].back = cardEl.querySelector('.back-edit').value;
            });
            editModal.remove();
            renderFlashcard(currentIndex);
        });
    });
    
    // Shuffle functionality
    shuffleBtn.addEventListener('click', () => {
        currentFlashcards = shuffleArray(currentFlashcards);
        currentIndex = 0;
        renderFlashcard(currentIndex);
    });
    
    function toggleEditUI(show) {
        editBtn.style.display = show ? 'block' : 'none';
        shuffleBtn.style.display = show ? 'block' : 'none';
    }
    
    function shuffleArray(array) {
        return array.sort(() => Math.random() - 0.5);
    }
}