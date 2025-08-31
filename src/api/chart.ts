import myAxios from "../request.ts";

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
    });
}