const express = require('express');
const path = require('path');
const foldersService = require('./folders-service');
const xss = require('xss');
const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = function(folder) {
  return {
  id: folder.id,
  folder_name: xss(folder.folder_name),
}

}
foldersRouter
  .route('/')
  .get((req, res, next) => {
    const db = req.app.get('db')
    foldersService.getAllFolders(db)
      .then(folders => {
        res.json(folders.map(serializeFolder))
      })
      .catch(next)
  })
  .post(jsonParser, (req, res, next) => {
    const folder_name = req.body.folder_name;
    const db = req.app.get('db');
    if(!folder_name) {
      return res.status(400).json({
        error: {message: `Missing folder name in body` }
      })
    }
    const newFolder = { folder_name };
    foldersService.insertFolder(
      db,
      newFolder
    )
      .then(folder => {
          res.status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder))
      })
      .catch(next)
   
    
      
  })

foldersRouter
  .route('/:folderId')
  .all((req, res, next) => {
    const db = req.app.get('db');
    foldersService.getById(db, req.params.folderId)
      .then(folder => {
        if(!folder) {
          return res.status(404).json({
            error: { message: `folders doesn't exist` }
          })
        }
        res.folder = folder;
        next();
      })
      .catch(next)
  })
  .get((req, res, next) => {
    res.status(200).json(serializeFolder(res.folder))
  })
  .delete((req, res, next) => {
    const db = req.app.get('db');
    foldersService.deleteFolder(
      db, req.params.folderId
    )
      .then(() => {
        res.status(204).end()
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
      const folder_name = req.body.folder_name;
      if(!folder_name) {
        res.status(400).json({
          error: { message: `Request body must contain folder name`}
        })
      }
      xss(folder_name);
      const folderToUpdate = { folder_name }

      foldersService.updateFolder(
        req.app.get('db'),
        req.params.folderId,
        folderToUpdate
      )
      .then(() => {
        res.status(204).end()
      })
      .catch(next)
    })
  module.exports = foldersRouter;