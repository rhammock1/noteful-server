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
      connection: process.env.TEST_DATABASE_URL,
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
  describe('POST /api/folders', () => {
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
    it('Creates an folders, responding with 201 and the new folders', () => {
      const newFolder = {
        folder_name: 'New Folder'
      }
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(201)
        .expect(res => {
          expect(res.body.folder_name).to.eql(newFolder.folder_name)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/api/folders/${res.body.id}`)
        })
        .then(postRes => 
          supertest(app)
            .get(`/api/folders/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })
    it('responds with 400 and an error message when the folder_name is missing', () => {
      const newFolder = {
        folder_name: 'New Folder'
      }
      delete newFolder['folder_name']
      return supertest(app)
        .post('/api/folders')
        .send(newFolder)
        .expect(400, {
          error: { message: 'Missing folder name in body' }
        })
    })
  })
  describe('GET /api/folders/:folderId', () => {
    context('Given there are no folders', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .get(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `folders doesn't exist` } })
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
    context('Given there are folderss in the database', () => {
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
  describe('DELETE /api/folders/:folderId', () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const folderId = 123456;
        return supertest(app)
          .delete(`/api/folders/${folderId}`)
          .expect(404, { error: { message: `folders doesn't exist` } })
      })
    })
    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();
      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })
      it('responds with 204 and removes the folder', () => {
        const idToRemove = 2;
        const expectedFolder = testFolders.filter(folder => folder.id !== idToRemove)
        return supertest(app)
          .delete(`/api/folders/${idToRemove}`)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/folders`)
              .expect(expectedFolder)
            )
      })
    })
  })
  describe(`PATCH /api/folders/:folders_id`, () => {
    context('Given no folders', () => {
      it('responds with 404', () => {
        const foldersId = 123456;
        return supertest(app)
          .patch(`/api/folders/${foldersId}`)
          .expect(404, { error: { message: `folders doesn't exist` } })

      })
    })
    context('Given there are folders in the database', () => {
      const testFolders = makeFoldersArray();

      beforeEach('insert folders', () => {
        return db
          .into('noteful_folders')
          .insert(testFolders)
      })

      it('responds with 204 and updates the folders', () => {
        const idToUpdate = 2;
        const updatefolders = {
          folder_name: 'updated title'
        }
        const expextedFolders = {
          ...testFolders[idToUpdate - 1],
          ...updatefolders
        }
        return supertest(app)
          .patch(`/api/folders/${idToUpdate}`)
          .send(updatefolders)
          .expect(204)
          .then(res => 
            supertest(app)
              .get(`/api/folders/${idToUpdate}`)
              .expect(expextedFolders)
          )
      })
    it(`responds with 400 when no required fields supplied`, () => {
     const idToUpdate = 2
     return supertest(app)
       .patch(`/api/folders/${idToUpdate}`)
       .send({ irrelevantField: 'foo' })
       .expect(400, {
         error: {
           message: `Request body must contain folder name`
         }
       })
    })
        it(`responds with 204 when updating only a subset of fields`, () => {
      const idToUpdate = 2
      const updateFolders = {
        folder_name: 'updated folders title',
      }
      const expectedFolders = {
        ...testFolders[idToUpdate - 1],
        ...updateFolders
      }

      return supertest(app)
        .patch(`/api/folders/${idToUpdate}`)
        .send({
          ...updateFolders,
          fieldToIgnore: 'should not be in GET response'
        })
        .expect(204)
        .then(res =>
          supertest(app)
            .get(`/api/folders/${idToUpdate}`)
            .expect(expectedFolders)
        )
      })
    })
  })
})

