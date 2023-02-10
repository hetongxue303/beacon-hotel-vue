import router from './router'
import NProgress from './plugins/nProgress'
import { setBrowserTitle } from './utils/common'

const REQUEST_WITHE_LIST: string[] = ['/login', '/register']

router.beforeEach(async (to, from, next) => {
  NProgress.start()
  // TODO 判断登陆权限问题
  next()
  NProgress.done()
})
router.afterEach(() => {
  NProgress.done()
  setBrowserTitle(router)
})
