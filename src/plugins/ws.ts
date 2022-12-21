import { useTaskStore } from './../stores/task';
import { SimpleObject } from "@/stores/interface";
import { Task } from "@/stores/task";
import { getBearerToken } from "./Cookies";


export type WSMessage = {
    entity: WSMessageEntity 
    action: WSMessageAction
    data: SimpleObject    
}
export enum WSMessageEntity  {
    task = 'task'
}
export enum WSMessageAction  {
    create = 'create',
    update = 'update',
    delete = 'delete'
}

const url = "ws://localhost:8080/ws"
const BearerToken = getBearerToken()
console.log('sdes')
let conn = new WebSocket(url) ;

conn.onopen = function () {
    console.log('conn.onopen bearer token', BearerToken)
    conn.send(JSON.stringify({'Bearer': BearerToken}))
}

conn.onmessage = function (evt) {
    try {
        const message = JSON.parse(evt.data)
        WSMessageHandler(message as WSMessage)
    } catch(err){
        console.log('parsing ws message error')
    }
};

const WSMessageHandler = (message: WSMessage) => {
    let store;
    const {entity, action, data} = message
    switch(entity) {
        case WSMessageEntity.task: {
            store = useTaskStore();
            switch(action) {
                case WSMessageAction.update: {
                    store.updateTaskById(data as Task)
                    break;
                }
                case WSMessageAction.create: {
                    store.setNewTask(data as Task)
                    break;
                }
            }
        }
    }
}

export const newConnect = () => {
    if(conn.readyState != conn.OPEN) {
        conn = new WebSocket(url)
        console.log('new ws connect')
    }
}

// const sleep = async (ms:number) => {
//     return new Promise((resolve) => setTimeout(resolve, ms));
// }
// const waitConnect = async () => {
//     for (let i = 0; i < 100; i++) {
//         if (conn?.readyState == conn?.OPEN) return true
//         await sleep(200)
//     }
//     return false
// }

// const connectWS = async(): Promise<boolean> => {
//     return new Promise(async(res,rej)=> {
//         if(conn?.readyState == conn?.OPEN) {
//             res(true)
//         } else {
//             res(await waitConnect())
//         }
//     })
// }

export default conn