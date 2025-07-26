const VisaRule = require('./VisaRules');

async function getVisaRules(filters) {
  const query = {};

  if (filters.visaType) {
    query.visaType = filters.visaType;
  }

  const results = await VisaRule.find(query).lean();
  return results;
}

async function testDB() {
  const all = await VisaRule.find({}).lean();
  console.log('All visa rules in DB:', all);
}
testDB();


module.exports = { getVisaRules };
