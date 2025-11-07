"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUp = exports.init = void 0;
const tslib_1 = require("tslib");
const UserDTO_1 = require("./node_modules/pigallery2-extension-kit/lib/common/entities/UserDTO");
// Including prod extension packages. You need to prefix them with ./node_modules
// lodash does not have types
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const _ = require("./node_modules/lodash");
// Importing packages that are available in the main app (listed in the packages.json in pigallery2)
const typeorm_1 = require("typeorm");
// Using typeorm for ORM
let TestLoggerEntity = class TestLoggerEntity {
};
tslib_1.__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.PrimaryGeneratedColumn)({ unsigned: true }),
    tslib_1.__metadata("design:type", Number)
], TestLoggerEntity.prototype, "id", void 0);
tslib_1.__decorate([
    (0, typeorm_1.Column)(),
    tslib_1.__metadata("design:type", String)
], TestLoggerEntity.prototype, "text", void 0);
TestLoggerEntity = tslib_1.__decorate([
    (0, typeorm_1.Entity)()
], TestLoggerEntity);
const DEFAULT_STAR_VIEWBOX = '0 0 640 640';
const STAR_SYMBOL_DEFINITION = `
      <defs>
        <symbol id="star" viewBox="0 0 640 640">
          <path d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/>
        </symbol>
      </defs>
`;
const buildStarSvg = (innerItems, viewBox = DEFAULT_STAR_VIEWBOX) => ({
    viewBox,
    items: `
      ${STAR_SYMBOL_DEFINITION}

      ${innerItems}
    `
});
const addRatingButton = (extension, config) => {
    extension.ui.addMediaButton({
        name: config.name,
        svgIcon: buildStarSvg(config.innerItems, config.viewBox),
        metadataFilter: [{ field: 'rating', comparator: '==', value: config.rating }],
        alwaysVisible: true
    });
};
const init = async (extension) => {
    extension.Logger.debug(`My extension is setting up. name: ${extension.extensionName}, id: ${extension.extensionId}`);
    /**
     * (Optional) Adding custom SQL table
     */
    await extension.db.setExtensionTables([TestLoggerEntity]);
    /**
     * (Optional) Using prod package
     */
    extension.Logger.silly('lodash prod package works: ', _.defaults({ 'a': 1 }, { 'a': 3, 'b': 2 }));
    /**
     * (Optional) Implementing lifecycles events with MetadataLoader example
     * */
    extension.events.gallery.MetadataLoader
        .loadPhotoMetadata.before(async (input, event) => {
        extension.Logger.silly('onBefore: processing: ', JSON.stringify(input));
        // The return value of this function will be piped to the next before handler
        // or if no other handler then returned to the app
        return input;
        /*
        * (Optional) It is possible to prevent default run and return with the expected out output of the MetadataLoader.loadPhotoMetadata
        NOTE: if event.stopPropagation = true, MetadataLoader.loadPhotoMetadata.after won't be called.
        event.stopPropagation = true;
        return {
          size: {width: 1, height: 1},
          fileSize: 1,
          creationDate: 0
        } as PhotoMetadata;
        */
    });
    /**
     * (Optional) Adding a REST api endpoint for logged-in users
     */
    extension.RESTApi.get.jsonResponse(['/sample'], UserDTO_1.UserRoles.User, async () => {
        // Inserting into our extension table and returning with the result
        const conn = await extension.db.getSQLConnection();
        conn.getRepository(TestLoggerEntity).save({ text: 'called /sample at: ' + Date.now() });
        return await conn.getRepository(TestLoggerEntity).find();
    });
    /**
     * (Optional) Adding a (non-clickable) button to all photos with 4+ stars
     * Note: button order matters, but always visible buttons will be shown first
     */
    addRatingButton(extension, {
        name: '5',
        rating: 5,
        innerItems: `
      <!-- Top (centered) -->
      <use href="#star" x="0" y="0"  width="280" height="280" fill="red" />
      <use href="#star" x="340" y="0"  width="280" height="280" fill="red" />

      <!-- Bottom row -->
      <use href="#star" x="0" y="340" width="280" height="280" fill="red" />
      <use href="#star" x="340" y="340" width="280" height="280" fill="red" />

      <!-- Center -->
      <use href="#star" x="170" y="170" width="280" height="280" fill="red" />

    `
    });
    addRatingButton(extension, {
        name: '4',
        rating: 4,
        innerItems: `
      <!-- Top (centered) -->
      <use href="#star" x="0" y="0"  width="320" height="320" fill="orange" />
      <use href="#star" x="320" y="0"  width="320" height="320" fill="orange" />

      <!-- Bottom row -->
      <use href="#star" x="0" y="320" width="320" height="320" fill="orange" />
      <use href="#star" x="320" y="320" width="320" height="320" fill="orange" />
    `
    });
    addRatingButton(extension, {
        name: '3',
        rating: 3,
        innerItems: `
      <!-- Top (centered) -->
      <use href="#star" x="160" y="0"  width="320" height="320" fill="yellow" />

      <!-- Bottom row -->
      <use href="#star" x="0" y="320" width="320" height="320" fill="yellow" />
      <use href="#star" x="320" y="320" width="320" height="320" fill="yellow" />
    `
    });
    addRatingButton(extension, {
        name: '2',
        rating: 2,
        innerItems: `
      <use href="#star" x="0"  y="0" width="320" height="320" fill="greenyellow"/>
      <use href="#star" x="320" y="320" width="320" height="320" fill="greenyellow"/>
    `
    });
    addRatingButton(extension, {
        name: '1',
        rating: 1,
        innerItems: `
      <use href="#star" x="160"  y="160" width="320" height="320" fill="limegreen"/>
    `
    });
    /**
      extension.ui.addMediaButton({
        name: 'Nice Photo',
        svgIcon: {
          //viewBox: '0 0 640 640',
          viewBox: '0 0 640 640',
          items: '<path d="M341.5 45.1C337.4 37.1 329.1 32 320.1 32C311.1 32 302.8 37.1 298.7 45.1L225.1 189.3L65.2 214.7C56.3 216.1 48.9 222.4 46.1 231C43.3 239.6 45.6 249 51.9 255.4L166.3 369.9L141.1 529.8C139.7 538.7 143.4 547.7 150.7 553C158 558.3 167.6 559.1 175.7 555L320.1 481.6L464.4 555C472.4 559.1 482.1 558.3 489.4 553C496.7 547.7 500.4 538.8 499 529.8L473.7 369.9L588.1 255.4C594.5 249 596.7 239.6 593.9 231C591.1 222.4 583.8 216.1 574.8 214.7L415 189.3L341.5 45.1z"/></svg>'
        },
        metadataFilter: [{field: 'rating', comparator: '==', value: 3}],
        alwaysVisible: true
      });
    */
    /**
     * (Optional) Creating a messenger. You can use it with TopPickJob to send photos
     */
    extension.messengers.addMessenger('SampleMessenger', 
    /**
     * (Optional) Creating messenger config (these values will be requested in the TopPickJob)
     * Note: Jobs cant use typeconfig yet, so it uses a different way for configuration
     */
    [{
            id: 'text', // same as the keys in the function template above
            type: 'string',
            name: 'just a text',
            description: 'nothing to mention here',
            defaultValue: 'I hand picked these photos just for you:',
        }], {
        sendMedia: async (c, m) => {
            console.log('config got:', c.text);
            // we are not sending the photos anywhere, just logging them on the console.
            console.log(m);
        }
    });
};
exports.init = init;
const cleanUp = async (extension) => {
    extension.Logger.debug('Cleaning up');
    /*
    * No need to clean up changed through extension.db,  extension.RESTApi or extension.events
    * */
};
exports.cleanUp = cleanUp;
//# sourceMappingURL=server.js.map