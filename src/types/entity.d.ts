interface Base {
  create_time?: Date
  update_time?: Date
}

interface TypeEntity extends Base {
  room_type_id?: number /* 房间类型ID */
  room_type_name?: string /* 房间类型 */
  description?: string /* 房间备注 */
}

interface UserEntity extends Base {
  user_id?: number
  username?: string
  password?: string
  real_name?: string
  gender?: string
  is_status?: boolean
  description?: string
}

interface RoleEntity extends Base {
  role_id?: number
  role_name?: string
  is_status?: boolean
  description?: string
}

interface MenuEntity extends Base {
  menu_id?: number
  menu_name?: string
  menu_type?: string
  icon?: string
  router_name?: string
  router_path?: string
  permission?: string
  sort?: number
}

interface RoomEntity extends Base {
  room_id?: number /* 客房ID */
  room_name?: string /* 客房名称 */
  room_type_id?: number /* 客房类型ID */
  type?: TypeEntity /* 客房类型 */
  room_price?: number /* 客房价格 */
  room_bed?: number /* 客房床位 */
  room_count?: number /* 可住人数 */
  is_status?: boolean /* 客房状态 */
  room_images?: string /* 客房图片 */
  room_detail?: string /* 客房详情 */
}

interface CustomerEntity extends Base {
  customer_id?: number
  customer_name?: string
  customer_account?: string
  customer_password?: string
  is_status?: boolean
  description?: string
}

interface CustomerLoginDto {
  customer_account: string
  customer_password: string
}

interface OrderEntity extends Base {
  order_id?: number /* 订单ID */
  order_num?: string /* 订单编号 */
  customer_id?: number /* 顾客ID */
  customer?: CustomerEntity /* 顾客信息 */
  room_id?: number /* 房间ID */
  room?: RoomEntity /* 房间信息 */
  is_status?: string /* 入住状态：1->已预约 2->已入住 3->已退房 */
}

export {
  TypeEntity,
  UserEntity,
  RoleEntity,
  MenuEntity,
  RoomEntity,
  OrderEntity,
  CustomerLoginDto,
  CustomerEntity
}
