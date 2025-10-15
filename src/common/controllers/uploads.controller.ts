import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { FileUploadService } from 'src/common/services/file-upload.service';
import { existsSync } from 'fs';
import { join } from 'path';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Get('certificates/:filename')
  async getCertificateFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'certificates',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Certificate file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('achievements/:filename')
  async getAchievementFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'achievements',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Achievement file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('profiles/:filename')
  async getProfileFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(filename, 'profiles');

    if (!existsSync(filePath)) {
      throw new NotFoundException('Profile file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('restaurants/:filename')
  async getRestaurantFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'restaurants',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Restaurant file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('posts/:filename')
  async getPostFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.fileUploadService.getFilePath(filename, 'posts');

    if (!existsSync(filePath)) {
      throw new NotFoundException('Post file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('products-categories/:filename')
  async getProductCategoryFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'products-categories',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Product category file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('products/:filename')
  async getProductFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(filename, 'products');

    if (!existsSync(filePath)) {
      throw new NotFoundException('Product file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('stories/:filename')
  async getStoryFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(filename, 'stories');

    if (!existsSync(filePath)) {
      throw new NotFoundException('Story file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('body-photos/:filename')
  async getBodyPhotoFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'body-photos',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Body photo file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('exercises/:filename')
  async getExerciseFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(filename, 'exercises');

    if (!existsSync(filePath)) {
      throw new NotFoundException('Exercise file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('exercise-categories/:filename')
  async getExerciseCategoryFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'exercise-categories',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Exercise category file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('meals/:filename')
  async getMealFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.fileUploadService.getFilePath(filename, 'meals');

    if (!existsSync(filePath)) {
      throw new NotFoundException('Meal file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('supplements/:filename')
  async getSupplementFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'supplements',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Supplement file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }
  
  @Get('sponsors/:filename')
  async getSponsorFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(filename, 'sponsors');

    if (!existsSync(filePath)) {
      throw new NotFoundException('Sponsor file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('users/:filename')
  async getUserFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = this.fileUploadService.getFilePath(filename, 'users');

    if (!existsSync(filePath)) {
      throw new NotFoundException('User file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }

  @Get('subscription-plans/:filename')
  async getSubscriptionPlanFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(
      filename,
      'subscription-plans',
    );

    if (!existsSync(filePath)) {
      throw new NotFoundException('Subscription plan file not found');
    }

    return res.sendFile(join(process.cwd(), filePath));
  }
}
