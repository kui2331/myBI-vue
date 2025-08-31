import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import Antd from "ant-design-vue";
import "ant-design-vue/dist/reset.css";
import { createPinia } from "pinia";
import ECharts from 'vue-echarts' // vue-echarts
import { use } from 'echarts/core' // echarts 核心
import { CanvasRenderer } from 'echarts/renderers'// 渲染器
import {BarChart, LineChart, PieChart, RadarChart} from 'echarts/charts' // 图表
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent
} from 'echarts/components' // echarts 组件

// 按需注册
use([
    CanvasRenderer,
    BarChart,
    LineChart,
    PieChart,
    RadarChart,
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent
]);

const pinia = createPinia();
createApp(App).use(pinia).use(Antd).use(router).component('v-chart', ECharts).mount("#app");

