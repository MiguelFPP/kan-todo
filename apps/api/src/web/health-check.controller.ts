import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../infra/database/prisma.service';
import { S3Service } from '../infra/storage/s3.service';

@ApiTags('Health')
@Controller('health')
export class HealthCheckController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Check if the API and its dependencies are running' })
  async check() {
    const dbStatus = await this.checkDb();
    const s3Status = await this.s3.checkConnection();

    return {
      status: dbStatus && s3Status ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus ? 'connected' : 'disconnected',
        storage: s3Status ? 'connected' : 'disconnected',
      },
    };
  }

  private async checkDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (e) {
      return false;
    }
  }
}
