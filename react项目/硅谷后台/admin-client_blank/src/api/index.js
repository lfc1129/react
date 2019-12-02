/*包含 n 个接口请求函数的模块
每个函数返回 promise
*/
import jsonp from 'jsonp'
import { message } from 'antd'
import ajax from './ajax'

// 登陆
export const reqLogin = (username, password) => ajax('/login', { username, password },
  'POST')

/*
json请求的接口请求函数
 */
export const reqWeather = (city) => {

  return new Promise((resolve, reject) => {
    const url = `http://api.map.baidu.com/telematics/v3/weather?location=${city}&output=json&ak=3p49MVra6urFRGOT9s8UBWr2`
    // 发送jsonp请求
    jsonp(url, {}, (err, data) => {
      // console.log('jsonp()', err, data)
      // 如果成功了
      if (!err && data.status === 'success') {
        // 取出需要的数据
        const { dayPictureUrl, weather } = data.results[0].weather_data[0]
        resolve({ dayPictureUrl, weather })
      } else {
        // 如果失败了
        message.error('获取天气信息失败!')
      }

    })
  })
}

// 获取一级或某个二级分类列表
export const reqCategorys = (parentId) => ajax('/manage/category/list', { parentId })
// 添加分类
export const reqAddCategory = (parentId, categoryName) => ajax('/manage/category/add',
  {
    parentId,
    categoryName
  }, 'POST')
// 更新品类名称
export const reqUpdateCategory = ({ categoryId, categoryName }) =>
  ajax('/manage/category/update', {
    categoryId,
    categoryName
  }, 'POST')

// 获取一个分类
export const reqCategory = (categoryId) => ajax('/manage/category/info', { categoryId })
// 获取商品分页列表 
export const reqProducts = (pageNum, pageSize) => ajax('/manage/product/list', { pageNum, pageSize })

export const reqSearchProducts = ({ pageNum, pageSize, searchType, searchName }) => ajax('/manage/product/search', { pageNum, pageSize, [searchType]: searchName, })

// 更新商品的状态(上架/下架)
export const reqUpdateStatus = (productId, status) => ajax('/manage/product/updateStatus', {productId, status}, 'POST')

