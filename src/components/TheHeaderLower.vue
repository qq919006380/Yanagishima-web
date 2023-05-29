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
                <div class="btn-group ml-3">
                    <Button type="primary">sd</Button>
                    <button type="button" class="btn btn-primary px-4"
                        :disabled="!inputQuery.length || loading || !datasourceIndex" @click="runQuery()"><i
                            class="fa fa-fw fa-play mr-1"></i><strong>Run</strong>
                    </button>
                    <template v-if="isPresto">
                        <button type="button" class="btn btn-primary"
                            :disabled="!inputQuery.length || loading || !datasourceIndex" @click="explainQuery">Explain(T)
                        </button>
                        <button type="button" class="btn btn-primary"
                            :disabled="!inputQuery.length || loading || !datasourceIndex"
                            @click="explainGraphvizQuery">Explain(G)
                        </button>
                    </template>
                    <template v-else-if="isHive || isSpark">
                        <button type="button" class="btn btn-primary"
                            :disabled="!inputQuery.length || loading || !datasourceIndex" @click="explainQuery">Explain
                        </button>
                    </template>
                    <template v-else-if="isElasticsearch">
                        <button type="button" class="btn btn-primary"
                            :disabled="!inputQuery.length || loading || !datasourceIndex" @click="translateQuery">Translate
                        </button>
                        <button type="button" class="btn btn-primary"
                            :disabled="!inputQuery.length || loading || !datasourceIndex" @click="explainQuery">Explain
                        </button>
                    </template>
                </div>

            </div>
            <div class="col text-right">
                <!-- Set/Run snippet buttons -->
                <div v-if="table" class="py-3 text-right">
                    <label class="form-check-label mr-2">
                        <input class="form-check-input mr-1" type="checkbox" v-model="isExpandColumns">Expand Columns
                    </label>
                    <select id="snippet" class="custom-select ace-font" style="width:60%;" v-model="snippetIndex">
                        <template v-for="(item, i) in snippets" v-if="item.enable.includes(tableType)">
                            <option :value="i" :key="i">{{ item.label }}</option>
                        </template>
                    </select>
                    <div class="btn-group">
                        <button class="btn btn-primary" data-dismiss="modal" @click="setSnippet">
                            <i class="far fa-fw fa-keyboard mr-1"></i>Set
                        </button>
                        <button class="btn btn-primary" data-dismiss="modal" @click="runSnippet">
                            <i class="fa fa-fw fa-play mr-1"></i><strong>Run</strong>
                        </button>
                    </div>
                </div>

            </div>
        </div>
        <div class="row align-items-end">
            <div class="col">
                <ul class="nav nav-tabs">
                    <li class="nav-item" v-for="t in tabs" :key="t.id">
                        <a class="nav-link" href="#" @click.prevent="setTab(t.id)" :class="{ active: t.id === tab }">
                            <i class="fa-fw mr-1" :class="`${t.iconStyle || 'fas'} fa-${t.icon}`"></i><span
                                class="hidden-lg-down">{{ t.name }}</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div class="col text-right pb-2">
                <div id="control" class="d-inline-block">
                    <div class="btn-group ml-3">
                        <button type="button" class="btn btn-secondary px-2" @click.prevent="convertQuery"
                            data-toggle="tooltip" data-animation="false" title="Convert Query"
                            :disabled="!inputQuery.length || loading"><i class="fa fa-fw fa-exchange"></i>
                        </button>
                        <button v-if="isPresto" type="button" class="btn btn-secondary px-2" @click.prevent="formatQuery"
                            data-toggle="tooltip" data-animation="false" title="Format Query"
                            :disabled="!inputQuery.length || loading"><i class="fa fa-fw fa-indent"></i>
                        </button>
                        <button type="button" class="btn btn-secondary px-2" v-clipboard="inputQuery" data-toggle="tooltip"
                            data-animation="false" title="Copy to Clipboard" :disabled="!inputQuery.length || loading"><i
                                class="fa fa-fw fa-clipboard"></i>
                        </button>
                        <button type="button" class="btn btn-secondary px-2" @click.prevent="addBookmarkItem"
                            data-toggle="tooltip" data-animation="false" title="Add to Bookmarks"
                            :disabled="!inputQuery.length || existBookmark"><i class="far fa-fw fa-star"></i></button>
                    </div>

                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { TABS } from '@/constants'
import { Button} from "ant-design-vue";

