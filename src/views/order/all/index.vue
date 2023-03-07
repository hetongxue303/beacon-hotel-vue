<script setup lang="ts">
import moment from 'moment'
import Pagination from '../../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessageBox, ElNotification, ElTable } from 'element-plus'
import { clone, cloneDeep } from 'lodash'
import { delayRequest } from '../../../utils/common'
import { OrderEntity } from '../../../types/entity'
import { deleteOrder, getOrderPageList } from '../../../api/order'
import { QueryOrder } from '../../../types/query'
import { updateRoomState } from '../../../api/room'
import { DURATION_TIME } from '../../../settings'

const tableData = ref<OrderEntity[]>([])
const tableLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryOrder = reactive({ page: 1, size: 5 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const getTableList = () => {
  tableLoading.value = true
  delayRequest(
    () => {
      getOrderPageList(query)
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
const reset = () => {
  query.order_num = undefined
  query.is_handler = undefined
}
watch(
  () => query,
  () => {
    getTableList()
  },
  { deep: true }
)
onMounted(() => getTableList())

const detailDialog = ref<boolean>(false)
const detailFrom = ref<OrderEntity>({})
const handlerDblclick = (row: OrderEntity) => {
  detailFrom.value = cloneDeep(row)
  detailDialog.value = true
}
watch(
  () => detailDialog.value,
  (value) => {
    if (!value) detailFrom.value = {}
  },
  { deep: true }
)
const handlerDelete = (id: number) => {
  deleteOrder(id).then(async ({ data }) => {
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
            detailDialog.value = false
            getTableList()
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
            detailDialog.value = false
            getTableList()
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
  <el-dialog
    v-model="detailDialog"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
    width="40%"
    title="订单详情"
  >
    <el-form label-width="70">
      <el-row>
        <el-col :span="12">
          <el-form-item label="客户姓名">
            <span class="order-detail-title">
              {{ detailFrom.customer?.customer_name }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="订单状态">
            <el-tag
              v-if="detailFrom.is_handler === '1'"
              type="warning"
              disable-transitions
            >
              已预约
            </el-tag>
            <el-tag
              v-else-if="detailFrom.is_handler === '2'"
              type="success"
              disable-transitions
            >
              已入住
            </el-tag>
            <el-tag v-else type="danger" disable-transitions>已退房</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="身份证号">
            <span class="order-detail-title">
              {{ detailFrom.customer?.id_card }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客户电话">
            <span class="order-detail-title">
              {{ detailFrom.customer?.telephone }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="房间名称">
            <span class="order-detail-title">
              {{ detailFrom.room?.room_name }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客房类型">
            <span class="order-detail-title">
              {{ detailFrom.room?.type?.room_type_name }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="房间价格">
            <span :style="{ color: 'red' }" class="order-detail-title">
              ￥{{ detailFrom.room?.room_price }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="入住天数">
            <span class="order-detail-title">
              {{
                new Date(detailFrom.leave_date_time).getDate() -
                new Date(detailFrom.start_date_time).getDate()
              }}
              天
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="客户备注">
            <span class="order-detail-title">
              {{ detailFrom.description }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="订单编号">
            <span class="order-detail-title">
              {{ detailFrom.order_num }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="创建时间">
            <span class="order-detail-title">
              {{ moment(detailFrom.create_time).format('YYYY-MM-DD HH:mm:ss') }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        type="success"
        :disabled="
          detailFrom.is_handler === '3' || detailFrom.is_handler === '2'
        "
        @click="handlerStay('1', detailFrom)"
      >
        办理入住
      </el-button>
      <el-button
        type="primary"
        :disabled="detailFrom.is_handler === '3'"
        @click="handlerStay('2', detailFrom)"
      >
        办理退房
      </el-button>
      <el-button type="danger" @click="detailDialog = false">
        关闭窗口
      </el-button>
    </template>
  </el-dialog>
  <el-card class="card-box">
    <el-row :gutter="12">
      <el-col :span="4">
        <el-input v-model="query.order_num" placeholder="订单编号" />
      </el-col>
      <el-col :span="4">
        <el-select
          v-model="query.is_handler"
          placeholder="状态"
          clearable
          @clear="query.is_handler = undefined"
        >
          <el-option label="已预约" value="1" />
          <el-option label="已入住" value="2" />
          <el-option label="已退房" value="3" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="warning" @click="reset">重置</el-button>
      </el-col>
    </el-row>
    <el-table
      v-loading="tableLoading"
      :data="tableData"
      empty-text="暂无数据"
      @cell-dblclick="handlerDblclick"
    >
      <el-table-column label="订单编号" width="190" prop="order_num" />
      <el-table-column prop="customer.customer_name" label="姓名" width="100" />
      <el-table-column label="身份证号" width="180" prop="customer.id_card" />
      <el-table-column label="电话" prop="customer.telephone" />
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag
            v-if="row.is_handler === '1'"
            type="warning"
            disable-transitions
          >
            已预约
          </el-tag>
          <el-tag
            v-else-if="row.is_handler === '2'"
            type="success"
            disable-transitions
          >
            已入住
          </el-tag>
          <el-tag v-else type="danger" disable-transitions> 已退房</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" align="center" width="180">
        <template #default="{ row }">
          {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="240">
        <template #default="{ row }">
          <el-button
            type="success"
            :disabled="row.is_handler === '3' || row.is_handler === '2'"
            @click="handlerStay('1', row)"
          >
            入住
          </el-button>
          <el-button
            type="primary"
            :disabled="row.is_handler === '3'"
            @click="handlerStay('2', row)"
          >
            退房
          </el-button>
          <el-popconfirm
            title="确定删除本条数据吗？"
            @confirm="handlerDelete(row.order_id)"
          >
            <template #reference>
              <el-button :disabled="row.is_handler !== '3'" type="danger">
                删除
              </el-button>
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
</template>

<style scoped lang="scss">
.card-box {
  margin: 20px;
}

:deep(.el-row) {
  margin-bottom: 10px;
}

.order-detail-title {
  font-size: 12px;
  color: #7a8b9a;
}
</style>
