const serverless = require('serverless-http');
const expressApp = require('../../backend/src/app');

// Express 앱을 Netlify 서버리스 함수로 래핑합니다.
// 이 파일은 Netlify Functions의 진입점이 됩니다.
exports.handler = serverless(expressApp);
