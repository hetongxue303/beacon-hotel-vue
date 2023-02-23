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
  OrderEntity,
  RoomEntity,
  TypeEntity
} from '../../types/entity'
import Pagination from '../../components/Pagination/index.vue'
import { delayRequest, randomNumber } from '../../utils/common'
import { getRoomPageHomeList } from '../../api/room'
import { clone, cloneDeep } from 'lodash'
import { getRoomTypeList } from '../../api/room_type'
import { QueryRoom } from '../../types/query'
import { ElMessage, ElNotification, FormInstance } from 'element-plus'
import { useHomeStore } from '../../store/modules/home'
import {
  insertCustomer,
  customerLogin,
  updateCustomer,
  getCustomerByAccount,
  updateCustomerPassword
} from '../../api/customer'
import { encryptPasswordToMD5 } from '../../hook/encrypt'
import { DATE_TIME_FORMAT, DURATION_TIME } from '../../settings'
import { bookingOrder } from '../../api/order'
import moment from 'moment'

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
const query: QueryRoom = reactive({ page: 1, size: 5 })
const total = ref<number>(1000)
const listLoading = ref<boolean>(false)
const roomTypeList = ref<TypeEntity[]>([])
const handleCurrent = (page: number) => (query.page = page)
const handleSize = (size: number) => (query.size = size)
const randomImage = (data: any[]) =>
  data[randomNumber(1, data.length) as number]

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
            ElMessage.success({
              message: `欢迎回来，${homeStore.login_info?.customer_name}`,
              duration: DURATION_TIME
            })
          })
        },
        5,
        100
      )
    }
  })
}

/* 详情相关 */
const isDialog = ref<boolean>(false)
const dialogForm = ref<RoomEntity>({})
const openDialog = (operate: string, row?: RoomEntity) => {
  if (row && row.is_state === '1') {
    ElMessage.warning({ message: '已有人预约', duration: DURATION_TIME })
    return
  }
  if (row && row.is_state === '2') {
    ElMessage.info({ message: '已有人入住', duration: DURATION_TIME })
    return
  }
  if (operate === 'detail' && row) dialogForm.value = cloneDeep(row)
  isDialog.value = true
}

/* 预约相关 */
const dateValue = ref<Date[]>([])
const dateNum = ref<number>(0)
const dateFlag = ref<boolean>(false)
const reservationDialog = ref<boolean>(false)
const reservationForm = ref<OrderEntity>({ count_num: 1 })
const reservationFormRef = ref<FormInstance>()
watch(
  () => dateValue.value,
  (value) => {
    if (value.length > 0) {
      const current = new Date()
      dateFlag.value = false
      dateNum.value =
        dateValue.value[1].getDate() - dateValue.value[0].getDate()
      if (current.getDate() > dateValue.value[0].getDate()) {
        ElMessage.warning({
          message: '入住时间应大于当前时间！',
          duration: DURATION_TIME
        })
        return
      }
      if (current.getDate() + 7 < dateValue.value[1].getDate()) {
        ElMessage.warning({
          message: '离开时间应在七天内！',
          duration: DURATION_TIME
        })
        return
      }
      // eslint-disable-next-line prefer-destructuring
      reservationForm.value.start_date_time = dateValue.value[0]
      // eslint-disable-next-line prefer-destructuring
      reservationForm.value.leave_date_time = dateValue.value[1]
      dateFlag.value = true
    }
  },
  { deep: true }
)
watch(
  () => reservationDialog.value,
  (value) => {
    if (!value) {
      reservationForm.value = { count_num: 1 }
      dateNum.value = 0
      dateFlag.value = false
      dateValue.value = []
    }
  },
  { deep: true }
)
const openReservationDialog = (row: RoomEntity) => {
  if (!homeStore.is_login) {
    ElNotification.warning({
      message: '您还未登录,请先登录！',
      duration: DURATION_TIME
    })
    loginDialog.value = true
    return
  }
  reservationForm.value.room = row
  reservationForm.value.room_id = row.room_id
  reservationDialog.value = true
}
const handlerReservation = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      if (dateFlag.value) {
        bookingOrder(reservationForm.value).then(({ data }) => {
          if (data.code === 200) {
            ElNotification.success({
              message: '预约成功',
              duration: DURATION_TIME
            })
            reservationDialog.value = false
            getRoomList()
            return
          }
          ElNotification.error({
            message: '预约失败',
            duration: DURATION_TIME
          })
        })
      } else {
        ElMessage.warning({
          message: '时间范围不正确，请从新选择！',
          duration: DURATION_TIME
        })
      }
    }
  })
}

