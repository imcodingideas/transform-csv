const fs = require('fs');
const csv = require('fast-csv');
const stream = fs.createReadStream('original.csv');
const results = [];

csv
  .fromStream(stream)
  .on('data', data => {
    var group = process.argv[2];
    var yearRange;
    if (group === undefined) {
      console.log('usage: npm start <param>');
      console.log('i.e: npm start all');
      process.exit(0);
    } else if (group === 'all') {
      group = data[0].substr(0, data[0].indexOf('-'));
      yearRange = data[12]
        .replace(new RegExp(' ', 'g'), '_')
        .replace(new RegExp('/', 'g'), '')
        .toLowerCase();
      // ignore condition
      if (!yearRange.includes('-')) {
        yearRange = null;
      }
    }
    if (data[0].indexOf(group + '-') > -1 && yearRange !== null) {
      const toAdd = {
        group,
        yearRange,
        entries: []
      };
      data[0] += '-' + Math.floor(Math.random() * (999 - 100 + 1) + 100);
      // if group doesnt exist in final results
      if (!results.some(e => e.group === group && e.yearRange === yearRange)) {
        toAdd.entries.push(data);
        results.push(toAdd);
      } else {
        // if group does exist in final results
        results
          .find(e => e.group === group && e.yearRange === yearRange)
          .entries.push(data);
      }
    }
  })
  .on('end', () => {
    const opt = {
      headers: true,
      transform: function(row) {
        return {
          PartNumber: row[0],
          PartName: row[1],
          Description: row[2],
          Length: row[3],
          Width: row[4],
          Height: row[5],
          Weight: row[6],
          MSRPList: row[7],
          Map: row[8],
          Tier1: row[9],
          Tier2: row[10],
          Tier3: row[11],
          Fitment: row[12],
          Warranty: row[13]
        };
      }
    };
    results.forEach(element => {
      const dir = './results';

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
      const filename = `${element.group}_${element.yearRange}.csv`;
      csv
        .writeToPath(`${dir}/${filename}`, element.entries, opt)
        .on('finish', () => {
          console.log(
            `${filename} with ${element.entries.length} elements created!`
          );
        });
    });
  })
  .on('error', error => {
    console.log(error);
  });
