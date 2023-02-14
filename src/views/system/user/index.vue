<script setup lang="ts">
import moment from 'moment'
import Pagination from '../../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { ElNotification, ElTable, FormInstance } from 'element-plus'
import { UserEntity } from '../../../types/entity'
import { QueryUser } from '../../../types/query'
import { delayRequest } from '../../../utils/common'
import { clone, cloneDeep } from 'lodash'
import {
  addUser,
  deleteUser,
  getUserPageList,
  updateUser
} from '../../../api/user'
import { encryptPasswordToMD5 } from '../../../hook/encrypt'

const tableData = ref<UserEntity[]>([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<UserEntity[]>([])
const tableLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryUser = reactive({ page: 1, size: 10 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const handleSelectionChange = (selection: UserEntity[]) =>
  (multipleSelection.value = selection)
const reset = () => {
  query.real_name = undefined
  query.is_status = undefined
}
const getTableList = () => {
  tableLoading.value = true
  delayRequest(
    () => {
      getUserPageList(query)
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
const dialogForm = ref<UserEntity>({ gender: '1', is_status: false })
const dialogTitle = ref<string>('')
const dialogOperate = ref<string>('')
const openDialog = (operate: string, row?: UserEntity) => {
  if (operate === 'insert') {
    dialogTitle.value = '新增用户'
  } else {
    dialogTitle.value = '编辑用户'
    if (row) {
      dialogForm.value = cloneDeep(row)
    } else {
      dialogForm.value = cloneDeep(multipleSelection.value[0] as UserEntity)
    }
  }
  isDialog.value = true
  dialogOperate.value = operate
}
const handlerOperate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      const tempPassword = dialogForm.value.password
      if (dialogForm.value.password) {
        dialogForm.value.password = encryptPasswordToMD5(
          dialogForm.value.password
        )
      } else {
        dialogForm.value.password = encryptPasswordToMD5('123456')
      }
      if (dialogOperate.value === 'insert') {
        addUser(dialogForm.value).then(({ data }) => {
          switch (data.code) {
            case 200:
              ElNotification.success({ message: '添加成功', duration: 1500 })
              isDialog.value = false
              getTableList()
              break
            case 201:
              ElNotification.error({ message: data.message, duration: 1500 })
              dialogForm.value.password = tempPassword
              break
            default:
              ElNotification.error({
                message: '添加失败，请重试!',
                duration: 1500
              })
          }
        })
      } else {
        updateUser(dialogForm.value).then(({ data }) => {
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
  deleteUser(id).then(async ({ data }) => {
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
      dialogForm.value = { gender: '1', is_status: false }
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
</script>

<template>
  <el-card class="card-box">
    <el-row :gutter="12">
      <el-col :span="4">
        <el-input v-model="query.real_name" placeholder="员工姓名" />
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
      <el-table-column prop="user_id" label="ID" />
      <el-table-column prop="username" label="账户" />
      <el-table-column prop="real_name" label="姓名" />
      <el-table-column label="性别">
        <template #default="{ row }">
          <span v-if="row.gender === '1'">男</span>
          <span v-else>女</span>
        </template>
      </el-table-column>
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
      <el-table-column label="注册时间" align="center">
        <template #default="{ row }">
          {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="primary" @click="openDialog('update', row)">
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除本条数据吗？"
            @confirm="handlerDelete(row.user_id)"
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
    <el-form ref="dialogFormRef" :model="dialogForm" label-width="50">
      <el-form-item
        prop="username"
        label="账户"
        :rules="{
          required: true,
          message: '账户不能为空',
          trigger: 'blur'
        }"
      >
        <el-input v-model="dialogForm.username" />
      </el-form-item>
      <el-form-item
        prop="real_name"
        label="姓名"
        :rules="{
          required: true,
          message: '姓名不能为空',
          trigger: 'blur'
        }"
      >
        <el-input v-model="dialogForm.real_name" />
      </el-form-item>
      <el-form-item
        v-show="dialogOperate === 'insert'"
        prop="password"
        label="密码"
      >
        <el-input
          v-model="dialogForm.password"
          show-password
          placeholder="默认：123456"
        />
      </el-form-item>
      <el-form-item label="性别">
        <el-radio-group v-model="dialogForm.gender">
          <el-radio label="1">男</el-radio>
          <el-radio label="2">女</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="状态">
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
      <el-button @click="isDialog = false">返回</el-button>
      <el-button type="primary" @click="handlerOperate(dialogFormRef)">
        确认
      </el-button>
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
