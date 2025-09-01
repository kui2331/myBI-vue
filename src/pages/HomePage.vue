<template>
  <div class="home-container">
    <!-- 欢迎横幅 -->
    <section class="welcome-banner fade-in">
      <div class="banner-content">
        <h1 class="banner-title">欢迎使用智能BI平台</h1>
        <p class="banner-subtitle">让数据驱动决策，洞察业务增长</p>
        <div class="banner-actions">
          <a-button 
            type="primary" 
            size="large" 
            @click="handleAddChart"
            v-if="loginUserStore.loginUser.id"
          >
            <PlusCircleOutlined />
            创建分析
          </a-button>
          <a-button 
            type="primary" 
            size="large" 
            @click="handleLogin"
            v-else
          >
            <LoginOutlined />
            立即登录
          </a-button>
        </div>
      </div>
    </section>

    <!-- 功能特性 -->
    <section class="features-section">
      <h2 class="section-title">强大功能</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">
            <PieChartOutlined />
          </div>
          <h3 class="feature-title">智能分析</h3>
          <p class="feature-description">上传数据，AI自动生成分析报告和可视化图表</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <LineChartOutlined />
          </div>
          <h3 class="feature-title">多样化图表</h3>
          <p class="feature-description">支持折线图、柱状图、饼图等多种图表类型</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <DatabaseOutlined />
          </div>
          <h3 class="feature-title">数据管理</h3>
          <p class="feature-description">统一管理您的分析数据和历史图表</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">
            <ShareAltOutlined />
          </div>
          <h3 class="feature-title">团队协作</h3>
          <p class="feature-description">轻松分享分析结果，支持团队协作</p>
        </div>
      </div>
    </section>

    <!-- 数据概览 -->
    <section class="overview-section" v-if="loginUserStore.loginUser.id">
      <h2 class="section-title">数据概览</h2>
      <div class="overview-cards">
        <div class="overview-card">
          <div class="overview-icon">📊</div>
          <div class="overview-content">
            <p class="overview-label">我的图表</p>
            <p class="overview-value">{{ chartCount }}</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">📈</div>
          <div class="overview-content">
            <p class="overview-label">本月分析</p>
            <p class="overview-value">{{ monthlyAnalysis }}</p>
          </div>
        </div>
        <div class="overview-card">
          <div class="overview-icon">💾</div>
          <div class="overview-content">
            <p class="overview-label">数据总量</p>
            <p class="overview-value">{{ dataSize }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 示例图表 -->
    <section class="charts-section">
      <h2 class="section-title">示例图表</h2>
      <div class="charts-grid">
        <div class="chart-card">
          <h3 class="chart-title">销售趋势分析</h3>
          <v-chart class="example-chart" :option="salesChartOption" />
        </div>
        <div class="chart-card">
          <h3 class="chart-title">用户分布</h3>
          <v-chart class="example-chart" :option="userDistributionOption" />
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useLoginUserStore } from '../store/useLoginUserStore';
import { 
  PieChartOutlined, 
  LineChartOutlined, 
  DatabaseOutlined, 
  ShareAltOutlined, 
  PlusCircleOutlined, 
  LoginOutlined 
} from '@ant-design/icons-vue';
import VChart from 'vue-echarts';
import { listMyChart } from '../api/chart';

// 状态管理
const router = useRouter();
const loginUserStore = useLoginUserStore();
const chartCount = ref(0);
const monthlyAnalysis = ref(0);
const dataSize = ref('0 MB');

// 销售趋势图表配置
const salesChartOption = {
  title: {
    text: '近7天销售额',
    left: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis',
    formatter: '{b}: {c}元'
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  yAxis: {
    type: 'value',
    name: '销售额(元)',
    axisLabel: {
      formatter: '{value}'
    }
  },
  series: [
    {
      data: [12580, 15340, 13250, 18920, 16540, 21360, 19840],
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: {
        color: '#1890ff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: 'rgba(24, 144, 255, 0.2)'
            },
            {
              offset: 1,
              color: 'rgba(24, 144, 255, 0.05)'
            }
          ]
        }
      },
      emphasis: {
        focus: 'series',
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.3)'
        }
      }
    }
  ]
};

