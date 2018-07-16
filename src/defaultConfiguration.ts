export const configuration = {
  server: {
    applicationBucketName: '',
    port: 8080,
  },
  mongoose: {
    application: {
      uri: '',
    },
  },
  morganFormat: {
    tiny: ':method :url :status :res[content-length] - :response-time ms',
    combined: ':method :url :status :response-time ms :body',
  },
  test: {
    server: '',
  },
  logger: {
    appenders: {
      console: {
        type: 'stdout',
        layout: {
          type: 'coloured',
        },
      },
    },
    categories: {
      default: {
        appenders: ['console'],
        level: 'info',
      },
    },
  },
  credentials: {
    aws: {
      accessKeyId: '',
      secretAccessKey: '',
    },
  },
};
