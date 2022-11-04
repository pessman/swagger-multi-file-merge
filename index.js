const yamljs = require('yamljs');
const resolveRefs = require('json-refs').resolveRefs;
const path = require("path");
const writeYamlFile = require('write-yaml-file');
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const arguments = process.argv.splice(2)

/**
 * Return JSON with resolved references
 * @param {array | object} root - The structure to find JSON References within (Swagger spec)
 * @returns {Promise.<JSON>}
 */
 const multiFileSwagger = (root) => {
    const options = {
      filter: ["relative", "remote"],
      loaderOptions: {
        processContent: function (res, callback) {
          callback(null, yamljs.parse(res.text));
        },
      },
    };
  
    return resolveRefs(root, options).then(
      function (results) {
        return results.resolved;
      },
      function (err) {
        console.log(err.stack);
      }
    );
};

const swaggerDocument =  multiFileSwagger(
    yamljs.load(path.resolve(__dirname, "./index.yaml"))
);

const doc = swaggerDocument.then((value) => {
    writeYamlFile(arguments[0], value).then(() => {
        console.log('created yaml')
    })
    return value
});

app.get('/', function (req, res) {
  swaggerDocument.then((value) => {
    res.send(value)
  })
})

app.listen(3000)