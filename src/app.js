// Путеводитель по Claude на дизайн-системе Claude.code.
// Компоненты — window.ClaudeCode (design/bundle.js), содержимое — window.GUIDE (src/data.js).
(function () {
  var C = window.ClaudeCode, G = window.GUIDE, h = React.createElement, useState = React.useState;

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || 'null');
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  // ---- Навигация -----------------------------------------------------------
  var NAV = [
    { title: 'Путеводитель', items: [
      { id: 'home', label: 'Главная', icon: '◇' },
      { id: 'links', label: 'Быстрые ссылки', icon: '↗', count: G.links.reduce(function (n, g) { return n + g.items.length; }, 0) },
      { id: 'features', label: 'Шпаргалка', icon: '▤', children: G.features.map(function (f) { return { id: f.id, label: f.title }; }) },
      { id: 'prompts', label: 'Промпты', icon: '✎', children: G.prompts.map(function (g, i) { return { id: 'p-' + i, label: g.group }; }).concat([{ id: 'p-mine', label: 'Мои промпты' }]) }
    ] },
    { title: 'Моё', items: [
      { id: 'mine', label: 'Мои проекты и ссылки', icon: '★', count: G.mine.length }
    ] }
  ];
  function labelOf(id) {
    var found = null;
    (function walk(items) { items.forEach(function (it) { if (it.id === id) found = it.label; if (it.children) walk(it.children); }); })
      ([].concat.apply([], NAV.map(function (s) { return s.items; })));
    return found || id;
  }

  // ---- Общие кусочки -------------------------------------------------------
  function ExtLink(p) {
    return h('a', { className: 'ext', href: p.url, target: '_blank', rel: 'noopener noreferrer' }, p.children, h('span', { className: 'ext-arrow', 'aria-hidden': true }, ' ↗'));
  }

  function CopyButton(p) {
    var s = useState(false), done = s[0], setDone = s[1];
    function copy() {
      function ok() { setDone(true); setTimeout(function () { setDone(false); }, 1500); }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(p.text).then(ok, fallback);
      else fallback();
      function fallback() {
        var ta = document.createElement('textarea'); ta.value = p.text; document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); ok(); } catch (e) {} document.body.removeChild(ta);
      }
    }
    return h(C.Button, { size: 'sm', variant: done ? 'secondary' : 'primary', onClick: copy }, done ? '✓ Скопировано' : 'Копировать');
  }

  function Section(p) {
    return h('section', { className: 'section', id: p.id },
      h('h2', { className: 'subheading section-title' }, p.title),
      p.note ? h('p', { className: 'muted section-note' }, p.note) : null,
      p.children);
  }

  // ---- Страницы ------------------------------------------------------------
  function Home(p) {
    var tiles = [
      { id: 'links', title: 'Быстрые ссылки', text: 'Прямые переходы в нужные разделы claude.ai: чаты, проекты, артефакты, навыки, настройки.' },
      { id: 'features', title: 'Шпаргалка', text: 'Что умеет Claude, где это найти в интерфейсе и как этим пользоваться.' },
      { id: 'prompts', title: 'Промпты', text: 'Готовые запросы — копируете одной кнопкой и вставляете в Claude. Можно добавлять свои.' },
      { id: 'mine', title: 'Мои проекты и ссылки', text: 'Этот сайт, репозиторий на GitHub и дизайн-система в одном месте.' }
    ];
    return h(React.Fragment, null,
      h('p', { className: 'lead' }, 'Здравствуйте! Здесь собрано всё, чтобы быстрее ориентироваться в Claude. Выберите раздел слева или ниже. Поиск в боковой панели находит раздел по названию.'),
      h('div', { className: 'grid' }, tiles.map(function (t) {
        return h(C.Card, { key: t.id, title: t.title,
          footer: h(C.Button, { size: 'sm', variant: 'ghost', onClick: function () { p.go(t.id); } }, 'Открыть →') },
          h('span', { className: 'muted' }, t.text));
      })),
      h(Section, { title: 'Главное за 30 секунд' },
        h('div', { className: 'grid' },
          h(C.Card, { title: 'Начать разговор' }, 'Откройте ', h(ExtLink, { url: 'https://claude.ai/new' }, 'claude.ai/new'), ' и напишите задачу обычными словами. Чем больше деталей — кому, зачем, в каком виде — тем точнее ответ.'),
          h(C.Card, { title: 'Найти сделанное' }, 'Презентации, документы, дизайн и сайты лежат в ', h(ExtLink, { url: 'https://claude.ai/artifacts' }, 'Артефактах'), '. Старые разговоры — в ', h(ExtLink, { url: 'https://claude.ai/recents' }, 'недавних чатах'), '.'),
          h(C.Card, { title: 'Подключить сервисы' }, 'Почту, диск и календарь подключают в ', h(ExtLink, { url: 'https://claude.ai/customize/connectors' }, 'Коннекторах'), '. После этого Claude может искать письма и файлы по вашей просьбе.'))));
  }

  function Links() {
    return h(React.Fragment, null, G.links.map(function (g) {
      return h(Section, { key: g.group, title: g.group },
        h('div', { className: 'grid' }, g.items.map(function (l) {
          return h('a', { key: l.url, className: 'tile', href: l.url, target: '_blank', rel: 'noopener noreferrer' },
            h('span', { className: 'tile-title' }, l.title, h('span', { className: 'ext-arrow', 'aria-hidden': true }, ' ↗')),
            h('span', { className: 'tile-note' }, l.note),
            h('span', { className: 'tile-url code' }, l.url.replace(/^https:\/\//, '')));
        })));
    }));
  }

  function Feature(p) {
    var f = p.f;
    return h(C.Card, { title: h('span', null, h('span', { className: 'feat-icon', 'aria-hidden': true }, f.icon), f.title), description: f.where },
      h('p', { className: 'feat-what' }, f.what),
      h('ul', { className: 'tips' }, f.tips.map(function (t, i) { return h('li', { key: i }, t); })));
  }
  function Features(p) {
    var list = p.only ? G.features.filter(function (f) { return f.id === p.only; }) : G.features;
    return h(React.Fragment, null,
      p.only ? h('div', null, h(C.Button, { size: 'sm', variant: 'ghost', onClick: function () { p.go('features'); } }, '← Вся шпаргалка')) : null,
      h('div', { className: p.only ? 'one' : 'grid grid-wide' }, list.map(function (f) { return h(Feature, { key: f.id, f: f }); })));
  }

  function PromptCard(p) {
    return h(C.Card, { title: p.item.title,
      footer: h(React.Fragment, null,
        p.onDelete ? h(C.Button, { size: 'sm', variant: 'ghost', onClick: p.onDelete }, 'Удалить') : null,
        h(C.Button, { size: 'sm', variant: 'secondary', onClick: function () { window.open('https://claude.ai/new', '_blank', 'noopener'); } }, 'Открыть Claude ↗'),
        h(CopyButton, { text: p.item.text })) },
      h('pre', { className: 'prompt' }, p.item.text.trim()));
  }

  function MyPrompts() {
    var s = useState(function () { return store('cc-my-prompts') || []; }), list = s[0], setList = s[1];
    var t = useState(''), title = t[0], setTitle = t[1];
    var x = useState(''), text = x[0], setText = x[1];
    function save(next) { setList(next); store('cc-my-prompts', next); }
    function add(e) {
      e.preventDefault();
      if (!title.trim() || !text.trim()) return;
      save(list.concat([{ title: title.trim(), text: text }])); setTitle(''); setText('');
    }
    return h(Section, { id: 'p-mine', title: 'Мои промпты', note: 'Сохраняются в этом браузере. На другом устройстве их не будет — важные лучше перенести в src/data.js.' },
      h('div', { className: 'grid grid-wide' },
        list.map(function (it, i) {
          return h(PromptCard, { key: i, item: it, onDelete: function () { save(list.filter(function (_, j) { return j !== i; })); } });
        }),
        h(C.Card, { title: 'Новый промпт' },
          h('form', { className: 'form', onSubmit: add },
            h(C.Input, { label: 'Название', placeholder: 'Например: ответ клиенту', value: title, onChange: function (e) { setTitle(e.target.value); } }),
            h('div', { className: 'cc-field' },
              h('label', { className: 'cc-label', htmlFor: 'new-prompt' }, 'Текст запроса'),
              h('textarea', { id: 'new-prompt', className: 'cc-input textarea', rows: 4, placeholder: 'Что должен сделать Claude…', value: text, onChange: function (e) { setText(e.target.value); } })),
            h('div', null, h(C.Button, { type: 'submit', variant: 'primary', disabled: !title.trim() || !text.trim() }, 'Сохранить'))))));
  }

  function Prompts(p) {
    var groups = G.prompts.map(function (g, i) { return { g: g, id: 'p-' + i }; });
    if (p.only && p.only !== 'p-mine') groups = groups.filter(function (x) { return x.id === p.only; });
    return h(React.Fragment, null,
      h('p', { className: 'lead' }, 'Нажмите «Копировать», затем вставьте запрос в Claude (Ctrl+V) и замените «…» своими словами.'),
      p.only !== 'p-mine' ? groups.map(function (x) {
        return h(Section, { key: x.id, id: x.id, title: x.g.group },
          h('div', { className: 'grid grid-wide' }, x.g.items.map(function (it) { return h(PromptCard, { key: it.title, item: it }); })));
      }) : null,
      (!p.only || p.only === 'p-mine') ? h(MyPrompts) : null);
  }

  function Mine() {
    return h('div', { className: 'grid grid-wide' }, G.mine.map(function (m) {
      return h(C.Card, { key: m.url, title: m.title, description: m.code ? h('span', { className: 'code' }, m.code) : null,
        actions: m.badge ? h(C.Badge, { tone: m.badge[0], dot: m.badge[0] === 'signal' }, m.badge[1]) : null,
        footer: h(C.Button, { size: 'sm', variant: 'primary', onClick: function () { window.open(m.url, '_blank', 'noopener'); } }, 'Открыть ↗') },
        h('span', { className: 'muted' }, m.note));
    }));
  }

  // ---- Приложение ----------------------------------------------------------
  function initialPage() { var hsh = (location.hash || '').slice(1); return hsh || 'home'; }

  function App() {
    var a = useState(initialPage), active = a[0], setActiveRaw = a[1];
    var t = useState(document.documentElement.dataset.theme || 'light'), theme = t[0], setTheme = t[1];
    function setActive(id) { setActiveRaw(id); try { history.replaceState(null, '', '#' + id); } catch (e) {} var m = document.querySelector('.main'); if (m) m.scrollTop = 0; }
    React.useEffect(function () {
      function onHash() { setActiveRaw(initialPage()); }
      window.addEventListener('hashchange', onHash); return function () { window.removeEventListener('hashchange', onHash); };
    }, []);
    function toggleTheme() {
      var next = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('cc-theme', next); } catch (e) {}
      setTheme(next);
    }

    var page, crumb = 'Путеводитель по Claude';
    if (active === 'home') page = h(Home, { go: setActive });
    else if (active === 'links') page = h(Links);
    else if (active === 'features') page = h(Features, { go: setActive });
    else if (/^f-/.test(active)) { page = h(Features, { only: active, go: setActive }); crumb = 'Шпаргалка'; }
    else if (active === 'prompts') page = h(Prompts, {});
    else if (/^p-/.test(active)) { page = h(Prompts, { only: active }); crumb = 'Промпты'; }
    else if (active === 'mine') page = h(Mine);
    else page = h(Home, { go: setActive });

    return h('div', { className: 'app' },
      h(C.Sidebar, {
        sections: NAV, activeId: active, onSelect: setActive, searchable: true, selectParents: true,
        searchPlaceholder: 'Найти раздел',
        header: h('a', { href: '#home', className: 'brand', onClick: function (e) { e.preventDefault(); setActive('home'); } }, 'Claude.code'),
        footer: h('div', { className: 'side-foot' },
          h('div', { className: 'who' }, h('span', { className: 'avatar' }, 'LI'), h('span', null, 'Laubayev Ilfat')),
          h(C.Button, { size: 'sm', variant: 'ghost', onClick: toggleTheme, 'aria-label': 'Сменить тему', title: 'Сменить тему' }, theme === 'dark' ? '☀' : '☾'))
      }),
      h('main', { className: 'main' },
        h('header', { className: 'topbar' },
          h('div', null,
            h('div', { className: 'caption crumbs' }, crumb),
            h('h1', { className: 'heading topbar-title' }, active === 'home' ? 'Главная' : labelOf(active))),
          h('div', { className: 'row' },
            h(C.Button, { variant: 'primary', onClick: function () { window.open('https://claude.ai/new', '_blank', 'noopener'); } }, 'Новый чат ↗'))),
        h('div', { className: 'content' }, page)));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
