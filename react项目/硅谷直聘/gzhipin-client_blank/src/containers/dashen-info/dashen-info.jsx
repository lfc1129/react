/*大神信息完善路由组件
*/
import React, { Component } from 'react'
import { NavBar, InputItem, TextareaItem, Button } from 'antd-mobile'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import HeaderSelector from '../../components/header-selector/header-selector'
import { updateUser } from '../../redux/actions'
class DashenInfo extends Component {
    state = {
        header: '', // 头像名称
        info: '', // 个人简介
        post: '', // 求职岗位
    }
    handleChange = (name, val) => {
        this.setState({ [name]: val })
    }
    // 设置更新 header
    setHeader = (header) => {
        this.setState({ header })
    }
    save = () => {
        this.props.updateUser(this.state)
    }
    render() {
        console.log(this.props)
        // 如果信息已经完善, 自动重定向到对应主界面
        const {header, type} = this.props.user
        if(header) { // 说明信息已经完善
        const path = type==='dashen' ? '/dashen' : '/laoban'
        return <Redirect to={path}/>
        }
        return (
            <div>
                <NavBar>大神信息完善</NavBar>
                <HeaderSelector setHeader={this.setHeader} />
                <InputItem onChange={val => this.handleChange('post', val)}>求职岗
    位:</InputItem>
                <TextareaItem title="个人介绍:"
                    rows={3}
                    onChange={val => this.handleChange('info', val)} />
                <Button type='primary' onClick={() => this.props.updateUser(this.state)}>保存
    </Button>
            </div>
        )
    }
}
export default connect(
    state => ({ user: state.user }),
    { updateUser }
)(DashenInfo)