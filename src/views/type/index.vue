<script setup lang="ts">
import moment from 'moment'
import { TypeEntity } from '../../types/entity'
import Pagination from '../../components/Pagination/index.vue'
import { reactive, ref, watch } from 'vue'
import { QueryType } from '../../types/query'
import { ElTable } from 'element-plus'

const data: TypeEntity[] = [
  {
    room_type_id: 1,
    room_type_name: '单人间',
    description: '123',
    create_time: new Date(),
    update_time: new Date()
  },
  {
    room_type_id: 2,
    room_type_name: '双人间',
    description: '321',
    create_time: new Date(),
    update_time: new Date()
  },
  {
    room_type_id: 3,
    room_type_name: '三人间',
    description: '标准',
    create_time: new Date(),
    update_time: new Date()
  },
  {
    room_type_id: 4,
    room_type_name: '大床房',
    description: '456',
    create_time: new Date(),
    update_time: new Date()
  },
  {
    room_type_id: 5,
    room_type_name: '商务间',
    description: '456',
    create_time: new Date(),
    update_time: new Date()
  },
  {
    room_type_id: 6,
    room_type_name: '标准套间',
    description: '456',
    create_time: new Date(),
    update_time: new Date()
  }
]
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<TypeEntity[]>([])
const tableLoading = ref<boolean>(false)
const handleSelectionChange = (list: TypeEntity[]) =>
  (multipleSelection.value = list)

const total = ref<number>(0)
const query: QueryType = reactive({ current_page: 1, page_size: 10 })
const handleCurrent = (page: number) => (query.current_page = page)
const handleSize = (size: number) => (query.page_size = size)
watch(
  () => query,
  () => {},
  { deep: true }
)
</script>

<template>
  <el-card style="margin-top: 20px">
    <el-row :gutter="12" style="margin-bottom: 20px">
      <el-col :span="4">
        <el-input v-model="query.room_type_name" placeholder="房间类型" />
      </el-col>
      <el-col :span="4">
        <el-button type="warning" @click="query.room_type_name = undefined">
          重置
        </el-button>
      </el-col>
    </el-row>
    <el-table
      ref="multipleTableRef"
      v-loading="tableLoading"
      :data="data"
      empty-text="暂无数据"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="30" align="center" />
      <el-table-column prop="room_type_id" label="ID" />
      <el-table-column prop="room_type_name" label="房间类型" />
      <el-table-column prop="description" label="房间描述" />
      <el-table-column label="创建时间" align="center">
        <template #default="{ row }">
          {{ moment(row.create_time).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template #default="{ row }">
          <el-button type="primary">编辑</el-button>
          <el-button type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      :current-page="query.current_page"
      :page-size="query.page_size"
      :total="total"
      @current-change="handleCurrent"
      @size-change="handleSize"
    />
  </el-card>
</template>

<style scoped lang="scss"></style>
