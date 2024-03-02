import { diskStorage } from 'multer';
import { v4 as uuidv5 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';

const normalizeFileName = (_, file, callback) => {
  const ext = file.originalname.split('.').pop();

  callback(null, `photo-${uuidv5() + '-IMAGE-' + uuidv4()}.${ext}`);
};

export const fileStorage = diskStorage({
  destination: './uploads',
  filename: normalizeFileName,
});
