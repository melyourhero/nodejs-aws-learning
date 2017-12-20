const app = require('../../../src/app');

describe('API AWS Integration Tests', () => {
  describe('#GET /media/files', () => {
    it('should return all file descriptors', (done) => {
      chai.request(app).get('/').end((error, response) => {
        console.log('error', error);
        console.log('Response', response);

        done();
      });
    });
  });
});