# План: віртуальний скрол + cursor-пагінація для месенджера

## Context

Месенджер зараз не має віртуалізації — кожне повідомлення кожної завантаженої
сторінки лишається живим DOM-вузлом і React-компонентом. Скрол угору роздуває
DOM безмежно («хаває дофіга даних»).

Корінь проблеми — **offset-пагінація** на бекенді (`ORDER BY ... LIMIT/OFFSET`).
Для живого чату це фундаментально зламано: нове повідомлення зсуває всі рядки,
тому сусідні сторінки дають **дублікати** або **діри**; `OFFSET` ще й O(n).

Фронтенд обріс компенсаціями навколо цієї крихкості: `useScroll` тримає 3
`IntersectionObserver` + 2 `scroll`-лістенери, ручний scroll-anchoring через
`querySelectorAll`, ретраї на `requestAnimationFrame`, `flex-col-reverse`,
`startPage` у `queryKey`. Кожен шар латає попередній.

**Мета:** перевести пагінацію на стабільний cursor (keyset) підхід і віддати
скрол, anchoring та обсёрвери бібліотеці `react-virtuoso`. Це стосується трьох
списків з однаковим зламаним патерном: вікна повідомлень, `ChatList`,
`PinnedMessagesList`.

## Підхід (загально)

- **Бекенд:** offset → keyset-курсор. Повідомлення — курсор по `m.id`; чати —
  по `(c."updatedAt", c.id)`; закріплені — по `(m."createdAt", m.id)`.
- **Стрибок до повідомлення:** замість обчислення номера сторінки
  (`getMessagePage`) — ендпойнт `getMessageContext`, що віддає вікно навколо
  повідомлення.
- **Фронтенд:** `react-virtuoso` володіє скрол-контейнером. `flex-col-reverse`
  прибирається, дані рендеряться хронологічно (`[...messages].reverse()`),
  bottom-anchor через `initialTopMostItemIndex`, стабільність позиції при
  довантаженні старіших — через `firstItemIndex`.
- `useScroll.ts` та `useIntersectionObserver.ts` видаляються повністю.

---

## Частина 1. Бекенд — cursor-пагінація

### 1.1 Повідомлення
**`apps/server/src/data/message/sql.ts`**
- Замінити `selectByChatId(chatId, offset, limit)` на cursor-варіант, зберігши
  наявну проєкцію (JOIN-и `reply`, `isPinned`):
  - старіші (`before`): `AND ($2::int IS NULL OR m.id < $2) ORDER BY m.id DESC LIMIT $3`
  - новіші (`after`): `AND m.id > $2 ORDER BY m.id ASC LIMIT $3`
  - фетчити `limit + 1` рядків, щоб знати, чи є ще (зайвий рядок відкинути).
- Замінити `getMessagePage` на `selectMessageContext(chatId, messageId, limit)`
  — вікно: `limit` повідомлень `id <= messageId` (DESC) + `limit` з `id > messageId` (ASC).

**`apps/server/src/data/message/repo.ts`** + **`types.ts`**
- `findByChatId(chatId, { before?, after?, limit })` повертає
  `{ messages: Message[] /* newest-first */, olderCursor: number|null, newerCursor: number|null }`.
  `after`-вибірку розвернути в JS до newest-first.
- `getMessagePage` → `getMessageContext(chatId, messageId, limit)` з тим самим
  shape відповіді.

**`apps/server/src/services/chat/service.ts`** + **`chat/types.ts`**
- `getMessagesByChatId(userId, chatId, { before?, after?, limit })`.
- `getMessagePage` → `getMessageContext(userId, chatId, messageId, limit)`.
- Перевірку `isMember` лишити без змін.

**`apps/server/src/api/chats/api.ts`** + **`chats/schemas.ts`**
- `getMessagesByChatId`: query `page` → опційні `before`/`after` + `limit`
  (прибрати `page` з `required`).
- Маршрут `getMessagePage` → `getMessageContext`.

### 1.2 Список чатів (`ChatList`)
**`apps/server/src/data/chatMember/sql.ts`** — `selectChatsForUser`
- Keyset по `(c."updatedAt", c.id)`:
  `AND ($cursorUpdatedAt::timestamptz IS NULL OR (c."updatedAt", c.id) < ($cursorUpdatedAt, $cursorId))`
  `ORDER BY c."updatedAt" DESC, c.id DESC LIMIT $limit`.
- **`chatMember/repo.ts`**, **`chatMember/types.ts`**, сервіс `list` — параметр
  `cursor?: { updatedAt: string; id: number }` замість `page`; повертати
  `{ chats, nextCursor }`.
- Курсор по змінному ключу `updatedAt` — допустимо: `updateChatsCache`
  (`useChats.ts`) і так прибирає чат зі старої позиції при бампі нагору.

### 1.3 Закріплені (`PinnedMessagesList`)
**`apps/server/src/data/pinnedMessages/sql.ts`** — `selectByChatId`
- Keyset по `(m."createdAt", m.id)`; прибрати `totalCount` (наявність наступної
  сторінки визначається курсором).
