import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { FileFilter } from './helpers/fileFilter.helper';
import { FileNamer } from './helpers/fileNamer.helper';


@ApiTags('Files')

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService
    ) {}

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
      const secureUrl = `${this.configService.get('HOST_API')}/files/product/${file.filename}`
    return { secureUrl };
  }
}
