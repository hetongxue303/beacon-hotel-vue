<script setup lang="ts">
const inn = ['1', '2', '3']
</script>

<template>
  <div v-for="i in inn" :key="i">
    <div v-if="i !== '1'">{{ i }}</div>
  </div>
</template>

<style scoped lang="scss"></style>
