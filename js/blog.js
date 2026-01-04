// Blog posts manifest
const blogPosts = [
    {
        id: 'spelling-bee',
        title: 'Spelling Bee Game',
        date: '2026-01-15',
        type: 'interactive',
        component: 'spelling-bee'
    },
    {
        id: 'tic-tac-toe',
        title: 'Interactive Tic-Tac-Toe Game',
        date: '2026-01-01',
        type: 'interactive',
        component: 'tic-tac-toe'
    }
    // Add more posts here as you create them
];

// Load and render blog posts
async function loadBlogPosts() {
    const container = document.getElementById('blog-container');
    
    if (!container) {
        return;
    }

    if (blogPosts.length === 0) {
        container.innerHTML = '<p>No blog posts yet. Check back soon!</p>';
        return;
    }

    // Sort posts by date (newest first)
    const sortedPosts = blogPosts.sort((a, b) => new Date(b.date) - new Date(a.date));

    let html = '';
    
    for (const post of sortedPosts) {
        const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        // Create link to individual post page
        const postUrl = `blog-${post.id}.html`;
        
        if (post.type === 'interactive') {
            // Handle interactive posts
            html += `
                <article class="blog-post">
                    <h2><a href="${postUrl}">${post.title}</a></h2>
                    <p class="blog-post-meta">${dateFormatted}</p>
                    <div class="blog-content" id="post-${post.id}"></div>
                </article>
            `;
        } else if (post.type === 'markdown') {
            // Handle markdown posts
            try {
                const response = await fetch(`posts/${post.filename}`);
                if (!response.ok) {
                    console.error(`Failed to load ${post.filename}`);
                    continue;
                }
                
                const markdown = await response.text();
                const content = marked.parse(markdown);
                
                html += `
                    <article class="blog-post">
                        <h2><a href="${postUrl}">${post.title}</a></h2>
                        <p class="blog-post-meta">${dateFormatted}</p>
                        <div class="blog-content">${content}</div>
                    </article>
                `;
            } catch (error) {
                console.error(`Error loading ${post.filename}:`, error);
            }
        }
    }
    
    container.innerHTML = html;
    
    // Initialize interactive components after rendering
    initializeInteractivePosts(sortedPosts);
}

// Load and render a single blog post
async function loadBlogPost(postId) {
    const container = document.getElementById('blog-post-container');
    
    if (!container) {
        return;
    }

    const post = blogPosts.find(p => p.id === postId);
    
    if (!post) {
        container.innerHTML = '<p>Post not found.</p>';
        return;
    }

    const dateFormatted = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    let html = '';
    
    if (post.type === 'interactive') {
        // Handle interactive posts
        html += `
            <article class="blog-post">
                <h2>${post.title}</h2>
                <p class="blog-post-meta">${dateFormatted}</p>
                <div class="blog-content" id="post-${post.id}"></div>
            </article>
        `;
    } else if (post.type === 'markdown') {
        // Handle markdown posts
        try {
            const response = await fetch(`posts/${post.filename}`);
            if (!response.ok) {
                container.innerHTML = '<p>Failed to load post content.</p>';
                return;
            }
            
            const markdown = await response.text();
            const content = marked.parse(markdown);
            
            html += `
                <article class="blog-post">
                    <h2>${post.title}</h2>
                    <p class="blog-post-meta">${dateFormatted}</p>
                    <div class="blog-content">${content}</div>
                </article>
            `;
        } catch (error) {
            console.error(`Error loading ${post.filename}:`, error);
            container.innerHTML = '<p>Error loading post content.</p>';
            return;
        }
    }
    
    container.innerHTML = html;
    
    // Initialize interactive components after rendering
    if (post.type === 'interactive') {
        initializeInteractivePosts([post]);
    }
}

// Initialize interactive post components
function initializeInteractivePosts(posts) {
    posts.forEach(post => {
        if (post.type === 'interactive') {
            const container = document.getElementById(`post-${post.id}`);
            if (container) {
                if (post.component === 'tic-tac-toe') {
                    renderTicTacToePost(container);
                } else if (post.component === 'spelling-bee') {
                    renderSpellingBeePost(container);
                }
            }
        }
    });
}

