import { CustomerEntity, MenuEntity } from './entity'
import { Menu } from './element'
import { RouteRecordRaw } from 'vue-router'

interface AppType {
  collapse: boolean
}

interface UserType {
  authorization: string
  username: string
  avatar: string
  is_Status?: boolean
  roles: string
  isAdmin: boolean
}

interface TabsType {
  tabs: Array<any>
  activeName: string
  currentTabName: string
  isContextMenu?: boolean
}

interface HomeType {
  is_login: boolean
  login_info: CustomerEntity
  is_admin: boolean
}

interface PermissionType {
  rawMenu: MenuEntity[]
  menuItem: Menu[]
  routers: RouteRecordRaw[]
  permission: string[]
}

interface SettingsType {}
