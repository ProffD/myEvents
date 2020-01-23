var util = require("./util");
const express = require("express");
const http = require("http");
const url = require("url");
var cookieParser = require("cookie-parser");
const graphqlHttp = require("express-graphql");
const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const mongoose = require("mongoose");

async function main() {
  // Azure App Service will set process.env.port for you, but we use 3000 in development.
  const PORT = process.env.PORT || 3000;
  // Create the express routes
  let app = express();
  app.use(express.static("public"));
  app.use(cookieParser());

  app.get("/", async (req, res) => {
    if (req.query && req.query.loginsession) {
      res.cookie("loginsession", req.query.loginsession, {
        maxAge: 3600000,
        httpOnly: true
      });
      res.redirect(url.parse(req.url).pathname);
    } else {
      let indexContent = await util.loadEnvironmentVariables({
        host: process.env["HTTP_HOST"]
      });
      res.end(indexContent);
    }
  });

  app.use(
    "/api",
    graphqlHttp({
      schema: graphqlSchema,
      rootValue: graphqlResolver,
      graphiql: true
    })
  );
  console.log("Starting Server and connecting to the database...");
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
  });
  // mongoose
  //   .connect(
  //     "mongodb+srv://proffd:vx1800@first-cluster-vq17o.mongodb.net/events-db?retryWrites=true&w=majority",
  //     {
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true
  //     }
  //   )
  //   .then(results => {
  //     app.listen(3000, () => {
  //       console.log(`Server is listening on port ${PORT}`);
  //     });
  //   })
  //   .catch(err => console.log(err));
}

main();
