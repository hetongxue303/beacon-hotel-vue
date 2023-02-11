<script setup lang="ts">
import moment from 'moment'
import { UserEntity } from '../../../types/entity'
import Pagination from '../../../components/Pagination/index.vue'
import { reactive, ref, watch } from 'vue'
import { QueryUser } from '../../../types/query'
import { ElTable } from 'element-plus'

const data: UserEntity[] = [
  {
    user_id: 1,
    username: 'admin',
    password: '123456',
    gender: '1',
    real_name: '张三',
    is_status: true,
    description: '',
    create_time: new Date(),
    update_time: new Date()
  },
  {
    user_id: 2,
    username: 'test',
    password: '123456',
    gender: '2',
    real_name: '李四',
    is_status: false,
    description: '',
    create_time: new Date(),
    update_time: new Date()
  }
]
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<UserEntity[]>([])
const tableLoading = ref<boolean>(false)
const handleSelectionChange = (list: UserEntity[]) =>
  (multipleSelection.value = list)

const total = ref<number>(0)
const query: QueryUser = reactive({ page: 1, size: 10 })
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const reset = () => {
  query.real_name = undefined
  query.is_status = undefined
}
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
    <el-row :gutter="12" style="margin-bottom: 20px; margin-left: 1px">
      <el-button type="success">新增</el-button>
      <el-button type="danger">删除</el-button>
      <el-button type="warning">修改</el-button>
    </el-row>
    <el-table
      ref="multipleTableRef"
      v-loading="tableLoading"
      :data="data"
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
          <el-tag v-if="row.is_status" type="success" effect="dark">
            启用
          </el-tag>
          <el-tag v-else type="danger" effect="dark">禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="注册时间" align="center">
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
      :current-page="query.page"
      :page-size="query.size"
      :total="total"
      @current-change="handleCurrent"
      @size-change="handleSize"
    />
  </el-card>
</template>

<style scoped lang="scss"></style>
