export const menus: Array<any> = [
  {
    name: '首页',
    icon: 'index',
    path: '/dashboard'
  },
  {
    name: '楼层管理',
    icon: 'index',
    path: '/storey'
  },
  {
    name: '客房类型',
    icon: 'index',
    path: '/type'
  },
  {
    name: '客房管理',
    icon: 'index',
    path: '/room'
  },
  {
    name: '预约管理',
    icon: 'index',
    path: '/reservation'
  },
  {
    name: '客户管理',
    icon: 'index',
    path: '/customer'
  },
  {
    name: '订单管理',
    icon: 'index',
    path: '/order'
  },
  {
    name: '系统管理',
    icon: 'system',
    path: '/system',
    children: [
      {
        name: '员工管理',
        icon: 'user',
        path: '/system/user'
      },
      {
        name: '角色管理',
        icon: 'role',
        path: '/system/role'
      },
      {
        name: '菜单管理',
        icon: 'menu',
        path: '/system/menu'
      }
    ]
  },
  {
    name: '关于系统',
    icon: 'about',
    path: '/about'
  }
]
