import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { FileFilter } from './helpers/fileFilter.helper';
import { FileNamer } from './helpers/fileNamer.helper';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('product/:imageName')
  findProductImage(
    @Res() res: Response,
    @Param('imageName') imageName:string
    ) {
      const path = this.filesService.getStaticProductImage(imageName)
      
      // res.status(403).json({
      //   ok: false,
      //   path
      // })

      res.sendFile(path)
    }

  @Post('product')
  @UseInterceptors( FileInterceptor ('file',
  {
    fileFilter: FileFilter,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: FileNamer
    })
  }))
  uploadFile(
    @UploadedFile() file: Express.Multer.File
    ) {

      if (!file) {
        throw new BadRequestException('Make sure that file is an image');
      }

      const secureUrl = `${ file.originalname }`
    return { secureUrl };
  }
}