export default {
    name: 'TheHeaderLower',
    components:{Button},
    data() {
        return {
            tabs: TABS
        }
    },
    computed: {
        ...mapState([
            'settings'
        ]),
        ...mapState({
            tab: state => state.hash.tab,
            engine: state => state.hash.engine
        }),
        ...mapState('treeview', [
            'catalogs',
            'schemata',
            'tables',
            'catalog',
            'schema',
            'table',
            'note',
            'meta',
            'tableType',
            'columns',
            'tableQuery',
            'filterSchema',
            'filterTable',
            'loadingTableSearch',
            'tableSearchResponse'
        ]),
        ...mapState('editor', [
            'inputQuery',
            'gotoLine',
            'focus',
            'errorLine',
            'errorText',
            'completeWords'
        ]),
        ...mapState('bookmark', {
            bookmarks: state => state.response,
            addedBookmarkId: state => state.addedBookmarkId
        }),
        ...mapGetters([
            'isPresto',
            'isHive',
            'isSpark',
            'isElasticsearch',
            'datasourceIndex',
            'datasourceEngine'
        ]),
        ...mapState('result', [
            'loading'
        ]),
        variables() {
            const detectedVariables = this.inputQuery.match(/\${[a-zA-Z]([a-zA-Z0-9_]+)?}/g)
            if (detectedVariables === null) {
                return []
            }
            return detectedVariables.unique().map(v => ({ str: v, key: v.remove(/[${}]/g), value: '' }))
        },
        existBookmark() {
            return this.bookmarks.some(b => b.query === this.inputQuery)
        },
        tinyErrorText() {
            const text = this.errorText
            if (text) {
                return text.remove(/^Query failed \(#[0-9a-z_]+\): /).remove(/^line [0-9]+:[0-9]+: /).truncate(192)
            } else {
                return text
            }
        },
        snippets() {
            if (this.isPresto) {
                const snippets = [
                    {
                        label: 'SHOW PRESTO VIEW DDL',
                        sql: "SELECT VIEW_DEFINITION FROM {catalog}.INFORMATION_SCHEMA.VIEWS WHERE table_catalog='{catalog}' AND table_schema='{schema}' AND table_name='{table}'",
                        enable: ['VIEW']
                    },
                    {
                        label: 'SHOW CREATE TABLE ...',
                        sql: 'SHOW CREATE TABLE {catalog}.{schema}."{table}"',
                        enable: ['BASE TABLE']
                    },
                    {
                        label: 'DESCRIBE ...',
                        sql: 'DESCRIBE {catalog}.{schema}."{table}"',
                        enable: ['BASE TABLE', 'VIEW']
                    },
                    {
                        label: 'SHOW STATS ...',
                        sql: 'SHOW STATS FOR {catalog}.{schema}."{table}"',
                        enable: ['BASE TABLE']
                    }
                ]

                let defaultSnippet = {
                    label: 'SELECT * FROM ... LIMIT 100',
                    sql: 'SELECT {columns} FROM {catalog}.{schema}."{table}" LIMIT 100',
                    enable: ['BASE TABLE', 'VIEW']
                }

                if (this.dateColumn) {
                    const yesterday = Date.create().addDays(-1).format('{yyyy}{MM}{dd}')
                    defaultSnippet = {
                        label: `SELECT * FROM ... WHERE ${this.dateColumn}='${yesterday}' LIMIT 100`,
                        sql: `SELECT {columns} FROM {catalog}.{schema}."{table}" WHERE {column_date}='{yesterday}' LIMIT 100`,
                        enable: ['BASE TABLE', 'VIEW']
                    }
                }
                snippets.unshift(defaultSnippet)
                return snippets
            }

            if (this.isHive) {
                const snippets = [
                    {
                        label: 'SHOW CREATE TABLE ...',
                        sql: 'SHOW CREATE TABLE {schema}.`{table}`',
                        enable: ['BASE TABLE']
                    },
                    {
                        label: 'DESCRIBE ...',
                        sql: 'DESCRIBE {schema}.`{table}`',
                        enable: ['BASE TABLE', 'VIEW']
                    }
                ]

                let defaultSnippet = {
                    label: 'SELECT * FROM ... LIMIT 100',
                    sql: 'SELECT {columns} FROM {schema}.`{table}` LIMIT 100',
                    enable: ['BASE TABLE', 'VIEW']
                }

                if (this.dateColumn) {
                    const yesterday = Date.create().addDays(-1).format('{yyyy}{MM}{dd}')
                    defaultSnippet = {
                        label: `SELECT * FROM ... WHERE ${this.dateColumn}='${yesterday}' LIMIT 100`,
                        sql: 'SELECT {columns} FROM {schema}.`{table}` WHERE {column_date}=\'{yesterday}\' LIMIT 100',
                        enable: ['BASE TABLE', 'VIEW']
                    }
                }
                snippets.unshift(defaultSnippet)
                return snippets
            }

            if (this.isSpark) {
                const snippets = [
                    {
                        label: 'SHOW CREATE TABLE ...',
                        sql: 'SHOW CREATE TABLE {schema}.{table}',
                        enable: ['BASE TABLE']
                    },
                    {
                        label: 'DESCRIBE ...',
                        sql: 'DESCRIBE {schema}.{table}',
                        enable: ['BASE TABLE', 'VIEW']
                    }
                ]

                let defaultSnippet = {
                    label: 'SELECT * FROM ... LIMIT 100',
                    sql: 'SELECT {columns} FROM {schema}.{table} LIMIT 100',
                    enable: ['BASE TABLE', 'VIEW']
                }

                if (this.dateColumn) {
                    const yesterday = Date.create().addDays(-1).format('{yyyy}{MM}{dd}')
                    defaultSnippet = {
                        label: `SELECT * FROM ... WHERE ${this.dateColumn}='${yesterday}' LIMIT 100`,
                        sql: 'SELECT {columns} FROM {schema}.{table} WHERE {column_date}=\'{yesterday}\' LIMIT 100',
                        enable: ['BASE TABLE', 'VIEW']
                    }
                }
                snippets.unshift(defaultSnippet)
                return snippets
            }

            if (this.isElasticsearch) {
                const snippets = [
                    {
                        label: 'SHOW CREATE TABLE ...',
                        sql: 'SHOW CREATE TABLE "{table}"',
                        enable: ['BASE TABLE']
                    },
                    {
                        label: 'DESCRIBE ...',
                        sql: 'DESCRIBE "{table}"',
                        enable: ['BASE TABLE', 'VIEW']
                    }
                ]
                const defaultSnippet = {
                    label: 'SELECT * FROM ... LIMIT 100',
                    sql: 'SELECT {columns} FROM "{table}" LIMIT 100',
                    enable: ['BASE TABLE', 'VIEW']
                }
                snippets.unshift(defaultSnippet)
                return snippets
            }
        }

    },
    watch: {
        inputQuery() {
            this.$store.commit('editor/resetError')
            if (this.addedBookmarkId) {
                this.$store.commit('bookmark/resetAddedBookmarkId')
            }
        }
    },
    methods: {
        setInputQuery(query) {
            this.$store.commit('editor/setInputQuery', { data: query })
        },
        formatQuery() {
            this.$store.dispatch('editor/formatQuery')
            this.$store.commit('editor/focusOnEditor')
        },
        validateQuery() {
            this.$store.dispatch('editor/validateQuery')
        },
        convertQuery() {
            this.$store.dispatch('editor/convertQuery')
        },
        runQuery(query, translateFlag) {
            if (this.loading || !this.datasourceIndex) {
                return false
            }

            query = query || this.inputQuery

            // variables expansion
            if (this.variables.length) {
                const errorVariables = []
                for (const v of this.variables) {
                    const pattern = new RegExp(RegExp.escape(v.str), 'g')
                    if (v.value.length) {
                        query = query.replace(pattern, v.value)
                    } else {
                        errorVariables.push(v.key)
                    }
                }
                if (errorVariables.length) {
                    alert('Input to variables ' + errorVariables.join(', '))
                    return false
                }
                this.setInputQuery(query)
            }

            this.$store.dispatch('result/runQuery', { query, translateFlag })

            this.setTab('result')
        },
        explainQuery() {
            this.runQuery(`EXPLAIN ${this.inputQuery}`)
        },
        explainGraphvizQuery() {
            const engine = this.engine
            if (engine === 'presto') {
                this.runQuery(`EXPLAIN (FORMAT GRAPHVIZ) ${this.inputQuery}`)
            } else {
                throw new Error('not supported')
            }
        },
        translateQuery() {
            this.runQuery(this.inputQuery, true)
        },
        addBookmarkItem() {
            this.$store.dispatch('bookmark/addBookmarkItem')
        },
        setTab(tab) {
            this.$store.commit('setHashItem', { tab })
        }
    }
}
</script>

<style scoped></style>
