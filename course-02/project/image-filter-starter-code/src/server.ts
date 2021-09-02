import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { filterImageFromURL, deleteLocalFiles, validURL } from "./util/util";

(async () => {
  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;

  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  app.get("/filteredimage", async (request, response) => {
    let url: string = String(request.query.image_url);
    if (validURL(url)) {
      await filterImageFromURL(url)
        .then(async (fileName) => {
          var options = {
            dotfiles: "deny",
            headers: {
              "x-timestamp": Date.now(),
              "x-sent": true,
            }
          };
          response.status(200).sendFile(fileName, options, function (err) {
            if (err) {
              response.status(500).send(err);
            } else {
              deleteLocalFiles([fileName]).then().catch();
            }
          });
        })
        .catch((err) => {
          response.status(422).send("Error processing the request: " + err);
        });
    } else {
      response
        .status(400)
        .send(
          "Bad request, please specify an image URL in image_url query paramater"
        );
    }
  });

  // Root Endpoint
  // Displays a simple message to the user
  app.get("/", async (req, res) => {
    res.send("try GET /filteredimage?image_url={{}}");
  });

  // Start the Server
  app.listen(port, () => {
    console.log(`server running http://localhost:${port}`);
    console.log(`press CTRL+C to stop server`);
  });
})();

// function validURL(str: string) {
//   var pattern = new RegExp(
//     "^(https?:\\/\\/)?" + // protocol
//       "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
//       "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
//       "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
//       "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
//       "(\\#[-a-z\\d_]*)?$",
//     "i"
//   ); // fragment locator
//   return !!pattern.test(str);
// }
