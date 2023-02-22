<script setup lang="ts">
import Pagination from '../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { RoomEntity, TypeEntity } from '../../types/entity'
import {
  ElMessageBox,
  ElNotification,
  ElTable,
  FormInstance
} from 'element-plus'
import { clone, cloneDeep } from 'lodash'
import { QueryRoom } from '../../types/query'
import { delayRequest } from '../../utils/common'
import {
  addRoom,
  deleteRoom,
  getRoomPageList,
  updateRoom,
  updateRoomStatus
} from '../../api/room'
import { getRoomTypeList } from '../../api/room_type'
import { DURATION_TIME } from '../../settings'
import moment from 'moment'

const tableData = ref<RoomEntity[]>([])
const roomTypeList = ref<TypeEntity[]>([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<RoomEntity[]>([])
const tableLoading = ref<boolean>(false)
const switchLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryRoom = reactive({ page: 1, size: 5 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const handleSelectionChange = (selection: RoomEntity[]) =>
  (multipleSelection.value = selection)
const reset = () => {
  query.room_name = undefined
  query.is_status = undefined
  query.room_type_id = undefined
}
const handlerSwitchChange = (room: RoomEntity) => {
  switchLoading.value = true
  ElMessageBox.confirm(
    `确定要${room.is_status ? '启用' : '禁用'} ${room.room_name} 吗?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  )
    .then(async () => {
      const { data } = await updateRoomStatus(room)
      if (data.code === 200) {
        ElNotification.success({
          message: room.is_status ? '已启用' : '已禁用',
          duration: 1500
        })
        return
      }
      ElNotification.error({
        message: '切换失败，请重试',
        duration: DURATION_TIME
      })
    })
    .catch(() => (room.is_status = !room.is_status))
    .finally(() => (switchLoading.value = false))
}
const getTableList = () => {
  tableLoading.value = true
  delayRequest(
    () => {
      getRoomPageList(query)
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
const getRoomTypeData = () => {
  getRoomTypeList().then(({ data }) =>
    data.code === 200 ? (roomTypeList.value = cloneDeep(data.data)) : []
  )
}
watch(
  () => query,
  () => {
    getTableList()
  },
  { deep: true }
)
onMounted(() => {
  getTableList()
  getRoomTypeData()
})

const isDrawer = ref<boolean>(false)
const drawerFormRef = ref<FormInstance>()
const drawerForm = ref<RoomEntity>({ is_status: false })
const drawerTitle = ref<string>('')
const drawerOperate = ref<string>('')
const disabled = reactive({
  update: true,
  delete: true
})
const handlerSelectChange = (selected: number) => {
  drawerForm.value.room_type_id = selected
}
const openDrawer = (operate: string, row?: RoomEntity) => {
  if (operate === 'insert') {
    drawerTitle.value = '新增客房'
  } else {
    drawerTitle.value = '编辑客房'
    if (row) {
      drawerForm.value = cloneDeep(row)
    } else {
      drawerForm.value = cloneDeep(multipleSelection.value[0] as RoomEntity)
    }
  }
  getRoomTypeData()
  isDrawer.value = true
  drawerOperate.value = operate
}
const handlerOperate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (drawerOperate.value === 'insert') {
        addRoom(drawerForm.value).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({
              message: '添加成功',
              duration: DURATION_TIME
            })
            isDrawer.value = false
            getTableList()
            return
          }
          ElNotification.error({
            message: '添加失败，请重试!',
            duration: 1500
          })
        })
      } else {
        updateRoom(drawerForm.value).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({
              message: '更新成功',
              duration: DURATION_TIME
            })
            isDrawer.value = false
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
  deleteRoom(id).then(async ({ data }) => {
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
  () => isDrawer.value,
  (value) => {
    if (!value) {
      drawerForm.value = { is_status: false }
      drawerOperate.value = ''
    }
  },
  { deep: true }
)
watch(
  () => multipleSelection.value,
  () => {
    disabled.update = multipleSelection.value.length !== 1
    disabled.delete = multipleSelection.value.length < 1
  },
  { immediate: true, deep: true }
)

const detailDialog = ref<boolean>(false)
const detailRoomForm = ref<RoomEntity>({})
const handlerDblclick = (row: RoomEntity) => {
  detailRoomForm.value = cloneDeep(row)
  detailDialog.value = true
}
</script>

<template>
  <el-dialog
    v-model="detailDialog"
    title="客房详情"
    width="40%"
    destroy-on-close
    :close-on-click-modal="false"
    :show-close="false"
  >
    <el-form>
      <el-row>
        <el-col :span="12">
          <el-form-item label="客房名称">
            <span class="detail-title">
              {{ detailRoomForm.room_name }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客房状态">
            <el-tag v-if="detailRoomForm.is_status" type="success">
              正常
            </el-tag>
            <el-tag v-else type="danger"> 禁用</el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="客房类型">
            <span class="detail-title">
              {{ detailRoomForm.type?.room_type_name }}
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客房价格">
            <span class="detail-title" style="color: red">
              ￥{{ detailRoomForm.room_price }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="客房人数">
            <span class="detail-title">
              {{ detailRoomForm.room_count }}人
            </span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="客房床位">
            <span class="detail-title"> {{ detailRoomForm.room_bed }}个 </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="房间介绍">
            <span class="detail-title">
              {{ detailRoomForm.room_detail }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="创建时间">
            <span class="detail-title">
              {{ detailRoomForm.create_time }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button type="danger" @click="detailDialog = false"> 关闭</el-button>
    </template>
  </el-dialog>

  <el-card class="card-box">
    <el-row :gutter="12">
      <el-col :span="4">
        <el-input v-model="query.room_name" placeholder="客房名称" />
      </el-col>
      <el-col :span="4">
        <el-select
          v-model="query.room_type_id"
          placeholder="客房类型"
          clearable
          @clear="query.room_type_id = undefined"
        >
          <el-option
            v-for="item in roomTypeList"
            :key="item.room_type_id"
            :label="item.room_type_name"
            :value="item.room_type_id"
          />
        </el-select>
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
    <el-row :gutter="12" style="margin-left: 5px">
      <el-button type="success" @click="openDrawer('insert')">新增</el-button>
      <el-button
        type="danger"
        :disabled="disabled.delete"
        @click="
          ElNotification.warning({
            message: '待开发...',
            duration: DURATION_TIME
          })
        "
      >
        删除
      </el-button>
      <el-button
        type="warning"
        :disabled="disabled.update"
        @click="openDrawer('update')"
      >
        修改
      </el-button>
    </el-row>
    <el-table
      ref="multipleTableRef"
      v-loading="tableLoading"
      :data="tableData"
      empty-text="暂无数据"
      @cell-dblclick="handlerDblclick"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="30" align="center" />
      <el-table-column prop="room_name" label="客房名称" width="150" />
      <el-table-column prop="type.room_type_name" label="类型" />
      <el-table-column label="价格">
        <template #default="{ row }">
          <span style="color: red"> ￥{{ row.room_price }} </span>
        </template>
      </el-table-column>
      <el-table-column label="床位">
        <template #default="{ row }"> {{ row.room_bed }}个</template>
      </el-table-column>
      <el-table-column label="人数">
        <template #default="{ row }"> {{ row.room_bed }}人</template>
      </el-table-column>
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-switch
            v-model="row.is_status"
            :loading="switchLoading"
            style="
              --el-switch-on-color: #13ce66;
              --el-switch-off-color: #ff4949;
            "
            @change="handlerSwitchChange(row)"
          />
        </template>
      </el-table-column>
      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="{ row }">
          <el-button type="primary" @click="openDrawer('update', row)">
            编辑
          </el-button>
          <el-popconfirm
            title="确定删除本条数据吗？"
            @confirm="handlerDelete(row.room_id)"
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

  <!--drawer-->
  <el-drawer
    v-model="isDrawer"
    :title="drawerTitle"
    direction="rtl"
    :show-close="false"
    destroy-on-close
    :close-on-click-modal="false"
  >
    <el-form ref="drawerFormRef" :model="drawerForm" label-width="80">
      <el-form-item
        prop="room_name"
        label="客房名称"
        :rules="{
          required: true,
          message: '客房名称不能为空',
          trigger: 'blur'
        }"
      >
        <el-input v-model="drawerForm.room_name" />
      </el-form-item>
      <el-form-item
        prop="room_type_id"
        label="客房类型"
        :rules="{
          required: true,
          message: '请选择客房类型',
          trigger: 'change'
        }"
      >
        <el-select
          v-model="drawerForm.room_type_id"
          clearable
          style="width: 100%"
          @clear="drawerForm.room_type_id = undefined"
          @change="handlerSelectChange"
        >
          <el-option
            v-for="item in roomTypeList"
            :key="item.room_type_id"
            :label="item.room_type_name"
            :value="item.room_type_id"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        prop="room_price"
        label="客房价格"
        :rules="{
          required: true,
          message: '客房价格不能为空',
          trigger: 'blur'
        }"
      >
        <el-input-number
          v-model="drawerForm.room_price"
          :step="0.1"
          :precision="2"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        prop="room_bed"
        label="客房床位"
        :rules="{
          required: true,
          message: '客房床位不能为空',
          trigger: 'blur'
        }"
      >
        <el-input-number
          v-model="drawerForm.room_bed"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        prop="room_count"
        label="可住人数"
        :rules="{
          required: true,
          message: '可住人数不能为空',
          trigger: 'blur'
        }"
      >
        <el-input-number
          v-model="drawerForm.room_count"
          controls-position="right"
        />
      </el-form-item>
      <el-form-item
        prop="is_status"
        label="是否启用"
        :rules="{ required: true }"
      >
        <el-radio-group v-model="drawerForm.is_status">
          <el-radio-button :label="true">启用</el-radio-button>
          <el-radio-button :label="false">禁用</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="客房详情">
        <el-input
          v-model="drawerForm.room_detail"
          :rows="5"
          type="textarea"
          resize="none"
          placeholder="默认：空"
          clearable
          @clear="drawerForm.room_detail = undefined"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" text @click="isDrawer = false">返回</el-button>
      <el-button type="primary" @click="handlerOperate(drawerFormRef)">
        确认
      </el-button>
    </template>
  </el-drawer>
</template>

<style scoped lang="scss">
.card-box {
  margin: 20px;
}

:deep(.el-row) {
  margin-bottom: 10px;
}

.detail-title {
  font-size: 12px;
  color: #7a8b9a;
}
</style>
