import {defineStore} from 'pinia'

export const useAppStore = defineStore('app', {
    state: (): AppType => {
        return {
            collapse: false
        }
    },
    getters: {
        getCollapse: (state) => state.collapse
    },
    actions: {
        setCollapse(status: boolean) {
            this.collapse = status
        }
    },
    persist: {key: 'app'}
})