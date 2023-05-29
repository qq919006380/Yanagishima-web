import Vue from 'vue'
import Router from 'vue-router'
import DefaultView from '@/views/DefaultView'
import ShareView from '@/views/ShareView'
import ErrorView from '@/views/ErrorView'
import DiffView from '@/views/DiffView'

Vue.use(Router)

const pathname = window.location.pathname

export default new Router({
  mode: 'history',
  routes: [
    {
      path: `${pathname}/diff`,
      component: DiffView
    },
    {
      path: `${pathname}/share`,
      component: ShareView
    },
    {
      path: `${pathname}/error`,
      component: ErrorView
    },
    {
      path: `${pathname}/`,
      component: DefaultView
    }
  ]
})
