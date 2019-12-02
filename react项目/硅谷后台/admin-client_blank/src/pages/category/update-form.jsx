import React, { Component } from 'react'
import { Form, Input } from 'antd'
import PropTypes from 'prop-types'
const Item = Form.Item

/*更新分类的 Form 组件
*/
class UpdateForm extends Component {
    static propTypes = {
        categoryName: PropTypes.string,
        setForm: PropTypes.func.isRequired,
    }
    componentWillMount() {
        this.props.setForm(this.props.form)
    }
    render() {
        const { getFieldDecorator } = this.props.form
        const { categoryName } = this.props
        return (
            <Form>
                <Item>
                    {
                        getFieldDecorator('categoryName', {
                            initialValue: categoryName,
                            rules: [
                                {required: true, message: '分类名称必须输入'}
                            ]
                        })(
                            <Input placeholder='请输入分类名称' /> 
                        )
                    }
                </Item>
            </Form>
        )
    }
}
export default UpdateForm = Form.create()(UpdateForm)