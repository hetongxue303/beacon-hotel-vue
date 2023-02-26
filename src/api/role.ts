import axios from '../utils/request'
import { QueryRole } from '../types/query'
import { MenuInfoDto, RoleEntity } from '../types/entity'

const baseApi = import.meta.env.VITE_BASIC_API

const getRolePageList = (params: QueryRole) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/role/page/list`,
    params
  })
}
const addRole = (data: MenuInfoDto) => {
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
const deleteBatchRole = (data: number[]) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/role/delete/batch`,
    data
  })
}
const updateRole = (data: RoleEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/role/update`,
    data
  })
}
const updateRoleInfo = (data: MenuInfoDto) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/role/update/info`,
    data
  })
}

export {
  getRolePageList,
  addRole,
  deleteRole,
  updateRole,
  updateRoleInfo,
  deleteBatchRole
}
