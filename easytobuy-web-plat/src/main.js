import babelpolyfill from 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
//import 'element-ui/lib/theme-default/index.css'
//import './assets/theme/theme-green/index.css'
import 'element-ui/lib/theme-chalk/index.css'
import VueRouter from 'vue-router'
import store from './vuex/store'
import Vuex from 'vuex'
//import NProgress from 'nprogress'
//import 'nprogress/nprogress.css'
//import Mock from './mock'
//Mock.bootstrap();
import routes from './routes'

import 'font-awesome/css/font-awesome.min.css'

//引入axios
import axios from 'axios';
axios.defaults.baseURL = 'http://127.0.0.1:9527/services'  //对应后端网关统一地址
//测试的话这里写入easymock的baseurl
//axios.defaults.baseURL ="http://127.0.0.1:8001"
Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(ElementUI)
Vue.use(VueRouter)
Vue.use(Vuex)
//富文本编辑器
import VueQuillEditor from 'vue-quill-editor'// require styles 引入样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)
//NProgress.configure({ showSpinner: false });

const router = new VueRouter({
    routes
})
//当每次路由执行之前执行
router.beforeEach((to, from, next) => {
    //NProgress.start();
    if (to.path == '/login') {
        //sessionStorage 前端的session
        sessionStorage.removeItem('user');
    }
    //获取session中的user
    let user = JSON.parse(sessionStorage.getItem('user'));
    //如果user没有获取到并且要跳转的路径不是登录路径
    if (!user && to.path != '/login') {
        //跳转到登录路径
        next({ path: '/login' })
    } else {
        next()
    }
})

//router.afterEach(transition => {
//NProgress.done();
//});

new Vue({
    //el: '#app',
    //template: '<App/>',
    router,//路由
    store,
    //components: { App }
    render: h => h(App)
    //挂载
}).$mount('#app')
