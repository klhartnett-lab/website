// Tic-Tac-Toe Game Logic
class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.player1Name = '';
        this.player2Name = '';
        this.gameActive = false;
        this.leaderboard = {};
        
        this.winningConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        const startButton = document.getElementById('start-game');
        const resetButton = document.getElementById('reset-game');
        const cells = document.querySelectorAll('.cell');
        
        startButton.addEventListener('click', () => this.startGame());
        resetButton.addEventListener('click', () => this.resetGame());
        
        cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.getAttribute('data-index'));
                this.handleCellClick(index);
            });
        });
    }
    
    startGame() {
        const player1Input = document.getElementById('player1');
        const player2Input = document.getElementById('player2');
        
        this.player1Name = player1Input.value.trim() || 'Player 1';
        this.player2Name = player2Input.value.trim() || 'Player 2';
        
        if (this.player1Name === this.player2Name) {
            alert('Please enter different names for each player.');
            return;
        }
        
        // Initialize leaderboard if players are new
        if (!this.leaderboard[this.player1Name]) {
            this.leaderboard[this.player1Name] = { wins: 0, losses: 0, draws: 0 };
        }
        if (!this.leaderboard[this.player2Name]) {
            this.leaderboard[this.player2Name] = { wins: 0, losses: 0, draws: 0 };
        }
        
        // Hide setup, show game
        document.querySelector('.player-setup').classList.add('hidden');
        document.getElementById('game-section').classList.remove('hidden');
        
        this.resetGame();
    }
    
    resetGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        
        // Clear board display
        const cells = document.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('occupied', 'winning');
        });
        
        this.updateGameInfo();
    }
    
    handleCellClick(index) {
        if (!this.gameActive || this.board[index] !== '') {
            return;
        }
        
        this.board[index] = this.currentPlayer;
        this.updateCellDisplay(index);
        
        const result = this.checkGameResult();
        
        if (result === 'win') {
            this.handleWin();
        } else if (result === 'draw') {
            this.handleDraw();
        } else {
            this.switchPlayer();
        }
    }
    
    updateCellDisplay(index) {
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = this.currentPlayer;
        cell.classList.add('occupied');
    }
    
    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        this.updateGameInfo();
    }
    
    updateGameInfo() {
        const currentPlayerName = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
        document.getElementById('current-player').textContent = `${currentPlayerName}'s turn (${this.currentPlayer})`;
    }
    
    checkGameResult() {
        // Check for win
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                return 'win';
            }
        }
        
        // Check for draw
        if (this.board.every(cell => cell !== '')) {
            return 'draw';
        }
        
        return 'continue';
    }
    
    handleWin() {
        this.gameActive = false;
        const winnerName = this.currentPlayer === 'X' ? this.player1Name : this.player2Name;
        const loserName = this.currentPlayer === 'X' ? this.player2Name : this.player1Name;
        
        // Update leaderboard
        this.leaderboard[winnerName].wins++;
        this.leaderboard[loserName].losses++;
        
        // Highlight winning cells
        for (let condition of this.winningConditions) {
            const [a, b, c] = condition;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                document.querySelector(`[data-index="${a}"]`).classList.add('winning');
                document.querySelector(`[data-index="${b}"]`).classList.add('winning');
                document.querySelector(`[data-index="${c}"]`).classList.add('winning');
                break;
            }
        }
        
        document.getElementById('current-player').textContent = `${winnerName} wins!`;
        this.updateLeaderboard();
    }
    
    handleDraw() {
        this.gameActive = false;
        
        // Update leaderboard
        this.leaderboard[this.player1Name].draws++;
        this.leaderboard[this.player2Name].draws++;
        
        document.getElementById('current-player').textContent = "It's a draw!";
        this.updateLeaderboard();
    }
    
    updateLeaderboard() {
        const leaderboardDiv = document.getElementById('leaderboard');
        
        // Sort players by wins (descending), then by losses (ascending)
        const sortedPlayers = Object.entries(this.leaderboard)
            .sort((a, b) => {
                if (b[1].wins !== a[1].wins) {
                    return b[1].wins - a[1].wins;
                }
                return a[1].losses - b[1].losses;
            });
        
        if (sortedPlayers.length === 0) {
            leaderboardDiv.innerHTML = '<p class="no-stats">No games played yet</p>';
            return;
        }
        
        leaderboardDiv.innerHTML = `
            <div class="leaderboard-header">
                <span>Player</span>
                <span>Wins</span>
                <span>Losses</span>
                <span>Draws</span>
            </div>
            ${sortedPlayers.map(([name, stats]) => {
                return `
                    <div class="leaderboard-item">
                        <span class="player-name">${name}</span>
                        <span class="stat-value">${stats.wins}</span>
                        <span class="stat-value">${stats.losses}</span>
                        <span class="stat-value">${stats.draws}</span>
                    </div>
                `;
            }).join('')}
        `;
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new TicTacToe();
});

