module.exports = {
  target: 'node20',
  format: 'esm',
  platform: 'node',
  external: [
    '@aws-sdk/client-sqs',
    '@aws-sdk/client-iot-data-plane',
    '@pinecone-database/pinecone',
    'node-fetch',
    'agentkeepalive',
    'abort-controller',
    'formdata-node',
    'form-data-encoder',
    'openai'
  ],
  bundle: true,
  treeShaking: true
};
