<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="800px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
      v-loading="formLoading"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="商家名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入商家名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="联盟网络" prop="networkId">
            <el-select v-model="formData.networkId" placeholder="请选择联盟网络" class="!w-full" @change="handleNetworkChange">
              <el-option
                v-for="network in networkList"
                :key="network.id"
                :label="network.name"
                :value="network.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="联盟侧 ID" prop="externalId">
            <el-input v-model="formData.externalId" placeholder="请输入联盟侧商家 ID" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="Slug" prop="slug">
            <el-input v-model="formData.slug" placeholder="请输入 URL 友好标识" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="域名" prop="domain">
            <el-input v-model="formData.domain" placeholder="请输入商家域名，如: amazon.com" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="评级" prop="rating">
            <el-rate v-model="formData.rating" allow-half />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-select v-model="formData.status" placeholder="请选择状态" class="!w-full">
              <el-option
                v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="默认 Offer" prop="defaultOfferId">
            <el-select v-model="formData.defaultOfferId" placeholder="请选择默认 Offer（用于 Visit Store 追踪）" class="!w-full" clearable>
              <el-option
                v-for="offer in offerList"
                :key="offer.id"
                :label="offer.name"
                :value="offer.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="Logo URL" prop="logoUrl">
        <el-input v-model="formData.logoUrl" placeholder="请输入 Logo URL" />
      </el-form-item>
      <el-form-item label="描述" prop="description">
        <el-input
          v-model="formData.description"
          type="textarea"
          :rows="3"
          placeholder="联盟同步的原始描述，作为简介/描述的回退值"
        />
      </el-form-item>
      <el-form-item label="商家简介" prop="intro">
        <el-input
          v-model="formData.intro"
          type="textarea"
          :rows="2"
          placeholder="短文本，用于详情页头部摘要，为空时回退到描述"
        />
      </el-form-item>
      <el-form-item label="商家描述" prop="about">
        <el-input
          v-model="formData.about"
          type="textarea"
          :rows="6"
          placeholder="支持 Markdown/HTML 富文本，用于详情页底部，为空时回退到描述"
        />
      </el-form-item>
      <el-form-item label="支持地区" prop="regions">
        <el-input
          v-model="formData.regions"
          type="textarea"
          :rows="2"
          placeholder='JSON 数组格式，如: ["US", "UK", "CA"]'
        />
      </el-form-item>
      <el-form-item label="分类 ID" prop="categoryIds">
        <el-input
          v-model="formData.categoryIds"
          type="textarea"
          :rows="2"
          placeholder='JSON 数组格式，如: [1, 2, 3]'
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { MerchantApi, MerchantVO, AffiliateNetworkApi, OfferApi, OfferVO } from '@/api/river/affiliate'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 商家 表单 */
defineOptions({ name: 'MerchantForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const props = defineProps({
  networkList: {
    type: Array as PropType<any[]>,
    default: () => []
  }
})

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const offerList = ref<OfferVO[]>([]) // Offer 列表
const formData = ref({
  id: undefined,
  networkId: undefined,
  externalId: '',
  name: '',
  slug: '',
  domain: '',
  logoUrl: '',
  description: '',
  intro: '',
  about: '',
  rating: 0,
  status: 0,
  regions: '',
  categoryIds: '',
  defaultOfferId: undefined as number | undefined
})
const formRules = reactive({
  name: [{ required: true, message: '商家名称不能为空', trigger: 'blur' }],
  networkId: [{ required: true, message: '联盟网络不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

/** 获取商家的 Offer 列表 */
const getOfferList = async (merchantId: number, networkId: number) => {
  offerList.value = await OfferApi.getOfferList({ merchantId, networkId } as any)
}

/** 联盟网络变化时清空默认 Offer */
const handleNetworkChange = () => {
  formData.value.defaultOfferId = undefined
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await MerchantApi.getMerchant(id)
      // 获取该商家的 Offer 列表
      await getOfferList(id, formData.value.networkId)
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  // 校验表单
  await formRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as MerchantVO
    if (formType.value === 'create') {
      await MerchantApi.createMerchant(data)
      message.success(t('common.createSuccess'))
    } else {
      await MerchantApi.updateMerchant(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    networkId: undefined,
    externalId: '',
    name: '',
    slug: '',
    domain: '',
    logoUrl: '',
    description: '',
    intro: '',
    about: '',
    rating: 0,
    status: 0,
    regions: '',
    categoryIds: '',
    defaultOfferId: undefined
  }
  offerList.value = []
  formRef.value?.resetFields()
}
</script>
