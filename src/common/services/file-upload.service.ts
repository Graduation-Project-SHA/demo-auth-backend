import { Injectable, BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = 'uploads';
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedImageTypes = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.webp',
  ];
  private readonly allowedCertificateTypes = ['.jpg', '.jpeg', '.png', '.pdf']; // Certificates can be images or PDFs

  constructor(private readonly configService: ConfigService) {
    this.ensureUploadDirectoryExists();
  }

  private ensureUploadDirectoryExists() {
    const paths = [
      this.uploadPath,
      join(this.uploadPath, 'certificates'),
      join(this.uploadPath, 'achievements'),
      join(this.uploadPath, 'profiles'),
      join(this.uploadPath, 'restaurants'), // For restaurant logos
      join(this.uploadPath, 'posts'), // For post images
      join(this.uploadPath, 'products'), // For product images
      join(this.uploadPath, 'stories'), // For story media
      join(this.uploadPath, 'body-photos'), // For body progress photos
      join(this.uploadPath, 'exercises'), // For exercise images
      join(this.uploadPath, 'exercise-categories'), // For exercise category images
      join(this.uploadPath, 'meals'), // For meal images
      join(this.uploadPath, 'supplements'), // For supplement images
      join(this.uploadPath, 'products-categories'), // For product category images
      join(this.uploadPath, 'users'), // For user-related files
    ];

    paths.forEach((path) => {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
    });
  }

  // General multer config
  getMulterConfig(
    subfolder: string = '',
    fileType: 'image' | 'certificate' = 'image',
  ) {
    const allowedTypes =
      fileType === 'certificate'
        ? this.allowedCertificateTypes
        : this.allowedImageTypes;

    return {
      storage: diskStorage({
        destination: (req, file, callback) => {
          const uploadPath = subfolder
            ? join(this.uploadPath, subfolder)
            : this.uploadPath;
          callback(null, uploadPath);
        },
        filename: (req, file, callback) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname)}`;
          callback(null, uniqueName);
        },
      }),
      fileFilter: (req, file, callback) => {
        const fileExt = extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(fileExt)) {
          callback(null, true);
        } else {
          const errorMsg =
            fileType === 'certificate'
              ? `Only image files and PDFs are allowed for certificates: ${allowedTypes.join(', ')}`
              : `Only image files are allowed: ${allowedTypes.join(', ')}`;
          callback(new BadRequestException(errorMsg), false);
        }
      },
      limits: {
        fileSize: this.maxFileSize,
      },
    };
  }

  // Specific config for certificates (allows PDF + images)
  getCertificateUploadConfig() {
    return this.getMulterConfig('certificates', 'certificate');
  }

  // Specific config for achievements (images only)
  getAchievementUploadConfig() {
    return this.getMulterConfig('achievements', 'image');
  }

  // Specific config for profile images
  getProfileImageUploadConfig() {
    return this.getMulterConfig('profiles', 'image');
  }

  // Specific config for restaurant logos
  getRestaurantLogoUploadConfig() {
    return this.getMulterConfig('restaurants', 'image');
  }

  // Specific config for post images
  getPostImageUploadConfig() {
    return this.getMulterConfig('posts', 'image');
  }

  // Specific config for story media
  getStoryMediaUploadConfig() {
    return this.getMulterConfig('stories', 'image');
  }

  // Specific config for body progress photos
  getBodyPhotosUploadConfig() {
    return this.getMulterConfig('body-photos', 'image');
  }

  // Specific config for exercises
  getExerciseImageUploadConfig() {
    return this.getMulterConfig('exercises', 'image');
  }

  // Specific config for meals
  getMealImageUploadConfig() {
    return this.getMulterConfig('meals', 'image');
  }

  // Specific config for supplements
  getSupplementImageUploadConfig() {
    return this.getMulterConfig('supplements', 'image');
  }

  // Specific config for product categories
  getProductCategoryImageUploadConfig() {
    return this.getMulterConfig('products-categories', 'image');
  }

  // Upload file and return URL
  async uploadFile(
    file: Express.Multer.File,
    subfolder: string,
  ): Promise<string> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const fileExt = extname(file.originalname).toLowerCase();
    if (!this.allowedImageTypes.includes(fileExt)) {
      throw new BadRequestException(
        `Only image files are allowed: ${this.allowedImageTypes.join(', ')}`,
      );
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size too large. Maximum size is ${this.maxFileSize / (1024 * 1024)}MB`,
      );
    }

    const filename = `${uuidv4()}${extname(file.originalname)}`;
    const uploadPath = join(this.uploadPath, subfolder);

    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = join(uploadPath, filename);

    // Write file
    fs.writeFileSync(filePath, file.buffer);

    return this.getFileUrl(filename, subfolder);
  }

  getFileUrl(filename: string, subfolder: string = ''): string {
    const baseUrl =  this.configService.get<string>('BASE_URL') || 'http://localhost:3000';
    const filePath = subfolder
      ? `uploads/${subfolder}/${filename}`
      : `uploads/${filename}`;
    return `${baseUrl}/${filePath}`;
  }

  getFilePath(filename: string, subfolder: string = ''): string {
    return subfolder
      ? join(this.uploadPath, subfolder, filename)
      : join(this.uploadPath, filename);
  }

  deleteFile(filename: string, subfolder: string = ''): boolean {
    try {
      const filePath = subfolder
        ? join(this.uploadPath, subfolder, filename)
        : join(this.uploadPath, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  extractFilenameFromUrl(url: string): string | null {
    try {
      const urlParts = url.split('/');
      return urlParts[urlParts.length - 1];
    } catch {
      return null;
    }
  }
}
