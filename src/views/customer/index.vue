<script setup lang="ts">
import moment from 'moment'
import Pagination from '../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import {
  ElMessageBox,
  ElNotification,
  ElTable,
  FormInstance
} from 'element-plus'
import { delayRequest } from '../../utils/common'
import { clone, cloneDeep } from 'lodash'
import { DEFAULT_PASSWORD, DURATION_TIME } from '../../settings'
import { CustomerEntity } from '../../types/entity'
import { QueryCustomer } from '../../types/query'
import {
  getCustomerPageList,
  updateCustomer,
  updateCustomerPassword
} from '../../api/customer'
import { encryptPasswordToMD5 } from '../../hook/encrypt'

const tableData = ref<CustomerEntity[]>([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<CustomerEntity[]>([])
const tableLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryCustomer = reactive({ page: 1, size: 10 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const handleSelectionChange = (selection: CustomerEntity[]) =>
  (multipleSelection.value = selection)
const getTableList = () => {
  tableLoading.value = true
  delayRequest(
    () => {
      getCustomerPageList(query)
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
const dialogForm = ref<CustomerEntity>({})
const dialogTitle = ref<string>('')
const dialogOperate = ref<string>('')
const openDialog = (operate: string, row?: CustomerEntity) => {
  if (operate === 'detail') {
    dialogTitle.value = '顾客详情'
  } else {
    dialogTitle.value = '顾客订单'
  }
  if (row) {
    dialogForm.value = cloneDeep(row)
  }
  isDialog.value = true
  dialogOperate.value = operate
}
const handlerOperate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (dialogOperate.value === 'insert') {
        addRoomType(dialogForm.value).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({
              message: '添加成功',
              duration: DURATION_TIME
            })
            isDialog.value = false
            getTableList()
            return
          }
          ElNotification.error({
            message: '添加失败，请重试!',
            duration: DURATION_TIME
          })
        })
      } else {
        updateRoomType(dialogForm.value).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({
              message: '更新成功',
              duration: DURATION_TIME
            })
            isDialog.value = false
            getTableList()
            return
          }
          ElNotification.error({
            message: '更新失败，请重试!',
            duration: DURATION_TIME
          })
        })
      }
    }
  })
}
const handlerDelete = (id: number) => {
  deleteRoomType(id).then(async ({ data }) => {
    if (data.code === 200) {
      ElNotification.success({ message: '删除成功', duration: DURATION_TIME })
      getTableList()
      return
    }
    ElNotification.error({
      message: '删除失败，请重试!',
      duration: DURATION_TIME
    })
  })
}
watch(
  () => isDialog.value,
  (value) => {
    if (!value) {
      dialogForm.value = {}
    }
  },
  { deep: true }
)

const disabled = reactive({
  edit: true,
  delete: true
})
watch(
  () => multipleSelection.value,
  () => {
    disabled.edit = multipleSelection.value.length !== 1
    disabled.delete = multipleSelection.value.length < 1
  },
  { immediate: true, deep: true }
)
const handlerUpdatePassword = (row: CustomerEntity) => {
  ElMessageBox.confirm(`确定重置 ${row.customer_name} 的密码吗?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '返回',
    type: 'warning'
  }).then(() => {
    row.customer_password = encryptPasswordToMD5(DEFAULT_PASSWORD)
    updateCustomerPassword(row).then(({ data }) => {
      if (data.code === 200) {
        ElNotification.success({
          message: `${row.customer_name}密码已重置！`,
          duration: DURATION_TIME
        })
        isDialog.value = false
        return
      }
      ElNotification.error({
        message: `密码重置失败，请重试！`,
        duration: DURATION_TIME
      })
    })
  })
}
</script>

<template>
  <el-card class="card-box">
    <el-row :gutter="12">
      <el-col :span="4">
        <el-input v-model="query.customer_name" placeholder="顾客姓名" />
      </el-col>
      <el-col :span="4">
        <el-button type="warning" @click="query.customer_name = undefined">
          重置
        </el-button>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-col :span="4">
        <el-button type="success" @click="openDialog('insert')">新增</el-button>
      </el-col>
    </el-row>
    <el-table
      ref="multipleTableRef"
      v-loading="tableLoading"
      :data="tableData"
      empty-text="暂无数据"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="30" align="center" />
      <el-table-column prop="customer_name" label="顾客姓名" />
      <el-table-column prop="customer_account" label="账户" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag
            v-if="row.is_status"
            type="success"
            disable-transitions
            effect="dark"
          >
            正常
          </el-tag>
          <el-tag v-else type="danger" disable-transitions effect="dark">
            禁用
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="备注" />
      <el-table-column label="创建时间" align="center">
        <template #default="{ row }">
          {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="success" @click="openDialog('detail', row)">
            详情
          </el-button>
          <el-button type="primary" @click="openDialog('update', row)">
            查看订单
          </el-button>
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
    <el-form
      v-if="dialogOperate === 'detail'"
      :model="dialogForm"
      label-width="80"
    >
      <el-form-item label="顾客账户">
        <span>{{ dialogForm.customer_account }}</span>
        <el-link
          type="primary"
          :underline="false"
          class="ml-10"
          @click="handlerUpdatePassword(dialogForm)"
        >
          重置密码
        </el-link>
      </el-form-item>
      <el-form-item label="顾客姓名:">
        <span>{{ dialogForm.customer_name }}</span>
      </el-form-item>
      <el-form-item label="账号状态:">
        <el-tag v-if="dialogForm.is_status" disable-transitions type="success">
          正常
        </el-tag>
        <el-tag v-else disable-transitions type="danger"> 禁用</el-tag>
      </el-form-item>
      <el-form-item label="个人描述:">
        <span>{{ dialogForm.description }}</span>
      </el-form-item>
      <el-form-item label="注册时间:">
        {{ moment(dialogForm.create_time).format('YYYY-MM-DD HH:mm:ss') }}
      </el-form-item>
      <el-form-item label="最后登录:">
        {{ moment(dialogForm.update_time).format('YYYY-MM-DD HH:mm:ss') }}
      </el-form-item>
    </el-form>
    <el-form v-else></el-form>
    <template #footer>
      <div
        v-if="dialogOperate === 'detail'"
        style="display: flex; justify-content: center"
      >
        <el-button type="primary" @click="isDialog = false">关闭</el-button>
      </div>
      <div v-else></div>
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
