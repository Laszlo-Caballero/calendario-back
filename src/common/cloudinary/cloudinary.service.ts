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
          {
            resource_type: 'auto',
            access_mode: 'public',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error);
            }
            res(result as CloudinaryResponse);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
      console.log(res);
      return [null, res] as [null, CloudinaryResponse];
    } catch (error) {
      return [error, null] as [Error, null];
    }
  }

  async uploadFile(file: Express.Multer.File) {
    try {
      const res = await new Promise<CloudinaryResponse>((res, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            access_mode: 'public',
          },
          (error, result) => {
            if (error || !result) {
              return reject(error);
            }
            res(result as CloudinaryResponse);
          },
        );

        streamifier.createReadStream(file.buffer).pipe(uploadStream);
      });
      console.log(res);
      return [null, res] as [null, CloudinaryResponse];
    } catch (error) {
      return [error, null] as [Error, null];
    }
  }

  async deleteImage(publicId: string) {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return [null, res] as [null, CloudinaryResponse];
    } catch (error) {
      return [error, null] as [Error, null];
    }
  }
}
