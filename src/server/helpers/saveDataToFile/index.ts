import * as fs from 'fs';

export const saveDataToFile = async (fileData: string, filePath: string) => {
  return new Promise((resolve) => {
    fs.writeFile(filePath, fileData, error => {
      if (error) {
        console.log(`Error to save file data to file '${filePath}'`);
        resolve(false);
      }

      resolve(true);
    });
  });
};