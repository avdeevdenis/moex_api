import { IAvaliableTickerName } from '../../scripts/save_share_prices/typings';

/**
 * Возвращает полное название компании по тикеру
 */
export const getCompanyNameByTicker = (tickerName: IAvaliableTickerName) => {
  switch (tickerName) {
    case 'YNDX':
      return 'Yandex N.V';

    case 'ALRS':
      return 'Alrosa AO';

    case 'CHMF':
      return 'Severstal AO';

    case 'GAZP':
      return 'Gazprom PAO';

    case 'VTBR':
      return 'Bank VTB PAO';

    case 'MOEX':
      return 'Moskovskaya Birzha OAO';

    case 'NLMK':
      return 'Novolipetsk Steel PAO';

    case 'POLY':
      return 'Polymetal International PLC';

    case 'SBER':
      return 'Sberbank Rossii PAO';

    case 'PHOR':
      return 'PhosAgro ao';

    case 'SPCE-RM':
      return 'Virgin Galactic Holdings Inc';

    case 'AAPL-RM':
      return 'Apple Inc';

    case 'CSCO-RM':
      return 'Cisco Systems Inc';

    case 'T-RM':
      return 'AT&T Inc';

    case 'KO-RM':
      return 'Coca-Cola Co';

    case 'XOM-RM':
      return 'Exxon Mobil Corp';

    case 'VZ-RM':
      return 'Verizon Communications Inc';

    default: return '';
  }
};