const fs = require('fs');
const path = require('path');
function isNull(v) { return (v === undefined || v === null); }
function isNonNull(v) { return (v !== undefined && v !== null); }
async function sleep(ms) { return new Promise((resolve) => {setTimeout(() => resolve(), ms);});}

module.exports = { isNull, isNonNull, sleep };