// 用户分布图表配置
const userDistributionOption = {
  title: {
    text: '用户地区分布',
    left: 'center',
    textStyle: {
      fontSize: 14,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    bottom: '5%',
    left: 'center',
    orient: 'horizontal'
  },
  series: [
    {
      name: '用户分布',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2
      },
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 18,
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 35, name: '北京', itemStyle: { color: '#1890ff' } },
        { value: 25, name: '上海', itemStyle: { color: '#52c41a' } },
        { value: 20, name: '广州', itemStyle: { color: '#faad14' } },
        { value: 15, name: '深圳', itemStyle: { color: '#f5222d' } },
        { value: 5, name: '其他', itemStyle: { color: '#8c8c8c' } }
      ]
    }
  ]
};

// 处理添加图表
const handleAddChart = () => {
  router.push('/chart/add_chart');
};

// 处理登录
const handleLogin = () => {
  router.push('/user/login');
};

// 加载用户图表统计
const loadChartStats = async () => {
  if (loginUserStore.loginUser.id) {
    try {
      const res = await listMyChart({ current: 1, pageSize: 1 });
      if (res.data.code === 0) {
        // 这里假设返回的数据中有total字段表示总数量
        chartCount.value = res.data.data?.total || 0;
        // 模拟数据
        monthlyAnalysis.value = Math.floor(Math.random() * 20) + 1;
        dataSize.value = `${(Math.random() * 10).toFixed(1)} MB`;
      }
    } catch (error) {
      console.error('加载图表统计失败:', error);
    }
  }
};

// 组件挂载时加载数据
loadChartStats();
</script>

<style scoped>
/* 首页容器 */
.home-container {
  min-height: 100%;
  background-color: var(--bg-tertiary);
}

/* 欢迎横幅 */
.welcome-banner {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  color: white;
  padding: 80px 40px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.welcome-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 10% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 20%),
    radial-gradient(circle at 80% 70%, rgba(255, 255, 255, 0.1) 0%, transparent 20%);
}

.banner-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
}

.banner-title {
  font-size: 42px;
  font-weight: 600;
  margin-bottom: 16px;
  line-height: 1.2;
}

.banner-subtitle {
  font-size: 20px;
  opacity: 0.9;
  margin-bottom: 32px;
}

.banner-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.banner-actions .ant-btn {
  font-size: 16px;
  padding: 12px 24px;
  border-radius: var(--radius-md);
}

/* 功能特性 */
.features-section {
  padding: 80px 40px;
  background-color: var(--bg-primary);
}

.section-title {
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 48px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.feature-card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 32px;
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-lg);
  background-color: var(--bg-primary);
}

.feature-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--primary-color);
  opacity: 0.8;
}

.feature-title {
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
  color: var(--text-primary);
}

.feature-description {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
}

/* 数据概览 */
.overview-section {
  padding: 80px 40px;
  background-color: var(--bg-tertiary);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.overview-card {
  background-color: var(--bg-primary);
  border-radius: var(--radius-lg);
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

.overview-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.overview-icon {
  font-size: 32px;
  padding: 12px;
  background-color: var(--bg-secondary);
  border-radius: 50%;
}

.overview-content {
  flex: 1;
}

.overview-label {
  color: var(--text-tertiary);
  font-size: 14px;
  margin-bottom: 4px;
}

.overview-value {
  color: var(--text-primary);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

/* 图表展示 */
.charts-section {
  padding: 80px 40px;
  background-color: var(--bg-primary);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 32px;
  max-width: 1200px;
  margin: 0 auto;
}

.chart-card {
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: 1px solid var(--border-light);
}

.chart-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  background-color: var(--bg-primary);
}

.chart-title {
  text-align: center;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 24px;
}

.example-chart {
  height: 300px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .welcome-banner {
    padding: 60px 20px;
  }
  
  .banner-title {
    font-size: 32px;
  }
  
  .banner-subtitle {
    font-size: 16px;
  }
  
  .features-section,
  .overview-section,
  .charts-section {
    padding: 60px 20px;
  }
  
  .section-title {
    font-size: 28px;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .example-chart {
    height: 250px;
  }
}

@media (max-width: 480px) {
  .welcome-banner {
    padding: 40px 16px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .banner-actions {
    flex-direction: column;
  }
  
  .features-section,
  .overview-section,
  .charts-section {
    padding: 40px 16px;
  }
  
  .section-title {
    font-size: 24px;
    margin-bottom: 32px;
  }
  
  .features-grid,
  .overview-cards {
    gap: 16px;
  }
  
  .feature-card,
  .overview-card,
  .chart-card {
    padding: 20px;
  }
}
</style>