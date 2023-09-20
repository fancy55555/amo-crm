import { Module } from '@nestjs/common'

import { AmoCrmController } from './amo-crm.controller'
import { AmoCrmService } from './amo-crm.service'

@Module({
    controllers: [AmoCrmController],
    providers: [AmoCrmService]
})
export class AmoCrmModule {}