const userDetailDialog = ref<boolean>(false)
const loginInfoForm = ref<CustomerEntity>({})
const isButton = ref<boolean>(false)
const userDetailRef = ref<FormInstance>()
const openUserDetail = () => {
  loginInfoForm.value = cloneDeep(homeStore.login_info)
  userDetailDialog.value = true
}
watch(
  () => userDetailDialog.value,
  (value) => {
    if (!value) {
      loginInfoForm.value = {}
      isButton.value = false
    }
  },
  { deep: true }
)
const handlerUpdateUserDetail = async (formEl: FormInstance | undefined) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      const temp: CustomerEntity = cloneDeep(loginInfoForm.value)
      updateCustomer(temp).then(({ data }) => {
        if (data.code === 200) {
          ElNotification.success({
            message: '修改成功',
            duration: DURATION_TIME
          })
          getCustomerByAccount(temp.customer_account as string)
            .then(({ data }) => {
              if (data.code === 200) homeStore.login_info = data.data
            })
            .finally(() => (loginInfoForm.value = homeStore.login_info))

          isButton.value = false
          return
        }
        ElNotification.error({
          message: '修改失败，请重试！',
          duration: DURATION_TIME
        })
      })
    }
  })
}
const passwordDialog = ref<boolean>(false)
const updatePwRef = ref<FormInstance>()
const openPasswordDialog = () => {
  passwordDialog.value = true
}

interface update_pw {
  account?: string
  old_pw?: string
  new_pw?: string
  confirm_pw?: string
}

const updatePwForm = ref<update_pw>({})
const handlerUpdatePassword = async (formEl?: FormInstance) => {
  if (!formEl) return
  await formEl.validate((valid) => {
    if (valid) {
      const temp: update_pw = cloneDeep(updatePwForm.value)
      if (temp.new_pw !== temp.confirm_pw) {
        ElMessage.warning({ message: '密码不一致', duration: DURATION_TIME })
        return
      }
      temp.account = homeStore.login_info.customer_account
      temp.new_pw = encryptPasswordToMD5(temp.new_pw as string)
      temp.old_pw = encryptPasswordToMD5(temp.old_pw as string)
      temp.confirm_pw = undefined
      updateCustomerPassword(temp).then(({ data }) => {
        if (data.code === 200) {
          ElNotification.success({
            message: '修改成功，请重新登录',
            duration: DURATION_TIME
          })
          passwordDialog.value = false
          homeStore.logout('1')
          return
        }
        ElNotification.error({
          message: data.message ? data.message : '修改失败，请重试！',
          duration: DURATION_TIME
        })
      })
    }
  })
}
</script>

