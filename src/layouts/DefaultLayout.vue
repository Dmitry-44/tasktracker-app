<script setup lang="ts">
import { ref, computed, onBeforeMount } from "vue";
import { RouterView, useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import Menu from "../components/MenuAside.vue";
import { useInterfaceStore } from "@/stores/interface";
import router from "@/router";
import { newConnect } from "@/plugins/ws";

const isCollapse = ref(true);
const InterfaceStore = useInterfaceStore()
const UserStore = useUserStore();
let User = computed(()=> UserStore.getUser)
let isAuth = computed(()=> UserStore.getIsAuth) 
let LOADING = computed(()=>InterfaceStore.getLoader)

onBeforeMount(async() => {
  if(!isAuth.value) {
    InterfaceStore.startLoading()
    UserStore.checkAuth()
    .then(isAuth=> {
      console.info('isAuth', isAuth)
      console.log('check auth')
      if(!isAuth) {
        console.log('check auth')
        router.push('/login')
      }
    })
    .finally(() => InterfaceStore.stopLoading())
  }
  newConnect()
});

const logout = () => {
  UserStore.Logout()
  router.push("/login")
}


</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="navbar">
        <el-container class="toolbar first">
          <div
            class="hidden-xs-only"
            style="display: flex; align-items: center"
          >
            <el-button
              class="hidden-sm-and-down"
              type="primary"
              circle
              @click="isCollapse = !isCollapse"
            >
              <el-icon>
                <Expand />
              </el-icon>
            </el-button>
            <!-- <el-image src="/favicon.png" class="ml-2 logo-image" /> -->
            <span class="logo-text">Таск-трекер</span>
          </div>
          <!-- <div class="hidden-md-and-up menu-block-mobile">
            <Menu
              class="menu-element-mobile"
              :is-collapse="isCollapse"
              :is-horizontal="true"
            />
          </div> -->
          <div v-if="isAuth">
            <span class="hidden-xs-only">{{ User?.username }}</span>
            <el-icon
              class="user-block"
              @click="logout()"
              style="margin-left: 8px"
            >
              <SwitchButton />
            </el-icon>
          </div>
        </el-container>
      </el-header>
      <el-container>
        <el-aside v-if="isAuth" class="hidden-sm-and-down">
          <Menu :is-collapse="isCollapse" />
        </el-aside>
        <el-container>
          <div
            class="loader_block"
            v-if="LOADING"
            v-loading="LOADING" 
            >
          </div>
          <el-main v-else class="content">
            <RouterView />
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
