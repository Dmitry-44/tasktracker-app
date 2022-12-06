import { defineStore } from "pinia";
import { axiosClient } from "../plugins/axios";
import { envConfig } from "../plugins/envConfig";
import { type FilterPayload, type SimpleObject, type ResultWithMessage, useInterfaceStore } from "./interface";


interface Task {
  id: number;
  title: string;
  description: string;
  created_at: number;
  priority?: number;
  status?: number;
  created_by?: number;
}
const taskDefault: ActiveTask = {
  id: -1,
  title: '',
  created_at: -1,
  status: 1,
  description: '',
}
interface ActiveTask extends Task {
  readonly?: boolean
}
type Event = {
  id: number
  task_id?: number
  operation_id?: number
  created: number
  modified: number | null
  finished?: number | null
  u_id?: number | null
  user_name?: string | null
  status: number
  selected_users: number[]
  result?: string | null
  params?: SimpleObject
}
interface TaskOption {
  id: number,
  value: string,
  color: string
}
interface EventStatusOption {
  id: number,
  value: string,
  color: string
}
interface State {
  tasks: Task[]
  singleTask: Task|null
  priorityOptions: TaskOption[]
  statusOptions: TaskOption[]
  eventStatusOptions: EventStatusOption[]
  activeTask: ActiveTask,
  filterBase: FilterPayload,
  filterVersion: string
}

export type { Task, ActiveTask, Event };

export const useTaskStore = defineStore({
  id: "task",
  state: (): State => ({
    priorityOptions: [
      {id:1,value:'Молния',color:'#E6A23C'},
      {id:2,value:'Срочная',color:'#F56C6C'},
      {id:3,value:'Базовая',color:'#409EFF'},
      {id:4,value:'Низкая',color:'#909399'},
    ],
    statusOptions: [
      {id:1,value:'Создана',color:'#f06a6a'},
      {id:2,value:'Обработана',color:'#4ecbc4'},
      {id:3,value:'В работе',color:'#f8df72'},
      {id:4,value:'Закончена',color:'#909399'},
    ],
    eventStatusOptions: [
      {id:1,value:'Создана',color:''},
      {id:2,value:'В работе',color:'#f8df72'},
      {id:3,value:'Готово',color:'#67C23A'},
    ],
    activeTask: {...taskDefault},
    tasks: [],
    singleTask: null,
    filterBase: {
      select: [],
      filter: {},
      options: {
        onlyLimit: false,
        page: 1,
        itemsPerPage: 50,
        sortBy: ['id'],
        sortDesc: [false],
        groupBy: [],
        groupDesc: [false],
        mustSort: false,
        multiSort: false,
      }
    },
    filterVersion: '1.0',
  }),
  getters: {
    getList: (state): Task[] => state.tasks,
    getSingleTask: (state) => state.singleTask,
    getFilterVersion:(state): string => state.filterVersion,
    getPriorityOptions: (state): TaskOption[] => state.priorityOptions,
    getStatusOptions: (state): TaskOption[] => state.statusOptions,
    getActiveTask:(state)=> state.activeTask,
    getEventStatusOptions:(state): EventStatusOption[]=> state.eventStatusOptions
  },
  actions: {
    setActiveTask(task: Task | null): void {
      const interfaceStore = useInterfaceStore()
      if(this.activeTask?.id == task?.id && !interfaceStore.getIsCreatingTaskProcess)return;
      this.activeTask = task || {...taskDefault}
    },
    setTasksList(payload: Task[]): void {
      this.tasks=payload
    },
    setSingleTask(payload: Task[]):void {
      this.singleTask=payload[0]
    },
    setNewTask(payload: Task):void {
      this.tasks.push(payload)
    },
    deleteTaskFromStateById(id: number):void {
      this.tasks=this.tasks.filter(task=>task.id!=id)
    },
    fetchTasksList(filterPayload?: FilterPayload|Partial<FilterPayload>, signal?: AbortSignal): Promise<boolean|string> {
      return axiosClient
        .get(`${envConfig.API_URL}api/v1/tasks/`,{signal})
        .then((resp) => {
          const respdata: ResultWithMessage = resp.data;
          this.setTasksList(respdata.data.tasks);
          if (
            Object.prototype.hasOwnProperty.call(respdata, "status") &&
            respdata.status === "ok"
          ) {
            if(filterPayload?.filter!['id']) {
              this.setSingleTask(respdata.data.tasks[0])
            } else {
              this.setTasksList(respdata.data.tasks);
            }
            return true;
          } else {
            return respdata.errorMessage || false;
          }
        })
        // .catch((e) => errRequestHandler(e));
    },
    createTask(payload: Partial<Task>): Promise<any> {
      return axiosClient
        .post(`${envConfig.API_URL}api/v1/tasks/`, payload)
        .then((resp) => {
          const respdata: ResultWithMessage = resp.data
          if (
            Object.prototype.hasOwnProperty.call(respdata, "status") &&
            respdata.status === "ok"
          ) {
            this.setNewTask(respdata.data as Task)
            return true;
          } else {
            return respdata.errorMessage || false;
          }
        })
        // .catch((e) => errRequestHandler(e));
    },
    updateTask(payload: Partial<Task>): Promise<boolean|string> {
      const url = `${envConfig.API_URL}api/v1/tasks/${payload.id}`
      return axiosClient
        .put(url, payload)
        .then((resp) => {
          const respdata: ResultWithMessage = resp.data
          if (
            Object.prototype.hasOwnProperty.call(respdata, "status") &&
            respdata.status === "ok"
          ) {
            return true;
          } else {
            return respdata.errorMessage || false;
          }
        })
        // .catch((e) => errRequestHandler(e));
    },
    deleteTask(id: number): Promise<boolean|string> {
      const url = `${envConfig.API_URL}api/v1/tasks/${id}`
      return axiosClient
        .delete(url)
        .then((resp) => {
          const respdata: ResultWithMessage = resp.data
          if (
            Object.prototype.hasOwnProperty.call(respdata, "status") &&
            respdata.status === "ok"
          ) {
            this.deleteTaskFromStateById(id)
            return true;
          } else {
            return respdata.errorMessage || false;
          }
        })
        // .catch((e) => errRequestHandler(e));
    },
}
});
