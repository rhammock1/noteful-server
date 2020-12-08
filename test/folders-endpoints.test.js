const { expect } = require('chai');
const knex = require('knex');
const supertest = require('supertest');
const app = require('../src/app');
const { makeFoldersArray, makeMaliciousFolder } = require('./endpoint.fixtures');

describe('Folders Endpoints', function() {
  let db;

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())
  before('clean the table', () => 
    db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE')
  )
  afterEach('Cleanup', () => 
    db.raw('TRUNCATE noteful_notes, noteful_folders RESTART IDENTITY CASCADE')
  )

  describe('GET /api/folders', () => {
    context('Given there are no folders', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, [])
      })
    })
    context(`Given an XSS attack folder`, () => {
     const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

     beforeEach('insert malicious folder', () => {
       return db
         .into('noteful_folders')
         .insert([maliciousFolder])
     })

     it('removes XSS attack content', () => {
       return supertest(app)
         .get(`/api/folders`)
         .expect(200)
         .expect(res => {
           expect(res.body[0].folder_name).to.eql(expectedFolder.folder_name)
           
         })
     })
    })
    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })
      it('GET /api/folders responds with 200 and all of the folders', () => {
        return supertest(app)
          .get('/api/folders')
          .expect(200, testFolders)
      })
    })
  })

  describe('GET /api/folders/:folderId', () => {
    context('Given there are no folders', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `Article doesn't exist` } })
      })
    })
    context(`Given an XSS attack folder`, () => {
     const { maliciousFolder, expectedFolder } = makeMaliciousFolder();

     beforeEach('insert malicious folder', () => {
       return db
         .into('noteful_folders')
         .insert([maliciousFolder])
     })

     it('removes XSS attack content', () => {
       return supertest(app)
         .get(`/api/folders/${maliciousFolder.id}`)
         .expect(200)
         .expect(res => {
           expect(res.body.folder_name).to.eql(expectedFolder.folder_name)
           
         })
     })
    })
    context('Given there are articels in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })
      it(`GET /api/folders/:folderId responds with 200 and the specified folder`, () =>{
        const folderId = 2;
        const expectedFolder = testFolders[folderId - 1];
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(200, expectedFolder)
      })
    })
  })
})

