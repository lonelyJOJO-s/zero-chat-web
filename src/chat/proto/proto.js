/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  protocol: {
    nested: {
      Message: {
        fields: {
          from: {
            type: "int64",
            id: 1
          },
          content: {
            type: "string",
            id: 2
          },
          sendTime: {
            type: "int64",
            id: 3
          },
          contentType: {
            type: "int32",
            id: 4
          },
          to: {
            type: "int64",
            id: 5
          },
          file: {
            type: "bytes",
            id: 6
          },
          chatType: {
            type: "int32",
            id: 7
          },
          type: {
            type: "string",
            id: 8
          },
          fileBack: {
            type: "string",
            id: 9
          },
          fromUsername: {
            type: "string",
            id: 10
          }
        }
      }
    }
  }
});

module.exports = $root;
