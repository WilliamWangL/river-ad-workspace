<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="68px"
    >
      <el-form-item label="目标类型" prop="targetType">
        <el-select
          v-model="queryParams.targetType"
          placeholder="请选择类型"
          clearable
          class="!w-120px"
        >
          <el-option
            v-for="dict in targetTypeOptions"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="目标ID" prop="targetId">
        <el-input
          v-model.number="queryParams.targetId"
          placeholder="请输入目标ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-140px"
        />
      </el-form-item>
      <el-form-item label="商家ID" prop="merchantId">
        <el-input
          v-model.number="queryParams.merchantId"
          placeholder="请输入商家ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-120px"
        />
      </el-form-item>
      <el-form-item label="点击ID" prop="clickId">
        <el-input
          v-model="queryParams.clickId"
          placeholder="请输入点击ID"
          clearable
          @keyup.enter="handleQuery"
          class="!w-180px"
        />
      </el-form-item>
      <el-form-item label="日期" prop="clickTime">
        <el-date-picker
          v-model="queryParams.clickTime"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="YYYY-MM-DD"
          class="!w-240px"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleQuery">
          <Icon icon="ep:search" class="mr-5px" /> 搜索
        </el-button>
        <el-button @click="resetQuery">
          <Icon icon="ep:refresh" class="mr-5px" /> 重置
        </el-button>
      </el-form-item>
    </el-form>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" :stripe="true" :show-overflow-tooltip="true">
      <el-table-column label="点击ID" prop="clickId" width="260">
        <template #default="scope">
          <el-link :underline="false" type="primary" @click="handleView(scope.row)" class="font-mono">
            {{ scope.row.clickId }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column label="目标类型" prop="targetType" width="100">
        <template #default="scope">
          <el-tag :type="getTargetTypeTag(scope.row.targetType)" size="small">
            {{ getTargetTypeName(scope.row.targetType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="目标ID" prop="targetId" width="100" />
      <el-table-column label="商家ID" prop="merchantId" width="100" />
      <el-table-column label="商家名称" prop="merchantName" width="140">
        <template #default="scope">
          <span v-if="scope.row.merchantName">{{ scope.row.merchantName }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="IP地址" prop="ip" width="140" />
      <el-table-column label="国家" prop="country" width="80">
        <template #default="scope">
          <span v-if="scope.row.country">{{ scope.row.country }}</span>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="设备类型" prop="deviceType" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.deviceType" size="small">{{ scope.row.deviceType }}</el-tag>
          <span v-else class="text-gray-400">-</span>
        </template>
      </el-table-column>
      <el-table-column label="Sub1" prop="sub1" width="100" show-overflow-tooltip />
      <el-table-column label="Sub2" prop="sub2" width="100" show-overflow-tooltip />
      <el-table-column label="Sub3" prop="sub3" width="100" show-overflow-tooltip />
      <el-table-column
        label="点击时间"
        prop="clickTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column label="操作" align="center" width="100" fixed="right">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="handleView(scope.row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 详情弹窗 -->
  <el-dialog v-model="detailVisible" title="点击详情" width="800px">
    <el-descriptions :column="2" border v-if="currentDetail">
      <el-descriptions-item label="点击ID" :span="2">
        <span class="font-mono">{{ currentDetail.clickId }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="目标类型">
        <el-tag :type="getTargetTypeTag(currentDetail.targetType)" size="small">
          {{ getTargetTypeName(currentDetail.targetType) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="目标ID">
        {{ currentDetail.targetId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="商家ID">
        {{ currentDetail.merchantId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="商家名称">
        {{ currentDetail.merchantName || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Deal ID">
        {{ currentDetail.dealId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="优惠券ID">
        {{ currentDetail.couponId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="跳转 URL" :span="2">
        <span v-if="currentDetail.gotoUrl" class="break-all text-xs">
          <el-link type="primary" :href="currentDetail.gotoUrl" target="_blank">{{ currentDetail.gotoUrl }}</el-link>
        </span>
        <span v-else>-</span>
      </el-descriptions-item>
      <el-descriptions-item label="Campaign">
        {{ currentDetail.campaignId ? getCampaignName(currentDetail.campaignId) : '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Landing Page ID">
        {{ currentDetail.landingPageId || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="IP地址">{{ currentDetail.ip || '-' }}</el-descriptions-item>
      <el-descriptions-item label="国家代码">
        {{ currentDetail.country || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="设备类型">
        {{ currentDetail.deviceType || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="Sub1">{{ currentDetail.sub1 || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Sub2">{{ currentDetail.sub2 || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Sub3">{{ currentDetail.sub3 || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Sub4">{{ currentDetail.sub4 || '-' }}</el-descriptions-item>
      <el-descriptions-item label="Sub5">{{ currentDetail.sub5 || '-' }}</el-descriptions-item>
      <el-descriptions-item label="点击时间" :span="2">
        {{ formatDate(currentDetail.clickTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="User Agent" :span="2">
        <span class="break-all">{{ currentDetail.userAgent || '-' }}</span>
      </el-descriptions-item>
      <el-descriptions-item label="Referer" :span="2">
        <span class="break-all">{{ currentDetail.referer || '-' }}</span>
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button @click="detailVisible = false">关 闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { ClickApi } from '@/api/river/tracking'
import { CampaignApi } from '@/api/river/campaign'

defineOptions({ name: 'TrackingClick' })

const message = useMessage()

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const campaignList = ref([]) // Campaign列表
const detailVisible = ref(false) // 详情弹窗
const currentDetail = ref<any>(null) // 当前详情数据

// 目标类型选项
const targetTypeOptions = [
  { value: 1, label: '商家' },
  { value: 2, label: 'Offer' },
  { value: 3, label: 'Deal' },
  { value: 4, label: '优惠券' }
]

const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  targetType: undefined as number | undefined,
  targetId: undefined as number | undefined,
  merchantId: undefined as number | undefined,
  couponId: undefined as number | undefined,
  dealId: undefined as number | undefined,
  clickId: undefined,
  clickTime: undefined
})
const queryFormRef = ref() // 搜索的表单

/** 获取目标类型名称 */
const getTargetTypeName = (type: number) => {
  const item = targetTypeOptions.find(o => o.value === type)
  return item?.label || `类型${type}`
}

/** 获取目标类型标签样式 */
const getTargetTypeTag = (type: number) => {
  const map: Record<number, string> = {
    1: 'warning',  // 商家 - 橙色
    2: 'success',  // Offer - 绿色
    3: 'primary',  // Deal - 蓝色
    4: 'info'      // 优惠券 - 灰色
  }
  return map[type] || 'info'
}

/** 获取Campaign名称 */
const getCampaignName = (id: number) => {
  const campaign = campaignList.value.find((c) => c.id === id)
  return campaign?.name || `ID: ${id}`
}

/** 格式化日期 */
const formatDate = (date: string) => {
  if (!date) return '-'
  return new Date(date).toLocaleString('zh-CN')
}

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const params = { ...queryParams }
    // 处理日期范围
    if (params.clickTime && Array.isArray(params.clickTime)) {
      params.createTime = params.clickTime
      delete params.clickTime
    }
    const data = await ClickApi.getClickPage(params)
    list.value = data.list || []
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

/** 获取Campaign列表 */
const getCampaignList = async () => {
  const data = await CampaignApi.getCampaignPage({ pageNo: 1, pageSize: 200 })
  campaignList.value = data.list || []
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 查看详情 */
const handleView = (row: any) => {
  currentDetail.value = row
  detailVisible.value = true
}

/** 初始化 **/
onMounted(() => {
  getList()
  getCampaignList()
})
</script>

<style scoped>
.break-all {
  word-break: break-all;
}
</style>
