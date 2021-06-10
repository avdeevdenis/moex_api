import { STOCK_PRICES_TODAY_PATH } from "../save_share_prices/stocks_common_params";

const fs = require('fs');

(async () => {
    const fileData = await fs.readFileSync(STOCK_PRICES_TODAY_PATH, { encoding: 'utf8' });

    let fileDataJSON;

    try {
        fileDataJSON = JSON.parse(fileData);
    } catch (_) { }

    if (!fileData) return;

    console.log(fileDataJSON);
})();
