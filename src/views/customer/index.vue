<script setup lang="ts">
import moment from 'moment'
import Pagination from '../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import {
  ElMessageBox,
  ElNotification,
  ElTable,
  TabsPaneContext
} from 'element-plus'
import { delayRequest } from '../../utils/common'
import { clone, cloneDeep } from 'lodash'
import { DEFAULT_PASSWORD, DURATION_TIME } from '../../settings'
import { CustomerEntity, OrderEntity } from '../../types/entity'
import { QueryCustomer, QueryOrder } from '../../types/query'
import {
  getCustomerPageList,
  updateCustomerPassword,
  updateCustomerStatus
} from '../../api/customer'
import { encryptPasswordToMD5 } from '../../hook/encrypt'
import { getOrderPageList } from '../../api/order'
import { updateRoomState } from '../../api/room'

const tableData = ref<CustomerEntity[]>([])
const tableLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryCustomer = reactive({ page: 1, size: 5 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
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
const dialogForm = ref<CustomerEntity>({})
const openDialog = (row: CustomerEntity) => {
  dialogForm.value = cloneDeep(row)
  isDialog.value = true
}
watch(
  () => isDialog.value,
  (value) => {
    if (!value) {
      dialogForm.value = {}
      getTableList()
    }
  },
  { deep: true }
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
          message: `密码已重置`,
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
const handlerChangeStatus = (row: CustomerEntity) => {
  updateCustomerStatus(row).then(({ data }) => {
    if (data.code === 200) {
      ElNotification.success({
        message: `已${row.is_status ? '启用' : '禁用'}`,
        duration: DURATION_TIME
      })
      return
    }
    ElNotification.error({
      message: `${row.is_status ? '启用' : '禁用'}失败，请重试！`,
      duration: DURATION_TIME
    })
    dialogForm.value.is_status = !dialogForm.value.is_status
  })
}

const orderDialog = ref<boolean>(false)
const orderTableLoading = ref<boolean>(false)
const orderForm = ref<CustomerEntity>({})
const orderTableData = ref<OrderEntity[]>([])
const orderTotal = ref<number>(0)
const orderQuery: QueryOrder = reactive({ page: 1, size: 5 })
const handleCurrentOrder = (page: number) => (query.page = page)
const handleSizeOrder = (size: number) => (query.size = size)
const activeName = ref<string>('1')
const handleClick = (tab: TabsPaneContext) =>
  (activeName.value = tab.paneName as string)

const getOrderList = () => {
  orderTableLoading.value = true
  orderQuery.customer_id = orderForm.value.customer_id
  orderQuery.is_status = !(activeName.value === '1')
  delayRequest(
    () =>
      getOrderPageList(orderQuery)
        .then(({ data }) => {
          if (data.code === 200) {
            orderTableData.value = cloneDeep(data.data.record)
            orderTotal.value = clone(data.data.total)
          }
        })
        .finally(() => (orderTableLoading.value = false)),
    5,
    500
  )
}
const openOrderDialog = (row: CustomerEntity) => {
  orderForm.value = cloneDeep(row)
  orderDialog.value = true
  getOrderList()
}
watch(
  () => activeName.value,
  () => getOrderList(),
  { deep: true }
)
watch(
  () => orderDialog.value,
  (value) => {
    if (!value) activeName.value = '1'
  },
  { deep: true }
)

const handlerStay = (oop: string, row: OrderEntity) => {
  if (oop === '1') {
    ElMessageBox.confirm(
      `将要给 ${row.customer?.customer_name} 办理入住吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '返回',
        type: 'warning'
      }
    ).then(() => {
      const temp: OrderEntity = cloneDeep(row)
      if (temp) {
        temp.is_status = true
        temp.is_handler = '2'
        updateRoomState(temp).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({
              message: `入住成功`,
              duration: DURATION_TIME
            })
            getOrderList()
            return
          }
          ElNotification.error({
            message: `入住失败，请重试！`,
            duration: DURATION_TIME
          })
        })
      }
    })
  } else {
    ElMessageBox.confirm(
      `将要给 ${row.customer?.customer_name} 办理退房吗?`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '返回',
        type: 'warning'
      }
    ).then(() => {
      const temp: OrderEntity = cloneDeep(row)
      if (temp) {
        temp.is_status = true
        temp.is_handler = '3'
        updateRoomState(temp).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({
              message: `退房成功`,
              duration: DURATION_TIME
            })
            getOrderList()
            return
          }
          ElNotification.error({
            message: `退房失败，请重试！`,
            duration: DURATION_TIME
          })
        })
      }
    })
  }
}
</script>

<template>
  <el-card class="card-box">
    <el-row :gutter="12">
      <el-col :span="4">
        <el-input v-model="query.customer_name" placeholder="姓名" />
      </el-col>
      <el-col :span="4">
        <el-button type="warning" @click="query.customer_name = undefined">
          重置
        </el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      empty-text="暂无数据"
      @cell-dblclick="openDialog"
    >
      <el-table-column prop="customer_name" label="姓名" />
      <el-table-column prop="id_card" label="身份证号" />
      <el-table-column prop="telephone" label="电话" />
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
      <el-table-column label="注册时间" align="center">
        <template #default="{ row }">
          {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="primary" @click="openOrderDialog(row)">
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

  <!-- order dialog-->
  <el-dialog
    v-model="orderDialog"
    title="顾客订单"
    width="70%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="未处理" name="1">
        <el-table
          v-loading="orderTableLoading"
          :data="orderTableData"
          empty-text="暂无订单"
        >
          <el-table-column label="姓名">
            <template #default="{ row }">
              {{ row.customer.customer_name }}
            </template>
          </el-table-column>
          <el-table-column label="房间名">
            <template #default="{ row }">
              {{ row.room.room_name }}
            </template>
          </el-table-column>
          <el-table-column label="价格">
            <template #default="{ row }">
              <span :style="{ color: 'red' }">
                ￥{{ row.room.room_price }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag
                v-if="row.is_handler === '1'"
                type="warning"
                disable-transitions
              >
                已预约
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center">
            <template #default="{ row }">
              {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button type="success" @click="handlerStay('1', row)">
                入住
              </el-button>
              <el-button type="warning" @click="handlerStay('2', row)">
                退房
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="已处理" name="2">
        <el-table
          v-loading="orderTableLoading"
          :data="orderTableData"
          empty-text="暂无订单"
        >
          <el-table-column label="姓名">
            <template #default="{ row }">
              {{ row.customer.customer_name }}
            </template>
          </el-table-column>
          <el-table-column label="房间名称">
            <template #default="{ row }">
              {{ row.room.room_name }}
            </template>
          </el-table-column>
          <el-table-column label="价格">
            <template #default="{ row }">
              <span :style="{ color: 'red' }">
                ￥{{ row.room.room_price }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag
                v-if="row.is_handler === '2'"
                type="success"
                disable-transitions
              >
                已入住
              </el-tag>
              <el-tag
                v-else-if="row.is_handler === '3'"
                type="danger"
                disable-transitions
              >
                已退房
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center">
            <template #default="{ row }">
              {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center">
            <template #default="{ row }">
              <el-button type="warning">退房</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <Pagination
        :current-page="orderQuery.page"
        :page-size="orderQuery.size"
        :total="orderTotal"
        :page-sizes="[5, 10, 15, 20]"
        @current-change="handleCurrentOrder"
        @size-change="handleSizeOrder"
      />
    </el-tabs>
    <template #footer>
      <el-button type="primary" @click="orderDialog = false"> 返回</el-button>
    </template>
  </el-dialog>

  <!--detail dialog-->
  <el-dialog
    v-model="isDialog"
    title="顾客详情"
    width="35%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-form :model="dialogForm" label-width="80">
      <el-row>
        <el-col :span="24">
          <el-form-item label="客户姓名">
            <span class="customer-detail-title">
              {{ dialogForm.customer_name }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户账号">
            <span class="customer-detail-title">
              {{ dialogForm.customer_account }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="账号状态">
            <el-radio-group
              v-model="dialogForm.is_status"
              size="small"
              @change="handlerChangeStatus(dialogForm)"
            >
              <el-radio-button :label="true">正常</el-radio-button>
              <el-radio-button :label="false">禁用</el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="身份证号">
            <span class="customer-detail-title">
              {{ dialogForm.id_card }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户电话">
            <span class="customer-detail-title">
              {{ dialogForm.telephone }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="注册时间">
            {{ moment(dialogForm.create_time).format('YYYY-MM-DD HH:mm:ss') }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="客户描述">
            <span class="customer-detail-title">
              {{ dialogForm.description }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="primary" @click="handlerUpdatePassword(dialogForm)">
        重置密码
      </el-button>
      <el-button type="danger" @click="isDialog = false"> 关闭窗口</el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.card-box {
  margin: 20px;
}

:deep(.el-row) {
  margin-bottom: 10px;
}

.customer-detail-title {
  font-size: 12px;
  color: #7a8b9a;
}
</style>
