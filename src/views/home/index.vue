<script setup lang="ts"></script>

<template>
  <div class="home-box">
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
        <el-button type="success">会员登陆</el-button>
        <el-button type="primary">注册</el-button>
      </div>
    </div>
    <el-carousel :interval="5000" arrow="always" height="600px">
      <el-carousel-item>
        <el-image style="height: 100%; width: 100%" />
      </el-carousel-item>
      <el-carousel-item>
        <el-image style="height: 100%; width: 100%" />
      </el-carousel-item>
      <el-carousel-item>
        <el-image style="height: 100%; width: 100%" />
      </el-carousel-item>
      <el-carousel-item>
        <el-image style="height: 100%; width: 100%" />
      </el-carousel-item>
    </el-carousel>
    <div style="display: flex; justify-content: center; align-items: center">
      <div class="image-box"></div>
      <div class="image-box"></div>
      <div class="image-box"></div>
      <div class="image-box"></div>
    </div>
  </div>
  <div class="footer">底部文字</div>
</template>

<style scoped lang="scss">
.home-box {
  width: 100%;
  height: 1500px;
  background-color: darksalmon;

  .header {
    background-color: white;
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 50px 0 50px;
  }
}

.image-box {
  background-color: #7a8b9a;
  width: 300px;
  height: 400px;
  margin-right: 30px;
  margin-top: 10px;
  transition: linear, all, 0.3s;

  &:nth-child(4) {
    margin-right: 0;
  }

  &:hover {
    transform: scale(1.05);
  }
}
.footer {
  position: absolute;
  height: 60px;
  width: 100%;
  background-color: green;
  top: 1500-60px;
}
</style>
