  <!-- 执行计划 -->
<template>
    <span>
        <template v-if="isPresto">
            <span>
                <Button type="primary" size="small" :disabled="!inputQuery.length || loading || !datasourceIndex"
                    @click="explainQuery">
                    执行计划(T)
                </Button>
            </span>
            <span>
                <Button type="primary" size="small" :disabled="!inputQuery.length || loading || !datasourceIndex"
                    @click="explainGraphvizQuery">
                    执行计划(G)
                </Button>
            </span>
        </template>
        <template v-else-if="isHive || isSpark">
            <Button type="primary" size="small" :disabled="!inputQuery.length || loading || !datasourceIndex"
                @click="explainQuery">执行计划
            </Button>
        </template>
        <template v-else-if="isElasticsearch">
            <span>
                <Button type="primary" size="small" :disabled="!inputQuery.length || loading || !datasourceIndex"
                    @click="translateQuery">翻译
                </Button>
            </span>
            <span>
                <Button type="primary" size="small" :disabled="!inputQuery.length || loading || !datasourceIndex"
                    @click="explainQuery">执行计划
                </Button>
            </span>
        </template>
    </span>
</template>
  


<script>

import { mixins } from "../TheHeaderLower-mixin";

export default {
    mixins: [mixins],
}
</script>

<style scoped>
/* .btnList {
    display: inline-block;
} */
</style>