export default {
    testEnvironment: 'node',
    testMatch: ['**/__teste__/**/*.js?(x)', '**/?(*.)+(spec|test).js?(x)'],
    transform: {'^.+\\.js$': 'babel-jest', },
};