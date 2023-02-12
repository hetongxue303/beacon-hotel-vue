import axios from '../utils/request'
import { QueryUser } from '../types/query'
import { UserEntity } from '../types/entity'

const baseApi = import.meta.env.VITE_BASIC_API

const getUserList = (params: QueryUser) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/user/list`,
    params
  })
}
const addUser = (data: UserEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/user/add`,
    data
  })
}
const deleteUser = (id: number) => {
  return axios({
    method: 'DELETE',
    url: `${baseApi}/user/delete/${id}`
  })
}
const updateUser = (data: UserEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/user/update`,
    data
  })
}

export { getUserList, addUser, deleteUser, updateUser }
