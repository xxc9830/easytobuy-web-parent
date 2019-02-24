<template>
    <el-container>
        <el-aside width="300px">
            <el-tree :data="data" :props="defaultProps" @node-click="handleNodeClick" @node-contextmenu="handleNodeRightClick"></el-tree>
        </el-aside>
        <el-main>
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="活动名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="活动区域">
                    <el-select v-model="form.region" placeholder="请选择活动区域">
                        <el-option label="区域一" value="shanghai"></el-option>
                        <el-option label="区域二" value="beijing"></el-option>
                    </el-select>
                </el-form-item>
                <el-form-item label="活动时间">
                    <el-col :span="11">
                        <el-date-picker type="date" placeholder="选择日期" v-model="form.date1" style="width: 100%;"></el-date-picker>
                    </el-col>
                    <el-col class="line" :span="2">-</el-col>
                    <el-col :span="11">
                        <el-time-picker type="fixed-time" placeholder="选择时间" v-model="form.date2" style="width: 100%;"></el-time-picker>
                    </el-col>
                </el-form-item>
                <el-form-item label="即时配送">
                    <el-switch v-model="form.delivery"></el-switch>
                </el-form-item>
                <el-form-item label="活动性质">
                    <el-checkbox-group v-model="form.type">
                        <el-checkbox label="美食/餐厅线上活动" name="type"></el-checkbox>
                        <el-checkbox label="地推活动" name="type"></el-checkbox>
                        <el-checkbox label="线下主题活动" name="type"></el-checkbox>
                        <el-checkbox label="单纯品牌曝光" name="type"></el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="特殊资源">
                    <el-radio-group v-model="form.resource">
                        <el-radio label="线上品牌商赞助"></el-radio>
                        <el-radio label="线下场地免费"></el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="活动形式">
                    <el-input type="textarea" v-model="form.desc"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="onSubmit">立即创建</el-button>
                    <el-button>取消</el-button>
                </el-form-item>
            </el-form>
        </el-main>
    </el-container>
</template>

<script>
    export default {
        data() {
            return {
                form: {
                    name: '',
                    region: '',
                    date1: '',
                    date2: '',
                    delivery: false,
                    type: [],
                    resource: '',
                    desc: ''
                },
                data: [],
                defaultProps: {
                    children: 'children',//子节点的数组对象
                    label: 'name'//节点的文本
                }
            }
        },
        methods: {
            onSubmit() {
                console.log('submit!');
            },
            handleNodeClick(data) {
                console.log(data);
            },
            getTreeData(){
                //发送请求到后端
                this.$http.get("/product/productType/treeData")
                    .then((res)=>{
                        this.data = res.data;
                    });

            },
            handleNodeRightClick(){
                alert();
            }
        },
        mounted(){
            //加载类型树的数据
            this.getTreeData();
        }
    }
</script>

<style scoped>

    .el-aside {
        color: #333;
        text-align: center;
        border-right: 1px solid #20a0ff;;
    }

    .el-main {
        background-color: #E9EEF3;
        color: #333;
        text-align: center;
    }

    .el-container {
        margin-bottom: 40px;
        border: 1px solid #20a0ff;
        position: absolute;
        right:30px;
        left: 250px;
        bottom: 0px;
        top: 50px;
    }

</style>