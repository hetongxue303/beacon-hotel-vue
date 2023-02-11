import axios from '../utils/request'
import { TypeEntity } from '../types/entity'
import { QueryType } from '../types/query'

const baseApi = import.meta.env.VITE_BASIC_API

const getRoomTypeList = (params: QueryType) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/type/list`,
    params
  })
}
const addRoomType = (data: TypeEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/type/add`,
    data
  })
}
const deleteRoomType = (id: number) => {
  return axios({
    method: 'DELETE',
    url: `${baseApi}/type/delete/${id}`
  })
}
const updateRoomType = (data: TypeEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/type/update`,
    data
  })
}

export { getRoomTypeList, addRoomType, deleteRoomType, updateRoomType }
