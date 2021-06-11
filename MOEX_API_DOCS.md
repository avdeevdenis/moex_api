## Программный интерфейс к ИСС. Ссылка на документацию.
https://www.moex.com/a2193

---

## Общие запросы

#### Получить доступные торговые системы [engines].
https://iss.moex.com/iss/engines.xml

#### Получить описание и режим работы торговой системы [engine].
https://iss.moex.com/iss/engines/stock.xml

#### Получить список рынков торговой системы [markets].
https://iss.moex.com/iss/engines/stock/markets.xml

#### Получить описание: словарь доступных режимов торгов, описание полей публикуемых таблиц данных и т.д [market].
https://iss.moex.com/iss/engines/stock/markets/shares.xml

#### Получить справочник режимов торгов рынка [boards].
https://iss.moex.com/iss/engines/stock/markets/shares/boards.xml

#### Список сессий доступных в итогах торгов. Только для фондового рынка! [sessions]
https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions.xml

#### Получить доступные торговые системы (здесь вся агреггированная информация выше).
https://iss.moex.com/iss/index.xml

---

## Полезные запросы
#### Промежуточные "Итоги дня". Только для фондового рынка.
https://iss.moex.com/iss/engines/stock/markets/shares/secstats.xml

#### Получить историю по одной бумаге на рынке за интервал дат.
https://iss.moex.com/iss/history/engines/stock/markets/shares/securities/YNDX.xml
https://iss.moex.com/iss/history/engines/stock/markets/shares/sessions/EQBR/securities.xml

---

## Прочее
https://iss.moex.com/iss/engines/stock/markets/shares/securities.xml
https://iss.moex.com/iss/history/engines/stock/totals/securities.xml