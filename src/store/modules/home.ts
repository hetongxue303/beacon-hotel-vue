import { defineStore } from 'pinia'
import { HomeType } from '../../types/pinia'

export const useHomeStore = defineStore('home', {
  state: (): HomeType => {
    return {
      is_login: false,
      login_info: {},
      is_admin: false
    }
  },
  getters: {},
  actions: {
    logout() {
      this.$reset()
    }
  },
  persist: { key: 'home' }
})
