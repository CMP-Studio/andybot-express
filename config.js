const defaultConfig = {
    google: {
        apiKey: process.env.BOTS_GOOGLE_API_KEY
    },
    scheduleCalendarId: process.env.BOTS_GOOGLE_CALENDAR_ID,
};

const config = {
    development: {
        ...defaultConfig,
    },
    test: {
        ...defaultConfig,
    },
    production: {
	...defaultConfig,
    },
    sam: {
	...defaultConfig,
    }
};

module.exports = config[process.env.NODE_ENV || 'development'];

