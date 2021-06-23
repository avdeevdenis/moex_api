import { GET_IMAGE_TABLE_FILEPATH, IMAGE_TABLE_DIR } from "../..";
import { createDirIfNotExits } from "../../../../project_helpers/create_dir_if_not_exists";
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
export const createImageTableWithDayChangesData = async (dayChangesData: OneDayChangesData[]) => {
  const htmlTableRows = getHTMLTableRows(dayChangesData);
  const today = getToday().replace(/_/g, '.');
  const htmlTemplate = getHTMLTemplate(htmlTableRows, STATIC_TABLE_ROW_HEIGHT, today);

  const MARGIN = 10;

  /**
   * Первая колонка (тикер) + вторая колонка (значение в процентах) + 10px * 2 - отступы
   */
  const PAGE_WIDTH = 100 + 75 + MARGIN * 2; // first col (name) + 2 col + margin x2

  /**
   * 2 строки - шапка таблицы (день + названия столбцов) + количество колонок * высоту одной колонки + 10px * 2 - отступы
   */
  const PAGE_HEIGHT = (dayChangesData.length + 2) * STATIC_TABLE_ROW_HEIGHT + MARGIN * 2;

  await createDirIfNotExits(IMAGE_TABLE_DIR);

  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      deviceScaleFactor: 1.5,
    });

    await page.setContent(htmlTemplate);

    await page.screenshot({ path: GET_IMAGE_TABLE_FILEPATH() });

    await browser.close();
  } catch (e) {
    // TODO
  }
};