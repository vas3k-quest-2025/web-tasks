# Vas3k Quest 25 Web Tasks

Этот проект содержит веб-задания для Vas3k Quest 25, развернутые на Cloudflare Pages.

## Структура проекта

- `/public` - статические файлы
- `/src` - исходный код бэкенда
  - `index.js` - основной файл с логикой проверки заданий

## Локальная разработка

1. Установите зависимости:
```bash
npm install
```

2. Запустите локальный сервер разработки:
```bash
npm run dev
```

## Деплой

Проект автоматически деплоится при пуше в ветку `main` через Cloudflare Pages.

Для настройки деплоя:

1. Создайте репозиторий на GitHub
2. В панели управления Cloudflare Pages:
   - Создайте новый проект
   - Подключите ваш GitHub репозиторий
   - Настройте следующие параметры сборки:
     - Build command: `npm install`
     - Build output directory: `public`
     - Root directory: `/`
     - Node.js version: 18 (или новее)

## API

### Проверка заданий

POST `/check/:taskName`
Тело — raw json, см реализацию

Ответ (JSON):
```json
{
  "success": true/false,
  "message": "Сообщение о результате"
}
``` 