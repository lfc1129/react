/*对话聊天的路由组件
*/
import React, { Component } from 'react'
import { NavBar, List, InputItem, Grid, Icon } from 'antd-mobile'
import { connect } from 'react-redux'
import { sendMsg,readMsg } from '../../redux/actions'
import QueueAnim from 'rc-queue-anim'
const Item = List.Item
class Chat extends Component {
    state = {
        content: '',
        isShow: false // 是否显示表情列表
    }
     // 在第一次render()之前回调
    componentWillMount () {
        // 初始化表情列表数据
        const emojis = ['😀', '😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣','😀'
        ,'😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣'
        ,'😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣'
        ,'😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣','😀', '😁', '🤣']
        this.emojis = emojis.map(emoji => ({text: emoji}))
    }
    componentDidMount() {
        // 初始显示列表
        window.scrollTo(0, document.body.scrollHeight)
    }
    componentDidUpdate () {
        // 更新显示列表
        window.scrollTo(0, document.body.scrollHeight)
    }
    handleSend = () => {
       // 收集数据
    const from = this.props.user._id
    const to = this.props.match.params.userid
    const content = this.state.content.trim()
    // 发送请求(发消息)
    if(content) {
      this.props.sendMsg({from, to, content})
    }
        this.setState({ 
            content: '',
            isShow: false 
        })
    }
    toggleShow = () => {
        const isShow = !this.state.isShow
        this.setState({isShow})
        if(isShow) {
          // 异步手动派发resize事件,解决表情列表显示的bug
          setTimeout(() => {
            window.dispatchEvent(new Event('resize'))
          }, 0)
        }
    }
    render() {
        const { user } = this.props
        const { chatMsgs, users } = this.props.chat
        const targetId = this.props.match.params.userid
        if (!users[targetId]) {
            return null
        }
        const meId = user._id
        const chatId = [targetId, meId].sort().join('_')
        const msgs = chatMsgs.filter(msg => msg.chat_id === chatId)
        const targetIcon = users[targetId].header ? require(`../../assets/imgs/${users[targetId].header}.png`) : null

        return (
            <div id='chat-page'>
              <NavBar
                icon={<Icon type='left'/>}
                className='sticky-header'
                onLeftClick={()=> this.props.history.goBack()}
              >
                {users[targetId].username}
              </NavBar>
              <List style={{marginTop:50, marginBottom: 50}}>
                {/*alpha left right top bottom scale scaleBig scaleX scaleY*/}
                <QueueAnim type='left' delay={100}>
                  {
                    msgs.map(msg => {
                      if(targetId===msg.from) {// 对方发给我的
                        return (
                          <Item
                            key={msg._id}
                            thumb={targetIcon}
                          >
                            {msg.content}
                          </Item>
                        )
                      } else { // 我发给对方的
                        return (
                          <Item
                            key={msg._id}
                            className='chat-me'
                            extra='我'
                          >
                            {msg.content}
                          </Item>
                        )
                      }
                    })
                  }
                </QueueAnim>
      
              </List>
      
              <div className='am-tab-bar'>
                <InputItem
                  placeholder="请输入"
                  value={this.state.content}
                  onChange={val => this.setState({content: val})}
                  onFocus={() => this.setState({isShow: false})}
                  extra={
                    <span>
                      <span onClick={this.toggleShow} style={{marginRight:5}}>😊</span>
                      <span onClick={this.handleSend}>发送</span>
                    </span>
                  }
                />
                {this.state.isShow ? (
                  <Grid
                    data={this.emojis}
                    columnNum={8}
                    carouselMaxRow={4}
                    isCarousel={true}
                    onClick={(item) => {
                      this.setState({content: this.state.content + item.text})
                    }}
                  />
                ) : null}
      
              </div>
            </div>
          )
    }
}
export default connect(
    state => ({ user: state.user, chat: state.chat }),
    { sendMsg, readMsg }
)(Chat)