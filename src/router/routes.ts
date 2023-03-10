import { RouteRecordRaw } from 'vue-router'
import Layout from '@layout/Index.vue'

export const routes: RouteRecordRaw[] = [
  {
    name: 'login',
    path: '/login',
    meta: {
      title: '用户登录',
      cache: false
    },
    component: () => import('@views/login.vue')
  },
  {
    name: 'home',
    path: '/home',
    meta: {
      title: '首页',
      cache: false
    },
    component: () => import('@views/home/index.vue')
  },
  {
    path: '/',
    name: 'main',
    component: Layout,
    redirect: '/dashboard',
    meta: { cache: false },
    children: [
      {
        name: 'dashboard',
        path: '/dashboard',
        meta: {
          title: '首页',
          cache: false
        },
        component: () => import('@views/dashboard/index.vue')
      },
      {
        name: '401',
        path: '/401',
        meta: {
          title: '权限不足',
          cache: false
        },
        component: () => import('@views/error/401.vue')
      },
      {
        name: '404',
        path: '/:pathMatch(.*)*',
        meta: {
          title: '页面不存在',
          cache: false
        },
        component: () => import('@views/error/404.vue')
      }
    ]
  }
  /* 动态路由 */
  // {
  //   path: '/',
  //   component: Layout,
  //   meta: { cache: false },
  //   children: [
  //     {
  //       name: 'type',
  //       path: '/type',
  //       meta: {
  //         title: '客房类型',
  //         cache: false
  //       },
  //       component: () => import('@views/type/index.vue')
  //     },
  //     {
  //       name: 'room',
  //       path: '/room',
  //       meta: {
  //         title: '客房管理',
  //         cache: false
  //       },
  //       component: () => import('@views/room/index.vue')
  //     },
  //     {
  //       name: 'reservation',
  //       path: '/reservation',
  //       meta: {
  //         title: '预约管理',
  //         cache: false
  //       },
  //       component: () => import('@views/reservation/index.vue')
  //     },
  //     {
  //       name: 'customer',
  //       path: '/customer',
  //       meta: {
  //         title: '客户管理',
  //         cache: false
  //       },
  //       component: () => import('@views/customer/index.vue')
  //     },
  //     {
  //       name: 'reservation',
  //       path: '/order/reservation',
  //       meta: {
  //         title: '预约订单',
  //         cache: false
  //       },
  //       component: () => import('@views/order/reservation/index.vue')
  //     },
  //     {
  //       name: 'stay',
  //       path: '/order/stay',
  //       meta: {
  //         title: '入住订单',
  //         cache: false
  //       },
  //       component: () => import('@views/order/stay/index.vue')
  //     },
  //     {
  //       name: 'all',
  //       path: '/order/all',
  //       meta: {
  //         title: '所有订单',
  //         cache: false
  //       },
  //       component: () => import('@views/order/all/index.vue')
  //     },
  //     {
  //       name: 'user',
  //       path: '/system/user',
  //       meta: {
  //         title: '用户管理',
  //         cache: false
  //       },
  //       component: () => import('@views/system/user/index.vue')
  //     },
  //     {
  //       name: 'role',
  //       path: '/system/role',
  //       meta: {
  //         title: '角色管理',
  //         cache: false
  //       },
  //       component: () => import('@views/system/role/index.vue')
  //     },
  //     {
  //       name: 'menu',
  //       path: '/system/menu',
  //       meta: {
  //         title: '菜单管理',
  //         cache: false
  //       },
  //       component: () => import('@views/system/menu/index.vue')
  //     },
  //     {
  //       name: 'about',
  //       path: '/about',
  //       meta: {
  //         title: '关于系统',
  //         cache: false
  //       },
  //       component: () => import('@views/about/index.vue')
  //     }
  //   ]
  // }
]
