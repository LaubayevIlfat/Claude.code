# Claude.code

Стартовое приложение на дизайн-системе **Claude.code**: боковая панель с поиском и вложенными пунктами, карточки, формы, светлая и тёмная тема. Сборка не нужна — это обычные HTML, CSS и JavaScript.

## Запуск

Откройте `index.html` в браузере. Или запустите локальный сервер в папке проекта:

```bash
python3 -m http.server 8000
# затем откройте http://localhost:8000
```

## Структура

```
index.html          точка входа: подключает всё по порядку
design/             файлы дизайн-системы — не правьте вручную, обновляйте целиком
  tokens.css        цвета, отступы, скругления, тени, шрифты (CSS-переменные)
  tokens.json       те же токены в виде данных
  bundle.css        стили компонентов
  bundle.js         компоненты: window.ClaudeCode.{Button, Input, Badge, Card, Sidebar}
vendor/             React 18 (локальная копия, работает без интернета)
src/
  app.js            ваше приложение: навигация (NAV) и страницы
  app.css           раскладка приложения
```

## Как пользоваться

- **Навигация** — массив `NAV` в `src/app.js`. Вложенные пункты — поле `children`.
- **Новая страница** — функция в `src/app.js` и строка в выборе `page` внутри `App`.
- **Цвета и отступы** — только через токены: `color: var(--ink); padding: var(--space-4);`. Список — в `design/tokens.css`.
- **Текстовые стили** — классы `display`, `heading`, `subheading`, `body`, `caption`, `code`.
- **Тема** — атрибут `data-theme="light|dark"` на `<html>`; кнопка в панели переключает и запоминает её.

## Отправка на GitHub

```bash
git init
git add .
git commit -m "Стартовый проект на дизайн-системе Claude.code"
git branch -M main
git remote add origin git@github.com:LaubayevIlfat/Claude.code.git
git push -u origin main
```

Чтобы сайт открывался по ссылке: на GitHub → **Settings → Pages → Branch: main / (root) → Save**. Через минуту он будет доступен по адресу `https://laubayevilfat.github.io/Claude.code/`.
