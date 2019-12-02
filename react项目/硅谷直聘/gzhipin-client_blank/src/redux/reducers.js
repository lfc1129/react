/*包含 n 个根据老的 state 和 action 返回新的 state 的函数的模块
 */
import {
    combineReducers
} from 'redux'
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

import { getRedirectTo } from '../utils'

const initUser = {
    username: '', // 用户名
    type: '', // 类型
    msg: '', // 错误提示信息
    redirectTo: '' // 需要自动跳转的路由 path
}

function user(state = initUser, action) {
    switch (action.type) {
        case AUTH_SUCCESS: // 认证成功
            const { type, header } = action.data
            return { ...action.data, redirectTo: getRedirectTo(type, header) }
        case ERROR_MSG: // 错误信息提示
            return {
                ...state, msg: action.data
            }
        case RECEIVE_USER: // data是user
            return action.data
        case RESET_USER: // data是msg
            return { ...initUser, msg: action.data }
        default:
            return state
    }
}

const initUserList = []
function userList(state = initUserList, action) {
    switch (action.type) {
        case RECEIVE_USER_LIST:
            return action.data
        default:
            return state
    }
}

// 初始 chat 对象
const initChat = {
    chatMsgs: [], // 消息数组 [{from: id1, to: id2}{}]
    users: {}, // 所有用户的集合对象{id1: user1, id2: user2}
    unReadCount: 0 // 未读消息的数量
}

// 管理聊天相关信息数据的 reducer
function chat(state = initChat, action) {
    switch (action.type) {
        case RECEIVE_MSG:
            var { chatMsg, userid } = action.data
            return {
                chatMsgs: [...state.chatMsgs, chatMsg],
                users: state.users,
                unReadCount: state.unReadCount + (!chatMsg.read && chatMsg.to === userid ? 1 : 0)
            }
        case RECEIVE_MSG_LIST:
            var { chatMsgs, users, userid } = action.data
            return {
                chatMsgs,
                users,
                unReadCount: chatMsgs.reduce((preTotal, msg) => { // 别人发给我的未读消息
                    return preTotal + (!msg.read && msg.to === userid ? 1 : 0)
                }, 0)
            }
        case MSG_READ:
            const { count, from, to } = action.data
            return {
                chatMsgs: state.chatMsgs.map(msg => {
                    if (msg.from === from && msg.to === to && !msg.read) {
                        // msg.read = true // 不能直接修改状态
                        return { ...msg, read: true }
                    } else {
                        return msg
                    }
                }),
                users: state.users,
                unReadCount: state.unReadCount - count
            }
        default:
            return state
    }
}

// 返回合并的 reducer
export default combineReducers({
    user,
    userList,
    chat
})