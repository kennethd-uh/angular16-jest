// from https://stackoverflow.com/a/67990803/1332304
// see also added "compilerOptions"["paths"] to tsconfig.json
const { pathsToModuleNameMapper } = require('ts-jest')
const { compilerOptions } = require('./tsconfig')
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths),
    modulePaths: [
        '<rootDir>'
    ],
}
