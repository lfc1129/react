import React, { Component } from 'react';
import { NavBar, InputItem, TextareaItem, Button } from 'antd-mobile'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import HeaderSelector from '../../components/header-selector/header-selector'
import { updateUser } from '../../redux/actions'

class LaobanInfo extends Component {
    state = {
        header: '', // 头像名称
        info: '', // 职位简介
        post: '', // 职位名称
        company: '', // 公司名称
        salary: '' // 工资
    }
    handleChange = (name, val) => {
        this.setState({ [name]: val })
    }
     // 设置更新 header
    setHeader = (header) => {
        this.setState({ header })
    }
    render() {
         // 如果信息已经完善, 自动重定向到对应主界面
         const {header, type} = this.props.user
         if(header) { // 说明信息已经完善
         const path = type==='dashen' ? '/dashen' : '/laoban'
         return <Redirect to={path}/>
         }
        return (
            <div>
                <NavBar>老板信息完善</NavBar>
                <HeaderSelector setHeader={this.setHeader} />
                <InputItem onChange={val => this.handleChange('post', val)}>招聘职
位:</InputItem>
                <InputItem onChange={val => this.handleChange('company', val)}>公司名
称:</InputItem>
                <InputItem onChange={val => this.handleChange('salary', val)}>职位薪
资:</InputItem>
                <TextareaItem title="职位要求:"
                    rows={3}
                    onChange={val => this.handleChange('info', val)} />
                <Button type='primary' onClick={() => this.props.updateUser(this.state)}>保存
</Button>
            </div>
        );
    }
}

export default connect(
    state => ({ user: state.user }),
    { updateUser }
)(LaobanInfo)
