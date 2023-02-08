import {defineStore} from "pinia";

export const useSettingStore = defineStore('settings', {
    state: (): SettingsType => {
        return {}
    },
    getters: {},
    actions: {},
    persist: {key: 'settings'}
})