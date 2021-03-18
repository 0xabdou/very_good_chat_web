module.exports = {
  preset: 'ts-jest',
  moduleNameMapper: {
    "\\.(css|less)$": "identity-obj-proxy",
    "\\.(svg|png|jpg|jpeg)$": "<rootDir>/test/file-mock.ts",
  },
  setupFilesAfterEnv: [
    "<rootDir>/jest.setup.ts"
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/components/**/*',
    'src/features/**/*',
    'src/pages/**/*',
    'src/utils/**/*',
    '!src/utils/mobile/*'
  ],
};