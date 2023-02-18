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
import {
  CustomerEntity,
  CustomerLoginDto,
  RoomEntity,
  TypeEntity
} from '../../types/entity'
import Pagination from '../../components/Pagination/index.vue'
import { delayRequest, randomNumber } from '../../utils/common'
import { getRoomPageHomeList } from '../../api/room'
import { clone, cloneDeep } from 'lodash'
import { getRoomTypeList } from '../../api/room_type'
import { QueryRoom } from '../../types/query'
import { ElNotification, FormInstance } from 'element-plus'
import { useHomeStore } from '../../store/modules/home'
import { insertCustomer, customerLogin } from '../../api/customer'
import { encryptPasswordToMD5 } from '../../hook/encrypt'
import { DURATION_TIME } from '../../settings'

/* 初始化相关 */
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

/* 注册相关 */
const insertDialog = ref<boolean>(false)
const loginDialog = ref<boolean>(false)
const insertLoading = ref<boolean>(false)
const insertForm = ref<CustomerEntity>({})
const insertFormRef = ref<FormInstance>()
const defaultPassword = ref<string>('123456')
watch(
  () => insertDialog.value,
  (value) => {
    if (!value) insertForm.value = {}
  },
  { deep: true }
)
const handlerInsert = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      const loginData = cloneDeep(insertForm.value)
      const password = loginData.customer_password
      if (password) {
        loginData.customer_password = encryptPasswordToMD5(password)
      } else {
        loginData.customer_password = encryptPasswordToMD5(
          defaultPassword.value
        )
      }
      insertCustomer(loginData).then(({ data }) => {
        switch (data.code) {
          case 200:
            ElNotification.success({
              message: '注册成功,请登录！',
              duration: DURATION_TIME
            })
            insertDialog.value = false
            loginDialog.value = true
            break
          case 201:
            ElNotification.warning({
              message: data.message,
              duration: DURATION_TIME
            })
            break
          default:
            ElNotification.error({
              message: '注册失败，请重试！',
              duration: DURATION_TIME
            })
        }
      })
    }
  })
}

/* 登陆相关 */
const loginForm = ref<CustomerLoginDto>({
  customer_account: '',
  customer_password: ''
})
const loginFormRef = ref<FormInstance>()
const loginLoading = ref<boolean>(false)
const homeStore = useHomeStore()
watch(
  () => loginDialog.value,
  (value) => {
    if (!value) {
      loginForm.value = {
        customer_account: '',
        customer_password: ''
      }
    }
  },
  { deep: true }
)
const handlerLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      loginLoading.value = true
      const loginData = cloneDeep(loginForm.value)
      loginData.customer_password = encryptPasswordToMD5(
        loginData.customer_password
      )
      delayRequest(
        () => {
          customerLogin(loginData).then(({ data }) => {
            homeStore.is_login = true
            homeStore.login_info = cloneDeep(data.data)
            loginLoading.value = false
            loginDialog.value = false
          })
        },
        5,
        500
      )
    }
  })
}

/* 详情/预约相关 */
const isDialog = ref<boolean>(false)
const dialogFormRef = ref<FormInstance>()
const dialogForm = ref<RoomEntity>({})
const dialogTitle = ref<string>('')
const dialogOperate = ref<string>('')
const openDialog = (operate: string, row?: RoomEntity) => {
  if (operate === 'detail') {
    dialogTitle.value = '房间详情'
    if (row) dialogForm.value = cloneDeep(row)
  }
  isDialog.value = true
  dialogOperate.value = operate
}
const handlerOperate = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (dialogOperate.value === 'detail') {
        alert('处理预约')
      }
    }
  })
}
</script>

