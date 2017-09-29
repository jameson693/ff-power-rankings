const fs = require('fs');
const path = require('path');
const appDirectory = fs.realpathSync(process.cwd());

function resolvePath(relativePath) {
    return path.resolve(appDirectory, relativePath);
}

module.exports = {
    appHome: appDirectory,
    clientTest: resolvePath('test/unit/src'),
    serverTest: resolvePath('test/unit/server'),
    src: resolvePath('src'),
    unitTest: resolvePath('test/unit'),
}