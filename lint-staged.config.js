module.exports = {
  '**/*.ts?(x)': () => 'yarn type-check',
  '**/*.(ts|js)?(x)': () => 'yarn lint',
};
