const fs = require('fs');
const express = require('express');
const { FB, FacebookApiException } = require('fb');

const router = new express.Router();

FB.options({ accessToken: fs.readFileSync('./credentials/fb_access_token.txt').toString() });

router.post('/social/post', async (req, res) => {
  try {
    const data = await FB.api('me/feed', 'post', {
      message: 'Test message',
      link: req.body.link,
    });

    res.send({ data });
  } catch (error) {
    console.log(error instanceof FacebookApiException);

    res.send({ error });
  }
});

module.exports = router;