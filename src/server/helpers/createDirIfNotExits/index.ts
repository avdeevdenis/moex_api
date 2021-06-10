import * as fs from 'fs';

/**
 * Проверяет существует ли корневая папка с данными и создаем, если не существует
 */
export const createDirIfNotExits = async (dirPath: string) => {
  let dataDirStat = null;

  try {
    dataDirStat = await fs.statSync(dirPath);
  } catch (e) { }

  if (!dataDirStat || !dataDirStat.isDirectory()) {
    await fs.mkdirSync(dirPath);
  }
}