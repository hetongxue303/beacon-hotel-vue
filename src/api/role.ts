import axios from '../utils/request'
import { QueryRole } from '../types/query'
import { RoleEntity } from '../types/entity'

const baseApi = import.meta.env.VITE_BASIC_API

const getRoleList = (params: QueryRole) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/role/list`,
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

export { getRoleList, addRole, deleteRole, updateRole }
