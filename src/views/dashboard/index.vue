<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { QueryIndex } from '../../types/query'
import { delayRequest, randomNumber } from '../../utils/common'
import { getIndexPageList } from '../../api'
import { clone, cloneDeep } from 'lodash'
import { IndexDto, RoomEntity } from '../../types/entity'
import image1 from '../../assets/images/box1.png'
import image2 from '../../assets/images/box2.png'
import image3 from '../../assets/images/box3.png'
import image4 from '../../assets/images/box4.png'
import image5 from '../../assets/images/up1.png'
import image6 from '../../assets/images/up2.png'
import image7 from '../../assets/images/up3.png'
import image8 from '../../assets/images/up4.png'
import { ElNotification } from 'element-plus'
import { DURATION_TIME } from '../../settings'

const images = reactive([
  image1,
  image2,
  image3,
  image4,
  image5,
  image6,
  image7,
  image8
])
const indexLoading = ref<boolean>(false)
const total = ref<number>(0)
const indexData = ref<IndexDto>({})
const query: QueryIndex = reactive({ page: 1, size: 10 })
const getIndexList = () => {
  indexLoading.value = true
  delayRequest(
    () =>
      getIndexPageList(query)
        .then(({ data }) => {
          if (data.code === 200) {
            indexData.value = cloneDeep(data.data.record)
            total.value = clone(data.data.total)
          }
        })
        .finally(() => (indexLoading.value = false)),
    5,
    500
  )
}
watch(
  () => query,
  () => {
    getIndexList()
  },
  { deep: true }
)
const colors: string[] = ['#58B19F', '#EAB543', '#1B9CFC', '#eb4d4b']

onMounted(() => getIndexList())

const detailDialog = ref<boolean>(false)
const detailForm = ref<RoomEntity>({})
const handlerDblclick = (row: RoomEntity) => {
  if (row.is_state === '1') {
    ElNotification.warning({
      message: '该房间已被预约，请重新选择！',
      duration: DURATION_TIME
    })
    return
  }
  if (row.is_state === '2') {
    ElNotification.warning({
      message: '该房间已入住，请重新选择！',
      duration: DURATION_TIME
    })
    return
  }
  if (row.is_state === '3') {
    ElNotification.warning({
      message: '该房间正在维修，请重新选择！',
      duration: DURATION_TIME
    })
  } else {
    detailForm.value = cloneDeep(row)
    detailDialog.value = true
  }
}
watch(
  () => detailDialog.value,
  (value) => {
    if (!value) detailForm.value = {}
  },
  { deep: true }
)
</script>

