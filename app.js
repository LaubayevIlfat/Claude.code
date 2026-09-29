// Стартовое приложение на дизайн-системе Claude.code.
// Компоненты берутся из window.ClaudeCode (design/bundle.js). Сборка не нужна.
(function () {
  var C = window.ClaudeCode, h = React.createElement, useState = React.useState;

  // ---- Навигация: поменяйте под свой проект --------------------------------
  var NAV = [
    { title: 'Проект', items: [
      { id: 'overview', label: 'Обзор', icon: '◇' },
      { id: 'src', label: 'src', icon: '▤', children: [
        { id: 'components', label: 'components', children: [
          { id: 'file:Button.tsx', label: 'Button.tsx' },
          { id: 'file:Sidebar.tsx', label: 'Sidebar.tsx' } ] },
        { id: 'file:index.ts', label: 'index.ts' } ] },
      { id: 'changes', label: 'Изменения', icon: '±', count: 3 },
      { id: 'branches', label: 'Ветки', icon: '⎇', count: 2 } ] },
    { title: 'Команда', items: [
      { id: 'issues', label: 'Задачи', icon: '○', count: 4 },
      { id: 'settings', label: 'Настройки', icon: '⚙' } ] }
  ];

  function findLabel(items, id) {
    for (var i = 0; i < items.length; i++) {
      if (items[i].id === id) return items[i].label;
      var r = items[i].children && findLabel(items[i].children, id);
      if (r) return r;
    }
    return null;
  }
  function labelOf(id) {
    for (var i = 0; i < NAV.length; i++) { var l = findLabel(NAV[i].items, id); if (l) return l; }
    return id;
  }

  // ---- Страницы ------------------------------------------------------------
  function Overview(props) {
    return h('div', { className: 'grid' },
      h(C.Card, {
        title: 'Claude.code', description: 'ветка main · обновлено только что',
        actions: h(C.Badge, { tone: 'signal', dot: true }, 'готово'),
        footer: h(React.Fragment, null,
          h(C.Button, { size: 'sm', variant: 'ghost', onClick: function () { props.go('settings'); } }, 'Настройки'),
          h(C.Button, { size: 'sm', variant: 'primary', onClick: function () { props.go('changes'); } }, 'Изменения'))
      }, 'Стартовый проект на дизайн-системе. Замените этот текст описанием своего приложения.'),
      h(C.Card, { title: 'Сборка', description: 'последний запуск', actions: h(C.Badge, { tone: 'amber', dot: true }, 'в работе') },
        h('span', { className: 'code' }, 'npm run build')),
      h(C.Card, { title: 'Задачи', description: '4 открыты' },
        h('ul', { className: 'list' },
          h('li', null, 'Подключить API', h(C.Badge, { tone: 'amber' }, 'в работе')),
          h('li', null, 'Страница входа', h(C.Badge, null, 'новая')),
          h('li', null, 'Ошибка в поиске', h(C.Badge, { tone: 'danger' }, 'баг')))));
  }

  function Changes() {
    var files = [['src/components/Sidebar.tsx', '+42 −8'], ['src/index.ts', '+3 −1'], ['README.md', '+12']];
    return h(C.Card, { title: 'Изменения', description: files.length + ' файла',
      footer: h(C.Button, { size: 'sm', variant: 'primary' }, 'Сделать коммит') },
      h('ul', { className: 'list' }, files.map(function (f) {
        return h('li', { key: f[0] }, h('span', { className: 'code' }, f[0]), h('span', { className: 'code muted' }, f[1]));
      })));
  }

  function Settings() {
    var s = useState('Claude.code'), name = s[0], setName = s[1];
    var err = /^[A-Za-z0-9._-]+$/.test(name) ? null : 'Только латиница, цифры, точка, дефис и подчёркивание.';
    return h(C.Card, { title: 'Настройки проекта',
      footer: h(React.Fragment, null, h(C.Button, { size: 'sm', variant: 'ghost' }, 'Отмена'), h(C.Button, { size: 'sm', variant: 'primary', disabled: !!err }, 'Сохранить')) },
      h('div', { className: 'form' },
        h(C.Input, { label: 'Название', value: name, onChange: function (e) { setName(e.target.value); }, error: err || undefined, hint: 'Так проект называется на GitHub.' }),
        h(C.Input, { label: 'Основная ветка', mono: true, defaultValue: 'main' }),
        h(C.Input, { label: 'Репозиторий', mono: true, defaultValue: 'git@github.com:LaubayevIlfat/Claude.code.git' })));
  }

  function Placeholder(props) {
    return h(C.Card, { title: props.title },
      h('p', { className: 'muted', style: { margin: 0 } }, 'Здесь будет содержимое раздела «' + props.title + '». Добавьте свою страницу в src/app.js.'));
  }

  // ---- Приложение ----------------------------------------------------------
  function App() {
    var a = useState('overview'), active = a[0], setActive = a[1];
    var t = useState(document.documentElement.dataset.theme || 'light'), theme = t[0], setTheme = t[1];
    function toggleTheme() {
      var next = theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('cc-theme', next); } catch (e) {}
      setTheme(next);
    }
    var title = labelOf(active);
    var page = active === 'overview' ? h(Overview, { go: setActive })
      : active === 'changes' ? h(Changes)
      : active === 'settings' ? h(Settings)
      : h(Placeholder, { title: title });

    return h('div', { className: 'app' },
      h(C.Sidebar, {
        sections: NAV, activeId: active, onSelect: setActive, searchable: true,
        header: 'Claude.code',
        footer: h('div', { className: 'side-foot' },
          h('div', { className: 'who' }, h('span', { className: 'avatar' }, 'LI'), h('span', null, 'Laubayev Ilfat')),
          h(C.Button, { size: 'sm', variant: 'ghost', onClick: toggleTheme, 'aria-label': 'Сменить тему', title: 'Сменить тему' }, theme === 'dark' ? '☀' : '☾'))
      }),
      h('main', { className: 'main' },
        h('header', { className: 'topbar' },
          h('div', null,
            h('div', { className: 'caption crumbs' }, 'Claude.code'),
            h('h1', { className: 'heading topbar-title' }, title)),
          h('div', { className: 'row' },
            h(C.Button, { variant: 'secondary', icon: '⎇' }, 'main'),
            h(C.Button, { variant: 'primary' }, 'Отправить'))),
        h('div', { className: 'content' }, page)));
  }

  ReactDOM.createRoot(document.getElementById('root')).render(h(App));
})();
