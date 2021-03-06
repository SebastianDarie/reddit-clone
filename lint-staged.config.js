module.exports = {
  '!(*test).ts?(x)': () => 'yarn type-check',
  '**/*.(ts|js)?(x)': () => 'yarn lint',
};
