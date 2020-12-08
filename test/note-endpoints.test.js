const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeFoldersArray, makeNotesArray, makeMaliciousNote } = require('./endpoint.fixtures');

describe('Notes Endpoints', function() {
  let db;
  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  // before('clean the table', () => db('noteful_notes').truncate())

  // afterEach('cleanup',() => db('noteful_notes').truncate())
  before('clean the table', () => 
    db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE')
  )
  afterEach('Cleanup', () => 
    db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE')
  )
  describe.only('GET /api/notes', () => {
    context('Given there are no notes', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, [])
      })
    })
    context(`Given an XSS attack note`, () => {
     const { maliciousNote, expectedNote } = makeMaliciousNote();
     const testFolders = makeFoldersArray();
     beforeEach('insert malicious folder', () => {
       return db
        .into('noteful_folders')
        .insert(testFolders)
        .then(() => {
          return db
            .into('noteful_notes')
            .insert([maliciousNote])
        })
         
     })

     it('removes XSS attack content', () => {
       return supertest(app)
         .get(`/api/notes`)
         .expect(200)
         .expect(res => {
           expect(res.body[0].title).to.eql(expectedNote.title)
           expect(res.body[0].content).to.eql(expectedNote.content)
           
         })
     })
    })
    context('Given there are notes in the database', () => {
      const testFolders = makeFoldersArray();
      const testNotes = makeNotesArray();

      beforeEach('insert notes', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
          .then(() => {
            return db
          .into('noteful_notes')
          .insert(testNotes)
          })
      })
      it('GET /api/notes responds with 200 and all of the notes', () => {
        return supertest(app)
          .get('/api/notes')
          .expect(200, testNotes)
      })
    })
  })
})