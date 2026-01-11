// 斗兽棋游戏 - 适合4-5岁儿童
// Animal Chess Game for Kids

// ==================== 游戏配置 ====================
const ANIMALS = {
    ELEPHANT: { rank: 8, emoji: '🐘', name: '象' },
    LION: { rank: 7, emoji: '🦁', name: '狮' },
    TIGER: { rank: 6, emoji: '🐯', name: '虎' },
    LEOPARD: { rank: 5, emoji: '🐆', name: '豹' },
    WOLF: { rank: 4, emoji: '🐺', name: '狼' },
    DOG: { rank: 3, emoji: '🐕', name: '狗' },
    CAT: { rank: 2, emoji: '🐱', name: '猫' },
    RAT: { rank: 1, emoji: '🐭', name: '鼠' }
};

// 棋盘尺寸：7列 x 9行
const COLS = 7;
const ROWS = 9;

// 河流位置（中间两行，左右各3格）
const RIVER_CELLS = [
    [1, 3], [2, 3], [4, 3], [5, 3],
    [1, 4], [2, 4], [4, 4], [5, 4],
    [1, 5], [2, 5], [4, 5], [5, 5]
];

// 陷阱位置
const TRAPS = {
    red: [[2, 0], [4, 0], [3, 1]],    // 红方陷阱（上方）
    blue: [[2, 8], [4, 8], [3, 7]]    // 蓝方陷阱（下方）
};

// 兽穴位置
const DENS = {
    red: [3, 0],   // 红方兽穴（上方中间）
    blue: [3, 8]   // 蓝方兽穴（下方中间）
};

// 初始棋子位置
const INITIAL_POSITIONS = {
    red: [
        { type: 'LION', pos: [0, 0] },
        { type: 'TIGER', pos: [6, 0] },
        { type: 'DOG', pos: [1, 1] },
        { type: 'CAT', pos: [5, 1] },
        { type: 'RAT', pos: [0, 2] },
        { type: 'LEOPARD', pos: [2, 2] },
        { type: 'WOLF', pos: [4, 2] },
        { type: 'ELEPHANT', pos: [6, 2] }
    ],
    blue: [
        { type: 'TIGER', pos: [0, 8] },
        { type: 'LION', pos: [6, 8] },
        { type: 'CAT', pos: [1, 7] },
        { type: 'DOG', pos: [5, 7] },
        { type: 'ELEPHANT', pos: [0, 6] },
        { type: 'WOLF', pos: [2, 6] },
        { type: 'LEOPARD', pos: [4, 6] },
        { type: 'RAT', pos: [6, 6] }
    ]
};

// ==================== 游戏状态 ====================
let gameState = {
    board: [],
    currentPlayer: 'blue',  // blue = 玩家（下方）, red = AI（上方）
    selectedPiece: null,
    validMoves: [],
    playerScore: 0,
    aiScore: 0,
    gameOver: false,
    soundEnabled: true,
    difficulty: 'amelia',  // 'amelia' = 简单, 'yolanda' = 中等, 'neo' = 困难
    playerName: 'Amelia'
};

// 玩家配置
const PLAYERS = {
    amelia: { name: 'Amelia', avatar: '👧', difficulty: '简单' },
    yolanda: { name: 'Yolanda', avatar: '👩', difficulty: '中等' },
    neo: { name: 'Neo', avatar: '🦸', difficulty: '困难' }
};

