import { GET_IMAGE_TABLE_FILEPATH, IMAGE_TABLE_DIR } from "../..";
import { createDirIfNotExits } from "../../../../project_helpers/create_dir_if_not_exists";
import { debug_log } from "../../../../project_helpers/debug_log";
import { GET_CHECK_ONE_DAY_DIFF_LOG_PATH } from "../../../save_share_prices/common_params";
import { getToday } from "../../../save_share_prices/helpers/get_stock_prices_today_filename";
import { getHTMLTableRows, getHTMLTemplate } from "../get_html_template";
import { OneDayChangesData } from "../get_one_day_changes_table_data";

const puppeteer = require('puppeteer');

/**
 * Статическое значение высоты строки таблицы, в зависимости от которого:
 *
 * 1. Вычисляется размер скриншота таблицы
 * 2. Напрямую передается в HTML-шаблон
 */
const STATIC_TABLE_ROW_HEIGHT = 43;

/**
 * Генерирует PNG-изображение, на котором изображены ТОП ценных бумаг, котировки которых отклонились (в обе стороны) максимально
 */
export const createImageTableWithDayChangesData = async ({
  tickersDataWithHighestGrowthRate,
  tickersDataWithHighestNegativeGrowthRate,
}: {
  tickersDataWithHighestGrowthRate: OneDayChangesData[],
  tickersDataWithHighestNegativeGrowthRate: OneDayChangesData[],
}) => {
  const htmlPositiveTableRows = getHTMLTableRows(tickersDataWithHighestGrowthRate);
  const htmlNegativeTableRows = getHTMLTableRows(tickersDataWithHighestNegativeGrowthRate);

  const todayDate = getToday().replace(/_/g, '.');
  const htmlTemplate = getHTMLTemplate({
    positiveTableRows: htmlPositiveTableRows,
    negativeTableRows: htmlNegativeTableRows,
    todayDate,
    tableRowHeight: STATIC_TABLE_ROW_HEIGHT
  });

  const MARGIN = 10;

  /**
   * (Первая колонка (тикер) + вторая колонка (значение в процентах)) * 2 + 10px * 2 - отступы
   */
  const PAGE_WIDTH = (100 + 75) * 2 + MARGIN * 2; // first col (name) + 2 col + margin x2

  const maxTableLength = Math.max(tickersDataWithHighestGrowthRate.length, tickersDataWithHighestNegativeGrowthRate.length);

  /**
   * 2 строки - шапка таблицы (день + названия столбцов) + количество колонок * высоту одной колонки + 10px * 2 - отступы
   */
  const PAGE_HEIGHT = (maxTableLength + 2) * STATIC_TABLE_ROW_HEIGHT + MARGIN * 2;

  await createDirIfNotExits(IMAGE_TABLE_DIR);

  await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer start.');

  try {
    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer launch (1).');

    const browser = await puppeteer.launch();

    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer new page (2).');

    const page = await browser.newPage();

    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer setViewport (3).');

    await page.setViewport({
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      deviceScaleFactor: 1.5,
    });

    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer setContent html (4).');

    await page.setContent(htmlTemplate);

    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer screenshot (5).');

    await page.screenshot({ path: GET_IMAGE_TABLE_FILEPATH() });

    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer browser close (6).');

    await browser.close();

    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer end.');
  } catch (error) {
    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff] createImageTableWithDayChangesData puppeteer error.' + error.message, {
      isError: true,
    });
  }
};