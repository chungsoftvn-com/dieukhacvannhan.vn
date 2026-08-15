/* Theme A - greensoftware.foundation style - vanilla JS */
(function () {
  'use strict';

  // 1. Dynamic year (e.g. copyright)
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // 2. Sticky header: add shadow after scrolling
  var header = document.getElementById('site-header');
  var onScroll = function () {
    if (!header) return;
    if (window.scrollY > 8) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 3. Mobile menu toggle
  var toggle = document.getElementById('menu-toggle');
  var mobileMenu = document.getElementById('mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', function () {
      var open = mobileMenu.classList.toggle('hidden');
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.classList.toggle('is-open', !open);
      var openLabel = toggle.getAttribute('data-label-open') || 'Mở menu';
      var closeLabel = toggle.getAttribute('data-label-close') || 'Đóng menu';
      toggle.setAttribute('aria-label', !open ? closeLabel : openLabel);
    });
    // Close menu when a link is tapped
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.remove('is-open');
      });
    });
  }

  // 4. Scroll reveal
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) {
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  // 5. Back to top
  var backTop = document.getElementById('back-to-top');
  if (backTop) {
    var onScrollTop = function () {
      if (window.scrollY > 600) {
        backTop.classList.remove('hidden');
      } else {
        backTop.classList.add('hidden');
      }
    };
    window.addEventListener('scroll', onScrollTop, { passive: true });
    onScrollTop();
    backTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 6. Product filtering + search + pagination (products page)
  (function () {
    var grid = document.querySelector('[data-product-grid]');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
    var filterBar = document.getElementById('filter-bar');
    var searchForm = document.querySelector('[data-product-search]');
    var searchInput = searchForm ? searchForm.querySelector('[data-search-input]') : null;
    var resultsCount = document.querySelector('[data-results-count]');
    var noResults = document.querySelector('[data-no-results]');
    var pagination = document.querySelector('[data-pagination]');
    var PAGE_SIZE = 9;
    var state = { filter: 'all', query: '', page: 1 };

    var resultsLabel = resultsCount ? (resultsCount.getAttribute('data-results-label') || '') : '';
    var prevLabel = pagination ? (pagination.getAttribute('data-prev') || '') : '';
    var nextLabel = pagination ? (pagination.getAttribute('data-next') || '') : '';

    function norm(s) {
      return String(s || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    }

    function matches(card) {
      if (state.filter !== 'all' && card.getAttribute('data-category') !== state.filter) return false;
      if (state.query) {
        var hay = norm(
          [card.getAttribute('data-name'), card.getAttribute('data-desc'), card.getAttribute('data-material'), card.getAttribute('data-category')].join(' ')
        );
        if (hay.indexOf(norm(state.query)) === -1) return false;
      }
      return true;
    }

    function renderPagination(totalPages) {
      if (!pagination) return;
      if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
      }
      var html =
        '<button type="button" class="pagination-btn" data-page="' + (state.page - 1) + '"' +
        (state.page === 1 ? ' disabled' : '') + '>' + prevLabel + '</button>';
      for (var i = 1; i <= totalPages; i++) {
        html +=
          '<button type="button" class="pagination-btn' + (i === state.page ? ' is-active' : '') +
          '" data-page="' + i + '">' + i + '</button>';
      }
      html +=
        '<button type="button" class="pagination-btn" data-page="' + (state.page + 1) + '"' +
        (state.page === totalPages ? ' disabled' : '') + '>' + nextLabel + '</button>';
      pagination.innerHTML = html;
    }

    function render() {
      var filtered = cards.filter(matches);
      var totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
      if (state.page > totalPages) state.page = totalPages;
      var start = (state.page - 1) * PAGE_SIZE;
      var visible = filtered.slice(start, start + PAGE_SIZE);

      cards.forEach(function (card) {
        card.classList.toggle('is-hidden', visible.indexOf(card) === -1);
        if (visible.indexOf(card) !== -1) card.classList.add('revealed');
      });

      if (resultsCount) resultsCount.textContent = filtered.length + ' ' + resultsLabel;
      if (noResults) noResults.classList.toggle('hidden', filtered.length > 0);
      renderPagination(totalPages);
    }

    if (filterBar) {
      filterBar.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-filter]');
        if (!btn) return;
        filterBar.querySelectorAll('[data-filter]').forEach(function (b) {
          b.classList.remove('is-active');
        });
        btn.classList.add('is-active');
        state.filter = btn.getAttribute('data-filter');
        state.page = 1;
        render();
      });
    }

    if (searchForm && searchInput) {
      searchForm.addEventListener('submit', function (e) {
        e.preventDefault();
        state.query = searchInput.value.trim();
        state.page = 1;
        render();
      });
      searchInput.addEventListener('input', function () {
        state.query = searchInput.value.trim();
        state.page = 1;
        render();
      });
    }

    if (pagination) {
      pagination.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-page]');
        if (!btn || btn.disabled) return;
        state.page = parseInt(btn.getAttribute('data-page'), 10) || 1;
        render();
        if (grid.scrollIntoView) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    render();
  })();

  // 7. Newsletter subscribe (demo — reveals success message)
  var newsletter = document.querySelector('[data-newsletter]');
  if (newsletter) {
    newsletter.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = document.querySelector('[data-newsletter-ok]');
      if (ok) ok.classList.remove('hidden');
      newsletter.reset();
    });
  }

  // 8. Product gallery thumbnails (product detail page)
  document.querySelectorAll('[data-gallery]').forEach(function (gallery) {
    var main = gallery.querySelector('[data-gallery-main]');
    var thumbs = gallery.querySelectorAll('[data-gallery-thumb]');
    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        if (!main) return;
        var src = thumb.getAttribute('data-src');
        var alt = thumb.getAttribute('data-alt') || main.alt;
        main.src = src;
        main.alt = alt;
        thumbs.forEach(function (t) {
          t.classList.remove('is-active');
        });
        thumb.classList.add('is-active');
      });
    });
  });
})();
