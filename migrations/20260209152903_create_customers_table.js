/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('customers', (table) => {
    // Primary Key
    table.increments('id').primary();

    // Data Columns (Mapped from your CSV fields)
    table.string('customer_id').notNullable(); // 'Customer Id'
    table.string('first_name');                         // 'First Name'
    table.string('last_name');                          // 'Last Name'
    table.string('company');                            // 'Company'
    table.string('city');                               // 'City'
    table.string('country');                            // 'Country'
    table.string('phone_1');                            // 'Phone 1'
    table.string('phone_2');                            // 'Phone 2'
    table.string('email').index();                      // 'Email'
    table.date('subscription_date');                    // 'Subscription Date'
    table.string('website');                            // 'Website'

    // Timestamps for the record creation
    table.timestamps(true, true); 
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('customers');
};