const fs = require("fs");
const extRegex = /(?:\.([^.]+))?$/;
const uploader = function (file, options) {
    if (!file) throw new Error('no file(s)');

    return Array.isArray(file) ? _filesHandler(file, options) : _fileHandler(file, options);
}

const _fileHandler = function (file, options) {
    if (!file) throw new Error('no file');

    if (options.fileFilter && !options.fileFilter(file.hapi.filename)) {
        throw new Error("This file type is not allowed, please upload XLSX file");
    }
    const filename = file.hapi.filename.replace(/\s/g, '')
    const ext = extRegex.exec(filename);
    const path = `${options.dest}${filename}`;
    const fileStream = fs.createWriteStream(path);

    return new Promise((resolve, reject) => {
        file.on('error', err => reject(err));
        file.pipe(fileStream);
        file.on('end', (err) => resolve({
            filename,
            mimetype: file.hapi.headers['content-type'],
            destination: `${options.dest}`,
            path,
            size: fs.statSync(path).size,
        }));
    })
}

const sheetFilter = (filename) => extRegex.exec(filename)[1] === "xlsx";
exports.sheetFilter = sheetFilter;
exports.uploader = uploader;