- **`pinnedMessages/repo.ts`/`types.ts`**, сервіс `getAllPinnedMessages` —
  `cursor?` замість `page`; повертати `{ data, nextCursor }`.

### 1.4 Міграція БД
- `pnpm migrate:create message_pagination_indexes` → новий файл у
  `apps/server/db/migrations/`:
  - `CREATE INDEX ON "message" ("chatId", id)` — keyset стає O(log n).
  - `CREATE INDEX ON "chats" ("updatedAt", id)`.
  - `down()` дзеркально дропає індекси.
- Запуск (`pnpm migrate:up`) — за рішенням користувача, зачіпає його БД.

---

## Частина 2. API-клієнт

**`apps/client/src/api/chats/chats.ts`** + **`consts.ts`**
- `getMessagesByChatId(chatId, { before?, after?, limit })`.
- `getMessagePage` → `getMessageContext(chatId, messageId, limit)`.
- `getChatList(cursor?, limit)`, `getAllPinnedMessages(chatId, cursor?, limit)`.

**`apps/client/src/api/types.ts`**
- `PageData` → `MessagesPage = { messages: Message[]; olderCursor: number|null; newerCursor: number|null }`.
- Аналогічні `ChatsPage`, `PinnedPage` з `nextCursor`.

---

## Частина 3. Фронтенд-хуки

**`apps/client/src/hooks/useChatMessages.ts`**
- `queryKey: [QueryKeys.messages, chatId, anchorCursor]` — `anchorCursor`
  (`null` штатно, `messageId` після стрибка) **замінює `startPage`**.
- `queryFn`: при `anchorCursor === null` — звичайна cursor-вибірка; інакше
  перша сторінка з `getMessageContext`.
- `getNextPageParam` → `olderCursor`, `getPreviousPageParam` → `newerCursor`.
- `messages` обгорнути в `useMemo`.
- `updateMessageCache`: `add` лишається prepend у `pages[0]`, але **таргетити
  лише запит з `anchorCursor === null`** (не `setQueriesData` по всіх), щоб не
  псувати порядок context-вікна під час стрибка.

**`apps/client/src/hooks/useChats.ts`**, **`usePinnedMessages.ts`**
- Перевести на cursor infinite query; прибрати offset/`totalCount`-арифметику
  в `getNextPageParam` (брати `nextCursor`).

**Новий `apps/client/src/hooks/useMessageList.ts`** (замість `useScroll.ts`)
- `displayMessages = useMemo(() => [...messages].reverse(), [messages])`.
- `firstItemIndex`: рахується детерміновано з даних. Тримати
  `firstItemIndexRef` (старт `START_INDEX = 1_000_000`) і `prevOldestIdRef`;
  коли `displayMessages[0].id` стає меншим за попередній — це довантаження
  старіших: зменшити `firstItemIndex` на кількість елементів, що з'явилися
  перед колишнім найстарішим. Скидати при зміні `chatId`/`anchorCursor`.
- Колбеки: `startReached → fetchNextPage` (старіші), `endReached →
  fetchPreviousPage` (новіші), `atBottomStateChange → setIsAtBottom`.
- `scrollToMessage(id)`: є в `displayMessages` →
  `virtuosoRef.scrollToIndex({ index, align: 'center' })` + `highlightMessage`;
  немає → виставити `anchorCursor = id`, після завантаження context-вікна
  virtuoso стане на нього через `initialTopMostItemIndex`.

---

## Частина 4. Компоненти (`react-virtuoso`)

- Встановити `react-virtuoso`; **видалити `react-window`** з
  `apps/client/package.json` (стоїть, ніде не використовується).

**`apps/client/src/components/MessageWindow.tsx`**
- Прибрати `flex-col-reverse`, обидва сентінел-`<div>`, `bottomRef`.
- Список повідомлень → `<Virtuoso ref={virtuosoRef} data={displayMessages}
  firstItemIndex={firstItemIndex} initialTopMostItemIndex={...}
  startReached={...} endReached={...} followOutput="smooth"
  atBottomStateChange={setIsAtBottom} itemContent={(_, m) => <MessageBlock .../>} />`.

**`apps/client/src/components/ScrollToBottom.tsx`**
- Скрол униз → `virtuosoRef.scrollToIndex({ index: 'LAST' })`.
- Умову показу `startPage > 1` замінити на `anchorCursor !== null`.

**`apps/client/src/components/PinnedMessagesList.tsx`**
- Прибрати `useIntersectionObserver` + `flex-col-reverse`.
- `<Virtuoso data={pinnedMessages} endReached={query.fetchNextPage}
  itemContent={...} />`.

**`apps/client/src/components/ChatList.tsx`**
- Прибрати `useIntersectionObserver`.
- `<Virtuoso data={chats} endReached={query.fetchNextPage}
  itemContent={(_, chat) => <ChatBlock .../>} />`.

---

## Частина 5. Видалення / чистка

