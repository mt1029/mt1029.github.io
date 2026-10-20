$(function () {
  'use strict';

  var $root = $('html');
  var $top = $('#btn-top');

  $('#btn-theme').on('click', function () {
    var next = $root.attr('data-theme') === 'dark' ? 'light' : 'dark';
    $root.attr('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
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

  $(window).on('scroll', function () { $top.toggleClass('show', $(window).scrollTop() > 300)}).trigger('scroll');

  $top.on('click', function () { $('html, body').animate({ scrollTop: 0 }, 400)});

  var $box = $('<div class="lightbox" role="dialog" aria-modal="true" aria-label="圖片預覽" tabindex="-1" hidden>' + '<img class="lightbox-img" alt="">' + '</div>').appendTo('body');
  var boxImg = $box.find('.lightbox-img')[0];
  var $lastTrigger = null;
  var anim = null;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EASE = 'cubic-bezier(.2, .9, .3, 1)';

  function fromThumb() {
    var t = $lastTrigger[0].getBoundingClientRect();
    var b = boxImg.getBoundingClientRect();
    return 'translate(' + (t.left - b.left) + 'px,' + (t.top - b.top) + 'px) scale(' + (t.width / b.width) + ')';
  }

  function play(from, to, ms, done) {
    if (anim) anim.cancel();
    anim = boxImg.animate([{ transform: from }, { transform: to }], { duration: reduceMotion ? 0 : ms, easing: EASE, fill: 'forwards'});
    if (!done) return;
    var called = false;
    function once() { if (!called) { called = true; done(); } }
    anim.onfinish = once;
    setTimeout(once, ms + 60);
  }

  function openBox($img) {
    $lastTrigger = $img;
    boxImg.alt = $img.attr('alt') || '';
    boxImg.style.visibility = 'hidden';
    boxImg.src = $img.attr('src');
    $box.removeClass('closing').prop('hidden', false);
    $('body').addClass('no-scroll');
    $box.trigger('focus');
    function start() {
      if ($box.prop('hidden')) return;
      var from = fromThumb();
      boxImg.style.visibility = '';
      $img.css('visibility', 'hidden');
      play(from, 'none', 280);
    }
    if (boxImg.complete && boxImg.naturalWidth) start();
    else $(boxImg).one('load', start);
  }

  function closeBox() {
    if ($box.prop('hidden') || $box.hasClass('closing')) return;
    $box.addClass('closing');
    play('none', fromThumb(), 220, function () {
      if (anim) anim.cancel();
      $box.prop('hidden', true).removeClass('closing');
      $('body').removeClass('no-scroll');
      $lastTrigger.css('visibility', '').trigger('focus');
    });
  }

  $('img.zoomable').attr({ tabindex: 0, role: 'button' }).on('click', function () { openBox($(this))}).on('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openBox($(this)); }});

  $box.on('click', closeBox);
  $(document).on('keydown', function (e) { if (e.key === 'Escape') closeBox()});

  var $cards = $('.card').addClass('reveal');
  function reveal() {
    var bottom = $(window).scrollTop() + $(window).height();
    $cards.not('.in').each(function () { if ($(this).offset().top < bottom - 40) $(this).addClass('in')});
  }
  $(window).on('scroll resize', reveal);
  reveal();
});