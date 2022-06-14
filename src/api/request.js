/**
 * 登陆
 */
import Vue from "vue";

const BASE_URL = "http://localhost:8005"

export const creat = data => {
    return Vue.axios.post(BASE_URL+'/note/creat', data)
}

export const modify = data => {
    return Vue.axios.post(BASE_URL+'/note/modify', data)
}
export const saveNote = data => {
    return Vue.axios.post(BASE_URL+'/note/saveNote', data)
}
export const deleteNote = data => {
    return Vue.axios.get(BASE_URL+'/note/delete', {
        params:data
    })
}
export const queryDirectory =()=> {
    return  Vue.axios.get(BASE_URL+'/note/queryDirectory')
}

export const getNote = data => {
    return Vue.axios.get(BASE_URL+'/note/getNote', {
        params:data
    })
}
