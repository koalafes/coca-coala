const koala = document.getElementById('koala');
const game = document.getElementById('game');
const scoreBoard = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const submitScoreBtn = document.getElementById('submitScoreButton');
const lifeDisplay = document.getElementById('life');
const hitEffect = document.getElementById('hitEffect');
const missEffect = document.getElementById('missEffect');
const noDamageEffect = document.getElementById('noDamageEffect');
const leftBtn = document.getElementById('left-btn');
const rightBtn = document.getElementById('right-btn');

let score = 0;
let life = 3;
let gameActive = false;
let dropIntervalId = null;
let fallSpeed = 4;
let gameTime = 0;
const cocaCoalaApiEndpoint = 'https://p1cdyhk1vf.execute-api.ap-northeast-1.amazonaws.com';

function moveKoala(direction, speed = 10) {
  const koalaWidth = koala.offsetWidth;
  const gameWidth = game.clientWidth;
  const left = parseInt(window.getComputedStyle(koala).left);
  if (direction === 'left') koala.style.left = Math.max(0, left - speed) + 'px';
  if (direction === 'right') koala.style.left = Math.min(gameWidth - koalaWidth, left + speed) + 'px';
}

function showHitEffect(type = 'coke') {
  const koalaRect = koala.getBoundingClientRect();
  const gameRect = game.getBoundingClientRect();
  const centerX = koalaRect.left + koalaRect.width / 2 - gameRect.left;
  const topY = koalaRect.top - gameRect.top - 30;

  if (type === 'earth') {
    hitEffect.textContent = '🩵BeautiFul🩵';
    hitEffect.className = 'hit-earth';
  } else if (type === 'coke') {
    hitEffect.textContent = '✨Lucky Hit!✨';
    hitEffect.className = 'hit-coke';
  } else {
    hitEffect.textContent = '❤️1UP❤️';
    hitEffect.className = 'hit-1up';
  }

  hitEffect.style.left = `${centerX}px`;
  hitEffect.style.top = `${topY}px`;
  hitEffect.style.transform = 'translateX(-50%) scale(1.3)';
  hitEffect.style.opacity = 1;
  setTimeout(() => {
    hitEffect.style.opacity = 0;
    hitEffect.style.transform = 'translateX(-50%) scale(1)';
  }, 800);
}

function showMissEffect(x, y) {
  missEffect.textContent = '💥Miss!';
  missEffect.style.left = `${x}px`;
  missEffect.style.top = `${y}px`;
  missEffect.style.opacity = 1;
  missEffect.style.transform = 'translate(-50%, -50%) scale(1.5)';
  setTimeout(() => {
    missEffect.style.opacity = 0;
    missEffect.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 500);
}

function showNoDamageEffect(x, y) {
  noDamageEffect.textContent = '🌿NO DAMAGE';
  noDamageEffect.style.left = `${x}px`;
  noDamageEffect.style.top = `${y}px`;
  noDamageEffect.style.opacity = 1;
  noDamageEffect.style.transform = 'translate(-50%, -50%) scale(1.5)';
  setTimeout(() => {
    noDamageEffect.style.opacity = 0;
    noDamageEffect.style.transform = 'translate(-50%, -50%) scale(1)';
  }, 500);
}

function updateLifeDisplay() {
  lifeDisplay.textContent = '❤️'.repeat(life);
}

function createFallingObject(objType) {
  const obj = document.createElement('div');
  obj.classList.add('falling');
  obj.textContent = objType === 'heart' ? '🌿' : objType === 'earth' ? '🌍' : '🥤';
  obj.dataset.type = objType;
  obj.style.left = Math.floor(Math.random() * (game.clientWidth - 40)) + 'px';
  game.appendChild(obj);

  let top = 0;
  const fall = setInterval(() => {
    top += fallSpeed;
    obj.style.top = top + 'px';

    const objLeft = parseInt(obj.style.left);
    const koalaLeft = parseInt(koala.style.left);
    const dx = Math.abs(objLeft - koalaLeft);
    const dy = Math.abs(top - (game.clientHeight - 60));

    if (dx < 40 && dy < 40) {
      if (obj.dataset.type === 'heart') {
        if (life < 5) {
          life++;
          updateLifeDisplay();
        }
        showHitEffect(obj.dataset.type);
      } else {
        score += (obj.dataset.type === 'earth' ? 3 : 1);
        scoreBoard.textContent = 'スコア: ' + score;
        showHitEffect(obj.dataset.type);
      }
      clearInterval(fall);
      game.removeChild(obj);
    }

    if (top > game.clientHeight) {
      clearInterval(fall);
      game.removeChild(obj);
      if (obj.dataset.type === 'earth' || obj.dataset.type === 'coke') {
        life--;
        updateLifeDisplay();
        const objX = parseInt(obj.style.left);
        showMissEffect(objX, game.clientHeight - 30);
        if (life <= 0) {
          endGame();
        }
      } else if (obj.dataset.type === 'heart') {
        const objX = parseInt(obj.style.left);
        showNoDamageEffect(objX, game.clientHeight - 30);
      }
    }
  }, 20);
}

function dropObject() {
  if (!gameActive) return;
  createFallingObject('coke');
}

function dropRandomSpecialObject() {
  if (!gameActive) return;
  const specialType = Math.random() < 0.5 ? 'earth' : 'heart';
  createFallingObject(specialType);
  const nextSpecialDelay = Math.random() * 5000 + 3000;
  setTimeout(dropRandomSpecialObject, nextSpecialDelay);
}

function startGame() {
  score = 0;
  life = 3;
  fallSpeed = 4;
  gameTime = 0;
  gameActive = true;
  scoreBoard.textContent = 'スコア: 0';
  updateLifeDisplay();
  submitScoreBtn.style.display = 'none';
  document.getElementById('gameOverContainer').style.display = 'none';
  startBtn.disabled = true;
  startBtn.textContent = 'プレイ中...';

  dropIntervalId = setInterval(dropObject, 1000);
  dropRandomSpecialObject();

  setInterval(() => {
    if (gameActive) {
      gameTime++;
      if (gameTime % 10 === 0) {
        fallSpeed = Math.min(fallSpeed + 1, 15);
      }
    }
  }, 1000);
}

function endGame() {
  gameActive = false;
  clearInterval(dropIntervalId);
  startBtn.textContent = 'スタート！';
  startBtn.disabled = false;
  document.getElementById('gameOverContainer').style.display = 'block';
  submitScore();
  updateShareButtons(score);
}

function submitScore() {
    submitScoreBtn.style.display = 'block';  // ボタン表示
    submitScoreBtn.textContent = `スコアを記録`; // ボタンにスコア表示
  
    submitScoreBtn.onclick = async () => {
      const userName = prompt('✏️名前を教えて✏️');
      if (userName && userName.trim() !== "") {
        try {
          const response = await fetch(cocaCoalaApiEndpoint + '/score', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userName: userName.trim(), score: score })
          });
  
          if (response.ok) {
            alert('スコアを送信しました！');
            submitScoreBtn.style.display = 'none'; // 送信後ボタン非表示
            loadTopRanking();
          } else {
            alert('スコア送信に失敗しました');
          }
        } catch (err) {
          console.error(err);
          alert('送信に失敗しました');
        }
      } else {
        alert('送信をスキップしました');
      }
    }
}


