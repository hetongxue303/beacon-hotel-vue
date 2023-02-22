import axios from '../utils/request'
import { QueryIndex } from '../types/query'

const baseApi = import.meta.env.VITE_BASIC_API

const getIndexPageList = (params: QueryIndex) => {
  return axios({
    method: 'GET',
    url: `${baseApi}/index/page/list`,
    params
  })
}

export { getIndexPageList }
