import React, { Component } from 'react';
import { TabBar } from 'antd-mobile'
import PropTypes from 'prop-types'
import {withRouter} from 'react-router-dom'

const Item = TabBar.Item

class NavFooter extends Component {
    static propTypes = {
        navList: PropTypes.array.isRequired,
        unReadCount: PropTypes.number.isRequired
    }
    render() {
          let {navList, unReadCount} = this.props
          navList = navList.filter(nav => !nav.hide) // 回调函数返回值为 true, 当前元素就会留下, 否则不留
          const path = this.props.location.pathname // 请求的path
          return (
            <TabBar>
                {
                    
                    navList.map((nav) => (
                        <Item key={nav.path}
                            badge={nav.path==='/message' ? unReadCount : 0}
                            title={nav.text}
                            icon={{ uri: require(`./imgs/${nav.icon}.png`) }}
                            selectedIcon={{ uri: require(`./imgs/${nav.icon}-selected.png`) }}
                            selected={path === nav.path}
                            onPress={() => {
                                this.props.history.replace(nav.path)
                            }}
                        />
                    ))
                }
            </TabBar>
        );
    }
}

export default withRouter(NavFooter) // 让非路由组件可以访问到路由组件的 API