var express = require('express');
var router = express.Router();

const md5 = require('blueimp-md5')
// 引入 UserModel,ChatModel
const models = require('../db/models')
const UserModel = models.UserModel
const ChatModel = models.ChatModel
const filter = { password: 0 } // 查询时过滤出指定的属性



/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

// 注册一个路由: 用户注册
/*
a)path为: /register
b)请求方式为: POST
c)接收username和password参数
d)admin是已注册用户
e)注册成功返回: {code: 0, data: {_id: 'abc', username: ‘xxx’, password:’123’}
f)注册失败返回: {code: 1, msg: '此用户已存在'}
 */
/*
1. 获取请求参数
2. 处理
3. 返回响应数据
 */
/*router.post('/register', function (req, res) {
  console.log('register()')
  // 1. 获取请求参数
  const {username, password} = req.body
  // 2. 处理
  if(username==='admin') { // 注册会失败
    // 返回响应数据(失败)
    res.send({code: 1, msg: '此用户已存在222'})
  } else { // 注册会成功
    // 返回响应数据(成功)
    res.send({code: 0, data: {id: 'abc123', username, password}})
  }
})*/


// 注册路由
router.post('/register', function (req, res) {
  // 1. 获取请求参数数据(username, password, type)
  const { username, password, type } = req.body
  // 2. 处理数据
  // 3. 返回响应数据
  // 2.1. 根据 username 查询数据库, 看是否已存在 user
  UserModel.findOne({ username }, function (err, user) {
    // 3.1. 如果存在, 返回一个提示响应数据: 此用户已存在
    if (user) {
      res.send({ code: 1, msg: '此用户已存在' }) // code 是数据是否是正常数据的标识
    } else {
      // 2.2. 如果不存在, 将提交的 user 保存到数据库
      new UserModel({ username, password: md5(password), type }).save(function (err,
        user) {
        // 生成一个 cookie(userid: user._id), 并交给浏览器保存
        res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 }) // 持久化 cookie, 浏览器会保存在本地文件
        // 3.2. 保存成功, 返回成功的响应数据: user
        res.send({ code: 0, data: { _id: user._id, username, type } }) // 返回的数据中不携带 pwd
      })
    }
  })
})

// 登陆路由
router.post('/login', function (req, res) {
  // 1. 获取请求参数数据(username, password)
  const { username, password } = req.body
  // 2. 处理数据: 根据 username 和 password 去数据库查询得到 user
  UserModel.findOne({ username, password: md5(password) }, filter, function (err, user) {
    // 3. 返回响应数据
    // 3.1. 如果 user 没有值, 返回一个错误的提示: 用户名或密码错误
    if (!user) {
      res.send({ code: 1, msg: '用户名或密码错误' })
    } else {
      // 生成一个 cookie(userid: user._id), 并交给浏览器保存
      res.cookie('userid', user._id, { maxAge: 1000 * 60 * 60 * 24 * 7 })
      // 3.2. 如果 user 有值, 返回 user
      res.send({ code: 0, data: user }) // user 中没有 pwd
    }
  })
})

// 更新用户信息的路由
router.post('/update', function (req, res) {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.send({ code: 1, msg: '请先登陆' })
  }
  // 存在, 根据userid更新对应的user文档数据
  // 得到提交的用户数据
  const user = req.body // 没有_id
  UserModel.findByIdAndUpdate({ _id: userid }, user, function (error, oldUser) {

    if (!oldUser) {
      // 通知浏览器删除userid cookie
      res.clearCookie('userid')
      // 返回返回一个提示信息
      res.send({ code: 1, msg: '请先登陆' })
    } else {
      // 准备一个返回的user数据对象
      const { _id, username, type } = oldUser
      const data = Object.assign({ _id, username, type }, user)
      // 返回
      res.send({ code: 0, data })
    }
  })
})

// 获取用户信息的路由(根据cookie中的userid)
router.get('/user', function (req, res) {
  // 从请求的cookie得到userid
  const userid = req.cookies.userid
  // 如果不存在, 直接返回一个提示信息
  if (!userid) {
    return res.send({ code: 1, msg: '请先登陆' })
  }
  // 根据userid查询对应的user
  UserModel.findOne({ _id: userid }, filter, function (error, user) {
    if (user) {
      res.send({ code: 0, data: user })
    } else {
      // 通知浏览器删除userid cookie
      res.clearCookie('userid')
      res.send({ code: 1, msg: '请先登陆' })
    }

  })
})

// 获取用户列表(根据类型)
router.get('/userlist', function (req, res) {
  const { type } = req.query
  UserModel.find({ type }, filter, function (error, users) {
    res.send({ code: 0, data: users })
  })
})

/*获取当前用户所有相关聊天信息列表
*/
router.get('/msglist', function (req, res) {
  // 获取 cookie 中的 userid
  const userid = req.cookies.userid
  // 查询得到所有 user 文档数组
  UserModel.find(function (err, userDocs) {
    // 用对象存储所有 user 信息: key 为 user 的_id, val 为 name 和 header 组成的 user 对象
    const users = {} // 对象容器
    userDocs.forEach(doc => {
      users[doc._id] = { username: doc.username, header: doc.header }
    })
    /*查询 userid 相关的所有聊天信息
    参数 1: 查询条件
    参数 2: 过滤条件
    参数 3: 回调函数
    */
    ChatModel.find({ '$or': [{ from: userid }, { to: userid }] }, filter, function (err,
      chatMsgs) {
      // 返回包含所有用户和当前用户相关的所有聊天消息的数据
      res.send({ code: 0, data: { users, chatMsgs } })
    })
  })
})
/*修改指定消息为已读
*/
router.post('/readmsg', function (req, res) {
  // 得到请求中的 from 和 to
  const from = req.body.from
  const to = req.cookies.userid
  /*更新数据库中的 chat 数据
参数 1: 查询条件
参数 2: 更新为指定的数据对象
参数 3: 是否 1 次更新多条, 默认只更新一条
参数 4: 更新完成的回调函数
*/
  ChatModel.update({ from, to, read: false }, { read: true }, { multi: true }, function (err,
    doc) {
    console.log('/readmsg', doc)
    res.send({ code: 0, data: doc.nModified }) // 更新的数量
  })
})


module.exports = router;
