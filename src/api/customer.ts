import axios from '../utils/request'
import { QueryCustomer } from '../types/query'
import { CustomerEntity, CustomerLoginDto } from '../types/entity'

const baseApi = import.meta.env.VITE_BASIC_API

const getCustomerPageList = (params: QueryCustomer) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/customer/page/list`,
    params
  })
}
const insertCustomer = (data: CustomerEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/customer/insert`,
    data
  })
}
const customerLogin = (data: CustomerLoginDto) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/customer/login`,
    data
  })
}
const customerLogout = () => {
  return axios({
    method: 'GET',
    url: `${baseApi}/customer/logout`
  })
}
const deleteCustomer = (id: number) => {
  return axios({
    method: 'DELETE',
    url: `${baseApi}/customer/delete/${id}`
  })
}
const updateCustomer = (data: CustomerEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/customer/update`,
    data
  })
}
const updateCustomerStatus = (data: CustomerEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/customer/update/status`,
    data
  })
}
const updateCustomerPassword = (data: CustomerEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/customer/update/password`,
    data
  })
}

export {
  getCustomerPageList,
  insertCustomer,
  deleteCustomer,
  updateCustomer,
  updateCustomerStatus,
  customerLogin,
  customerLogout,
  updateCustomerPassword
}
