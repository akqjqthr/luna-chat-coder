const COLS=10,ROWS=20,ctx=document.querySelector('#board').getContext('2d'),nextCtx=document.querySelector('#next').getContext('2d');
const COLORS=['#000','#67e8f9','#a78bfa','#fbbf24','#60a5fa','#34d399','#f472b6','#fb7185'];
const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]]];
let board,piece,nextPiece,score=0,lines=0,level=1,dropTimer=0,last=0,running=false,paused=false;
const $=id=>document.getElementById(id);
function resetBoard(){board=Array.from({length:ROWS},()=>Array(COLS).fill(0))}
function randomPiece(){const type=Math.floor(Math.random()*SHAPES.length);return {shape:SHAPES[type].map(r=>[...r]),x:Math.floor(COLS/2)-2,y:0,color:type+1}}
function spawn(){piece=nextPiece||randomPiece();nextPiece=randomPiece();piece.x=Math.floor(COLS/2)-Math.ceil(piece.shape[0].length/2);piece.y=0;drawNext();if(collides(piece,0,0))gameOver()}
function collides(p,dx,dy,shape=p.shape){for(let y=0;y<shape.length;y++)for(let x=0;x<shape[y].length;x++)if(shape[y][x]){const nx=p.x+x+dx,ny=p.y+y+dy;if(nx<0||nx>=COLS||ny>=ROWS||(ny>=0&&board[ny][nx]))return true}return false}
function merge(){piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v&&piece.y+y>=0)board[piece.y+y][piece.x+x]=piece.color}))}
function clearLines(){let n=0;board=board.filter(r=>{if(r.every(Boolean)){n++;return false}return true});while(board.length<ROWS)board.unshift(Array(COLS).fill(0));if(n){lines+=n;score+=([0,100,300,500,800][n]||1000)*level;level=1+Math.floor(lines/10);updateStats()}}
function rotate(s){return s[0].map((_,i)=>s.map(r=>r[i]).reverse())}
function move(dx){if(!paused&&!collides(piece,dx,0))piece.x+=dx}
function rotatePiece(){if(paused)return;const old=piece.shape;const r=rotate(old);for(const kick of [0,-1,1,-2,2])if(!collides(piece,kick,0,r)){piece.shape=r;piece.x+=kick;return}}
function drop(){if(paused)return;if(!collides(piece,0,1))piece.y++;else{merge();clearLines();spawn()}}
function hardDrop(){if(paused)return;let d=0;while(!collides(piece,0,1)){piece.y++;d++}score+=d*2;merge();clearLines();spawn();updateStats()}
function drawCell(c,x,y,size=30){c.fillStyle=COLORS[board[y]?.[x]||0];c.fillRect(x*size,y*size,size-1,size-1);if((board[y]?.[x]||0)){c.fillStyle='rgba(255,255,255,.2)';c.fillRect(x*size+3,y*size+3,size-8,3)}}
function draw(){ctx.clearRect(0,0,300,600);ctx.fillStyle='#080b19';ctx.fillRect(0,0,300,600);for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(board[y][x])drawCell(ctx,x,y);piece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v&&piece.y+y>=0){ctx.fillStyle=COLORS[piece.color];ctx.fillRect((piece.x+x)*30,(piece.y+y)*30,29,29);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect((piece.x+x)*30+3,(piece.y+y)*30+3,21,3)}}));}
function drawNext(){nextCtx.clearRect(0,0,120,120);if(!nextPiece)return;const s=24,w=nextPiece.shape[0].length*24,h=nextPiece.shape.length*24,ox=(120-w)/2,oy=(120-h)/2;nextPiece.shape.forEach((r,y)=>r.forEach((v,x)=>{if(v){nextCtx.fillStyle=COLORS[nextPiece.color];nextCtx.fillRect(ox+x*s,oy+y*s,s-1,s-1)}}))}
function updateStats(){$('score').textContent=score.toLocaleString();$('lines').textContent=lines;$('level').textContent=level}
function gameOver(){running=false;paused=false;$('overlayTitle').textContent='GAME OVER';$('overlayText').textContent=`최종 점수 ${score.toLocaleString()}`;$('startBtn').textContent='다시 시작';$('overlay').classList.remove('hidden');$('pauseBtn').textContent='일시정지'}
function start(){resetBoard();score=lines=0;level=1;paused=false;running=true;nextPiece=randomPiece();spawn();updateStats();$('overlay').classList.add('hidden');$('pauseBtn').textContent='일시정지';last=performance.now();requestAnimationFrame(loop)}
function togglePause(){if(!running)return;paused=!paused;$('pauseBtn').textContent=paused?'계속하기':'일시정지';$('overlayTitle').textContent='PAUSED';$('overlayText').textContent='P를 누르거나 버튼을 눌러 계속하세요';$('startBtn').textContent='계속하기';$('overlay').classList.toggle('hidden',!paused);if(!paused){last=performance.now();requestAnimationFrame(loop)}}
function loop(t){if(!running)return;const dt=t-last;last=t;if(!paused){dropTimer+=dt;const speed=Math.max(80,800-(level-1)*65);if(dropTimer>speed){drop();dropTimer=0}draw()}requestAnimationFrame(loop)}
$('startBtn').onclick=()=>paused?togglePause():start();$('pauseBtn').onclick=togglePause;
addEventListener('keydown',e=>{if(e.code==='KeyP'){togglePause();return}if(!running||paused)return;if(['ArrowLeft','ArrowRight','ArrowDown','ArrowUp','Space'].includes(e.code))e.preventDefault();if(e.code==='ArrowLeft')move(-1);if(e.code==='ArrowRight')move(1);if(e.code==='ArrowDown')drop();if(e.code==='ArrowUp')rotatePiece();if(e.code==='Space')hardDrop();draw()});
resetBoard();piece=randomPiece();nextPiece=randomPiece();draw();drawNext();
