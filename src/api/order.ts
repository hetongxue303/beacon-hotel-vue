import axios from '../utils/request'
import { QueryOrder } from '../types/query'
import { OrderEntity } from '../types/entity'

const baseApi = import.meta.env.VITE_BASIC_API

const getOrderPageList = (params: QueryOrder) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/order/page/list`,
    params
  })
}
const addOrder = (data: OrderEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/order/add`,
    data
  })
}
const bookingOrder = (data: OrderEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/order/booking`,
    data
  })
}
const deleteOrder = (id: number) => {
  return axios({
    method: 'DELETE',
    url: `${baseApi}/order/delete/${id}`
  })
}
const updateOrder = (data: OrderEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/order/update`,
    data
  })
}
const updateOrderStatus = (data: OrderEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/order/update/status`,
    data
  })
}

export {
  getOrderPageList,
  addOrder,
  deleteOrder,
  updateOrder,
  updateOrderStatus,
  bookingOrder
}
