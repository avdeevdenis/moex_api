require('../../project_helpers/telegram_bot_deps');
require('../../project_helpers/dotenv');

import * as fs from 'fs';

import { sendTelegramPhoto } from '../../project_helpers/send_telegram_photo';
import { debug_log } from '../../project_helpers/debug_log';
import { getOneDayDiff, getOneMonthDiff, getOneWeekDiff, getOneYearDiff, getSixMonthesDiff, getThreeYearsDiff } from '../one_day_compare_stocks';
import { getStockPricesTodayFileName, getToday } from '../../project_helpers/get_stock_prices_today_filename';

const puppeteer = require('puppeteer');

/**
 * Путь, куда пишутся логи работы скрипта
 */
export const EXECUTION_LOG_FILEPATH = './src/logs/save_stocks_picture_and_send_telegram.txt';

/**
 * Путь, куда сохраняется картинка с таблицей результатов
 */
export const GET_PICTURE_TABLE_FILEPATH = (market, period) => {
  const filePath = getStockPricesTodayFileName({ pathStart: './src/raw_data/save_stocks_picture_and_send_telegram', extension: 'png', pathEnd: `_${market}_${period}` });

  return filePath;
};

export type StocksDataInput = {
  /**
   * Рынок зарубежных или Российский или фондовый
   */
  market: 'FOREIGN' | 'RUS' | 'FUNDS';

  /**
   * Период, информацию за который необходимо получить
   */
  period: 'DAY' | 'WEEK' | 'MONTH' | 'SIX_MONTHES' | 'YEAR' | 'THREE_YEARS';
};

/**
 * Возвращает diff в акциях, учитывая указанный период и рынок
 */
export const getRequiredDiff = async (market: StocksDataInput['market'], period: StocksDataInput['period']) => {
  let requiredDiff;

  const oneDayDiff = await getOneDayDiff(market);

  if (period === 'DAY') {
    requiredDiff = oneDayDiff;
  }

  if (period === 'WEEK') {
    requiredDiff = await getOneWeekDiff(oneDayDiff, market);
  }

  if (period === 'MONTH') {
    requiredDiff = await getOneMonthDiff(oneDayDiff, market);
  }

  if (period === 'SIX_MONTHES') {
    requiredDiff = await getSixMonthesDiff(oneDayDiff, market);
  }

  if (period === 'YEAR') {
    requiredDiff = await getOneYearDiff(oneDayDiff, market);
  }

  if (period === 'THREE_YEARS') {
    requiredDiff = await getThreeYearsDiff(oneDayDiff, market);
  }

  return requiredDiff;
};

export default async (options: StocksDataInput) => {
  const { market = 'RUS', period = 'DAY' } = options;

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] Start.', {
    isFirstLogMessage: true,
    data: options,
  });

  const requiredDiff = await getRequiredDiff(market, period);
  if (!requiredDiff) return;

  const htmlTemplate = await getHTMLTemplate(requiredDiff);

  await createTemplarePicture({
    htmlTemplate,
    count: requiredDiff.length,
    market,
    period,
  });

  const imageStream = fs.createReadStream(GET_PICTURE_TABLE_FILEPATH(market, period));

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] sendTelegramPhoto start.', {
    data: requiredDiff,
  });

  let periodString = '';

  if (period === 'DAY') {
    periodString = `today *${getToday()}*`;
  } else {
    periodString = `- a *${period}* ago`;
  }

  const caption = `🎭 Changes for *${market}* ${periodString}.`;

  await sendTelegramPhoto(imageStream, {
    caption,
    parse_mode: 'Markdown',
    onSendError: async (sendError) => {
      await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] sendTelegramPhoto sendError.', {
        isError: true,
        data: sendError.message,
      });
    }
  });

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] End.');
};

export const ROW_HEIGHT = 41;

