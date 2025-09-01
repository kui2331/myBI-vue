import myAxios from "../request.ts";
import {reactive} from "vue";

/**
 * 添加图表
 * @param params
 * @param file
 */
export const addChart = async (params: any, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return myAxios.request({
        url: "/api/chart/gen",
        method: 'POST',
        params: params,
        data: formData,
    });
};

/**
 * 获取图表列表
 * @param params
 */
export const listMyChart = async (params : any) => {
    return myAxios.request({
        url: "/api/chart/my/list/page",
        method: 'POST',
        data: params,
        headers: {
            "Content-Type": "application/json",
        },
    });
}

/**
 * 删除图表
 * @param id
 */
export const deleteChart = async (id: number) => {
    const params=reactive({id:0})
    params.id = id;
    return myAxios.request({
        url: "/api/chart/delete/",
        method: 'POST',
        data: params
    });
}