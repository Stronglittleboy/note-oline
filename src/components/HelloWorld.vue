<template>
  <el-container>
    <div id="vditor" class="vditor"/>
    <el-drawer
        title="文章列表"
        :visible.sync="drawer"
        :direction="direction"
        size="20%"
        :before-close="handleClose">
      <el-drawer
          title="操作"
          :append-to-body="true"
          :before-close="handleClose"
          size="12%"
          :visible.sync="innerDrawer">
        <el-button type="primary" icon="el-icon-document-add" circle @click="add"></el-button>
        <el-button type="primary" icon="el-icon-circle-check" circle @click="save"></el-button>
        <el-button type="danger" icon="el-icon-delete" circle @click="deleteNote"></el-button>
        <el-button type="success" icon="el-icon-arrow-left" circle @click="returnEvent"></el-button>
        <br>
        <el-form ref="form" :model="form" label-width="80px">
          <el-form-item label="名称">
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item label="文件类型">
            <el-switch v-model.number="form.type"
                       active-value=0
                       inactive-value=1
                       :disabled="!operator"
                       active-text="文件夹"
                       inactive-text="文件"
            />
          </el-form-item>
        </el-form>
      </el-drawer>
      <el-tree
          :data="data"
          :props="defaultProps"
          accordion
          @node-contextmenu="nodeContextmenu"
          @node-click="handleNodeClick">
        <span class="custom-tree-node" slot-scope="{ node, data }">
        <span><i :class="data.icon"/>{{ node.label }}</span>
        </span>
      </el-tree>
    </el-drawer>
  </el-container>
</template>

<script>
import Vditor from 'vditor'
import 'vditor/dist/index.css';
import {creat, deleteNote, getNote, modify, queryDirectory, saveNote} from "@/api/request";

export default {
  name: 'HelloWorld',
  data: () => {
    return {
      innerDrawer: false,
      id: 1,
      isMobile: false,
      drawer: false,
      direction: 'rtl',
      data: [{
        label: '一级 1',
        children: [{
          label: '二级 1-1',
          children: [{
            label: '三级 1-1-1'
          }]
        }]
      }, {
        label: '一级 2',
        children: [{
          label: '二级 2-1',
          children: [{
            label: '三级 2-1-1'
          }]
        }, {
          label: '二级 2-2',
          children: [{
            label: '三级 2-2-1'
          }]
        }]
      }, {
        label: '一级 3',
        children: [{
          label: '二级 3-1',
          children: [{
            label: '三级 3-1-1'
          }]
        }, {
          label: '二级 3-2',
          children: [{
            label: '三级 3-2-1'
          }]
        }]
      }],
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      form: {
        name: '',
        type: 1
      },
      /*false 编辑 true 新增模式*/
      operator: false
    }
  },
  mounted() {
    this.initVditor()
    this.initMenu()
    document.onkeydown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        //  执行save方法
        this.saveNote()
        // 阻止默认事件
        e.preventDefault()
      }
    }
  },
  methods: {
    /*保存文件*/
    saveNote(){
      console.log('file', this.vditor.getValue());
      console.log(this.vditor.getHTML());
      saveNote({
        "id": this.id,
        "content": this.vditor.getValue()
      }).then(resp=>{
        console.log('保存成功', resp);
      })
    },
    /*清空数据*/
    add() {
      this.form = {
        name: '',
        type: 1,
        pid: this.form.id
      }
      this.operator = true
    },
    save() {
      /**/
      console.log('operator', this.operator);
      if (this.operator) {
        creat(this.form).then(resp => {
          console.log('创建返回结果', resp);
          this.initMenu()
          this.operator = false
        })
      } else {
        modify(this.form).then(resp => {
          console.log('创建返回结果', resp);
          this.initMenu()
        })
      }
      this.innerDrawer = false
      this.drawer = false
      this.operator = true
    },
    returnEvent(){
      this.innerDrawer = false
      this.drawer = false
      this.operator = true
    },
    deleteNote(){
      deleteNote(this.form.id).then(resp=>{
        console.log(resp);
      })
    },
    initMenu() {
      queryDirectory().then(resp => {
        console.log("查询所有的数据", resp)
        this.data = resp.data.data
      })
    },
    nodeContextmenu(event, item, node, tree) {
      console.log(event, item, node, tree);
      this.form = JSON.parse(JSON.stringify(item))
      this.form.type = item.type
      this.form.pid = item.parentId
      this.innerDrawer = true
      console.log('鼠标点击后', this.form);
      console.log('鼠标点击后', item);
      this.$forceUpdate()
    },
    handleNodeClick(data) {
      console.log(data);
      this.getNoteContent(data)
    },
    handleClose(done) {
      done();
    },
    getNoteContent(data){
      this.id = data.id
      if (data.type == 1) {
        getNote({id:this.id}).then(resp=>{
          console.log(resp.data.data, '==========');
          this.vditor.setValue(resp.data.data)
        })
      }
    },
    showDraw() {
      console.log('调用这个方法');
      this.drawer = true
      this.initMenu()
    },
    initVditor() {
      const that = this
      const options = {
        toolbar: [
          {
            hotkey: '⇧⌘S',
            name: 'sponsor',
            tipPosition: 's',
            tip: '目录',
            className: 'right',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" class="ionicon" viewBox="0 0 512 512"><title>Document Text</title><path d="M416 221.25V416a48 48 0 01-48 48H144a48 48 0 01-48-48V96a48 48 0 0148-48h98.75a32 32 0 0122.62 9.37l141.26 141.26a32 32 0 019.37 22.62z" fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="32"/><path d="M256 56v120a32 32 0 0032 32h120M176 288h160M176 368h160" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"/></svg>',
            click() {
              that.showDraw()
            },
          },
          'emoji',
          'headings',
          'bold',
          'italic',
          'strike',
          '|',
          'line',
          'quote',
          'list',
          'ordered-list',
          'check',
          'outdent',
          'indent',
          'code',
          'inline-code',
          'insert-after',
          'insert-before',
          'undo',
          'redo',
          'upload',
          'link',
          'table',
          'record',
          'edit-mode',
          'both',
          'preview',
          'fullscreen',
          'outline',
          'code-theme',
          'content-theme',
          'export',
          'devtools',
          'info',
          'help',
          'br'
        ],
        width: this.isMobile ? '100%' : '80%',
        height: '100%',
        tab: '\t',
        counter: '999999',
        typewriterMode: true,
        mode: 'ir',
        preview: {
          delay: 100,
          show: !this.isMobile
        },
        outline: {
          enable: true
        },
        upload: {
          max: 5 * 1024 * 1024,
          // linkToImgUrl: 'https://sm.ms/api/upload',
          handler(file) {
            let formData = new FormData()
            for (let i in file) {
              formData.append('smfile', file[i])
            }
            let request = new XMLHttpRequest()
            request.open('POST', 'https://sm.ms/api/upload')
            request.onload = that.onloadCallback
            request.send(formData)
          }
        }
      }
      this.vditor = new Vditor('vditor', options)
    },
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}

.vditor {
  position: absolute;
  top: 2%;
  max-width: 100%;
  width: 80%;
  height: calc(100vh - 100px);
  margin: 20px auto;
  text-align: left;
}
</style>
