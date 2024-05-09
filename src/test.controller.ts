import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('/')
export class TestController {
    @Get('/')
    async test(@Res() res: Response) {
        res.sendFile(join(__dirname, '../../', 'test-pages', 'index.html'));
    }
}
