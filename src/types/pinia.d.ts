type AppType = {
  collapse: boolean
}
type UserType = {
  authorization: string
  username: string
  avatar: string
  roles: string[]
  isAdmin: boolean
}
type TabsType = {
  tabs: Array<any>
  activeName: string
  currentTabName: string
  isContextMenu?: boolean
}
type PermissionType = {}
type SettingsType = {}
