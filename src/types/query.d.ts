interface QueryPage {
  page: number
  size: number
}

interface QueryType extends QueryPage {
  room_type_name?: string
}

interface QueryUser extends QueryPage {
  real_name?: string
  is_status?: boolean
}

interface QueryRole extends QueryPage {
  role_name?: string
  is_status?: boolean
}

interface QueryRoom extends QueryPage {
  room_name?: string
  is_status?: boolean
  room_type_id?: number
}
interface QueryOrder extends QueryPage {
  order_num?: string
  is_status?: string
}
export { QueryType, QueryUser, QueryRole, QueryRoom, QueryOrder }
