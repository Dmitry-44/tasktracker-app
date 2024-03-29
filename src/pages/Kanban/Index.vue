<script setup lang="ts">
import { Plus, Top, Bottom } from "@element-plus/icons-vue";
import TaskCard from "@/components/TaskCard.vue";
import { useTaskStore, type Task } from "@/stores/task";
import { useInterfaceStore, type FilterPayload, } from "@/stores/interface";
import DetailsWindow from "@/components/DetailsWindow.vue";
import { ref, computed, onBeforeUnmount, onMounted } from "vue";
import Filters from "@/components/Filters.vue";


const taskStore = useTaskStore()
const interfaceStore = useInterfaceStore()
const $filters = ref<typeof Filters|null>(null)
const abortController = new AbortController();
const abortSignal = abortController.signal


//GETTERS
let tasks = computed(()=>taskStore.getList)
let activeTask = computed(()=>taskStore.getActiveTask) 

type withPriority={
    priority?: number
}
const topPriority = <U extends withPriority>(a: U, b: U) => a.priority! - b.priority!

let tasksToTake = computed(()=>tasks.value.filter(task=>task.status!<=2).sort(topPriority))
let tasksInProcess = computed(()=>tasks.value.filter(task=>task.status===3).sort(topPriority))
let tasksFinished = computed(()=>tasks.value.filter(task=>task.status===4).sort(topPriority))

//ACTIONS
const setActiveTask = taskStore.setActiveTask
const toggleDetailsWindow = interfaceStore.toggleDetailsWindow
const toggleCreatingTaskProcess = interfaceStore.toggleCreatingTaskProcess
const fetchTasksList = async(payload: FilterPayload) => taskStore.fetchTasksList(payload, abortSignal)
const save = (task: Task) => taskStore.updateTask(task)

const LOADING = ref(false)

let filter = ref<FilterPayload>(
    {
        filter: {
            pipe_id: null,
            priority: [],
        },
        options: {
            onlyLimit: false,
            itemsPerPage: 40
        },
        select: []
    }
)

//METHODS
const addTask = () => {
    setActiveTask(null)
    toggleCreatingTaskProcess(true)
    toggleDetailsWindow(true)
}
const taskClickHandler = (task: Task) => {
    toggleCreatingTaskProcess(false)
    setActiveTask(task)
    toggleDetailsWindow(true)
}
const clickOutsideCards = () => {
    $filters?.value?.closeFilters()
    toggleDetailsWindow(false)
    setActiveTask(null)
    toggleCreatingTaskProcess(false)
}
const filterUpdate = async(payload: FilterPayload) => {
    LOADING.value=true
    console.log('payload', payload)
    await fetchTasksList(payload).finally(()=>LOADING.value=false)
    
}

//HOOKS
onMounted(()=> {
    console.log('index mounted')
    fetchTasksList()
    // sendMessage()
})
onBeforeUnmount(() => abortController.abort());


//DRAG AND DROP
const transferTask = ref<Task|null>(null)
const taskInProcessArea = ref<any|HTMLDivElement>(null)
const tasksToTakeArea = ref<any|HTMLDivElement>(null)
const areaParams = new Map([
    [1,{areaRef: tasksToTakeArea, status:2}],
    [2,{areaRef: taskInProcessArea, status:3}]
])
const stopAll = (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
};
const dragstartHandler= (ev: DragEvent, task: Task) => {
    transferTask.value = task
    ev.dataTransfer!.effectAllowed = "link";
}
const dragoverHandler = (ev: DragEvent, areaId: number) => {
    stopAll(ev)
    ev.dataTransfer!.effectAllowed = "link"
    const area = areaParams.get(areaId)
    if(!!transferTask.value && transferTask!.value?.status === area!.status)return false
    if(transferTask!.value?.status === 1 && area!.status === 2)return false
    area?.areaRef.value.classList.add('dragOver')
}
const dragleaveHandler = (ev: DragEvent) => {
    stopAll(ev)
    tasksToTakeArea.value.classList.remove('dragOver')
    taskInProcessArea.value.classList.remove('dragOver')
}
const dropHandler = (ev: DragEvent, area: number) => {
    ev.dataTransfer!.dropEffect = "link";
    tasks.value.map(task=>{if(task.id===transferTask?.value?.id) {
        task.status=areaParams.get(area)?.status || 2;
    }})

    tasksToTakeArea.value.classList.remove('dragOver')
    taskInProcessArea.value.classList.remove('dragOver')
}

