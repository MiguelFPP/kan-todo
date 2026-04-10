"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthCheckController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../infra/database/prisma.service");
const s3_service_1 = require("../infra/storage/s3.service");
let HealthCheckController = class HealthCheckController {
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
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
    async checkDb() {
        try {
            await this.prisma.$queryRaw `SELECT 1`;
            return true;
        }
        catch (e) {
            return false;
        }
    }
};
exports.HealthCheckController = HealthCheckController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Check if the API and its dependencies are running' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HealthCheckController.prototype, "check", null);
exports.HealthCheckController = HealthCheckController = __decorate([
    (0, swagger_1.ApiTags)('Health'),
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], HealthCheckController);
//# sourceMappingURL=health-check.controller.js.map