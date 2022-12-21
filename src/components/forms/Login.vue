<script setup lang="ts">
import { newConnect } from '@/plugins/ws';
import router from '@/router';
import { useInterfaceStore } from '@/stores/interface';
import { useUserStore, type LoginUserDto } from '@/stores/user';
import { Ref, ref } from 'vue';

let user: Ref<LoginUserDto> = ref({
    username: '',
    password: '',
});

const UserStore = useUserStore()
const InterfaceStore = useInterfaceStore()

const submitForm = () => {
    InterfaceStore.startLoading()
    UserStore.Login(user.value)
    .then(res=> {
        if(res) {
            router.push('/')
        }
    })
    .finally(()=> {
        InterfaceStore.stopLoading()
    })
}
const resetForm = () => {
    user.value.username=''
    user.value.password=''
}


</script>
<template>
    <el-form
        :model="user"
        label-width="100px"
        style="max-width: 460px"
    >
        <el-form-item label="Login">
        <el-input v-model="user.username" />
        </el-form-item>
        <el-form-item label="Password" type="password">
        <el-input v-model="user.password" />
        </el-form-item>
        <el-form-item>
        <el-button type="primary" @click="submitForm()">Подтвердить</el-button>   
        <el-button @click="resetForm()">Очистить</el-button>
        </el-form-item>
    </el-form>
</template>