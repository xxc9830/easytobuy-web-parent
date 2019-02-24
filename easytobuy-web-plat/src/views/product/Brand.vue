<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getBrands">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="brands" highlight-current-row v-loading="listLoading" @selection-change="selsChange" style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" width="200" sortable>
            </el-table-column>
            <el-table-column prop="englishName" label="英文名" width="200" sortable>
            </el-table-column>
            <el-table-column prop="description" label="描述" width="300" sortable>
            </el-table-column>
            <el-table-column prop="productType.name" label="产品类型" min-width="120" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template slot-scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="size" :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--添加修改dialog-->
        <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
            <!--添加和修改的form-->
            <el-form ref="form" :model="form" label-width="80px">
                <el-form-item label="名称">
                    <el-input v-model="form.name"></el-input>
                </el-form-item>
                <el-form-item label="英文名">
                    <el-input v-model="form.englishName"></el-input>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input v-model="form.description"></el-input>
                </el-form-item>
                <el-form-item label="类型">
                    <el-input v-model="form.productTypeId"></el-input>
                </el-form-item>
                <el-form-item label="排序号">
                    <el-input v-model="form.sortIndex"></el-input>
                </el-form-item>
                <el-form-item label="logo">
                    <!--<el-input v-model="form.logo"></el-input>-->
                    <el-upload
                            class="upload-demo"
                            ref="upload"
                            action="http://127.0.0.1:9527/services/common/fastdfs"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :on-success="handleSuccess"
                            :file-list="fileList2"
                            :limit="limitNum"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="subForm">保 存</el-button>
              </span>
        </el-dialog>


    </section>
</template>

<script>

    export default {
        data() {
            return {
                filters: {
                    keyword: ''
                },
                brands: [],
                total: 0,
                page: 1,
                size:10,
                listLoading: false,
                sels: [],//列表选中列
                //是否显示模态框
                dialogVisible:false,
                //模态框的标题
                dialogTitle:'',
                //表单的数据
                form: {
                    id:'',//提交的时候id如果有值则是更新，没值则是添加
                    name: '',
                    englishName: '',
                    description: '',
                    productTypeId: '',
                    sortIndex: '',
                    logo:''
                },

                editFormVisible: false,//编辑界面是否显示
                editLoading: false,
                editFormRules: {
                    name: [
                        { required: true, message: '请输入姓名', trigger: 'blur' }
                    ]
                },
            }
        },
        methods: {
            //上传成功后的回调
            handleSuccess(response, file, fileList){
                console.debug(response,file,fileList);
                this.form.logo = response.retObj;
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
                let filePath = this.form.logo;
                //调用删除图片的接口
                this.$http.delete("/common/fastdfs?filePath="+filePath)
                    .then((res)=>{
                        let result = res.data;
                        if(result.success){
                            this.$message({
                                message: result.message,
                                type: 'success'
                            });
                        }else{
                            this.$message.error(result.message);
                        }
                    })
            },
            handlePreview(file) {
                console.log(file);
            },
            handleCurrentChange(val) {
                this.page = val;
                this.getBrands();
            },
            //获取品牌列表
            getBrands() {
                let para = {
                    page: this.page,//第几页
                    keyword: this.filters.keyword,//输入的关键字
                    rows: this.size
                };
                this.listLoading = true;
                //NProgress.start();
                //发送请求调用后端接口进行查询
                this.$http.post("/product/brand/json",para).then((res) => {
                    let data = res.data;//获取分页对象
                    this.total = data.total;
                    this.brands = data.rows;
                    this.listLoading = false;
                    //NProgress.done();
                });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = { id: row.id };
                    this.$http.delete("/product/brand/"+row.id).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getBrands();
                    })
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.dialogVisible = true;
                this.dialogTitle = "编辑品牌";
                //回显
                this.form = Object.assign({}, row);
                // this.editFormVisible = true;
                // this.editForm = Object.assign({}, row);
            },
            //显示新增界面
            handleAdd: function () {
                this.dialogVisible = true;
                this.dialogTitle = "新增品牌";
                //清空表单
                this.form={
                    id:'',//提交的时候id如果有值则是更新，没值则是添加
                    name: '',
                    englishName: '',
                    description: '',
                    productTypeId: '',
                    sortIndex: '',
                    logo:''
                }
                //清空上传的图片
                //this.$refs.upload.clearFiles();
                this.fileList2 = [];
            },
            //点击保存按钮提交表单
            subForm(){
                this.editLoading = true;
                //验证略
                //发送ajax请求，成功后关闭模态框，刷新table
                this.$http.post("/product/brand/",this.form)
                    .then((res)=>{
                        this.editLoading = false;
                        var result = res.data;
                        if(result.success){
                            //成功
                            this.$message({
                                message: result.message,
                                type: 'success'
                            });
                            //重置表单
                            this.$refs['form'].resetFields();
                            //关闭
                            this.dialogVisible = false;
                            //刷新
                            this.getBrands();
                        }else{
                            this.$message.error(result.message);
                        }
                    });
            },
            //编辑
            editSubmit: function () {
                this.$refs.editForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.editLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.editForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            editUser(para).then((res) => {
                                this.editLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['editForm'].resetFields();
                                this.editFormVisible = false;
                                this.getUsers();
                            });
                        });
                    }
                });
            },
            //新增
            addSubmit: function () {
                this.$refs.addForm.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.addForm);
                            para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            addUser(para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['addForm'].resetFields();
                                this.addFormVisible = false;
                                this.getUsers();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = { ids: ids };
                    batchRemoveUser(para).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getUsers();
                    });
                }).catch(() => {

                });
            }
        },
        //加载成功后执行
        mounted() {
            //获取所有的品牌
            this.getBrands();
        }
    }

</script>

<style scoped>

</style>