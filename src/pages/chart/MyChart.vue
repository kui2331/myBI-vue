<template>
  <div class="my-chart-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">我的图表</h1>
      <p class="page-subtitle">管理您创建的所有数据分析图表</p>
    </div>

    <!-- 搜索和筛选区域 -->
    <div class="search-filter-section">
      <div class="search-container">
        <a-input
          v-model:value="searchParams.name"
          placeholder="搜索图表名称"
          class="search-input"
          allowClear
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-button
          type="primary"
          @click="handleSearch"
          class="search-button"
        >
          搜索
        </a-button>
      </div>
      
      <div class="filter-container">
        <a-select
          v-model:value="chartTypeFilter"
          placeholder="按图表类型筛选"
          allowClear
          class="type-filter"
          @change="handleTypeFilter"
        >
          <a-select-option value="折线图">折线图</a-select-option>
          <a-select-option value="柱状图">柱状图</a-select-option>
          <a-select-option value="堆叠图">堆叠图</a-select-option>
          <a-select-option value="饼图">饼图</a-select-option>
          <a-select-option value="散点图">散点图</a-select-option>
        </a-select>
      </div>
    </div>

    <!-- 图表列表 -->
    <div class="chart-list-section">
      <div v-if="loading" class="loading-container">
        <Spin tip="加载中..." size="large" />
      </div>
      
      <div v-else-if="chartList.length === 0" class="empty-container">
        <div class="empty-icon">📊</div>
        <p class="empty-text">暂无图表数据</p>
        <a-button
          type="primary"
          @click="handleAddChart"
          class="empty-action"
        >
          <PlusCircleOutlined />
          创建第一个图表
        </a-button>
      </div>
      
      <div v-else class="chart-grid">
        <div 
          v-for="item in chartList" 
          :key="item.id" 
          class="chart-card"
          :class="{ 'fade-in': isFirstLoad }"
        >
          <!-- 卡片头部 -->
          <div class="card-header">
            <div class="card-title-container">
              <h3 class="card-title">{{ item.name || '未命名图表' }}</h3>
              <a-tag :color="getChartTypeColor(item.chartType)">{{ item.chartType }}</a-tag>
            </div>
            <div class="card-actions">
              <a-popconfirm
                title="确定要删除该图表吗？"
                description="删除后将无法恢复"
                ok-text="确定"
                cancel-text="取消"
                @confirm="handleDelete(item.id)"
              >
                <a-button size="small" danger>
                  <DeleteOutlined />
                </a-button>
              </a-popconfirm>
            </div>
          </div>

          <!-- 图表内容 -->
          <div class="chart-content">
            <div v-if="getChartOption(item.genChart)" class="chart-container">
              <v-chart class="chart" :option="getChartOption(item.genChart)" autoresize />
            </div>
            <div v-else class="chart-placeholder">
              <div class="placeholder-icon">📈</div>
              <p>图表数据加载失败</p>
            </div>
          </div>

          <!-- 分析结果摘要 -->
          <div class="result-summary" :title="item.genResult">
            <p class="result-text">{{ getResultSummary(item.genResult) }}</p>
          </div>

          <!-- 卡片底部 -->
          <div class="card-footer">
            <span class="create-time">创建于 {{ formatDate(item.createTime) }}</span>
            <a-button
              type="link"
              size="small"
              @click="handleViewDetail(item.id)"
              class="view-detail"
            >
              查看详情
              <RightOutlined />
            </a-button>
          </div>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="total >= 0" class="pagination-container">
        <a-pagination
          v-model:current="searchParams.current"
          :total="total"
          :page-size="searchParams.pageSize"
          show-size-changer
          :page-size-options="['4', '8', '12', '20']"
          :show-total="(total) => `共 ${total} 条数据`"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
          class="pagination"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  SearchOutlined, 
  PlusCircleOutlined, 
  DeleteOutlined, 
  RightOutlined 
} from '@ant-design/icons-vue';
import { message, Spin } from 'ant-design-vue';
import VChart from 'vue-echarts';
import {deleteChart, listMyChart} from '../../api/chart';

// 类型定义
interface Chart {
  chartData?: string;
  chartType?: string;
  createTime?: string;
  genChart?: string;
  genResult?: string;
  goal?: string;
  id: number;
  isDelete?: number;
  name?: string;
  updateTime?: string;
  userId?: number;
}

// 路由
const router = useRouter();

// 状态管理
const searchParams = reactive({
  current: 1,
  name: '',
  pageSize: 4,
  chartType: '',
});
const chartList = ref<Chart[]>([]);
const total = ref(0);
const loading = ref(false);
const chartTypeFilter = ref('');
const isFirstLoad = ref(true);

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const res = await listMyChart(searchParams);
    if (res.data?.code === 0 && res.data.data) {
      chartList.value = res.data.data.records || [];
      total.value = res.data.data.total || 0;
      // 首次加载完成后，重置动画标记
      setTimeout(() => {
        isFirstLoad.value = false;
      }, 500);
    } else {
      chartList.value = [];
      total.value = 0;
      message.error('获取图表数据失败');
    }
  } catch (e: any) {
    message.error('获取图表数据失败：' + (e.message || '网络异常'));
    console.error('加载图表数据失败:', e);
  } finally {
    loading.value = false;
  }
};

