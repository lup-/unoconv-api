#About

This repo contains simple Koa.js REST API for file conversion using headless `libreoffice`. For supported files list `unoconv` is used.

#Installation
##Local

1. Clone this repo: `git clone git@github.com:lup-/unoconv-api.git`
2. Install dependencies: `npm install`
3. Run: `npm run server`

##Docker
Run image from Docker Hub
`docker run -d -p 3000:3000 lup098/unoconv-lo-convert-api`

##docker-compose
1. Create docker-compose.yml:
```
version: "3.7"

services:
  converter:
    image: lup098/unoconv-lo-convert-api
    ports:
      - 3000:3000
```
2. Run docker-compose: `docker-compose up -d converter`


#Usage
##List of supported formats
Make GET request to http://localhost:3000/formats

```
curl -X GET --location "http://localhost:3000/formats"
```

##Convert document
To convert document to another format, submit `file` field in POST request to http://localhost:3000/convert/:format.
Where `:format` is extension of target file. On successful conversion new file will be downloaded.


###DOCX to TXT
Convert file `testDoc.docx` from current folder to text:
```
curl -X POST "http://localhost:3000/convert/txt" -F "file=@testDoc.docx"
```

###PDF to HTML
Convert file `testDoc.pdf` from current folder to text:
```
curl -X POST "http://localhost:3000/convert/html" -F "file=@testDoc.pdf"
```

##Example using Axios:
```js
let file = fileInput.files[0];

let requestData = new FormData();
requestData.append('file', file);

let {data} = await axios.post('http://localhost:3000/convert/txt',
    requestData,
    { headers: {'Content-Type': 'multipart/form-data'} });

let fileText = data;
```