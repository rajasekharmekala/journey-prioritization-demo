const path = require('path');

const eslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(process.cwd(), f))
    .join(' --file ')}`;
const prettierCommand = 'prettier --write --list-different';

module.exports = {
  'src/{action,app,components,config,db,lib}/**/*.{js,jsx,ts,tsx}': [
    eslintCommand,
  ],
  '**/*': [prettierCommand],
};
