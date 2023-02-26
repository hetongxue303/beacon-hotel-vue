<script setup lang="ts">
import moment from 'moment'
import Pagination from '../../../components/Pagination/index.vue'
import { onMounted, reactive, ref, watch } from 'vue'
import {
  ElMessageBox,
  ElNotification,
  ElTable,
  ElTree,
  FormInstance
} from 'element-plus'
import { delayRequest } from '../../../utils/common'
import { clone, cloneDeep } from 'lodash'
import { MenuEntity, MenuInfoDto, RoleEntity } from '../../../types/entity'
import { QueryRole } from '../../../types/query'
import {
  addRole,
  deleteBatchRole,
  deleteRole,
  getRolePageList,
  updateRoleInfo
} from '../../../api/role'
import { DATE_TIME_FORMAT, DURATION_TIME } from '../../../settings'
import { getMenuList, getMenuTreeList, getMyMenuList } from '../../../api/menu'
import { filterMenuKey, filterMenuTree, Tree } from '../../../filter/menu'

const notifySuccess = (message = '操作成功', duration = DURATION_TIME) =>
  ElNotification.success({ message, duration })
const notifyError = (message = '操作失败', duration = DURATION_TIME) =>
  ElNotification.error({ message, duration })
const notifyWarning = (message = '发生警告', duration = DURATION_TIME) =>
  ElNotification.warning({ message, duration })
const tableData = ref<RoleEntity[]>([])
const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const multipleSelection = ref<RoleEntity[]>([])
const tableLoading = ref<boolean>(false)
const total = ref<number>(0)
const query: QueryRole = reactive({ page: 1, size: 5 })
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

const menuTree = ref<Tree[]>([])
const treeRef = ref<InstanceType<typeof ElTree>>()
const roleMenu = ref<MenuEntity[]>([])
const menuAll = ref<MenuEntity[]>([])
const roleCheckedMenuKeys = ref<number[]>([])

const getMenuTree = () => {
  getMenuTreeList().then(
    ({ data }) =>
      (menuTree.value = data.code === 200 ? filterMenuTree(data.data, 0) : [])
  )
}
const getMyMenuTree = (role_id: number) => {
  roleMenu.value = []
  roleCheckedMenuKeys.value = []
  getMyMenuList(role_id).then(({ data }) => {
    if (data.code === 200) {
      roleMenu.value = cloneDeep(data.data)
      roleCheckedMenuKeys.value = filterMenuKey(roleMenu.value)
    }
  })
}
const getMenuListAll = () => {
  getMenuList().then(({ data }) => {
    menuAll.value = data.code === 200 ? cloneDeep(data.data) : []
  })
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
  getMenuTree()
  getMenuListAll()
})

const isDialog = ref<boolean>(false)
const dialogFormRef = ref<FormInstance>()
const dialogForm = ref<RoleEntity>({ is_status: false })
const dialogTitle = ref<string>('')
const dialogOperate = ref<string>('')

enum operates {
  insert = 'insert',
  update = 'update'
}

const openDialog = (operate: operates, row?: RoleEntity) => {
  if (operate === operates.insert) {
    dialogTitle.value = '新增'
    roleCheckedMenuKeys.value = []
  } else {
    dialogTitle.value = '编辑'
    getMyMenuTree(row?.role_id as number)
    if (row) {
      dialogForm.value = cloneDeep(row)
    } else {
      dialogForm.value = cloneDeep(multipleSelection.value[0] as RoleEntity)
    }
  }
  isDialog.value = true
  dialogOperate.value = operate
}
const handlerOperate = async (formEl?: FormInstance) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (dialogOperate.value === operates.insert) {
        addRole({
          role: dialogForm.value,
          menu_ids: treeRef.value?.getCheckedKeys() as number[]
        }).then(({ data }) => {
          switch (data.code) {
            case 200:
              notifySuccess('添加成功')
              isDialog.value = false
              getTableList()
              break
            case 201:
              notifyWarning(data.message)
              break
            default:
              notifyError('添加失败，请重试!')
          }
        })
      } else {
        const temp: MenuInfoDto = {
          role: dialogForm.value,
          menu_ids: treeRef.value?.getCheckedKeys() as number[]
        }
        updateRoleInfo(temp).then(({ data }) => {
          if (data.code === 200) {
            notifySuccess('更新成功')
            isDialog.value = false
            getTableList()
            return
          }
          notifyError('更新失败，请重试!')
        })
      }
    }
  })
}
const handlerDelete = (id: number) => {
  deleteRole(id).then(async ({ data }) => {
    if (data.code === 200) {
      notifySuccess('删除成功')
      getTableList()
      return
    }
    notifyError('删除失败')
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
  delete: true
})
const handleBatchDelete = () => {
  ElMessageBox.confirm('确认删除选中行数据吗?', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '返回',
    type: 'warning'
  }).then(() => {
    deleteBatchRole(
      multipleSelection.value.map((item) => item.role_id) as number[]
    ).then(({ data }) => {
      if (data.code === 200) {
        notifySuccess('删除成功')
        getTableList()
        return
      }
      notifyError('删除失败')
    })
  })
}
watch(
  () => multipleSelection.value,
  () => (disabled.delete = multipleSelection.value.length < 1),
  { immediate: true, deep: true }
)
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
          <el-option label="正常" :value="true" />
          <el-option label="禁用" :value="false" />
        </el-select>
      </el-col>
      <el-col :span="4">
        <el-button type="warning" @click="reset">重置</el-button>
      </el-col>
    </el-row>
    <el-row :gutter="12">
      <el-button type="success" @click="openDialog(operates.insert)">
        新增
      </el-button>
      <el-button
        type="danger"
        :disabled="disabled.delete"
        @click="handleBatchDelete"
      >
        删除
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
      <el-table-column label="状态">
        <template #default="{ row }">
          <el-tag
            v-if="row.is_status"
            type="success"
            effect="dark"
            disable-transitions
          >
            正常
          </el-tag>
          <el-tag v-else type="danger" effect="dark" disable-transitions>
            禁用
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        label="备注"
        :show-overflow-tooltip="true"
      />
      <el-table-column label="创建时间" align="center">
        <template #default="{ row }">
          {{ moment(row.create_time).format(DATE_TIME_FORMAT) }}
        </template>
      </el-table-column>
      <el-table-column label="更新时间" align="center">
        <template #default="{ row }">
          {{ moment(row.update_time).format(DATE_TIME_FORMAT) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="180">
        <template #default="{ row }">
          <el-button type="primary" @click="openDialog(operates.update, row)">
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
          <el-radio-button :label="true">正常</el-radio-button>
          <el-radio-button :label="false">禁用</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item prop="description" label="角色备注">
        <el-input
          v-model="dialogForm.description"
          type="textarea"
          :rows="3"
          resize="none"
          placeholder="默认：空"
        />
      </el-form-item>
      <el-form-item label="权限">
        <el-tree
          ref="treeRef"
          :data="menuTree"
          node-key="id"
          :default-checked-keys="roleCheckedMenuKeys"
          highlight-current
          show-checkbox
          :props="{
            label: 'label',
            children: 'children'
          }"
        ></el-tree>
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
  margin: 20px;
}

:deep(.el-row) {
  margin-bottom: 10px;
}
</style>
