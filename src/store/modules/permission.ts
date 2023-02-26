import { defineStore } from 'pinia'
import { PermissionType } from '../../types/pinia'

export const usePermissionStore = defineStore('permission', {
  state: (): PermissionType => {
    return {}
  },
  getters: {},
  actions: {},
  persist: { key: 'permission' }
})
