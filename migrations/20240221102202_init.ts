import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('user', table => {
    table.integer('fid').unsigned().primary()
    // lowercased eth address without 0x
    table.string('main_eth_address', 40).notNullable().unique()

    table.datetime('created_at').notNullable()
    table.datetime('updated_at').notNullable()
  })

  await knex.schema.createTable('content', table => {
    table.integer('item_id').unsigned()
    table.integer('user_fid').unsigned().references('fid').inTable('user')
    table.text('data_type', 'text').notNullable()
    table.text('data_content', 'text').notNullable()
    // max price is 999.9
    table.string('price', 5).notNullable()

    table.datetime('created_at').notNullable()
    table.datetime('updated_at').notNullable()

    table.primary(['item_id', 'user_fid'])
    table.index(['item_id', 'user_fid'], 'idx_item_user')
  })

  await knex.schema.createTable('purchase', table => {
    table.bigIncrements('id').primary().unsigned()
    table.integer('buyer_fid').unsigned().references('fid').inTable('user')
    table.integer('seller_fid').unsigned().references('fid').inTable('user')
    table.integer('item_id').unsigned()
    table.text('tx_id', 'text')

    table.datetime('created_at').notNullable()
    table.datetime('updated_at').notNullable()
  })

  await knex.schema.createTable('invoice', table => {
    table.integer('buyer_fid').unsigned().references('fid').inTable('user')
    table.integer('seller_fid').unsigned().references('fid').inTable('user')
    table.integer('item_id').unsigned()
    table.integer('invoice_id').unsigned().index()

    table.datetime('created_at').notNullable()
    table.datetime('updated_at').notNullable()

    table.primary(['buyer_fid', 'seller_fid', 'item_id'])
    table.index(['buyer_fid', 'seller_fid', 'item_id'], 'idx_item_user')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('content')
  await knex.schema.dropTableIfExists('purchase')
  await knex.schema.dropTableIfExists('invoice')
  await knex.schema.dropTableIfExists('user')
}
