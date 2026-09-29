/* @ds-bundle: {"format":4,"namespace":"ClaudeCode","components":[{"name":"Button"},{"name":"Input"},{"name":"Badge"},{"name":"Card"},{"name":"Sidebar"}]} */
(function () {
  var R = window.React, h = R.createElement;
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }
  function omit(o, keys) { var r = {}; for (var k in o) if (keys.indexOf(k) < 0) r[k] = o[k]; return r; }

  function Button(p) {
    var variant = p.variant || 'secondary', size = p.size || 'md';
    var rest = omit(p, ['variant', 'size', 'className', 'children', 'icon']);
    return h('button', Object.assign({ type: 'button' }, rest, {
      className: cx('cc-btn', 'cc-btn-' + variant, 'cc-btn-' + size, p.className)
    }), p.icon ? h('span', { className: 'cc-btn-icon', 'aria-hidden': true }, p.icon) : null, p.children);
  }

  var uid = 0;
  function Input(p) {
    var idRef = R.useRef(null);
    if (!idRef.current) idRef.current = p.id || 'cc-in-' + (++uid);
    var id = idRef.current, hintId = id + '-hint';
    var rest = omit(p, ['label', 'hint', 'error', 'className', 'id', 'mono']);
    var msg = p.error || p.hint;
    return h('div', { className: cx('cc-field', p.error && 'cc-field-error', p.className) },
      p.label ? h('label', { className: 'cc-label', htmlFor: id }, p.label) : null,
      h('input', Object.assign({}, rest, {
        id: id, className: cx('cc-input', p.mono && 'cc-input-mono'),
        'aria-invalid': p.error ? true : undefined,
        'aria-describedby': msg ? hintId : undefined
      })),
      msg ? h('div', { id: hintId, className: 'cc-hint' }, msg) : null);
  }

  function Badge(p) {
    return h('span', { className: cx('cc-badge', 'cc-badge-' + (p.tone || 'neutral'), p.className) },
      p.dot ? h('span', { className: 'cc-badge-dot', 'aria-hidden': true }) : null, p.children);
  }

  function Card(p) {
    var rest = omit(p, ['title', 'description', 'actions', 'footer', 'className', 'children', 'elevated']);
    return h('section', Object.assign({}, rest, { className: cx('cc-card', p.elevated && 'cc-card-elevated', p.className) }),
      (p.title || p.actions) ? h('header', { className: 'cc-card-head' },
        h('div', null,
          p.title ? h('h3', { className: 'cc-card-title' }, p.title) : null,
          p.description ? h('p', { className: 'cc-card-desc' }, p.description) : null),
        p.actions ? h('div', { className: 'cc-card-actions' }, p.actions) : null) : null,
      p.children != null ? h('div', { className: 'cc-card-body' }, p.children) : null,
      p.footer ? h('footer', { className: 'cc-card-foot' }, p.footer) : null);
  }

  function norm(t) { return String(t || '').toLowerCase(); }
  // Filter a tree by query: keep an item if its label matches (with all its children) or if any child matches.
  function filterItems(items, q) {
    if (!q) return items || [];
    var out = [];
    (items || []).forEach(function (it) {
      if (norm(it.label).indexOf(q) >= 0) { out.push(it); return; }
      var kids = filterItems(it.children, q);
      if (kids.length) out.push(Object.assign({}, it, { children: kids }));
    });
    return out;
  }
  function containsId(items, id) {
    return (items || []).some(function (it) { return it.id === id || containsId(it.children, id); });
  }
  function highlight(label, q) {
    if (!q) return label;
    var i = norm(label).indexOf(q);
    if (i < 0) return label;
    return [label.slice(0, i), h('mark', { key: 'm', className: 'cc-side-mark' }, label.slice(i, i + q.length)), label.slice(i + q.length)];
  }

  function SidebarItem(props) {
    var it = props.item, p = props.root, depth = props.depth, q = props.query;
    var hasKids = it.children && it.children.length > 0;
    var active = it.id != null && it.id === p.activeId;
    var open = hasKids && (q ? true : !!props.expanded[it.id]);
    var pad = { paddingLeft: 'calc(var(--space-2) + ' + (depth * 16) + 'px)' };
    return h('li', { role: 'none' },
      h('div', { className: 'cc-side-rowwrap' },
        h('a', {
          href: it.href || '#', style: pad,
          className: cx('cc-side-item', active && 'is-active'),
          'aria-current': active ? 'page' : undefined,
          'aria-expanded': hasKids ? !!open : undefined,
          onClick: function (e) {
            if (hasKids && !it.href) { e.preventDefault(); props.toggle(it.id, !open); if (p.onSelect && p.selectParents) p.onSelect(it.id); return; }
            if (p.onSelect) { e.preventDefault(); p.onSelect(it.id); }
          }
        },
          hasKids ? h('span', {
            className: cx('cc-side-chev', open && 'is-open'), 'aria-hidden': true,
            onClick: function (e) { if (it.href) { e.preventDefault(); e.stopPropagation(); props.toggle(it.id, !open); } }
          }, '›') : (depth > 0 ? h('span', { className: 'cc-side-chev', 'aria-hidden': true }) : null),
          it.icon ? h('span', { className: 'cc-side-icon', 'aria-hidden': true }, it.icon) : null,
          h('span', { className: 'cc-side-label' }, highlight(it.label, q)),
          it.count != null ? h('span', { className: 'cc-side-count' }, it.count) : null)),
      hasKids && open ? h('ul', { className: 'cc-side-list', role: 'group' }, it.children.map(function (c, i) {
        return h(SidebarItem, { key: c.id != null ? c.id : i, item: c, root: p, depth: depth + 1, query: q, expanded: props.expanded, toggle: props.toggle });
      })) : null);
  }

  function Sidebar(p) {
    var sq = R.useState(''), query = sq[0], setQuery = sq[1];
    var init = {}; (p.defaultExpandedIds || []).forEach(function (id) { init[id] = true; });
    var se = R.useState(init), expanded = se[0], setExpanded = se[1];
    // Keep the active item's ancestors open; once opened they stay open until the person closes them.
    R.useEffect(function () {
      if (p.activeId == null) return;
      var add = {};
      (function walk(items) {
        (items || []).forEach(function (it) { if (it.children && containsId(it.children, p.activeId)) { add[it.id] = true; walk(it.children); } });
      })([].concat.apply([], (p.sections || []).map(function (s) { return s.items || []; })));
      if (Object.keys(add).length) setExpanded(function (m) {
        var n = Object.assign({}, m), ch = false;
        for (var k in add) if (!n[k]) { n[k] = true; ch = true; }
        return ch ? n : m;
      });
    }, [p.activeId]);
    function toggle(id, v) { setExpanded(function (m) { var n = Object.assign({}, m); n[id] = v; return n; }); }
    var q = norm(query).trim();
    var sections = (p.sections || []).map(function (s) { return Object.assign({}, s, { items: filterItems(s.items, q) }); })
      .filter(function (s) { return !q || s.items.length; });
    return h('nav', { className: cx('cc-side', p.className), 'aria-label': p.label || 'Навигация' },
      p.header ? h('div', { className: 'cc-side-head' }, p.header) : null,
      p.searchable ? h('div', { className: 'cc-side-search' },
        h('span', { className: 'cc-side-search-icon', 'aria-hidden': true }, '⌕'),
        h('input', {
          type: 'search', value: query, placeholder: p.searchPlaceholder || 'Поиск',
          'aria-label': p.searchPlaceholder || 'Поиск по навигации',
          className: 'cc-side-search-input',
          onChange: function (e) { setQuery(e.target.value); },
          onKeyDown: function (e) { if (e.key === 'Escape') setQuery(''); }
        })) : null,
      h('div', { className: 'cc-side-scroll' },
        sections.length ? sections.map(function (s, si) {
          return h('div', { className: 'cc-side-sec', key: si },
            s.title ? h('div', { className: 'cc-side-title' }, s.title) : null,
            h('ul', { className: 'cc-side-list' }, s.items.map(function (it, ii) {
              return h(SidebarItem, { key: it.id != null ? it.id : ii, item: it, root: p, depth: 0, query: q, expanded: expanded, toggle: toggle });
            })));
        }) : h('div', { className: 'cc-side-empty' }, p.emptyText || 'Ничего не найдено')),
      p.footer ? h('div', { className: 'cc-side-foot' }, p.footer) : null);
  }

  window.ClaudeCode = Object.assign(window.ClaudeCode || {}, { Button: Button, Input: Input, Badge: Badge, Card: Card, Sidebar: Sidebar });
})();
