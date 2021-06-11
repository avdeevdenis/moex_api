import * as fs from 'fs';

/**
 * Проверяет существует ли файл по пути 'filePath' и создает, если не существует
 */
export const createFileIfNotExists = async (filePath: string, errorHandler?: any) => {
  let isFileExists = null;

  try {
    isFileExists = await fs.existsSync(filePath);
  } catch (error) {
    if (errorHandler) {
      await errorHandler(error);
    }
  }

  if (!isFileExists) {
    await fs.writeFileSync(filePath, '');
  }
};