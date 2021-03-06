const express = require("express");
const app = express();
const port = 5000;
var multer = require("multer");

const { Client } = require("pg");
const fs = require("fs");
app.use("/uploads", express.static("uploads")); // allows feed page to access

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  // only accept image file types!
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 10
  },
  fileFilter: fileFilter
});

// Connect to the database.
var config = {
  user: "mujo",
  password: "mujomujomujo",
  host: "super-fun-time-va-3bf.gcp-us-east4.cockroachlabs.cloud",
  database: "defaultdb",
  port: 26257,
  ssl: {
    ca: fs.readFileSync("./database/super-fun-time-va-ca.crt").toString()
  }
};

var client = new Client(config);
var imageTable =
  "CREATE TABLE IF NOT EXISTS images ( \
    id UUID NOT NULL DEFAULT gen_random_uuid(), \
    image STRING NOT NULL,\
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP\
)";

var captionTable =
  "CREATE TABLE IF NOT EXISTS captions ( \
    id UUID NOT NULL DEFAULT gen_random_uuid(), \
    text STRING NOT NULL,\
    date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,\
    likes INT,\
    dislikes INT,\
    imageId STRING\
)";

var test =
  "CREATE TABLE users (\
    id UUID PRIMARY KEY,\
    city STRING,\
    name STRING,\
    address STRING,\
    credit_card STRING,\
    dl STRING\
)";

client.connect().then(
  client.query("SELECT * FROM images", (err, res) => {
    if (err) {
      console.log(err.stack);
    } else {
      console.log(res.rows);
    }
  })
);

app.get("/test", (req, res) => res.send("Hello World!"));
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

//upload picture POST

app.post("/uploadimage", [upload.single("image")], async (req, res) => {
  try {
    const post = req.file.path;
    console.log("the image is at " + post);
    // insert post

    const query = {
      text: "INSERT INTO images (image) VALUES($1)",
      values: [post]
    };

    client.query(query, (err, result) => {
      if (err) {
        console.log("flop");
        console.log(err.stack);
      } else {
        console.log("uploaded image");
        console.log(result.rows);
        res.send(result.rows);
      }
    });
  } catch (err) {
    res.status(500).send("Error adding post");
  }
});

// multer
//

//add caption POST

//like caption PUT

//dislike caption function PUT

//load posts/captions etc by time GET
