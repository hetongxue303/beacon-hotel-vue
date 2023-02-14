import axios from '../utils/request'
import { QueryRole } from '../types/query'
import { RoleEntity } from '../types/entity'

const baseApi = import.meta.env.VITE_BASIC_API

const getRolePageList = (params: QueryRole) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/role/page/list`,
    params
  })
}
const addRole = (data: RoleEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/role/add`,
    data
  })
}
const deleteRole = (id: number) => {
  return axios({
    method: 'DELETE',
    url: `${baseApi}/role/delete/${id}`
  })
}
const updateRole = (data: RoleEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/role/update`,
    data
  })
}

export { getRolePageList, addRole, deleteRole, updateRole }
