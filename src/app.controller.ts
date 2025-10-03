import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ 
    summary: 'Welcome message',
    description: 'Returns a welcome message from the API'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Welcome message returned successfully',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('getHello')
  @ApiOperation({ 
    summary: 'Welcome message (explicit)',
    description: 'Alternative endpoint that returns a welcome message'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Welcome message returned successfully',
    schema: {
      type: 'string',
      example: 'Hello World!'
    }
  })
  getHelloExplicit(): string {
    return this.appService.getHello();
  }
}
