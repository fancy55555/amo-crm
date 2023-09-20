import { Injectable } from '@nestjs/common'

import axios from 'axios'

import * as fs from 'fs/promises'

@Injectable()
export class AmoCrmService {
    private readonly tokenFile = 'tokens.txt'

    private readonly apiUri: string
    private readonly redirectUri: string
    private readonly clientId: string
    private readonly clientSecret: string
    private readonly code: string
    private readonly subdomain: string

    private readonly responsibleUserId: number
    private readonly pipelineId: number
    private readonly statusId: number

    private accessToken: string = ''

    constructor() {
        this.redirectUri = process.env.AMOCRM_REDIRECT_URI
        this.apiUri = process.env.AMOCRM_API_URI
        this.code = process.env.AMOCRM_CODE
        this.clientId = process.env.AMOCRM_CLIENT_ID
        this.clientSecret = process.env.AMOCRM_CLIENT_SECRET
        this.subdomain = process.env.AMOCRM_SUBDOMAIN

        this.responsibleUserId = Number(process.env.RESPONSIBLE_USER_ID)
        this.pipelineId = Number(process.env.PIPELINE_ID)
        this.statusId = Number(process.env.STATUS_ID)

        this.loadAccessToken()
    }

    // Uploading a token or getting it from the server

    async loadAccessToken() {
        try {
            const tokenData = await fs.readFile(this.tokenFile, 'utf8')
            const { access_token } = JSON.parse(tokenData)

            this.accessToken = access_token
        } catch (error) {
            if (error.code === 'ENOENT') {
                const tokenInfo = await this.authorizeAmoCRM()
                this.accessToken = tokenInfo.access_token
                await fs.writeFile(this.tokenFile, JSON.stringify(tokenInfo))
            } else {
                console.error(`Error loading the token: ${error.message}`)
            }
        }
    }

    // Getting a token from the server

    async authorizeAmoCRM() {
        const link = `https://${this.subdomain}.amocrm.ru/oauth2/access_token`

        const data = {
            client_id: this.clientId,
            client_secret: this.clientSecret,
            grant_type: 'authorization_code',
            code: this.code,
            redirect_uri: this.redirectUri
        }

        try {
            const response = await axios.post(link, data)
            return response.data
        } catch (error) {
            return `Error authorizing with AmoCRM: ${error}`
        }
    }

    // Contact Search

    async findContact(email: string, phone: string) {
        try {
            const queries = [phone, email]
            let foundContact = null

            for (const query of queries) {
                const response = await axios.get(`${this.apiUri}/contacts?query=${query}`, {
                    headers: {
                        Authorization: `Bearer ${this.accessToken}`
                    }
                })

                if (
                    response.data &&
                    response.data._embedded &&
                    response.data._embedded.contacts.length > 0
                ) {
                    foundContact = response.data
                    break
                }
            }

            return foundContact
        } catch (error) {
            return `Error finding contact: ${error}`
        }
    }

    // Updating a contact

    async updateContact(name: string, email: string, phone: string) {
        const contactsData = await this.findContact(email, phone)

        const contact = contactsData._embedded.contacts[0]

        let id = null

        if (contact) {
            id = contact.id
        } else {
            return
        }

        try {
            const data = {
                name,
                custom_fields_values: [
                    {
                        field_code: 'EMAIL',
                        values: [
                            {
                                enum_code: 'WORK',
                                value: email
                            }
                        ]
                    },
                    {
                        field_code: 'PHONE',
                        values: [
                            {
                                enum_code: 'WORK',
                                value: phone
                            }
                        ]
                    }
                ]
            }

            const response = await axios.patch(`${this.apiUri}/contacts/${id}`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`
                }
            })

            return response.data
        } catch (error) {
            return `Error updating contact: ${error}`
        }
    }

    // Creating a contact

    async createContact(name: string, email: string, phone: string) {
        try {
            const responseData = await this.findContact(email, phone)

            if (responseData && responseData._embedded.contacts[0]) {
                return 'Error creating contact: This contact already exists'
            }

            const data = [
                {
                    name,
                    custom_fields_values: [
                        {
                            field_code: 'EMAIL',
                            values: [
                                {
                                    enum_code: 'WORK',
                                    value: email
                                }
                            ]
                        },
                        {
                            field_code: 'PHONE',
                            values: [
                                {
                                    enum_code: 'WORK',
                                    value: phone
                                }
                            ]
                        }
                    ]
                }
            ]

            const response = await axios.post(`${this.apiUri}/contacts`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`
                }
            })

            return response.data
        } catch (error) {
            return `Error creating contact: ${error}`
        }
    }

    // Creating a lead

    async createLead(name: string, email: string, phone: string) {
        try {
            const responseData = await this.findContact(email, phone)

            let contactsData = null
            let id = null

            if (responseData) {
                id = responseData._embedded.contacts[0].id

                contactsData = await this.updateContact(name, email, phone)
            }

            if (!contactsData) {
                contactsData = await this.createContact(name, email, phone)

                id = contactsData._embedded.contacts[0].id
            }

            const data = [
                {
                    name: `Lead`,
                    price: 0,
                    responsible_user_id: this.responsibleUserId,
                    pipeline_id: this.pipelineId,
                    status_id: this.statusId,
                    _embedded: {
                        contacts: [
                            {
                                id
                            }
                        ]
                    }
                }
            ]

            const response = await axios.post(`${this.apiUri}/leads`, data, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`
                }
            })

            return response.data
        } catch (error) {
            console.log(error.response.data['validation-errors'][0].errors)
            return `Error creating lead: ${error}`
        }
    }
}
