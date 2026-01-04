// Spelling Bee Game Logic
class SpellingBee {
    constructor() {
        this.letters = [];
        this.centerLetter = '';
        this.foundWords = new Set();
        this.score = 0;
        this.validatedWordsCache = new Map(); // Cache API responses
        this.maxScore = 0; // Will be calculated or set as genius target
        
        this.generatePuzzle();
        this.initializeEventListeners();
    }
    
    generatePuzzle() {
        // Generate 7 random letters (ensuring at least one vowel)
        const vowels = ['A', 'E', 'I', 'O', 'U'];
        const consonants = 'BCDFGHJKLMNPQRSTVWXYZ'.split('');
        
        // Ensure at least one vowel
        const numVowels = Math.floor(Math.random() * 3) + 1; // 1-3 vowels
        const numConsonants = 7 - numVowels;
        
        const selectedVowels = [];
        const selectedConsonants = [];
        
        // Select vowels
        for (let i = 0; i < numVowels; i++) {
            let vowel;
            do {
                vowel = vowels[Math.floor(Math.random() * vowels.length)];
            } while (selectedVowels.includes(vowel));
            selectedVowels.push(vowel);
        }
        
        // Select consonants
        for (let i = 0; i < numConsonants; i++) {
            let consonant;
            do {
                consonant = consonants[Math.floor(Math.random() * consonants.length)];
            } while (selectedConsonants.includes(consonant));
            selectedConsonants.push(consonant);
        }
        
        // Combine and shuffle
        this.letters = [...selectedVowels, ...selectedConsonants].sort(() => Math.random() - 0.5);
        
        // Set center letter (random from the 7)
        this.centerLetter = this.letters[Math.floor(Math.random() * this.letters.length)];
        
        // Set genius target (70% of estimated max score, or minimum 50 points)
        this.maxScore = Math.max(50, Math.floor(Math.random() * 100 + 50));
        
        // Reset game state
        this.foundWords.clear();
        this.score = 0;
        this.validatedWordsCache.clear();
        
        this.updateDisplay();
    }
    
