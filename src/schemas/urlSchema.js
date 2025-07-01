const shortenUrlSchema = {
    body: {
        type: 'object',
        required: ['url'],
        properties: {
            url: { type: 'string', format: 'uri' },
            password: { type: 'string', minLength: 6 },
            expireTime: { type: 'string' }
        }
    },
    response: {
        201: {
            description: 'URL shortened successfully',
            type: 'object',
            properties: {
                message: { type: 'string' },
                short: { type: 'string' },
                urlDetails: { type: 'string' }
            }
        },
        200: {
            description: 'URL already exists',
            type: 'object',
            properties: {
                message: { type: 'string' },
                short: { type: 'string' },
                urlDetails: { type: 'string' }
            }
        }
    }
};

const urlDetailsSchema = {
    params: {
        type: 'object',
        required: ['shortId'],
        properties: {
            shortId: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'URL details',
            type: 'object',
            properties: {
                urlData: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        short: { type: 'string' },
                        urlDetails: { type: 'string' },
                        urlShort: { type: 'string' },
                        urlDestination: { type: 'string' },
                        owner: { type: 'integer' },
                        havePassword: { type: 'boolean' },
                        created_at: { type: 'string', format: 'date-time' },
                        expire: { type: 'boolean' },
                        expire_date: { type: 'string' },
                        clicks: { type: 'integer' },
                        graphClicks: { type: 'array', items: { type: 'object' } },
                        unique_clicks: { type: 'integer' }
                    },
                    required: ['success', 'short', 'urlDetails', 'urlShort', 'urlDestination', 'owner', 'havePassword', 'created_at', 'expire', 'expire_date', 'clicks', 'graphClicks', 'unique_clicks']
                }
            }
        }
    }
}

const unlockUrlSchema = {
    params: {
        type: 'object',
        required: ['shortId'],
        properties: {
            shortId: { type: 'string' }
        }
    },
    body: {
        type: 'object',
        required: ['password'],
        properties: {
            password: { type: 'string' }
        }
    },
    response: {
        200: {
            description: 'URL unlocked',
            type: 'object',
            properties: {
                urlDestination: { type: 'string' }
            }
        }
    }
}

module.exports = { shortenUrlSchema, urlDetailsSchema, unlockUrlSchema };