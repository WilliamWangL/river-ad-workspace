<template>
  <Dialog :title="dialogTitle" v-model="dialogVisible" width="600px">
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-form-item label="上级分类" prop="parentId">
        <el-tree-select
          v-model="formData.parentId"
          :data="categoryTree"
          :props="{ label: 'name', children: 'children' }"
          check-strictly
          placeholder="请选择上级分类"
          class="!w-full"
        />
      </el-form-item>
      <el-form-item label="分类名称" prop="name">
        <el-input v-model="formData.name" placeholder="请输入分类名称" />
      </el-form-item>
      <el-form-item label="Slug" prop="slug">
        <el-input v-model="formData.slug" placeholder="请输入 URL 友好标识" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="级别" prop="level">
            <el-input-number v-model="formData.level" :min="1" :max="3" class="!w-full" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="排序" prop="sort">
            <el-input-number v-model="formData.sort" :min="0" class="!w-full" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="图标" prop="icon">
        <el-input v-model="formData.icon" placeholder="请输入图标类名或 URL" />
      </el-form-item>
      <el-form-item label="地区" prop="region">
        <el-input v-model="formData.region" placeholder="如 US、RU、00（默认）" />
      </el-form-item>
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
    </el-form>
    <template #footer>
      <el-button @click="submitForm" type="primary" :disabled="formLoading">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { CategoryApi, CategoryVO } from '@/api/river/affiliate'
import { handleTree } from '@/utils/tree'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 分类 表单 */
defineOptions({ name: 'CategoryForm' })

const { t } = useI18n() // 国际化
const message = useMessage() // 消息弹窗

const dialogVisible = ref(false) // 弹窗的是否展示
const dialogTitle = ref('') // 弹窗的标题
const formLoading = ref(false) // 表单的加载中
const formType = ref('') // 表单的类型：create - 新增；update - 修改
const categoryTree = ref<any[]>([]) // 分类树
const formData = ref({
  id: undefined,
  parentId: 0,
  name: '',
  slug: '',
  level: 1,
  sort: 0,
  icon: '',
  region: '00',
  status: 0
})
const formRules = reactive({
  name: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }],
  slug: [{ required: true, message: 'Slug不能为空', trigger: 'blur' }],
  level: [{ required: true, message: '级别不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
})
const formRef = ref() // 表单 Ref

/** 获取分类树 */
const getCategoryTree = async () => {
  const data = await CategoryApi.getCategoryList()
  const root: any = { id: 0, name: '顶级分类', children: [] }
  root.children = handleTree(data, 'id', 'parentId')
  categoryTree.value = [root]
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()
  await getCategoryTree()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      formData.value = await CategoryApi.getCategory(id)
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
    const data = formData.value as unknown as CategoryVO
    if (formType.value === 'create') {
      await CategoryApi.createCategory(data)
      message.success(t('common.createSuccess'))
    } else {
      await CategoryApi.updateCategory(data)
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
    parentId: 0,
    name: '',
    slug: '',
    level: 1,
    sort: 0,
    icon: '',
    region: '00',
    status: 0
  }
  formRef.value?.resetFields()
}
</script>
