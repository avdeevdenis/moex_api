import { OneDayChangesData } from "../get_one_day_changes_table_data";

/**
 * Шаблон, по которому генерируется PNG-изображение для ответа в телеграме
 */
export const getHTMLTemplate = (tableRows: string, tableRowHeight: number, todayDate: string) => `<body>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
        integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@300;400&display=swap" rel="stylesheet">
    <style>
        body {
            margin: 10px;
        }

        .table {
            width: auto !important;
            font-family: 'Lato', sans-serif;
            font-weight: 300;
            letter-spacing: 1px;
        }

        .table__row,
        .table__th {
            height: ${tableRowHeight}px!important;
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

        .table__text-center {
            text-align: center;
        }

        .table__bold-value {
            font-weight: 400;
        }

        .table__value-green {
            color: darkgreen;
        }

        .table__value-red {
            color: darkred;
        }
    </style>
    <table class="table table-striped table-bordered">
        <thead>
            <th class="table__th table__text-center" scope="col" colspan="2">${todayDate}</th>
            <tr class="table__row">
                <th class="table__th" scope="col" width="100px">TICKER</th>
                <th class="table__th table__text-right" scope="col" width="75px">VALUE</th>
            </tr>
        </thead>
        <tbody>
            ${tableRows}
        </tbody>
    </table>
</body>`;

export const getHTMLTableRow = ({ tickerName, direction, percentageDiff }: OneDayChangesData) => {
    return `<tr class="table__row">
      <td class="table__col">${tickerName}</td>
      <td class="table__col table__text-right ${direction === 'up' ? 'table__value-green' : 'table__value-red'}">${percentageDiff}</td>
  </tr>`;
}

export const getHTMLTableRows = (tableRowsData: OneDayChangesData[]) => {
    return tableRowsData.reduce((result, tableRowItemData) => {
        result += getHTMLTableRow(tableRowItemData);
        return result;
    }, '');
};