let moveDirection = null;
let holdStartTime = null;
let isPressing = false

document.addEventListener('pointerdown', (e) => {
    isPressing = true;
    handlePointerMove(e); // 押した瞬間も一回判定
  });
  
  document.addEventListener('pointermove', (e) => {
    if (isPressing) {
      handlePointerMove(e);
    }
  });
  
  document.addEventListener('pointerup', () => {
    isPressing = false;
    moveDirection = null;
    holdStartTime = null;
  });
  

  function handlePointerMove(e) {
    const x = e.clientX;
    const y = e.clientY;
    
    const leftRect = leftBtn.getBoundingClientRect();
    const rightRect = rightBtn.getBoundingClientRect();
  
    if (x >= leftRect.left && x <= leftRect.right &&
        y >= leftRect.top && y <= leftRect.bottom) {
      if (moveDirection !== 'left') {
        moveDirection = 'left';
        holdStartTime = Date.now();
      }
    } else if (x >= rightRect.left && x <= rightRect.right &&
               y >= rightRect.top && y <= rightRect.bottom) {
      if (moveDirection !== 'right') {
        moveDirection = 'right';
        holdStartTime = Date.now();
      }
    } else {
      moveDirection = null;
    }
  }

function stepMove() {
    if (!moveDirection || !holdStartTime) return;
    const now = Date.now();
    const elapsed = now - holdStartTime;
    const baseSpeed = 2;
    const speed = Math.min(baseSpeed * elapsed / 200, 20); // 指数関数で加速
    moveKoala(moveDirection, speed);
}
setInterval(stepMove, 1);

startBtn.addEventListener('click', () => {
    if (!gameActive) {
      startGame();
    }
  });
  
  window.onload = () => {
    loadTopRanking();
  };

  async function loadTopRanking() {
    try {
      const response = await fetch(cocaCoalaApiEndpoint + '/score/ranking?start=0&limit=3');
      const rankingData = await response.json();
  
      const rankingList = document.getElementById('rankingList');
      rankingList.innerHTML = ''; // いったんクリア
  
      rankingData.forEach((player, index) => {
        const div = document.createElement('div');
        div.style.margin = '8px';
        div.style.fontSize = '4vw';
        div.innerHTML = ['🥇', '🥈', '🥉'][index] + ` ${player.userName} (${player.score}点)`;
        rankingList.appendChild(div);
      });
    } catch (error) {
      console.error('ランキング取得失敗:', error);
    }
  }
  
  function updateShareButtons(score) {
    const shareText = `＼ｺｶｺｰﾗｧ／🥤＼ｺｱﾗｧ／🐨＼ｽｺｱｧ／${score}点取ったよ！ #CocaCoala`;
    const shareUrl = encodeURIComponent('https:/coca-coala.click');
  
    // X
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`;
    document.getElementById('xShareButton').href = tweetUrl;
  
    // LINE
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${shareUrl}`;
    document.getElementById('lineShareButton').href = lineUrl;
  }
  