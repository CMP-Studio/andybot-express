const config = {
    test: {
        client: "sqlite",
        useNullAsDefault: true,
        connection: {
            filename: __dirname + '/db/testdb.sqlite'
        },
        migrations: {
            directory: "./db/migrations",
            tableName: "knex_migrations",
        },
        seeds: {
            directory: "./db/seeds",
        }
    },

    development: {
        client: "pg",
        version: "9.6.6",
        connection: {
            host: process.env.PG_HOST || 'bots.chcahw88vxf8.us-east-2.rds.amazonaws.com',
            port: process.env.PG_PORT || 5432,
            user: process.env.PG_USER || 'studio',
            password: process.env.PG_PASSWORD || 'studioadmin',
            database: process.env.PG_ANDYBOT_DB || 'andybot'
        },
        migrations: {
            directory: "./db/migrations",
            tableName: "knex_migrations",
        },
        seeds: {
            directory: "./db/seeds",
        }
    }
}

module.exports = config[process.env.NODE_ENV] || config['development'];