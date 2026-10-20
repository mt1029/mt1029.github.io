$(function () {
  'use strict';

  var $root = $('html');
  var $win = $(window);
  var $top = $('#btn-top');

  $('#btn-theme').on('click', function () {
    var next = $root.attr('data-theme') === 'dark' ? 'light' : 'dark';
    $root.attr('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });

  var mq = matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', function (e) {
    try { localStorage.removeItem('theme'); } catch (err) {}
    $root.attr('data-theme', e.matches ? 'dark' : 'light');
  });

  $(document).on('pointerdown', '.ripple', function (e) {
    var rect = this.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height) * 2;
    $('<span class="ripple-dot"></span>').css({
      width: size,
      height: size,
      left: e.clientX - rect.left - size / 2,
      top: e.clientY - rect.top - size / 2
    }).appendTo(this).on('animationend', function () { $(this).remove(); });
  });

  var $cards = $('.card').addClass('reveal');
  var winH = $win.height();
  var ticking = false;

  function onFrame() {
    ticking = false;
    var y = $win.scrollTop();
    $top.toggleClass('show', y > 300);
    if ($cards.length) {
      var limit = y + winH - 40;
      $cards = $cards.filter(function () {
        if ($(this).offset().top >= limit) return true;
        $(this).addClass('in');
        return false;
      });
    }
  }
  function schedule() { if (!ticking) { ticking = true; requestAnimationFrame(onFrame); }}
  $win.on('scroll', schedule).on('resize', function () { winH = $win.height(); schedule(); });
  onFrame();

  $top.on('click', function () { $('html, body').stop(true).animate({ scrollTop: 0 }, 400)});
  $win.on('wheel touchstart keydown', function () { $('html, body').stop(true); });

  var $box = $('<div class="lightbox" role="dialog" aria-modal="true" aria-label="圖片預覽" tabindex="-1" hidden>' + '<div class="lightbox-scrim"></div><img class="lightbox-img" alt="">' + '</div>').appendTo('body');
  var boxImg = $box.find('.lightbox-img')[0];
  var scrim = $box.find('.lightbox-scrim')[0];
  var $thumb = null;
  var isOpen = false;
  var anims = [];
  var reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2, .9, .3, 1)';
  var NO_SHADOW = '0 0 0 rgba(0,0,0,0), 0 0 0 rgba(0,0,0,0)';

  function cancelAnims() {
    for (var i = 0; i < anims.length; i++) anims[i].cancel();
    anims = [];
  }

  function thumbTransform() {
    var t = $thumb[0].getBoundingClientRect();
    var b = boxImg.getBoundingClientRect();
    return 'translate(' + (t.left - b.left) + 'px,' + (t.top - b.top) + 'px) scale(' + (t.width / b.width) + ')';
  }

  function animateTo(open, live) {
    var curT = live ? getComputedStyle(boxImg).transform : null;
    var curO = live ? getComputedStyle(scrim).opacity : 0;
    var curS = live ? getComputedStyle(boxImg).boxShadow : NO_SHADOW;
    cancelAnims();
    var fullS = getComputedStyle(boxImg).boxShadow;

    var thumbT = thumbTransform();
    var opts = { duration: reduceMotion ? 0 : (open ? 280 : 220), easing: EASE, fill: 'forwards' };
    var a = boxImg.animate([{ transform: live ? curT : thumbT, boxShadow: curS }, { transform: open ? 'none' : thumbT, boxShadow: open ? fullS : NO_SHADOW }], opts);
    var b = scrim.animate([{ opacity: curO }, { opacity: open ? 1 : 0 }], opts);
    anims = [a, b];
    $thumb.css('visibility', 'hidden');

    a.onfinish = function () {
      cancelAnims();
      if (open) return;
      $box.prop('hidden', true);
      $('body').removeClass('no-scroll');
      $thumb.css('visibility', '').trigger('focus');
    };
  }

  function setOpen(open, $img) {
    if (open === isOpen) return;
    isOpen = open;
    if (!open) return animateTo(false, true);

    if ($img) {
      if ($thumb && $thumb[0] !== $img[0]) $thumb.css('visibility', '');
      $thumb = $img;
      boxImg.alt = $img.attr('alt') || '';
      var src = $img.attr('src');
      if (boxImg.getAttribute('src') !== src) boxImg.src = src;
    }
    var wasHidden = $box.prop('hidden');
    $box.prop('hidden', false);
    if (wasHidden) {
      $('body').addClass('no-scroll');
      $box.trigger('focus');
    }
    var live = !wasHidden;
    if (boxImg.complete && boxImg.naturalWidth) animateTo(true, live);
    else $(boxImg).one('load', function () { if (isOpen) animateTo(true, live); });
  }

  function toggleFromBox() { setOpen(!isOpen); }

  $('img.zoomable').attr({ tabindex: 0, role: 'button' }).on('click', function () { setOpen(true, $(this))}).on('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true, $(this)); }});

  $box.on('click', toggleFromBox);
  $(document).on('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
});