#!/usr/bin/env node

function main(msg, cb) {
  console.error(msg);
  cb('Second');
  console.error('Third');
}

main('First', function (msg) {
  console.error(msg);
});
