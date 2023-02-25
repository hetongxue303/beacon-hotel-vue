import axios from '../utils/request'
import { QueryMenu, QueryMenuTree } from '../types/query'
import { MenuEntity } from '../types/entity'

const baseApi = import.meta.env.VITE_BASIC_API

const getMenuList = () => {
  return axios({
    method: 'GET',
    url: `${baseApi}/menu/list`
  })
}
const getMenuPageList = (params: QueryMenu) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/menu/page/list`,
    params
  })
}
const getMenuTreeList = (params: QueryMenuTree) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/menu/tree`,
    params
  })
}
const addMenu = (data: MenuEntity) => {
  return axios({
    method: 'POST',
    url: `${baseApi}/menu/add`,
    data
  })
}
const deleteMenu = (id: number) => {
  return axios({
    method: 'DELETE',
    url: `${baseApi}/menu/delete/${id}`
  })
}
const updateMenu = (data: MenuEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/menu/update`,
    data
  })
}
const updateMenuStatus = (data: MenuEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/menu/update/status`,
    data
  })
}
const updateMenuShow = (data: MenuEntity) => {
  return axios({
    method: 'PUT',
    url: `${baseApi}/menu/update/show`,
    data
  })
}
export {
  addMenu,
  deleteMenu,
  updateMenu,
  updateMenuStatus,
  updateMenuShow,
  getMenuList,
  getMenuTreeList,
  getMenuPageList
}
