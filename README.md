# SplitUp Frontend - Admin Panel

Админ-панель для управления категориями сервисов и тарифами в системе SplitUp.

## Технологии

- **Vue.js 3** - прогрессивный JavaScript фреймворк
- **TypeScript** - типизированный JavaScript
- **PrimeVue** - UI библиотека компонентов
- **Vite** - быстрый сборщик проектов
- **Pinia** - state management
- **Vue Router** - роутинг
- **Axios** - HTTP клиент

## Установка

```bash
# Установить зависимости
npm install
```

## Запуск

```bash
# Запустить dev сервер (по умолчанию http://localhost:5173)
npm run dev

# Собрать для production
npm run build

# Preview production сборки
npm run preview
```

## Конфигурация

Создайте файл `.env` в корне проекта:

```env
VITE_API_URL=http://localhost:8080/api
```

## Структура проекта

```
src/
├── assets/          # Статические файлы
├── components/      # Переиспользуемые компоненты
├── router/          # Конфигурация роутера
├── services/        # API сервисы
│   └── api.ts       # HTTP клиент и API методы
├── types/           # TypeScript типы
│   └── index.ts     # Интерфейсы данных
├── views/           # Страницы приложения
│   ├── CategoriesView.vue  # Управление категориями
│   └── PlansView.vue       # Управление тарифами
├── App.vue          # Главный компонент
└── main.ts          # Точка входа
```

## Функционал

### Управление категориями (`/categories`)

- Просмотр списка категорий сервисов
- Создание новой категории
- Редактирование существующей категории
- Удаление категории

### Управление тарифами (`/plans`)

- Просмотр списка тарифов
- Создание нового тарифа
- Редактирование существующего тарифа
- Удаление тарифа
- Указание сервиса для тарифа
- Настройка цены, скидки, количества участников
- Добавление особенностей тарифа
- Отметка популярных тарифов

## API Endpoints

Backend должен предоставлять следующие эндпоинты:

### Категории
- `GET /api/categories` - Список всех категорий
- `GET /api/categories/:id` - Получить категорию по ID
- `POST /api/categories` - Создать категорию
- `PUT /api/categories/:id` - Обновить категорию
- `DELETE /api/categories/:id` - Удалить категорию

### Сервисы
- `GET /api/services` - Список всех сервисов
- `GET /api/services/:id` - Получить сервис по ID
- `POST /api/services` - Создать сервис
- `PUT /api/services/:id` - Обновить сервис
- `DELETE /api/services/:id` - Удалить сервис

### Тарифы
- `GET /api/plans` - Список всех тарифов
- `GET /api/plans/:id` - Получить тариф по ID
- `GET /api/services/:serviceId/plans` - Тарифы для сервиса
- `POST /api/plans` - Создать тариф
- `PUT /api/plans/:id` - Обновить тариф
- `DELETE /api/plans/:id` - Удалить тариф

## Требования

- Node.js 18+ (рекомендуется 20+)
- npm 9+

**Примечание:** В проекте используются последние версии Vite и Vue, которые требуют Node.js 20+. Если у вас Node.js 18, возможны предупреждения, но проект должен работать.

## IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (отключите Vetur если установлен).
