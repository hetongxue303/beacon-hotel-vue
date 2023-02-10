interface QueryPage {
  current_page: number
  page_size: number
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
export { QueryType, QueryUser, QueryRole }
