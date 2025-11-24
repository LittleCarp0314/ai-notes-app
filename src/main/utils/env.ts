import { app } from 'electron';

export const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

export const getAppDataPath = (): string => {
  return app.getPath('userData');
};

export const getDocumentsPath = (): string => {
  return app.getPath('documents');
};

export const getTempPath = (): string => {
  return app.getPath('temp');
};