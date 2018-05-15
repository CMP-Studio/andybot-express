exports.up = async function (knex) {

    return knex.schema.createTable('user', function (table) {
        table.string('fb_page_id').notNullable().unique().index()
        table.string('email').unique().index()
        table.string('name')
        table.json('state').defaultTo('{}')
        table.integer('points').notNullable().defaultTo(0);
        table.timestamp('last_interaction_at').defaultTo(knex.fn.now())
        table.timestamps(false, true)
    }).then(() => Promise.all([

        knex.schema.createTable('trivia', function (table) {
            table.string('fb_page_id').references('fb_page_id').inTable('user')
            table.string('activity_id').notNullable().index()
            table.integer('correct').defaultTo(0)
            table.integer('total').defaultTo(0)
            table.timestamps(false, true)
        }),

        knex.schema.createTable('poll_response', function (table) {
            table.string('fb_page_id').references('fb_page_id').inTable('user')
            table.string('activity_id').notNullable().index()
            table.string('response').notNullable()
            table.integer('question_number').notNullable()
            table.timestamps(false, true)
        }), 

        knex.schema.createTable('achievement', function (table) {
            table.string('fb_page_id').references('fb_page_id').inTable('user')
            table.string('achievement_id').notNullable().index()
            table.integer('progress').notNullable().defaultTo(0);
            table.boolean('seen').notNullable().defaultTo(false)
            table.timestamps(false, true)
        }),

        knex.schema.createTable('stamp', function (table) {
            table.string('fb_page_id').references('fb_page_id').inTable('user')
            table.string('stamp_id').notNullable().index()
            table.integer('count').notNullable().defaultTo(1);
            table.timestamps(false, true)
        })

    ]))

}

exports.down = function (knex) {
    return Promise.all([
        knex.schema.dropTableIfExists('trivia'),
        knex.schema.dropTableIfExists('achievement'),
        knex.schema.dropTableIfExists('poll_response'),
        knex.schema.dropTableIfExists('user'),
        knex.schema.dropTableIfExists('stamp')
    ]);
}
