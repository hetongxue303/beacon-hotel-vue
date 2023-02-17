<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import carousel1 from '../../assets/images/bn1.png'
import carousel2 from '../../assets/images/bn2.png'
import carousel3 from '../../assets/images/bn3.png'
import carousel4 from '../../assets/images/bn4.png'
import image1 from '../../assets/images/box1.png'
import image2 from '../../assets/images/box2.png'
import image3 from '../../assets/images/box3.png'
import image4 from '../../assets/images/box4.png'
import image5 from '../../assets/images/up1.png'
import image6 from '../../assets/images/up2.png'
import image7 from '../../assets/images/up3.png'
import image8 from '../../assets/images/up4.png'
import logo from '../../assets/images/logo.png'
import { RoomEntity, TypeEntity } from '../../types/entity'
import Pagination from '../../components/Pagination/index.vue'
import { delayRequest, randomNumber } from '../../utils/common'
import { getRoomPageHomeList } from '../../api/room'
import { clone, cloneDeep } from 'lodash'
import { getRoomTypeList } from '../../api/room_type'
import { QueryRoom } from '../../types/query'

const carousels = reactive([carousel1, carousel2, carousel3, carousel4])
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
const interval = ref<number>(4000)
const listData = ref<RoomEntity[]>([])
const query: QueryRoom = reactive({ page: 1, size: 10 })
const total = ref<number>(1000)
const listLoading = ref<boolean>(false)
const roomTypeList = ref<TypeEntity[]>([])
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const randomImage = (data: any[]) => {
  return data[randomNumber(1, data.length) as number]
}
const getRoomList = () => {
  listLoading.value = true
  delayRequest(
    () => {
      getRoomPageHomeList(query)
        .then(({ data }) => {
          if (data.code === 200) {
            listData.value = cloneDeep(data.data.record)
            total.value = clone(data.data.total)
          }
        })
        .finally(() => (listLoading.value = false))
    },
    5,
    500
  )
}
const getRoomTypeData = () => {
  delayRequest(
    () => {
      getRoomTypeList().then(({ data }) =>
        data.code === 200
          ? (roomTypeList.value = cloneDeep(data.data))
          : (roomTypeList.value = [])
      )
    },
    5,
    500
  )
}
watch(
  () => query,
  () => getRoomList(),
  { deep: true }
)
onMounted(() => {
  getRoomTypeData()
  getRoomList()
})
</script>

<template>
  <div class="home-box">
    <el-affix>
      <div class="header">
        <el-link href="/home" :underline="false">
          <el-image
            :src="logo"
            fit="contain"
            style="width: 120px; height: 50px"
          />
        </el-link>
        <div>
          <span style="color: #b7b6b7">客服热线：</span>
          <span style="color: #c69e0b; font-weight: bold; margin-right: 10px">
            400-820-8888
          </span>
          <el-button type="success"> 酒店预约</el-button>
          <el-button type="primary">查询</el-button>
        </div>
      </div>
    </el-affix>
    <el-carousel :interval="interval + 1000" arrow="always" height="400px">
      <el-carousel-item v-for="carousel in carousels" :key="carousel">
        <el-image :src="carousel" style="height: 100%; width: 100%" />
      </el-carousel-item>
    </el-carousel>
    <el-row justify="center">
      <el-col :span="20" class="banner-box">
        <el-card body-style="padding: 0" class="banner-card">
          <span style="color: #57a3e5; font-size: 18px">房间信息</span>
        </el-card>
      </el-col>
    </el-row>
    <el-row justify="center">
      <el-col :span="4" style="padding-right: 20px">
        <el-card body-style="padding: 0" shadow="always">
          <el-menu default-active="0" style="width: 100%; height: 100%">
            <el-menu-item index="0" @click="query.room_type_id = undefined">
              <span>全部</span>
            </el-menu-item>
            <el-menu-item
              v-for="item in roomTypeList"
              :key="item.room_type_id"
              :index="item.room_type_id"
              @click="query.room_type_id = item.room_type_id"
            >
              <span>{{ item.room_type_name }}</span>
            </el-menu-item>
          </el-menu>
        </el-card>
      </el-col>
      <el-col
        v-if="listData.length === 0"
        v-loading="listLoading"
        :span="16"
        class="detail-nodata-show"
      >
        <span>暂无数据</span>
      </el-col>
      <el-col v-else v-loading="listLoading" :span="16">
        <el-row justify="start">
          <el-col v-for="item in listData" :key="item" :span="6">
            <el-card
              shadow="hover"
              class="detail-card-box"
              body-style="padding: 0"
            >
              <el-image class="image-box" :src="randomImage(images)" />
              <div style="padding: 5px 10px 5px 10px; font-size: 14px">
                <div class="room-detail">
                  <span style="color: #7a8b9a"> {{ item.room_name }} </span>
                  <span style="font-size: 12px; color: red">
                    ￥{{ item.room_price }}
                  </span>
                </div>
                <div class="room-detail-button">
                  <el-button type="danger" size="small"> 立即预约</el-button>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
  <div class="page-box">
    <Pagination
      :current-page="query.page"
      :page-size="query.size"
      :total="total"
      @current-change="handleCurrent"
      @size-change="handleSize"
    />
  </div>
  <div class="footer">沪ICP备19037546号-1 沪公网安备 31011502002275号</div>
  <el-backtop :right="100" :bottom="100" />
</template>

<style scoped lang="scss">
$bg-height: auto;
$header-footer-height: 60px;
@mixin default-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

.detail-nodata-show {
  @include default-display;
  font-size: 18px;
  color: #7a8b9a;
}

.home-box {
  width: 100%;
  height: $bg-height;
  background-color: #f3f3f3;
  padding-bottom: 25px;

  .header {
    background-color: #ffffff;
    width: 100%;
    height: $header-footer-height;
    @include default-display;
    justify-content: space-between;
    padding: 0 80px 0 80px;
  }
}

.page-box {
  @include default-display;
  height: 50px;
  background-color: #f3f3f3;
  padding-bottom: 30px;
}

.detail-card-box {
  width: 200px;
  height: 320px;
  margin-bottom: 30px;
  border-radius: 10px;
  transition: all 0.15s 0s linear;

  &:hover {
    transform: scale(1.08);
  }
}

.image-box {
  width: 200px;
  height: 250px;
}

.room-detail {
  @include default-display;
  justify-content: space-between;
}

.banner-box {
  @include default-display;
  background-color: #ecf4fe;
  width: 100%;
  height: 50px;
  margin: 20px 0 20px 0;
}

.banner-card {
  @include default-display;
  padding: 0 0 0 20px;
  justify-content: start;
  line-height: 60px;
  height: 60px;
  width: 100%;
  background-color: #ecf4fe;
}

.room-detail-button {
  @include default-display;
  margin-top: 5px;
  line-height: 12px;
  justify-content: right;
}

.footer {
  font-size: 8px;
  color: #bfcbd9;
  height: $header-footer-height - 20px;
  width: 100%;
  background-color: #f3f3f3;
  @include default-display;
}
</style>
