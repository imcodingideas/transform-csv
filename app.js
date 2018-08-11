const fs = require('fs');
const csv = require('fast-csv');
const stream = fs.createReadStream('original.csv');
const results = [];

csv
  .fromStream(stream)
  .on('data', data => {
    var group = process.argv[2];
    if (group === undefined) {
      console.log('usage: npm start <param>');
      console.log('i.e: npm start all');
      process.exit(0);
    } else if (group === 'all') {
      group = data[0].substr(0, data[0].indexOf('-'));
      if (group === null) {
        process.exit(0);
      }
    }
    if (data[0].indexOf(group + '-') > -1) {
      const toAdd = {
        group,
        entries: []
      };
      data[0] += '-' + Math.floor(Math.random() * (999 - 100 + 1) + 100);
      if (!results.some(e => e.group === group)) {
        toAdd.entries.push(data);
        results.push(toAdd);
      } else {
        results.find(e => e.group === group).entries.push(data);
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
      csv
        .writeToPath(`${element.group}.csv`, element.entries, opt)
        .on('finish', () => {
          console.log(
            `${element.group}.csv with ${
              element.entries.length
            } elements created!`
          );
        });
    });
  })
  .on('error', error => {
    console.log(error);
  });
