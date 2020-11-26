#!/usr/bin/env node

async function first () {
  console.error('First');
  await second();
}

function second () {
  return new Promise((resolve, reject) => {
    console.error('Second');
    resolve();
  });
}

function third () {
  return new Promise((resolve, reject) => {
    console.error('Third');
    resolve();
  });
}

async function main () {
  first();
  await third();
}

main();
