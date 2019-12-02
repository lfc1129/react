var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 登陆
router.post('/login', (req, res) => {
  const {username, password} = req.body
  if(username==='admin'){
    res.send({status: 0, msg: '用户已存在'})
  }
  // console.log(req.body)
})

module.exports = router;