export const createTemplarePicture = async ({ htmlTemplate, count, market, period }) => {
  const browser = await puppeteer.launch();

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] createTemplarePicture puppeteer new page (2).');

  const page = await browser.newPage();

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] createTemplarePicture puppeteer setViewport (3).');

  const PAGE_WIDTH = 320 + 45 * 2;

  const MARGIN = 10;
  const ROWS_COUNT = count + 2; // header + total

  const PAGE_HEIGHT = ROWS_COUNT * ROW_HEIGHT + (2 * MARGIN) - 4; // Хз откуда 4 пикселя

  await page.setViewport({
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    deviceScaleFactor: 1.5,
  });

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] createTemplarePicture puppeteer setContent html (4).');

  await page.setContent(htmlTemplate);

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] createTemplarePicture puppeteer screenshot (5).');

  await page.screenshot({ path: GET_PICTURE_TABLE_FILEPATH(market, period) });

  await debug_log(EXECUTION_LOG_FILEPATH, '[save_stocks_picture_and_send_telegram] createTemplarePicture puppeteer browser close (6).');

  await browser.close();
};

const getRows = (oneDayDiff) => {
  const toRounded = (number, period = 3) => {
    return +number.toFixed(period);
  };

  const totalOpenSum = oneDayDiff.reduce((sum, diff) => sum + diff.OPEN, 0);
  const totalLastSum = oneDayDiff.reduce((sum, diff) => sum + diff.LAST, 0);

  let totalPercentageSum = totalLastSum * 100 / totalOpenSum - 100;
  totalPercentageSum = toRounded(totalPercentageSum, 2);

  const totalPercentageSumTrand = totalPercentageSum >= 0;

  const totalPercentageSumString = totalPercentageSumTrand ? ('+' + totalPercentageSum) : totalPercentageSum;
  const totalPercentageSumColor = totalPercentageSumTrand ? 'table__color-green' : 'table__color-red';

  let rows = oneDayDiff.map(({ SECID, LAST, OPEN, _PERCENTAGE_DIFF }) => {
    let tr = '<tr class="table__row">';

    let percentageString = _PERCENTAGE_DIFF;

    if (_PERCENTAGE_DIFF > 0) {
      percentageString = '+' + percentageString;
    }

    const openRounded = toRounded(OPEN)
    const lastRounded = toRounded(LAST);

    const trend = _PERCENTAGE_DIFF >= 0;

    const colorClass = trend ? 'table__color-green' : 'table__color-red';

    tr += `<td class="table__td" scope="col">${SECID}</td>`
    tr += `<td class="table__td" scope="col">${openRounded}</td>`
    tr += `<td class="table__td" scope="col">${lastRounded}</td>`
    tr += `<td class="table__td table__bold-value ${colorClass}" scope="col">${percentageString}%</td>`

    tr += '</tr>';

    return tr;
  }).join('');

  rows += `
  <tr class="table__row">
    <td class="table__td table__bold-value" colSpan="3" scope="col">Total sum</td>
    <td class="table__td table__bold-value ${totalPercentageSumColor}" scope="col">${totalPercentageSumString}%</td>
  </tr>`;

  return rows;
};

const getBody = (oneDayDiff) => {
  const rows = getRows(oneDayDiff);

  /**
   * ❗ Важно, содержимое из head отправляется сюда для корректного отображение шрифтов
   */
  const body = `
  <body>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 10px 45px;
        }

        .table {
            width: auto !important;
            font-family: 'Lato', sans-serif;
            font-weight: 300;
            letter-spacing: 1px;
        }

        .table__tr,
        .table__td {
          height: ${ROW_HEIGHT}px!important;
          vertical-align: middle!important;
        }

        .table__th {
            font-weight: 400;
        }

        .table__col,
        .table__th {
            vertical-align: middle !important;
        }

        .table__text-right {
            text-align: right;
        }

        .table__td:not(:first-child) {
          text-align: right;
        }

        .table__bold-value {
            font-weight: 400;
        }

        .table__color-green {
            color: darkgreen;
        }

        .table__color-red {
            color: darkred;
        }
    </style>
    <table class="table table-striped table-bordered">
        <thead>
            <tr class="table__row">
                <th class="table__th" scope="col" width="90px">TICKER</th>
                <th class="table__th table__text-right" scope="col" width="75px">OPEN</th>
                <th class="table__th table__text-right" scope="col" width="75px">LAST</th>
                <th class="table__th table__text-right" scope="col" width="75px">DIFF</th>
            </tr>
        </thead>
        <tbody>
        ${rows}
        </tbody>
    </table>
  </body>`;

  return body;
};

export const getHTMLTemplate = (oneDayDiff) => {
  const body = getBody(oneDayDiff);

  return body;
};