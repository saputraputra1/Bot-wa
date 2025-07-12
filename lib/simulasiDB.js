const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'simulasiData.json');

const loadData = () => {
  if (!fs.existsSync(filePath)) return { users: {}, items: [] };
  return JSON.parse(fs.readFileSync(filePath));
};

const saveData = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = { loadData, saveData };
