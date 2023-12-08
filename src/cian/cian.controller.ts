import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger'; // Добавьте импорт Swagger

@ApiTags('cian') // Добавьте теги Swagger
@Controller('cian')
export class CianController {
  constructor() {}
}
