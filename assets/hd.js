// メニューの開閉と、スクロール後に出る Menu ボタン・ページ先頭ボタン
(function(){
  var root=document.documentElement,panel=document.getElementById('menu-panel'),opener=null;
  var btns=document.querySelectorAll('.js-menu');
  function setMenu(open,from){
    panel.hidden=!open;
    btns.forEach(function(b){b.setAttribute('aria-expanded',String(open));});
    if(open){opener=from||btns[0];document.getElementById('menu-close').focus();}
    else if(opener){opener.focus();opener=null;}
  }
  btns.forEach(function(b){b.addEventListener('click',function(){setMenu(panel.hidden,b);});});
  document.getElementById('menu-close').addEventListener('click',function(){setMenu(false);});
  panel.addEventListener('click',function(e){if(e.target.closest('a')){panel.hidden=true;btns.forEach(function(b){b.setAttribute('aria-expanded','false');});opener=null;}});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!panel.hidden)setMenu(false);});
  // floating Menu pill + page-top button once the header leaves the viewport
  new IntersectionObserver(function(es){root.classList.toggle('scrolled',!es[0].isIntersecting);}).observe(document.querySelector('.site-header'));
})();
