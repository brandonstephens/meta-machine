import fs from "fs";
import fetch from "node-fetch";
import { DateTime } from "luxon";

const [, , $1] = process.argv;

const now = DateTime.local();
const fileName = `${now.toFormat("y-LL-dd_hh-mm-ss")}.csv`;
const outputPath = `./output/${fileName}`;
const writeStrime = fs.createWriteStream(outputPath);

const parseSEO = (body, url) => {
  let title = body.match(/<title([^>]*)>([^<]*)<\/title>/);
  if (!title || typeof title[2] !== "string")
    throw new Error("Unable to parse the title tag");

  let desc = body.match(
    /<meta([^>]*)name="description"([^>]*)content="([^"]+)"\/>/
  );
  if (!desc || typeof desc[3] !== "string")
    throw new Error("Unable to parse the desc tag");

  writeStrime.write(`"${url}", "${title[2]}", "${desc[3]}"\n`);
};

fs.readFile($1, "utf8", function (err, data) {
  if (err) throw err;
  let csv = `url, title, desc \n`;

  writeStrime.write(`${csv}`);

  data.split("\n").map((url) => {
    csv += fetch(url)
      .then((res) => res.text()) // parse response's body as text
      .then((body) => parseSEO(body, url)) // extract <title> from body
      .catch((error) => console.error(error));
  });
});
