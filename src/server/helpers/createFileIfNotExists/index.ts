import * as fs from 'fs';

/**
 * Проверяет существует ли файл и создает, если не существует
 */
export const createFileIfNotExists = async (filePath: string) => {
  let isFileExists = null;

  try {
    isFileExists = await fs.existsSync(filePath);
  } catch (e) { }

  if (!isFileExists) {
    await fs.writeFileSync(filePath, '');
  }
};