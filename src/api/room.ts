import axios from '../utils/request'
import { RoomEntity } from '../types/entity'
import { QueryRoom } from '../types/query'

const baseApi = import.meta.env.VITE_BASIC_API

const getRoomPageList = (params: QueryRoom) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/room/page/list`,
    params
  })
}
const addRoom = (data: RoomEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/room/add`,
    data
  })
}
const deleteRoom = (id: number) => {
  return axios({
    method: 'DELETE',
    url: `${baseApi}/room/delete/${id}`
  })
}
const updateRoom = (data: RoomEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/room/update`,
    data
  })
}
const updateRoomStatus = (data: RoomEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/room/update/status`,
    data
  })
}

export { getRoomPageList, addRoom, deleteRoom, updateRoom, updateRoomStatus }
