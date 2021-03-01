import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '@/views/Index.vue'
import Edit from '@/views/Edit.vue'
import New from '@/views/New.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/playgrounds/',
    name: 'Index',
    component: Index
  },
  {
    path: '/',
    name: 'New',
    component: New
  },
  {
    path: '/playgrounds/:playgroundId',
    name: 'Edit',
    component: Edit
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