// 获取图表配置
const getChartOption = (genChart?: string) => {
  try {
    if (!genChart) return null;
    const option = JSON.parse(genChart);
    // 确保有必要的图表配置
    if (option && option.series && option.series.length > 0) {
      // 添加默认的图表主题配置
      const themedOption = {
        ...option,
        tooltip: {
          ...option.tooltip,
          trigger: option.tooltip?.trigger || 'axis',
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          textStyle: {
            color: '#fff'
          },
          borderWidth: 0,
          borderRadius: 4
        },
        legend: {
          ...option.legend,
          textStyle: {
            ...option.legend?.textStyle,
            color: '#666'
          }
        },
        grid: {
          ...option.grid,
          top: option.grid?.top || 10,
          right: option.grid?.right || 10,
          bottom: option.grid?.bottom || 30,
          left: option.grid?.left || 40
        }
      };
      return themedOption;
    }
    return null;
  } catch (error) {
    console.error('图表配置解析错误:', error);
    return null;
  }
};

// 获取图表类型对应的颜色
const getChartTypeColor = (chartType?: string) => {
  const colorMap: Record<string, string> = {
    '折线图': 'blue',
    '柱状图': 'purple',
    '堆叠图': 'cyan',
    '饼图': 'orange',
    '散点图': 'green'
  };
  return colorMap[chartType || ''] || 'default';
};

// 获取分析结果摘要
const getResultSummary = (result?: string) => {
  if (!result) return '暂无分析结果';
  // 截取前100个字符作为摘要
  return result.length > 100 ? result.substring(0, 100) + '...' : result;
};

// 格式化日期
const formatDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

// 处理搜索
const handleSearch = () => {
  // 由于a-input已经通过v-model绑定到searchParams.name，直接使用即可
  loadData();
};

// 处理类型筛选
const handleTypeFilter = (value: string) => {
  // a-select的@change事件会直接传递选中的值
  searchParams.chartType = value || '';
  loadData();
};

// 处理分页变化
const handlePageChange = (page: number) => {
  searchParams.current = page;
  loadData();
};

// 处理每页条数变化
const handleSizeChange = (_: number, pageSize: number) => {
  searchParams.pageSize = pageSize;
  searchParams.current = 1;
  loadData();
};

// 处理删除图表
const handleDelete = async (chartId: number) => {
  try {
    const res = await deleteChart(chartId);
    if (res.data?.code === 0 && res.data.data) {
      message.success('删除图表数据成功');
      loadData();
    } else {
      message.error('删除图表数据失败');
    }
  } catch (e: any) {
    message.error('删除图表数据失败：' + (e.message || '网络异常'));
  }
};

// 处理查看详情
const handleViewDetail = (chartId?: number) => {
  // 实际项目中这里需要跳转到详情页
  message.info(`查看图表ID: ${chartId} 的详情`);
};

// 处理添加图表
const handleAddChart = () => {
  router.push('/chart/add_chart');
};

// 组件挂载时加载数据
onMounted(() => {
  loadData();
});
</script>

<style scoped>
/* 页面容器 */
.my-chart-container {
  min-height: 100vh;
  background-color: var(--bg-tertiary);
  padding: 24px;
}

/* 页面标题 */
.page-header {
  text-align: center;
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.page-subtitle {
  font-size: 14px;
  color: var(--text-tertiary);
  margin: 0;
}

/* 搜索和筛选区域 */
.search-filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.search-container {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  max-width: 400px;
  border-radius: var(--radius-md);
}

.search-button {
  white-space: nowrap;
  border-radius: var(--radius-md);
}

.filter-container {
  display: flex;
  gap: 12px;
  align-items: center;
}

.type-filter {
  width: 180px;
  border-radius: var(--radius-md);
}

/* 图表列表区域 */
.chart-list-section {
  max-width: 1400px;
  margin: 0 auto;
}

/* 加载状态 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

/* 空状态 */
.empty-container {
  text-align: center;
  padding: 60px 20px;
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  margin-bottom: 24px;
}

.empty-action {
  border-radius: var(--radius-md);
}

/* 图表网格 */
.chart-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

/* 图表卡片 */
.chart-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border-light);
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

/* 动画效果 */
.chart-card.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 卡片头部 */
.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  display: flex;
  gap: 8px;
}

/* 图表内容 */
.chart-content {
  padding: 20px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.chart-container {
  width: 100%;
  height: 200px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
}

/* 分析结果摘要 */
.result-summary {
  padding: 0 20px 16px;
  max-height: 80px;
  overflow: hidden;
  position: relative;
}

.result-summary::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20px;
  right: 20px;
  height: 20px;
  background: linear-gradient(to top, var(--bg-primary), transparent);
  pointer-events: none;
}

.result-text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 卡片底部 */
.card-footer {
  padding: 16px 20px;
  border-top: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: var(--text-tertiary);
}

.create-time {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.view-detail {
  padding: 0;
  font-size: 12px;
  color: var(--primary-color);
  white-space: nowrap;
}

/* 分页 */
.pagination-container {
  margin-top: 32px;
  display: flex;
  justify-content: center;
}

.pagination {
  display: flex;
  justify-content: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .my-chart-container {
    padding: 16px;
  }
  
  .page-title {
    font-size: 24px;
  }
  
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-container {
    min-width: auto;
  }
  
  .search-input {
    max-width: none;
  }
  
  .filter-container {
    justify-content: center;
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .chart-card {
    border-radius: var(--radius-md);
  }
  
  .card-header {
    padding: 12px 16px;
  }
  
  .chart-content {
    padding: 16px;
  }
  
  .result-summary {
    padding: 0 16px 12px;
  }
  
  .card-footer {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 20px;
  }
  
  .chart-content {
    min-height: 150px;
  }
  
  .chart-container {
    height: 150px;
  }
}
</style>