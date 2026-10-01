// app.js - 简单的弹幕前端逻辑
(() => {
  const video = document.getElementById('video');
  const layer = document.getElementById('danmakuLayer');
  const input = document.getElementById('danmakuInput');
  const sendBtn = document.getElementById('sendBtn');
  const colorInput = document.getElementById('colorInput');
  const sizeSelect = document.getElementById('sizeSelect');
  const speedRange = document.getElementById('speedRange');
  const opacityRange = document.getElementById('opacityRange');
  const toggleBtn = document.getElementById('toggleDm');
  const clearBtn = document.getElementById('clearBtn');

  let showDanmaku = true;
  let scheduled = [];
  let runningAnimations = new Set();

  function rand(min, max){return Math.random()*(max-min)+min}

  function createDanmaku(text, opts = {}){
    if(!showDanmaku) return;
    const el = document.createElement('div');
    el.className = 'danmaku-item';
    el.textContent = text;
    const fontSize = (opts.size || 22) + 'px';
    el.style.fontSize = fontSize;
    el.style.color = opts.color || '#fff';
    el.style.opacity = (opts.opacity==null?0.9:opts.opacity);
    el.style.pointerEvents = 'auto';

    // append invisible first to measure width
    el.style.transform = 'translateX(0px)';
    layer.appendChild(el);
    const layerRect = layer.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const startX = layerRect.width;
    const endX = -elRect.width;
    // random vertical position
    const maxTop = Math.max(0, layerRect.height - elRect.height);
    const top = rand(0, maxTop);
    el.style.top = top + 'px';
    el.style.left = startX + 'px';

    // duration controlled by speed (higher speed => shorter duration)
    const baseDuration = 8000; // ms for medium size
    const speedFactor = opts.speed || 1.4; // 1 is normal
    const duration = Math.max(2000, baseDuration / speedFactor);

    const anim = el.animate([
      { transform: `translateX(0px)` },
      { transform: `translateX(${endX - startX}px)` }
    ], {
      duration,
      easing: 'linear'
    });
    runningAnimations.add(anim);
    anim.onfinish = () => {
      runningAnimations.delete(anim);
      el.remove();
    };

    // pause/resume with video
    if(video.paused) anim.pause();

    return anim;
  }

  function sendCurrent(){
    const text = input.value.trim();
    if(!text) return;
    createDanmaku(text, {
      color: colorInput.value,
      size: Number(sizeSelect.value),
      speed: Number(speedRange.value),
      opacity: Number(opacityRange.value)
    });
    input.value = '';
  }

  sendBtn.addEventListener('click', sendCurrent);
  input.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ sendCurrent(); }});

  toggleBtn.addEventListener('click', ()=>{
    showDanmaku = !showDanmaku;
    toggleBtn.textContent = showDanmaku? '隐藏弹幕' : '显示弹幕';
    if(!showDanmaku){
      // pause and clear running
      runningAnimations.forEach(a=>a.cancel());
      runningAnimations.clear();
      document.querySelectorAll('.danmaku-item').forEach(n=>n.remove());
    }
  });

  clearBtn.addEventListener('click', ()=>{
    runningAnimations.forEach(a=>a.cancel());
    runningAnimations.clear();
    document.querySelectorAll('.danmaku-item').forEach(n=>n.remove());
  });

  // pause/resume animations with video
  video.addEventListener('pause', ()=>{
    runningAnimations.forEach(a => a.pause && a.pause());
  });
  video.addEventListener('play', ()=>{
    runningAnimations.forEach(a => a.play && a.play());
  });

  // 示例弹幕（绑定到视频时间点）
  scheduled = [
    {t:0.6, text: '欢迎来到流星弹幕！'},
    {t:1.6, text: '这是一个演示页面'},
    {t:2.5, text: '你可以更改颜色、大小、速度...'},
    {t:3.5, text: '按回车发送弹幕'},
    {t:4.2, text: 'Enjoy 😎', color:'#ffdd57'},
    {t:5.5, text: '如果你在手机上看，请横屏观看' }
  ];
  let shownIdx = new Set();

  function checkScheduled(){
    if(!video || video.paused) return;
    const t = video.currentTime;
    scheduled.forEach((s, idx)=>{
      if(!shownIdx.has(idx) && t >= s.t){
        createDanmaku(s.text, {color: s.color || '#fff', size: s.size || 22, speed: 1.2, opacity: 0.95});
        shownIdx.add(idx);
      }
      // reset when video restarts
    });
  }

  setInterval(()=>{
    if(video.currentTime < 0.3) shownIdx.clear();
    checkScheduled();
  }, 300);

  // keyboard shortcuts
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'd'){ toggleBtn.click(); }
  });

  // small accessibility: focus input on load
  input.focus();

  // expose for debugging
  window._MeteorDanmaku = {createDanmaku};
})();
