import { diskStorage } from 'multer';
import { extname, join } from 'node:path';

const uploadsDir = join(__dirname, '..', '..', '..', 'public', 'uploads');

export const diskStorageUploads = diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = extname(file.originalname || '');
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${ext}`);
  },
});
