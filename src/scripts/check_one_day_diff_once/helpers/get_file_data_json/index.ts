import * as fs from 'fs';
import { debug_log } from '../../../../project_helpers/debug_log';
import { GET_CHECK_ONE_DAY_DIFF_LOG_PATH, GET_STOCK_PRICES_TODAY_PATH } from '../../../save_share_prices/common_params';

export const getFileDataJSON = async () => {
  let fileData;

  try {
    fileData = await fs.readFileSync(GET_STOCK_PRICES_TODAY_PATH(), { encoding: 'utf8' });
  } catch (error) {
    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff ] getFileDataJSON readFileSync error.' + error.message, {
      isError: true
    });
  }

  let fileDataJSON;

  try {
    fileDataJSON = JSON.parse(fileData);
  } catch (error) {
    await debug_log(GET_CHECK_ONE_DAY_DIFF_LOG_PATH(), '[check_one_day_diff ] getFileDataJSON JSON.parse error.' + error.message, {
      isError: true
    });
  }

  return fileDataJSON;
}