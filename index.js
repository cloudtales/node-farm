const fs = require('fs');
const http = require('http');
const url = require('url'); //helps us for example parsing the url for parameters

const slugify = require('slugify');

const replaceTemplate = require('./modules/replaceTemplate');

/////////////////////////////////////////
// FILES

/*
console.log("\nBlocking read/write file\n------------\n");
// Blocking, synchronous
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);
const textOut = `This is what we know about teh avocado: ${textIn}\nCreated on ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("File written.");

// Non-blocking, asynchronous  (CALLBACK HELL :D)
console.log("\nNon-blocking read/write file\n-------------\n");
fs.readFile("./txt/start.txt", "utf-8", (err1, data1) => {

  if(err1) return console.log('ERROR'); //example handler

  console.log(data1);
  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err2, data2) => {
    console.log(data2);
    fs.readFile(`./txt/append.txt`, "utf-8", (err3, data3) => {
      console.log(data3);
      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", err4 => {
        console.log("Your file has been written");
      });
    });
  });
});
*/

///////////////////////////////////////
// SERVER

// Sync code here is fine, becuase this is doen only once before (when) teh server is started
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  'utf-8'
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

//TODO: Implement slugs
const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));

const server = http.createServer((req, res) => {
  const { query, pathname: pathName } = url.parse(req.url, true); // Destructuring ob url object

  // Overview page
  if (pathName === '/' || pathName === '/overview') {
    const cardsHthml = dataObj
      .map(el => replaceTemplate(tempCard, el))
      .join(''); // implicit return in arrow function of replaceTemplate
    const output = tempOverview.replace('{%PRODUCT_CARDS%}', cardsHthml);

    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(output);

    // Product page
  } else if (pathName === '/product') {
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);

    res.writeHead(200, { 'Content-type': 'text/html' });
    res.end(output);

    // API
  } else if (pathName === '/api') {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
      'my-own-header': 'hello-world'
    });
    res.end('<h1>Page not found!</h1>');
  }
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
