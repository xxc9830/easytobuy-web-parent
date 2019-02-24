<template>
	<section>
		<!--工具条-->
		<el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
			<el-form :inline="true" :model="filters">
				<el-form-item>
					<el-input v-model="filters.keyword" placeholder="关键字"></el-input>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" v-on:click="getProducts">查询</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleAdd">新增</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleViewProperties">显示属性</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleSkuProperties">sku属性</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleOnSale">上架</el-button>
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="handleOffSale">下架</el-button>
				</el-form-item>
			</el-form>
		</el-col>

		<!--商品列表-->
		<el-table :data="products" @selection-change="handleSelectionChange" style="width: 100%">
			<el-table-column type="selection" width="50"></el-table-column>
			<el-table-column type="index" width="50"></el-table-column>
			<el-table-column prop="name" label="名称" width="230" sortable>
			</el-table-column>
			<el-table-column prop="subName" label="副名称" width="230" sortable>
			</el-table-column>
			<el-table-column prop="productType.name" label="商品类型" width="120" sortable>
			</el-table-column>
			<el-table-column prop="brand.name" label="品牌" width="120" sortable>
			</el-table-column>
			<el-table-column prop="onSaleTime" label="上架时间" width="130" :formatter="formatterTime" sortable>
			</el-table-column>
			<el-table-column prop="offSaleTime" label="下架时间" width="130" :formatter="formatterTime" sortable>
			</el-table-column>
			<el-table-column prop="state" label="状态" min-width="50" :formatter="stateFormatter" sortable>
			</el-table-column>
			<el-table-column
					fixed="right"
					label="操作"
					width="150">
				<template slot-scope="scope">
					<el-button @click="handleEdit(scope.row)" size="small">编辑</el-button>
					<el-button type="danger" @click="handleRemove(scope.row)" size="small">删除</el-button>
				</template>
			</el-table-column>
		</el-table>

		<!--工具栏-->
		<el-pagination
				background
				layout="prev, pager, next"
				:total="total"
				style="float:right;"
				@current-change="currentPageChange">
		</el-pagination>



		<!--添加修改dialog-->
		<el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="50%">
			<!--添加和修改的form-->
			<el-form ref="productForm" :rules="productRules" :model="productForm" label-width="80px">
				<el-form-item label="名称" prop="name">
					<el-input v-model="productForm.name"></el-input>
				</el-form-item>
				<el-form-item label="副名称">
					<el-input v-model="productForm.subName"></el-input>
				</el-form-item>
				<el-form-item label="类型">
					<!--<el-input v-model="productForm.productTypeId"></el-input>-->
					<select-tree width="300" :options="productTypes" v-model="productForm.productTypeId" />
				</el-form-item>
				<el-form-item label="品牌">
					<!--<el-input v-model="productForm.brandId"></el-input>-->
					<el-select v-model="productForm.brandId" placeholder="请选择品牌">
						<el-option
								v-for="item in brands"
								:key="item.id"
								:label="item.name"
								:value="item.id">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="medias">
					<!--<el-input v-model="productForm.medias"></el-input>-->
					<el-upload
							class="upload-demo"
							ref="upload"
							action="http://127.0.0.1:9527/services/common/fastdfs"
							:on-preview="handlePreview"
							:on-remove="handleRemove"
							:on-success="handleSuccess"
							:file-list="medisList"
							list-type="picture">
						<el-button size="small" type="primary">点击上传</el-button>
						<div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
					</el-upload>
				</el-form-item>
				<el-form-item label="描述">
					<el-input v-model="productForm.productExt.description"></el-input>
				</el-form-item>
				<el-form-item label="详情">
					<!--<el-input v-model="productForm.productExt.richContent"></el-input>-->
					<quill-editor
							v-model="productForm.productExt.richContent"
							ref="myQuillEditor"
							:options="editorOption"
							@blur="onEditorBlur($event)" @focus="onEditorFocus($event)"
							@change="onEditorChange($event)"> </quill-editor>
				</el-form-item>

			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="dialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleSave">保 存</el-button>
              </span>
		</el-dialog>

		<!--配置显示属性的dialog-->
		<el-dialog title="显示属性" :visible.sync="viewPropertiesDialogVisable" width="50%">
			<el-form ref="productForm" label-width="80px">
				<el-form-item v-for="specification in specifications" :label="specification.name">
					<el-input v-model="specification.value"></el-input>
				</el-form-item>
			</el-form>
			<span slot="footer" class="dialog-footer">
                <el-button @click="viewPropertiesDialogVisable = false">取 消</el-button>
                <el-button type="primary" @click="handleSaveViewProperties">保 存</el-button>
              </span>
		</el-dialog>


		<!--配置sku属性的dialog-->
		<el-dialog title="sku属性" :visible.sync="skuPropertiesDialogVisable" width="50%">
			<!--sku属性及选项-->
			<el-card class="box-card">
				<div v-for="skuProperties in skuPropertieses" class="text item">
					<span style="font-size: 15px;font-weight: 600;">{{skuProperties.name}}:</span>
					<div v-for="i in skuProperties.options.length+1">
						<el-input :placeholder="'请输入'+skuProperties.name" v-model="skuProperties.options[i-1]" style="width:500px;margin:5px"></el-input>
						<el-button icon="el-icon-delete" @click="skuProperties.options.splice(i-1,1)"></el-button>
					</div>
				</div>
			</el-card>

			<!--动态的table-->
			<el-table
					:data="skuDatas"
					style="width: 100%">

				<template v-for="(col ,index) in cols">
					<el-table-column :prop="col.prop" sortable :label="col.label" v-if="['price','state','stock'].includes(col.prop)">
						<template scope="scope">
							<el-input auto-complete="off" v-model="skuDatas[scope.$index].price"  style="width: 400px" v-if="'price'===col.prop"/>
							<el-input auto-complete="off" v-model="skuDatas[scope.$index].stock" style="width: 400px" v-if="'stock'===col.prop"/>
							<el-checkbox v-model="skuDatas[scope.$index].state" v-if="col.prop==='state'">备选项</el-checkbox>
						</template>
					</el-table-column>
					<!--只做显示-->
					<el-table-column :prop="col.prop" sortable :label="col.label" v-if="!['price','state','stock'].includes(col.prop)">
					</el-table-column>
				</template>
			</el-table>

			<span slot="footer" class="dialog-footer">
                <el-button @click="skuPropertiesDialogVisable = false">取 消</el-button>
                <el-button type="primary" @click="handleSaveSkuProperties">保 存</el-button>
              </span>
		</el-dialog>

	</section>