</script>
<template>
    <div class="kanbar-wrapper">
        <div class="menu-top">
            <!-- <div class="filters-wrapper">
                <Filters 
                @update="filterUpdate($event)"
                ref="$filters"
                />
            </div> -->
        </div>
        <div class="kanban-background" @click.stop="clickOutsideCards()">
            <DetailsWindow />
            <div class="kanban-column" 
            @dragover="dragoverHandler($event, 1)" 
            @dragleave="dragleaveHandler($event)" 
            @drop="dropHandler($event,1)"
            ref="tasksToTakeArea" 
            >
                <div class="title">
                    <h3>К исполнению</h3>
                    <el-dropdown>
                        <span class="el-dropdown-link">Фильтр<el-icon class="el-icon--right"><arrow-down /></el-icon>
                        </span>
                        <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item :icon="Top">Приоритет</el-dropdown-item>
                            <el-dropdown-item :icon="Bottom">Приоритет</el-dropdown-item>
                            <el-dropdown-item :icon="Top">Статус</el-dropdown-item>
                            <el-dropdown-item :icon="Bottom">Статус</el-dropdown-item>
                        </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                    <el-tooltip class="item" effect="dark" content="Добавить задачу" placement="top-start">
                        <el-button size="small" :icon="Plus" @click.stop="addTask()" />
                    </el-tooltip>
                </div>
                <div class="content">
                    <el-skeleton
                        style="width: 300px"
                        :loading="LOADING"
                        animated
                        :throttle="500"
                        >
                        <template #template>
                            <el-skeleton-item variant="rect" style="width: 300px; height: calc(100vh - 210px)" />
                        </template>
                        <template v-for="task in tasksToTake" :key="task.id">
                            <TaskCard 
                            draggable="true"
                            :task="task" 
                            :active="task.id===activeTask?.id?true:false" 
                            @click.stop="taskClickHandler(task)"
                            @dragstart="dragstartHandler($event, task)"
                            />
                        </template>
                        <el-button @click.stop="addTask()" class="column-button-footer" :icon="Plus">
                            Добавить задачу
                        </el-button>
                    </el-skeleton>
                </div>
            </div>
            <div class="kanban-column" 
            @dragover="dragoverHandler($event,2)" 
            @dragleave="dragleaveHandler($event)" 
            @drop="dropHandler($event,2)"
            ref="taskInProcessArea" 
            >
                <div class="title">
                    <h3>В работе</h3>
                </div>
                <div class="content">
                    <el-skeleton
                    style="width: 300px"
                    :loading="LOADING"
                    animated
                    :throttle="500"
                    >
                    <template #template>
                        <el-skeleton-item variant="rect" style="width: 300px; height: calc(100vh - 210px)" />
                    </template>
                    <template v-for="task in tasksInProcess" :key="task.id">
                        <TaskCard 
                        draggable="true"
                        :task="task" 
                        :active="task.id===activeTask?.id?true:false"
                        @click.stop="taskClickHandler(task)"
                        @dragstart="dragstartHandler($event, task)" 
                        />
                    </template>
                    </el-skeleton>
                </div>
            </div>
            <div class="kanban-column">
                <div class="title">
                    <h3>Архив</h3>
                </div>
                <div class="content">
                    <el-skeleton
                    style="width: 300px"
                    :loading="LOADING"
                    animated
                    :throttle="500"
                    >
                    <template #template>
                        <el-skeleton-item variant="rect" style="width: 300px; height: calc(100vh - 210px)" />
                    </template>
                    <template v-for="task in tasksFinished" :key="task.id">
                        <TaskCard 
                        :task="task" 
                        :active="task.id===activeTask?.id?true:false"
                        @click.stop="taskClickHandler(task)"
                        />
                    </template>
                    </el-skeleton>
                </div>
            </div>
        </div>
    </div>
</template>


<style lang="sass" scoped>
.kanbar-wrapper
    display: flex
    flex-direction: column
    height: 100%
.kanban-background
    background:#f9f8f8
    width: 100%
    height: calc(100% - 70px)
    padding: 15px 50px 0px 50px
    display: flex
    flex-direction: row
    position: relative
    &>div
        flex: 0 0 auto

.menu-top
    flex: 0 0 50px
    height: 50px
    padding: 0px 24px
    display: flex
    background: #fff
    border-bottom: 1px solid #edeae9
.filters-wrapper
    display: flex
    margin-left: auto
.kanban-column
    display: flex
    flex-direction: column
    border-radius: 6px
    position: relative
    flex: 0 0 304px
    width: 310px
    max-height: calc(100% - 10px)
    max-width: 304px
    padding: 0 12px
    border: 2px solid #f9f8f8
    transition: box-shadow, border-color 250ms
    &:hover
        box-shadow: 0 0 0 1px #edeae9
    .title 
        align-items: center
        border-radius: 6px
        // cursor: pointer;
        display: flex
        position: relative
        h3
            font-size: 16px
            line-height: 20px
            // font-weight: 500
            overflow: hidden
            text-overflow: ellipsis
            white-space: nowrap
            margin-right: auto
            display: inline-block
            position: relative
    .content
        max-height: 100%
        overflow-y: auto
        overflow-x: hidden
        padding: 0px 4px
.kanban-column .column-button-footer
    background-color: inherit
    margin: 0 auto
    display: flex
    border: none

.kanban-column.dragOver
    border-color: #67C23A

</style>