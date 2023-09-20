import { createParamDecorator, BadRequestException, ExecutionContext } from '@nestjs/common'

import { isValidEmail, isValidPhoneNumber } from '../../helpers'

// Validation

export const ValidateContactInfo = createParamDecorator((data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    const { query } = request

    if (!query.email || !query.phone) {
        throw new BadRequestException('Incorrect contact data')
    }

    const { email, phone } = query

    if (!isValidPhoneNumber(phone)) {
        throw new BadRequestException('Incorrect phone number')
    }

    if (!isValidEmail(email)) {
        throw new BadRequestException('Invalid email address')
    }

    return { email, phone }
})