</template>

<script>

    import SelectTree from '@/components/SelectTree.vue';
    import { quillEditor } from 'vue-quill-editor'
    export default {
        components: {
            SelectTree,
        },
        data(){
            return {
                cols:[],
                skuDatas:[],//保存sku属性值的各种组合情况[{},{},{}]
                skuPropertiesDialogVisable:false,
                selectedRows:[],//存放选中行
                specifications:[],//显示属性，当内容发生变化的时候，skuDatas自动组合出新的组合
                skuPropertieses:[],
                editorOption:{},
                medisList:[],//图片回显的数据
                fileList:[],//存放上传的数据的
                productTypes: [],
                brands: [],
                productRules:{
                    name:[
                        { required: true, message: '请输入商品名称', trigger: 'blur' }
                    ]
                },
                filters:{
                    keyword:''
                },
                products:[],//table的数据
                pageSize:10,
                pageNum:1,
                total:0,
                dialogTitle:'',
                dialogVisible:false,
                viewPropertiesDialogVisable:false,
                productForm:{
                    //名称，副名称，类型，品牌，媒体属性，商品详情-描述，商品详情-内容
                    name:'',
                    subName:'',
                    productTypeId:'',
                    brandId:'',
                    medias:'',
                    productExt:{
                        description:'',
                        richContent:''
                    }
                }
            }
        },
        methods:{
            //保存
            handleSaveSkuProperties(){
                var para = {
                    specifications : this.skuPropertieses,
                    id : this.selectedRows[0].id,
                    skuDatas : this.skuDatas
                }
                //调用后台的接口，修改商品的skuProperties属性
                this.$http.post("/product/product/skuProperties",para)
                    .then((res)=>{
                        let result = res.data;
                        if(result.success){
                            this.$message({
                                message: result.message,
                                type: 'success'
                            });
                            this.skuPropertiesDialogVisable = false;
                        }else{
                            this.$message.error(result.message);
                        }
                    })
            },
            //保存显示属性
            handleSaveViewProperties(){
                //打印一波specifications
                //console.debug(this.specifications);
                var para = {
                    specifications : this.specifications,
                    id : this.selectedRows[0].id
                }
                //调用后台的接口，修改商品的viewProperties属性
                this.$http.post("/product/product/viewProperties",para)
                    .then((res)=>{
                        let result = res.data;
                        if(result.success){
                            this.$message({
                                message: result.message,
                                type: 'success'
                            });
                            this.viewPropertiesDialogVisable = false;
                        }else{
                            this.$message.error(result.message);
                        }
                    })

            },
            //配置显示属性
            handleViewProperties(){
                //获取选中行
                if(this.selectedRows.length!=1){
                    this.$message({
                        message:'请选中一行进行操作！',
                        type:'warning'
                    })
                    return;
                }

                //查询类型属性给specifications赋值
                this.$http.get("/product/specification/viewProperties/"+this.selectedRows[0].id)
                    .then((res)=>{
                        console.debug(res.data);
                        this.specifications = res.data
                        //打开模态框
                        this.viewPropertiesDialogVisable=true
                    })

            },
            //配置sku属性
            handleSkuProperties(){
                //获取选中行
                if(this.selectedRows.length!=1){
                    this.$message({
                        message:'请选中一行进行操作！',
                        type:'warning'
                    })
                    return;
                }
                //查询类型属性给specifications赋值
                this.$http.get("/product/specification/skuProperties/"+this.selectedRows[0].id)
                    .then((res)=>{
                        this.skuPropertieses = res.data
                        //打开模态框
                        this.skuPropertiesDialogVisable=true
                    })
            },
            //上架
            handleOnSale(){
                this.handleSale(1);
            },
            //下架
            handleOffSale(){
                this.handleSale(0);
            },
            handleSale(operate){
                //获取到所有选中行的id
                var ids = this.selectedRows.map(function(item){return item.id}).toString();
                this.$confirm('确认'+(operate==1?'上架':'下架')+'选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //后台提供一个接口，前台参数有个state表示操作的状态
                    //operate==1 上架   operate == 0 下架
                    let para = { ids: ids ,operate : operate};
                    this.$http.post("/product/product/onSale",para)
                        .then(res=>{
                            this.listLoading = false;
                            if(res.data.success){
                                this.$message({
                                    message: (operate==1?'上架':'下架')+'成功!',
                                    type: 'success'
                                });
                                this.getProducts();
                            }else{
                                this.$message({
                                    message: res.data.message,
                                    type: 'error'
                                });
                            }
                        })
                }).catch(() => {

                });
            },
            onEditorBlur() {
                //失去焦点事件
            },
            onEditorFocus(){

            },
            onEditorChange(){

            },
            //上传成功后的回调
            handleSuccess(response, file, fileList){
                console.debug(response,file,fileList);
                this.fileList.push(file);
            },
            handleRemove(file, fileList) {
                console.log(file, fileList);
                let filePath = file.response.retObj;
                //调用删除图片的接口
                this.$http.delete("/common/fastdfs?filePath="+filePath)
                    .then((res)=>{
                        let result = res.data;
                        if(result.success){
                            this.$message({
                                message: result.message,
                                type: 'success'
                            });
                            //删除
                            let index = this.fileList.indexOf(file);
                            this.fileList.splice(index,1);
                        }else{
                            this.$message.error(result.message);
                        }
                    })
            },
            handlePreview(file) {
                console.log(file);
            },
            //加载类型树
            getProductTypes(){
                this.$http.get("/product/productType/treeData")
                    .then((res)=>{
                        this.productTypes = res.data;
                    })
            },
            //查询并返回所有的品牌
            getBrands(){
                this.$http.get("/product/brand/list")
                    .then((res)=>{
                        this.brands = res.data;
                    })
            },
            //分页加载商品
            getProducts(){
                let para = {
                    page : this.pageNum,
                    rows : this.pageSize
                }
                this.$http.post("/product/product/json",para)
                    .then((res)=>{
                        let data = res.data;
                        this.products = data.rows;
                        this.total = data.total;
                    })

            },
            //新增
            handleAdd(){
                this.dialogVisible = true;
                this.dialogTitle = "新增";
                //重置表单
                this.productForm = {
                    name:'',
                    subName:'',
                    productTypeId:'',
                    brandId:'',
                    medias:'',
                    productExt:{
                        description:'',
                        richContent:''
                    }

                }
            },
            handleSelectionChange(selection){
                console.debug(selection);
                this.selectedRows = selection;

            },
            //编辑
            handleEdit(row){
                this.dialogVisible = true;
                this.dialogTitle = "编辑";
                this.productForm = Object.assign({},row);
                //取出medias字符串解析，解析成对象放入到medisList
            },
            //删除
            handleRemove(row){
                //console.debug(row)
            },
            //更改当前页
            currentPageChange(currentPage){
                this.pageNum = currentPage;
                this.getProducts();
            },
            //格式化状态
            stateFormatter(row, column, cellValue, index){
                return cellValue=="1"?"上架":"下架"
            },
            formatterTime(row, column, cellValue, index){
                if(cellValue){
                    let date = new Date(cellValue);
                    return date.getFullYear()+"-"+((date.getMonth()+1)>10?(date.getMonth()+1):("0"+(date.getMonth()+1)))+"-"+date.getDate();
                }

                return ''
            },
            //保存
            handleSave(){
                //如果有表单验证，先验证表单，通过后在提交
                this.$refs['productForm'].validate((valid) => {
                    if (valid) {
                        //从mediaList中取出我想要的数据
                        //提交表单
                        this.$http.post("/product/product/",this.productForm)
                            .then((res)=>{
                                let result = res.data;
                                if(result.success){
                                    this.$message({
                                        message:result.message,
                                        type:'success'
                                    })
                                    //关闭模态框
                                    this.dialogVisible = false;
                                    //刷新table
                                    this.getProducts();
                                }else{
                                    this.$message({
                                        message:result.message,
                                        type:'error'
                                    })
                                }
                            })
                    }
                });


            }
        },
        mounted(){
            this.getProducts();
            this.getBrands();
            this.getProductTypes();
        },
        watch: {
            skuPropertieses: {
                handler(newName, oldName) {
                    //skuPropertieses，将所有的属性选项进行笛卡尔积的组合，添加到skuDatas中
                    //先筛选掉为options的值为空的
                    const arr = this.skuPropertieses.filter(item=>item.options.length>0);
                    let rest = arr.reduce((pre,cur)=>{

                        let result = [];
                        pre.forEach((e1)=>{
                            cur.options.forEach((e2)=>{
                                let obj = {}
                                //e2 = "萝莉","御姐"
                                Object.assign(obj,e1);
                                obj[cur.name] = e2;
                                result.push(obj);
                            })
                        })
                        return result;
                    },[{}])

                    rest.forEach(item=>{
                        item['price']='';
                        item['stock']='';
                        item['state']=0;
                    })


                    console.debug(rest)
                    this.skuDatas = rest;

                    let headers = [];
                    for(var p in sku){
                        let col = {}
                        let label = p;
                        if(p == 'price'){
                            label = '价格';
                        }
                        if(p == 'stock'){
                            label = '库存';
                        }
                        if(p == 'state'){
                            label = '启动';
                        }
                        col['label'] = label;
                        col['prop'] = p;
                        headers.push(col);
                    }
                    this.cols = headers;
                },
                deep:true
            },
        }
    }

</script>

<style scoped>

</style>