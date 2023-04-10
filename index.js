import express from "express";

import es6Renderer from "express-es6-template-engine";
import micros from "./micros/index.js";
import buildMicro from "./libs/buildMicro.js";

const PORT = process.env.PORT ?? 3000;

const app = express();
app.use(express.static("public"));
app.use(express.json());

app.engine("html", es6Renderer);
app.set("views", "views");
app.set("view engine", "html");

const singlePageMiddleware = (req, res, next) => {
  // If the page is requested by the browser, send the index,
  // if requested by request, send only the relevant part.
  const fromBrowser = req.get("accept").includes("text/html");

  if (fromBrowser) {
    res.render("index", {
      locals: { micros }
    });
  } else next();
};

app.get("/", (req, res) => {
  res.render("index", {
    locals: { micros }
  });
});

app.get("/docs/:doc", singlePageMiddleware, (req, res) => {
  res.render(req.params.doc);
});

app.get("/micros", singlePageMiddleware, (req, res) => {
  res.render("allMicros", {
    locals: {
      micros
    }
  });
});

app.get("/micros/:micro", singlePageMiddleware, async (req, res) => {
  const micro = micros.find((micro) => micro.file === req.params.micro);

  const userReq = await fetch(`https://api.github.com/users/${micro.authorGitHub}`);
  const author = await userReq.json();

  res.render("micro", {
    locals: { micro, author }
  });
});

app.post("/micros/run/:microFile", async (req, res) => {
  const token = req.get("x-api-key") === "null" ? process.env.BROWSERLESS_API_KEY : req.get("x-api-key");
  const microFile = req.params.microFile;
  let data = null;

  try {
    const micro = await buildMicro(microFile, token);
    data = await micro(req.body);
  } catch(err) {
    let output = err.code === "ENOENT" ? "Micro not found" : err.toString();

    data = {
      status: false,
      output
    }
  }

  res.json(data);
});

app.listen(PORT, () => console.log("App listening on", PORT));
