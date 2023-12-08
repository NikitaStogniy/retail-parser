import { Module } from '@nestjs/common';
import { CianService } from '../cian/cian.service';
import { DemandController } from './demand.controller';
import { DemandService } from './demand.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { UserModule } from '../user/user.module';
import { UserService } from 'src/user/user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { ScraperListObject } from 'src/cian/parsers/list.service';
import { ScraperPageObject } from 'src/cian/parsers/page.service';

@Module({
  imports: [SequelizeModule, UserModule],
  controllers: [DemandController],
  providers: [
    ScraperListObject,
    ScraperPageObject,
    CianService,
    DemandService,
    SequelizeService,
    UserService,
    AuthGuard,
  ],
})
export class DemandModule {}
