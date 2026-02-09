// knexfile.js
module.exports = {
  development: {
    client: 'postgresql',
    connection: {
      host: '127.0.0.1',
      user: 'postgres',
      password: 'postgres',
      database: 'mydb',
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations'
    }
  }
};