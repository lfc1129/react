import React, { Component } from 'react';
import {
    Card,
    Select,
    Input,
    Button,
    Icon,
    Table,
    message
} from 'antd'
import LinkButton from '../../components/link-button'
import { reqProducts, reqSearchProducts, reqUpdateStatus } from '../../api'
import { PAGE_SIZE } from '../../utils/constants'

const Option = Select.Option

export class home extends Component {
    state = {
        total: 0, // 商品的总数量
        products: [], // 当前页列表数据
        searchType: 'productName', // 搜索类型 productName / productDesc
        searchName: '', // 搜索关键字
    }


    componentDidMount() {
        this.getProducts(1)
    }

    componentWillMount() {
        this.initColumns()
    }

    /*初始化生成 Tabe 所有列的数组
*/
    initColumns = () => {
        this.columns = [
            {
                title: '商品名称',
                dataIndex: 'name'
            },
            {
                title: '商品描述',
                dataIndex: 'desc'
            },
            {
                title: '价格',
                dataIndex: 'price',
                render: (price) => <span>¥{price}</span>
            },
            {
                title: '状态',
                width: 100,
                dataIndex: 'status',
                render: (status, product) => { // 1: 在售, 2: 已下架
                    let btnText = '下架'
                    let statusText = '在售'
                    if (status === 2) {
                        btnText = '上架'
                        statusText = '已下架'
                    }
                    status = status === 1 ? 2 : 1
                    return (
                        <span>
                            <Button type='primary' onClick={() =>
                                this.updateStatus(product._id, status)}>{btnText}</Button>
                            <span>{statusText}</span>
                        </span>
                    )
                }
            },
            {
                title: '操作',
                width: 100,
                render: (product) => (
                    <span>
                        <LinkButton onClick={() => this.props.history.push('/product/detail',
                            product)}>详情</LinkButton>
                        <LinkButton onClick={() => this.props.history.push('/product/addupdate',
                            product)}>修改</LinkButton>
                    </span>
                )
            },
        ]
    }

    /*
  更新指定商品的状态
   */
  updateStatus = async (productId, status) => {
    const result = await reqUpdateStatus(productId, status)
    if(result.status===0) {
      message.success('更新商品成功')
      this.getProducts(this.pageNum)
    }
  }
  
    getProducts = async (pageNum) => {
        this.pageNum = pageNum
       
        const { searchType, searchName } = this.state
        let result
        if (searchName) { // 搜索分页
            result = await reqSearchProducts({
                pageNum, pageSize: PAGE_SIZE, searchType,
                searchName
            })
        } else { // 一般分页
            result = await reqProducts(pageNum, PAGE_SIZE)
        }
       
        if (result.status === 0) {
            const { total, list } = result.data
            this.setState({
                total,
                products: list
            })
        }
    }



    render() {

        const { products, total, searchType } = this.state
        const title = (
            <span>
                <Select value={searchType} onChange={value => this.setState({
                    searchType:
                        value
                })}>
                    <Option key='productName' value='productName'>按名称搜索</Option>
                    <Option key='productDesc' value='productDesc'>按描述搜索</Option>
                </Select>
                <Input style={{ width: 150, marginLeft: 10, marginRight: 10 }} placeholder=' 关键字'
                    onChange={(e) => this.setState({ searchName: e.target.value })} />
                <Button type='primary' onClick={() => this.getProducts(1)}>搜索</Button>
            </span>
        )
        const extra = (
            <Button type='primary' style={{ float: 'right' }} onClick={() =>
                this.props.history.push('/product/addupdate')}>
                <Icon type='plus' />
                添加商品
        </Button>
        )

        return (
            <div>
                <Card title={title} extra={extra}>
                    <Table
                        bordered
                        rowKey='_id'
                        columns={this.columns}
                        dataSource={products}
                        pagination={{
                            defaultPageSize: PAGE_SIZE,
                            total,
                            showQuickJumper: true,
                            onChange: this.getProducts
                        }}
                    />
                </Card>
            </div>
        );
    }
}

export default home;
