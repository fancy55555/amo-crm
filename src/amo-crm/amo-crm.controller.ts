import { Controller, Get, Query } from '@nestjs/common'
import { AmoCrmService } from './amo-crm.service'
import { ValidateContactInfo } from './decorators/validate-contact-info.decorator'

@Controller('amo-crm')
export class AmoCrmController {
    constructor(private readonly amoCrmService: AmoCrmService) {}

    @Get('create-lead')
    async createLead(
        @Query('name') name: string,
        @Query('email') email: string,
        @Query('phone') phone: string,
        @ValidateContactInfo() contactInfo: { email: string; phone: string }
    ) {
        return await this.amoCrmService.createLead(name, email, phone)
    }

    @Get('find-contact')
    async findContact(
        @Query('email') email: string,
        @Query('phone') phone: string,
        @ValidateContactInfo() contactInfo: { email: string; phone: string }
    ) {
        return await this.amoCrmService.findContact(email, phone)
    }

    @Get('update-contact')
    async updateContact(
        @Query('name') name: string,
        @Query('email') email: string,
        @Query('phone') phone: string,
        @ValidateContactInfo() contactInfo: { email: string; phone: string }
    ) {
        return await this.amoCrmService.updateContact(name, email, phone)
    }

    @Get('create-contact')
    async createContact(
        @Query('name') name: string,
        @Query('email') email: string,
        @Query('phone') phone: string,
        @ValidateContactInfo() contactInfo: { email: string; phone: string }
    ) {
        return await this.amoCrmService.createContact(name, email, phone)
    }
}
