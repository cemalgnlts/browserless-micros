import fs from "fs/promises";
import path from "path";

import UglifyJS from "uglify-js";

async function buildMicro(microName, token) {
  const microPath = path.resolve("micros", `${microName}.js`);

  await fs.access(microPath, fs.constants.F_OK);

  let rawCode = await fs.readFile(microPath, "utf8");
  rawCode = `const run = async (page, context) => {
    ${rawCode}
  };

  module.exports = async ({ page, context }) => {
    const data = await run(page, context);
    return {
      data,
      type: "application/json"
    }
  };`;

  const { code } = UglifyJS.minify(rawCode);

  const params = new URLSearchParams();
  params.append("blockAds", true);
  params.append("ignoreHTTPSErrors", true);
  params.append("sealth", true);
  params.append("token", token);

  const url = `https://chrome.browserless.io/function?${params}`;

  return (context) => runMicro(url, code, context);
}

async function runMicro(url, code, context) {
  const req = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, code }),
  });

  let status = true;
  let output = "";

  if (req.ok) {
    const res = await req.json();
    output = res;
  } else {
    status = false;
    output = await req.text();
  }

  return {
    status,
    output,
  };
}

export default buildMicro;
