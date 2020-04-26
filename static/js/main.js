"use strict";
const Vis1 = { template: '<div>vis 1</div>' }
const Vis2 = { template: '<div>vis 2</div>' }

// 2. Define some routes
// Each route should map to a component. The "component" can
// either be an actual component constructor created via
// `Vue.extend()`, or just a component options object.
// We'll talk about nested routes later.
const routes = [
  { path: '/vis1', component: Vis1 },
  { path: '/vis2', component: Vis2 }
]

const router = new VueRouter({
    routes // short for `routes: routes`
})
const app = new Vue({
    router
}).$mount('#app')