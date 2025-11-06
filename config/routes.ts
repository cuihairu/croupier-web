/**
 * @name umi 的路由配置
 * @description 只支持 path,component,routes,redirect,wrappers,name,icon 的配置
 * @param path  path 只支持两种占位符配置，第一种是动态参数 :id 的形式，第二种是 * 通配符，通配符只能出现路由字符串的最后。
 * @param component 配置 location 和 path 匹配后用于渲染的 React 组件路径。可以是绝对路径，也可以是相对路径，如果是相对路径，会从 src/pages 开始找起。
 * @param routes 配置子路由，通常在需要为多个路径增加 layout 组件时使用。
 * @param redirect 配置路由跳转
 * @param wrappers 配置路由组件的包装组件，通过包装组件可以为当前的路由组件组合进更多的功能。 比如，可以用于路由级别的权限校验
 * @param name 配置路由的标题，默认读取国际化文件 menu.ts 中 menu.xxxx 的值，如配置 name 为 login，则读取 menu.ts 中 menu.login 的取值作为标题
 * @param icon 配置路由的图标，取值参考 https://ant.design/components/icon-cn， 注意去除风格后缀和大小写，如想要配置图标为 <StepBackwardOutlined /> 则取值应为 stepBackward 或 StepBackward，如想要配置图标为 <UserOutlined /> 则取值应为 user 或者 User
 * @doc https://umijs.org/docs/guides/routes
 */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      {
        name: 'login',
        path: '/user/login',
        component: './User/Login',
      },
    ],
  },
  {
    path: '/admin',
    name: 'AdminUsers',
    icon: 'team',
    routes: [
      {
        path: '/admin/account',
        name: 'UserAccount',
        icon: 'user',
        routes: [
          { path: '/admin/account/center', name: 'Center', component: './Account/Center' },
          { path: '/admin/account/settings', name: 'Settings', component: './Account/Settings' },
          { path: '/admin/account/messages', name: 'Messages', component: './Account/Messages' },
        ],
      },
      {
        path: '/admin/permissions',
        name: 'Permissions',
        icon: 'safety',
        access: 'canPermissionManage',
        routes: [
          {
            path: '/admin/permissions',
            redirect: '/admin/permissions/roles',
          },
          {
            path: '/admin/permissions/roles',
            name: 'Roles',
            access: 'canRoleManage',
            component: './Permissions/RolesV2',
          },
          {
            path: '/admin/permissions/users',
            name: 'Users',
            access: 'canUserManage',
            component: './Permissions/UsersV2',
          },
          {
            path: '/admin/permissions/config',
            name: 'Config',
            access: 'canPermissionConfig',
            component: './Permissions/Config',
          },
        ],
      },
    ],
  },
  {
    path: '/game',
    name: 'GameManagement',
    icon: 'control',
    access: 'canGamesRead',
    routes: [
      {
        path: '/game',
        redirect: '/game/meta',
      },
      // 游戏基础配置
      {
        path: '/game/meta',
        name: 'GameMeta',
        access: 'canGamesRead',
        component: './GamesMeta',
      },
      {
        path: '/game/environments',
        name: 'GameEnvironments',
        access: 'canGamesRead',
        component: './GamesEnvs',
      },
      // 游戏内容管理
      {
        path: '/game/entities',
        name: 'GameEntities',
        access: 'canEntitiesRead',
        component: './Entities',
      },
      {
        path: '/game/functions',
        name: 'GameFunctions',
        access: 'canFunctionsRead',
        component: './GmFunctions',
      },
      // 游戏运营管理
      {
        path: '/game/assignments',
        name: 'GameAssignments',
        access: 'canAssignmentsRead',
        component: './Assignments',
      },
      {
        path: '/game/packs',
        name: 'GamePacks',
        access: 'canPacksRead',
        component: './Packs',
      },
    ],
  },
  {
    path: '/operations',
    name: 'Operations',
    icon: 'dashboard',
    routes: [
      {
        path: '/operations',
        redirect: '/operations/approvals',
      },
      {
        path: '/operations/approvals',
        name: 'Approvals',
        access: 'canApprovalsRead',
        component: './Approvals',
      },
      {
        path: '/operations/audit',
        name: 'Audit',
        access: 'canAuditRead',
        component: './Audit',
      },
      {
        path: '/operations/registry',
        name: 'Registry',
        access: 'canRegistryRead',
        component: './Registry',
      },
      {
        path: '/operations/servers',
        name: 'Servers',
        access: 'canRegistryRead',
        component: './Servers',
      },
    ],
  },
  {
    path: '/welcome',
    name: 'welcome',
    icon: 'smile',
    component: './Welcome',
  },
  {
    path: '/',
    redirect: '/welcome',
  },
  // Legacy redirects for backward compatibility
  {
    path: '/account',
    redirect: '/admin/account/center',
  },
  {
    path: '/permissions',
    redirect: '/admin/permissions/roles',
  },
  // Game management legacy redirects
  {
    path: '/game-mgmt/games-meta',
    redirect: '/game/meta',
  },
  {
    path: '/game-mgmt/entities',
    redirect: '/game/entities',
  },
  {
    path: '/game-mgmt',
    redirect: '/game/meta',
  },
  {
    path: '/gm/games',
    redirect: '/game/environments',
  },
  {
    path: '/gm/functions',
    redirect: '/game/functions',
  },
  {
    path: '/gm/assignments',
    redirect: '/game/assignments',
  },
  {
    path: '/gm/packs',
    redirect: '/game/packs',
  },
  {
    path: '/gm/approvals',
    redirect: '/operations/approvals',
  },
  {
    path: '/gm/audit',
    redirect: '/operations/audit',
  },
  {
    path: '/gm/registry',
    redirect: '/operations/registry',
  },
  {
    path: '/gm',
    redirect: '/game/meta',
  },
  {
    path: '*',
    layout: false,
    component: './404',
  },
];
