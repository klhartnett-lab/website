// Blog posts manifest
const blogPosts = [
    {
        id: 'tic-tac-toe',
        title: 'Interactive Tic-Tac-Toe Game',
        date: '2026-01-01',
        type: 'interactive',
        component: 'tic-tac-toe'
    },
    {
        id: 'example',
        title: 'Example Blog Post',
        date: '2024-01-01',
        type: 'markdown',
        filename: 'example.md'
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
                    console.error(`Failed to load ${post.filename}`);
                    continue;
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
            }
        }
    }
    
    container.innerHTML = html;
    
    // Initialize interactive components after rendering
    initializeInteractivePosts(sortedPosts);
}

// Initialize interactive post components
function initializeInteractivePosts(posts) {
    posts.forEach(post => {
        if (post.type === 'interactive' && post.component === 'tic-tac-toe') {
            const container = document.getElementById(`post-${post.id}`);
            if (container) {
                renderTicTacToePost(container);
            }
        }
    });
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
    document.addEventListener('DOMContentLoaded', loadBlogPosts);
} else {
    loadBlogPosts();
}

