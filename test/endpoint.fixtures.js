function makeFoldersArray() {
    return [
    { id: 1, folder_name: 'Test1' },
    { id: 2, folder_name: 'Test2'},
    { id: 3, folder_name: 'Test3'}
  ];
};
function makeNotesArray() {
  return [
    {id: 1, folder_id: 1, title: 'Bear', content: 'Sample content1', date_published: '2029-01-22T16:28:32.615Z'},
    {id: 2, folder_id: 2, title: 'Dog', content: 'Sample content2', date_published: '2029-01-22T16:28:32.615Z'},
    {id: 3, folder_id: 3, title: 'Cat', content: 'Sample content3', date_published: '2029-01-22T16:28:32.615Z'},
    {id: 4, folder_id: 1, title: 'Tiger', content: 'Sample content4', date_published: '2029-01-22T16:28:32.615Z'},
    {id: 5, folder_id: 2, title: 'Lion', content: 'Sample content5', date_published: '2029-01-22T16:28:32.615Z'},
    {id: 6, folder_id: 3, title: 'Monkey', content: 'Sample content6', date_published: '2029-01-22T16:28:32.615Z'},
  ];
};

function makeMaliciousFolder() {
  const maliciousFolder = {
    id: 911,
    folder_name: 'Naughty naughty very naughty <script>alert("xss");</script>',
    
  }
  const expectedFolder = {
    ...maliciousFolder,
    folder_name: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    
  }
  return {
    maliciousFolder,
    expectedFolder,
  }
}
function makeMaliciousNote() {
  const maliciousNote = {
    id: 911,
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    folder_id: 1,
    content: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    date_published: '2029-01-22T16:28:32.615Z',
    
  }
  const expectedNote = {
    ...maliciousNote,
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    content: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    
  }
  return {
    maliciousNote,
    expectedNote,
  }
}
module.exports = {
  makeFoldersArray,
  makeMaliciousFolder,
  makeMaliciousNote,
  makeNotesArray,
}