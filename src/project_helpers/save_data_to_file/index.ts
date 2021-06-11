import * as fs from 'fs';

/**
 * Записываем переданные данные в указанный файл и вовзращает Promise<true> в случае успеха или Promise<false> в случае ошибки
 */
export const saveDataToFile = async (fileData: string, filePath: string, errorHandler?: (error: Error) => void) => {
  return new Promise((resolve) => {
    fs.writeFile(filePath, fileData, error => {
      if (error) {
        if (errorHandler) {
          errorHandler(error);
        }

        resolve(false);
      }

      resolve(true);
    });
  });
};