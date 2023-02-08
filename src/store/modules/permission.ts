import {defineStore} from "pinia";

export const usePermissionStore = defineStore('permission', {
    state: (): PermissionType => {
        return {}
    },
    getters: {},
    actions: {},
    persist: {key: 'permission'}
})