<script setup lang="ts">
import moment from 'moment'
import Pagination from '../../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { ElNotification, ElTable, FormInstance } from 'element-plus'
import { delayRequest } from '../../../utils/common'
import { clone, cloneDeep } from 'lodash'
import { RoleEntity } from '../../../types/entity'
import { QueryRole } from '../../../types/query'
import {
  addRole,
  deleteRole,
  getRolePageList,
  updateRole
} from '../../../api/role'

const tableData = ref<RoleEntity[]>([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<RoleEntity[]>([])
const tableLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryRole = reactive({ page: 1, size: 10 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const handleSelectionChange = (selection: RoleEntity[]) =>
  (multipleSelection.value = selection)
const reset = () => {
  query.role_name = undefined
  query.is_status = undefined
}
const getTableList = () => {
  tableLoading.value = true
  delayRequest(
    () => {
      getRolePageList(query)
        .then(({ data }) => {
          if (data.code === 200) {
            tableData.value = cloneDeep(data.data.record)
            total.value = clone(data.data.total)
          }
        })
        .finally(() => (tableLoading.value = false))
    },
    5,
    500
  )
}
watch(
  () => query,
  () => {
    getTableList()
  },
  { deep: true }
)
onMounted(() => getTableList())

const isDialog = ref<boolean>(false)
const dialogFormRef = ref<FormInstance>()
const dialogForm = ref<RoleEntity>({ is_status: false })
const dialogTitle = ref<string>('')
const dialogOperate = ref<string>('')
const openDialog = (operate: string, row?: RoleEntity) => {
  if (operate === 'insert') {
    dialogTitle.value = '新增角色'
  } else {
    dialogTitle.value = '编辑角色'
    if (row) {
      dialogForm.value = cloneDeep(row)
    } else {
      dialogForm.value = cloneDeep(multipleSelection.value[0] as RoleEntity)
    }
  }
  isDialog.value = true
  dialogOperate.value = operate
}
const handlerOperate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (dialogOperate.value === 'insert') {
        addRole(dialogForm.value).then(({ data }) => {
          switch (data.code) {
            case 200:
              ElNotification.success({ message: '添加成功', duration: 1500 })
              isDialog.value = false
              getTableList()
              break
            case 201:
              ElNotification.error({ message: data.message, duration: 1500 })
              break
            default:
              ElNotification.error({
                message: '添加失败，请重试!',
                duration: 1500
              })
          }
        })
      } else {
        updateRole(dialogForm.value).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({ message: '更新成功', duration: 1500 })
            isDialog.value = false
            getTableList()
            return
          }
          ElNotification.error({ message: '更新失败，请重试!', duration: 1500 })
        })
      }
    }
  })
}
const handlerDelete = (id: number) => {
  deleteRole(id).then(async ({ data }) => {
    if (data.code === 200) {
      ElNotification.success({ message: '删除成功', duration: 1500 })
      getTableList()
      return
    }
    ElNotification.error({ message: '删除失败，请重试!', duration: 1500 })
  })
}
watch(
  () => isDialog.value,
  (value) => {
    if (!value) {
      dialogForm.value = { is_status: false }
      dialogOperate.value = ''
    }
  },
  { deep: true }
)
const disabled = reactive({
  update: true,
  delete: true
})
watch(
  () => multipleSelection.value,
  () => {
    disabled.update = multipleSelection.value.length !== 1
    disabled.delete = multipleSelection.value.length < 1
  },
  { immediate: true, deep: true }
)

const isPerDialog = ref<boolean>(false)
const handlerPermission = () => {}
</script>

<template>
  <el-card class="card-box">
    <el-row :gutter="12">
      <el-col :span="4">
        <el-input v-model="query.role_name" placeholder="角色名称" />
      </el-col>
      <el-col :span="4">
        <el-select
          v-model="query.is_status"
          placeholder="状态"
          clearable
          @clear="query.is_status = undefined"
        >
          <el-option label="启用" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="warning" @click="reset">重置</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-button type="success" @click="openDialog('insert')">新增</el-button>
      <el-button
        type="danger"
        :disabled="disabled.delete"
        @click="
          ElNotification.warning({ message: '待开发...', duration: 1500 })
        "
      >
        删除
      </el-button>
      <el-button
        type="warning"
        :disabled="disabled.update"
        @click="openDialog('update')"
      >
        修改
      </el-button>
    </el-row>
    <el-table
      ref="multipleTableRef"
      v-loading="tableLoading"
      :data="tableData"
      empty-text="暂无数据"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="30" align="center" />
      <el-table-column prop="role_name" label="名称" />
      <el-table-column prop="description" label="备注" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag
            v-if="row.is_status"
            type="success"
            effect="dark"
            disable-transitions
          >
            启用
          </el-tag>
          <el-tag v-else type="danger" effect="dark" disable-transitions>
            禁用
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center">
        <template #default="{ row }">
          {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="300">
        <template #default="{ row }">
          <el-button type="success" @click="isPerDialog = true">
            授权
          </el-button>
          <el-button type="primary" @click="openDialog('update', row)">
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除本条数据吗？"
            @confirm="handlerDelete(row.role_id)"
          >
            <template #reference>
              <el-button type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :current-page="query.page"
      :page-size="query.size"
      :total="total"
      @current-change="handleCurrent"
      @size-change="handleSize"
    />
  </el-card>

  <!--dialog-->
  <el-dialog
    v-model="isDialog"
    :title="dialogTitle"
    width="30%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-form ref="dialogFormRef" :model="dialogForm" label-width="80">
      <el-form-item
        prop="role_name"
        label="角色名称"
        :rules="{
          required: true,
          message: '角色名称不能为空',
          trigger: 'blur'
        }"
      >
        <el-input v-model="dialogForm.role_name" />
      </el-form-item>
      <el-form-item
        label="角色状态"
        prop="is_status"
        :rules="{ required: true, message: '请选择状态', trigger: 'change' }"
      >
        <el-radio-group v-model="dialogForm.is_status">
          <el-radio-button :label="true">启用</el-radio-button>
          <el-radio-button :label="false">禁用</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="description" label="备注">
        <el-input
          v-model="dialogForm.description"
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="默认：空"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" text @click="isDialog = false">返回</el-button>
      <el-button type="primary" @click="handlerOperate(dialogFormRef)">
        确认
      </el-button>
    </template>
  </el-dialog>

  <!--permission-->
  <el-dialog
    v-model="isPerDialog"
    title="角色授权"
    width="30%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <!--TODO 这里是权限内容-->
    <span>这里是权限内容</span>
    <template #footer>
      <el-button @click="isPerDialog = false">返回</el-button>
      <el-button type="primary" @click="handlerPermission"> 确认</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.card-box {
  margin-top: 20px;
}

:deep(.el-row) {
  margin-bottom: 10px;
}
</style>