<template>
  <div class="home-box">
    <el-affix>
      <div class="header">
        <div :style="{ display: 'flex', alignItems: 'center' }">
          <el-link href="/home" :underline="false">
            <el-image
              :src="logo"
              fit="contain"
              :style="{ width: '120px', height: '50px', marginRight: '20px' }"
            />
          </el-link>
          <span :style="{ color: '#b7b6b7' }">客服热线：</span>
          <span
            :style="{
              color: '#c69e0b',
              fontWeight: 'bold',
              marginRight: '10px'
            }"
          >
            400-820-8888
          </span>
        </div>
        <div>
          <span v-show="homeStore.is_login" :style="{ marginRight: '10px' }">
            你好，
            <el-link :underline="false" type="success">
              {{ homeStore.login_info.customer_name }}
            </el-link>
          </span>
          <el-button
            v-if="!homeStore.is_login"
            type="success"
            @click="loginDialog = true"
          >
            登录
          </el-button>
          <el-button v-else type="primary" @click="homeStore.logout">
            退出
          </el-button>
          <el-button
            v-show="!homeStore.is_login"
            type="primary"
            @click="insertDialog = true"
          >
            注册
          </el-button>
        </div>
      </div>
    </el-affix>
    <el-carousel :interval="interval + 1000" arrow="always" height="300px">
      <el-carousel-item v-for="carousel in carousels" :key="carousel">
        <el-image :src="carousel" :style="{ height: '100%', width: '100%' }" />
      </el-carousel-item>
    </el-carousel>
    <el-row justify="center">
      <el-col :span="20" class="banner-box">
        <el-card body-style="padding: 0" class="banner-card">
          <span :style="{ color: '#57a3e5', fontSize: '18px' }">房间信息</span>
        </el-card>
      </el-col>
    </el-row>
    <el-row justify="center">
      <el-col :span="4" :style="{ paddingRight: '20px' }">
        <el-card body-style="padding: 0" shadow="always">
          <el-menu
            default-active="0"
            :style="{ width: '100%', height: '100%' }"
          >
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
              <el-image
                class="image-box"
                :src="randomImage(images)"
                @click="openDialog('detail', item)"
              />
              <div :style="{ padding: '5px 10px 5px 10px', fontSize: '14px' }">
                <div class="room-detail">
                  <span :style="{ color: '#7a8b9a' }">
                    {{ item.room_name }}
                  </span>
                  <span :style="{ fontSize: '12px', color: 'red' }">
                    ￥{{ item.room_price }}
                  </span>
                </div>
                <div class="room-detail-button">
                  <el-button
                    type="primary"
                    size="small"
                    @click="openDialog('detail', item)"
                  >
                    立即预约
                  </el-button>
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
  <el-backtop :right="50" :bottom="50" />

  <!--detail dialog-->
  <el-dialog
    v-model="isDialog"
    :title="dialogTitle"
    width="30%"
    destroy-on-close
    :show-close="false"
  >
    <el-form ref="dialogFormRef" :model="dialogForm" label-width="50">
      <el-form-item label="名称:">
        <span>{{ dialogForm.room_name }}</span>
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="类型:">
            <span>{{ dialogForm.type?.room_type_name }}</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态:">
            <el-tag
              :type="dialogForm.is_status ? 'success' : 'warning'"
              disable-transitions
              effect="dark"
              size="small"
            >
              {{ dialogForm.is_status ? '可用' : '维修中' }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="床位:">
            <span>{{ dialogForm.room_bed }}个</span>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="人数:">
            <span>{{ dialogForm.room_count }}人 / 间</span>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="详情:">
        <span>{{ dialogForm.room_detail }}</span>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" text @click="isDialog = false">取消</el-button>
      <el-button type="primary" @click="handlerOperate(dialogFormRef)">
        立即预约
      </el-button>
    </template>
  </el-dialog>

  <!--login dialog-->
  <el-dialog
    v-model="loginDialog"
    v-loading="loginLoading"
    title="用户登录"
    width="30%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-form ref="loginFormRef" :model="loginForm" label-width="50">
      <el-form-item
        label="账号"
        prop="customer_account"
        :rules="{ required: true, message: '账号不能为空', trigger: 'blur' }"
      >
        <el-input
          v-model="loginForm.customer_account"
          placeholder="用户名/手机/身份证号"
          prefix-icon="user"
        />
      </el-form-item>
      <el-form-item
        label="密码"
        prop="customer_password"
        :rules="{ required: true, message: '密码不能为空', trigger: 'blur' }"
      >
        <el-input
          v-model="loginForm.customer_password"
          show-password
          placeholder="密码"
          prefix-icon="lock"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" @click="loginDialog = false">取消</el-button>
      <el-button type="primary" @click="handlerLogin(loginFormRef)">
        登录
      </el-button>
    </template>
  </el-dialog>

  <!--insert dialog-->
  <el-dialog
    v-model="insertDialog"
    title="用户注册"
    width="30%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-form
      ref="insertFormRef"
      v-loading="insertLoading"
      :model="insertForm"
      label-width="50"
    >
      <el-form-item
        label="姓名"
        prop="customer_name"
        :rules="{ required: true, message: '姓名不能为空', trigger: 'blur' }"
      >
        <el-input v-model="insertForm.customer_name" placeholder="您的姓名" />
      </el-form-item>
      <el-form-item
        label="账号"
        prop="customer_account"
        :rules="{ required: true, message: '账号不能为空', trigger: 'blur' }"
      >
        <el-input
          v-model="insertForm.customer_account"
          placeholder="用户名/手机/身份证号"
        />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="insertForm.customer_password"
          show-password
          placeholder="默认：123456"
        />
      </el-form-item>
      <el-form-item label="备注">
        <el-input
          v-model="insertForm.description"
          type="textarea"
          resize="none"
          :rows="3"
          placeholder="默认：无"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" text @click="insertDialog = false">
        取消
      </el-button>
      <el-button type="primary" @click="handlerInsert(insertFormRef)">
        注册
      </el-button>
    </template>
  </el-dialog>
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