| Файл / код | Дія |
|---|---|
| `apps/client/src/hooks/useScroll.ts` | видалити |
| `apps/client/src/hooks/useIntersectionObserver.ts` | видалити |
| `react-window` у `apps/client/package.json` | видалити |
| `startPage`/`setStartPage` у `MessageWindow.tsx` | → `anchorCursor` |
| `SCROLL_CONFIG` (`utils/consts/scroll.ts`) | лишити `HIGHLIGHT_DURATION_MS`; прибрати sentinel-margins, threshold, `JUMP_RESET_DELAY_MS` |
| `getMessagePage` (бек+клієнт+схема) | → `getMessageContext` |
| `page`/`offset` у SQL/репо/сервісах/схемах | → cursor |

---

## Частина 6. Рефактор `useWebSocket`

Поділ «сокети vs fetch» концептуально правильний — рефакторимо *реалізацію*.

**Правило:** сокетами — події, які ініціює інший користувач/сервер (нові/змінені/
видалені повідомлення, реакції, pin/unpin, typing, presence, створення/видалення
чату). Фетчем — дані, які клієнт свідомо вантажить (історія, context-вікно,
списки чатів і закріплених, пошук) + догін після reconnect.

**`apps/client/src/hooks/useWebSocket.ts`**
- Брати `chatId` з `data.payload.chatId`, а не з `currentChatIdRef` — інакше
  повідомлення чужого чату псує кеш відкритого (`new` зараз робить це
  неправильно; `unpinnedMessage` — правильно).
- Винести оновлення кешу в чисті функції / хук `useChatCache`, що приймає лише
  `queryClient`. Прибрати виклики `useChatMessages()`/`useChats()`/
  `usePinnedMessages()` всередині `useWebSocket` (вони запускають зайві query).
- Розділити модуль: (а) з'єднання + роутинг подій (`onmessage`), (б) імперативні
  сендери (`sendMessage`/`updateMessage`/`typing`/...).
- Винести з'єднання на рівень app (провайдер), а не монтувати з `MessageWindow`.
- **Reconnect gap-fill:** після `socket.onopen` (повторного) — фетч повідомлень
  `after=<останній відомий id у кеші>` для кожного активного чату, щоб закрити
  пропуск за час офлайну.

---

## Критичні файли

**Бекенд:** `apps/server/src/data/message/{sql,repo,types}.ts`,
`apps/server/src/data/chatMember/sql.ts`, `apps/server/src/data/pinnedMessages/sql.ts`,
`apps/server/src/services/chat/{service,types}.ts`,
`apps/server/src/api/chats/{api,schemas}.ts`, нова міграція в `apps/server/db/migrations/`.

**Фронтенд:** `apps/client/src/api/{chats/chats,chats/consts,types}.ts`,
`apps/client/src/hooks/{useChatMessages,useChats,usePinnedMessages,useWebSocket}.ts`,
нові `useMessageList.ts` та `useChatCache.ts`,
`apps/client/src/components/{MessageWindow,ScrollToBottom,PinnedMessagesList,ChatList}.tsx`.

**Видаляються:** `apps/client/src/hooks/{useScroll,useIntersectionObserver}.ts`.

## Порядок робіт

1. Бекенд: cursor-SQL → репо → сервіс → API/схеми; міграція з індексами.
2. Перевірити ендпойнти руками (curl/Postman).
3. API-клієнт + типи.
4. Хуки `useChatMessages`/`useChats`/`usePinnedMessages` під курсори.
5. `react-virtuoso` + `useMessageList` + компоненти; видалити старі хуки.

## Верифікація

- **Бекенд:** `pnpm migrate:up`; запит `GET /chats/getMessagesByChatId/:id?limit=30`
  без курсора (найновіші), потім з `before=<olderCursor>` — без дублікатів і дір;
  `getMessageContext` повертає вікно навколо повідомлення.
- **Фронтенд:** `pnpm dev`, у браузері:
  - скрол угору довантажує старіші, позиція не стрибає; DOM не росте безмежно
    (в DevTools Elements — лише видимі вузли повідомлень);
  - нове повідомлення по WS — автоскрол униз, якщо ти внизу;
  - стрибок до повідомлення з пошуку (Ctrl+F) — landing на потрібному
    повідомленні + підсвітка; кнопка «вниз» повертає до live;
  - `ChatList` і `PinnedMessagesList` гортаються, довантаження працює;
  - бамп чату нагору при новому повідомленні не дублює його у списку.
- **Регресії:** редагування/видалення/реакції/pin-unpin повідомлень,
  reply-блок, typing-індикатор.
- `pnpm lint` і `pnpm build` (client + server) без помилок.

## Ризики

- **Контракт API ламається** — фронт і бек мерджити одним PR.
- `firstItemIndex` мусить бути детермінованою функцією від `data` — рахувати з
  `displayMessages`, не тримати окремим лічильником, який можна розсинхронити.
- Курсор чатів по `updatedAt` (змінний ключ) — можливий рідкісний транзитний
  дубль; гаситься `updateChatsCache`, який прибирає чат зі старої позиції.
- WS-`add` під час активного стрибка (`anchorCursor !== null`) не повинен
  потрапляти в context-вікно — таргетити кеш лише запиту `anchorCursor === null`.
