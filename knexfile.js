require('dotenv').config();

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
            host: process.env.PG_HOST,
            port: process.env.PG_PORT || 5432,
            user: process.env.PG_USER,
            password: process.env.PG_PASSWORD,
            database: process.env.PG_ANDYBOT_DB
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