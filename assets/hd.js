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

// ---------- motion ----------
// 画面に入った要素に .in を付けて CSS のアニメーションを起動する。
// 動きを減らす設定（prefers-reduced-motion）の環境では、すべて最初から表示する。
(function (cfg) {
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.__motion = true;
  root.classList.add('js');
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  var targets = [];
  function add(el, cls) { if (!el.classList.contains(cls)) { el.classList.add(cls); targets.push(el); } }

  // 子要素を順番に（少しずつ遅らせて）出す
  (cfg.stagger || []).forEach(function (sel) {
    $$(sel).forEach(function (box) {
      box.classList.remove('reveal');
      Array.prototype.forEach.call(box.children, function (el, i) {
        if (el.matches('script,style,.quarters')) return;
        el.classList.remove('reveal');
        el.style.setProperty('--i', i % 12);
        add(el, 'rv');
      });
    });
  });
  // 写真：上から幕が開くように
  (cfg.images || []).forEach(function (sel) { $$(sel).forEach(function (el) { el.classList.remove('reveal', 'rv'); add(el, 'rv-img'); }); });
  // 見出し：行ごとに下からせり上がる
  (cfg.lines || []).forEach(function (sel) {
    $$(sel).forEach(function (el) {
      var lines = $$('.line', el);
      if (lines.length) {
        lines.forEach(function (l, i) { l.innerHTML = '<span>' + l.innerHTML + '</span>'; l.classList.add('ln'); l.style.setProperty('--i', i); });
      } else {
        el.innerHTML = el.innerHTML.split(/<br\s*\/?>/i).map(function (p, i) {
          return '<span class="ln" style="--i:' + i + '"><span>' + p.trim() + '</span></span>';
        }).join('');
      }
      el.classList.remove('reveal', 'rv');
      add(el, 'rv-lines');
    });
  });
  // リボンなどの装飾：左から描かれる
  (cfg.draw || []).forEach(function (sel) { $$(sel).forEach(function (el) { add(el, 'rv-draw'); }); });
  // そのほか単体で出すもの
  (cfg.single || []).concat(['.reveal']).forEach(function (sel) {
    $$(sel).forEach(function (el) {
      if (el.classList.contains('rv-img') || el.classList.contains('rv-lines') || el.closest('.rv,.rv-lines')) return;
      add(el, 'rv');
    });
  });

  // 数字のカウントアップ
  var counters = (cfg.count || []).reduce(function (a, sel) { return a.concat($$(sel)); }, []);
  function countUp(el) {
    var tn = el.firstChild; if (!tn || tn.nodeType !== 3) return;
    var raw = tn.nodeValue.trim(), target = parseInt(raw.replace(/,/g, ''), 10);
    if (isNaN(target)) return;
    var start = target > 1900 && target < 2100 ? target - 30 : 0, t0 = null, dur = 1800;
    var fmt = function (n) { return raw.indexOf(',') >= 0 ? n.toLocaleString('en-US') : String(n); };
    tn.nodeValue = fmt(start);
    requestAnimationFrame(function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      tn.nodeValue = fmt(Math.round(start + (target - start) * e));
      if (p < 1) requestAnimationFrame(step);
    });
  }

  // メニュー内の項目にも順番を振る
  (cfg.menuItems ? $$(cfg.menuItems) : []).forEach(function (el, i) { el.style.setProperty('--i', i); });

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  // clip-path で隠した写真・リボンは交差判定が0になるため、親要素を見張って代わりに .in を付ける
  var watch = new Map();
  targets.forEach(function (el) {
    var w = el.classList.contains('rv-img') || el.classList.contains('rv-draw') ? el.parentElement : el;
    if (!watch.has(w)) watch.set(w, []);
    watch.get(w).push(el);
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      (watch.get(en.target) || []).forEach(function (el) { el.classList.add('in'); });
      io.unobserve(en.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
  watch.forEach(function (_, w) { io.observe(w); });
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
  }, { threshold: 0.6 });
  counters.forEach(function (el) { cio.observe(el); });

  // スクロール量のバー・パララックス・ヘッダーの影
  var bar = document.createElement('div');
  bar.className = 'scroll-progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var para = (cfg.parallax || []).reduce(function (a, p) {
    return a.concat($$(p[0]).map(function (el) { return [el, p[1]]; }));
  }, []);
  var header = cfg.header ? document.querySelector(cfg.header) : null, ticking = false;
  function frame() {
    ticking = false;
    var h = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, scrollY / h) : 0) + ')';
    para.forEach(function (p) {
      var r = p[0].parentElement.getBoundingClientRect();
      if (r.bottom < -200 || r.top > innerHeight + 200) return;
      p[0].style.translate = '0 ' + ((r.top + r.height / 2 - innerHeight / 2) * -p[1]).toFixed(1) + 'px';
    });
    if (header) header.classList.toggle('is-scrolled', scrollY > 8);
  }
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  addEventListener('resize', frame);
  frame();
})({
  "stagger": [
    ".biz",
    ".hd-grid",
    ".news-list",
    ".svc-grid",
    ".quote-grid",
    ".loc-grid",
    ".prop-list",
    ".outcomes",
    ".news-archive",
    ".foot-grid",
    ".dots",
    ".mission-body",
    ".side"
  ],
  "images": [
    ".photo",
    ".hd-img"
  ],
  "lines": [
    ".hero h1",
    ".mission h2",
    ".sub-hero h1"
  ],
  "draw": [
    ".deco",
    ".ribbons"
  ],
  "single": [
    ".label",
    ".label-s",
    ".heading",
    ".sec-lead",
    ".mission cite",
    ".wwd-head p",
    ".concept-lead",
    ".concept h3",
    ".concept-def",
    ".panel-foot",
    ".sub-hero .crumbs",
    ".sub-hero .en-title",
    ".sub-hero .sub-lead",
    ".hero-sub",
    ".hero-lead",
    ".table",
    ".year",
    ".form",
    ".price",
    ".marquee"
  ],
  "parallax": [
    [
      ".has-deco > .deco",
      0.12
    ],
    [
      ".hero > .deco",
      0.06
    ],
    [
      ".sub-hero > .deco",
      0.1
    ],
    [
      ".foot > .deco",
      0.08
    ]
  ],
  "count": [
    ".price b"
  ],
  "menuItems": ".menu-group h3, .menu-group li"
});
