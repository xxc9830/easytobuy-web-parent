import Login from './views/Login.vue'
import NotFound from './views/404.vue'
import Home from './views/Home.vue'
import Main from './views/Main.vue'
import Table from './views/nav1/Table.vue'
import Form from './views/nav1/Form.vue'
import user from './views/nav1/user.vue'
import Page4 from './views/nav2/Page4.vue'
import Page5 from './views/nav2/Page5.vue'
import Page6 from './views/nav3/Page6.vue'
import echarts from './views/charts/echarts.vue'
import Brand from './views/product/Brand.vue'
import ProductType from './views/product/ProductType.vue'
import Product from './views/product/Product.vue'
import Specification from './views/product/Specification.vue'


let routes = [
    {
        path: '/login',
        component: Login,
        name: '',
        hidden: true
    },
    {
        path: '/404',
        component: NotFound,
        name: '',
        hidden: true
    },
    //{ path: '/main', component: Main },
    {
        path: '/',
        component: Home,
        name: '',
        iconCls: 'el-icon-menu',
        leaf: true,//只有一个节点
        children: [
            { path: '/echarts', component: echarts, name: '首页' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '商品管理',
        iconCls: 'el-icon-star-on',//图标样式class
        children: [
            { path: '/product', component: Product, name: '商品列表' },
            { path: '/productType', component: ProductType, name: '商品类型' },
            { path: '/brand', component: Brand, name: '品牌管理' },
            { path: '/specification', component: Specification, name: '属性管理' },
            { path: '/stock', component: user, name: '库存管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '订单管理',
        iconCls: 'el-icon-document',//图标样式class
        children: [
            { path: '/order', component: Table, name: '订单管理' }
        ]
    },
    {
        path: '/',
        component: Home,
        name: '系统管理',
        iconCls: 'el-icon-message',//图标样式class
        children: [
            { path: '/user', component: Table, name: '用户管理' },
            { path: '/permission', component: Form, name: '权限管理' },
            { path: '/role', component: user, name: '角色管理' },
        ]
    },
    {
        path: '*',
        hidden: true,
        redirect: { path: '/404' }
    }
];

export default routes;