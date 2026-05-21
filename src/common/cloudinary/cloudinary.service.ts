import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary.response';
import { v2 as cloudinary } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  async uploadImage(file: Express.Multer.File) {
    try {
      const res = await new Promise<CloudinaryResponse>((res, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (error || !result) {
              return reject(error);
            }
            res(result as CloudinaryResponse);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });

      return [null, res] as [null, CloudinaryResponse];
    } catch (error) {
      return [error, null] as [Error, null];
    }
  }
}
