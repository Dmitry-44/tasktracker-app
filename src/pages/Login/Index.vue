<script lang="ts" setup>
import Login from '@/components/forms/Login.vue';
import Register from '@/components/forms/Register.vue';
import { useInterfaceStore } from '@/stores/interface';
import { computed, ref } from 'vue';

enum CurrentForm {
    Login = "Login",
    Register = "Register"
}

let LOADING = computed(()=> useInterfaceStore().getLoader)
let currentForm = ref(CurrentForm.Login)
let cardName = computed(()=> currentForm.value===CurrentForm.Login ? "Войти" : "Регистрация")

let formComponent = computed(()=> currentForm.value===CurrentForm.Login ? Login : Register)

const toRegisterForm = () => {
    currentForm.value=CurrentForm.Register
}
const toLoginForm = () => {
    currentForm.value=CurrentForm.Login
}

</script>

<template>
    <div class="card-container">
        <div
            class="box-card loader_block"
            v-if="LOADING"
            v-loading="LOADING" 
            >
        </div>
        <el-card v-else class="box-card">
            <template #header>
                <div class="card-header">
                    <span>{{cardName}}</span>
                </div>
            </template>
            <Component :is="formComponent" />
            <span v-if="currentForm===CurrentForm.Login" class="subtext">Нет аккаунта? <el-button link type="primary" @click="toRegisterForm()">Зарегистрировать</el-button></span>
            <span v-else class="subtext">Уже есть аккаунт? <el-button link type="primary" @click="toLoginForm()">Войти</el-button></span>
        </el-card>
    </div>

</template>

<style lang="sass">
.card-container
    width: 100%
    height: 100%
    display: flex
    justify-content: center
    align-items: center
.box-card
    flex: 600px 1 1
    max-width: min(600px, 100%)
    margin: 0px 15px
.el-card
    overflow: visible
.el-card__body
    position: relative
.subtext
    position: absolute
    bottom: -30px
    left: 0px
</style>