import { defineStore } from 'pinia'
import { HomeType } from '../../types/pinia'
import { customerLogout } from '../../api/customer'
import { ElMessage } from 'element-plus'
import { DURATION_TIME } from '../../settings'

export const useHomeStore = defineStore('home', {
  state: (): HomeType => {
    return {
      is_login: false,
      is_admin: false,
      login_info: {}
    }
  },
  getters: {},
  actions: {
    logout(state?: string) {
      customerLogout()
        .then(({ data }) => {
          if (data.code === 200) {
            if (!state) {
              ElMessage.success({
                message: '注销成功',
                duration: DURATION_TIME
              })
            }
            this.$reset()
          }
        })
        .catch(() => {
          if (!state) {
            ElMessage.error({
              message: '注销失败',
              duration: DURATION_TIME
            })
          }
        })
    }
  },
  persist: { key: 'home' }
})
