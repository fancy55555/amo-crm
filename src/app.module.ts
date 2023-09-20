import { Module } from '@nestjs/common'

import { ConfigModule } from '@nestjs/config'

import { AppController } from './app.controller'

import { AppService } from './app.service'

import { AmoCrmModule } from './amo-crm/amo-crm.module'

@Module({
    imports: [AmoCrmModule, ConfigModule.forRoot()]
})
export class AppModule {}
