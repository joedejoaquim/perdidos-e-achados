const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

const map = {
  'ÃƒÂ¡': 'Ã¡', 'Ãƒ ': 'Ã ', 'ÃƒÂ¢': 'Ã¢', 'ÃƒÂ£': 'Ã£',
  'ÃƒÂ©': 'Ã©', 'ÃƒÂª': 'Ãª',
  'ÃƒÂ­': 'Ã­',
  'ÃƒÂ³': 'Ã³', 'ÃƒÂ´': 'Ã´', 'ÃƒÂµ': 'Ãµ',
  'ÃƒÂº': 'Ãº',
  'ÃƒÂ§': 'Ã§',
  'Ãƒ ': 'Ã€', 'Ãƒ ': 'Ã', 'Ãƒâ€š': 'Ã‚', 'ÃƒÆ’': 'Ãƒ',
  'Ãƒâ€°': 'Ã‰', 'ÃƒÅ ': 'ÃŠ',
  'Ãƒ ': 'Ã',
  'Ãƒâ€œ': 'Ã“', 'Ãƒâ€': 'Ã”', 'Ãƒâ€¢': 'Ã•',
  'ÃƒÅ¡': 'Ãš',
  'Ãƒâ€¡': 'Ã‡'
};

walk('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (let key in map) {
      content = content.replace(new RegExp(key, 'g'), map[key]);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});

