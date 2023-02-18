import { CustomerEntity } from './entity'

interface AppType {
  collapse: boolean
}

interface UserType {
  authorization: string
  username: string
  avatar: string
  roles: string[]
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
interface PermissionType {}

interface SettingsType {}
