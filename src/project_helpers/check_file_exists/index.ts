import * as fs from 'fs';

/**
 * Проверяет находится ли файл по заданному пути
 */
export const checkFileExists = async (filePath: string) => {
  return fs.promises.access(filePath, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}