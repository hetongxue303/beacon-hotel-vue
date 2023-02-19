<script setup lang="ts">
import moment from 'moment'
import { TypeEntity } from '../../types/entity'
import Pagination from '../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import { QueryType } from '../../types/query'
import { ElNotification, ElTable, FormInstance } from 'element-plus'
import {
  addRoomType,
  deleteRoomType,
  getRoomTypePageList,
  updateRoomType
} from '../../api/room_type'
import { delayRequest } from '../../utils/common'
import { clone, cloneDeep } from 'lodash'
import { DURATION_TIME } from '../../settings'

const tableData = ref<TypeEntity[]>([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<TypeEntity[]>([])
const tableLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryType = reactive({ page: 1, size: 10 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const handleSelectionChange = (selection: TypeEntity[]) =>
  (multipleSelection.value = selection)
const getTableList = () => {
  tableLoading.value = true
  delayRequest(
    () => {
      getRoomTypePageList(query)
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
const dialogForm = ref<TypeEntity>({})
const dialogTitle = ref<string>('')
const dialogOperate = ref<string>('')
const openDialog = (operate: string, row?: TypeEntity) => {
  if (operate === 'insert') {
    dialogTitle.value = '新增类型'
  } else {
    dialogTitle.value = '编辑类型'
    if (row) {
      dialogForm.value = cloneDeep(row)
    } else {
      dialogForm.value = cloneDeep(multipleSelection.value[0] as TypeEntity)
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
</script>

<template>
  <el-card class="card-box">
    <el-row :gutter="12">
      <el-col :span="4">
        <el-input v-model="query.room_type_name" placeholder="客房类型" />
      </el-col>
      <el-col :span="4">
        <el-button type="warning" @click="query.room_type_name = undefined">
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
      <el-table-column prop="room_type_name" label="客房类型" />
      <el-table-column prop="description" label="备注" />
      <el-table-column label="创建时间" align="center">
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
            @confirm="handlerDelete(row.room_type_id)"
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
        prop="room_type_name"
        label="客房类型"
        :rules="{
          required: true,
          message: '客房类型不能为空',
          trigger: 'blur'
        }"
      >
        <el-input v-model="dialogForm.room_type_name" />
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
</template>

<style scoped lang="scss">
.card-box {
  margin-top: 20px;
}

:deep(.el-row) {
  margin-bottom: 10px;
}
</style>
