const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: 'postgres',
    database: 'mydb',
  },
  pool: { min: 2, max: 10 }
});

module.exports = knex;
