var express = require("express");
var app = express();
const apiRouter = require("./apiRouter").router;

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(express.json());

app.use("/api", apiRouter);
// respond with "hello world" when a GET request is made to the homepage
app.get("/", function (req, res) {
  res.send("hello world");
});

app.listen(8080, () => {
  console.log("server 8080 en marche");
});
