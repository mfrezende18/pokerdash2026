const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: fs.createReadStream('/Users/matheus.rezende/.gemini/antigravity-ide/brain/64210b5d-ef88-43a3-a106-4097ef1ae1d2/.system_generated/logs/transcript_full.jsonl')
});
rl.on('line', (line) => {
  const data = JSON.parse(line);
  if (data.type === 'USER_INPUT') {
    console.log('----- USER INPUT -----');
    console.log(data.content.substring(0, 500));
  }
});
