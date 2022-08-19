module.exports = {
    routes: [
      { // Path defined with an URL parameter
        method: 'POST',
        path: '/highlights/upload-clippings', 
        handler: 'highlight.uploadClippings',
      },
    
    ]
  }