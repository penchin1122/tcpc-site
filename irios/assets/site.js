// スマホ用メニューの開閉
(function(){
  var btn=document.querySelector('.menu-btn'),drawer=document.getElementById('drawer');
  if(!btn||!drawer)return;
  function set(open){btn.setAttribute('aria-expanded',String(open));drawer.hidden=!open;btn.querySelector('span').textContent=open?'閉じる':'メニュー';}
  btn.addEventListener('click',function(){set(drawer.hidden);});
  drawer.addEventListener('click',function(e){if(e.target.closest('a'))set(false);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!drawer.hidden){set(false);btn.focus();}});
})();
