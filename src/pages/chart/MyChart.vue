<template>
  <a-list item-layout="vertical" size="small" :pagination="pagination" :data-source="chartList">
    <template #footer>
      <div>
        <b>智能BI</b>
        分析数据来自AI
      </div>
    </template>
    <template #renderItem="{ item }">
      <a-list-item key="item.id">
        <a-list-item-meta :description="item.chartType">
          <template #title>
            <a>{{ item.name }}</a>
          </template>
          <template #avatar><a-avatar :src="item.avatar" /></template>
        </a-list-item-meta>
        <v-chart class="chart" :option="parseChartOption(item.genChart)" />
        {{ item.genResult }}
      </a-list-item>
    </template>
  </a-list>
</template>

<script setup lang="ts">
const ress= "{\n    \"title\": {\n        \"text\": \"增长情况分析\"\n    },\n    \"radar\": {\n        \"indicator\": [\n            { \"name\": \"整数\", \"max\": 10 },\n            { \"name\": \"字符串\", \"max\": 10 },\n            { \"name\": \"小数\", \"max\": 10 },\n            { \"name\": \"日期\", \"max\": 10 }\n        ]\n    },\n    \"series\": [\n        {\n            \"name\": \"增长情况\",\n            \"type\": \"radar\",\n            \"data\": [\n                {\n                    \"value\": [1, 1, 1.2, 1],\n                    \"name\": \"2022/10/10 0:00\"\n                }\n            ]\n        }\n    ]\n}"
const options = {
  grid: { top: 8, right: 8, bottom: 24, left: 36 },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true,
    },
  ],
  tooltip: {
    trigger: 'axis',
  },
};

function parseChartOption(genChart: string) {
  try {
    console.log(JSON.parse(genChart));
    return JSON.parse(genChart);
  } catch (error) {
    message.error('图表代码解析错误');
    console.error('图表代码解析错误:', genChart, error);
    return {}; // 返回一个空对象或者默认配置
  }
}
import VChart from "vue-echarts";

type Chart = {
  chartData?: string;
  chartType?: string;
  createTime?: string;
  genChart?: string;
  genResult?: string;
  goal?: string;
  id?: number;
  isDelete?: number;
  name?: string;
  updateTime?: string;
  userId?: number;
};


import {onMounted, reactive, ref} from 'vue';
import {listMyChart} from "../../api/chart.ts";
import {message} from 'ant-design-vue';


const searchParams = reactive({
  current: 1,
  name: "",
  pageSize: 4
})
const chartList = ref<Chart[]>([]);
const total = ref(0)


const pagination = reactive({
  onChange: (page: number) => {
    searchParams.current = page;
    loadData();
    console.log(total.value);
  },
  total: total,
  pageSize: 4,
});

const loadData = async () => {
  try {
    const res = await listMyChart(searchParams);

    if (res.data.data) {
      // 如果成功,把图表数据回显到前端;如果为空，传一个空数组
      // 这里返回的是分页，res.data.records拿到数据列表
      chartList.value = res.data.data.records;
      // 数据总数如果为空就返回0
      total.value = res.data.data.total ?? 0;
    } else {
      // 如果后端返回的数据为空，抛出异常，提示'获取我的图表失败'
      message.error('获取我的图表失败');
    }

  } catch (e: any) {
    // 如果出现异常,提示'获取我的图表失败'+错误原因
    message.error('获取我的图表失败,' + e.message);
  }
}

onMounted(() => {
  loadData()
})

</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>