const fs = require("fs");
const csv = require("fast-csv");
const path = require("path");
const R = require("ramda")
const stream = fs.createReadStream("sheet.csv");
const initialCsvStream = csv.createWriteStream({ headers: true });
const writeableStream = fs.createWriteStream("my.csv");
const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const transformData = row =>
  ({
    dayName: row[1],
    hours: row[8],
    name: row[3]
  })

const validateData = (day, name) => days.indexOf(day) > -1 && name.length

const writeToStream = csvStream => ([key, val]) => csvStream.write({ name: key, days: val.map(({ dayName, hours }) => `${dayName}: ${hours}`) });

const generateCsvFile = csvStream => (data) => {
  csvStream.pipe(writeableStream)
  R.forEach(writeToStream(csvStream), Object.entries(data));
  csvStream.end();
};

const filterRows = r => !!r && validateData(r[1], r[3]);

const generateFile = (csvStream) =>
  R.pipe(
    R.filter(filterRows),
    R.map(transformData),
    R.groupBy(R.prop("name")),
    generateCsvFile(csvStream)
  )

export default function main(stream) {
  const rows = [];
  return new Promise(resolve => {
    csv.fromStream(stream)
      .on("data", row => rows.push(row))
      .on("end", () => resolve(rows))
  });
}
//main(stream).then(generateFile(initialCsvStream));
