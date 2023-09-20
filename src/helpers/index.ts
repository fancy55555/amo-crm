export const isValidPhoneNumber = (phone: string): boolean => {
    const phoneNumberRegex = /^[0-9]{11}$/
    return phoneNumberRegex.test(phone)
}

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
    return emailRegex.test(email)
}
