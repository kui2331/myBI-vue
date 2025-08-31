<template>
  <a-form
      :model="formState"
      name="validate_other"
      v-bind="formItemLayout"
      @finishFailed="onFinishFailed"
      @finish="onFinish"
  >
    <h2 class="title">添加分析图表</h2>

    <a-form-item
        name="goal"
        label="分析目标"
        :rules="[{ required: true, message: 'Please select your country!' }]">
      <a-textarea v-model:value="formState.goal"/>
    </a-form-item>

    <a-form-item
        name="chartType"
        label="图表类型"
        has-feedback
        :rules="[{ required: true, message: 'Please select your country!' }]"
    >
      <a-select v-model:value="formState.chartType" placeholder="Please select a country">
        <a-select-option value="折线图">折线图</a-select-option>
        <a-select-option value="柱状图">柱状图</a-select-option>
        <a-select-option value="堆叠图">堆叠图</a-select-option>
      </a-select>
    </a-form-item>

    <a-form-item
        name="group"
        label="Group Name"
        :rules="[{ required: false, message: 'Please select your country!' }]"
    >
      <a-textarea v-model:value="formState.name" />
    </a-form-item>

    <a-form-item name="rate" label="Rate">
      <a-rate v-model:value="formState.rate" allow-half/>
    </a-form-item>

    <!-- 文件上传表单项 -->
    <a-form-item name="file" label="Upload" extra="Max: 1 file">
      <a-upload
          v-model:file-list="fileList"
          list-type="picture"
          :max-count="1"
          :before-upload="beforeUpload"
          :custom-request="dummyRequest"
      >
      <a-button>
        <upload-outlined></upload-outlined>
        Select File (Max: 1)
      </a-button>
      </a-upload>
    </a-form-item>

    <a-form-item :wrapper-col="{ span: 12, offset: 6 }">
      <a-button type="primary" html-type="submit" :loading="submitting">Submit</a-button>
      <a-button style="margin-left: 10px" html-type="reset">Reset</a-button>
    </a-form-item>
  </a-form>
  <div>
    分析结论：{{genResult}}
  </div>
  <v-chart class="chart" :option="options" autoresize/>
</template>

<script setup lang="ts">
import {UploadOutlined} from '@ant-design/icons-vue';
import VChart from 'vue-echarts';
import {reactive, ref} from 'vue';
import {addChart} from "../../api/chart.ts";
import {message, type UploadFile} from 'ant-design-vue';
const fileList = ref<UploadFile[]>([]); // 明确类型为 UploadFile 数组
const option = reactive({})
const genResult=ref<String>("");
//示例
// @ts-ignore
// const res2={
//   "code": 0,
//     "data": {
//   "genChart": "{\n    \"xAxis\": {\n        \"type\": \"category\",\n        \"data\": [\"1号\", \"2号\", \"3号\"]\n    },\n    \"yAxis\": {\n        \"type\": \"value\"\n    },\n    \"series\": [\n        {\n            \"data\": [10, 20, 30],\n            \"type\": \"line\"\n        }\n    ]\n}",
//       "genResult": "从1号到3号，用户数呈现出明显的上升趋势。具体来看，1号的用户数为10，2号增加到20，3号进一步增加到30。这表明在这三天内，用户数每天以10的增量稳步增长。这种持续的增长趋势可能表明某种积极的因素在推动用户数量的增加，例如市场推广活动的效果显现、产品功能的改进或用户体验的优化等。建议进一步分析具体原因，并持续监控用户数的变化，以确认这种增长趋势是否能够持续。",
//       "chartId": "1957290185513529345"
// },
//   "message": "ok"
// }
// const genResults = "{}"
// // @ts-ignore
// const test = ()=>{
//
//   const chartOptions = JSON.parse(ress.data.genChart ?? '');
//   Object.assign(option, chartOptions);
// }
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
const formItemLayout = {
  labelCol: {span: 6},
  wrapperCol: {span: 14},
};

const formState = reactive<Record<string, any>>({
  chartType:'',
  goal:'',
  name:''
});

const formFile=reactive<Record<string, any>>({
  data:File
})

// 上传前的拦截：仅存储文件，不自动上传
const beforeUpload = () => {
  formFile.data = fileList.value[0].originFileObj as File;
  return false; // 阻止默认上传
}

const submitting = ref<boolean>(false);

// 伪上传函数（实际提交在表单的 onFinish 中处理）
const dummyRequest = () => {};

const onFinish = async () => {
  // 避免重复提交
  if (submitting.value) {
    return;
  }
  submitting.value = true;

  // 对接后端，上传数据
  try {
    const res = await addChart(formState,fileList.value[0].originFileObj as File);
    if (!res?.data) {
      message.error('分析失败');
    } else {
      message.success('分析成功');
      const chartOption = JSON.parse(res.data.data.genChart ?? '');
      if (!chartOption) {
        throw new Error('图表代码解析错误')
      } else {
        genResult.value= res.data.data.genResult;
        Object.assign(option, chartOption);
      }
    }
  } catch (e: any) {
    message.error('分析失败，' + e.message);
  }
  submitting.value = false;
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>