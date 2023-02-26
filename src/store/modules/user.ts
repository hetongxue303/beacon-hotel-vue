import { defineStore } from 'pinia'
import { getToken } from '../../utils/auth'
import { UserType } from '../../types/pinia'

export const useUserStore = defineStore('user', {
  state: (): UserType => {
    return {
      authorization: getToken() || '',
      avatar: '',
      username: '',
      roles: [],
      isAdmin: false
    }
  },
  getters: {
    getAuthorization: (state) => state.authorization,
    getRoles: (state) => state.roles,
    getUsername: (state) => state.username,
    getAvatar: (state) => state.avatar,
    getIsAdmin: (state) => state.isAdmin
  },
  actions: {},
  persist: { key: 'user' }
})
