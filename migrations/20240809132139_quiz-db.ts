import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('quiz', table => {
    table.increments('id').unsigned().primary()
    table.text('data', 'longtext') // Using 'text' with 'longtext' type for large strings
    // Example 9999.99
    table.decimal('donate_amount', 4, 2) // Adjust precision and scale as needed
    table.string('eth_address', 40)
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.timestamp('updated_at').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('quiz')
}
