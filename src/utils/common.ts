import { Router } from 'vue-router'

/**
 * 设置浏览器标题
 * @param router vue路由
 */
export const setBrowserTitle = (router: Router) => {
  if (typeof router.currentRoute.value.meta.title === 'string') {
    document.title = router.currentRoute.value.meta.title as string
  }
}

/**
 * 生成范围随机数
 * @param min 最小值
 * @param max 最大值
 */
export const randomTimeout = (min = 10, max = 500): number => {
  return Math.floor(Math.random() * (max - min)) + min
}
