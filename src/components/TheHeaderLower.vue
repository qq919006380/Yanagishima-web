<template>
    <div id="header-loower">
        <div class="editor mb-2">
            <BaseAce :code="inputQuery" :goto-line="gotoLine" :focus="focus" :min-lines="settings.minline"
                :max-lines="Infinity" :theme="settings.theme" @change-code="setInputQuery" @run-code="runQuery"
                :error-line="errorLine" :error-text="tinyErrorText" :readonly="loading"
                :complete-words="isPresto ? completeWords : []" @format-code="isPresto ? formatQuery() : () => { }"
                @validate-code="isPresto ? validateQuery() : () => { }"></BaseAce>
        </div>
        <fieldset v-if="variables.length" id="variables" class="mb-3">
            <legend>{{ variables.length }} variables</legend>
            <div class="form-inline">
                <template v-for="v in variables">
                    <label class="mr-2" :key="`label_${v.key}`">{{ v.key }}</label>
                    <input type="text" :id="`variable_${v.key}`" v-model="v.value" :key="`input_${v.key}`"
                        class="form-control form-control-sm mr-3" size="10" autocomplete="off">
                </template>
            </div>
        </fieldset>

        <div class="row align-items-end">
            <div class="col pb-2">
                <Button type="primary" class="mr-2" :disabled="!inputQuery.length || loading || !datasourceIndex"
                    @click="runQuery()">
                    <i class="fa fa-fw fa-play mr-1"></i>
                    <strong>运行</strong>
                </Button>
                <Button v-if="isPresto" type="primary" class="mr-2" @click.prevent="formatQuery"
                    :disabled="!inputQuery.length || loading">
                    <i class="fa fa-fw fa-indent"></i>
                    <strong>SQL格式化</strong>
                </Button>
                <Button type="primary" class="mr-2" @click.prevent="addBookmarkItem"
                    :disabled="!inputQuery.length || existBookmark">
                    <i class="far fa-fw fa-star"></i>
                    <strong>收藏夹</strong>
                </Button>
            </div>
            <div class="col text-right">
                <!-- Set/Run snippet buttons -->
                <div v-if="table">
                    <Checkbox v-model="isExpandColumns">展开列</Checkbox>
                    <Select size="small" id="snippet" style="width:60%;" v-model="snippetIndex">
                        <Option v-for="(item, i) in snippets" v-if="item.enable.includes(tableType)" :label="item.label"
                            :value="i" :key="i">
                            {{ item.label }}
                        </Option>
                    </Select>
                    <Button @click="setSnippet">
                        <i class="far fa-fw fa-keyboard mr-1"></i>替换SQL
                    </Button>
                </div>

            </div>
        </div>
        <Tabs v-model="activeName" @tab-click="handleClick">
            <Tab-pane v-for="t in tabs" :key="t.id" :name="t.id">
                <span slot="label"><i class="fa-fw mr-1" :class="`${t.iconStyle || 'fas'} fa-${t.icon}`"></i>{{ t.name
                }} </span>
            </Tab-pane>
        </Tabs>


        <!-- <div class="col text-right pb-2">
                <div id="control" class="d-inline-block">
                    <div class="btn-group ml-3">
                        <button type="button" class="btn btn-secondary px-2" @click.prevent="convertQuery"
                            data-toggle="tooltip" data-animation="false" title="转换查询"
                            :disabled="!inputQuery.length || loading"><i class="fa fa-fw fa-exchange"></i>
                        </button>

                        <button type="button" class="btn btn-secondary px-2" v-clipboard="inputQuery" data-toggle="tooltip"
                            data-animation="false" title="复制到剪贴板" :disabled="!inputQuery.length || loading"><i
                                class="fa fa-fw fa-clipboard"></i>
                        </button>
                    </div>

                </div>
            </div> -->
    </div>
</template>

<script>

import { mixins } from "./TheHeaderLower-mixin";

export default {
    mixins: [mixins],
}
</script>

<style scoped>

</style>
