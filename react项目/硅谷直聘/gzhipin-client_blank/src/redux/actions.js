/*包含所有 action creator 函数的模块
 */
import io from 'socket.io-client'
import {
    AUTH_SUCCESS,
    ERROR_MSG,
    RECEIVE_USER,
    RESET_USER,
    RECEIVE_USER_LIST,
    RECEIVE_MSG_LIST,
    RECEIVE_MSG,
    MSG_READ
} from './action-types'
import {
    reqRegister,
    reqLogin,
    reqUser,
    reqUpdateUser,
    reqUserList,
    reqChatMsgList,
    reqReadChatMsg
} from '../api'

// 授权成功的同步action
const authSuccess = (user) => ({ type: AUTH_SUCCESS, data: user })
// 错误提示信息的同步action
const errorMsg = (msg) => ({ type: ERROR_MSG, data: msg })
// 接收用户的同步action
const receiveUser = (user) => ({ type: RECEIVE_USER, data: user })
// 重置用户的同步action
export const resetUser = (msg) => ({ type: RESET_USER, data: msg })
// 用户列表
const receiveUserList = (users) => ({ type: RECEIVE_USER_LIST, data: users })
// 接收消息列表的同步 action
const receiveMsgList = ({ users, chatMsgs, userid }) => ({
    type: RECEIVE_MSG_LIST, data:
        { users, chatMsgs, userid }
})
// 接收消息的同步 action
const receiveMsg = (chatMsg, userid) => ({type: RECEIVE_MSG, data: {chatMsg, userid}})
// 读取了消息的同步 action
const msgRead = ({ from, to, count }) => ({ type: MSG_READ, data: { from, to, count } })

/*异步注册
 */
export function register({
    username,
    password,
    password2,
    type
}) {
    // 进行前台表单验证, 如果不合法返回一个同步 action 对象, 显示提示信息
    if (!username || !password || !type) {
        return errorMsg('用户名密码必须输入')
    }
    if (password !== password2) {
        return errorMsg('密码和确认密码不同')
    }
    return async dispatch => {
        console.log(this.state)
        // 异步 ajax 请求, 得到响应
        const response = await reqRegister({
            username,
            password,
            type
        })
        // 得到响应体数据
        const result = response.data
        // 如果是正确的
        if (result.code === 0) {
            getMsgList(dispatch, result.data._id)
            // 分发成功的 action
            dispatch(authSuccess(result.data))
        } else {
            // 分发提示错误的 action
            dispatch(errorMsg(result.msg))
        }
    }
}
/*
异步登陆
*/
export const login = ({
    username,
    password
}) => {
    if (!username || !password) {
        return errorMsg('用户密码必须输入')
    }
    return async dispatch => {
        const response = await reqLogin({
            username,
            password
        })
        const result = response.data
        if (result.code === 0) {
            getMsgList(dispatch, result.data._id)
            dispatch(authSuccess(result.data))
        } else {
            dispatch(errorMsg(result.msg))
        }
    }
}

/*异步获取用户
*/
export const getUser = () => {
    return async dispatch => {
        const response = await reqUser()
        const result = response.data
        if (result.code === 0) {
            getMsgList(dispatch, result.data._id)
            dispatch(receiveUser(result.data))
        } else {
            dispatch(resetUser(result.msg))
        }
    }
}

/*异步更新用户
*/
export const updateUser = (user) => {
    return async dispatch => {
        // 发送异步 ajax 请求
        const response = await reqUpdateUser(user)
        const result = response.data
        if (result.code === 0) { // 更新成功
            dispatch(receiveUser(result.data))
        } else { // 失败
            dispatch(resetUser(result.msg))
        }
    }
}
// 异步获取用户列表
export const getUserList = (type) => {
    return async dispatch => {
        const response = await reqUserList(type)
        const result = response.data
        if (result.code === 0) {
            dispatch(receiveUserList(result.data))
        }
    }
}

/*初始化客户端 socketio
1. 连接服务器
2. 绑定用于接收服务器返回 chatMsg 的监听
*/
function initIO(dispatch, userid) {
    if (!io.socket) {
        io.socket = io('ws://localhost:4001')
        io.socket.on('receiveMsg', (chatMsg) => {
            if (chatMsg.from === userid || chatMsg.to === userid) {
                dispatch(receiveMsg(chatMsg, userid))
            }
        })
    }
}
/*获取当前用户相关的所有聊天消息列表
(在注册/登陆/获取用户信息成功后调用)
*/
async function getMsgList(dispatch, userid) {
    initIO(dispatch, userid)
    const response = await reqChatMsgList()
    const result = response.data
    if (result.code === 0) {
        const { chatMsgs, users } = result.data
        dispatch(receiveMsgList({users, chatMsgs, userid}))
    }
}
/*
发送消息的异步 action
*/
export const sendMsg = ({ from, to, content }) => {
    return async dispatch => {
        console.log('客户端向服务器发送消息', {from, to, content})
        // initIO();
        io.socket.emit('sendMsg', { from, to, content })
    }
}
/*更新读取消息的异步 action
*/
export const readMsg = (userid) => {
    return async (dispatch, getState) => {
        const response = await reqReadChatMsg(userid)
        const result = response.data
        if (result.code === 0) {
            const count = result.data
            const from = userid
            const to = getState().user._id
            dispatch(msgRead({ from, to, count }))
        }
    }
}