<template>
  <el-dialog
    v-model="detailDialog"
    width="30%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
    title="客房详情"
  >
    <el-form>
      <el-form-item label="客房名称">
        <span>{{ detailForm.room_name }}</span>
      </el-form-item>
      <el-form-item label="客房价格">
        <span :style="{ color: 'red' }">￥{{ detailForm.room_price }}</span>
      </el-form-item>
      <el-form-item label="客房床位">
        <span>{{ detailForm.room_bed }}个</span>
      </el-form-item>
      <el-form-item label="可住人数">
        <span>{{ detailForm.room_count }}人</span>
      </el-form-item>
      <el-form-item label="客房状态">
        <el-tag
          v-if="detailForm.is_state === '0'"
          effect="dark"
          disable-transitions
          type="success"
          size="small"
        >
          空闲
        </el-tag>
        <el-tag
          v-else-if="detailForm.is_state === '1'"
          effect="dark"
          disable-transitions
          type="warning"
          size="small"
        >
          已预约
        </el-tag>
        <el-tag
          v-else-if="detailForm.is_state === '2'"
          effect="dark"
          disable-transitions
          type="info"
          size="small"
        >
          已入住
        </el-tag>
        <el-tag
          v-else
          effect="dark"
          disable-transitions
          type="danger"
          size="small"
        >
          维修中
        </el-tag>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button text type="danger" @click="detailDialog = false">
        返回
      </el-button>
      <el-button type="success">入住</el-button>
    </template>
  </el-dialog>
  <el-row v-loading="indexLoading" class="index-box">
    <el-col :span="20">
      <el-row justify="start" :style="{ margin: '10px 0 0 10px' }">
        <el-col
          v-for="item in indexData.rooms"
          :key="item"
          :span="4"
          class="mb-10"
          @dblclick="handlerDblclick(item)"
        >
          <el-card
            body-style="padding: 0"
            :style="{
              backgroundColor: colors[Number(item.is_state)],
              border: 'none',
              width: '155px',
              height: '155px',
              position: 'relative'
            }"
          >
            <el-image
              :style="{ width: '155px', height: '155px', filter: 'blur(3px)' }"
              :src="images[randomNumber(1, images.length)]"
            />
            <el-form
              label-width="60"
              :style="{
                position: 'absolute',
                top: '0',
                left: '0',
                backgroundColor: 'whitesmoke',
                width: '100%',
                height: '100%',
                opacity: '0.5'
              }"
            >
              <el-form-item label="名称" class="box-item">
                <span>{{ item.room_name }}</span>
              </el-form-item>
              <el-form-item label="价格" class="box-item">
                <span :style="{ color: 'red' }">￥{{ item.room_price }}</span>
              </el-form-item>
              <el-form-item label="类型" class="box-item">
                <span>{{ item.type?.room_type_name }}</span>
              </el-form-item>
              <el-form-item label="状态" class="box-item">
                <el-tag
                  v-if="item.is_state === '0'"
                  effect="dark"
                  disable-transitions
                  type="success"
                  size="small"
                >
                  空闲
                </el-tag>
                <el-tag
                  v-else-if="item.is_state === '1'"
                  effect="dark"
                  disable-transitions
                  type="warning"
                  size="small"
                >
                  已预约
                </el-tag>
                <el-tag
                  v-else-if="item.is_state === '2'"
                  effect="dark"
                  disable-transitions
                  type="info"
                  size="small"
                >
                  已入住
                </el-tag>
                <el-tag
                  v-else
                  effect="dark"
                  disable-transitions
                  type="danger"
                  size="small"
                >
                  维修中
                </el-tag>
              </el-form-item>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </el-col>
    <el-col
      :span="4"
      :style="{ backgroundColor: '#aff5e7', padding: '0 20px 0 20px' }"
    >
      <div :style="{ width: '100%', marginTop: '20px' }">
        <el-row :style="{ marginBottom: '10px' }">
          <el-col :span="12">
            <span class="box-title">空闲</span>
          </el-col>
          <el-col :span="12">
            <el-tag effect="dark" disable-transitions type="success">
              {{ indexData.free_time }}间
            </el-tag>
          </el-col>
        </el-row>
        <el-row :style="{ marginBottom: '10px' }">
          <el-col :span="12">
            <span class="box-title">已预约</span>
          </el-col>
          <el-col :span="12">
            <el-tag effect="dark" disable-transitions type="warning">
              {{ indexData.booking }}间
            </el-tag>
          </el-col>
        </el-row>
        <el-row :style="{ marginBottom: '10px' }">
          <el-col :span="12">
            <span class="box-title">已入住</span>
          </el-col>
          <el-col :span="12">
            <el-tag effect="dark" disable-transitions type="info">
              {{ indexData.stay }}间
            </el-tag>
          </el-col>
        </el-row>
        <el-row :style="{ marginBottom: '10px' }">
          <el-col :span="12">
            <span class="box-title">维修中</span>
          </el-col>
          <el-col :span="12">
            <el-tag effect="dark" disable-transitions type="danger">
              {{ indexData.maintenance }}间
            </el-tag>
          </el-col>
        </el-row>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">
.index-box {
  width: 100%;
  height: 100%;
  background-color: #d3f3eb;
}

.box-item {
  margin-bottom: 6px;
}

:deep(.el-form-item__content) {
}

:deep(.el-form-item__label) {
  color: black;
  font-weight: bold;
}

.box-title {
  color: black;
  font-weight: bold;
  font-size: 14px;
}
</style>