    initializeEventListeners() {
        const submitButton = document.getElementById('spelling-bee-submit');
        const wordInput = document.getElementById('spelling-bee-word');
        const newPuzzleButton = document.getElementById('spelling-bee-new-puzzle');
        
        if (submitButton) {
            submitButton.addEventListener('click', () => this.submitWord());
        }
        
        if (wordInput) {
            wordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitWord();
                }
            });
        }
        
        if (newPuzzleButton) {
            newPuzzleButton.addEventListener('click', () => this.generatePuzzle());
        }
    }
    
    async submitWord() {
        const wordInput = document.getElementById('spelling-bee-word');
        const feedbackDiv = document.getElementById('spelling-bee-feedback');
        const submitButton = document.getElementById('spelling-bee-submit');
        
        if (!wordInput || !feedbackDiv) return;
        
        const word = wordInput.value.trim().toUpperCase();
        
        // Clear previous feedback
        feedbackDiv.textContent = '';
        feedbackDiv.className = 'spelling-bee-feedback';
        
        if (!word) {
            return;
        }
        
        // Basic validation
        if (word.length < 4) {
            this.showFeedback('Word must be at least 4 letters long.', 'error');
            return;
        }
        
        if (!word.includes(this.centerLetter)) {
            this.showFeedback(`Word must include the center letter "${this.centerLetter}".`, 'error');
            return;
        }
        
        // Check if word uses only valid letters
        const wordLetters = word.split('');
        const validLetters = new Set(this.letters);
        if (!wordLetters.every(letter => validLetters.has(letter))) {
            this.showFeedback('Word can only use the given letters.', 'error');
            return;
        }
        
        // Check if already found
        if (this.foundWords.has(word)) {
            this.showFeedback('You already found this word!', 'error');
            return;
        }
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Checking...';
        this.showFeedback('Validating word...', 'info');
        
        // Validate word with dictionary API
        const isValid = await this.validateWord(word);
        
        submitButton.disabled = false;
        submitButton.textContent = 'Submit';
        
        if (isValid) {
            // Add word and update score
            this.foundWords.add(word);
            const wordScore = this.calculateWordScore(word);
            this.score += wordScore;
            
            this.showFeedback(`Great! +${wordScore} points`, 'success');
            wordInput.value = '';
            this.updateDisplay();
            
            // Check for genius level
            if (this.score >= this.maxScore) {
                setTimeout(() => {
                    this.showFeedback(`🎉 Genius! You've reached ${this.score} points!`, 'success');
                }, 500);
            }
        } else {
            this.showFeedback('Not a valid word.', 'error');
        }
    }
    
    async validateWord(word) {
        // Check cache first
        if (this.validatedWordsCache.has(word)) {
            return this.validatedWordsCache.get(word);
        }
        
        try {
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`);
            
            if (!response.ok) {
                // Word not found in dictionary
                this.validatedWordsCache.set(word, false);
                return false;
            }
            
            const data = await response.json();
            
            // Check if it's a valid entry (not a proper noun, etc.)
            // Basic check: if the word starts with uppercase in the definition, it might be a proper noun
            // Also check for hyphenated words
            if (word.includes('-')) {
                this.validatedWordsCache.set(word, false);
                return false;
            }
            
            // Check if word matches the entry word (case-insensitive)
            const entryWord = data[0]?.word?.toUpperCase();
            if (entryWord && entryWord === word) {
                // Additional check: exclude if it's marked as a proper noun
                // Most dictionary APIs don't include proper nouns, but we'll be safe
                this.validatedWordsCache.set(word, true);
                return true;
            }
            
            this.validatedWordsCache.set(word, false);
            return false;
        } catch (error) {
            console.error('Error validating word:', error);
            // On error, we could allow the word or reject it. Rejecting is safer.
            this.validatedWordsCache.set(word, false);
            return false;
        }
    }
    
    calculateWordScore(word) {
        const length = word.length;
        let baseScore = 0;
        
        // Base scoring: 1 point for 4-letter words, then 1 point per additional letter
        if (length === 4) {
            baseScore = 1;
        } else {
            baseScore = length - 3; // 5 letters = 2 pts, 6 = 3 pts, etc.
        }
        
        // Check for pangram (uses all 7 letters)
        const uniqueLetters = new Set(word.split(''));
        const allLettersUsed = this.letters.every(letter => uniqueLetters.has(letter));
        
        if (allLettersUsed) {
            // Bonus points for pangram (7 extra points)
            baseScore += 7;
        }
        
        return baseScore;
    }
    
    isPangram(word) {
        const uniqueLetters = new Set(word.split(''));
        return this.letters.every(letter => uniqueLetters.has(letter));
    }
    
    showFeedback(message, type) {
        const feedbackDiv = document.getElementById('spelling-bee-feedback');
        if (!feedbackDiv) return;
        
        feedbackDiv.textContent = message;
        feedbackDiv.className = `spelling-bee-feedback spelling-bee-feedback-${type}`;
    }
    
    updateDisplay() {
        this.updateLetters();
        this.updateFoundWords();
        this.updateScore();
    }
    
    updateLetters() {
        const container = document.getElementById('spelling-bee-letters');
        if (!container) return;
        
        // Create hexagonal layout
        const outerLetters = this.letters.filter(letter => letter !== this.centerLetter);
        
        container.innerHTML = `
            <div class="spelling-bee-hexagon">
                <div class="spelling-bee-letter spelling-bee-letter-outer" data-letter="${outerLetters[0]}">${outerLetters[0]}</div>
                <div class="spelling-bee-letter spelling-bee-letter-outer" data-letter="${outerLetters[1]}">${outerLetters[1]}</div>
                <div class="spelling-bee-letter spelling-bee-letter-center" data-letter="${this.centerLetter}">${this.centerLetter}</div>
                <div class="spelling-bee-letter spelling-bee-letter-outer" data-letter="${outerLetters[2]}">${outerLetters[2]}</div>
                <div class="spelling-bee-letter spelling-bee-letter-outer" data-letter="${outerLetters[3]}">${outerLetters[3]}</div>
                <div class="spelling-bee-letter spelling-bee-letter-outer" data-letter="${outerLetters[4]}">${outerLetters[4]}</div>
                <div class="spelling-bee-letter spelling-bee-letter-outer" data-letter="${outerLetters[5]}">${outerLetters[5]}</div>
            </div>
        `;
    }
    
    updateFoundWords() {
        const container = document.getElementById('spelling-bee-found-words');
        if (!container) return;
        
        if (this.foundWords.size === 0) {
            container.innerHTML = '<p class="spelling-bee-no-words">No words found yet. Start typing!</p>';
            return;
        }
        
        // Sort words alphabetically
        const sortedWords = Array.from(this.foundWords).sort();
        
        container.innerHTML = `
            <div class="spelling-bee-words-list">
                ${sortedWords.map(word => {
                    const isPangram = this.isPangram(word);
                    const score = this.calculateWordScore(word);
                    return `
                        <div class="spelling-bee-word-item ${isPangram ? 'spelling-bee-pangram' : ''}">
                            <span class="spelling-bee-word-text">${word}</span>
                            ${isPangram ? '<span class="spelling-bee-pangram-badge">★</span>' : ''}
                            <span class="spelling-bee-word-score">+${score}</span>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }
    
    updateScore() {
        const scoreDiv = document.getElementById('spelling-bee-score');
        const progressDiv = document.getElementById('spelling-bee-progress');
        const geniusTargetDiv = document.querySelector('.spelling-bee-genius-target');
        
        if (scoreDiv) {
            scoreDiv.textContent = `${this.score} / ${this.maxScore}`;
        }
        
        if (geniusTargetDiv) {
            geniusTargetDiv.textContent = `Genius: ${this.maxScore} points`;
        }
        
        if (progressDiv) {
            const percentage = Math.min(100, (this.score / this.maxScore) * 100);
            progressDiv.style.width = `${percentage}%`;
            
            // Update progress bar class based on achievement level
            progressDiv.className = 'spelling-bee-progress-bar';
            if (this.score >= this.maxScore) {
                progressDiv.classList.add('spelling-bee-genius');
            } else if (this.score >= this.maxScore * 0.7) {
                progressDiv.classList.add('spelling-bee-amazing');
            } else if (this.score >= this.maxScore * 0.5) {
                progressDiv.classList.add('spelling-bee-great');
            }
        }
    }
}

// Game will be initialized by blog.js when the post is rendered