// 选择玩家身份
function selectPlayer(playerId) {
    gameState.difficulty = playerId;
    gameState.playerName = PLAYERS[playerId].name;

    // 更新按钮状态
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.player-btn[data-player="${playerId}"]`).classList.add('active');

    // 更新显示名称
    document.getElementById('player-name-display').textContent =
        `${PLAYERS[playerId].avatar} ${PLAYERS[playerId].name}`;

    playSound('select');

    // 重新开始游戏
    startGame();
}

// ==================== 音效系统 ====================
const AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new AudioContext();
    }
}

function playSound(type) {
    if (!gameState.soundEnabled) return;

    initAudio();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    switch(type) {
        case 'select':
            oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
            break;

        case 'move':
            oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime); // E5
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.15);
            break;

        case 'capture':
            // 吃子音效 - 两个音符
            oscillator.frequency.setValueAtTime(784, audioCtx.currentTime); // G5
            oscillator.frequency.setValueAtTime(988, audioCtx.currentTime + 0.1); // B5
            oscillator.type = 'square';
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
            break;

        case 'win':
            // 胜利音效 - 欢快的旋律
            playWinMelody();
            break;

        case 'lose':
            oscillator.frequency.setValueAtTime(200, audioCtx.currentTime);
            oscillator.type = 'sawtooth';
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
            break;

        case 'hint':
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.1);
            break;
    }
}

function playWinMelody() {
    initAudio();
    const notes = [523.25, 659.25, 784, 1046.5]; // C5, E5, G5, C6

    notes.forEach((freq, i) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.15);
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.15 + 0.3);
        osc.start(audioCtx.currentTime + i * 0.15);
        osc.stop(audioCtx.currentTime + i * 0.15 + 0.3);
    });
}

function toggleSound() {
    gameState.soundEnabled = !gameState.soundEnabled;
    const btn = document.getElementById('btn-sound');
    btn.textContent = gameState.soundEnabled ? '🔊 声音' : '🔇 静音';

    if (gameState.soundEnabled) {
        playSound('select');
    }
}

// ==================== 棋盘初始化 ====================
function initBoard() {
    gameState.board = [];

    for (let y = 0; y < ROWS; y++) {
        gameState.board[y] = [];
        for (let x = 0; x < COLS; x++) {
            gameState.board[y][x] = null;
        }
    }

    // 放置红方棋子（玩家）
    INITIAL_POSITIONS.red.forEach(piece => {
        const [x, y] = piece.pos;
        gameState.board[y][x] = {
            type: piece.type,
            player: 'red',
            ...ANIMALS[piece.type]
        };
    });

    // 放置蓝方棋子（AI）
    INITIAL_POSITIONS.blue.forEach(piece => {
        const [x, y] = piece.pos;
        gameState.board[y][x] = {
            type: piece.type,
            player: 'blue',
            ...ANIMALS[piece.type]
        };
    });
}

function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.x = x;
            cell.dataset.y = y;

            // 添加特殊格子样式
            if (isRiver(x, y)) {
                cell.classList.add('river');
            }
            if (isTrap(x, y, 'red')) {
                cell.classList.add('trap', 'red-trap');
            }
            if (isTrap(x, y, 'blue')) {
                cell.classList.add('trap', 'blue-trap');
            }
            if (isDen(x, y, 'red')) {
                cell.classList.add('den', 'red-den');
            }
            if (isDen(x, y, 'blue')) {
                cell.classList.add('den', 'blue-den');
            }

            // 添加棋子
            const piece = gameState.board[y][x];
            if (piece) {
                const pieceEl = document.createElement('div');
                pieceEl.className = `piece ${piece.player}`;
                pieceEl.textContent = piece.emoji;
                pieceEl.dataset.x = x;
                pieceEl.dataset.y = y;
                cell.appendChild(pieceEl);
            }

            // 高亮可移动位置
            if (gameState.validMoves.some(m => m[0] === x && m[1] === y)) {
                const targetPiece = gameState.board[y][x];
                if (targetPiece && targetPiece.player !== gameState.currentPlayer) {
                    cell.classList.add('can-capture');
                } else {
                    cell.classList.add('highlight');
                }
            }

            // 高亮选中的棋子
            if (gameState.selectedPiece &&
                gameState.selectedPiece[0] === x &&
                gameState.selectedPiece[1] === y) {
                const pieceEl = cell.querySelector('.piece');
                if (pieceEl) {
                    pieceEl.classList.add('selected');
                }
            }

            cell.addEventListener('click', () => handleCellClick(x, y));
            boardEl.appendChild(cell);
        }
    }
}

// ==================== 辅助函数 ====================
function isRiver(x, y) {
    return RIVER_CELLS.some(cell => cell[0] === x && cell[1] === y);
}

function isTrap(x, y, player) {
    return TRAPS[player].some(trap => trap[0] === x && trap[1] === y);
}

function isDen(x, y, player) {
    return DENS[player][0] === x && DENS[player][1] === y;
}

function isInBounds(x, y) {
    return x >= 0 && x < COLS && y >= 0 && y < ROWS;
}

// ==================== 移动规则 ====================
function getValidMoves(x, y) {
    const piece = gameState.board[y][x];
    if (!piece) return [];

    const moves = [];
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // 上下左右

    for (const [dx, dy] of directions) {
        let nx = x + dx;
        let ny = y + dy;

        // 狮子和老虎可以跳过河流
        if ((piece.type === 'LION' || piece.type === 'TIGER') && isRiver(nx, ny)) {
            // 检查河里是否有老鼠
            let hasRatInRiver = false;
            let jumpX = nx;
            let jumpY = ny;

            while (isRiver(jumpX, jumpY)) {
                if (gameState.board[jumpY][jumpX] && gameState.board[jumpY][jumpX].type === 'RAT') {
                    hasRatInRiver = true;
                    break;
                }
                jumpX += dx;
                jumpY += dy;
            }

            if (!hasRatInRiver && isInBounds(jumpX, jumpY)) {
                nx = jumpX;
                ny = jumpY;
            } else {
                continue;
            }
        }

        if (!isInBounds(nx, ny)) continue;

        // 老鼠可以进入河流，其他动物不行
        if (isRiver(nx, ny) && piece.type !== 'RAT') continue;

        // 不能进入自己的兽穴
        if (isDen(nx, ny, piece.player)) continue;

        const targetPiece = gameState.board[ny][nx];

        if (!targetPiece) {
            moves.push([nx, ny]);
        } else if (targetPiece.player !== piece.player) {
            // 检查是否可以吃掉对方棋子
            if (canCapture(piece, targetPiece, x, y, nx, ny)) {
                moves.push([nx, ny]);
            }
        }
    }

    return moves;
}

function canCapture(attacker, defender, ax, ay, dx, dy) {
    // 老鼠在河里不能吃岸上的象
    if (isRiver(ax, ay) && !isRiver(dx, dy)) {
        return false;
    }

    // 岸上的动物不能吃河里的老鼠
    if (!isRiver(ax, ay) && isRiver(dx, dy)) {
        return false;
    }

    // 如果防守方在陷阱里，任何动物都可以吃
    if (isTrap(dx, dy, attacker.player)) {
        return true;
    }

    // 特殊规则：老鼠可以吃象
    if (attacker.type === 'RAT' && defender.type === 'ELEPHANT') {
        return true;
    }

    // 象不能吃老鼠（除非老鼠在陷阱里）
    if (attacker.type === 'ELEPHANT' && defender.type === 'RAT') {
        return false;
    }

    // 大吃小或同级互吃
    return attacker.rank >= defender.rank;
}

// ==================== 游戏交互 ====================
function handleCellClick(x, y) {
    if (gameState.gameOver) return;
    if (gameState.currentPlayer !== 'blue') return; // 只有玩家回合才能点击（玩家是蓝方）

    const piece = gameState.board[y][x];

    // 如果点击的是可移动位置
    if (gameState.selectedPiece && gameState.validMoves.some(m => m[0] === x && m[1] === y)) {
        movePiece(gameState.selectedPiece[0], gameState.selectedPiece[1], x, y);
        return;
    }

    // 如果点击的是自己的棋子（玩家是蓝方）
    if (piece && piece.player === 'blue') {
        playSound('select');
        gameState.selectedPiece = [x, y];
        gameState.validMoves = getValidMoves(x, y);
        renderBoard();
        return;
    }

    // 取消选择
    gameState.selectedPiece = null;
    gameState.validMoves = [];
    renderBoard();
}

function movePiece(fromX, fromY, toX, toY) {
    const piece = gameState.board[fromY][fromX];
    const targetPiece = gameState.board[toY][toX];

    // 播放音效
    if (targetPiece) {
        playSound('capture');
    } else {
        playSound('move');
    }

    // 更新分数
    if (targetPiece) {
        if (piece.player === 'blue') {
            gameState.playerScore++;
            document.getElementById('player-score').textContent = gameState.playerScore;
        } else {
            gameState.aiScore++;
            document.getElementById('ai-score').textContent = gameState.aiScore;
        }
    }

    // 移动棋子
    gameState.board[toY][toX] = piece;
    gameState.board[fromY][fromX] = null;

    // 清除选择状态
    gameState.selectedPiece = null;
    gameState.validMoves = [];

    // 添加移动动画
    renderBoard();
    const movedPiece = document.querySelector(`.cell[data-x="${toX}"][data-y="${toY}"] .piece`);
    if (movedPiece) {
        if (targetPiece) {
            movedPiece.classList.add('capturing');
            setTimeout(() => movedPiece.classList.remove('capturing'), 500);
        } else {
            movedPiece.classList.add('moving');
            setTimeout(() => movedPiece.classList.remove('moving'), 400);
        }
    }

    // 检查胜利条件
    if (checkWin()) {
        return;
    }

    // 切换玩家
    switchPlayer();
}

function switchPlayer() {
    gameState.currentPlayer = gameState.currentPlayer === 'blue' ? 'red' : 'blue';
    updateTurnIndicator();

    // 如果是AI回合（红方），执行AI移动
    if (gameState.currentPlayer === 'red') {
        setTimeout(aiMove, 1000);
    }
}

function updateTurnIndicator() {
    const indicator = document.getElementById('turn-indicator');
    if (gameState.currentPlayer === 'blue') {
        indicator.textContent = `🎯 轮到 ${gameState.playerName} 走棋啦！`;
        indicator.style.background = 'linear-gradient(135deg, #4ecdc4 0%, #44a3aa 100%)';
    } else {
        indicator.textContent = '🤖 电脑正在思考...';
        indicator.style.background = 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 100%)';
    }
}

// ==================== AI系统 ====================
function aiMove() {
    if (gameState.gameOver) return;

    const moves = getAllValidMoves('red');  // AI是红方

    if (moves.length === 0) {
        // AI没有可移动的棋子，玩家获胜
        showWin('blue');
        return;
    }

    // 根据难度选择不同的AI策略
    let bestMove;
    switch (gameState.difficulty) {
        case 'amelia':
            bestMove = selectMoveEasy(moves);
            break;
        case 'yolanda':
            bestMove = selectMoveMedium(moves);
            break;
        case 'neo':
            bestMove = selectMoveHard(moves);
            break;
        default:
            bestMove = selectMoveEasy(moves);
    }

    if (bestMove) {
        movePiece(bestMove.from[0], bestMove.from[1], bestMove.to[0], bestMove.to[1]);
    }
}

function getAllValidMoves(player) {
    const moves = [];

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const piece = gameState.board[y][x];
            if (piece && piece.player === player) {
                const validMoves = getValidMoves(x, y);
                validMoves.forEach(to => {
                    moves.push({
                        from: [x, y],
                        to: to,
                        piece: piece
                    });
                });
            }
        }
    }

    return moves;
}

// ==================== 简单模式 AI (Amelia) ====================
// 策略：随机走棋，偶尔吃子，经常犯错
function selectMoveEasy(moves) {
    // 能赢就赢
    const winMove = moves.find(m => isDen(m.to[0], m.to[1], 'blue'));
    if (winMove) return winMove;

    // 30%概率随机走（故意犯错）
    if (Math.random() < 0.3) {
        return moves[Math.floor(Math.random() * moves.length)];
    }

    // 找出可以吃子的移动
    const captureMoves = moves.filter(m => {
        const target = gameState.board[m.to[1]][m.to[0]];
        return target !== null;
    });

    // 50%概率吃子（如果有的话）
    if (captureMoves.length > 0 && Math.random() < 0.5) {
        return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    // 简单评分：只考虑向前移动
    const scoredMoves = moves.map(move => {
        let score = Math.random() * 20;  // 大量随机因素

        // 向前移动加分
        if (move.to[1] > move.from[1]) {
            score += 10;
        }

        return { ...move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);

    // 从前5个中随机选
    const topMoves = scoredMoves.slice(0, Math.min(5, scoredMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)];
}

// ==================== 中等模式 AI (Yolanda) ====================
// 策略：一步预判，会吃子，会躲避危险，但不会深度思考
function selectMoveMedium(moves) {
    // 能赢就赢
    const winMove = moves.find(m => isDen(m.to[0], m.to[1], 'blue'));
    if (winMove) return winMove;

    // 为每个移动计算分数
    const scoredMoves = moves.map(move => {
        const simulatedBoard = simulateMove(gameState.board, move);
        let score = evaluateMoveScore(move, gameState.board);

        // 预判对方的最佳应对
        const opponentBestResponse = predictOpponentBestMove(simulatedBoard, 'blue');
        if (opponentBestResponse) {
            score -= opponentBestResponse.score * 0.6;  // 中等权重
        }

        // 评估局面
        score += evaluateBoardPosition(simulatedBoard, 'red') * 0.5;

        // 添加一些随机性
        score += Math.random() * 30;

        return { ...move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);

    // 20%概率选择次优移动
    if (scoredMoves.length > 1 && Math.random() < 0.2) {
        const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
        return topMoves[Math.floor(Math.random() * topMoves.length)];
    }

    return scoredMoves[0];
}

// ==================== 困难模式 AI (Neo) ====================
// 策略：3层Minimax + Alpha-Beta剪枝，完美评估，几乎不犯错
function selectMoveHard(moves) {
    // 能赢就赢
    const winMove = moves.find(m => isDen(m.to[0], m.to[1], 'blue'));
    if (winMove) return winMove;

    // 使用Minimax算法，搜索深度3
    const scoredMoves = moves.map(move => {
        const simulatedBoard = simulateMove(gameState.board, move);

        // 检查这步是否让对方直接获胜
        const opponentMoves = getValidMovesForBoard(simulatedBoard, 'blue');
        const opponentWin = opponentMoves.find(m => isDen(m.to[0], m.to[1], 'red'));
        if (opponentWin) {
            return { ...move, score: -10000 };  // 绝对避免
        }

        // Minimax搜索，深度3，AI是最大化方
        const score = minimax(simulatedBoard, 2, -Infinity, Infinity, false);

        return { ...move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);

    // 5%概率选择次优（保持一点人性）
    if (scoredMoves.length > 1 && Math.random() < 0.05) {
        const topMoves = scoredMoves.slice(0, Math.min(2, scoredMoves.length));
        return topMoves[Math.floor(Math.random() * topMoves.length)];
    }

    return scoredMoves[0];
}

// Minimax算法 + Alpha-Beta剪枝
function minimax(board, depth, alpha, beta, isMaximizing) {
    // 检查终止条件
    const terminalScore = evaluateTerminal(board);
    if (terminalScore !== null) {
        return terminalScore;
    }

    if (depth === 0) {
        return evaluateBoardAdvanced(board, 'red');
    }

    const player = isMaximizing ? 'red' : 'blue';
    const moves = getValidMovesForBoard(board, player);

    if (moves.length === 0) {
        return isMaximizing ? -5000 : 5000;  // 无子可走
    }

    // 移动排序优化：优先考虑吃子和接近兽穴的移动
    moves.sort((a, b) => {
        const aCapture = board[a.to[1]][a.to[0]] ? 1 : 0;
        const bCapture = board[b.to[1]][b.to[0]] ? 1 : 0;
        return bCapture - aCapture;
    });

    if (isMaximizing) {
        let maxEval = -Infinity;
        for (const move of moves) {
            const newBoard = simulateMove(board, move);
            const evalScore = minimax(newBoard, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, evalScore);
            alpha = Math.max(alpha, evalScore);
            if (beta <= alpha) break;  // Beta剪枝
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (const move of moves) {
            const newBoard = simulateMove(board, move);
            const evalScore = minimax(newBoard, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, evalScore);
            beta = Math.min(beta, evalScore);
            if (beta <= alpha) break;  // Alpha剪枝
        }
        return minEval;
    }
}

// 检查是否达到终止状态
function evaluateTerminal(board) {
    const redDen = DENS.red;
    const blueDen = DENS.blue;

    // 检查兽穴
    const pieceInRedDen = board[redDen[1]][redDen[0]];
    const pieceInBlueDen = board[blueDen[1]][blueDen[0]];

    if (pieceInRedDen && pieceInRedDen.player === 'blue') {
        return -10000;  // 玩家获胜，AI输
    }
    if (pieceInBlueDen && pieceInBlueDen.player === 'red') {
        return 10000;   // AI获胜
    }

    // 检查是否有一方没有棋子
    let redPieces = 0, bluePieces = 0;
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const piece = board[y][x];
            if (piece) {
                if (piece.player === 'red') redPieces++;
                else bluePieces++;
            }
        }
    }

    if (redPieces === 0) return -10000;
    if (bluePieces === 0) return 10000;

    return null;  // 游戏继续
}

// 高级局面评估（用于困难模式）
function evaluateBoardAdvanced(board, player) {
    let score = 0;
    const opponent = player === 'red' ? 'blue' : 'red';
    const myDenY = player === 'red' ? 0 : 8;
    const enemyDenY = player === 'red' ? 8 : 0;

    let myPieces = [];
    let opponentPieces = [];

    // 收集所有棋子信息
    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const piece = board[y][x];
            if (piece) {
                if (piece.player === player) {
                    myPieces.push({ piece, x, y });
                } else {
                    opponentPieces.push({ piece, x, y });
                }
            }
        }
    }

    // 1. 棋子价值（等级越高越重要）
    const pieceValues = { 8: 100, 7: 90, 6: 80, 5: 50, 4: 40, 3: 30, 2: 20, 1: 60 };  // 老鼠特殊价值

    for (const { piece, x, y } of myPieces) {
        score += pieceValues[piece.rank] || piece.rank * 10;

        // 2. 位置价值 - 越接近对方兽穴越好
        const distToEnemyDen = Math.abs(x - 3) + Math.abs(y - enemyDenY);
        score += (14 - distToEnemyDen) * 8;

        // 3. 控制中路加分
        if (x >= 2 && x <= 4) {
            score += 15;
        }

        // 4. 高级棋子在前线加分
        if (piece.rank >= 6) {
            const progress = player === 'red' ? y : (8 - y);
            score += progress * 5;
        }

        // 5. 老鼠接近对方象加分（威胁）
        if (piece.type === 'RAT') {
            for (const op of opponentPieces) {
                if (op.piece.type === 'ELEPHANT') {
                    const dist = Math.abs(x - op.x) + Math.abs(y - op.y);
                    if (dist <= 3) {
                        score += (4 - dist) * 20;
                    }
                }
            }
        }

        // 6. 狮虎在河边加分（可以跳河）
        if (piece.type === 'LION' || piece.type === 'TIGER') {
            if (y === 2 || y === 6) {
                score += 25;
            }
        }
    }

    // 对方棋子评估（减分）
    for (const { piece, x, y } of opponentPieces) {
        score -= pieceValues[piece.rank] || piece.rank * 10;

        // 对方接近我方兽穴是威胁
        const distToMyDen = Math.abs(x - 3) + Math.abs(y - myDenY);
        score -= (14 - distToMyDen) * 10;

        // 对方在陷阱附近是好事
        if (isNearTrap(x, y, player)) {
            score += 30;
        }
    }

    // 7. 棋子数量优势
    score += (myPieces.length - opponentPieces.length) * 50;

    // 8. 机动性评估（可移动步数）
    const myMobility = getValidMovesForBoard(board, player).length;
    const opMobility = getValidMovesForBoard(board, opponent).length;
    score += (myMobility - opMobility) * 3;

    // 9. 兽穴防守评估
    const denDefenders = myPieces.filter(p => {
        const dist = Math.abs(p.x - 3) + Math.abs(p.y - myDenY);
        return dist <= 2;
    });
    score += denDefenders.length * 20;

    return score;
}

// 模拟一步移动，返回新的棋盘状态（不修改原棋盘）
function simulateMove(board, move) {
    // 深拷贝棋盘
    const newBoard = board.map(row => row.map(cell => cell ? {...cell} : null));

    // 执行移动
    newBoard[move.to[1]][move.to[0]] = newBoard[move.from[1]][move.from[0]];
    newBoard[move.from[1]][move.from[0]] = null;

    return newBoard;
}

// 获取指定棋盘状态下某方的所有合法移动
function getValidMovesForBoard(board, player) {
    const moves = [];

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const piece = board[y][x];
            if (piece && piece.player === player) {
                const pieceMoves = getValidMovesForPiece(board, x, y);
                pieceMoves.forEach(to => {
                    moves.push({
                        from: [x, y],
                        to: to,
                        piece: piece
                    });
                });
            }
        }
    }

    return moves;
}

// 获取指定棋盘上某个棋子的合法移动
function getValidMovesForPiece(board, x, y) {
    const piece = board[y][x];
    if (!piece) return [];

    const moves = [];
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of directions) {
        let nx = x + dx;
        let ny = y + dy;

        // 狮子和老虎可以跳过河流
        if ((piece.type === 'LION' || piece.type === 'TIGER') && isRiver(nx, ny)) {
            let hasRatInRiver = false;
            let jumpX = nx;
            let jumpY = ny;

            while (isRiver(jumpX, jumpY)) {
                if (board[jumpY][jumpX] && board[jumpY][jumpX].type === 'RAT') {
                    hasRatInRiver = true;
                    break;
                }
                jumpX += dx;
                jumpY += dy;
            }

            if (!hasRatInRiver && isInBounds(jumpX, jumpY)) {
                nx = jumpX;
                ny = jumpY;
            } else {
                continue;
            }
        }

        if (!isInBounds(nx, ny)) continue;
        if (isRiver(nx, ny) && piece.type !== 'RAT') continue;
        if (isDen(nx, ny, piece.player)) continue;

        const targetPiece = board[ny][nx];

        if (!targetPiece) {
            moves.push([nx, ny]);
        } else if (targetPiece.player !== piece.player) {
            if (canCaptureOnBoard(board, piece, targetPiece, x, y, nx, ny)) {
                moves.push([nx, ny]);
            }
        }
    }

    return moves;
}

// 在指定棋盘上检查是否可以吃子
function canCaptureOnBoard(board, attacker, defender, ax, ay, dx, dy) {
    if (isRiver(ax, ay) && !isRiver(dx, dy)) return false;
    if (!isRiver(ax, ay) && isRiver(dx, dy)) return false;
    if (isTrap(dx, dy, attacker.player)) return true;
    if (attacker.type === 'RAT' && defender.type === 'ELEPHANT') return true;
    if (attacker.type === 'ELEPHANT' && defender.type === 'RAT') return false;
    return attacker.rank >= defender.rank;
}

// 预判对方的最佳应对
function predictOpponentBestMove(board, player) {
    const moves = getValidMovesForBoard(board, player);

    if (moves.length === 0) return null;

    // 检查对方是否能直接获胜
    const opponentDen = player === 'blue' ? 'red' : 'blue';
    const winMove = moves.find(m => isDen(m.to[0], m.to[1], opponentDen));
    if (winMove) {
        return { ...winMove, score: 1000 };  // 对方能赢，这是最坏情况
    }

    // 评估对方每个移动的得分
    const scoredMoves = moves.map(move => {
        let score = evaluateMoveScore(move, board);
        return { ...move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    return scoredMoves[0];
}

// 评估单步移动的得分
function evaluateMoveScore(move, board) {
    let score = 0;
    const target = board[move.to[1]][move.to[0]];
    const isAI = move.piece.player === 'red';
    const forwardDir = isAI ? 1 : -1;  // AI向下进攻，玩家向上进攻
    const enemyDenY = isAI ? 8 : 0;

    // 1. 吃子得分
    if (target) {
        score += 100 + target.rank * 20;
        if (target.rank >= move.piece.rank) {
            score += 40;  // 以小吃大或同级互吃加分
        }
    }

    // 2. 向前推进得分
    const forwardProgress = (move.to[1] - move.from[1]) * forwardDir;
    if (forwardProgress > 0) {
        score += forwardProgress * 12;
    }

    // 3. 接近对方兽穴得分
    const distanceToDen = Math.abs(move.to[0] - 3) + Math.abs(move.to[1] - enemyDenY);
    score += (14 - distanceToDen) * 4;

    // 4. 控制中路得分
    if (move.to[0] >= 2 && move.to[0] <= 4) {
        score += 6;
    }

    // 5. 利用陷阱
    const enemyPlayer = isAI ? 'blue' : 'red';
    if (isNearTrap(move.to[0], move.to[1], enemyPlayer)) {
        score += 18;
    }

    // 6. 狮子老虎跳河加分
    if ((move.piece.type === 'LION' || move.piece.type === 'TIGER') &&
        Math.abs(move.to[1] - move.from[1]) > 1) {
        score += 30;
    }

    // 7. 避免把棋子送到危险位置
    const dangerAfterMove = evaluateDangerOnBoard(board, move.to[0], move.to[1], move.piece.player);
    score -= dangerAfterMove * 15;

    return score;
}

// 评估指定棋盘上某位置的危险程度
function evaluateDangerOnBoard(board, x, y, player) {
    let danger = 0;
    const opponent = player === 'red' ? 'blue' : 'red';
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (!isInBounds(nx, ny)) continue;

        const nearbyPiece = board[ny][nx];
        if (nearbyPiece && nearbyPiece.player === opponent) {
            // 检查对方棋子是否能吃掉这个位置的棋子
            const myPiece = board[y][x];
            if (myPiece && canCaptureOnBoard(board, nearbyPiece, myPiece, nx, ny, x, y)) {
                danger += nearbyPiece.rank + 5;
            }
        }
    }

    return danger;
}

// 评估整体局面得分
function evaluateBoardPosition(board, player) {
    let score = 0;
    const opponent = player === 'red' ? 'blue' : 'red';
    const myDenY = player === 'red' ? 0 : 8;
    const enemyDenY = player === 'red' ? 8 : 0;

    let myPieceCount = 0;
    let opponentPieceCount = 0;
    let myTotalRank = 0;
    let opponentTotalRank = 0;

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const piece = board[y][x];
            if (!piece) continue;

            if (piece.player === player) {
                myPieceCount++;
                myTotalRank += piece.rank;

                // 我方棋子越接近对方兽穴越好
                const distToEnemyDen = Math.abs(x - 3) + Math.abs(y - enemyDenY);
                score += (14 - distToEnemyDen) * 2;

                // 高级棋子存活加分
                if (piece.rank >= 6) {
                    score += piece.rank * 3;
                }
            } else {
                opponentPieceCount++;
                opponentTotalRank += piece.rank;

                // 对方棋子越接近我方兽穴越危险
                const distToMyDen = Math.abs(x - 3) + Math.abs(y - myDenY);
                score -= (14 - distToMyDen) * 3;
            }
        }
    }

    // 棋子数量优势
    score += (myPieceCount - opponentPieceCount) * 30;

    // 棋子等级总和优势
    score += (myTotalRank - opponentTotalRank) * 5;

    return score;
}

// 评估某个位置的危险程度
function evaluateDanger(x, y, player) {
    let danger = 0;
    const opponent = player === 'red' ? 'blue' : 'red';

    // 检查周围是否有敌方棋子可以吃掉这个位置
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        if (!isInBounds(nx, ny)) continue;

        const nearbyPiece = gameState.board[ny][nx];
        if (nearbyPiece && nearbyPiece.player === opponent) {
            danger += nearbyPiece.rank;
        }
    }

    return danger;
}

// 检查是否靠近对方陷阱
function isNearTrap(x, y, opponent) {
    const traps = TRAPS[opponent];
    for (const trap of traps) {
        const distance = Math.abs(x - trap[0]) + Math.abs(y - trap[1]);
        if (distance <= 1) return true;
    }
    return false;
}

// ==================== 胜利检测 ====================
function checkWin() {
    // 检查是否有棋子进入对方兽穴
    const redDen = DENS.red;
    const blueDen = DENS.blue;

    const pieceInRedDen = gameState.board[redDen[1]][redDen[0]];
    const pieceInBlueDen = gameState.board[blueDen[1]][blueDen[0]];

    // 蓝方（玩家）进入红方兽穴 = 玩家获胜
    if (pieceInRedDen && pieceInRedDen.player === 'blue') {
        showWin('blue');
        return true;
    }

    // 红方（AI）进入蓝方兽穴 = AI获胜
    if (pieceInBlueDen && pieceInBlueDen.player === 'red') {
        showWin('red');
        return true;
    }

    // 检查是否有一方没有棋子了
    let redPieces = 0;
    let bluePieces = 0;

    for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
            const piece = gameState.board[y][x];
            if (piece) {
                if (piece.player === 'red') redPieces++;
                else bluePieces++;
            }
        }
    }

    if (redPieces === 0) {
        showWin('blue');  // AI没棋子了，玩家获胜
        return true;
    }

    if (bluePieces === 0) {
        showWin('red');  // 玩家没棋子了，AI获胜
        return true;
    }

    return false;
}

function showWin(winner) {
    gameState.gameOver = true;

    const modal = document.getElementById('win-modal');
    const message = document.getElementById('win-message');

    if (winner === 'blue') {  // 玩家获胜
        message.textContent = `🎉 太棒了！${gameState.playerName} 赢了！🎉`;
        playSound('win');
        createFireworks();
    } else {  // AI获胜
        message.textContent = `😊 电脑赢了，${gameState.playerName} 再试一次吧！`;
        playSound('lose');
    }

    modal.classList.add('show');
}

function createFireworks() {
    const container = document.getElementById('fireworks');
    container.innerHTML = '';

    const colors = ['#ff6b6b', '#ffd93d', '#4ecdc4', '#667eea', '#ff9a9e'];

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            container.appendChild(firework);

            setTimeout(() => firework.remove(), 1000);
        }, i * 100);
    }
}

// ==================== 提示系统 ====================
function showHint() {
    if (gameState.gameOver || gameState.currentPlayer !== 'blue') return;

    playSound('hint');

    const moves = getAllValidMoves('blue');  // 玩家是蓝方
    if (moves.length === 0) return;

    // 找到最佳移动提示
    let bestMove = null;

    // 优先提示可以吃子的移动
    const captureMoves = moves.filter(m => {
        const target = gameState.board[m.to[1]][m.to[0]];
        return target !== null;
    });

    if (captureMoves.length > 0) {
        bestMove = captureMoves[0];
    } else {
        // 优先提示向前移动（玩家从下往上进攻）
        const forwardMoves = moves.filter(m => m.to[1] < m.from[1]);
        bestMove = forwardMoves.length > 0 ? forwardMoves[0] : moves[0];
    }

    if (bestMove) {
        // 高亮提示的棋子
        const pieceEl = document.querySelector(
            `.cell[data-x="${bestMove.from[0]}"][data-y="${bestMove.from[1]}"] .piece`
        );
        if (pieceEl) {
            pieceEl.classList.add('hint-piece');
            setTimeout(() => pieceEl.classList.remove('hint-piece'), 2000);
        }

        // 自动选中这个棋子
        gameState.selectedPiece = bestMove.from;
        gameState.validMoves = getValidMoves(bestMove.from[0], bestMove.from[1]);
        renderBoard();
    }
}

// ==================== 游戏控制 ====================
function startGame() {
    // 隐藏胜利弹窗
    document.getElementById('win-modal').classList.remove('show');

    // 重置游戏状态 - 玩家是蓝方（下方），先手
    gameState.currentPlayer = 'blue';
    gameState.selectedPiece = null;
    gameState.validMoves = [];
    gameState.playerScore = 0;
    gameState.aiScore = 0;
    gameState.gameOver = false;

    // 更新分数显示
    document.getElementById('player-score').textContent = '0';
    document.getElementById('ai-score').textContent = '0';

    // 初始化棋盘
    initBoard();
    renderBoard();
    updateTurnIndicator();

    playSound('select');
}

// ==================== 初始化 ====================
document.addEventListener('DOMContentLoaded', () => {
    startGame();
});
