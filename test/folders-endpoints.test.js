const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');

describe('Folders Endpoints', function() {
  let db;
  let testFolders = [];
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('clean the table', () => {
    db('noteful_folders', 'notefule_notes').truncate();
  })
  afterEach('Cleanup', () => {
    db('noteful_folders', 'notefule_notes').truncate()
  })

  describe('GET /api/folders', () => {
    context('Given there are no folders', () => {
      it('responds wiht 200 and an empty list', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })
  })
})