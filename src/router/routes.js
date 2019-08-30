const routes = [
  {
    path: '/',
    component: () => import('layouts/MyLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Index.vue') }
    ]
  },
  {
    path: '/classroom/:classroomId',
    component: () => import('layouts/ClassroomLayout.vue'),
    redirect: to => `/classroom/${to.params.classroomId}/grid`,
    children: [
      { name: 'classroom-grid-page', path: 'grid', component: () => import('pages/ClassroomGrid.vue') },
      {
        name: 'classroom-table-page',
        path: 'table',
        component: () => import('pages/ClassroomTable.vue'),
        redirect: to => `/classroom/${to.params.classroomId}/table/basic`,
        children: [
          {
            name: 'classroom-datatable-basic',
            path: 'basic',
            meta: 'basic',
            component: () => import('components/StudentDataTableBasic.vue')
          },
          {
            name: 'classroom-datatable-score',
            path: 'score',
            meta: 'score',
            component: () => import('components/StudentDataTableScore.vue')
          },
          {
            name: 'classroom-datatable-activity',
            path: 'activity',
            meta: 'activity',
            component: () => import('components/StudentDataTableActivity.vue')
          },
          {
            name: 'classroom-datatable-discipline',
            path: 'discipline',
            meta: 'discipline',
            component: () => import('components/StudentDataTableDiscipline.vue')
          }
        ]
      }
    ]
  }
]

// Always leave this as last one
if (process.env.MODE !== 'ssr') {
  routes.push({
    path: '*',
    component: () => import('pages/Error404.vue')
  })
}

export default routes
