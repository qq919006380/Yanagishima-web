import { mapState, mapGetters } from 'vuex'
import { TABS } from '@/constants'
import { Tabs, TabPane, Button, Select, Option, Checkbox } from "element-ui";
export const mixins = {
    name: 'TheHeaderLower',
    components: { Button, Select, Option, Checkbox, Tabs, TabPane },
    data() {
        return {
            tabs: TABS,
            isExpandColumns: false,
            snippetIndex: 0,
            activeName: ""
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
        tab(val) {
            this.activeName = val
        },
        inputQuery() {
            this.$store.commit('editor/resetError')
            if (this.addedBookmarkId) {
                this.$store.commit('bookmark/resetAddedBookmarkId')
            }
        }
    },
    methods: {
        handleClick(val) {
            console.log(val)
            this.setTab(this.activeName)
        },
        setSnippet() {
            let snippet = this.snippets[this.snippetIndex].sql
            this.$store.commit('editor/setInputQuery', {
                data: snippet.format({
                    catalog: this.catalog,
                    schema: this.schema,
                    table: this.table,
                    column_date: this.dateColumn,
                    columns: this.isExpandColumns ? this.otherColumns : '*',
                    yesterday: Date.create().addDays(-1).format('{yyyy}{MM}{dd}')
                })
            })
        },
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
            this.setTab('treeview')
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
};

