import * as fs from 'fs';

/**
 * Проверяет существует ли папка по пути 'dirPath' и создаем, если не существует
 */
export const createDirIfNotExits = async (dirPath: string, errorHandler?: any) => {
  let dataDirStat = null;

  try {
    dataDirStat = await fs.statSync(dirPath);
  } catch (error) {
    if (errorHandler) {
      await errorHandler(error);
    }
  }

  const isDirectoryExists = dataDirStat && dataDirStat.isDirectory();

  if (!isDirectoryExists) {
    await fs.mkdirSync(dirPath);
  }
}