<template>
  <el-dialog
    v-model="passwordDialog"
    width="30%"
    title="修改密码"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-form ref="updatePwRef" :model="updatePwForm" label-width="80">
      <el-form-item
        prop="old_pw"
        label="原密码"
        :rules="{
          required: true,
          message: '原密码不能为空',
          trigger: 'blur'
        }"
      >
        <el-input
          v-model="updatePwForm.old_pw"
          show-password
          placeholder="旧密码"
        />
      </el-form-item>
      <el-form-item
        label="新密码"
        prop="new_pw"
        :rules="{
          required: true,
          message: '新密码不能为空',
          trigger: 'blur'
        }"
      >
        <el-input
          v-model="updatePwForm.new_pw"
          show-password
          placeholder="新密码"
        />
      </el-form-item>
      <el-form-item
        label="确认密码"
        prop="confirm_pw"
        :rules="{
          required: true,
          message: '密码不能为空',
          trigger: 'blur'
        }"
      >
        <el-input
          v-model="updatePwForm.confirm_pw"
          show-password
          placeholder="确认密码"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" text @click="passwordDialog = false">
        返回
      </el-button>
      <el-button type="primary" @click="handlerUpdatePassword(updatePwRef)">
        确认
      </el-button>
    </template>
  </el-dialog>
  <el-dialog
    v-model="userDetailDialog"
    title="个人信息"
    width="30%"
    :show-close="false"
    :close-on-click-modal="false"
    destroy-on-close
  >
    <el-form ref="userDetailRef" :model="loginInfoForm" label-width="80">
      <el-row>
        <el-col :span="24">
          <el-form-item label="登录账号">
            <span style="font-size: 13px; color: #7a8b9a">
              {{ loginInfoForm.customer_account }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="账号状态">
            <el-tag
              size="small"
              :type="loginInfoForm.is_status ? 'success' : 'warning'"
            >
              {{ loginInfoForm.is_status ? '正常' : '禁用' }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item v-if="!isButton" label="您的姓名">
            <span style="font-size: 13px; color: #7a8b9a">
              {{ loginInfoForm.customer_name }}
            </span>
          </el-form-item>
          <el-form-item
            v-else
            prop="customer_name"
            label="您的姓名"
            :rules="{
              required: true,
              message: '姓名不能为空',
              trigger: 'blur'
            }"
          >
            <el-input
              v-model="loginInfoForm.customer_name"
              placeholder="姓名"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item v-if="!isButton" label="身份证号">
            <span style="font-size: 13px; color: #7a8b9a">
              {{ loginInfoForm.id_card }}
            </span>
          </el-form-item>
          <el-form-item
            v-else
            prop="id_card"
            label="身份证号"
            :rules="{
              required: true,
              message: '身份证号不正确',
              trigger: 'blur',
              len: 18
            }"
          >
            <el-input v-model="loginInfoForm.id_card" placeholder="身份证号" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item v-if="!isButton" label="手机电话">
            <span style="font-size: 13px; color: #7a8b9a">
              {{ loginInfoForm.telephone }}
            </span>
          </el-form-item>
          <el-form-item
            v-else
            prop="telephone"
            label="手机电话"
            :rules="{
              required: true,
              message: '电话不正确',
              trigger: 'blur',
              min: 6,
              max: 11
            }"
          >
            <el-input v-model="loginInfoForm.telephone" placeholder="电话" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item v-if="!isButton" label="个人介绍">
            <span style="font-size: 13px; color: #7a8b9a">{{
              loginInfoForm.description
            }}</span>
          </el-form-item>
          <el-form-item v-else label="个人介绍">
            <el-input
              v-model="loginInfoForm.description"
              placeholder="个人介绍"
              type="textarea"
              resize="none"
              :rows="3"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="注册时间">
            <span style="font-size: 13px; color: #7a8b9a">
              {{ moment(loginInfoForm.create_time).format(DATE_TIME_FORMAT) }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="最后登录">
            <span style="font-size: 13px; color: #7a8b9a">
              {{ moment(loginInfoForm.update_time).format(DATE_TIME_FORMAT) }}
            </span>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <el-button
        type="danger"
        text
        @click="!isButton ? (userDetailDialog = false) : (isButton = !isButton)"
      >
        {{ !isButton ? '返回' : '上一页' }}
      </el-button>
      <el-button v-if="!isButton" type="primary" @click="isButton = true">
        修改
      </el-button>
      <el-button
        v-else
        type="success"
        @click="handlerUpdateUserDetail(userDetailRef)"
      >
        确认
      </el-button>
    </template>
  </el-dialog>
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
          <span v-show="homeStore.is_login" :style="{ marginRight: '20px' }">
            你好，
            <el-link :underline="false" type="success" @click="openUserDetail">
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
          <el-button
            v-if="homeStore.is_login"
            type="primary"
            @click="openPasswordDialog"
          >
            修改密码
          </el-button>
          <el-button
            v-if="homeStore.is_login"
            type="primary"
            @click="homeStore.logout"
          >
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
                    v-if="item.is_state === '0'"
                    type="primary"
                    size="small"
                    @click="openReservationDialog(item)"
                  >
                    立即预约
                  </el-button>
                  <el-button
                    v-if="item.is_state === '1'"
                    type="warning"
                    size="small"
                    disabled
                  >
                    已有人预约
                  </el-button>
                  <el-button
                    v-if="item.is_state === '2'"
                    type="info"
                    size="small"
                    disabled
                  >
                    已有人入住
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
    title="房间详情"
    width="30%"
    destroy-on-close
    :show-close="false"
  >
    <el-form :model="dialogForm" label-width="50">
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
      <div class="detail-footer">
        <el-button type="danger" @click="isDialog = false">关闭</el-button>
      </div>
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

  <!--reservation dialog-->
  <el-dialog
    v-model="reservationDialog"
    v-loading="loginLoading"
    title="房间预约"
    width="35%"
    destroy-on-close
    :show-close="false"
    :close-on-click-modal="false"
  >
    <el-form ref="reservationFormRef" :model="reservationForm" label-width="80">
      <el-form-item label="您的姓名">
        <span :style="{ color: '#7a8b9a', fontSize: '13px' }">
          {{ homeStore.login_info.customer_name }}
        </span>
      </el-form-item>
      <el-form-item label="您的账号">
        <span :style="{ color: '#7a8b9a', fontSize: '13px' }">
          {{ homeStore.login_info.customer_account }}
        </span>
      </el-form-item>
      <el-form-item label="房间名称">
        <span :style="{ color: '#7a8b9a', fontSize: '13px' }">
          {{ reservationForm.room?.room_name }}
        </span>
      </el-form-item>
      <el-form-item label="房间价格">
        <span :style="{ color: 'red', fontSize: '13px' }">
          ￥{{ reservationForm.room?.room_price }}
        </span>
      </el-form-item>
      <el-form-item
        label="同行人数"
        prop="count_num"
        :rules="{ required: true, message: '人数不能为空', trigger: 'blur' }"
      >
        <el-input-number
          v-model="reservationForm.count_num"
          :style="{ width: '30%' }"
        />
      </el-form-item>
      <el-form-item label="时间范围">
        <el-date-picker
          v-model="dateValue"
          type="datetimerange"
          range-separator="到"
          start-placeholder="入住时间"
          end-placeholder="离开时间"
          :default-time="[
            new Date(2023, 1, 1, 9, 0, 0),
            new Date(2023, 1, 2, 9, 0, 0)
          ]"
        />
      </el-form-item>
      <el-form-item label="入住天数"> {{ dateNum }}天</el-form-item>
      <el-form-item label="备注信息">
        <el-input
          v-model="reservationForm.description"
          type="textarea"
          resize="none"
          :rows="3"
          placeholder="默认：无"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="danger" @click="reservationDialog = false">
        取消
      </el-button>
      <el-button type="primary" @click="handlerReservation(reservationFormRef)">
        确定
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
      label-width="80"
    >
      <el-form-item
        label="姓名"
        prop="customer_name"
        :rules="{ required: true, message: '姓名不能为空', trigger: 'blur' }"
      >
        <el-input v-model="insertForm.customer_name" placeholder="您的姓名" />
      </el-form-item>
      <el-form-item
        label="用户名"
        prop="customer_account"
        :rules="{ required: true, message: '账号不能为空', trigger: 'blur' }"
      >
        <el-input v-model="insertForm.customer_account" placeholder="账号" />
      </el-form-item>
      <el-form-item
        label="身份证号"
        prop="id_card"
        :rules="{
          required: true,
          message: '身份证号有误',
          trigger: 'blur',
          max: 18,
          min: 18
        }"
      >
        <el-input v-model="insertForm.id_card" placeholder="身份证号" />
      </el-form-item>
      <el-form-item
        label="您的电话"
        prop="telephone"
        :rules="{
          required: true,
          message: '手机电话有误',
          trigger: 'blur',
          max: 11,
          min: 6
        }"
      >
        <el-input v-model="insertForm.telephone" placeholder="手机电话" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input
          v-model="insertForm.customer_password"
          show-password
          placeholder="默认：123456"
          maxlength="100"
          minlength="6"
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

.detail-footer {
  @include default-display;
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
:deep(.el-menu-item.is-active) {
  background-color: rgb(236, 244, 254);
}
</style>
