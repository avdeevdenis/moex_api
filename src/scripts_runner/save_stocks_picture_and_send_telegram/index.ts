import save_stocks_picture_and_send_telegram from '../../scripts/save_stocks_picture_and_send_telegram';

(async () => {
    await save_stocks_picture_and_send_telegram({
        market: 'RUS',
        period: 'WEEK',
    });
})();

