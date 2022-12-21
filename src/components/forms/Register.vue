<script setup lang="ts">
import router from '@/router';
import { useInterfaceStore } from '@/stores/interface';
import { useUserStore, type RegisterUserDto } from '@/stores/user';
import { Ref, ref } from 'vue';

let user: Ref<RegisterUserDto> = ref({
    username: '',
    password: '',
    email: '',
    name: ''
});

const UserStore = useUserStore()
const InterfaceStore = useInterfaceStore()

const submitForm = () => {
    InterfaceStore.startLoading()
    UserStore.Logup(user.value)
    .then(res=> {
        if(res) {
            router.push('/')
        }
    })
    .finally(()=> InterfaceStore.stopLoading())
}

const resetForm = () => {
    user.value.username=''
    user.value.email=''
    user.value.password=''
}


</script>
<template>
    <el-form :model="user" label-width="100px" style="max-width: 460px"> <span>REGISTRATT</span>
        <el-form-item label="Login">
            <el-input v-model="user.username" />
        </el-form-item>
        <el-form-item label="Email">
            <el-input v-model="user.email" />
        </el-form-item>
        <el-form-item label="Password">
            <el-input v-model="user.password" />
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm()">Подтвердить</el-button>
            <el-button @click="resetForm()">Очистить</el-button>
        </el-form-item>
    </el-form>
</template>