// Render spelling bee game as a blog post
function renderSpellingBeePost(container) {
    container.innerHTML = `
        <p>Try out this Spelling Bee game! Find as many words as possible using the given letters. Every word must include the center letter, and words must be at least 4 letters long. Earn bonus points for pangrams—words that use all 7 letters!</p>
        
        <div class="spelling-bee-container">
            <div class="spelling-bee-game-section">
                <div id="spelling-bee-letters" class="spelling-bee-letters-container"></div>
                
                <div class="spelling-bee-input-section">
                    <div class="spelling-bee-input-group">
                        <input type="text" id="spelling-bee-word" placeholder="Enter a word" maxlength="20" autocomplete="off">
                        <button id="spelling-bee-submit" class="game-button">Submit</button>
                    </div>
                    <div id="spelling-bee-feedback" class="spelling-bee-feedback"></div>
                </div>
                
                <div class="spelling-bee-score-section">
                    <div class="spelling-bee-score-display">
                        <span class="spelling-bee-score-label">Score:</span>
                        <span id="spelling-bee-score" class="spelling-bee-score-value">0 / 0</span>
                    </div>
                    <div class="spelling-bee-progress-container">
                        <div id="spelling-bee-progress" class="spelling-bee-progress-bar"></div>
                    </div>
                    <p class="spelling-bee-genius-target">Genius: 0 points</p>
                </div>
                
                <div class="spelling-bee-actions">
                    <button id="spelling-bee-new-puzzle" class="game-button">New Puzzle</button>
                </div>
            </div>
            
            <div class="spelling-bee-words-section">
                <h3>Found Words</h3>
                <div id="spelling-bee-found-words" class="spelling-bee-found-words-container">
                    <p class="spelling-bee-no-words">No words found yet. Start typing!</p>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the game after rendering (wait for DOM to be ready)
    setTimeout(() => {
        if (typeof SpellingBee !== 'undefined') {
            new SpellingBee();
        }
    }, 0);
}

// Render tic-tac-toe game as a blog post
function renderTicTacToePost(container) {
    container.innerHTML = `
        <p>Try out this interactive tic-tac-toe game! Two players can enter their names and compete. The leaderboard tracks wins, losses, and draws throughout your session.</p>
        
        <div class="game-container">
            <div class="player-setup">
                <div class="player-input">
                    <label for="player1">Player 1 (X):</label>
                    <input type="text" id="player1" placeholder="Enter name" maxlength="20">
                </div>
                <div class="player-input">
                    <label for="player2">Player 2 (O):</label>
                    <input type="text" id="player2" placeholder="Enter name" maxlength="20">
                </div>
                <button id="start-game" class="game-button">Start Game</button>
            </div>

            <div id="game-section" class="game-section hidden">
                <div class="game-info">
                    <p id="current-player">Player 1's turn</p>
                </div>
                
                <div class="board-container">
                    <div class="tic-tac-toe-board" id="game-board">
                        <div class="cell" data-index="0"></div>
                        <div class="cell" data-index="1"></div>
                        <div class="cell" data-index="2"></div>
                        <div class="cell" data-index="3"></div>
                        <div class="cell" data-index="4"></div>
                        <div class="cell" data-index="5"></div>
                        <div class="cell" data-index="6"></div>
                        <div class="cell" data-index="7"></div>
                        <div class="cell" data-index="8"></div>
                    </div>
                </div>

                <div class="game-actions">
                    <button id="reset-game" class="game-button">New Game</button>
                </div>
            </div>

            <div class="leaderboard-section">
                <h3>Leaderboard</h3>
                <div id="leaderboard" class="leaderboard">
                    <p class="no-stats">No games played yet</p>
                </div>
            </div>
        </div>
    `;
    
    // Initialize the game after rendering (wait for DOM to be ready)
    setTimeout(() => {
        if (typeof TicTacToe !== 'undefined') {
            new TicTacToe();
        }
    }, 0);
}

// Load posts when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Check if we're on a post page or the blog listing page
        const postContainer = document.getElementById('blog-post-container');
        if (postContainer) {
            // Extract post ID from URL (e.g., blog-spelling-bee.html -> spelling-bee)
            const path = window.location.pathname;
            const filename = path.split('/').pop();
            if (filename.startsWith('blog-') && filename.endsWith('.html')) {
                const postId = filename.replace('blog-', '').replace('.html', '');
                loadBlogPost(postId);
            }
        } else {
            loadBlogPosts();
        }
    });
} else {
    const postContainer = document.getElementById('blog-post-container');
    if (postContainer) {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        if (filename.startsWith('blog-') && filename.endsWith('.html')) {
            const postId = filename.replace('blog-', '').replace('.html', '');
            loadBlogPost(postId);
        }
    } else {
        loadBlogPosts();
    }
}

