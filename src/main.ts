import {createApp} from 'vue'
import App from './App.vue'

import router from './router'
import pinia from './store'
import ElementPlus from './plugins/element-plus'
import directive from './directive/Index'

import '@assets/styles/index.scss'
import 'virtual:windi.css'
import 'animate.css'

import '@/permission'

const app = createApp(App)

app.use(router).use(pinia).use(ElementPlus).use(directive)

app.mount('#app')
