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

    case 'SPCE':
      return 'Virgin Galactic Holdings Inc';

    case 'AAPL':
      return 'Apple Inc';

    case 'CSCO':
      return 'Cisco Systems Inc';

    case 'T':
      return 'AT&T Inc';

    case 'KO':
      return 'Coca-Cola Co';

    case 'XOM':
      return 'Exxon Mobil Corp';

    case 'VZ':
      return 'Verizon Communications Inc';

    case 'TBIO':
      return 'Тинькофф NASDAQ Biotech';

    case 'TSPX':
      return 'Тинькофф S&P 500';

    case 'TGLD':
      return 'Тинькофф Золото';

    case 'TECH':
      return 'Тинькофф NASDAQ';

    case 'TIPO':
      return 'Тинькофф Индекс IPO';

    case 'TMOS':
      return 'Тинькофф iMOEX';

    case 'TBIO':
      return 'Тинькофф NASDAQ Biotech';

    case 'FXDM':
      return 'FinEx Акций компаний развитых стран без США';

    case 'FXGD':
      return 'FinEx Золото';

    case 'FXTP':
      return 'FinEx Облигации TIPS';

    case 'FXIM':
      return 'FinEx Акции компаний IT-сектора США';

    case 'FXWO':
      return 'FinEx Акции глобального рынка';

    default: return '';
  }
};