'use strict';

/**
 *  highlight controller
 */
const { createCoreController } = require("@strapi/strapi").factories;
const fs = require("fs");
var klip = require("../../../../klip/klip.js");
module.exports = createCoreController(
  "api::highlight.highlight",
  ({ strapi }) => ({
    async uploadClippings(ctx) {
      const { file } = ctx.request.files;
      const filePath = file.path;
      const data = fs.readFileSync(filePath, "utf8");
      let clippings = klip.parse(data);

      console.log(clippings.slice(-10));
      for (let i = 0; i < clippings.length; i++) {
        // check if book exists by title
        let book = await strapi.entityService.findMany("api::book.book", {
          fields: ["id", "title"],
          filters: { title: clippings[i].title },
        });

        let bookId = null;
        if (book.length > 0) {
          bookId = book[0].id;
        } else {
          // create book if it doesn't exist
          book = await strapi.service("api::book.book").create({
            data: {
              title: clippings[i].title,
              author: clippings[i].author || "",
              createdAt: new Date(),
            },
          });
          bookId = book.id;
        }
        // create highlight
        await strapi.service("api::highlight.highlight").create({
          data: {
            book: bookId,
            location: clippings[i].pageRange
              ? `Page ${clippings[i].pageRange[0]}`
              : clippings[i].locationRange
              ? `Location ${clippings[i].locationRange[0]}`
              : "",
            content: clippings[i].content,
            createdAt: clippings[i].date || new Date(),
          },
        });

        // await strapi.service("api::highlight.highlight").create({
        //   data: {
        //     content: clippings[i].content,
        //     createdAt: clippings[i].date,
        //   },
        // });
      }
      return (ctx.response.body = clippings);
    },
  })
);
