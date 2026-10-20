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

  $(window).on('scroll', function () {
    $top.toggleClass('show', $(window).scrollTop() > 300);
  }).trigger('scroll');

  $top.on('click', function () {
    $('html, body').animate({ scrollTop: 0 }, 400);
  });

  var $cards = $('.card').addClass('reveal');
  function reveal() {
    var bottom = $(window).scrollTop() + $(window).height();
    $cards.not('.in').each(function () {
      if ($(this).offset().top < bottom - 40) $(this).addClass('in');
    });
  }
  $(window).on('scroll resize', reveal);
  reveal();
});