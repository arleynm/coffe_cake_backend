import { diskStorage } from 'multer';
import { extname } from 'node:path';

export const diskStorageUploads = diskStorage({
  destination: (_req, _file, cb) => cb(null, 'public/uploads'),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname || '');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});
