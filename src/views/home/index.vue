<script setup lang="ts">
import { reactive, ref } from 'vue'
import carousel1 from '../../assets/images/bn1.png'
import carousel2 from '../../assets/images/bn2.png'
import carousel3 from '../../assets/images/bn3.png'
import carousel4 from '../../assets/images/bn4.png'
import box1 from '../../assets/images/box1.png'
import box2 from '../../assets/images/box2.png'
import box3 from '../../assets/images/box3.png'
import box4 from '../../assets/images/box4.png'
import up1 from '../../assets/images/up1.png'
import up2 from '../../assets/images/up2.png'
import up3 from '../../assets/images/up3.png'
import up4 from '../../assets/images/up4.png'
import Pagination from '../../components/Pagination/index.vue'
import { RoomEntity } from '../../types/entity'

const carousels = reactive([carousel1, carousel2, carousel3, carousel4])
const box = reactive([box1, box2, box3, box4])
const up = reactive([up1, up2, up3, up4])
const interval = ref<number>(4000)
const bthLoading = ref<boolean>(false)
const isShow = ref<boolean>(false)
const list = ref<RoomEntity[]>([])
const query: any = reactive({ page: 1, size: 10 })
const total = ref<number>(0)
const value2 = ref<string>('')
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const shortcuts = [
  {
    text: '上一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
      return [start, end]
    }
  },
  {
    text: '上个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
      return [start, end]
    }
  }
]

const currentDate = ref(new Date())
</script>

<template>
  <div class="home-box">
    <el-affix>
      <div class="header">
        <div class="left">
          <el-image style="width: 100px; height: 80px" />
          <span>LOGO</span>
        </div>
        <div class="right">
          <span style="color: #b7b6b7">客服热线：</span>
          <span style="color: #c69e0b; font-weight: bold; margin-right: 10px">
            400-820-8888
          </span>
          <el-button type="success" @click="isShow = !isShow">
            酒店预约
          </el-button>
          <el-button type="primary">查询</el-button>
        </div>
      </div>
    </el-affix>
    <div v-if="isShow">
      <el-carousel :interval="interval + 1000" arrow="always" height="500px">
        <el-carousel-item v-for="carousel in carousels" :key="carousel">
          <el-image :src="carousel" style="height: 100%; width: 100%" />
        </el-carousel-item>
      </el-carousel>
      <div class="box">
        <div v-for="b in box" :key="b" class="image-box">
          <el-image :src="b" />
        </div>
      </div>
      <div class="text-box">
        <h1 style="font-size: 38px">特色推荐</h1>
        <span style="color: #666666">
          旅行是遇见不同的风光、人群、事物，也是在不同经历的碰撞和交织中让人们的生活和生命更加丰富
        </span>
        <div class="detail-box">
          <el-carousel :interval="interval" type="card" height="350px">
            <el-carousel-item v-for="item in up" :key="item">
              <el-image :src="item" />
            </el-carousel-item>
          </el-carousel>
        </div>
      </div>
      <div class="user-box">
        <h1 style="font-size: 38px">用户预约</h1>
        <div
          style="display: flex; justify-content: center; align-items: center"
        >
          <el-form>
            <el-form-item label="您的姓名">
              <el-input />
            </el-form-item>
            <el-form-item label="身份证号">
              <el-input />
            </el-form-item>
            <el-form-item
              label="人&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;数"
            >
              <el-input />
            </el-form-item>
            <el-form-item label="预约时间">
              <el-date-picker
                v-model="value2"
                type="datetimerange"
                :shortcuts="shortcuts"
                range-separator="到"
                start-placeholder="入住时间"
                end-placeholder="离开时间"
              />
            </el-form-item>
          </el-form>
          <div class="bth-box">
            <el-button
              v-loading="bthLoading"
              class="confirm"
              round
              type="primary"
            >
              <span>查询</span>
            </el-button>
            <el-button
              v-loading="bthLoading"
              class="confirm"
              round
              type="success"
            >
              <span>预约</span>
            </el-button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <el-row
        style="display: flex; justify-content: center; align-items: center"
      >
        <el-col
          v-for="item in 20"
          :key="item"
          style="margin-bottom: 30px"
          :span="5"
        >
          <el-card shadow="hover" class="image-card">
            <el-image
              src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
              class="image"
            />
            <div style="padding: 14px">
              <span>Yummy hamburger</span>
              <div class="bottom">
                <time class="time">{{ currentDate }}</time>
                <el-button text class="button">Operating</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <Pagination
        :current-page="query.page"
        :page-size="query.size"
        :total="total"
        style="display: flex; justify-content: center; align-items: center"
        @current-change="handleCurrent"
        @size-change="handleSize"
      />
    </div>
  </div>
  <el-divider />
  <div class="footer">沪ICP备19037546号-1 沪公网安备 31011502002275号</div>
  <el-backtop :right="100" :bottom="100" />
</template>

<style scoped lang="scss">
.image-card {
  padding: 0;
  width: 300px;
  height: 400px;
}

.time {
  font-size: 12px;
  color: #999;
}

.bottom {
  margin-top: 13px;
  line-height: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.button {
  padding: 0;
  min-height: auto;
}

.image {
  width: 100%;
  height: 300px;
  display: block;
}

$bg-height: auto;
$image-box-width: 300px;
$image-box-height: 400px;
$image-box-mt: 10px;
$image-box-mr: 30px;
$image-box-scale: 1.05;
@mixin default-display {
  display: flex;
  justify-content: center;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-size: 26px;
}

:deep(.el-button.confirm) {
  width: 80px;
  height: 80px;
  margin-left: 10px;
  font-size: 22px;
  margin-bottom: 20px;
}

.home-box {
  width: 100%;
  height: $bg-height;
  background-color: #f3f3f3;

  .header {
    background-color: #ffffff;
    width: 100%;
    height: 80px;
    @include default-display;
    justify-content: space-between;
    padding: 0 50px 0 50px;
  }
}

.image-box {
  background-color: #7a8b9a;
  width: $image-box-width;
  height: $image-box-height;
  margin-right: $image-box-mr;
  margin-top: $image-box-mt;
  transition: linear, all, 0.3s;

  &:nth-child(4) {
    margin-right: 0;
  }

  &:hover {
    transform: scale($image-box-scale);
  }
}

.box {
  background-color: #bfcbd9;
  width: 100%;
  height: 300px;
  @include default-display;
  align-items: normal;
  padding: 120px 0 0 0;
}

.text-box {
  margin-top: 430px;
  width: 100%;
  height: 200px;
  flex-direction: column;
  @include default-display;
}

.detail-box {
  width: 80%;
  margin-top: 50px;
}

.user-box {
  width: 100%;
  height: 500px;
  margin-top: 70px;
  @include default-display;
  flex-direction: column;

  h1 {
    margin-bottom: 20px;
  }
}

.bth-box {
  height: 100%;
  @include default-display;
  flex-direction: column;
  justify-content: space-around;
}

.footer {
  position: absolute;
  height: 60px;
  width: 100%;
  top: $bg-height - 60px;
  @include default-display;
}
</style>
