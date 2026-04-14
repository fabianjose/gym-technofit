import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MachinesService } from './machines.service';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

import { existsSync, mkdirSync } from 'fs';

const storage = (folder: string) => diskStorage({
  destination: (req, file, cb) => {
    const dest = join(__dirname, '..', '..', 'uploads', 'machines', folder);
    if (!existsSync(dest)) {
      mkdirSync(dest, { recursive: true });
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
  }
});

@Controller('api/machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  findAll() {
    return this.machinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.machinesService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() body: any) {
    return this.machinesService.create(body);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.machinesService.update(+id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.machinesService.remove(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', { storage: storage('photos') }))
  uploadPhoto(@Param('id') id: string, @UploadedFile() file: any) {
    const url = `/uploads/machines/photos/${file.filename}`;
    return this.machinesService.updatePhoto(+id, url);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/video')
  @UseInterceptors(FileInterceptor('file', { storage: storage('videos') }))
  uploadVideo(@Param('id') id: string, @UploadedFile() file: any) {
    console.log(`[MachinesController] Recibiendo video para la máquina ${id}. Archivo:`, file ? file.filename : 'Ninguno');
    if (!file) {
      console.error(`[MachinesController] Error: multer no detectó ningún archivo de video.`);
    } else {
      console.log(`[MachinesController] Tamaño del video: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    }
    const url = `/uploads/machines/videos/${file.filename}`;
    return this.machinesService.updateVideo(+id, url);
  }
}
