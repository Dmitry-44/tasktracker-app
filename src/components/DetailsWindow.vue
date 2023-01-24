<script setup lang="ts">
import { useTaskStore } from '@/stores/task';
import { useInterfaceStore } from '@/stores/interface';
import { Close } from "@element-plus/icons-vue";
import { computed } from '@vue/reactivity';
import { nextTick, ref, watch } from 'vue';
import { ElMessage } from 'element-plus';

//CONSTANTS
const taskStore = useTaskStore()
const interfaceStore = useInterfaceStore()

//GETTERS
const detailWindowIsOpen = computed(()=>interfaceStore.getDetailWindowIsOpen) 
const task = computed(()=>taskStore.getActiveTask) 
const isReadonlyTask = computed(()=> task.value.status===4)
const isCreatingTaskProcess = computed(()=>interfaceStore.isCreatingTaskProcess)
const taskWasChanged = computed(()=> {
    const updatedData = JSON.parse(JSON.stringify(task.value))
    return oldContent.value != JSON.stringify(updatedData)
})
const PRIORITY_OPTIONS = taskStore.getPriorityOptions
const STATUS_OPTIONS = taskStore.getStatusOptions

//VARIABLES
let LOADING = ref(false)
let oldContent = ref('')
const titleInput = ref<HTMLInputElement|null>(null)

//ACTIONS
const toggleDetailsWindow = interfaceStore.toggleDetailsWindow
const setActiveTask = taskStore.setActiveTask
const toggleCreatingTaskProcess = interfaceStore.toggleCreatingTaskProcess

//METHODS
const saveTask = async() => {
    LOADING.value=true
    const msg = ElMessage({
        message: "Сохраняю задачу..",
        type: "success",
        center: true,
        duration: 1000,
    });
    let res;
    if(task.value.id>0) {
        res = taskStore.updateTask(task.value)
    } else {
        res = taskStore.createTask(task.value)
    }
    res.then(res=>{
        if (res) {
            ElMessage({
                message: "Операция выполнена успешно!",
                type: "success",
                center: true,
                duration: 1500,
                showClose: true,
            });
            oldContent.value=JSON.stringify(task.value)
        } else {
            ElMessage({
                message: "Ошибка при выполнении операции!",
                type: "error",
                center: true,
                duration: 1500,
                showClose: true,
            });
        }
    })
    .finally(()=>{
        LOADING.value=false
        msg.close()
    })
}

const closeButtonHandler = () => {
    toggleDetailsWindow(false)
    setActiveTask(null)
    toggleCreatingTaskProcess(false)
}

//HOOKS
watch(task, (newVal, oldVal)=>{
    if(oldVal.id != newVal.id) {
        oldContent.value=JSON.stringify({...task.value})
        if(isCreatingTaskProcess.value){
            nextTick(()=>{
                titleInput?.value?.focus()
            })
        }
    }
})

</script>
<template>
    <div :class="['details', {active: detailWindowIsOpen}]" @click.stop>
        <div class="header">
            <div class="actions">
                <el-button :loading="LOADING" :disabled="!taskWasChanged" type="success" @click="saveTask">Сохранить</el-button>
                <el-tooltip class="item" effect="dark" content="Закрыть" placement="top-start">
                    <el-button class="close-btn" :icon="Close" @click.stop="closeButtonHandler"></el-button>
                </el-tooltip>
            </div>
        </div>
        <div class="body">
            <div class="title_block">
                <input 
                v-model="task.title"
                :disabled="isReadonlyTask"
                placeholder="Ввести название задачи"
                ref="titleInput"
                >
            </div>
            <div class="content">
                <div class="row">
                    <div class="left">Приоритет</div>
                    <div class="right">
                        <el-select v-model="task.priority" :disabled="isReadonlyTask" clearable placeholder="Приоритет">
                            <el-option
                            v-for="item in PRIORITY_OPTIONS"
                            :key="item.value"
                            :label="item.value"
                            :value="item.id"
                            >
                            <el-tag :color="item.color">{{item.value}}</el-tag>
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="row" v-if="!isCreatingTaskProcess">
                    <div class="left">Статус</div>
                    <div class="right">
                        <el-select v-model="task.status" :disabled="isReadonlyTask" clearable placeholder="Статус">
                            <el-option
                            v-for="item in STATUS_OPTIONS"
                            :key="item.value"
                            :label="item.value"
                            :value="item.id"
                            >
                            <el-tag :color="item.color">{{item.value}}</el-tag>
                            </el-option>
                        </el-select>
                    </div>
                </div>
                <div class="row">
                    <div class="left">Описание</div>
                    <div class="right text">
                        <el-input
                            v-model="task.description"
                            :disabled="isReadonlyTask"
                            clearable
                            :autosize="{ minRows: 2, maxRows: 4 }"
                            type="textarea"
                            placeholder="Описание задачи"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="sass" scoped>
.details
    box-shadow: 0 0 0 1px #edeae9, 0 5px 20px 0 rgba(109, 110, 111, 0.08)
    background-color: #fff
    display: flex
    flex-direction: column
    right: 0
    position: fixed
    top: 60px
    bottom: 0
    width: 0
    z-index: 600
    transition: all .8s cubic-bezier(0.23, 1, 0.32, 1)
    visibility: hidden
    &.active
        width: min(700px, 60%)
        visibility: visible
.details .header
    height: 50px
    padding: 0px 12px
    display: flex
    .actions
        margin-left: auto
        display: flex
        align-items: center
.details .body
    display: flex
    flex-direction: column
    flex: 1 0 auto
    min-height: 1px
    z-index: 0
    background: #fff
    padding: 0 24px
    border-top: 1px solid #edeae9
.title_block input
    z-index: 0
    background-color: #fff
    border-width: 1px
    border-style: solid
    border-color: #fff
    border-radius: 6px
    box-sizing: border-box
    overflow-wrap: break-word
    padding: 6px 12px
    resize: none
    white-space: pre-wrap
    height: auto
    font-size: 20px
    letter-spacing: .8px
    font-weight: 500
    line-height: 32px
    min-height: 0
    width: 100%
    margin: 12px 0px
    margin-left: -12px
    &:hover
        border-color: #cfcbcb

.header .title
    text-transform: uppercase
    text-indent: 10px
    margin: 10px 0px
    color: #303133
.body .content
    display: flex
    flex-direction: column
    gap: 14px
    .row
        display: flex
        align-items: baseline
    .left
        flex: 0 0 120px
        color: #6d6e6f
        font-size: 15px
        line-height: 18px
        overflow: hidden
        text-overflow: ellipsis
        white-space: nowrap
    .right
        flex: 1 1 auto
        overflow-x: clip

.body .content .row .text textarea
    border-color: #fff
.el-select .el-input__wrapper
    box-shadow: none
    &:hover
        box-shadow:  0 0 0 1px #dcdfe6 inset

.el-select .el-input__wrapper
    box-shadow: none !important
.el-tag
    color: #000
    border: none

.el-collapse .row
    margin-bottom: .5rem

</style>